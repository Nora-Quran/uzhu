/* Uzhu admin panel (#admin): site settings, content editing, reports, broadcast.
   Also applies the admin's settings and content edits to the site on every load. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  const { esc, STORE, PROGRAM, RECIPES, ARTICLES } = A;
  // Reports show values from users' own saved data, which anyone can edit, so every value is escaped before it reaches the page.
  const fa = v => esc(A.fa(v));
  const num = v => Number.isFinite(+v) ? +v : 0;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const ART = window.UZHU_ART;
  let isAdmin = false;
  Object.defineProperty(A, 'isAdmin', { get: () => isAdmin });
  // Article HTML written in the admin panel: keep simple formatting tags and safe links only.
  function cleanHtml(html) {
    const tpl = document.createElement('template'); tpl.innerHTML = String(html || '');
    const OK = /^(P|H3|H4|UL|OL|LI|B|STRONG|I|EM|BR|A|BLOCKQUOTE|SPAN|SMALL|TABLE|TR|TD|TH|TBODY|THEAD)$/;
    [...tpl.content.querySelectorAll('*')].reverse().forEach(el => {
      if (!OK.test(el.tagName)) { el.replaceWith(...(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED)$/.test(el.tagName) ? [] : el.childNodes)); return; }
      [...el.attributes].forEach(at => { if (!(el.tagName === 'A' && at.name === 'href' && /^(https?:|#)/i.test(at.value.trim()))) el.removeAttribute(at.name); });
      if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    });
    return tpl.innerHTML;
  }
  const safeLink = u => /^(https?:\/\/|#|\.\/|\/)/i.test(String(u || '').trim()) ? u : '';

  const FEATURES = [
    ['sos', 'دکمه‌ی «هوس دارم»'], ['move', 'بخش ورزش'], ['recipes', 'رسپی‌ها'], ['learn', 'علم قند'], ['savings', 'شمارنده‌ی پس‌انداز'],
    ['freeze', 'روز امن'], ['prep', 'هفته‌ی آماده‌سازی'], ['reintro', 'بازگشت آگاهانه'], ['journeys', 'مسیرهای موضوعی'], ['challenges', 'چالش‌ها'],
    ['companion', 'همراه پرانرژی'], ['buddy', 'یار بی‌قند'], ['team', 'تیم خانواده'], ['league', 'لیگ هفتگی'], ['quiz', 'کوییز روزانه'],
    ['coach', 'بازخورد مربی'], ['slipwizard', 'تحلیل لغزش'], ['taarof', 'جمله‌های تعارف'], ['checkin', 'امروز چطوری؟ (حال و انرژی)'], ['timeline', 'خط زمانی بدن'],
    ['scorecard', 'کارنامه‌ی هفتگی'], ['assess', 'ارزیابی دوره‌ای'], ['swaps', 'جایگزین‌یاب'], ['traffic', 'چراغ راهنمایی قند'], ['labelcalc', 'ماشین‌حساب برچسب'],
    ['shopping', 'لیست خرید'], ['trackers', 'ردیاب آب و چای'], ['plate', 'عکس بشقاب'], ['sameday', '«مثل دیروز»'], ['kitchen', 'آشپزخونه تعطیله'],
    ['builder', 'تمرین‌ساز'], ['lazy', 'جلسه‌ی تنبل'], ['mindful', 'لحظه‌ی آگاهانه'], ['occasions', 'تقویم مناسبت‌ها'], ['letters', 'نامه به خودم'],
    ['trial', 'امتحان روز اول بدون ثبت‌نام'], ['search', 'جست‌وجوی سراسری'], ['faq', 'پرسش‌های پرتکرار'], ['glossary', 'واژه‌نامه'], ['mealplan', 'برنامه‌ی غذایی هفته'],
    ['nutrition', 'ارزش غذایی رسپی‌ها'], ['cookmode', 'حالت آشپزی'], ['favorites', 'رسپی‌های نشان‌شده'], ['goaltips', 'کارت مخصوص هدف تو'], ['takeaway', 'چکیده‌ی متن روز'], ['sleep', 'بخش خواب'],
    ['nextstep', 'قدم بعدی و راهنمای سریع'], ['install', 'دعوت به نصب اپ'], ['sugardiary', 'دفترچه‌ی قند'], ['risk', 'آزمون خطر دیابت'], ['backup', 'پشتیبان‌گیری'], ['badges', 'نشان‌ها'], ['calendar', 'تقویم من'], ['bodytrack', 'اندازه‌ها و آزمایش‌ها'], ['report', 'گزارش برای پزشک'], ['a11y', 'خوانایی و خواندن متن'], ['theme', 'تم فصلی و مناسبتی کل برنامه'], ['move21', 'برنامه‌ی ورزش ۲۱ روزه با سه سطح'], ['nighttheme', 'ظاهر دفترچه‌ای چک‌لیست شب'], ['breakfast', 'بخش صبحانه'], ['calories', 'کالری‌شماری'], ['period', 'تقویم پریود'],
    ...(A.moreFeatures || []), // plus3.js / plus4.js
  ];
  const on = k => A.site.settings.features?.[k] !== false;

  /* ---------- apply settings + content on load ---------- */
  function applyContent(content) {
    content.forEach(c => {
      try {
        if (c.kind === 'day') {
          const m = /^c(\d)d(\d+)$/.exec(c.id); if (!m) return;
          const cy = PROGRAM.cycles.find(x => x.id === +m[1]); if (cy && cy.days[+m[2] - 1]) Object.assign(cy.days[+m[2] - 1], c.data);
        } else if (c.kind === 'recipe') {
          const i = RECIPES.findIndex(r => r.id === c.id);
          if (c.hidden) { if (i >= 0) RECIPES.splice(i, 1); return; }
          const base = i >= 0 ? RECIPES[i] : { svg: (RECIPES[0] || {}).svg || '', tags: ['بدون شکر'] };
          const r = Object.assign({}, base, c.data, { id: c.id });
          if (c.data.svgFrom) r.svg = (RECIPES.find(x => x.id === c.data.svgFrom) || base).svg;
          if (i >= 0) RECIPES[i] = r; else RECIPES.push(r);
        } else if (c.kind === 'article') {
          const i = ARTICLES.articles.findIndex(a => a.id === c.id);
          if (c.hidden) { if (i >= 0) ARTICLES.articles.splice(i, 1); return; }
          const a = Object.assign({}, i >= 0 ? ARTICLES.articles[i] : { spot: 'book', refs: [] }, c.data, { id: c.id });
          if (c.data && c.data.html != null) a.html = cleanHtml(c.data.html);
          if (i >= 0) ARTICLES.articles[i] = a; else ARTICLES.articles.push(a);
        } else if (c.kind === 'list' && Array.isArray(c.data.items) && c.data.items.length) {
          if (c.id === 'quotes') PROGRAM.quotes.splice(0, PROGRAM.quotes.length, ...c.data.items);
          if (c.id === 'sos') PROGRAM.sos.splice(0, PROGRAM.sos.length, ...c.data.items);
        }
      } catch (e) { console.error(e); }
    });
  }
  A.H.load = (A.H.load || []).concat(async () => {
    try {
      const site = await STORE.getSite();
      A.site.settings = site.settings || {}; A.site.content = site.content || [];
      applyContent(A.site.content);
    } catch (e) { /* offline: keep built-in content */ }
    try { isAdmin = await STORE.isAdmin(); adminFor = A.user?.email || null; } catch (e) { isAdmin = false; }
  });

  let brandNow = null;
  function applyBrand(b) {
    const n = Number(b.logo) || 0; if (n === brandNow) return; brandNow = n;
    const logo = $('#logo'); if (logo) logo.innerHTML = n ? `<img src="img/logos/icon-${n}.svg" alt="" width="40" height="40" style="display:block;width:100%;height:auto;border-radius:10px">` : '<img src="img/icon.svg" alt="" width="40" height="40" style="display:block;width:100%;height:auto;border-radius:10px">';
    const fav = document.querySelector('link[rel=icon]'); if (fav) fav.href = n ? `img/logos/icon-${n}.svg` : 'img/icon.svg';
  }
  // Banner, feature toggles and texts that live in app.js markup.
  let adminFor = null;
  A.H.mount = (A.H.mount || []).concat(r => {
    const email = A.user?.email || null;
    if (email !== adminFor) {
      adminFor = email;
      if (!email) isAdmin = false;
      else STORE.isAdmin().then(v => { if (v !== isAdmin) { isAdmin = v; A.render(); } }).catch(() => {});
    }
    const st = A.site.settings;
    applyBrand(st.brand || {});
    const ann = st.announcement;
    let bar = $('#ann');
    if (ann?.on && ann.text && !ssGet('uzhu:ann:' + hashStr(ann.text))) {
      if (!bar) { bar = document.createElement('div'); bar.id = 'ann'; $('.topbar').after(bar); }
      bar.className = 'ann ' + (ann.tone || 'mint');
      bar.innerHTML = `<div class="wrap row" style="flex-wrap:nowrap;justify-content:space-between"><span>${esc(ann.text)}${safeLink(ann.link) ? ` <a href="${esc(safeLink(ann.link))}">بیشتر</a>` : ''}</span><button aria-label="بستن" class="ann-x">✕</button></div>`;
      $('.ann-x', bar).onclick = () => { ssSet('uzhu:ann:' + hashStr(ann.text)); bar.remove(); };
    } else if (bar && !ann?.on) bar.remove();
    const sos = $('#sos'); if (sos && !on('sos')) sos.hidden = true;
    [['move', 'move'], ['recipes', 'recipes'], ['learn', 'learn']].forEach(([k, route]) => { if (!on(k)) $$(`a[href="#${route}"]`).forEach(a => a.closest('.tool') ? a.remove() : (a.style.display = 'none')); });
    if (r === 'home' && st.hero) {
      const h1 = $('.hero h1'), lead = $('.hero .lead');
      if (st.hero.title && h1) h1.textContent = st.hero.title;
      if (st.hero.lead && lead) lead.textContent = st.hero.lead;
    }
    if (r === 'onboard' && st.defaults) {
      (st.defaults.times || []).forEach((t, i) => { const el = $('#t' + i); if (el && t) el.value = t; });
      const mt = $('#mtime'); if (mt && st.defaults.moveTime) mt.value = st.defaults.moveTime;
    }
    if (st.footer) { const f = $('.footer .wrap'); if (f) f.textContent = st.footer; }
    if (r === 'today' && !on('savings')) $$('.card').filter(c => /پس‌انداز/.test(c.textContent) && /حبه‌قند/.test(c.textContent)).forEach(c => c.remove());
  });
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k) { try { sessionStorage.setItem(k, '1'); } catch (e) {} }
  function hashStr(t) { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

  A.tools.push({ route: 'admin', icon: '🛠️', title: 'پنل مدیریت', desc: 'تنظیمات سایت، محتوا، گزارش‌ها و پیام همگانی', show: () => isAdmin });
  A.appRoutes.push('admin'); A.titles.admin = 'پنل مدیریت';
  A.H.settings = (A.H.settings || []).concat(() => isAdmin ? `<a class="btn sun" href="#admin">🛠️ پنل مدیریت</a>` : '');

  /* ---------- admin page ---------- */
  let tab = 'reports', report = null, reportErr = '', contentSel = { kind: 'day', id: 'c1d1' }, userQuery = '';
  const TABS = [['reports', 'گزارش‌ها'], ['users', 'کاربران'], ['content', 'محتوا'], ['settings', 'تنظیمات سایت'], ['broadcast', 'پیام همگانی']];

  A.views.admin = () => {
    if (!isAdmin) return `<section class="wrap auth stack"><div class="card">این بخش فقط برای مدیر سایته.</div></section>`;
    return `<section class="wrap stack admin" style="gap:16px">
      <div class="section-head" style="margin:0"><span class="eyebrow">پنل مدیریت</span><h2>مدیریت حبه</h2>${STORE.mode === 'local' ? '<p class="small muted">نسخه‌ی آزمایشی: تغییرها و گزارش‌ها فقط مربوط به همین مرورگره. در نسخه‌ی آنلاین، همه‌ی کاربرها رو می‌بینی.</p>' : ''}</div>
      <div class="filters admin-tabs">${TABS.map(([k, t]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div id="admin-body">${({ reports: reportsView, users: usersView, content: contentView, settings: settingsView, broadcast: broadcastView })[tab]()}</div>
    </section>`;
  };
  A.mounts.admin = () => {
    if (!isAdmin) return;
    $$('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; if (tab === 'reports' || tab === 'users') report = null; reportErr = ''; A.render(); });
    if ((tab === 'reports' || tab === 'users') && !report && !reportErr) loadReport();
    ({ reports: () => {}, users: mountUsers, content: mountContent, settings: mountSettings, broadcast: mountBroadcast })[tab]();
  };
  async function loadReport() {
    try { report = await STORE.report(); if (!report) throw new Error('دسترسی مدیر تأیید نشد.'); } catch (e) { reportErr = e.message; }
    if (location.hash === '#admin') A.render();
  }

  /* reports */
  function analyze(profiles) {
    const now = Date.now(), day = 864e5;
    const P = profiles.map(p => ({ ...p, d: p.data || {} }));
    const started = P.filter(p => p.d.profile);
    const doneDays = p => Object.values(p.d.log || {}).filter(l => l.done);
    const count = (arr, f) => arr.reduce((m, x) => { [].concat(f(x) || []).forEach(k => { m[k] = (m[k] || 0) + 1; }); return m; }, {});
    const hours = new Array(24).fill(0); let beaten = 0, gave = 0;
    P.forEach(p => { (p.d.sos?.events || []).forEach(e => { hours[e.hour] = (hours[e.hour] || 0) + 1; }); beaten += num(p.d.sos?.beaten); gave += num(p.d.sos?.gave); });
    const allDone = P.flatMap(doneDays);
    const cravingByDay = new Array(21).fill(0).map(() => [0, 0]);
    P.forEach(p => Object.entries(p.d.log || {}).forEach(([k, l]) => { const m = /d(\d+)$/.exec(k); if (m && l.done && l.craving != null) { const i = +m[1] - 1; if (cravingByDay[i]) { cravingByDay[i][0] += l.craving; cravingByDay[i][1]++; } } }));
    const reach = n => started.filter(p => (p.d.cycle > 1) || doneDays(p).length >= n).length;
    const walkMet = P.reduce((a, p) => a + Object.entries(p.d.move || {}).filter(([k, m]) => { const mm = /^c(\d)d(\d+)$/.exec(k); const ex = mm && A.exDay(+mm[1], +mm[2]); return ex && m.walk >= ex.walk; }).length, 0);
    return {
      users: P.length, onboarded: started.length,
      new7: P.filter(p => now - Date.parse(p.created) < 7 * day).length,
      active7: P.filter(p => now - Date.parse(p.updated) < 7 * day).length,
      active1: P.filter(p => now - Date.parse(p.updated) < day).length,
      days: allDone.length, slipsLot: allDone.filter(l => l.slip === 'lot').length, slipsBit: allDone.filter(l => l.slip === 'bit').length,
      cycles: count(started, p => 'دوره‌ی ' + fa(p.d.cycle || 1)),
      levels: count(started, p => ({ gentle: 'ملایم', steady: 'متوسط', full: 'کامل' })[p.d.profile.level] || '-'),
      triggers: count(started, p => (p.d.profile.trigger || []).map(t => ({ stress: 'استرس', bored: 'بی‌حوصلگی', meal: 'بعد از غذا', tea: 'کنار چای', tired: 'خستگی', social: 'مهمونی', period: 'قبل از پریود' })[t] || t)),
      goals: count(started, p => (p.d.profile.goal || []).map(g => ({ weight: 'کاهش وزن', skin: 'پوست و مو', pcos: 'تخمدان پلی‌کیستیک', insulin: 'مقاومت به انسولین', energy: 'انرژی', teeth: 'دندان', control: 'کنترل' })[g] || g)),
      hours, beaten, gave, cravingByDay: cravingByDay.map(([s, n]) => n ? s / n : null),
      funnel: [1, 3, 7, 14, 21].map(d => [d, reach(d)]),
      walkMet, push: report?.push || 0,
      assess: [0, 21, 42, 63].map(k => { const v = P.map(p => p.d.fb_assess?.[k]?.a).filter(a => Array.isArray(a) && a.length); return [k, v.length, v.length ? v.reduce((t, a) => t + a.reduce((x, y) => x + (+y || 0), 0) / a.length, 0) / v.length : null]; }),
    };
  }
  const bars = (obj, color = 'var(--mint)') => { const e = Object.entries(obj).sort((a, b) => b[1] - a[1]); const mx = Math.max(1, ...e.map(x => x[1])); return e.length ? e.map(([k, v]) => `<div class="hbar"><span>${esc(k)}</span><div class="progress"><i style="width:${v / mx * 100}%;background:${color}"></i></div><b class="num">${fa(v)}</b></div>`).join('') : '<p class="small muted">هنوز داده‌ای نیست.</p>'; };
  function reportsView() {
    if (reportErr) return `<div class="card">گزارش بارگذاری نشد: ${esc(reportErr)}</div>`;
    if (!report) return `<div class="card">در حال بارگذاری گزارش…</div>`;
    const R = analyze(report.profiles || []);
    const tiles = [['کاربر', R.users], ['برنامه رو شروع کردن', R.onboarded], ['ثبت‌نام ۷ روز اخیر', R.new7], ['فعال ۷ روز اخیر', R.active7], ['فعال امروز', R.active1], ['روزهای کامل‌شده', R.days], ['هوس‌های ردشده', R.beaten], ['دستگاه با اعلان', R.push]];
    const mxH = Math.max(1, ...R.hours);
    const pts = R.cravingByDay.map((v, i) => v == null ? null : [14 + i * 13.5, 110 - v / 4 * 90]).filter(Boolean);
    return `<div class="stack" style="gap:16px"><div class="kpis">${tiles.map(([t, v]) => `<div class="card kpi"><b class="display num">${fa(v)}</b><span class="small muted">${t}</span></div>`).join('')}</div>
      <div class="two">
        <div class="card stack"><b>ماندگاری: چند نفر به این روز رسیدن</b>${R.funnel.map(([d, n]) => `<div class="hbar"><span>روز ${fa(d)}</span><div class="progress"><i style="width:${R.onboarded ? n / R.onboarded * 100 : 0}%"></i></div><b class="num">${fa(n)}</b></div>`).join('')}</div>
        <div class="card stack"><b>میانگین شدت هوس در روزهای دوره (۰ تا ۴)</b>
          <svg viewBox="0 0 300 130" class="chart" role="img" aria-label="میانگین شدت هوس">${[0, 1, 2, 3, 4].map(v => `<line x1="14" x2="286" y1="${110 - v / 4 * 90}" y2="${110 - v / 4 * 90}" stroke="var(--line)"/><text x="6" y="${113 - v / 4 * 90}" font-size="9" fill="var(--ink-soft)">${fa(v)}</text>`).join('')}
          ${pts.length > 1 ? `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--berry)" stroke-width="2.5"/>` : ''}${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--berry)"/>`).join('')}
          ${[1, 7, 14, 21].map(d => `<text x="${14 + (d - 1) * 13.5}" y="126" font-size="9" fill="var(--ink-soft)" text-anchor="middle">روز ${fa(d)}</text>`).join('')}</svg>
          ${pts.length ? '' : '<p class="small muted">هنوز چک‌لیستی ثبت نشده.</p>'}</div>
      </div>
      <div class="card stack"><b>هوس‌ها در ساعت‌های روز</b><div class="hours">${R.hours.map((v, h) => `<div title="ساعت ${fa(h)}: ${fa(v)}"><i style="height:${v / mxH * 100}%"></i><span>${h % 3 ? '' : fa(h)}</span></div>`).join('')}</div>
        <p class="small muted">${fa(R.beaten)} بار هوس رد شده و ${fa(R.gave)} بار تسلیم. از ${fa(R.days)} روز کامل‌شده، ${fa(R.slipsLot)} روز لغزش زیاد و ${fa(R.slipsBit)} روز لغزش کم داشتن.</p></div>
      <div class="three">
        <div class="card stack"><b>محرک‌های هوس</b>${bars(R.triggers, 'var(--berry)')}</div>
        <div class="card stack"><b>هدف کاربرها</b>${bars(R.goals, 'var(--lav)')}</div>
        <div class="card stack"><b>سطح و دوره</b>${bars(R.levels)}${bars(R.cycles, 'var(--sun)')}<p class="small muted">${fa(R.walkMet)} روز هدف پیاده‌روی کامل شده.</p></div>
      </div>
      <div class="card stack"><b>ارزیابی دوره‌ای علائم (میانگین ۱ تا ۵)</b>${R.assess.map(([k, n, avg]) => `<div class="hbar"><span>روز ${fa(k)}، ${fa(n)} نفر</span><div class="progress"><i style="width:${avg ? avg / 5 * 100 : 0}%;background:var(--lav)"></i></div><b class="num">${avg ? fa(avg.toFixed(1)) : '-'}</b></div>`).join('')}<p class="small muted">میانگین جواب‌های ۸ سؤال ارزیابی در هر نقطه‌ی برنامه.</p></div></div>`;
  }

  /* users */
  function userRows() {
    const q = userQuery.trim().toLowerCase();
    return (report?.profiles || []).filter(p => !q || (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q))
      .map(p => { const d = p.data || {}; const done = Object.values(d.log || {}).filter(l => l.done).length; return { name: p.name || '', email: p.email || '', created: (p.created || '').slice(0, 10), updated: (p.updated || '').slice(0, 10), cycle: num(d.cycle) || 1, day: num(d.day) || 1, done, level: String(d.profile?.level || '-'), beaten: num(d.sos?.beaten) }; })
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }
  function usersView() {
    if (reportErr) return `<div class="card">${esc(reportErr)}</div>`;
    if (!report) return `<div class="card">در حال بارگذاری…</div>`;
    const rows = userRows();
    return `<div class="card stack"><div class="row" style="justify-content:space-between"><input class="input" id="uq" placeholder="جستجوی اسم یا ایمیل" value="${esc(userQuery)}" style="max-width:320px"><div class="row"><span class="small muted">${fa(rows.length)} کاربر</span><button class="btn ghost" id="csv">خروجی CSV</button></div></div>
      <div class="table-wrap"><table class="tbl"><thead><tr><th>اسم</th><th>ایمیل</th><th>ثبت‌نام</th><th>آخرین فعالیت</th><th>دوره / روز</th><th>روز کامل</th><th>سطح</th><th>هوس ردشده</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td>${esc(r.name)}</td><td dir="ltr">${esc(r.email)}</td><td class="num">${fa(r.created)}</td><td class="num">${fa(r.updated)}</td><td class="num">${fa(r.cycle)} / ${fa(r.day)}</td><td class="num">${fa(r.done)}</td><td>${esc(({ gentle: 'ملایم', steady: 'متوسط', full: 'کامل' })[r.level] || r.level)}</td><td class="num">${fa(r.beaten)}</td></tr>`).join('')}
      </tbody></table></div><textarea id="csvout" class="input" rows="4" hidden readonly dir="ltr"></textarea></div>`;
  }
  function mountUsers() {
    const q = $('#uq'); if (!q) return;
    q.oninput = () => { userQuery = q.value; const pos = q.selectionStart; A.render(); const n = $('#uq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
    $('#csv').onclick = () => {
      const rows = userRows(); const head = ['name', 'email', 'created', 'updated', 'cycle', 'day', 'done', 'level', 'cravings_beaten'];
      const csv = [head.join(','), ...rows.map(r => [r.name, r.email, r.created, r.updated, r.cycle, r.day, r.done, r.level, r.beaten].map(v => `"${String(v).replace(/^[=+\-@\t\r]/, "'$&").replace(/"/g, '""')}"`).join(','))].join('\n');
      try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'uzhu-users.csv'; a.click(); } catch (e) {}
      const t = $('#csvout'); t.hidden = false; t.value = csv; t.select();
      navigator.clipboard?.writeText(csv).then(() => A.toast('فایل CSV ساخته و در کلیپ‌بورد هم کپی شد.', 'bell'), () => {});
    };
  }

  /* content */
  const lines = a => (a || []).join('\n');
  const unlines = t => String(t || '').split('\n').map(x => x.trim()).filter(Boolean);
  const fld = (id, l, v) => `<div class="field"><label for="${id}">${l}</label><input class="input" id="${id}" value="${esc(v || '')}"></div>`;
  const area = (id, l, v, rows) => `<div class="field"><label for="${id}">${l}</label><textarea class="input" id="${id}" rows="${rows}">${esc(v || '')}</textarea></div>`;
  const val = id => ($('#' + id)?.value || '').trim();
  function contentView() {
    const k = contentSel.kind;
    const kinds = [['day', 'متن روزها'], ['recipe', 'رسپی‌ها'], ['article', 'مقاله‌ها'], ['quotes', 'جمله‌های انگیزشی'], ['sos', 'تمرین‌های هوس']];
    let picker = '', form = '';
    if (k === 'day') {
      picker = `<select class="input" id="pick" style="max-width:420px">${PROGRAM.cycles.map(c => c.days.map(d => `<option value="c${c.id}d${d.day}" ${contentSel.id === `c${c.id}d${d.day}` ? 'selected' : ''}>دوره‌ی ${fa(c.id)}، روز ${fa(d.day)}: ${esc(d.title)}</option>`).join('')).join('')}</select>`;
      const m = /^c(\d)d(\d+)$/.exec(contentSel.id) || [0, 1, 1]; const d = PROGRAM.cycles.find(c => c.id === +m[1])?.days[+m[2] - 1] || {};
      form = `${fld('f-title', 'عنوان', d.title)}${fld('f-technique', 'تکنیک', d.technique)}${area('f-read', 'متن روز (هر پاراگراف یک خط)', lines(d.read), 8)}${area('f-mission', 'مأموریت', d.mission, 2)}${area('f-tip', 'نکته‌ی علمی', d.tip, 2)}${area('f-tasks', 'کارهای چک‌لیست شب (هر کدوم یک خط)', lines(d.tasks), 5)}${fld('f-reflect', 'سؤال شب', d.reflect)}${area('f-reminders', 'یادآورها (هر خط: ساعت | متن)', (d.reminders || []).map(r => `${r.time} | ${r.text}`).join('\n'), 4)}`;
    } else if (k === 'recipe') {
      picker = `<select class="input" id="pick" style="max-width:420px">${RECIPES.map(r => `<option value="${esc(r.id)}" ${contentSel.id === r.id ? 'selected' : ''}>${esc(r.title)}</option>`).join('')}<option value="__new" ${contentSel.id === '__new' ? 'selected' : ''}>+ رسپی تازه</option></select>`;
      const r = RECIPES.find(x => x.id === contentSel.id) || {};
      form = `${contentSel.id === '__new' ? fld('f-id', 'شناسه‌ی انگلیسی (مثلاً date-cookies)', '') : ''}${fld('f-title', 'عنوان', r.title)}${fld('f-category', 'دسته (کیک، دسر، میان‌وعده، نوشیدنی، صبحانه)', r.category || 'دسر')}${fld('f-time', 'زمان', r.time)}${fld('f-difficulty', 'سختی', r.difficulty)}${fld('f-serves', 'برای چند نفر', r.serves)}${area('f-intro', 'معرفی', r.intro, 2)}${area('f-ingredients', 'مواد (هر کدوم یک خط)', lines(r.ingredients), 6)}${area('f-steps', 'مراحل (هر کدوم یک خط)', lines(r.steps), 6)}${area('f-tip', 'نکته', r.tip, 2)}
        <div class="field"><label for="f-svgFrom">تصویر</label><select class="input" id="f-svgFrom"><option value="">${contentSel.id === '__new' ? 'تصویر پیش‌فرض' : 'همون تصویر فعلی'}</option>${RECIPES.map(x => `<option value="${esc(x.id)}">مثل تصویر «${esc(x.title)}»</option>`).join('')}</select></div>`;
    } else if (k === 'article') {
      picker = `<select class="input" id="pick" style="max-width:420px">${ARTICLES.articles.map(a => `<option value="${esc(a.id)}" ${contentSel.id === a.id ? 'selected' : ''}>${esc(a.title)}</option>`).join('')}<option value="__new" ${contentSel.id === '__new' ? 'selected' : ''}>+ مقاله‌ی تازه</option></select>`;
      const a = ARTICLES.articles.find(x => x.id === contentSel.id) || {};
      form = `${contentSel.id === '__new' ? fld('f-id', 'شناسه‌ی انگلیسی', '') : ''}${fld('f-title', 'عنوان', a.title)}${area('f-summary', 'خلاصه', a.summary, 2)}${area('f-html', 'متن (HTML ساده: p, h3, ul, li, b)', a.html, 12)}`;
    } else {
      const items = k === 'quotes' ? PROGRAM.quotes : PROGRAM.sos.map(x => `${x.title} | ${x.text} | ${x.seconds || 60}`);
      form = area('f-items', k === 'quotes' ? 'هر جمله یک خط' : 'هر خط: عنوان | متن | ثانیه', lines(items), 14);
    }
    const hideable = (k === 'recipe' || k === 'article') && contentSel.id !== '__new';
    return `<div class="card stack"><div class="filters">${kinds.map(([kk, t]) => `<button data-kind="${kk}" class="${k === kk ? 'on' : ''}">${t}</button>`).join('')}</div>
      ${picker}<form id="cf" class="stack">${form}<div class="row"><button class="btn primary" type="submit">ذخیره و انتشار</button>${hideable ? `<button class="btn ghost" type="button" id="hide">پنهان کردن</button>` : ''}<button class="btn ghost" type="button" id="revert">برگشت به نسخه‌ی اصلی</button></div></form>
      <p class="small muted">تغییرها برای همه‌ی کاربرها اعمال می‌شه.</p></div>`;
  }
  function mountContent() {
    $$('[data-kind]').forEach(b => b.onclick = () => { const k = b.dataset.kind; contentSel = { kind: k, id: k === 'day' ? 'c1d1' : k === 'recipe' ? RECIPES[0]?.id : k === 'article' ? ARTICLES.articles[0]?.id : k }; A.render(); });
    const pick = $('#pick'); if (pick) pick.onchange = () => { contentSel.id = pick.value; A.render(); };
    const k = contentSel.kind;
    $('#cf').onsubmit = async e => {
      e.preventDefault();
      let id = contentSel.id, kind = k, data;
      if (k === 'day') data = { title: val('f-title'), technique: val('f-technique'), read: unlines(val('f-read')), mission: val('f-mission'), tip: val('f-tip'), tasks: unlines(val('f-tasks')), reflect: val('f-reflect'), reminders: unlines(val('f-reminders')).map(l => { const [t, ...x] = l.split('|'); return { time: t.trim(), text: x.join('|').trim() }; }).filter(r => /^\d\d:\d\d$/.test(r.time)) };
      else if (k === 'recipe') { if (id === '__new') id = val('f-id').replace(/[^a-z0-9-]/gi, '').toLowerCase(); data = { title: val('f-title'), category: val('f-category'), time: val('f-time'), difficulty: val('f-difficulty'), serves: val('f-serves'), intro: val('f-intro'), ingredients: unlines(val('f-ingredients')), steps: unlines(val('f-steps')), tip: val('f-tip') }; if (val('f-svgFrom')) data.svgFrom = val('f-svgFrom'); }
      else if (k === 'article') { if (id === '__new') id = val('f-id').replace(/[^a-z0-9-]/gi, '').toLowerCase(); data = { title: val('f-title'), summary: val('f-summary'), html: val('f-html') }; }
      else { kind = 'list'; data = { items: k === 'quotes' ? unlines(val('f-items')) : unlines(val('f-items')).map(l => { const [t, x, sec] = l.split('|').map(s => s.trim()); return { title: t, text: x || '', seconds: +sec || 60 }; }) }; }
      if (!id) return A.toast('یک شناسه‌ی انگلیسی بنویس.', 'bell');
      if ((k === 'recipe' || k === 'article') && !data.title) return A.toast('عنوان خالیه.', 'bell');
      try { await STORE.saveContent(kind, id, data, false); applyContent([{ kind, id, data, hidden: false }]); contentSel.id = kind === 'list' ? k : id; A.toast('ذخیره و منتشر شد.', 'bell'); A.render(); }
      catch (er) { A.toast('ذخیره نشد: ' + er.message, 'bell'); }
    };
    const hide = $('#hide'); if (hide) hide.onclick = async () => { try { await STORE.saveContent(k, contentSel.id, {}, true); applyContent([{ kind: k, id: contentSel.id, data: {}, hidden: true }]); contentSel.id = k === 'recipe' ? RECIPES[0]?.id : ARTICLES.articles[0]?.id; A.toast('پنهان شد.', 'bell'); A.render(); } catch (er) { A.toast(er.message, 'bell'); } };
    $('#revert').onclick = async () => {
      const kind = k === 'quotes' || k === 'sos' ? 'list' : k;
      try { await STORE.deleteContent(kind, contentSel.id); A.toast('به نسخه‌ی اصلی برگشت. از بارگذاری بعدی صفحه دیده می‌شه.', 'bell'); } catch (er) { A.toast(er.message, 'bell'); }
    };
  }

  /* settings */
  function settingsView() {
    const st = A.site.settings, ann = st.announcement || {}, df = st.defaults || {}, hero = st.hero || {}, msg = st.messages || {};
    return `<form id="sf" class="stack">
      <div class="card stack"><b>نوار اطلاع‌رسانی بالای سایت</b>
        <label class="check" for="s-ann-on"><input type="checkbox" id="s-ann-on" ${ann.on ? 'checked' : ''}><span>نمایش داده بشه</span></label>
        ${fld('s-ann-text', 'متن', ann.text)}${fld('s-ann-link', 'لینک (اختیاری، مثلاً #recipes)', ann.link)}
        <div class="field"><label for="s-ann-tone">رنگ</label><select class="input" id="s-ann-tone">${[['mint', 'سبز'], ['sun', 'زرد'], ['berry', 'صورتی'], ['lav', 'بنفش']].map(([v, t]) => `<option value="${v}" ${ann.tone === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
      ${brandCard(st.brand || {})}
      <div class="card stack"><b>بخش‌ها و ویژگی‌ها</b><p class="small muted">هر کدوم رو خاموش کنی، برای همه‌ی کاربرها پنهان می‌شه.</p>
        <div class="feat-grid">${FEATURES.map(([k, t]) => `<label class="check" for="s-f-${k}"><input type="checkbox" id="s-f-${k}" ${on(k) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div></div>
      <div class="card stack"><b>ساعت‌های پیش‌فرض یادآور برای کاربرهای تازه</b><div class="row">${['صبح', 'ظهر', 'عصر', 'شب'].map((t, i) => `<label class="small">${t}<br><input class="input" type="time" id="s-t${i}" value="${(df.times || ['09:00', '13:00', '16:30', '21:30'])[i]}" style="width:auto"></label>`).join('')}<label class="small">ورزش<br><input class="input" type="time" id="s-mt" value="${df.moveTime || '18:00'}" style="width:auto"></label></div></div>
      <div class="card stack"><b>متن‌های صفحه‌ی اول</b>${fld('s-hero-title', 'تیتر اصلی (خالی یعنی پیش‌فرض)', hero.title)}${area('s-hero-lead', 'متن زیر تیتر', hero.lead, 3)}${area('s-footer', 'متن پایین صفحه', st.footer, 2)}</div>
      <div class="card stack"><b>پیام‌ها</b>${area('s-msg-m', 'پیام‌های صبح (هر کدوم یک خط)', lines(msg.morning), 4)}${area('s-msg-e', 'پیام‌های شب (هر کدوم یک خط)', lines(msg.evening), 4)}${area('s-coach', 'یادداشت مربی برای همه (در بازخورد دوره دیده می‌شه)', st.coach?.text, 3)}</div>
      <div class="card stack"><b>جایگزین‌های اضافه</b>${area('s-swaps', 'هر خط: به‌جای | بخور | توضیح', (st.swaps || []).map(s => `${s.from} | ${s.to} | ${s.note || ''}`).join('\n'), 4)}</div>
      <div class="row"><button class="btn primary big" type="submit">ذخیره‌ی تنظیمات</button></div></form>
      <div class="card stack" id="adm-box" style="margin-top:16px"><b>👥 ادمین‌ها</b><p class="small muted">هر کسی که اینجا اضافه بشه، بعد از ورود با همین ایمیل (ایمیلِ تأییدشده) به این پنل دسترسی داره.</p><div id="adm-list" class="stack" style="gap:6px"><span class="small muted">در حال بارگذاری…</span></div>
        <div class="row"><input class="input" id="adm-new" type="email" dir="ltr" placeholder="email@example.com" aria-label="ایمیل ادمین تازه" style="flex:1;min-width:200px"><button class="btn ghost" type="button" id="adm-add">افزودن ادمین</button></div></div>`;
  }
  // Logo choice (img/logos) and the site-wide default theme; every visitor sees these unless they picked their own theme.
  const LOGOS = [[0, 'حَبه'], [1, 'بغلِ گرم'], [2, 'استکانِ جوونه'], [3, 'پسته‌ی خندون'], [4, 'حلقه‌ی ۲۱ روزه'], [5, 'انارِ دل'], [6, 'صبحِ تازه']];
  function brandCard(b) {
    const S = A.season, cur = Number(b.logo) || 0;
    const themes = S ? [['', 'خودکار (بر اساس فصل و مناسبت)'], ...S.ORDER.map(k => [k, S.T[k].label]), ['plain', 'ساده (بدون تم)']] : [];
    return `<div class="card stack"><b>🎨 ظاهر سایت</b>
      <span class="small muted">لوگو (بالای صفحه و آیکون مرورگر)</span>
      <div class="brand-logos" role="radiogroup" aria-label="لوگو">${LOGOS.map(([n, t]) => `<label class="brand-logo"><input type="radio" name="s-logo" value="${n}" ${cur === n ? 'checked' : ''}><span class="bl-art">${n ? `<img src="img/logos/icon-${n}.svg" alt="" width="56" height="56">` : '<img src="img/icon.svg" alt="" width="56" height="56">'}</span><span class="small">${t}</span></label>`).join('')}</div>
      ${themes.length ? `<div class="field"><label for="s-theme">تم پیش‌فرض سایت</label><select class="input" id="s-theme">${themes.map(([k, t]) => `<option value="${k}" ${(b.theme || '') === k ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><span class="small muted">هر کاربر هنوز می‌تونه از تنظیمات خودش تم دیگه‌ای انتخاب کنه.</span></div>` : ''}</div>`;
  }
  function mountSettings() {
    const box = $('#adm-list'), drawAdmins = async () => {
      let list; try { list = await STORE.admins(); } catch (e) { box.innerHTML = `<span class="small muted">${esc(e.message)}</span>`; return; }
      if (!list) { box.innerHTML = '<span class="small muted">در نسخه‌ی آزمایشی (بدون سرور)، اولین حسابی که روی این مرورگر ساخته شده ادمینه.</span>'; $('#adm-add').disabled = true; return; }
      const me = (A.user?.email || '').toLowerCase();
      box.innerHTML = list.map(e => `<div class="row" style="justify-content:space-between"><span dir="ltr">${esc(e)}</span>${e === me ? '<span class="chip">خودت</span>' : `<button class="btn ghost" type="button" data-adm-del="${esc(e)}">حذف</button>`}</div>`).join('');
      $$('[data-adm-del]', box).forEach(b => b.onclick = async () => { try { await STORE.removeAdmin(b.dataset.admDel); A.toast('حذف شد.', 'bell'); drawAdmins(); } catch (e) { A.toast(e.message, 'bell'); } });
    };
    $('#adm-add').onclick = async () => { const e = val('adm-new'); if (!e) return; try { await STORE.addAdmin(e); $('#adm-new').value = ''; A.toast('ادمین اضافه شد. باید با همین ایمیل ثبت‌نام و ایمیلش رو تأیید کنه.', 'bell'); drawAdmins(); } catch (er) { A.toast(er.message, 'bell'); } };
    drawAdmins();
    $('#sf').onsubmit = async e => {
      e.preventDefault();
      const next = {
        announcement: { on: $('#s-ann-on').checked, text: val('s-ann-text'), link: val('s-ann-link'), tone: val('s-ann-tone') },
        features: Object.fromEntries(FEATURES.map(([k]) => [k, $('#s-f-' + k).checked])),
        defaults: { times: [0, 1, 2, 3].map(i => val('s-t' + i)), moveTime: val('s-mt') },
        hero: { title: val('s-hero-title'), lead: val('s-hero-lead') },
        footer: val('s-footer'),
        messages: { morning: unlines(val('s-msg-m')), evening: unlines(val('s-msg-e')) },
        coach: { text: val('s-coach') },
        brand: { logo: Number($('input[name=s-logo]:checked')?.value || 0), theme: $('#s-theme') ? val('s-theme') : (A.site.settings.brand?.theme || '') },
        swaps: unlines(val('s-swaps')).map(l => { const [from, to, note] = l.split('|').map(s => s.trim()); return { from, to, note }; }).filter(s => s.from && s.to),
      };
      try {
        for (const [key, value] of Object.entries(next)) await STORE.setSetting(key, value);
        A.site.settings = Object.assign({}, A.site.settings, next);
        A.toast('تنظیمات ذخیره و برای همه منتشر شد.', 'bell'); A.render();
      } catch (er) { A.toast('ذخیره نشد: ' + er.message, 'bell'); }
    };
  }

  /* broadcast */
  function broadcastView() {
    return `<form id="bf" class="card stack" style="max-width:620px"><b>فرستادن اعلان به همه‌ی کاربرها</b>
      <p class="small muted">به همه‌ی دستگاه‌هایی که اعلان رو فعال کردن فرستاده می‌شه (حداکثر تا ۵ دقیقه‌ی بعد). برای پیامی که توی خود سایت دیده بشه، از «نوار اطلاع‌رسانی» در تنظیمات سایت استفاده کن.</p>
      ${area('b-text', 'متن پیام', '', 3)}
      <div class="field"><label for="b-link">با زدن روی اعلان کجا باز بشه؟</label><select class="input" id="b-link">${[['#today', 'برنامه‌ی امروز'], ['#move', 'ورزش'], ['#night', 'چک‌لیست شب'], ['#recipes', 'رسپی‌ها'], ['#learn', 'علم قند'], ['#more', 'ابزارها']].map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></div>
      <div class="row"><button class="btn berry" type="submit">ارسال</button><button class="btn ghost" type="button" id="b-ok" hidden>بله، برای همه بفرست</button></div><p class="small" id="b-res"></p></form>`;
  }
  function mountBroadcast() {
    $('#bf').onsubmit = e => { e.preventDefault(); if (!val('b-text')) return A.toast('متن پیام خالیه.', 'bell'); $('#b-ok').hidden = false; $('#b-res').textContent = 'مطمئنی؟ این پیام برای همه‌ی کاربرها فرستاده می‌شه.'; };
    $('#b-ok').onclick = async () => {
      const text = val('b-text');
      try {
        const n = await STORE.broadcast(text, './' + $('#b-link').value);
        $('#b-res').textContent = STORE.mode === 'local' ? 'در نسخه‌ی آزمایشی پیام فقط اینجا نشون داده شد.' : `برای ${fa(n || 0)} دستگاه در صف ارسال قرار گرفت.`;
        if (STORE.mode === 'local') A.notify(text, 'bell');
        $('#b-ok').hidden = true; $('#b-text').value = '';
      } catch (er) { $('#b-res').textContent = 'ارسال نشد: ' + er.message; }
    };
  }
});
