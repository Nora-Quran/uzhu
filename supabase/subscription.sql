-- Paid subscription (applied 2026-10-26). Run after schema.sql.
-- Every new account gets a 3-day free trial from sign-up. After that the account needs a paid period:
-- the user pays by card-to-card, uploads the receipt (private storage bucket), an admin approves it in the admin panel.
-- Access is enforced here, not in the browser: without access, an account cannot read the daily program text
-- (uzhu_program), save progress, register reminders or use the social features.

-- Plans and prices (Toman). The admin panel and the subscribe page show the same numbers (js/subscription.js).
create function public.uzhu_plan_months(p text) returns int language sql immutable set search_path = public as $$
  select case p when '1m' then 1 when '3m' then 3 when '6m' then 6 when '12m' then 12 end;
$$;
create function public.uzhu_plan_price(p text) returns int language sql immutable set search_path = public as $$
  select case p when '1m' then 100000 when '3m' then 270000 when '6m' then 510000 when '12m' then 960000 end;
$$;

-- One row per account: end of the free trial and end of the paid period. Written only by the server.
create table public.uzhu_subs (user_id uuid primary key references auth.users(id) on delete cascade, trial_ends timestamptz not null, paid_until timestamptz, updated_at timestamptz default now());
alter table public.uzhu_subs enable row level security;
create policy "own sub select" on public.uzhu_subs for select to authenticated using ((select auth.uid()) = user_id);

create function public.uzhu_new_user_sub() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.uzhu_subs(user_id, trial_ends) values (new.id, coalesce(new.created_at, now()) + interval '3 days') on conflict do nothing;
  return new;
end $$;
revoke all on function public.uzhu_new_user_sub() from public, anon, authenticated;
create trigger uzhu_new_user_sub after insert on auth.users for each row execute function public.uzhu_new_user_sub();
-- Accounts that existed before subscriptions get a fresh 3-day trial.
insert into public.uzhu_subs(user_id, trial_ends) select id, now() + interval '3 days' from auth.users on conflict do nothing;

-- Payment requests with the uploaded receipt. Inserted only through uzhu_pay_submit, reviewed only through uzhu_admin_review.
create table public.uzhu_payments (id bigserial primary key, user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (public.uzhu_plan_months(plan) is not null), months int not null, amount int not null,
  receipt text not null check (char_length(receipt) <= 200), status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text check (char_length(note) <= 300), created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by text);
create index uzhu_payments_user on public.uzhu_payments (user_id, created_at);
create index uzhu_payments_pending on public.uzhu_payments (created_at) where status = 'pending';
alter table public.uzhu_payments enable row level security;
create policy "own payments select" on public.uzhu_payments for select to authenticated using ((select auth.uid()) = user_id);

-- Access = admin, or inside the trial or paid period, or a receipt sent in the last 24 hours
-- that is still waiting for review (not for accounts that had a receipt rejected in the last 30 days).
create function public.uzhu_access_for(uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select uid is not null and (
    exists (select 1 from public.uzhu_subs s where s.user_id = uid and greatest(s.trial_ends, coalesce(s.paid_until, '-infinity')) > now())
    or (exists (select 1 from public.uzhu_payments p where p.user_id = uid and p.status = 'pending' and p.created_at > now() - interval '24 hours')
        and not exists (select 1 from public.uzhu_payments p where p.user_id = uid and p.status = 'rejected' and p.reviewed_at > now() - interval '30 days'))
    or exists (select 1 from public.uzhu_admins a join auth.users u on lower(u.email) = a.email where u.id = uid and u.email_confirmed_at is not null)
  );
$$;
revoke all on function public.uzhu_access_for(uuid) from public, anon, authenticated;
create function public.uzhu_has_access() returns boolean language sql stable security definer set search_path = public as $$
  select public.uzhu_access_for(auth.uid());
$$;
-- anon too: the uzhu_content policy below is checked for visitors (always false for them).
revoke all on function public.uzhu_has_access() from public;
grant execute on function public.uzhu_has_access() to anon, authenticated;

-- The signed-in user's own status for the subscribe page.
create function public.uzhu_my_sub() returns jsonb language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'now', now(),
    'access', public.uzhu_access_for(auth.uid()),
    'admin', public.uzhu_is_admin(),
    'trial_ends', (select trial_ends from public.uzhu_subs where user_id = auth.uid()),
    'paid_until', (select paid_until from public.uzhu_subs where user_id = auth.uid()),
    'payments', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'plan', plan, 'amount', amount, 'status', status, 'note', note, 'created_at', created_at, 'reviewed_at', reviewed_at) order by created_at desc)
      from (select * from public.uzhu_payments where user_id = auth.uid() order by created_at desc limit 20) p), '[]'::jsonb)
  ) end;
