-- Uzhu database schema (matches the live project). Run once in a fresh Supabase project's SQL editor.
-- Then: deploy supabase/functions/uzhu-send, put vapid_public, vapid_private and cron_secret into uzhu_private,
-- add admin emails to uzhu_admins (lower case), and enable the cron job at the bottom.

-- Each user's saved progress (one JSON document per account)
create table public.uzhu_profiles (user_id uuid primary key references auth.users(id) on delete cascade, email text, name text, data jsonb, updated_at timestamptz default now());
alter table public.uzhu_profiles enable row level security;
create policy "own profile select" on public.uzhu_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "own profile insert" on public.uzhu_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own profile update" on public.uzhu_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Web Push subscriptions and their upcoming reminders
create table public.uzhu_push (endpoint text primary key, user_id uuid not null references auth.users(id) on delete cascade, keys jsonb not null, schedule jsonb not null default '[]', last_sent_at timestamptz, updated_at timestamptz default now());
alter table public.uzhu_push enable row level security;
create policy "own push select" on public.uzhu_push for select to authenticated using ((select auth.uid()) = user_id);
create policy "own push insert" on public.uzhu_push for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own push update" on public.uzhu_push for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own push delete" on public.uzhu_push for delete to authenticated using ((select auth.uid()) = user_id);

-- Server-only secrets (VAPID keys, cron secret) and admin emails: RLS on, no policies
create table public.uzhu_private (key text primary key, value text not null);
alter table public.uzhu_private enable row level security;
create table public.uzhu_admins (email text primary key);
alter table public.uzhu_admins enable row level security;

-- Admin = listed email AND confirmed email address
create function public.uzhu_is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.uzhu_admins a join auth.users u on lower(u.email) = a.email where u.id = auth.uid() and u.email_confirmed_at is not null);
$$;
revoke execute on function public.uzhu_is_admin() from public, anon;
grant execute on function public.uzhu_is_admin() to authenticated;

-- Site settings and admin-edited content (readable by everyone, writable by admins)
create table public.uzhu_settings (key text primary key, value jsonb not null, updated_at timestamptz default now());
create table public.uzhu_content (kind text not null, id text not null, data jsonb not null, hidden boolean default false, updated_at timestamptz default now(), primary key (kind, id));
alter table public.uzhu_settings enable row level security;
alter table public.uzhu_content enable row level security;
create policy "settings readable" on public.uzhu_settings for select to anon, authenticated using (true);
create policy "settings admin insert" on public.uzhu_settings for insert to authenticated with check ((select public.uzhu_is_admin()));
create policy "settings admin update" on public.uzhu_settings for update to authenticated using ((select public.uzhu_is_admin())) with check ((select public.uzhu_is_admin()));
create policy "settings admin delete" on public.uzhu_settings for delete to authenticated using ((select public.uzhu_is_admin()));
create policy "content readable" on public.uzhu_content for select to anon, authenticated using (true);
create policy "content admin insert" on public.uzhu_content for insert to authenticated with check ((select public.uzhu_is_admin()));
create policy "content admin update" on public.uzhu_content for update to authenticated using ((select public.uzhu_is_admin())) with check ((select public.uzhu_is_admin()));
create policy "content admin delete" on public.uzhu_content for delete to authenticated using ((select public.uzhu_is_admin()));

-- Admin report and broadcast (each checks uzhu_is_admin inside)
create function public.uzhu_admin_report() returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.uzhu_is_admin() then jsonb_build_object(
    'push', (select count(*) from public.uzhu_push),
    'profiles', coalesce((select jsonb_agg(jsonb_build_object('name', p.name, 'email', p.email, 'created', u.created_at, 'updated', p.updated_at, 'data', p.data - 'fired')) from public.uzhu_profiles p join auth.users u on u.id = p.user_id), '[]'::jsonb)
  ) else null end;
$$;
create function public.uzhu_admin_broadcast(msg text, link text) returns bigint language sql security definer set search_path = public as $$
  with u as (update public.uzhu_push set schedule = schedule || jsonb_build_array(jsonb_build_object('at', now(), 'text', msg, 'url', link)) where public.uzhu_is_admin() returning 1)
  select count(*) from u;
