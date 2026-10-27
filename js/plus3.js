/* Uzhu improvements round 4, part 1 (plugin P3): craving support (what's going on? + per-trigger plans, craving insights,
   early warning before the riskiest hour, reasons board with photos, 60-second game, hard-day mode, quick add), motivation
   (skipped-it savings, savings goal, separate targets, longest streak + consistency, sugar wall, next milestone, live counter,
   story card, welcome back, morning pledge, wins jar, journal) and app-wide UX (tools hub search/pins, accessibility, back to
   top, offline bar, haptics, PIN lock, keyboard shortcuts, CSV export). Numbers refer to research/improvements-100.md.
   State: A.D().p3 (account); photos, pins, PIN and haptics live on this device only (localStorage). Gated by feature keys. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const inApp = () => !!(A.user && A.D() && A.D().profile);
  const P = () => {
    const d = A.D(); const p = d.p3 = d.p3 || {};
    p.cr = p.cr || []; p.plans = p.plans || {}; p.reasons = p.reasons || []; p.skips = p.skips || []; p.targets = p.targets || [];
    p.pledge = p.pledge || {}; p.wins = p.wins || {}; p.journal = p.journal || []; p.hard = p.hard || {};
    return p;
  };
  const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const num = v => { const x = parseFloat(String(v || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٬,]/g, '').replace('٫', '.')); return isNaN(x) ? null : x; };
  const page = (eyebrow, title, sub, body, max = 860) => `<section class="wrap stack" style="gap:16px;max-width:${max}px">
    <div class="section-head" style="margin:0"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${body}</section>`;
  const off = () => `<section class="wrap"><div class="card stack" style="gap:8px;text-align:center"><b>این بخش فعلاً در دسترس نیست.</b><a class="btn ghost" href="#more">برگشت به ابزارها</a></div></section>`;
  const RKEY = { plans: ['plans'], cravings: ['cravings'], reasons: ['reasons'], save: ['skipped', 'savegoal'], targets: ['targets'], journal: ['journal'] };
  const route = (r, title, view, mount) => {
    const ok = () => (RKEY[r] || []).some(on) || !RKEY[r];
    A.views[r] = () => ok() ? view() : off(); A.mounts[r] = () => { if (ok() && mount) mount(); }; A.titles[r] = title; if (!A.appRoutes.includes(r)) A.appRoutes.push(r);
  };
  const tool = (route, icon, title, desc, key) => A.tools.push({ route, icon, title, desc, show: () => on(key) });
  const rerender = () => { const y = scrollY; A.render(); scrollTo(0, y); };
  const today = () => A.dateKey();
  const daysSince = k => A.dayDiff(k, today());
  const buzz = (ms = 15) => { try { if (ls.get('uzhu:haptics', true) && on('haptics') && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const userKey = () => (A.user && A.user.email) || 'guest';

  // Feature keys for the admin panel's on/off list (admin.js reads A.moreFeatures).
  A.moreFeatures = (A.moreFeatures || []).concat([
    ['halt', 'هوس: «چی شده؟» پیش از کمک'], ['plans', 'نقشه‌ی هر محرک'], ['cravings', 'بینش هوس‌ها'], ['precrave', 'یادآور پیش از ساعت پرخطر'], ['reasons', 'تابلوی دلیل‌های من'],
    ['sosgame', 'بازی ۶۰ ثانیه‌ای هوس'], ['hardday', 'حالت روز سخت'], ['quickadd', 'دکمه‌ی ثبت سریع'], ['skipped', '«نخریدمش!»'], ['savegoal', 'هدف پس‌انداز'],
    ['targets', 'هدف‌های جدا'], ['consistency', 'رکورد و نمره‌ی ثبات'], ['sugarwall', 'دیوار حبه‌قند'], ['milestone', 'نقطه‌ی عطف بعدی'], ['livecount', 'شمارنده‌ی زنده'],
    ['story', 'کارت استوری'], ['welcome', 'خوش‌آمد پس از غیبت'], ['pledge', 'پیمان صبح'], ['wins', 'شیشه‌ی بردها'], ['journal', 'دفترچه‌ی یادداشت'],
    ['toolsearch', 'جست‌وجو و سنجاق ابزارها'], ['a11y2', 'پرش به محتوا و اعلام صفحه'], ['totop', 'دکمه‌ی برگشت به بالا'], ['offline', 'نشانگر آفلاین'], ['haptics', 'لرزش کوتاه'],
    ['pinlock', 'قفل با رمز'], ['hotkeys', 'میانبرهای صفحه‌کلید'], ['csv', 'خروجی CSV'],
  ]);

  /* ================= 1–2. what's going on? + a plan for each trigger ================= */
  const TRIG = [
    ['hungry', '🍽', 'گرسنه‌ام', 'واقعاً گرسنه‌ای. یه میان‌وعده‌ی واقعی بخور: یه مشت مغز، تخم‌مرغ آب‌پز یا ماست با گردو.'],
    ['angry', '😤', 'کلافه یا عصبانی', 'دو دقیقه برو بیرون از اتاق، آب سرد به صورتت بزن و ۱۰ نفس آروم بکش.'],
    ['lonely', '🫥', 'تنهام', 'به یه دوست پیام بده یا زنگ بزن. شیرینی جای آدم‌ها رو پر نمی‌کنه.'],
    ['tired', '😴', 'خسته‌ام', 'خستگی شبیه هوسه. یه لیوان آب، ۱۰ دقیقه چشم‌بستن یا پنج دقیقه هوای تازه.'],
    ['bored', '🥱', 'حوصله‌ام سر رفته', 'یه کار ۵ دقیقه‌ای با دست‌هات: مرتب کردن یه کشو، آب دادن گلدون یا یه قدم‌زدن کوتاه.'],
    ['stress', '😰', 'استرس دارم', 'تنفس ۴-۷-۸ رو چهار بار انجام بده و بنویس دقیقاً نگران چی هستی.'],
    ['saw', '👀', 'شیرینی دیدم', 'از جلوی چشمت دورش کن یا خودت از اونجا دور شو. هوسِ دیدنی زودتر از بقیه می‌خوابه.'],
    ['habit', '⏰', 'ساعتش بود (عادت)', 'همین ساعت رو با یه کار تازه پر کن: چای دارچین بی‌قند، یه میوه یا یه پیاده‌روی کوتاه.'],
  ];
  const PLACES = [['home', '🏠', 'خونه'], ['work', '💼', 'سر کار یا دانشگاه'], ['out', '🚶', 'بیرون'], ['party', '🎉', 'مهمونی']];
  const trigName = id => (TRIG.find(t => t[0] === id) || [, '', id])[2];
  const planFor = id => (P().plans[id] || '').trim() || (TRIG.find(t => t[0] === id) || [])[3] || '';

  function openCraving() {
    if (!inApp()) return A.openSOS();
    if (!on('halt')) return openSOSPlus([]);
    let trig = [], place = '';
    A.modal(`<div class="stack p3-halt" style="gap:14px"><span class="eyebrow">هوس شیرینی؟</span><h2>الان چی شده؟</h2>
      <p class="small muted">دو ضربه کافیه. اینطوری کم‌کم می‌فهمی هوس‌هات از کجا میان. می‌تونی رد هم بشی.</p>
      <div class="p3-chips" role="group" aria-label="حال تو">${TRIG.map(([k, i, t]) => `<button type="button" class="p3-chip" data-t="${k}" aria-pressed="false"><span>${i}</span>${t}</button>`).join('')}</div>
      <b class="small">کجایی؟</b>
      <div class="p3-chips" role="group" aria-label="کجایی">${PLACES.map(([k, i, t]) => `<button type="button" class="p3-chip" data-p="${k}" aria-pressed="false"><span>${i}</span>${t}</button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn primary big" id="p3go">بریم ردش کنیم</button><button class="btn ghost" id="p3skip">رد شو</button></div></div>`, (m, close) => {
      $$('[data-t]', m).forEach(b => b.onclick = () => { const k = b.dataset.t; trig = trig.includes(k) ? trig.filter(x => x !== k) : [...trig, k]; b.setAttribute('aria-pressed', trig.includes(k)); buzz(8); });
      $$('[data-p]', m).forEach(b => b.onclick = () => { place = place === b.dataset.p ? '' : b.dataset.p; $$('[data-p]', m).forEach(x => x.setAttribute('aria-pressed', x.dataset.p === place)); buzz(8); });
      $('#p3go', m).onclick = () => { if (trig.length || place) { P().cr.push({ t: Date.now(), hour: new Date().getHours(), dow: new Date().getDay(), trig, place }); P().cr = P().cr.slice(-300); A.save(); } close(); openSOSPlus(trig); };
      $('#p3skip', m).onclick = () => { close(); openSOSPlus([]); };
    });
  }
  // The core SOS sheet, plus: the plan for the chosen trigger, one of the person's reasons and the 60-second game.
  function openSOSPlus(trig) {
    A.openSOS();
    const sheet = $$('.modal .sheet').pop(); if (!sheet) return;
    const box = sheet.querySelector('.stack') || sheet;
    let html = '';
    const t = trig.find(k => planFor(k));
    if (t && on('plans')) html += `<div class="card stack p3-plan" style="text-align:start;gap:4px"><b>نقشه‌ی تو برای «${esc(trigName(t))}»:</b><p>${esc(planFor(t))}</p></div>`;
    const rs = P().reasons.filter(r => r.text);
    if (rs.length && on('reasons')) { const r = A.pick(rs), ph = photo(r.id); html += `<div class="card p3-reason-sos" style="text-align:start">${ph ? `<img src="${ph}" alt="">` : ''}<div><b>یکی از دلیل‌هات:</b><p class="muted">«${esc(r.text)}»</p></div></div>`; }
    if (on('sosgame')) html += `<button class="btn sun" id="p3game" type="button">🎮 بازی ۶۰ ثانیه‌ای حواس‌پرتی</button>`;
    if (!html) return;
    const anchor = sheet.querySelector('.timer');
    const wrap = document.createElement('div'); wrap.className = 'stack p3-sos-extra'; wrap.style.gap = '10px'; wrap.innerHTML = html;
    if (anchor && anchor.nextElementSibling) anchor.nextElementSibling.after(wrap); else box.appendChild(wrap);
    const g = $('#p3game', sheet); if (g) g.onclick = () => openGame(g);
    const win = $('#win', sheet); if (win) win.addEventListener('click', () => buzz(30));
  }
  // Keyboard/hash entry: #sos (used by the app-icon shortcut) opens the craving flow.
  const sosHash = () => { if (location.hash === '#sos') { history.replaceState(null, '', '#' + (inApp() ? 'today' : 'home')); setTimeout(() => { A.render(); if (inApp()) openCraving(); }, 0); return true; } return false; };
  add('boot', () => {
    const b = $('#sos'); if (b) b.onclick = openCraving;
    if (location.hash === '#sos') history.replaceState(null, '', '#' + (inApp() ? 'today' : 'home')), setTimeout(() => inApp() && openCraving(), 400);
    addEventListener('hashchange', sosHash);
  });
  A.openCraving = openCraving;

  route('plans', 'نقشه‌ی هر محرک', () => page('اگر… آنگاه…', 'برای هر محرک، یک نقشه', 'وقتی هوس با یک حال مشخص میاد، از قبل بدون چی کار می‌کنی. در لحظه‌ی هوس، نقشه‌ی همون حال نشونت داده می‌شه.',
    `<form id="p3pf" class="stack" style="gap:10px">${TRIG.map(([k, i, t, d]) => `<div class="card stack" style="gap:6px"><label for="pl-${k}"><b>${i} اگر ${t}…</b> آنگاه:</label><textarea class="input" id="pl-${k}" rows="2" placeholder="${esc(d)}">${esc(P().plans[k] || '')}</textarea></div>`).join('')}
    <button class="btn primary big" type="submit">ذخیره‌ی نقشه‌ها</button></form><p class="small muted">اگه چیزی ننویسی، پیشنهاد خاکستری نشون داده می‌شه.</p>`, 720),
  () => { $('#p3pf').onsubmit = async e => { e.preventDefault(); TRIG.forEach(([k]) => { const v = $('#pl-' + k).value.trim(); if (v) P().plans[k] = v.slice(0, 300); else delete P().plans[k]; }); await A.save(); A.toast('نقشه‌ها ذخیره شد. دفعه‌ی بعد که هوس اومد، آماده‌ای.', 'brain'); }; });

  /* ================= 3–4. craving insights + early warning ================= */
  const sosEvents = () => (A.D().sos?.events || []).filter(e => e && e.t);
  // Join a "what's going on" entry with the SOS result logged within 40 minutes after it.
  const outcome = c => { const e = sosEvents().find(x => x.t >= c.t && x.t - c.t < 40 * 60e3); return e ? !!e.beaten : null; };
  function riskyHour() {
    const since = Date.now() - 45 * 864e5, ev = sosEvents().filter(e => e.t >= since);
    if (ev.length < 5) return null;
    const c = Array(24).fill(0); ev.forEach(e => c[e.hour]++);
    const mx = Math.max(...c); if (mx < 3) return null;
    return c.indexOf(mx);
  }
  const DOW = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const DOW_ORDER = [6, 0, 1, 2, 3, 4, 5];
  const BLOCKS = [[0, 6, 'نیمه‌شب'], [6, 10, 'صبح'], [10, 13, 'ظهر'], [13, 16, 'بعدازظهر'], [16, 19, 'عصر'], [19, 22, 'شب'], [22, 24, 'آخر شب']];
  route('cravings', 'بینش هوس‌ها', () => {
    const ev = sosEvents(), cr = P().cr;
    if (!ev.length && !cr.length) return page('بینش هوس‌ها', 'هنوز داده‌ای نیست', 'هر بار دکمه‌ی «هوس دارم» رو بزنی و بگی چی شده، اینجا الگوی هوس‌هات رو می‌بینی: چه روزی، چه ساعتی، با چه حالی.', `<button class="btn primary" id="p3try">الان هوس دارم</button>`, 720);
    const grid = DOW_ORDER.map(d => BLOCKS.map(([a, b]) => ev.filter(e => new Date(e.t).getDay() === d && e.hour >= a && e.hour < b).length));
    const mx = Math.max(1, ...grid.flat());
    const heat = `<div class="p3-heat" role="table" aria-label="تعداد هوس در هر روز و ساعت"><div role="row" class="p3-hr"><span></span>${BLOCKS.map(b => `<span role="columnheader">${b[2]}</span>`).join('')}</div>
      ${DOW_ORDER.map((d, i) => `<div role="row" class="p3-hr"><span role="rowheader">${DOW[d]}</span>${grid[i].map((n, j) => `<i role="cell" style="--a:${n / mx}" title="${DOW[d]}، ${BLOCKS[j][2]}: ${fa(n)} بار" aria-label="${fa(n)}">${n ? fa(n) : ''}</i>`).join('')}</div>`).join('')}</div>`;
    const tc = {}; cr.forEach(c => c.trig.forEach(t => { tc[t] = tc[t] || { n: 0, won: 0, known: 0 }; tc[t].n++; const o = outcome(c); if (o !== null) { tc[t].known++; if (o) tc[t].won++; } }));
    const tops = Object.entries(tc).sort((a, b) => b[1].n - a[1].n);
    const tmx = Math.max(1, ...tops.map(x => x[1].n));
    const pc = {}; cr.forEach(c => { if (c.place) pc[c.place] = (pc[c.place] || 0) + 1; });
    const h = riskyHour(), beaten = ev.filter(e => e.beaten).length;
    return page('بینش هوس‌ها', 'هوس‌های تو از کجا میان؟', `${fa(ev.length)} بار دکمه‌ی هوس رو زدی و ${fa(Math.round(beaten / Math.max(1, ev.length) * 100))}٪ مواقع ردش کردی.`,
      `<div class="card stack"><b>چه روزی، چه ساعتی؟</b>${heat}${h !== null ? `<p class="small">⏰ پرخطرترین ساعت تو حدود <b>${fa(A.pad(h))}:۰۰</b> است.${on('precrave') ? ' نیم ساعت قبلش یادآور می‌گیری.' : ''}</p>` : ''}</div>
      <div class="two"><div class="card stack"><b>با چه حالی؟</b>${tops.length ? tops.map(([k, v]) => `<div class="p3-bar"><span>${(TRIG.find(t => t[0] === k) || [])[1] || ''} ${esc(trigName(k))}</span><div class="progress"><i style="width:${v.n / tmx * 100}%;background:var(--berry)"></i></div><span class="small muted num">${fa(v.n)}${v.known ? ` · ${fa(Math.round(v.won / v.known * 100))}٪ رد شد` : ''}</span></div>`).join('') : '<p class="small muted">وقتی پیش از کمک بگی چی شده، اینجا پر می‌شه.</p>'}</div>
      <div class="card stack"><b>کجا؟</b>${Object.keys(pc).length ? PLACES.filter(p => pc[p[0]]).map(([k, i, t]) => `<div class="row small"><span>${i} ${t}</span><span class="chip num">${fa(pc[k])} بار</span></div>`).join('') : '<p class="small muted">هنوز ثبت نشده.</p>'}
      ${tops[0] && on('plans') ? `<div class="mission"><b>پیشنهاد:</b> بیشترین هوس‌هات وقتی میان که «${esc(trigName(tops[0][0]))}». <a href="#plans">برای همین حال یک نقشه بنویس</a>.</div>` : ''}</div></div>`);
  }, () => { const b = $('#p3try'); if (b) b.onclick = openCraving; });
  add('reminders', () => {
    if (!inApp() || !on('precrave')) return [];
    const h = riskyHour(); if (h === null) return [];
    return [{ time: A.addMin(`${A.pad(h)}:00`, -30), text: 'معمولاً حدود این ساعت هوس شیرینی میاد سراغت. از الان یه لیوان آب یا چای بی‌قند و یه میان‌وعده‌ی سیرکننده آماده کن 💪', spot: 'brain', url: '#cravings' }];
  });

  /* ================= 5. reasons board (photos stay on this device) ================= */
  const photos = () => ls.get('uzhu:p3photos:' + userKey(), {});
  const photo = id => photos()[id] || '';
  const setPhoto = (id, v) => { const p = photos(); if (v) p[id] = v; else delete p[id]; ls.set('uzhu:p3photos:' + userKey(), p); };
  function shrink(file, max = 360) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .72)); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      img.src = url;
    });
  }
  route('reasons', 'دلیل‌های من', () => {
    const rs = P().reasons;
    return page('تابلوی دلیل‌ها', 'چرا این مسیر رو شروع کردم؟', 'تا ۵ دلیل بنویس و اگه خواستی برای هر کدوم یک عکس بذار (بچه‌ات، لباسی که دوستش داری، جواب آزمایش…). وقتی هوس اومد، یکی از این‌ها جلوی چشمت میاد.',
      `<div class="p3-reasons">${rs.map(r => { const ph = photo(r.id); return `<div class="card p3-reason">${ph ? `<img src="${ph}" alt="عکس دلیل">` : '<div class="p3-ph">💚</div>'}<p>${esc(r.text)}</p>
        <div class="row"><label class="btn ghost p3-file">📷 ${ph ? 'عوض کردن عکس' : 'افزودن عکس'}<input type="file" accept="image/*" data-ph="${r.id}" hidden></label>${ph ? `<button class="btn ghost" data-rmph="${r.id}">حذف عکس</button>` : ''}<button class="btn ghost" data-rm="${r.id}" aria-label="حذف این دلیل">🗑</button></div></div>`; }).join('')}</div>
      ${rs.length < 5 ? `<form id="p3rf" class="card stack" style="gap:8px"><label for="p3rt"><b>یک دلیل تازه</b></label><textarea id="p3rt" class="input" rows="2" maxlength="200" placeholder="مثلاً: می‌خوام با بچه‌هام بدوم و نفس کم نیارم"></textarea><button class="btn primary" type="submit">افزودن</button></form>` : ''}
      ${A.D().profile?.why ? `<p class="small muted">دلیلی که اول برنامه نوشتی: «${esc(A.D().profile.why)}»</p>` : ''}
      <p class="small muted">🔒 عکس‌ها فقط روی همین دستگاه می‌مونن و جایی فرستاده نمی‌شن.</p>`, 860);
  }, () => {
    const f = $('#p3rf'); if (f) f.onsubmit = async e => { e.preventDefault(); const t = $('#p3rt').value.trim(); if (!t) return; P().reasons.push({ id: 'r' + Date.now().toString(36), text: t.slice(0, 200) }); await A.save(); rerender(); };
    $$('[data-rm]').forEach(b => b.onclick = async () => { setPhoto(b.dataset.rm, null); P().reasons = P().reasons.filter(r => r.id !== b.dataset.rm); await A.save(); rerender(); });
    $$('[data-rmph]').forEach(b => b.onclick = () => { setPhoto(b.dataset.rmph, null); rerender(); });
    $$('[data-ph]').forEach(i => i.onchange = async () => { const f = i.files[0]; if (!f) return; try { setPhoto(i.dataset.ph, await shrink(f)); rerender(); } catch (e) { A.toast('این عکس باز نشد. یک عکس دیگه امتحان کن.'); } });
  });

  /* ================= 6. 60-second distraction game ================= */
  // Runs inline inside the SOS sheet (a second dialog would close together with it on Escape).
  function openGame(host) {
    const box = document.createElement('div'); box.className = 'stack p3-gamebox'; box.style.cssText = 'gap:10px;text-align:center';
    box.innerHTML = `<b>🎮 ۶۰ ثانیه، فقط حبه‌قندها رو بترکون</b><div class="row" style="justify-content:center;gap:18px"><span>⏱ <b class="num" id="p3gt">۶۰</b></span><span>🎯 <b class="num" id="p3gs">۰</b></span></div>
      <div class="p3-field" id="p3gf" aria-label="زمین بازی"></div><p class="small muted" id="p3gm">روی هر حبه‌قند بزن تا بترکه. تا تموم شدن بازی، هوس هم آروم‌تر شده.</p>`;
    host.replaceWith(box); box.scrollIntoView({ block: 'center' });
    const f = $('#p3gf', box); let score = 0, left = 60, alive = true;
    const stop = () => { alive = false; clearInterval(sp); clearInterval(tm); };
    const spawn = () => {
      if (!alive) return; if (!box.isConnected) return stop();
      const b = document.createElement('button'); b.className = 'p3-cube'; b.type = 'button'; b.setAttribute('aria-label', 'حبه‌قند'); b.textContent = Math.random() < .15 ? '🍬' : '🧊';
      b.style.insetInlineStart = (4 + Math.random() * 78) + '%'; b.style.top = (4 + Math.random() * 72) + '%';
      b.onclick = () => { if (b.classList.contains('pop')) return; score += b.textContent === '🍬' ? 3 : 1; $('#p3gs', box).textContent = fa(score); b.classList.add('pop'); buzz(10); setTimeout(() => b.remove(), 180); };
      f.appendChild(b); setTimeout(() => b.isConnected && b.remove(), 1900);
    };
    const sp = setInterval(spawn, 520), tm = setInterval(() => {
      if (!box.isConnected) return stop();
      left--; $('#p3gt', box).textContent = fa(left);
      if (left <= 0) { stop(); f.remove(); $('#p3gm', box).innerHTML = `<b>${fa(score)} امتیاز!</b> حالا هوست چطوره؟ اگه رفته، دکمه‌ی «رد شد» رو بزن.`; P().game = Math.max(P().game || 0, score); A.save(); }
    }, 1000);
    spawn();
  }

  /* ================= 7. hard-day mode ================= */
  const hardOn = () => on('hardday') && !!P().hard[today()];
  add('todayTop', () => {
    if (!inApp() || A.D().cycleDone) return '';
    let out = '';
    if (on('hardday')) out += hardOn()
      ? `<div class="card stack p3-hard"><div class="row" style="justify-content:space-between"><b>🫂 امروز روز سختیه؛ فقط همین سه تا کافیه</b><button class="btn ghost" id="p3hoff">برگرد به حالت عادی</button></div>
        <ol class="p3-steps"><li>فقط پاراگراف اول متن امروز رو بخون.</li><li>یک لیوان آب بخور و اگه تونستی ۵ دقیقه راه برو${on('lazy') ? ' یا <a href="#lazy">جلسه‌ی تنبل</a> رو انجام بده' : ''}.</li><li>آخر شب چک‌لیست رو بزن، حتی اگه خوردی. روزت حساب می‌شه.</li></ol>
        <p class="small muted">روز بد یعنی شکست نیست. امروز فقط هدف اینه که برنامه رو ول نکنی.</p></div>`
      : '';
    if (on('pledge')) out += pledgeCard();
    return out;
  });
  add('todayAside', () => {
    if (!inApp()) return '';
    let out = '';
    if (on('hardday') && !hardOn()) out += `<button class="btn ghost p3-hardbtn" id="p3hon">🫂 امروز روز سختیه</button>`;
    if (on('milestone')) out += milestoneCard();
    if (on('savegoal') && P().goal) out += goalCard(true);
    if (on('reasons') && P().reasons.length) { const r = P().reasons[new Date().getDate() % P().reasons.length], ph = photo(r.id); out += `<a class="card p3-reason-mini" href="#reasons">${ph ? `<img src="${ph}" alt="">` : '<span>💚</span>'}<span class="small"><b>یادت باشه:</b> ${esc(r.text)}</span></a>`; }
    return out;
  });
  add('mount', r => {
    if (r !== 'today') return;
    $('#app .view')?.classList.toggle('p3-hardmode', hardOn());
    const hon = $('#p3hon'); if (hon) hon.onclick = async () => { P().hard[today()] = true; await A.save(); rerender(); A.toast('باشه. امروز رو ساده می‌گیریم. فقط سه کار کوچیک.', null, 'calm'); };
    const hoff = $('#p3hoff'); if (hoff) hoff.onclick = async () => { delete P().hard[today()]; await A.save(); rerender(); };
    const pl = $('#p3pledge'); if (pl) pl.onclick = async () => { P().pledge[today()] = true; await A.save(); buzz(30); A.confetti(); rerender(); A.toast('پیمان امروز بسته شد. امروز با هم بی‌قند می‌مونیم ✋', null, 'happy'); };
    welcomeBack();
  });

  /* ================= 8. quick add (+) ================= */
  add('boot', () => {
    if ($('#p3fab')) return;
    document.body.insertAdjacentHTML('beforeend', '<button class="p3-fab" id="p3fab" hidden aria-label="ثبت سریع" title="ثبت سریع">＋</button>');
    $('#p3fab').onclick = () => {
      const items = [['crave', '🆘', 'هوس دارم', true], ['sugar', '🍬', 'ثبت قند', on('sugardiary') && A.views.sugar], ['skip', '🙅', 'نخریدمش!', on('skipped')], ['note', '📝', 'یادداشت', on('journal')], ['win', '🏆', 'برد امروز', on('wins')], ['target', '🎯', 'هدف‌هام', on('targets')]].filter(x => x[3]);
      A.modal(`<div class="stack" style="gap:12px"><h3>ثبت سریع</h3><div class="p3-quick">${items.map(([k, i, t]) => `<button class="card p3-q" data-q="${k}"><span>${i}</span>${t}</button>`).join('')}</div></div>`, (m, close) => {
        $$('[data-q]', m).forEach(b => b.onclick = () => { close(); ({ crave: openCraving, sugar: () => A.go('sugar'), skip: () => openSkip(), note: () => A.go('journal'), win: () => openWin(), target: () => A.go('targets') })[b.dataset.q](); });
      });
    };
  });
  add('mount', () => { const b = $('#p3fab'); if (b) b.hidden = !(inApp() && on('quickadd')); });
  function openWin() {
    A.modal(`<form class="stack" id="p3wf" style="gap:10px"><h3>🏆 برد امروزم</h3><label for="p3wt" class="small muted">یک چیز کوچیک که امروز خوب پیش رفت.</label><input id="p3wt" class="input" maxlength="140" value="${esc(P().wins[A.nightKey()] || '')}" placeholder="مثلاً: تو مهمونی کیک رو با لبخند رد کردم"><button class="btn primary" type="submit">ثبت</button></form>`, (m, close) => {
      $('#p3wf', m).onsubmit = async e => { e.preventDefault(); const v = $('#p3wt', m).value.trim(); if (v) P().wins[A.nightKey()] = v; await A.save(); close(); A.toast('برد امروزت توی شیشه‌ی بردها ثبت شد 🏆', 'trophy'); };
    });
  }

  /* ================= 9–10. skipped-it + savings goal ================= */
  const SKIP_PRESETS = [['نوشابه', 9], ['شکلات', 3], ['کیک یا شیرینی', 4], ['بستنی', 5], ['آبمیوه‌ی پاکتی', 5], ['بیسکویت', 2]];
  const skipTotal = () => P().skips.reduce((a, s) => a + (s.price || 0), 0);
  const skipCubes = () => P().skips.reduce((a, s) => a + (s.cubes || 0), 0);
  const savedAll = () => (on('savings') ? A.stats().toman : 0) + skipTotal();
  function openSkip() {
    A.modal(`<form class="stack" id="p3sf" style="gap:10px"><h3>🙅 نخریدمش!</h3><p class="small muted">چی رو نخریدی یا نخوردی؟ قیمتش به پس‌اندازت اضافه می‌شه.</p>
      <div class="p3-chips">${SKIP_PRESETS.map(([n, c], i) => `<button type="button" class="p3-chip" data-sp="${i}">${n}</button>`).join('')}</div>
      <div class="two"><div class="field"><label for="p3sn">چی بود؟</label><input id="p3sn" class="input" maxlength="60" required></div><div class="field"><label for="p3sp">قیمت (تومان)</label><input id="p3sp" class="input" inputmode="numeric" placeholder="مثلاً ۴۰۰۰۰"></div></div>
      <input type="hidden" id="p3sc" value="3"><p class="small" id="p3serr" role="alert"></p><button class="btn primary" type="submit">ثبت</button></form>`, (m, close) => {
      $$('[data-sp]', m).forEach(b => b.onclick = () => { const [n, c] = SKIP_PRESETS[b.dataset.sp]; $('#p3sn', m).value = n; $('#p3sc', m).value = c; $('#p3sp', m).focus(); });
      $('#p3sf', m).onsubmit = async e => {
        e.preventDefault(); const n = $('#p3sn', m).value.trim(), p = num($('#p3sp', m).value);
        if (!n) return ($('#p3serr', m).textContent = 'بنویس چی رو نخریدی.');
        P().skips.push({ t: Date.now(), name: n.slice(0, 60), price: Math.max(0, Math.min(1e8, p || 0)), cubes: Number($('#p3sc', m).value) || 3 }); P().skips = P().skips.slice(-400);
        await A.save(); close(); buzz(30); A.confetti(); A.toast(`آفرین! ${p ? A.money(p) + ' تومان به پس‌اندازت اضافه شد.' : 'ثبت شد.'}`, null, 'happy'); if (/save|today/.test(location.hash)) rerender();
      };
    });
  }
  function goalCard(mini) {
    const g = P().goal; if (!g) return '';
    const s = savedAll(), f = Math.min(1, s / Math.max(1, g.price));
    return `<a class="card stack p3-goal" href="#save" style="gap:6px;text-decoration:none;color:inherit"><div class="row" style="justify-content:space-between"><b>🎁 ${esc(g.name)}</b><span class="chip num">${fa(Math.round(f * 100))}٪</span></div>
      <div class="progress"><i style="width:${f * 100}%;background:var(--sun)"></i></div><span class="small muted">${A.money(Math.min(s, g.price))} از ${A.money(g.price)} تومان${f >= 1 ? ' — رسیدی! جایزه‌ات رو بگیر 🎉' : ''}</span>${mini ? '' : ''}</a>`;
  }
  route('save', 'پس‌انداز و جایزه', () => {
    const g = P().goal || {}, list = P().skips.slice().reverse();
    return page('پس‌انداز', `${A.money(savedAll())} تومان پس‌انداز`, `${on('savings') ? `${A.money(A.stats().toman)} تومان از روزهای بی‌قند (تخمینی)، ` : ''}${A.money(skipTotal())} تومان از ${fa(P().skips.length)} بار «نخریدمش».`,
      `${on('savegoal') ? `${goalCard()}<form id="p3gf2" class="card stack" style="gap:8px"><b>${g.name ? 'عوض کردن هدف' : 'برای چی پس‌انداز می‌کنی؟'}</b><div class="two"><div class="field"><label for="p3gn">جایزه</label><input id="p3gn" class="input" maxlength="60" value="${esc(g.name || '')}" placeholder="مثلاً: کفش ورزشی"></div><div class="field"><label for="p3gp">قیمت (تومان)</label><input id="p3gp" class="input" inputmode="numeric" value="${g.price ? fa(g.price) : ''}"></div></div><div class="row"><button class="btn primary" type="submit">ذخیره</button>${g.name ? '<button class="btn ghost" type="button" id="p3gdel">حذف هدف</button>' : ''}</div></form>` : ''}
      ${on('skipped') ? `<div class="card stack"><div class="row" style="justify-content:space-between"><b>🙅 نخریدمش!</b><button class="btn sun" id="p3sk">ثبت تازه</button></div>${list.length ? list.slice(0, 30).map(s => `<div class="row small" style="justify-content:space-between"><span>${esc(s.name)} <span class="muted">· ${esc(new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(s.t))}</span></span><span class="num">${s.price ? A.money(s.price) + ' تومان' : ''}</span></div>`).join('') : '<p class="small muted">هر بار شیرینی‌ای رو نخریدی، اینجا ثبتش کن.</p>'}</div>` : ''}`, 720);
  }, () => {
    const f = $('#p3gf2'); if (f) f.onsubmit = async e => { e.preventDefault(); const n = $('#p3gn').value.trim(), p = num($('#p3gp').value); if (!n || !p) return A.toast('اسم جایزه و قیمتش رو بنویس.'); P().goal = { name: n.slice(0, 60), price: Math.min(1e10, p) }; await A.save(); rerender(); };
    const d = $('#p3gdel'); if (d) d.onclick = async () => { delete P().goal; await A.save(); rerender(); };
    const s = $('#p3sk'); if (s) s.onclick = openSkip;
  });

  /* ================= 11. separate targets ================= */
  const TARGET_IDEAS = [['🥤', 'نوشابه و نوشیدنی شیرین'], ['🍵', 'قند و شکر توی چای'], ['🍰', 'کیک و شیرینی'], ['🍫', 'شکلات'], ['🍦', 'بستنی'], ['🌙', 'خوراکی بعد از شام']];
  route('targets', 'هدف‌های من', () => {
    const ts = P().targets;
    return page('هدف‌های جدا', 'یکی‌یکی کنارشون بذار', 'برای هر خوراکی شیرین یک شمارنده‌ی جدا. اگه در یکی لغزیدی، بقیه صفر نمی‌شن و رکوردت هم می‌مونه.',
      `<div class="p3-targets">${ts.map(t => { const n = daysSince(t.since), best = Math.max(t.best || 0, n); return `<div class="card stack p3-target" style="gap:6px"><div class="row" style="justify-content:space-between"><b>${esc(t.icon)} ${esc(t.name)}</b><button class="btn ghost" data-tdel="${t.id}" aria-label="حذف هدف">🗑</button></div>
        <p><span class="display" style="font-size:2rem">${fa(n)}</span> روز از آخرین بار</p><span class="small muted">رکورد: ${fa(best)} روز${t.slips ? ` · ${fa(t.slips)} بار لغزش` : ''}</span>
        <button class="btn ghost" data-tslip="${t.id}">امروز خوردم</button></div>`; }).join('')}</div>
      <div class="card stack" style="gap:8px"><b>افزودن هدف</b><div class="p3-chips">${TARGET_IDEAS.filter(([, n]) => !ts.some(t => t.name === n)).map(([i, n]) => `<button class="p3-chip" data-tadd="${esc(i)}|${esc(n)}"><span>${i}</span>${n}</button>`).join('')}</div>
      <form id="p3tf" class="row"><input id="p3tn" class="input" maxlength="40" placeholder="یا هدف خودت رو بنویس" style="flex:1;min-width:160px"><button class="btn primary" type="submit">افزودن</button></form></div>`, 860);
  }, () => {
    const addT = async (icon, name) => { if (P().targets.length >= 8) return A.toast('حداکثر ۸ هدف.'); P().targets.push({ id: 't' + Date.now().toString(36), icon, name: name.slice(0, 40), since: today(), best: 0, slips: 0 }); await A.save(); rerender(); };
    $$('[data-tadd]').forEach(b => b.onclick = () => { const [i, n] = b.dataset.tadd.split('|'); addT(i, n); });
    $('#p3tf').onsubmit = e => { e.preventDefault(); const n = $('#p3tn').value.trim(); if (n) addT('🎯', n); };
    $$('[data-tdel]').forEach(b => b.onclick = async () => { P().targets = P().targets.filter(t => t.id !== b.dataset.tdel); await A.save(); rerender(); });
    $$('[data-tslip]').forEach(b => b.onclick = async () => {
      if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'مطمئنی؟ دوباره بزن'; b.classList.add('berry'); return; }
      const t = P().targets.find(x => x.id === b.dataset.tslip); if (!t) return;
      t.best = Math.max(t.best || 0, daysSince(t.since)); t.since = today(); t.slips = (t.slips || 0) + 1; await A.save(); rerender();
      A.toast('ثبت شد. رکوردت سر جاشه و شمارنده از امروز دوباره شروع شد. مهم ادامه دادنه.', null, 'calm');
    });
  });

  /* ================= 12–16. progress: longest streak, consistency, sugar wall, milestone, live counter, story card ================= */
  function streaks() {
    const s = A.D(), dates = [...new Set(Object.values(s.log).filter(l => l.done && !l.demo).map(l => l.date))].sort();
    let best = dates.length ? 1 : 0, run = 1;
    for (let i = 1; i < dates.length; i++) { run = A.dayDiff(dates[i - 1], dates[i]) === 1 ? run + 1 : 1; best = Math.max(best, run); }
    const from = A.dateKey(new Date(Date.now() - 29 * 864e5));
    const clean = new Set(Object.values(s.log).filter(l => l.done && !l.demo && l.slip !== 'lot' && l.date >= from).map(l => l.date)).size;
    return { best: Math.max(best, A.stats().streak), clean };
  }
  const MILES = [3, 7, 14, 21, 30, 42, 63, 100, 180, 365];
  function milestoneCard() {
    const n = A.stats().total, next = MILES.find(m => m > n); if (!next) return '';
    const prev = [...MILES].reverse().find(m => m <= n) || 0, f = (n - prev) / (next - prev);
    return `<div class="card stack p3-mile" style="gap:6px"><b>🏁 ${fa(next - n)} روز تا نقطه‌ی عطف ${fa(next)} روز</b><div class="progress"><i style="width:${f * 100}%"></i></div><span class="small muted">${fa(n)} روز کامل تا الان</span></div>`;
  }
  const since = () => { const k = A.D().startedAt || today(); return new Date(k + 'T00:00'); };
  const liveText = () => { const ms = Math.max(0, Date.now() - since()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, mi = Math.floor(ms / 6e4) % 60, se = Math.floor(ms / 1e3) % 60; return `${fa(d)} روز، ${fa(h)} ساعت، ${fa(mi)} دقیقه و ${fa(se)} ثانیه`; };
  let liveTimer = null;
  add('journey', () => {
    if (!inApp()) return '';
    const st = A.stats(), sk = streaks();
    let out = '';
    if (on('livecount')) out += `<div class="card stack p3-live" style="gap:4px"><span class="eyebrow">از شروع دوره</span><b class="num" id="p3live" aria-live="off">${liveText()}</b></div>`;
    if (on('consistency')) out += `<div class="card p3-sk"><div><b class="num">${fa(st.streak)}</b><span class="small muted">زنجیره‌ی الان</span></div><div><b class="num">${fa(sk.best)}</b><span class="small muted">طولانی‌ترین زنجیره</span></div><div><b class="num">${fa(Math.round(sk.clean / 30 * 100))}٪</b><span class="small muted">ثبات ۳۰ روز اخیر</span></div></div>`;
    if (on('sugarwall') && st.cubes > 0) { const per = st.cubes > 600 ? 5 : 1, n = Math.min(600, Math.ceil(st.cubes / per)); out += `<div class="card stack"><b>🧱 دیوار حبه‌قندهایی که نخوردی</b><div class="p3-wall" role="img" aria-label="${fa(st.cubes)} حبه‌قند">${'<i></i>'.repeat(n)}</div><span class="small muted">${fa(st.cubes)} حبه‌قند (تخمینی)${per > 1 ? `؛ هر مربع ${fa(per)} حبه` : ''}</span></div>`; }
    if (on('wins')) { const w = Object.entries(P().wins).sort().reverse().slice(0, 8); if (w.length) out += `<div class="card stack"><b>🏆 شیشه‌ی بردها</b><div class="p3-wins">${w.map(([, t]) => `<span>${esc(t)}</span>`).join('')}</div></div>`; }
    if (on('story')) out += `<button class="btn sun" id="p3story">📸 ساختن کارت استوری از پیشرفتم</button>`;
    return out;
  });
  add('mount', r => {
    clearInterval(liveTimer);
    if (r === 'journey') { const el = $('#p3live'); if (el) liveTimer = setInterval(() => el.isConnected ? (el.textContent = liveText()) : clearInterval(liveTimer), 1000); }
    const b = $('#p3story'); if (b) b.onclick = storyCard;
  });
  add('cycleDone', () => on('story') ? `<button class="btn sun" id="p3story">📸 کارت استوری این دوره</button>` : '');
  async function storyCard() {
    const st = A.stats(), sk = streaks(), W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    try { await document.fonts.load('900 80px Vazirmatn'); await document.fonts.load('80px Lalezar'); } catch (e) {}
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f3fbef'); g.addColorStop(.6, '#d9f0d0'); g.addColorStop(1, '#bfe3b4'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    try { const img = new Image(); img.src = 'img/icon.svg'; await img.decode(); x.drawImage(img, W / 2 - 160, 170, 320, 320); } catch (e) {}
    x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#4f7a45';
    x.font = '120px Lalezar, Vazirmatn, sans-serif'; x.fillText('حَبه', W / 2, 640);
    x.font = '700 46px Vazirmatn, sans-serif'; x.fillStyle = '#6b8f61'; x.fillText('یار روزهای بی‌قند', W / 2, 715);
    const rows = [[fa(st.total), 'روز کامل در برنامه'], [fa(sk.best), 'روز، طولانی‌ترین زنجیره'], [fa(st.cubes), 'حبه‌قند که نخوردم'], [A.money(savedAll()), 'تومان پس‌انداز']];
    rows.forEach(([v, t], i) => {
      const y = 860 + i * 230; x.fillStyle = 'rgba(255,255,255,.72)'; if (x.roundRect) { x.beginPath(); x.roundRect(120, y - 120, W - 240, 190, 40); x.fill(); } else x.fillRect(120, y - 120, W - 240, 190);
      x.fillStyle = '#2f5a2a'; x.font = '900 92px Vazirmatn, sans-serif'; x.fillText(v, W / 2, y); x.fillStyle = '#5d7d55'; x.font = '700 40px Vazirmatn, sans-serif'; x.fillText(t, W / 2, y + 52);
    });
    x.fillStyle = '#4f7a45'; x.font = '700 40px Vazirmatn, sans-serif'; x.fillText(location.host || 'habbeapp.github.io', W / 2, H - 120);
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const file = new File([blob], 'habbeh-story.png', { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    A.modal(`<div class="stack" style="gap:12px;text-align:center"><h3>کارت استوری تو</h3><img src="${url}" alt="کارت پیشرفت" class="p3-story-img"><div class="row" style="justify-content:center">${navigator.canShare && navigator.canShare({ files: [file] }) ? '<button class="btn primary" id="p3shs">اشتراک‌گذاری</button>' : ''}<a class="btn ghost" href="${url}" download="habbeh-story.png">ذخیره‌ی تصویر</a></div></div>`, (m) => {
      const s = $('#p3shs', m); if (s) s.onclick = () => navigator.share({ files: [file], text: 'پیشرفت من در حبه 🌱' }).catch(() => {});
      m._cleanup = () => setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  /* ================= 17. welcome back ================= */
  function welcomeBack() {
    if (!on('welcome') || !inApp()) return;
    const p = P(), last = p.seen, t = today();
    if (last === t) return;
    p.seen = t; A.save();
    if (!last || daysSince(last) < 3 || $('.modal')) return;
    const gap = daysSince(last);
    setTimeout(() => A.modal(`<div class="stack" style="gap:12px;text-align:center"><div style="width:120px;margin:0 auto">${A.ART.mascot('happy', { arms: 'wave' })}</div><h2>خوش برگشتی!</h2>
      <p class="muted">${fa(gap)} روز ندیده بودیمت. اشکالی نداره؛ مهم اینه که الان اینجایی. هیچ‌کس این مسیر رو بی‌وقفه نمی‌ره.</p>
      <div class="stack" style="gap:8px"><button class="btn primary big" data-wb="go">از همون‌جا ادامه می‌دم</button>${on('hardday') ? '<button class="btn ghost" data-wb="hard">امروز رو ساده بگیریم</button>' : ''}${on('reasons') && P().reasons.length ? '<button class="btn ghost" data-wb="why">یه نگاه به دلیل‌هام</button>' : ''}</div></div>`, (m, close) => {
      $$('[data-wb]', m).forEach(b => b.onclick = async () => { close(); if (b.dataset.wb === 'hard') { P().hard[today()] = true; await A.save(); rerender(); } if (b.dataset.wb === 'why') A.go('reasons'); });
    }), 600);
  }

  /* ================= 18. morning pledge ================= */
  function pledgeStreak() { let n = 0; const d = new Date(); if (!P().pledge[A.dateKey(d)]) d.setDate(d.getDate() - 1); while (P().pledge[A.dateKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
  function pledgeCard() {
    const done = P().pledge[today()], h = new Date().getHours();
    if (done) return `<div class="p3-pledged small">✋ پیمان امروز بسته شد${pledgeStreak() > 1 ? ` · ${fa(pledgeStreak())} روز پیاپی` : ''}</div>`;
    if (h < 4 || h >= 16) return '';
    return `<div class="card p3-pledge"><span class="p3-pi">✋</span><div class="stack" style="gap:2px;min-width:0"><b>پیمان امروز</b><span class="small muted">فقط برای امروز: «امروز قند افزوده نمی‌خورم و اگه هوس اومد، از حبه کمک می‌گیرم.»</span></div><button class="btn primary" id="p3pledge">پیمان می‌بندم</button></div>`;
  }

  /* ================= 19. wins jar (night checklist) ================= */
  add('nightExtra', () => on('wins') && inApp() ? `<div class="card stack nt-sec p3-win" style="gap:8px"><label for="p3win"><b>🏆 برد امروزم:</b> یک چیز کوچیک که امروز خوب پیش رفت</label><input id="p3win" class="input" maxlength="140" value="${esc(P().wins[A.nightKey()] || '')}" placeholder="مثلاً: چای رو بی‌قند خوردم"></div>` : '');
  add('nightSubmit', () => { const el = $('#p3win'); if (!el) return; const v = el.value.trim(); if (v) P().wins[A.nightKey()] = v.slice(0, 140); else delete P().wins[A.nightKey()]; });

  /* ================= 20. journal ================= */
  const PROMPTS = ['امروز کِی بیشتر هوس شیرینی کردم و چرا؟', 'یک چیز که امروز به خاطرش به خودم افتخار می‌کنم…', 'اگه بهترین دوستم جای من بود، بهش چی می‌گفتم؟', 'بدنم امروز چه حسی داشت؟', 'شیرینی معمولاً چه نیازی رو در من جواب می‌ده؟', 'فردا کجا ممکنه سخت بشه و از قبل چی کار می‌کنم؟', 'سه چیز که امروز ازشون ممنونم…', 'از وقتی شروع کردم، چه چیزی در من عوض شده؟'];
  const MOODS = ['😫', '😕', '😐', '🙂', '😄'];
  route('journal', 'دفترچه‌ی یادداشت', () => {
    const j = P().journal.slice().reverse(), pr = PROMPTS[(new Date().getDate() + j.length) % PROMPTS.length];
    return page('دفترچه‌ی یادداشت', 'برای خودت بنویس', 'نوشتن چند خط، فکرها رو مرتب می‌کنه و الگوی هوس‌ها رو روشن‌تر.',
      `<form id="p3jf" class="card stack" style="gap:10px"><div class="scale" role="radiogroup" aria-label="حالت">${MOODS.map((e, i) => `<label><input type="radio" name="p3m" value="${i}" ${i === 3 ? 'checked' : ''} aria-label="${['خیلی بد', 'بد', 'معمولی', 'خوب', 'عالی'][i]}"><span>${e}</span></label>`).join('')}</div>
        <div class="row" style="justify-content:space-between"><label for="p3jt"><b id="p3jp">${esc(pr)}</b></label><button type="button" class="btn ghost" id="p3jn" aria-label="سؤال دیگه">🔄</button></div>
        <textarea id="p3jt" class="input" rows="5" maxlength="2000" placeholder="هر چی به ذهنت می‌رسه…"></textarea><button class="btn primary" type="submit">ذخیره</button></form>
      ${j.length ? `<div class="stack">${j.slice(0, 40).map(e => `<div class="card stack" style="gap:4px"><div class="row" style="justify-content:space-between"><span class="small muted">${MOODS[e.mood] || ''} ${esc(new Intl.DateTimeFormat('fa-IR-u-ca-persian', { weekday: 'long', day: 'numeric', month: 'long' }).format(e.t))}</span><button class="btn ghost" data-jdel="${e.t}" aria-label="حذف یادداشت">🗑</button></div>${e.prompt ? `<b class="small">${esc(e.prompt)}</b>` : ''}<p style="white-space:pre-wrap">${esc(e.text)}</p></div>`).join('')}</div>` : ''}`, 720);
  }, () => {
    let pi = PROMPTS.indexOf($('#p3jp').textContent);
    $('#p3jn').onclick = () => { pi = (pi + 1) % PROMPTS.length; $('#p3jp').textContent = PROMPTS[pi]; };
    $('#p3jf').onsubmit = async e => { e.preventDefault(); const t = $('#p3jt').value.trim(); if (!t) return; P().journal.push({ t: Date.now(), mood: Number($('input[name=p3m]:checked').value), prompt: $('#p3jp').textContent, text: t.slice(0, 2000) }); P().journal = P().journal.slice(-300); await A.save(); rerender(); A.toast('یادداشتت ذخیره شد.', 'book'); };
    $$('[data-jdel]').forEach(b => b.onclick = async () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'حذف؟'; return; } P().journal = P().journal.filter(e => String(e.t) !== b.dataset.jdel); await A.save(); rerender(); });
  });

  /* ================= 32. tools hub: search, categories, pins, recent ================= */
  const CATS = [
    ['craving', 'هوس و ذهن', ['cravings', 'plans', 'reasons', 'journal', 'targets', 'mindful', 'slip', 'phrases', 'quiz', 'coach', 'letter', 'myths']],
    ['food', 'تغذیه', ['sugar', 'swaps', 'label', 'shop', 'plate', 'mealplan', 'breakfast', 'calories', 'recipes', 'fruit', 'season', 'drinks', 'sugarnames', 'sameday', 'kitchen']],
    ['progress', 'پیشرفت', ['save', 'badges', 'calendar', 'score', 'assess', 'body2', 'report', 'challenges', 'risk', 'body', 'period']],
    ['body', 'ورزش و خواب', ['sleep', 'builder', 'lazy', 'move']],
    ['guide', 'راهنماها', ['learn', 'faq', 'glossary', 'kids', 'work', 'eatout', 'paths', 'occasions', 'slow', 'reintro', 'about', 'privacy']],
    ['people', 'با دیگران', ['friends', 'team', 'league', 'invite']],
  ];
  const catOf = r => (CATS.find(c => c[2].includes(r)) || ['other'])[0];
  add('mount', r => {
    if (on('toolsearch') && A.appRoutes.includes(r) && !['today', 'more', 'night', 'journey', 'move', 'settings'].includes(r) && A.tools.some(t => t.route === r)) { const rec = ls.get('uzhu:p3recent', []).filter(x => x !== r); rec.unshift(r); ls.set('uzhu:p3recent', rec.slice(0, 4)); }
    if (r !== 'more' || !on('toolsearch')) return;
    const grid = $('.tools-grid'); if (!grid || $('.p3-tbar')) return;
    const cards = $$('a.tool', grid); cards.forEach(a => { a.dataset.cat = catOf(a.getAttribute('href').slice(1)); a.style.position = 'relative'; });
    const pins = ls.get('uzhu:p3pins', []), rec = ls.get('uzhu:p3recent', []);
    grid.insertAdjacentHTML('beforebegin', `<div class="p3-tbar stack" style="gap:10px"><input class="input" id="p3ts" type="search" placeholder="🔎 دنبال چه ابزاری می‌گردی؟" aria-label="جست‌وجو در ابزارها">
      <div class="filters p3-cats"><button class="on" data-cat="">همه</button>${CATS.filter(c => cards.some(a => a.dataset.cat === c[0])).map(c => `<button data-cat="${c[0]}">${c[1]}</button>`).join('')}</div>
      <div id="p3pinned"></div></div>`);
    const mk = (title, list) => { const els = list.map(r => cards.find(a => a.getAttribute('href') === '#' + r)).filter(Boolean); return els.length ? `<b class="small">${title}</b><div class="tools-grid p3-mini">${els.map(a => `<a class="card tool" href="${a.getAttribute('href')}">${a.querySelector('.tool-i').outerHTML}<b>${a.querySelector('b').textContent}</b></a>`).join('')}</div>` : ''; };
    $('#p3pinned').innerHTML = mk('📌 سنجاق‌شده‌ها', pins) + mk('🕘 اخیراً', rec.filter(x => !pins.includes(x)));
    cards.forEach(a => { const r = a.getAttribute('href').slice(1); a.insertAdjacentHTML('beforeend', `<button class="p3-pin" data-pin="${esc(r)}" aria-pressed="${pins.includes(r)}" aria-label="سنجاق کردن ${esc(a.querySelector('b').textContent)}">📌</button>`); });
    $$('[data-pin]').forEach(b => b.onclick = e => { e.preventDefault(); e.stopPropagation(); let p = ls.get('uzhu:p3pins', []); const r = b.dataset.pin; p = p.includes(r) ? p.filter(x => x !== r) : [r, ...p].slice(0, 8); ls.set('uzhu:p3pins', p); rerender(); });
    let cat = '';
    const filter = () => { const q = $('#p3ts').value.trim(); cards.forEach(a => { a.hidden = !((!cat || a.dataset.cat === cat) && (!q || a.textContent.includes(q))); }); $('#p3pinned').hidden = !!(q || cat); };
    $('#p3ts').oninput = filter;
    $$('.p3-cats [data-cat]').forEach(b => b.onclick = () => { cat = b.dataset.cat; $$('.p3-cats button').forEach(x => x.classList.toggle('on', x === b)); filter(); });
  });

  /* ================= 33–36. skip link + page announce, back to top, offline bar, haptics ================= */
  let lastRoute = null;
  add('boot', () => {
    if (on('a11y2') && !$('.p3-skiplink')) {
      document.body.insertAdjacentHTML('afterbegin', '<a class="p3-skiplink" href="#" id="p3skiplink">پرش به محتوای اصلی</a><div class="p3-sr" id="p3announce" aria-live="polite"></div>');
      $('#app').setAttribute('tabindex', '-1');
      $('#p3skiplink').onclick = e => { e.preventDefault(); const h = $('#app h1, #app h2'); (h || $('#app')).setAttribute('tabindex', '-1'); (h || $('#app')).focus(); };
    }
    if (on('totop') && !$('#p3top')) {
      document.body.insertAdjacentHTML('beforeend', '<button class="p3-top" id="p3top" hidden aria-label="برگشت به بالا">↑</button>');
      $('#p3top').onclick = () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      let raf = 0; addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; $('#p3top').hidden = scrollY < 1200; }); }, { passive: true });
    }
    if (on('offline')) {
      const bar = () => { let b = $('#p3off'); if (navigator.onLine) { if (b) b.remove(); return; } if (!b) document.body.insertAdjacentHTML('afterbegin', '<div class="p3-off" id="p3off" role="status">📡 آفلاینی. کارهات روی همین دستگاه می‌مونن و وقتی وصل شدی ذخیره می‌شن.</div>'); };
      addEventListener('online', () => { bar(); A.toast('دوباره آنلاین شدی ✓', 'bell'); }); addEventListener('offline', bar); bar();
    }
    document.addEventListener('change', e => { const t = e.target; if (t && t.matches && t.matches('.check input[type=checkbox]') && t.checked) buzz(12); }, true);
  });
  add('mount', r => {
    if (!on('a11y2')) return;
    if (lastRoute !== null && lastRoute !== r) {
      const h = $('#app h1, #app h2');
      if (h && !$('.modal')) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      const a = $('#p3announce'); if (a) a.textContent = 'صفحه‌ی ' + (A.titles[r] || 'حبه');
    }
    lastRoute = r;
  });

  /* ================= 37. PIN lock on this device ================= */
  const pinKey = () => 'uzhu:p3pin:' + userKey();
  const hash = async s => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('habbeh:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };
  let hiddenAt = 0, locked = false;
  function lockScreen() {
    if (locked || !on('pinlock') || !ls.get(pinKey(), null) || !crypto.subtle) return;
    locked = true;
    document.body.insertAdjacentHTML('beforeend', `<div class="p3-lock" id="p3lock" role="dialog" aria-modal="true" aria-labelledby="p3lt"><div class="stack" style="gap:12px;align-items:center;max-width:320px"><img src="img/icon.svg" alt="" width="90" height="90"><h2 id="p3lt">رمز حبه رو وارد کن</h2>
      <form id="p3lf" class="stack" style="gap:10px;width:100%"><input id="p3lp" class="input" type="password" inputmode="numeric" autocomplete="off" maxlength="4" dir="ltr" style="text-align:center;font-size:1.6rem;letter-spacing:.5em" aria-label="رمز ۴ رقمی"><p class="small" id="p3le" role="alert"></p><button class="btn primary big" type="submit">باز کن</button></form>
      <button class="btn ghost small" id="p3lforgot">رمز رو فراموش کردم</button></div></div>`);
    const el = $('#p3lock'); setTimeout(() => $('#p3lp').focus(), 50);
    $('#p3lf').onsubmit = async e => { e.preventDefault(); const v = num($('#p3lp').value); if (v !== null && await hash(String(v).padStart(4, '0')) === ls.get(pinKey(), null)) { el.remove(); locked = false; } else { $('#p3le').textContent = 'رمز درست نیست.'; $('#p3lp').value = ''; buzz(60); } };
    $('#p3lforgot').onclick = async () => { $('#p3le').textContent = 'برای برداشتن قفل، از حساب خارج می‌شی و باید دوباره وارد بشی.'; const b = $('#p3lforgot'); if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'باشه، خارج شو'; return; } try { localStorage.removeItem(pinKey()); await A.STORE.logout(); } catch (er) {} location.hash = '#login'; location.reload(); };
  }
  add('boot', () => {
    if (inApp()) lockScreen();
    document.addEventListener('visibilitychange', () => { if (document.hidden) hiddenAt = Date.now(); else if (inApp() && hiddenAt && Date.now() - hiddenAt > 60e3) lockScreen(); });
  });

  /* ================= 38. keyboard shortcuts ================= */
  const KEYS = [['KeyH', 'هوس دارم', () => inApp() && openCraving()], ['KeyT', 'امروز', () => A.go('today')], ['KeyN', 'چک‌لیست شب', () => A.go('night')], ['KeyJ', 'مسیر من', () => A.go('journey')], ['KeyM', 'ابزارها', () => A.go('more')], ['KeyR', 'رسپی‌ها', () => A.go('recipes')], ['Slash', 'جست‌وجو', () => A.views.search && A.go('search')]];
  const KEYL = { KeyH: 'H', KeyT: 'T', KeyN: 'N', KeyJ: 'J', KeyM: 'M', KeyR: 'R', Slash: '/' };
  document.addEventListener('keydown', e => {
    if (!on('hotkeys') || e.ctrlKey || e.metaKey || e.altKey || locked) return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) || $('.modal')) return;
    if (e.code === 'Slash' && e.shiftKey) { e.preventDefault(); A.modal(`<div class="stack" style="gap:8px"><h3>⌨️ میانبرهای صفحه‌کلید</h3>${KEYS.map(([k, t]) => `<div class="row small" style="justify-content:space-between"><span>${t}</span><kbd>${KEYL[k]}</kbd></div>`).join('')}<div class="row small" style="justify-content:space-between"><span>همین راهنما</span><kbd>?</kbd></div><p class="small muted">با صفحه‌کلید فارسی هم کار می‌کنه.</p></div>`); return; }
    if (e.shiftKey) return;
    const k = KEYS.find(x => x[0] === e.code); if (!k || (!inApp() && e.code !== 'KeyR' && e.code !== 'Slash')) return;
    e.preventDefault(); k[2]();
  });

  /* ================= settings: haptics, PIN, CSV ================= */
  add('settings', () => {
    if (!inApp()) return '';
    let out = '';
    if (on('haptics') && navigator.vibrate) out += `<label class="check" for="p3hap"><input type="checkbox" id="p3hap" ${ls.get('uzhu:haptics', true) ? 'checked' : ''}><span>لرزش کوتاه هنگام تیک زدن و رد کردن هوس (روی همین گوشی)</span></label>`;
    if (on('pinlock') && window.crypto && crypto.subtle) out += `<div class="stack" style="gap:6px"><b class="small">🔒 قفل با رمز روی همین دستگاه</b>${ls.get(pinKey(), null) ? '<div class="row"><span class="chip mint">روشن</span><button type="button" class="btn ghost" id="p3pinoff">برداشتن قفل</button></div>' : '<div class="row"><input id="p3pin" class="input" type="password" inputmode="numeric" maxlength="4" dir="ltr" placeholder="۴ رقم" style="max-width:120px" aria-label="رمز ۴ رقمی تازه"><button type="button" class="btn ghost" id="p3pinset">گذاشتن رمز</button></div>'}<span class="small muted">برای وقتی که گوشی دست بقیه هم هست. بعد از یک دقیقه دور بودن از برنامه، رمز خواسته می‌شه.</span></div>`;
    if (on('csv')) out += `<div class="row"><button type="button" class="btn ghost" id="p3csv">⬇️ خروجی CSV (برای اکسل)</button></div>`;
    return out ? `<div class="card stack" style="gap:10px"><b>این دستگاه و داده‌ها</b>${out}</div>` : '';
  });
  add('mount', r => {
    if (r !== 'settings') return;
    const hp = $('#p3hap'); if (hp) hp.onchange = () => { ls.set('uzhu:haptics', hp.checked); buzz(20); };
    const ps = $('#p3pinset'); if (ps) ps.onclick = async () => { const v = num($('#p3pin').value); if (v === null || !/^\d{4}$/.test(String(v).padStart(4, '0')) || $('#p3pin').value.length !== 4) return A.toast('رمز باید ۴ رقم باشه.'); ls.set(pinKey(), await hash(String(v).padStart(4, '0'))); A.toast('قفل روشن شد. رمزت رو فراموش نکن.', 'bell'); rerender(); };
    const po = $('#p3pinoff'); if (po) po.onclick = () => { localStorage.removeItem(pinKey()); rerender(); };
    const cv = $('#p3csv'); if (cv) cv.onclick = exportCSV;
  });

  /* ================= 49. CSV export ================= */
  function exportCSV() {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`, rows = [], s = A.D();
    const iso = t => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
    rows.push(['بخش', 'تاریخ', 'مورد', 'مقدار', 'توضیح']);
    Object.entries(s.log).filter(([, l]) => l.done).forEach(([k, l]) => rows.push(['روزها', l.date, k, { no: 'بی‌قند', bit: 'کمی', lot: 'زیاد' }[l.slip] || '', `هوس ${l.craving ?? ''}/۴ · ${l.reflect || ''}`]));
    (s.sos.events || []).forEach(e => rows.push(['هوس', iso(e.t), e.beaten ? 'رد شد' : 'خوردم', e.hour, '']));
    P().cr.forEach(c => rows.push(['محرک هوس', iso(c.t), c.trig.map(trigName).join('، '), (PLACES.find(p => p[0] === c.place) || [, , ''])[2], '']));
    P().skips.forEach(k => rows.push(['نخریدمش', iso(k.t), k.name, k.price, '']));
    Object.entries((s.p2 || {}).sugar || {}).forEach(([d, l]) => rows.push(['دفترچه‌ی قند', d, 'تعداد ثبت', l.reduce((a, x) => a + x[1], 0), '']));
    P().targets.forEach(t => rows.push(['هدف', t.since, t.name, daysSince(t.since), `رکورد ${Math.max(t.best || 0, daysSince(t.since))}`]));
    P().journal.forEach(j => rows.push(['یادداشت', iso(j.t), j.prompt, MOODS[j.mood] || '', j.text]));
    Object.entries(P().wins).forEach(([d, w]) => rows.push(['برد', d, w, '', '']));
    const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `habbeh-${today()}.csv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ================= tools hub ================= */
  tool('cravings', '🔍', 'بینش هوس‌ها', 'چه روزی، چه ساعتی، با چه حالی', 'cravings');
  tool('plans', '🗺', 'نقشه‌ی هر محرک', '«اگر خسته‌ام… آنگاه…» برای هر حال', 'plans');
  tool('reasons', '💚', 'دلیل‌های من', 'تابلوی دلیل‌ها با عکس', 'reasons');
  tool('targets', '🎯', 'هدف‌های من', 'شمارنده‌ی جدا برای نوشابه، قند چای و…', 'targets');
  A.tools.push({ route: 'save', icon: '🎁', title: 'پس‌انداز و جایزه', desc: '«نخریدمش!» و هدف پس‌انداز', show: () => on('skipped') || on('savegoal') });
  tool('journal', '📝', 'دفترچه‌ی یادداشت', 'با سؤال‌های راهنما و حال روز', 'journal');
});