$$;
revoke all on function public.uzhu_my_sub() from public, anon;
grant execute on function public.uzhu_my_sub() to authenticated;

-- Private receipt images: each user uploads into a folder named by their user id, sees only their own files,
-- cannot overwrite or delete them; admins can view all. Max 5 MB, images only, 30 files per account.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uzhu-receipts', 'uzhu-receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create function public.uzhu_receipt_count() returns bigint language sql stable security definer set search_path = public as $$
  select count(*) from storage.objects where bucket_id = 'uzhu-receipts' and (storage.foldername(name))[1] = auth.uid()::text;
$$;
revoke all on function public.uzhu_receipt_count() from public, anon;
grant execute on function public.uzhu_receipt_count() to authenticated;
create policy "uzhu receipt upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'uzhu-receipts' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.uzhu_receipt_count()) < 30);
create policy "uzhu receipt read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'uzhu-receipts' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.uzhu_is_admin())));

-- Sends a payment request. The price comes from the plan on the server; the receipt must be the caller's own uploaded file.
create function public.uzhu_pay_submit(p_plan text, p_receipt text) returns bigint language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); new_id bigint;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if public.uzhu_plan_months(p_plan) is null then raise exception 'unknown plan'; end if;
  if (storage.foldername(p_receipt))[1] is distinct from uid::text
     or not exists (select 1 from storage.objects where bucket_id = 'uzhu-receipts' and name = p_receipt) then
    raise exception 'receipt not found';
  end if;
  perform pg_advisory_xact_lock(hashtext('uzhu_pay:' || uid::text));
  if exists (select 1 from public.uzhu_payments where user_id = uid and status = 'pending') then raise exception 'already pending'; end if;
  if (select count(*) from public.uzhu_payments where user_id = uid and created_at > now() - interval '1 day') >= 5 then raise exception 'too many requests'; end if;
  insert into public.uzhu_payments(user_id, plan, months, amount, receipt)
  values (uid, p_plan, public.uzhu_plan_months(p_plan), public.uzhu_plan_price(p_plan), p_receipt) returning id into new_id;
  return new_id;
end $$;
revoke all on function public.uzhu_pay_submit(text, text) from public, anon;
grant execute on function public.uzhu_pay_submit(text, text) to authenticated;

-- Admin: payment requests (pending first) with each account's email, name and current period.
create function public.uzhu_admin_payments() returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.uzhu_is_admin() then coalesce((select jsonb_agg(x order by (x->>'status') <> 'pending', x->>'created_at' desc) from (
    select jsonb_build_object('id', p.id, 'email', u.email, 'name', coalesce(pr.name, u.raw_user_meta_data->>'name', ''), 'plan', p.plan, 'amount', p.amount,
      'receipt', p.receipt, 'status', p.status, 'note', p.note, 'created_at', p.created_at, 'reviewed_at', p.reviewed_at, 'reviewed_by', p.reviewed_by,
      'trial_ends', s.trial_ends, 'paid_until', s.paid_until) x
    from public.uzhu_payments p join auth.users u on u.id = p.user_id
    left join public.uzhu_profiles pr on pr.user_id = p.user_id left join public.uzhu_subs s on s.user_id = p.user_id
    order by p.status <> 'pending', p.created_at desc limit 300) t), '[]'::jsonb) else null end;