$$;
revoke execute on function public.uzhu_admin_report() from public, anon;
revoke execute on function public.uzhu_admin_broadcast(text, text) from public, anon;
grant execute on function public.uzhu_admin_report() to authenticated;
grant execute on function public.uzhu_admin_broadcast(text, text) to authenticated;

-- A browser's push endpoint moves to whoever is signed in on it now
create function public.uzhu_claim_push(ep text) returns void language sql security definer set search_path = public as $$
  update public.uzhu_push set user_id = auth.uid(), updated_at = now() where endpoint = ep and auth.uid() is not null;
$$;
revoke all on function public.uzhu_claim_push(text) from public, anon;
grant execute on function public.uzhu_claim_push(text) to authenticated;

-- Atomically removes due reminders from every schedule and returns them (used by the uzhu-send function only)
create function public.uzhu_take_due(cutoff timestamptz default now()) returns table(endpoint text, keys jsonb, due jsonb)
language sql security definer set search_path = public as $$
  with d as (
    select p.endpoint, coalesce(jsonb_agg(i) filter (where (i->>'at')::timestamptz <= cutoff), '[]'::jsonb) as due
    from public.uzhu_push p
    cross join lateral jsonb_array_elements(case when jsonb_typeof(p.schedule) = 'array' then p.schedule else '[]'::jsonb end) i
    group by p.endpoint having bool_or((i->>'at')::timestamptz <= cutoff)
  ), u as (
    update public.uzhu_push p set schedule = (
      select coalesce(jsonb_agg(i), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(p.schedule) = 'array' then p.schedule else '[]'::jsonb end) i
      where (i->>'at')::timestamptz > cutoff)
    from d where p.endpoint = d.endpoint
    returning p.endpoint, p.keys, d.due
  ) select u.endpoint, u.keys, u.due from u;
$$;
revoke all on function public.uzhu_take_due(timestamptz) from public, anon, authenticated;
grant execute on function public.uzhu_take_due(timestamptz) to service_role;

-- Social: public nickname/streak per user (buddy, team, league) and cheers between friends
create table public.uzhu_public (user_id uuid primary key references auth.users(id) on delete cascade, code text unique not null, nick text not null,
  streak int default 0, done_today boolean default false, week_points int default 0, week text, team text, league boolean default false,
  cheers jsonb default '[]', updated_at timestamptz default now(), team_dmg int default 0);
alter table public.uzhu_public enable row level security;
create policy "public stats readable" on public.uzhu_public for select to authenticated using (true);
create policy "own public insert" on public.uzhu_public for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own public update" on public.uzhu_public for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own public delete" on public.uzhu_public for delete to authenticated using ((select auth.uid()) = user_id);

create table public.uzhu_cheers (id bigserial primary key, to_code text not null, from_nick text not null, text text not null, created_at timestamptz default now());
alter table public.uzhu_cheers enable row level security;
create policy "cheers insert" on public.uzhu_cheers for insert to authenticated with check (char_length(text) <= 120);
create policy "cheers read own" on public.uzhu_cheers for select to authenticated using (to_code = (select code from public.uzhu_public where user_id = (select auth.uid())));
-- The sender's nickname comes from the server, never from the browser
create function public.uzhu_cheer_nick() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.from_nick := coalesce((select nick from public.uzhu_public where user_id = auth.uid()), 'یک دوست');
  new.created_at := now();
  return new;
end $$;
revoke all on function public.uzhu_cheer_nick() from public, anon, authenticated;
create trigger uzhu_cheer_nick before insert on public.uzhu_cheers for each row execute function public.uzhu_cheer_nick();

-- Every 5 minutes: pg_cron calls the edge function `uzhu-send` (supabase/functions/uzhu-send), which sends due reminders.
-- create extension if not exists pg_cron; create extension if not exists pg_net;
-- select cron.schedule('uzhu-send-reminders', '*/5 * * * *', $$ select net.http_post(url := 'https://<project>.supabase.co/functions/v1/uzhu-send', headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(select value from public.uzhu_private where key='cron_secret')), body := '{}'::jsonb); $$);

