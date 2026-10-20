// Sends due Uzhu reminders as Web Push notifications. Called every 5 minutes by pg_cron.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
type Item = { at: string; text: string; url?: string };

Deno.serve(async (req) => {
  const { data: priv } = await db.from("uzhu_private").select("key,value");
  const cfg = Object.fromEntries((priv ?? []).map((r) => [r.key, r.value]));
  if (!cfg.cron_secret || req.headers.get("x-cron-secret") !== cfg.cron_secret) return new Response("forbidden", { status: 403 });
  webpush.setVapidDetails(Deno.env.get("SUPABASE_URL")!, cfg.vapid_public, cfg.vapid_private);

  // uzhu_take_due removes the due items from each schedule in one statement and returns only rows that have any,
  // so a schedule the app saves meanwhile (or an admin broadcast) is never overwritten, and idle rows are never loaded.
  const now = Date.now();
  const { data: rows, error } = await db.rpc("uzhu_take_due", { cutoff: new Date(now).toISOString() });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  let sent = 0, removed = 0;
  const gone: string[] = [], delivered: string[] = [];
  const one = async (s: { endpoint: string; keys: unknown; due: Item[] }) => {
    const fresh = (s.due || []).filter((i) => now - Date.parse(i.at) < 30 * 60e3); // skip ones missed by more than 30 min
    for (const i of fresh.slice(-2)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys as never }, JSON.stringify({ title: "اوژو 🌱", body: i.text, url: i.url || "./#today" }), { TTL: 3600 });
        sent++; if (!delivered.includes(s.endpoint)) delivered.push(s.endpoint);
      } catch (e) {
        if (e?.statusCode === 404 || e?.statusCode === 410) { gone.push(s.endpoint); return; }
      }
    }
  };
  const list = rows ?? [];
  for (let k = 0; k < list.length; k += 25) await Promise.all(list.slice(k, k + 25).map(one));
  if (gone.length) { await db.from("uzhu_push").delete().in("endpoint", gone); removed = gone.length; }
  for (let k = 0; k < delivered.length; k += 200) await db.from("uzhu_push").update({ last_sent_at: new Date().toISOString() }).in("endpoint", delivered.slice(k, k + 200));
  return Response.json({ sent, removed, rows: list.length });
});
