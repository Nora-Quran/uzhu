/* Uzhu storage: accounts + progress.
   Default: saved in this browser (localStorage).
   If window.UZHU_CONFIG.supabase = { url, key } is set, accounts use Supabase Auth (real email sign-up)
   and progress is saved to the `uzhu_profiles` table (see supabase/schema.sql). */
(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: keep in memory */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const memory = {};

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('uzhu:' + text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h;
    }
  }

  const local = {
    mode: 'local',
    async init() { return this.current(); },
    current() {
      const email = LS.get('uzhu:session', memory.session || null);
      if (!email) return null;
      const users = LS.get('uzhu:users', memory.users || {});
      const u = users[email];
      return u ? { email, name: u.name, data: u.data } : null;
    },
    async signup(name, email, pass) {
      email = email.trim().toLowerCase();
      const users = LS.get('uzhu:users', memory.users || {});
      if (users[email]) throw new Error('با این ایمیل قبلاً ثبت‌نام شده. از «ورود» استفاده کن.');
      users[email] = { name, pass: await hash(pass), data: null, createdAt: Date.now() };
      memory.users = users; LS.set('uzhu:users', users);
      memory.session = email; LS.set('uzhu:session', email);
      return { email, name, data: null };
    },
    async login(email, pass) {
      email = email.trim().toLowerCase();
      const users = LS.get('uzhu:users', memory.users || {});
      const u = users[email];
      if (!u || u.pass !== await hash(pass)) throw new Error('ایمیل یا رمز درست نیست.');
      memory.session = email; LS.set('uzhu:session', email);
      return { email, name: u.name, data: u.data };
    },
    async save(user) {
      const users = LS.get('uzhu:users', memory.users || {});
      if (!users[user.email]) return;
      users[user.email].data = user.data; users[user.email].name = user.name;
      memory.users = users; LS.set('uzhu:users', users);
    },
    async logout() { memory.session = null; LS.del('uzhu:session'); },
    syncPush: null,
    // Site settings and content edits made in the admin panel (this browser only in local mode).
    async getSite() { return { settings: LS.get('uzhu:site:settings', {}), content: LS.get('uzhu:site:content', []) }; },
    async isAdmin() { const u = this.current(); if (!u) return false; const users = LS.get('uzhu:users', {}); const first = Object.entries(users).sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0))[0]; return !!first && first[0] === u.email; },
    // Admin list lives on the server only; in local mode the first account on this browser is the admin.
    async admins() { return null; }, async addAdmin() { throw new Error('فقط در نسخه‌ی آنلاین'); }, async removeAdmin() { throw new Error('فقط در نسخه‌ی آنلاین'); },
    async setSetting(key, value) { const st = LS.get('uzhu:site:settings', {}); st[key] = value; LS.set('uzhu:site:settings', st); },
    async saveContent(kind, id, data, hidden = false) { const c = LS.get('uzhu:site:content', []).filter(x => !(x.kind === kind && x.id === id)); c.push({ kind, id, data, hidden }); LS.set('uzhu:site:content', c); },
    async deleteContent(kind, id) { LS.set('uzhu:site:content', LS.get('uzhu:site:content', []).filter(x => !(x.kind === kind && x.id === id))); },
    async report() { const users = LS.get('uzhu:users', {}); return { push: 0, profiles: Object.entries(users).map(([email, u]) => ({ name: u.name, email, created: new Date(u.createdAt || Date.now()).toISOString(), updated: new Date().toISOString(), data: u.data })) }; },
    async broadcast() { return 0; },
    // Opt-in social stats (friend streaks, family team, weekly league). Local mode: shared between accounts in this browser.
    social: {
      async publish(row) { const all = LS.get('uzhu:public', {}); all[row.code] = { ...all[row.code], ...row, updated_at: new Date().toISOString() }; LS.set('uzhu:public', all); },
      async byCodes(codes) { const all = LS.get('uzhu:public', {}); return codes.map(c => all[c]).filter(Boolean); },
      async team(team) { return Object.values(LS.get('uzhu:public', {})).filter(r => team && r.team === team); },
      async league(week) { return Object.values(LS.get('uzhu:public', {})).filter(r => r.league && r.week === week).sort((a, b) => b.week_points - a.week_points).slice(0, 30); },
      async cheer(code, from_nick, text) { const c = LS.get('uzhu:cheers', []); c.push({ to_code: code, from_nick, text, created_at: new Date().toISOString() }); LS.set('uzhu:cheers', c.slice(-200)); },
      async myCheers(code) { return LS.get('uzhu:cheers', []).filter(c => c.to_code === code).slice(-20).reverse(); },
    },
  };

  function loadScript(src, ms = 8000) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
      setTimeout(() => fail(new Error('timeout')), ms);
    });
  }
  const offline = e => !navigator.onLine || /fetch|network|timeout|Failed|Load failed/i.test(String(e && (e.message || e)));
  const NET_ERR = 'اتصال به سرور برقرار نشد. اینترنتت رو بررسی کن و دوباره امتحان کن.';

  const remote = {
    mode: 'supabase', sb: null, user: null, pending: false, offline: false,
    async init(cfg) {
      await loadScript('js/vendor/supabase.js');
      this.sb = window.supabase.createClient(cfg.url, cfg.key);
      const { data } = await this.sb.auth.getSession();
      if (data.session) this.user = await this.fetch(data.session.user);
      if (/access_token|error_description/.test(location.hash)) history.replaceState(null, '', location.pathname + (this.user ? '#today' : '#login'));
      this.sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && this.user) { this.user = null; if (window.UZHU_APP) window.UZHU_APP.signedOut(); } });
      addEventListener('online', () => { if (this.pending && this.user) this.save(this.user).catch(() => {}); });
      return this.user;
    },
    current() { return this.user; },
    cacheKey(id) { return 'uzhu:cache:' + id; },
    // Reads the account's saved progress. A network failure falls back to this device's last copy,
    // so a flaky connection never looks like a brand-new account (which would overwrite real progress).
    async fetch(authUser) {
      const cached = LS.get(this.cacheKey(authUser.id), null);
      let res;
      try { res = await Promise.race([this.sb.from('uzhu_profiles').select('name,data,updated_at').eq('user_id', authUser.id).maybeSingle(), new Promise((_, f) => setTimeout(() => f(new Error('timeout')), 8000))]); }
      catch (e) { res = { error: e }; }
      if (res.error) {
        if (cached) { this.offline = true; this.pending = !!cached.pending; return { id: authUser.id, email: authUser.email, name: cached.name, data: cached.data, updated: cached.updated }; }
        throw new Error(NET_ERR);
      }
      this.offline = false;
      const d = res.data;
      // Keep unsent local changes when they are newer than the server copy.
      if (cached && cached.pending && cached.data && (!d || (cached.updated || '') > (d.updated_at || ''))) {
        this.pending = true;
        const u = { id: authUser.id, email: authUser.email, name: cached.name, data: cached.data, updated: cached.updated };
        setTimeout(() => this.save(u).catch(() => {}), 0);
        return u;
      }
      const u = { id: authUser.id, email: authUser.email, name: d?.name || authUser.user_metadata?.name || '', data: d?.data || null, updated: d?.updated_at || '' };
      if (u.data) LS.set(this.cacheKey(u.id), { name: u.name, data: u.data, updated: u.updated });
      return u;
    },
    // Fresh copy from the server, used when the tab comes back to the foreground (another device may have saved).
    async refresh() {
      if (!this.user || this.pending) return null;
      const { data, error } = await this.sb.from('uzhu_profiles').select('name,data,updated_at').eq('user_id', this.user.id).maybeSingle();
      if (error || !data || !data.data || (data.updated_at || '') <= (this.user.updated || '')) return null;
      this.user.data = data.data; this.user.updated = data.updated_at;
      LS.set(this.cacheKey(this.user.id), { name: this.user.name, data: data.data, updated: data.updated_at });
      return this.user;
    },
    async signup(name, email, pass) {
      let r; try { r = await this.sb.auth.signUp({ email, password: pass, options: { data: { name }, emailRedirectTo: location.origin + location.pathname } }); } catch (e) { throw new Error(NET_ERR); }
      const { data, error } = r;
      if (error) throw new Error(/registered/i.test(error.message) ? 'با این ایمیل قبلاً ثبت‌نام شده. از «ورود» استفاده کن.' : /rate|seconds/i.test(error.message) ? 'درخواست‌ها زیاد شده. چند دقیقه بعد دوباره امتحان کن.' : /password/i.test(error.message) ? 'رمز عبور باید دست‌کم ۶ نویسه باشه.' : offline(error) ? NET_ERR : 'ثبت‌نام انجام نشد: ' + error.message);
      if (!data.session) throw new Error('ایمیل تأیید برایت فرستادیم. روی لینک داخلش بزن و بعد وارد شو.');
      this.user = { id: data.user.id, email, name, data: null };
      return this.user;
    },
    async login(email, pass) {
      let r; try { r = await this.sb.auth.signInWithPassword({ email, password: pass }); } catch (e) { throw new Error(NET_ERR); }
      const { data, error } = r;
      if (error) throw new Error(/confirm/i.test(error.message) ? 'اول روی لینک تأیید داخل ایمیلت بزن، بعد وارد شو.' : offline(error) ? NET_ERR : 'ایمیل یا رمز درست نیست.');
      this.user = await this.fetch(data.user);
      return this.user;
    },
    async save(user) {
      if (!user || !user.data) return;
      const updated = new Date().toISOString();
      user.updated = updated;
      LS.set(this.cacheKey(user.id), { name: user.name, data: user.data, updated, pending: true });
      let error;
      try { ({ error } = await this.sb.from('uzhu_profiles').upsert({ user_id: user.id, email: user.email, name: user.name, data: user.data, updated_at: updated })); } catch (e) { error = e; }
      if (error) { this.pending = true; throw new Error(offline(error) ? 'offline' : error.message); }
      this.pending = false; this.offline = false;
      LS.set(this.cacheKey(user.id), { name: user.name, data: user.data, updated });
    },
    async logout(endpoint) {
      if (endpoint) await this.sb.from('uzhu_push').delete().eq('endpoint', endpoint).then(() => {}, () => {});
      if (this.user) LS.del(this.cacheKey(this.user.id));
      this.user = null; this.pending = false;
      await this.sb.auth.signOut().catch(() => {});
    },
    async getSite() {
      const [st, ct] = await Promise.all([this.sb.from('uzhu_settings').select('key,value'), this.sb.from('uzhu_content').select('kind,id,data,hidden')]);
      return { settings: Object.fromEntries((st.data || []).map(r => [r.key, r.value])), content: ct.data || [] };
    },
    async isAdmin() { if (!this.user) return false; const { data } = await this.sb.rpc('uzhu_is_admin'); return !!data; },
    async admins() { const { data, error } = await this.sb.rpc('uzhu_admin_list'); if (error) throw new Error(error.message); return data || []; },
    async addAdmin(email) { const { data, error } = await this.sb.rpc('uzhu_admin_add', { e: email }); if (error) throw new Error(error.message); if (!data) throw new Error('ایمیل درست نیست یا اجازه‌ی این کار رو نداری.'); },
    async removeAdmin(email) { const { data, error } = await this.sb.rpc('uzhu_admin_remove', { e: email }); if (error) throw new Error(error.message); if (!data) throw new Error('حذف نشد. خودت رو نمی‌تونی حذف کنی.'); },
    async setSetting(key, value) { const { error } = await this.sb.from('uzhu_settings').upsert({ key, value, updated_at: new Date().toISOString() }); if (error) throw new Error(error.message); },
    async saveContent(kind, id, data, hidden = false) { const { error } = await this.sb.from('uzhu_content').upsert({ kind, id, data, hidden, updated_at: new Date().toISOString() }); if (error) throw new Error(error.message); },
    async deleteContent(kind, id) { await this.sb.from('uzhu_content').delete().eq('kind', kind).eq('id', id); },
    async report() { const { data, error } = await this.sb.rpc('uzhu_admin_report'); if (error) throw new Error(error.message); return data; },
    async broadcast(msg, link) { const { data, error } = await this.sb.rpc('uzhu_admin_broadcast', { msg, link }); if (error) throw new Error(error.message); return data; },
    social: {
      async publish(row) { const { error } = await remote.sb.from('uzhu_public').upsert({ ...row, user_id: remote.user.id, updated_at: new Date().toISOString() }); if (error) throw new Error(error.message); },
      async byCodes(codes) { if (!codes.length) return []; const { data, error } = await remote.sb.from('uzhu_public').select('code,nick,streak,done_today,week_points,week,team,team_dmg,updated_at').in('code', codes); if (error) throw new Error(error.message); return data || []; },
      async team(team) { if (!team) return []; const { data } = await remote.sb.from('uzhu_public').select('code,nick,streak,done_today,week_points,week,team,team_dmg,updated_at').eq('team', team); return data || []; },
      async league(week) { const { data } = await remote.sb.from('uzhu_public').select('code,nick,streak,week_points').eq('league', true).eq('week', week).order('week_points', { ascending: false }).limit(30); return data || []; },
      async cheer(code, from_nick, text) { const { error } = await remote.sb.from('uzhu_cheers').insert({ to_code: code, from_nick, text }); if (error) throw new Error(error.message); },
      async myCheers(code) { if (!code) return []; const { data } = await remote.sb.from('uzhu_cheers').select('from_nick,text,created_at').eq('to_code', code).order('created_at', { ascending: false }).limit(20); return data || []; },
    },
    // Save this device's push subscription and its upcoming reminders, for the server to send.
    async syncPush(sub, schedule) {
      const j = sub.toJSON();
      const row = { endpoint: j.endpoint, user_id: this.user.id, keys: j.keys, schedule, updated_at: new Date().toISOString() };
      let { error } = await this.sb.from('uzhu_push').upsert(row);
      // The endpoint may still belong to another account that used this device: hand it over, then retry once.
      if (error) { await this.sb.rpc('uzhu_claim_push', { ep: j.endpoint }).then(() => {}, () => {}); ({ error } = await this.sb.from('uzhu_push').upsert(row)); }
      if (error) throw new Error(error.message);
    },
  };

  const cfg = (window.UZHU_CONFIG || {}).supabase;
  window.UZHU_STORE = cfg && cfg.url && cfg.key ? remote : local;
  window.UZHU_STORE.config = cfg;
})();