$$;
-- Admin: approve (adds the plan's months after the current trial or paid period) or reject a pending request.
create function public.uzhu_admin_review(p_id bigint, p_approve boolean, p_note text default null) returns jsonb language plpgsql security definer set search_path = public as $$
declare pay public.uzhu_payments; v_until timestamptz;
begin
  if not public.uzhu_is_admin() then raise exception 'not allowed'; end if;
  select * into pay from public.uzhu_payments where id = p_id and status = 'pending' for update;
  if not found then raise exception 'not pending'; end if;
  update public.uzhu_payments set status = case when p_approve then 'approved' else 'rejected' end, note = left(nullif(trim(p_note), ''), 300),
    reviewed_at = now(), reviewed_by = lower(auth.jwt() ->> 'email') where id = p_id;
  if p_approve then
    insert into public.uzhu_subs(user_id, trial_ends) values (pay.user_id, now()) on conflict do nothing;
    update public.uzhu_subs set paid_until = greatest(coalesce(paid_until, now()), trial_ends, now()) + make_interval(months => pay.months), updated_at = now()
      where user_id = pay.user_id returning paid_until into v_until;
  end if;
  return jsonb_build_object('status', case when p_approve then 'approved' else 'rejected' end, 'paid_until', v_until);
end $$;
-- Admin: give an account extra days (gift, correction or refund of lost days), by email. Negative days take days back.
create function public.uzhu_admin_grant(p_email text, p_days int) returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid; v_until timestamptz;
begin
  if not public.uzhu_is_admin() then raise exception 'not allowed'; end if;
  if p_days is null or p_days = 0 or abs(p_days) > 3660 then raise exception 'bad days'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'no such user'; end if;
  insert into public.uzhu_subs(user_id, trial_ends) values (uid, now()) on conflict do nothing;
  update public.uzhu_subs set paid_until = greatest(coalesce(paid_until, now()), trial_ends, now()) + make_interval(days => p_days), updated_at = now()
    where user_id = uid returning paid_until into v_until;
  return jsonb_build_object('paid_until', v_until);
end $$;
revoke all on function public.uzhu_admin_payments() from public, anon;
revoke all on function public.uzhu_admin_review(bigint, boolean, text) from public, anon;
revoke all on function public.uzhu_admin_grant(text, int) from public, anon;
grant execute on function public.uzhu_admin_payments() to authenticated;
grant execute on function public.uzhu_admin_review(bigint, boolean, text) to authenticated;
grant execute on function public.uzhu_admin_grant(text, int) to authenticated;

-- The daily program text (every day except day 1 of cycle 1, which is the public preview) lives here,
-- readable only with access. js/program.js keeps only titles. Rows are loaded by supabase/program-data.sql.
create table public.uzhu_program (id text primary key check (id ~ '^c[0-9]d[0-9]{1,2}$'), data jsonb not null);
alter table public.uzhu_program enable row level security;
create policy "program with access" on public.uzhu_program for select to authenticated using ((select public.uzhu_has_access()));
-- Admin edits of day texts are paid content too.
drop policy "content readable" on public.uzhu_content;
create policy "content readable" on public.uzhu_content for select to anon, authenticated using (kind <> 'day' or (select public.uzhu_has_access()));

-- Without access an account keeps reading its own saved data but cannot save, schedule reminders or use the social features.
drop policy "own profile insert" on public.uzhu_profiles;
drop policy "own profile update" on public.uzhu_profiles;
create policy "own profile insert" on public.uzhu_profiles for insert to authenticated with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
create policy "own profile update" on public.uzhu_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
drop policy "own push insert" on public.uzhu_push;
drop policy "own push update" on public.uzhu_push;
create policy "own push insert" on public.uzhu_push for insert to authenticated with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
create policy "own push update" on public.uzhu_push for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
drop policy "own public insert" on public.uzhu_public;
drop policy "own public update" on public.uzhu_public;
create policy "own public insert" on public.uzhu_public for insert to authenticated with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
create policy "own public update" on public.uzhu_public for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and (select public.uzhu_has_access()));
drop policy "cheers insert" on public.uzhu_cheers;
create policy "cheers insert" on public.uzhu_cheers for insert to authenticated with check (char_length(text) <= 120 and (select public.uzhu_has_access()));

-- Reminders are sent only to accounts that have access.
create or replace function public.uzhu_take_due(cutoff timestamptz default now()) returns table(endpoint text, keys jsonb, due jsonb)
language sql security definer set search_path = public as $$
  with d as (
    select p.endpoint, coalesce(jsonb_agg(i) filter (where (i->>'at')::timestamptz <= cutoff), '[]'::jsonb) as due
    from public.uzhu_push p
    cross join lateral jsonb_array_elements(case when jsonb_typeof(p.schedule) = 'array' then p.schedule else '[]'::jsonb end) i
    where public.uzhu_access_for(p.user_id)
    group by p.endpoint
    having bool_or((i->>'at')::timestamptz <= cutoff)
  ), u as (
    -- "keep" is recomputed from the row as it is at update time, so items added meanwhile survive.
    update public.uzhu_push p set schedule = (
      select coalesce(jsonb_agg(i), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(p.schedule) = 'array' then p.schedule else '[]'::jsonb end) i
      where (i->>'at')::timestamptz > cutoff)
    from d where p.endpoint = d.endpoint
    returning p.endpoint, p.keys, d.due
  ) select u.endpoint, u.keys, u.due from u;
$$;
revoke all on function public.uzhu_take_due(timestamptz) from public, anon, authenticated;
grant execute on function public.uzhu_take_due(timestamptz) to service_role;

-- Card details shown on the subscribe page (editable in the admin panel; placeholders until the real ones are set).
insert into public.uzhu_settings(key, value) values ('payment', '{"card": "xxxx-xxxx-xxxx-xxxx", "holder": "xxxx", "bank": "xxxx"}') on conflict (key) do nothing;