-- Admin list management from the admin panel (each checks uzhu_is_admin inside; nobody can remove themselves)
create function public.uzhu_admin_list() returns setof text language sql stable security definer set search_path = public as $$
  select email from public.uzhu_admins where public.uzhu_is_admin() order by email;
$$;
create function public.uzhu_admin_add(e text) returns boolean language sql security definer set search_path = public as $$
  with i as (
    insert into public.uzhu_admins(email)
    select lower(trim(e)) where public.uzhu_is_admin() and lower(trim(e)) ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    on conflict do nothing returning 1
  ) select public.uzhu_is_admin() and lower(trim(e)) ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$';
$$;
create function public.uzhu_admin_remove(e text) returns boolean language sql security definer set search_path = public as $$
  with d as (
    delete from public.uzhu_admins where email = lower(trim(e)) and public.uzhu_is_admin()
      and lower(trim(e)) <> lower(coalesce(auth.jwt() ->> 'email', ''))
    returning 1
  ) select exists (select 1 from d);
$$;
revoke all on function public.uzhu_admin_list() from public, anon;
revoke all on function public.uzhu_admin_add(text) from public, anon;
revoke all on function public.uzhu_admin_remove(text) from public, anon;
grant execute on function public.uzhu_admin_list() to authenticated;
grant execute on function public.uzhu_admin_add(text) to authenticated;
grant execute on function public.uzhu_admin_remove(text) to authenticated;

-- Security hardening (applied 2026-10-25)
-- Push endpoints must belong to a real browser push service, so uzhu-send never sends requests anywhere else.
alter table public.uzhu_push add constraint uzhu_push_endpoint_service check (endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.notify\.windows\.com|web\.push\.apple\.com)/' and char_length(endpoint) <= 1000);
-- Size limits so one account cannot fill the database.
alter table public.uzhu_push add constraint uzhu_push_size check (jsonb_typeof(schedule) = 'array' and octet_length(schedule::text) <= 1000000 and octet_length(keys::text) <= 2000);
alter table public.uzhu_profiles add constraint uzhu_profiles_size check (octet_length(coalesce(data::text, '')) <= 5000000 and char_length(coalesce(name, '')) <= 200 and char_length(coalesce(email, '')) <= 320);
alter table public.uzhu_public add constraint uzhu_public_size check (char_length(nick) <= 40 and char_length(code) <= 40 and char_length(coalesce(team, '')) <= 60 and octet_length(coalesce(cheers::text, '')) <= 20000);
-- Cheers: the sender is recorded by the server, only the app's six ready-made texts are accepted
-- (md5 of each entry of CHEERS in js/features-a.js: update these hashes if that list changes),
-- and each sender may send at most 3 a day to the same friend and 30 a day in total.
alter table public.uzhu_cheers add column if not exists from_user uuid default auth.uid();
create index if not exists uzhu_cheers_from on public.uzhu_cheers (from_user, created_at);
create or replace function public.uzhu_cheer_nick() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.from_user := auth.uid();
  new.from_nick := coalesce((select nick from public.uzhu_public where user_id = auth.uid()), 'یک دوست');
  new.created_at := now();
  if md5(new.text) not in ('e92f15788b1275eca699497acca79b7d', '8ba10be014b2fc72031272108baee83b', '1904b73b28a43a8225e8fbd806fc52a1', '9164bdb40c02e66635786878a6c560f4', '5071b3248cbad5e0862d5b5395a0a9cf', 'c349e3881ed880a02e1552a3fdb52d34') then
    raise exception 'cheer text not allowed';
  end if;
  if (select count(*) from public.uzhu_cheers where from_user = new.from_user and created_at > now() - interval '1 day') >= 30
     or (select count(*) from public.uzhu_cheers where from_user = new.from_user and to_code = new.to_code and created_at > now() - interval '1 day') >= 3 then
    raise exception 'too many cheers today';
  end if;
  return new;
end $$;
revoke all on function public.uzhu_cheer_nick() from public, anon, authenticated;
