/* Uzhu features 1–15 (plugin). Data lives under A.D().fa_* keys.
   1 freeze، 2 prep، 3 reintro، 4 journeys، 5 challenges، 6 companion، 7 buddy، 8 team، 9 league
   10 quiz، 11 coach، 12 slipwizard، 13 taarof، 14 checkin، 15 timeline */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = key => ((A.site && A.site.settings && A.site.settings.features) || {})[key] !== false;
  const D = () => A.D();
  const today = () => A.dateKey();
  const addDays = (k, n) => { const d = new Date(k + 'T12:00'); d.setDate(d.getDate() + n); return A.dateKey(d); };
  const hash = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const seedPick = (arr, seed) => arr[hash(seed) % arr.length];
  const store = (k, def) => { const s = D(); if (!s[k]) s[k] = def(); return s[k]; };
  const pref = () => store('fa_pref', () => ({ checkin: true, companion: true, quiz: true }));
  const hook = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const KEYS = { slow: 'prep', reintro: 'reintro', paths: 'journeys', challenges: 'challenges', friends: 'buddy', team: 'team', league: 'league', quiz: 'quiz', coach: 'coach', slip: 'slipwizard', phrases: 'taarof', body: 'timeline' };
  const off = () => `<section class="wrap auth stack"><div class="card stack"><b>این بخش فعلاً در دسترس نیست.</b><a class="btn" href="#more">برگشت به ابزارها</a></div></section>`;
  const page = (route, title, view, mount) => {
    A.views[route] = () => on(KEYS[route]) ? view() : off();
    A.mounts[route] = () => { if (on(KEYS[route]) && mount) mount(); };
    A.titles[route] = title; if (!A.appRoutes.includes(route)) A.appRoutes.push(route);
  };
  // Re-render the current page in place (keeps scroll position, unlike A.render()).
  function refresh() {
    const r = (location.hash || '#').slice(1); const v = $('#app .view');
    if (!v || !A.views[r]) return A.render();
    const y = window.scrollY; v.innerHTML = A.views[r](); if (A.mounts[r]) A.mounts[r](); window.scrollTo(0, y);
  }
  const head = (eyebrow, title, sub) => `<div class="section-head" style="margin:0"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>`;
  const miniRing = (v, max, color = 'var(--mint)', label = '') => {
    const r = 22, C = 2 * Math.PI * r, f = Math.max(0, Math.min(1, max ? v / max : 0));
    return `<div class="fa-ring" role="img" aria-label="${fa(v)} از ${fa(max)}"><svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="${r}" fill="none" style="stroke:var(--surface-2)" stroke-width="7"/><circle cx="28" cy="28" r="${r}" fill="none" style="stroke:${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - f)).toFixed(1)}"/></svg><span>${label || fa(v) + '/' + fa(max)}</span></div>`;
  };

  /* ---------- shared activity data: per calendar date ---------- */
  function acts() {
    const s = D(), m = {}, t = today(), cur = A.logKey();
    const g = d => (m[d] = m[d] || { night: 0, clean: 0, slip: null, walk: 0, breath: 0, routine: 0, sos: 0, craving: null });
    for (const l of Object.values(s.log || {})) if (l.done && l.date) { const o = g(l.date); o.night = 1; o.slip = l.slip; o.craving = l.craving; if (l.slip === 'no') o.clean = 1; }
    for (const [k, mv] of Object.entries(s.move || {})) {
      const d = (s.log[k] && s.log[k].date) || (k === cur ? t : null); if (!d || !mv) continue;
      const mm = /^c(\d+)d(\d+)$/.exec(k); const ex = mm ? A.exDay(+mm[1], +mm[2]) : null; const o = g(d);
      if ((ex && mv.walk >= ex.walk) || mv.walk >= 30) o.walk = 1;
      if ((ex && mv.breaths >= ex.breath) || mv.breaths >= 10) o.breath = 1;
      if (mv.routine) o.routine = 1;
    }
    for (const e of ((s.sos && s.sos.events) || [])) if (e.beaten) g(A.dateKey(new Date(e.t))).sos++;
    return m;
  }
  const inRange = (k, from, to) => k >= from && k <= to;

  /* ================= 1. streak freeze (روز امن) ================= */
  const frz = () => store('fa_freeze', () => ({ count: 0, earned: 0, used: [], checked: null }));
  const doneDates = () => [...new Set(Object.values(D().log).filter(l => l.done && l.date).map(l => l.date))].sort();
  function freezeEarn() {
    if (!on('freeze')) return false;
    const f = frz(); const clean = Object.values(D().log).filter(l => l.done && l.slip === 'no').length;
    const should = Math.floor(clean / 7);
    if (should > f.earned) { const before = f.count; f.count = Math.min(2, f.count + (should - f.earned)); f.earned = should; return f.count > before; }
    return false;
  }
  // Once per calendar day: if whole calendar days were missed, spend safe days to bridge the gap (only when enough to save the chain).
  function freezeCheck() {
    if (!on('freeze')) return;
    const f = frz(), t = today(); if (f.checked === t) return; f.checked = t; freezeEarn();
    const dates = doneDates(); if (!dates.length) return void A.save();
    const last = [dates[dates.length - 1], ...f.used].sort().pop();
    const gap = A.dayDiff(last, t) - 1;
    if (gap > 0 && gap <= f.count) {
      for (let i = 1; i <= gap; i++) f.used.push(addDays(last, i));
      f.count -= gap; f.used = f.used.slice(-30);
      setTimeout(() => A.toast(gap === 1 ? 'دیروز چک‌لیستت ثبت نشد، ولی نگران نباش: یک «روز امن» خرج شد و زنجیره‌ات سالم موند ❄️ امروز از همین‌جا ادامه بده.' : `${fa(gap)} روز نبودی و ${fa(gap)} «روز امن» زنجیره‌ات رو نگه داشت ❄️ خوش برگشتی!`, null, 'calm'), 900);
    } else if (gap > 0 && gap <= 7) {
      setTimeout(() => A.toast('زنجیره‌ی روزها از نو شروع می‌شه، ولی هیچ پیشرفتی پاک نشده. هر روز تیک‌خورده هنوز سر جاشه 🌱', null, 'calm'), 900);
    }
    A.save();
  }

  /* ================= 14. morning check-in ================= */
  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
  const MOODN = ['گرفته', 'نه‌چندان خوب', 'معمولی', 'خوب', 'عالی'];
  const ck = () => store('fa_checkin', () => ({}));
  function lowEnergyTip() {
    const lazy = A.views.lazy && on('lazy');
    return `<div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><b>🪫 امروز روز سبکه</b><button class="fa-x" id="fa-ci-x" type="button" aria-label="بستن">✕</button></div>
      <p class="small">انرژی‌ات پایینه و این کاملاً طبیعیه. امروز فقط همین‌ها کافیه:</p>
      <ul class="fa-ul small"><li>۱۰ دقیقه پیاده‌روی آروم (حتی توی خونه)</li><li>۵ نفس شکمی</li><li>یک لیوان آب و یک میان‌وعده‌ی پروتئین‌دار برای عصر</li></ul>
      <div class="row">${lazy ? '<a class="btn sun" href="#lazy">🛋️ جلسه‌ی تنبل ۵ دقیقه‌ای</a>' : ''}<a class="btn ghost" href="#move">برو به ورزش</a></div>
      <p class="small muted">روزهای کم‌انرژی پرخطرترند. اگه هوس اومد، دکمه‌ی «هوس دارم» رو بزن.</p>`;
  }
  function checkinWidget() {
    if (!on('checkin') || pref().checkin === false) return '';
    const c = ck()[today()];
    if (!c) return `<div class="card fa-ci stack" id="fa-ci" style="gap:8px">
      <b>☀️ امروز چطوری؟</b>
      <div class="fa-taps fa-moods" role="group" aria-label="حال">${MOODS.map((e, i) => `<button type="button" data-mood="${i}" aria-label="${MOODN[i]}">${e}</button>`).join('')}</div>
      <div class="row small" style="gap:6px;flex-wrap:nowrap"><span class="muted">انرژی</span><div class="fa-taps" role="group" aria-label="انرژی از ۱ تا ۵">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-en="${n}" aria-label="انرژی ${fa(n)}">${fa(n)}</button>`).join('')}</div></div></div>`;
    if (c.energy <= 2 && !c.hideTip) return `<div class="card fa-ci stack" id="fa-ci" style="gap:8px">${lowEnergyTip()}</div>`;
    return '';
  }
  function bindCheckin() {
    const box = $('#fa-ci'); if (!box) return;
    const x = $('#fa-ci-x', box); if (x) x.onclick = () => { (ck()[today()] || (ck()[today()] = {})).hideTip = true; A.save(); box.remove(); };
    let mood = null, en = null;
    const done = () => {
      if (mood === null || en === null) return;
      ck()[today()] = { mood, energy: en, t: Date.now() };
      Object.keys(ck()).sort().slice(0, -60).forEach(k => delete ck()[k]);
      A.save();
      if (en <= 2) { box.innerHTML = lowEnergyTip(); bindCheckin(); }
      else { box.innerHTML = `<p class="small"><b>${MOODS[mood]} ثبت شد.</b> ${en >= 4 ? 'با این انرژی، امروز یه پیاده‌روی تندتر می‌چسبه!' : 'روز خوبی بسازیم؛ قدم‌به‌قدم.'}</p>`; setTimeout(() => box.remove(), 2600); }
      updateCompanion();
    };
    $$('[data-mood]', box).forEach(b => b.onclick = () => { mood = +b.dataset.mood; $$('[data-mood]', box).forEach(o => o.classList.toggle('on', o === b)); done(); });
    $$('[data-en]', box).forEach(b => b.onclick = () => { en = +b.dataset.en; $$('[data-en]', box).forEach(o => o.classList.toggle('on', o === b)); done(); });
  }

  /* ================= 2. slow sugar prep week ================= */
  const PREP = [
    ['فقط ببین', 'امروز هر بار قند یا شیرینی خوردی، فقط توی دلت بشمار. قرار نیست چیزی رو کم کنی؛ فقط آگاه شو.', 'آگاهی، قدم اوله.'],
    ['قند چای نصف', 'قند یا نبات هر استکان چای رو نصف کن. اگه دو حبه می‌خوردی، امروز یکی.', 'ذائقه آهسته عوض می‌شه؛ بدن هم وقت می‌خواد.'],
    ['نوشیدنی شیرین بیرون', 'امروز نوشابه، آبمیوه‌ی صنعتی یا شربت رو با آب، دوغ کم‌نمک یا آب و لیموی تازه عوض کن.', 'قند مایع کمتر سیر می‌کنه و راحت زیاد می‌شه.'],
    ['کابینت‌گردی', 'کابینت و یخچال رو نگاه کن. شیرینی‌ها رو بذار توی یک جعبه‌ی دربسته، بالای کابینت، یا ببخش.', 'چیزی که جلوی چشم نیست، کمتر صدات می‌کنه.'],
    ['خرید هوشمند', 'یه لیست خرید بنویس: میوه، گردو، خرما، ماست ساده، دارچین. سیر برو خرید.', 'خرید در حالت گرسنگی سبد رو شیرین‌تر می‌کنه.'],
    ['میان‌وعده‌ی عصر', 'برای ساعتی که معمولاً هوس میاد، از قبل یک میان‌وعده‌ی پروتئین‌دار آماده کن.', 'هوس عصر اغلب از افت انرژی شروع می‌شه.'],
    ['یار و نقشه', 'به یک نفر بگو از فردا شروع می‌کنی و جمله‌ی «اگر هوس کردم، آنگاه…» خودت رو بنویس.', 'گفتن به یک نفر، تعهد رو واقعی‌تر می‌کنه.'],
  ];
  const prep = () => store('fa_prep', () => ({ started: null, done: [], dismissed: false }));
  const prepEligible = () => on('prep') && D().cycle === 1 && D().day === 1 && !(D().log.c1d1 && D().log.c1d1.done) && !(D().completedCycles || []).length;
  const prepDoneN = () => (prep().done || []).filter(Boolean).length;
  function prepOffer() {
    const p = prep(); if (!prepEligible() || p.dismissed || prepDoneN() >= 7) return '';
    if (p.started) return `<a class="fa-slim" href="#slow"><span>🍬</span><span class="small"><b>قند آهسته:</b> ${fa(prepDoneN())} از ۷ قدم آماده‌سازی</span><span class="small muted">ادامه ←</span></a>`;
    return `<div class="fa-prep stack" style="gap:6px"><b>🍬 هنوز آماده نیستی یک‌باره قطع کنی؟</b><p class="small">«قند آهسته» یک هفته‌ی اختیاری قبل از شروعه: هر روز فقط یک کار کوچیک برای کم کردن، نه حذف.</p>
      <div class="row" style="gap:8px"><a class="btn sun" href="#slow">ببینم چیه</a><button class="btn ghost" id="fa-prep-no" type="button">مستقیم شروع می‌کنم</button></div></div>`;
  }
  page('slow', 'قند آهسته', () => {
    const p = prep(), n = prepDoneN();
    const dayN = p.started ? Math.min(7, A.dayDiff(p.started, today()) + 1) : 1;
    return `<section class="wrap auth stack" style="gap:16px;max-width:680px">
      ${head('هفته‌ی آماده‌سازی، اختیاری', 'قند آهسته', 'قطع ناگهانی برای خیلی‌ها سخته. این هفته فقط کم می‌کنیم و خونه رو آماده می‌کنیم. هر روز یک قدم کوچیک.')}
      <div class="card row" style="flex-wrap:nowrap">${miniRing(n, 7, 'var(--sun)')}<div class="stack" style="gap:2px;min-width:0"><b>${n >= 7 ? 'هفته‌ی آماده‌سازی تموم شد! 🎉' : p.started ? `امروز روز ${fa(dayN)} آماده‌سازیه` : 'هر وقت آماده بودی، از قدم ۱ شروع کن'}</b><span class="small muted">لازم نیست حتماً هر روز یکی؛ با سرعت خودت برو.</span></div></div>
      <div class="stack" style="gap:10px">${PREP.map(([t, d, tip], i) => `<label class="check fa-step ${p.started && i + 1 === dayN && !p.done[i] ? 'fa-now' : ''}" for="fa-p${i}"><input type="checkbox" id="fa-p${i}" data-i="${i}" ${p.done[i] ? 'checked' : ''}><span class="stack" style="gap:2px"><b>روز ${fa(i + 1)}، ${t}</b><span class="small">${d}</span><span class="small muted">💡 ${tip}</span></span></label>`).join('')}</div>
      ${n >= 7 || p.started ? `<div class="card stack fa-soft-mint"><b>آماده‌ی روز ۱ هستی؟</b><p class="small">هر وقت دلت خواست برو سراغ برنامه‌ی اصلی. آماده‌سازی تمام‌شده یا نیمه‌کاره، هر دو اوکی‌ان.</p><a class="btn primary" href="#today">برو به روز ۱</a></div>` : ''}
    </section>`;
  }, () => {
    $$('[data-i]').forEach(c => c.onchange = () => {
      const p = prep(); if (!p.started) p.started = today();
      p.done[+c.dataset.i] = c.checked; A.save();
      if (c.checked) { const all = prepDoneN() >= 7; A.toast(all ? 'هفته‌ی آماده‌سازی تموم شد! حالا بدنت و خونه‌ات آماده‌ترن 🌱' : 'آفرین! یک قدم کوچیک، یک قدم واقعی.', null, 'happy'); if (all) A.confetti(); }
      refresh();
    });
  });

  /* ================= 15. body timeline ================= */
  const PHASES = [
    [1, 3, 'خداحافظی اول', '👋', 'ممکنه بیشتر از همیشه به شیرینی فکر کنی. نشانه‌ها و عادت‌های قدیمی هنوز فعال‌اند و این کاملاً قابل‌انتظاره.', 'آب کافی، صبحانه‌ی پروتئین‌دار و دکمه‌ی «هوس دارم» دم دستت باشه.'],
    [4, 7, 'روزهای سخت', '🌧️', 'بعضی‌ها در این روزها بی‌حوصلگی، خستگی یا سردرد خفیف رو گزارش می‌کنن؛ بعضی‌ها هم هیچ‌کدوم رو. این‌ها معمولاً گذران.', 'خواب کافی و آب بیشتر کمک می‌کنه. اگه علائم شدید یا طولانی بود، با پزشک مشورت کن.'],
    [8, 14, 'آروم‌تر شدن موج‌ها', '🌊', 'برای خیلی‌ها هوس‌ها کم‌تکرارتر و کوتاه‌تر می‌شن و انرژی بین وعده‌ها یکنواخت‌تر حس می‌شه.', 'وقت خوبیه برای کشف جایگزین‌های خوشمزه و پیاده‌روی بعد از غذا.'],
    [15, 28, 'ذائقه‌ی تازه', '👅', 'در پژوهش‌ها، کسانی که چند هفته قند رو کم کردن، همون خوراکی‌ها رو شیرین‌تر از قبل حس کردن. شاید میوه برات شیرین‌تر بشه.', 'به مزه‌ها دقت کن و تغییرهای کوچیک رو یادداشت کن.'],
    [29, 42, 'ثبات و اعتماد', '🧭', 'کارهای تازه کم‌کم کم‌زحمت‌تر می‌شن. مهمونی‌ها و روزهای پراسترس هنوز چالش‌اند و برنامه‌ریزی از قبل کمک می‌کنه.', 'جمله‌های تعارف و نقشه‌ی مهمونی رو آماده نگه دار.'],
    [43, 63, 'عادت تازه', '🌳', 'در پژوهش لالی، خودکار شدن یک عادت به‌طور میانگین حدود ۶۶ روز طول کشید، با تفاوت زیاد بین افراد. اینجا داری عادت رو محکم می‌کنی.', 'لغزش‌های گاه‌به‌گاه روند رو خراب نمی‌کنن؛ برگشتن سریع مهمه.'],
  ];
  const progDay = () => { const s = D(); const cur = (s.cycle - 1) * 21 + s.day - ((s.log[A.logKey()] && s.log[A.logKey()].done) || s.cycleDone ? 0 : 1); return Math.max(1, Math.min(63, cur || 1)); };
  page('body', 'خط زمانی بدن', () => {
    const n = progDay(), idx = PHASES.findIndex(p => n >= p[0] && n <= p[1]);
    return `<section class="wrap stack" style="gap:16px;max-width:760px">
      ${head('۶۳ روز در یک نگاه', 'الان در بدن و ذهنت چه می‌گذره؟', 'این‌ها تجربه‌های رایج‌اند، نه قانون. بدن هر کس فرق داره؛ ممکنه زودتر، دیرتر یا اصلاً چیزی حس نکنی.')}
      <div class="card stack" style="gap:6px"><div class="fa-tl-bar" role="img" aria-label="روز ${fa(n)} از ۶۳">${PHASES.map((p, i) => `<i style="flex:${p[1] - p[0] + 1}" class="${i < idx ? 'past' : i === idx ? 'cur' : ''}"></i>`).join('')}<b class="fa-here" style="inset-inline-start:${((n - .5) / 63 * 100).toFixed(1)}%">▼</b></div>
        <div class="row small muted" style="justify-content:space-between"><span>روز ۱</span><b style="color:var(--ink)">📍 تو اینجایی: روز ${fa(n)}</b><span>روز ۶۳</span></div></div>
      <ol class="fa-tl">${PHASES.map((p, i) => `<li class="card stack ${i === idx ? 'pop fa-cur' : i < idx ? 'fa-past' : ''}" style="gap:6px">
        <div class="row" style="justify-content:space-between"><b>${p[3]} ${p[2]}</b><span class="chip ${i === idx ? 'sun' : ''}">روز ${fa(p[0])} تا ${fa(p[1])}</span></div>
        ${i === idx ? '<span class="chip mint" style="align-self:flex-start">📍 تو اینجایی</span>' : ''}
        <p class="small">${p[4]}</p><p class="small muted">✔ ${p[5]}</p></li>`).join('')}</ol>
      <p class="small muted">پایه‌ی این متن‌ها: پژوهش‌های تطبیق ذائقه با کاهش قند و پژوهش لالی و همکاران (۲۰۰۹) درباره‌ی زمان شکل‌گیری عادت. اگر دیابت داری یا دارو مصرف می‌کنی، تغییرهای بزرگ رژیم رو با پزشک هماهنگ کن.</p>
    </section>`;
  });

  /* ================= 4. themed journeys ================= */
  const JOURNEYS = [
    { id: 'tea', icon: '🍵', title: 'چای بی‌قند در ۵ روز', desc: 'قدم‌به‌قدم، از دو حبه قند تا یک استکان چای تازه‌دم و معطر.', steps: [
      ['یک‌چهارم کمتر', 'قند هر استکان رو یک‌چهارم کم کن. قندشکن یا نصف حبه کمکت می‌کنه.', 'قرار نیست امروز صفر بشی؛ ذائقه آهسته عوض می‌شه.'],
      ['همراه معطر', 'چای رو با یک تکه دارچین یا دو دانه هل دم کن و قند رو نصف کن.', 'عطرها حس شیرینی رو بیشتر می‌کنن.'],
      ['قند کنار، نه داخل', 'قند رو توی چای حل نکن؛ کنار استکان بذار و فقط اگه واقعاً خواستی، یک گاز کوچیک بزن.', 'بیشتر وقت‌ها می‌بینی که لازمش نداشتی.'],
      ['یک خرما به‌جای قند', 'یک استکان رو با نصف خرما یا چند دونه کشمش بخور.', 'میوه‌ی خشک فیبر داره؛ ولی اون هم اندازه داره.'],
      ['اولین استکان بی‌قند', 'یک استکان چای تازه‌دمِ کم‌رنگ، کاملاً بی‌قند. آروم و با حواس جمع بنوش.', 'اگه تلخ بود، چای رو کم‌رنگ‌تر و تازه‌تر دم کن.'],
    ] },
    { id: 'party', icon: '🎉', title: 'مهمونی بی‌قند', desc: 'برای مهمونی یا عروسی‌ای که در پیش داری؛ بدون بی‌ادبی و بدون حسرت.', steps: [
      ['سیر برو', 'قبل از رفتن یک میان‌وعده‌ی پروتئین‌دار بخور: ماست، تخم‌مرغ یا یک مشت آجیل.', 'گرسنگی، رد کردن تعارف رو سخت‌تر می‌کنه.'],
      ['جمله‌ی آماده', 'از «بانک جمله‌های تعارف» یک جمله انتخاب کن و دو بار بلند تمرینش کن.', 'جمله‌ای که از قبل تمرین شده، راحت‌تر به زبون میاد.'],
      ['نقشه‌ی سینی', 'تصمیم بگیر وقتی سینی شیرینی اومد چی برمی‌داری (میوه، چای بی‌قند) و دستت رو با یک لیوان آب مشغول کن.', 'تصمیمِ از قبل، جای اراده‌ی لحظه‌ای رو می‌گیره.'],
      ['مرور بعد از مهمونی', 'شب بنویس چی خوب پیش رفت و یک کار که دفعه‌ی بعد متفاوت انجام می‌دی.', 'هر مهمونی، تمرین مهمونی بعدیه.'],
    ] },
    { id: 'evening', icon: '🌇', title: 'عصرهای بی‌هوس', desc: 'ساعت ۴ عصر خطرناک‌ترین ساعت خیلی‌هاست. شش روز برای آروم کردنش.', steps: [
      ['ساعت هوس رو پیدا کن', 'امروز ببین دقیقاً چه ساعتی هوس سراغت میاد و اون لحظه چه حالی داری.', 'شناختن نشانه، نصف راهه.'],
      ['ناهار کامل‌تر', 'به ناهار پروتئین و سبزی اضافه کن.', 'افت انرژی عصر اغلب از ناهار کم‌پروتئین شروع می‌شه.'],
      ['آب ساعت چهار', 'برای ساعت ۴ یادآور بذار و یک لیوان بزرگ آب بخور.', 'تشنگی گاهی شبیه هوس حس می‌شه.'],
      ['میان‌وعده‌ی آماده', 'از صبح یک ظرف کوچیک گردو و دو خرما یا یک سیب کنار دستت بذار.', 'گزینه‌ی سالمِ دم دست، برنده‌ست.'],
      ['ده دقیقه قدم', 'ساعت هوس، ده دقیقه راه برو یا از پله‌ها بالا و پایین برو.', 'حرکت کوتاه، هوس رو کم‌رنگ‌تر می‌کنه.'],
      ['آیین تازه‌ی عصر', 'یک آیین ثابت بساز: چای دارچین + ۵ نفس شکمی + یک پیام کوتاه به یک دوست.', 'آیین تازه جای عادت قدیمی رو می‌گیره.'],
    ] },
    { id: 'night', icon: '🌙', title: 'شب‌چره‌ی سالم', desc: 'برای کسانی که ریزه‌خواری شبانه دارن؛ پنج شب تا آشپزخونه‌ی آروم.', steps: [
      ['آشپزخونه ساعت داره', 'یک ساعت انتخاب کن (مثلاً ۹ شب) که بعدش آشپزخونه تعطیله.', 'مرز روشن، تصمیم‌گیری رو ساده می‌کنه.'],
      ['شام کامل', 'شام با پروتئین و سبزی بخور تا نیمه‌شب گرسنه نشی.', 'گرسنگی واقعی رو با غذای واقعی جواب بده.'],
      ['مسواک زودتر', 'بعد از شام زود مسواک بزن؛ این یعنی «خوردن برای امروز تموم شد».', 'یک نشانه‌ی پایان ساده و قوی.'],
      ['جایگزین شب', 'اگه شب واقعاً گرسنه شدی: یک لیوان شیر گرم با دارچین یا چند عدد بادام.', 'جایگزینِ از قبل تعیین‌شده، جلوی گشتن توی کابینت رو می‌گیره.'],
      ['صفحه‌ها خاموش', 'نیم ساعت قبل خواب گوشی رو کنار بذار.', 'کم‌خوابی، هوس فردا رو بیشتر می‌کنه.'],
    ] },
  ];
  const jp = () => store('fa_paths', () => ({ active: null, prog: {} }));
  const jProg = id => (jp().prog[id] = jp().prog[id] || { done: [], started: null });
  function activeJourneyChip() {
    const j = JOURNEYS.find(x => x.id === jp().active); if (!j || !on('journeys')) return '';
    const pr = jProg(j.id), n = pr.done.length; if (n >= j.steps.length) return '';
    const todayDone = pr.done.includes(today());
    return `<a class="chip ${todayDone ? 'mint' : 'lav'}" href="#paths">${j.icon} ${todayDone ? 'قدم امروز ✓' : `قدم ${fa(n + 1)}: ${j.steps[n][0]}`}</a>`;
  }
  page('paths', 'مسیرهای موضوعی', () => {
    const s = jp();
    const cards = JOURNEYS.map(j => {
      const pr = jProg(j.id), n = pr.done.length, fin = n >= j.steps.length, act = s.active === j.id;
      const todayDone = pr.done.includes(today());
      return `<div class="card stack ${act ? 'pop' : ''}" style="gap:10px">
        <div class="row" style="flex-wrap:nowrap;justify-content:space-between;align-items:flex-start"><div class="row" style="flex-wrap:nowrap;gap:10px;min-width:0;align-items:flex-start"><span class="fa-big-i">${j.icon}</span><div class="stack" style="gap:0;min-width:0"><h3>${j.title}</h3><span class="small muted">${j.desc}</span></div></div>${miniRing(n, j.steps.length, fin ? 'var(--mint)' : 'var(--lav)')}</div>
        ${act || fin ? `<ol class="fa-steps">${j.steps.map(([t, task, tip], i) => `<li class="${i < n ? 'ok' : i === n && !fin ? 'now' : ''}"><b>${t}</b>${i === n && !fin ? `<p class="small">${task}</p><p class="small muted">💡 ${tip}</p>${j.id === 'party' && i === 1 && on('taarof') ? '<a class="small" href="#phrases">باز کردن بانک جمله‌ها ←</a>' : ''}` : ''}</li>`).join('')}</ol>` : ''}
        ${fin ? `<div class="row"><span class="chip mint">🏅 این مسیر رو کامل کردی</span><button class="btn ghost" data-restart="${j.id}" type="button">دوباره</button></div>`
          : act ? (todayDone ? `<p class="small muted">قدم امروز انجام شد ✓ قدم بعدی فردا باز می‌شه؛ یک قدم در روز کافیه.</p>` : `<button class="btn primary" data-step="${j.id}" type="button">✓ قدم ${fa(n + 1)} رو انجام دادم</button>`)
          : `<button class="btn" data-start="${j.id}" type="button">${n ? 'ادامه‌ی این مسیر' : 'شروع این مسیر'}</button>`}
      </div>`;
    }).join('');
    return `<section class="wrap stack" style="gap:16px;max-width:820px">
      ${head('سفرهای کوچک', 'مسیرهای موضوعی', 'یک هدف کوچک و مشخص، روزی یک قدم. هم‌زمان فقط یک مسیر فعال داری تا ذهنت شلوغ نشه.')}
      <div class="stack">${cards}</div></section>`;
  }, () => {
    $$('[data-start]').forEach(b => b.onclick = () => { jp().active = b.dataset.start; const pr = jProg(b.dataset.start); pr.started = pr.started || today(); A.save(); refresh(); });
    $$('[data-restart]').forEach(b => b.onclick = () => { jp().prog[b.dataset.restart] = { done: [], started: today() }; jp().active = b.dataset.restart; A.save(); refresh(); });
    $$('[data-step]').forEach(b => b.onclick = () => {
      const j = JOURNEYS.find(x => x.id === b.dataset.step), pr = jProg(j.id);
      if (pr.done.includes(today())) return;
      pr.done.push(today());
      if (pr.done.length >= j.steps.length) { jp().active = null; A.confetti(); A.toast(`مسیر «${j.title}» تموم شد! 🏅 یه مسیر تازه انتخاب کن یا چند روز از نتیجه‌اش لذت ببر.`, 'trophy'); }
      else A.toast('قدم امروز ثبت شد. فردا قدم بعدی منتظرته 🌱', null, 'happy');
      A.save(); refresh();
    });
  });

  /* ================= 5. X times in Y days challenges ================= */
  const CHAL = [
    { id: 'walk5', icon: '🚶', title: '۵ پیاده‌روی در ۷ روز', field: 'walk', target: 5, win: 7, color: 'var(--mint)', hint: 'پیاده‌روی کامل روز (طبق برنامه‌ی ورزش) حساب می‌شه.' },
    { id: 'breath6', icon: '🌬️', title: '۶ روز تنفس شکمی در ۷ روز', field: 'breath', target: 6, win: 7, color: 'var(--lav)', hint: 'تعداد نفس شکمیِ روز کامل بشه.' },
    { id: 'night7', icon: '🌙', title: '۷ چک‌لیست شب در ۱۰ روز', field: 'night', target: 7, win: 10, color: 'var(--sun)', hint: 'هر شب که چک‌لیست رو ثبت کنی.' },
    { id: 'clean5', icon: '🌿', title: '۵ روز بی‌لغزش در ۷ روز', field: 'clean', target: 5, win: 7, color: 'var(--mint)', hint: 'روزهایی که در چک‌لیست «قند نخوردم» زدی.' },
    { id: 'sos3', icon: '🛡️', title: '۳ هوسِ ردشده در ۷ روز', field: 'sos', target: 3, win: 7, color: 'var(--berry)', hint: 'با دکمه‌ی «هوس دارم» و زدن «رد شد!».' },
    { id: 'routine3', icon: '🧘', title: '۳ جلسه‌ی حرکتی در ۷ روز', field: 'routine', target: 3, win: 7, color: 'var(--lav)', hint: 'جلسه‌ی یوگا یا پیلاتس روز در بخش ورزش.' },
  ];
  const chs = () => store('fa_chal', () => ({ wins: {} }));
  function chalProgress() {
    const m = acts(), t = today();
    return CHAL.map(c => { let v = 0; for (let i = 0; i < c.win; i++) { const o = m[addDays(t, -i)]; if (o) v += o[c.field]; } return { ...c, v: Math.min(v, c.target) }; });
  }
  function chalAward() {
    if (!on('challenges')) return;
    const st = chs(), t = today(); const changed = [];
    chalProgress().forEach(c => {
      const w = st.wins[c.id] = st.wins[c.id] || [];
      const last = w[w.length - 1];
      if (c.v >= c.target && (!last || A.dayDiff(last, t) >= c.win)) { w.push(t); changed.push(c); }
    });
    if (changed.length) { A.save(); const c = changed[0]; setTimeout(() => A.toast(changed.length > 1 ? `${fa(changed.length)} چالش با هم کامل شد! ${c.icon}🏅 سر بزن به «چالش‌ها».` : `چالش «${c.title}» کامل شد! ${c.icon}🏅`, 'trophy'), 3500); }
  }
  function bestChalChip() {
    if (!on('challenges')) return '';
    const p = chalProgress().filter(c => c.v < c.target).sort((a, b) => b.v / b.target - a.v / a.target)[0];
    return p ? `<a class="chip sun" href="#challenges">${p.icon} ${fa(p.v)}/${fa(p.target)} چالش</a>` : `<a class="chip mint" href="#challenges">🏅 همه‌ی چالش‌ها کامل!</a>`;
  }
  page('challenges', 'چالش‌ها', () => {
    const st = chs(), ps = chalProgress(), f = frz();
    return `<section class="wrap stack" style="gap:16px;max-width:820px">
      ${head('چالش‌های کوتاه', '«X بار در Y روز»', 'لازم نیست کاری اضافه کنی: هر چیزی که در برنامه ثبت می‌کنی، خودکار اینجا حساب می‌شه. پنجره‌ی هر چالش، روزهای اخیره.')}
      <div class="fa-chal-grid">${ps.map(c => { const n = (st.wins[c.id] || []).length; const done = c.v >= c.target;
        return `<div class="card stack ${done ? 'done-card' : ''}" style="gap:6px;align-items:center;text-align:center">${miniRing(c.v, c.target, c.color, c.icon)}<b>${c.title}</b><span class="small num">${fa(c.v)} از ${fa(c.target)}، ${fa(c.win)} روز اخیر</span><span class="small muted">${c.hint}</span>${n ? `<span class="chip mint">🏅 ${fa(n)} بار برنده شدی</span>` : ''}</div>`; }).join('')}</div>
      ${on('freeze') ? `<div class="card stack fa-soft-lav" style="gap:6px"><b>❄️ روز امن: ${fa(f.count)} از ۲</b><p class="small">به ازای هر ۷ روز بی‌لغزش یک «روز امن» می‌گیری (حداکثر ۲ تا). اگه یک روز چک‌لیستت جا بمونه، روز امن خودکار خرج می‌شه و زنجیره‌ات نمی‌شکنه. ${f.used.length ? `تا حالا ${fa(f.used.length)} روز ازش استفاده کردی.` : ''}</p></div>` : ''}
    </section>`;
  });

  /* ================= 10. 3-minute lesson quiz ================= */
  // [question, [correct, wrong, wrong], why]; options are shuffled on display.
  const Q = {
    c1: [
      ['طبق متن، کدام انگیزه تغییر رو پایدارتر نگه می‌داره؟', ['انگیزه‌ای که از ارزش‌های خودت میاد', 'فشار و حرف دیگران', 'ترس از عدد ترازو'], 'انگیزه‌ی درونی در پژوهش‌ها با پایداری بیشتر تغییر همراه بوده.'],
      ['ثبت هوس‌ها چه کمکی می‌کنه؟', ['الگوهای پنهان هوس رو نشون می‌ده', 'هوس رو فوراً از بین می‌بره', 'فقط به درد پزشک می‌خوره'], 'خودپایشی از قوی‌ترین پیش‌بینی‌کننده‌های موفقیته.'],
      ['سه جزء حلقه‌ی عادت کدام‌اند؟', ['نشانه، رفتار، پاداش', 'گرسنگی، غذا، سیری', 'صبح، ظهر، شب'], 'شناختن نشانه‌ها نیمی از تغییره.'],
      ['در روزهای سخت اول، کدام کار ساده کمک می‌کنه؟', ['آب کافی و استراحت', 'حذف یک‌باره‌ی همه‌ی غذاها', 'جبران با نوشابه‌ی رژیمی زیاد'], 'کم‌آبی خفیف می‌تونه سردرد و خستگی بیاره و با هوس اشتباه گرفته بشه.'],
      ['در «موج‌سواری روی هوس» با هوس چه می‌کنی؟', ['نگاهش می‌کنی تا اوج بگیره و فروکش کنه', 'سریع چیزی می‌خوری تا تموم بشه', 'با سرزنش سرکوبش می‌کنی'], 'هوس مثل موجه: بالا میاد و پایین می‌ره.'],
      ['کدام تغییر محیطی، مصرف شیرینی رو کمتر می‌کنه؟', ['ظرف دربسته و دور از چشم', 'ظرف شکلات روی میز کار', 'خرید بسته‌های بزرگ‌تر'], 'فقط دورتر گذاشتن خوراکی، مصرفش رو کم کرده.'],
      ['چه پاداشی برای هفته‌ی اول مناسب‌تره؟', ['یک پاداش غیرخوراکی دلخواه', 'یک جعبه شیرینی', 'هیچی؛ پیشرفت کوچک جشن نداره'], 'دیدن پیشرفت کوچک، خودکارآمدی رو بالا می‌بره.'],
      ['چرا قند مایع (مثل نوشابه) راحت‌تر زیاد می‌شه؟', ['سیری کمتری از غذای جامد میاره', 'چون کالری نداره', 'چون دیرتر جذب می‌شه'], 'قند مایع کمتر سیر می‌کنه.'],
      ['بهترین راه کم کردن قند چای چیه؟', ['کم کردن تدریجی در چند روز', 'از فردا صفر بدون آمادگی', 'عسل زیاد به‌جای قند'], 'ترجیح شیرینی ثابت نیست و آروم‌آروم تنظیم می‌شه.'],
      ['کدام یک نقشه‌ی «اگر–آنگاه» درسته؟', ['اگر ساعت ۴ هوس کردم، آنگاه آب می‌خورم و ۵ دقیقه قدم می‌زنم', 'سعی می‌کنم کمتر شیرینی بخورم', 'از فردا آدم بهتری می‌شم'], 'نقشه‌ی مشخص «اگر–آنگاه» اثر قابل‌توجهی بر رسیدن به هدف داره.'],
      ['HALT به کدام حالت‌ها اشاره داره؟', ['گرسنه، عصبانی، تنها، خسته', 'شاد، آرام، سیر، پرانرژی', 'صبح، ظهر، عصر، شب'], 'هر کدوم از این حالت‌ها میل به شیرینی رو بیشتر می‌کنه.'],
      ['بعد از یک لغزش، کدام واکنش کمک بیشتری می‌کنه؟', ['مهربانی با خود و ادامه از وعده‌ی بعد', 'سرزنش و جریمه‌ی خود', '«حالا که خراب شد، کل امروز رو بخورم»'], 'خودشفقتی با بازگشت سریع‌تر به هدف همراهه.'],
      ['با فکر «یه دونه که چیزی نمی‌شه» در بازسازی شناختی چه می‌کنیم؟', ['شواهدش رو بررسی و فکر متعادل‌تری می‌سازیم', 'بی‌چون‌وچرا قبولش می‌کنیم', 'سعی می‌کنیم اصلاً بهش فکر نکنیم'], 'بازسازی شناختی از اجزای اصلی CBT است.'],
      ['طبق بندورا، قوی‌ترین منبع خودکارآمدی چیه؟', ['تجربه‌ی موفقیت‌های واقعی، حتی کوچک', 'تعریف دیگران', 'خوندن داستان آدم‌های موفق'], 'هر روز موفق، باور «من می‌تونم» رو می‌سازه.'],
      ['کدام صبحانه هوس عصر رو کمتر می‌کنه؟', ['تخم‌مرغ با نان سبوس‌دار و سبزی', 'نان سفید و مربا', 'فقط یک چای شیرین'], 'پروتئین و فیبر افت‌وخیز قند خون رو کم می‌کنن.'],
      ['کدام کار ساده بعد از غذا با قند خون آرام‌تر همراه بوده؟', ['یک پیاده‌روی کوتاه', 'خوابیدن بلافاصله', 'یک دسر کوچک'], 'چند دقیقه راه رفتن بعد از غذا کمک می‌کنه.'],
      ['کم‌خوابی چطور هوس رو بیشتر می‌کنه؟', ['هورمون گرسنگی بالا و هورمون سیری پایین میاد', 'هیچ ارتباطی ندارن', 'فقط تشنگی رو زیاد می‌کنه'], 'گرلین بالا و لپتین پایین: میل بیشتر به غذاهای پرانرژی.'],
      ['کدام الگوی تنفس، سیستم آرام‌سازی بدن رو فعال‌تر می‌کنه؟', ['بازدم طولانی‌تر از دم', 'نفس‌های سریع و کوتاه', 'حبس نفس تا جای ممکن'], 'بازدم بلند، سیستم پاراسمپاتیک رو فعال می‌کنه.'],
      ['با کم کردن قند در چند هفته، معمولاً ذائقه چطور می‌شه؟', ['همون خوراکی‌ها شیرین‌تر به نظر میان', 'ذائقه هیچ‌وقت عوض نمی‌شه', 'فقط شیرینی‌های خیلی شیرین مزه می‌دن'], 'تطبیق حس چشایی در پژوهش‌ها دیده شده.'],
      ['دوپامین بیشتر در چه چیزی نقش داره؟', ['انگیزه و «خواستن» پاداش', 'هضم قند', 'فقط خواب'], 'دوپامین بیشتر به «خواستن» مربوطه تا خود لذت.'],
      ['چرا نوشتن روایت تجربه‌ها در پایان دوره مفیده؟', ['به تغییر معنا می‌ده و حس کنترل رو بیشتر می‌کنه', 'چون باید به کسی گزارش بدی', 'فایده‌ای نداره'], 'نوشتن بیانگر با حس کنترل بیشتر همراهه.'],
    ],
    c2: [
      ['«زنجیره‌سازی عادت» یعنی چه؟', ['وصل کردن عادت تازه به یک کار ثابت روزانه', 'انجام همه‌ی عادت‌ها در یک ساعت', 'هر روز عوض کردن عادت'], 'بافت ثابت، عادت رو خودکار می‌کنه.'],
      ['چرا خرما رو همراه گردو پیشنهاد می‌کنیم؟', ['چربی و پروتئین گردو سرعت بالا رفتن قند خون رو کم می‌کنه', 'چون شیرین‌ترش می‌کنه', 'چون خرما قند نداره'], 'ترکیب قند طبیعی با چربی و پروتئین، جذب رو آرام‌تر می‌کنه.'],
      ['خوردن جلوی صفحه‌نمایش با چه چیزی همراه بوده؟', ['خوردن بیشتر در همون وعده و وعده‌ی بعد', 'سیری سریع‌تر', 'هضم بهتر'], 'حواس‌پرتی، سیگنال سیری رو کم‌رنگ می‌کنه.'],
      ['«پاسخ رقیب» یعنی چه؟', ['رفتاری که با رفتار قدیمی هم‌زمان شدنی نیست، مثل مسواک زدن', 'رقابت با دیگران سر کمتر خوردن', 'خوردن سریع‌تر شیرینی'], 'پاسخ رقیب از مؤلفه‌های اثربخش درمان عادته.'],
      ['«ترکیب وسوسه» یعنی چه؟', ['پادکست محبوبت رو فقط حین پیاده‌روی گوش بدی', 'شیرینی رو با میوه قاطی کنی', 'وسوسه رو با وسوسه‌ی دیگه سرکوب کنی'], 'گره زدن لذت به رفتار سالم، تکرارش رو بیشتر می‌کنه.'],
      ['شرطی شدن «شیرینی بعد از غذا» چطور ضعیف می‌شه؟', ['چند بار پایان غذا رو با یک آیین تازه و بدون شیرینی تکرار کنی', 'فقط شیرینی رو کوچیک‌تر کنی', 'غذا رو حذف کنی'], 'شرطی‌سازی با تکرار بدون پاداش قدیمی خاموش می‌شه.'],
      ['در پژوهش لالی، جا انداختن گاه‌به‌گاه یک روز چه اثری داشت؟', ['روند شکل‌گیری عادت رو مختل نکرد', 'همه‌چیز از صفر شروع شد', 'عادت دو برابر سریع‌تر شد'], 'یک روز جا افتاده، شکست نیست.'],
      ['سازمان جهانی بهداشت برای فواید بیشتر، قند آزاد رو زیر حدوداً چند گرم در روز پیشنهاد می‌کنه؟', ['حدود ۲۵ گرم', 'حدود ۱۰۰ گرم', 'محدودیتی نیست'], 'زیر ۵٪ انرژی روزانه، حدود ۲۵ گرم.'],
      ['اگر قند در سه جایگاه اول فهرست مواد باشه یعنی چه؟', ['احتمالاً محصول پرقنده', 'محصول بی‌قنده', 'ترتیب فهرست معنایی نداره'], 'مواد به ترتیب نزولی مقدار نوشته می‌شن.'],
      ['کدام عطرها درک شیرینی رو بدون شکر بیشتر می‌کنن؟', ['دارچین، هل، وانیل و گلاب', 'نمک و فلفل', 'سرکه و لیمو'], 'برهم‌کنش بو و طعم، شیرینی رو پررنگ‌تر حس می‌کنه.'],
      ['چرا بهتره گرسنه خرید نری؟', ['خرید در گرسنگی با خرید بیشتر خوراکی پرکالری همراهه', 'چون فروشگاه شلوغ‌تره', 'فرقی نمی‌کنه'], 'سیر برو، با لیست برو.'],
      ['برچسب «سالم» یا «کم‌چرب» ممکنه چه اثری بذاره؟', ['باعث بشه بیشتر بخوریم', 'یعنی حتماً بی‌قنده', 'کالری رو صفر می‌کنه'], 'به این می‌گن هاله‌ی سلامت.'],
      ['نظر سازمان جهانی بهداشت (۲۰۲۳) درباره‌ی شیرین‌کننده‌های غیرقندی برای کنترل وزن؟', ['برای درازمدت توصیه نشده؛ بهتره کل شیرینی کم بشه', 'بهترین راه کاهش وزنه', 'هر مقدار بی‌خطره'], 'هدف، کم کردن کلی شیرینیه.'],
      ['فهرست ثابت خوراکی‌های بررسی‌شده چه کمکی می‌کنه؟', ['بار تصمیم‌گیری روزانه رو کم می‌کنه', 'خرید رو گرون‌تر می‌کنه', 'تنوع رو از بین می‌بره'], 'تصمیم کمتر، انتخاب سالم خودکارتر.'],
      ['کدام نشانه بیشتر به گرسنگی هیجانی اشاره داره؟', ['ناگهانی میاد و یک خوراکی خاص می‌خواد', 'آروم میاد و با هر غذایی سیر می‌شی', 'چند ساعت بعد از وعده پیدا می‌شه'], 'گرسنگی دل ناگهانی و انتخابیه.'],
      ['نام بردن از احساس (مثلاً «الان دلخورم») چه اثری داره؟', ['شدت واکنش هیجانی رو کم می‌کنه', 'احساس رو قوی‌تر می‌کنه', 'اثری نداره'], 'نام‌گذاری هیجان، فعالیت آمیگدالا رو کمتر کرده.'],
      ['وقتی دلت شیرینی می‌خواد ولی در واقع دلتنگی، چه جایگزینی بهتره؟', ['یک تماس کوتاه با یک عزیز', 'یک بسته بیسکویت', 'تنها موندن'], 'حمایت اجتماعی استرس رو کم می‌کنه.'],
      ['کدام جواب به تعارف هم مؤدبانه‌ست هم قاطع؟', ['«دستتون درد نکنه، خیلی قشنگه؛ ولی من الان نمی‌خورم»', '«شیرینی سمه، چرا اینا رو می‌خورید؟»', '«باشه» و بعد پشیمونی'], 'قدردانی + «نه» روشن، بدون نصیحت.'],
      ['هسته‌ی مدل پیشگیری از بازگشت مارلات چیه؟', ['برنامه‌ریزی از پیش برای موقعیت‌های پرخطر', 'دوری از همه‌ی مهمونی‌ها', 'تکیه به اراده‌ی لحظه‌ای'], 'نقشه‌ی از قبل، کار رو در لحظه آسون می‌کنه.'],
      ['داشتن یک هم‌راه یا کسی که بهش گزارش بدی چه اثری داره؟', ['پایبندی به هدف بیشتر می‌شه', 'انگیزه کم می‌شه', 'فرقی نداره'], 'پاسخ‌گویی به یک نفر از قوی‌ترین نیروهای ادامه دادنه.'],
      ['چرا راهبردها رو در یک برگه‌ی کوچک خلاصه می‌کنیم؟', ['تا در لحظه‌ی پرخطر سریع یادمون بیاد', 'برای امتحان', 'برای اینکه بعداً دورش بندازیم'], 'دسترسی سریع یعنی استفاده‌ی واقعی.'],
    ],
    c3: [
      ['کدام جمله یک عادت هویت‌محوره؟', ['«من کسی‌ام که به بدنش اهمیت می‌ده»', '«باید شیرینی رو کم کنم»', '«امیدوارم بتونم»'], 'رفتار هماهنگ با هویت، ماندگارتره.'],
      ['کدام عبارت با مقاومت بیشتر در برابر وسوسه همراه بود؟', ['«نمی‌خورم»', '«نمی‌تونم بخورم»', '«نباید بخورم»'], '«نمی‌خورم» یعنی انتخاب من، نه ممنوعیت.'],
      ['در درمان پذیرش و تعهد، ارزش‌ها چه کمکی می‌کنن؟', ['در شرایط سخت جهت رو نشون می‌دن', 'جای برنامه‌ی غذایی رو می‌گیرن', 'فقط برای شغل‌اند'], 'ارزش‌ها مثل قطب‌نما عمل می‌کنن.'],
      ['۱۵ دقیقه پیاده‌روی تند در یک مطالعه چه اثری روی هوس شکلات داشت؟', ['کمش کرد', 'بیشترش کرد', 'اثری نداشت'], 'حرکت کوتاه، ابزار ضدهوسه.'],
      ['چرا ادویه‌های معطر رضایت از غذا رو بیشتر می‌کنن؟', ['بخش بزرگی از طعم از بو میاد', 'چون قند دارن', 'چون اشتها رو کور می‌کنن'], 'بو، بخش پنهان مزه‌ست.'],
      ['خودشفقتی با کدام مورد همراه بوده؟', ['انگیزه‌ی بیشتر برای جبران و بهتر شدن', 'بی‌مسئولیتی', 'پرخوری بیشتر'], 'مهربانی با خود، تنبلی نیست.'],
      ['تمرین «بهترین خود ممکن» چه اثری داره؟', ['خوش‌بینی و انگیزه رو بیشتر می‌کنه', 'خسته‌کننده‌ست', 'فقط برای کودکانه'], 'تصویر روشن از آینده، امروز رو جهت می‌ده.'],
      ['در مدل مارلات چه چیزی احتمال لغزش رو کم می‌کنه؟', ['یک پاسخ مقابله‌ای آماده برای موقعیت پرخطر', 'امید به اینکه موقعیت پیش نیاد', 'تنبیه بعد از لغزش'], 'پاسخ آماده، خودکارآمدی رو بالا می‌بره.'],
      ['«تصمیم به‌ظاهر بی‌ربط» یعنی چه؟', ['انتخاب کوچکی که آروم‌آروم به موقعیت پرخطر می‌رسونه', 'تصمیمی که هیچ اثری نداره', 'تصمیم برای ورزش'], 'مثل «از جلوی شیرینی‌فروشی رد شم، فقط نگاه می‌کنم».'],
      ['مهم‌ترین کار بعد از یک لغزش چیه؟', ['برگشتن سریع به روال، از وعده‌ی بعد', 'شروع دوباره از ماه بعد', 'کنار گذاشتن برنامه'], 'لغزش، بازگشت نیست.'],
      ['پیش‌تعهد در مناسبت‌ها یعنی چه؟', ['از قبل تصمیم بگیری چی و چقدر می‌خوری', 'قول بدی هیچ مهمونی نری', 'هر چی پیش اومد'], 'تصمیم از پیش، نیاز به مقاومت لحظه‌ای رو کم می‌کنه.'],
      ['«برنامه‌ی حداقلی» برای روزهای بی‌روال یعنی چه؟', ['کوچک‌ترین نسخه‌ی عادت‌ها، مثل ۵ دقیقه قدم و یک چای بی‌قند', 'تعطیلی کامل تا برگشتن', 'دو برابر کردن برنامه بعد از سفر'], 'کم ولی ادامه‌دار، بهتر از هیچه.'],
      ['«جعبه‌ی آرامش» چیه؟', ['فهرستی از کارهای آرام‌کننده که از قبل آماده کردی', 'جعبه‌ای پر از شکلات', 'یک بازی موبایل'], 'برای لحظه‌های بحرانی از قبل آماده شو.'],
      ['چرا برنامه‌ی پیشگیری رو مکتوب می‌کنیم؟', ['در لحظه‌ی سخت ذهن شلوغه و برگه‌ی نوشته راهنمای آماده‌ست', 'چون حفظ کردنش ممنوعه', 'فقط برای تزئین'], 'نوشتن، فکر رو بیرون از ذهن نگه می‌داره.'],
      ['کنترل منعطف خوردن در برابر «همه یا هیچ» با چه چیزی همراه بوده؟', ['پرخوری کمتر و ثبات بیشتر', 'پرخوری بیشتر', 'تفاوتی ندارن'], 'انعطاف، پایداری می‌سازه.'],
      ['«سیری حسی ویژه» یعنی چه؟', ['لذت از یک طعم با ادامه‌ی خوردن کم‌کم افت می‌کنه', 'هر چه بیشتر بخوری لذت بیشتره', 'سیری فقط به حجم معده بستگی داره'], 'لقمه‌ی اول همیشه خوشمزه‌ترینه.'],
      ['چرا آروم غذا خوردن کمک می‌کنه؟', ['سیگنال سیری چند دقیقه طول می‌کشه تا به مغز برسه', 'چون غذا سرد می‌شه', 'چون کالری غذا کم می‌شه'], 'آروم خوردن، فرصت شنیدن بدنه.'],
      ['طبق نظریه‌ی یادگیری اجتماعی، عادت‌ها چطور منتقل می‌شن؟', ['با دیدن رفتار آدم‌های نزدیک', 'فقط با ژن', 'فقط با کتاب'], 'تو هم برای اطرافیانت الگویی.'],
      ['بعد از پایان برنامه، چه چیزی به ماندگاری کمک بیشتری می‌کنه؟', ['ادامه‌ی پایش سبک و بازبینی دوره‌ای', 'فراموش کردن برنامه', 'وزن کردن هر ساعت'], 'پایش سبک، از قوی‌ترین عوامل پایداریه.'],
      ['احساس پیوستگی با «خود آینده» با چه چیزی همراه بوده؟', ['تصمیم‌های سالم‌تر و آینده‌نگرانه‌تر', 'اضطراب بیشتر', 'تصمیم‌های عجولانه'], 'خود آینده‌ات هم آدم واقعیه.'],
      ['قدردانی منظم با چه چیزی همراه بوده؟', ['بهزیستی بیشتر و انگیزه‌ی پایدارتر', 'توقع کمتر از زندگی', 'هیچ اثری'], 'قدردانی سوخت ادامه دادنه.'],
    ],
  };
  const qz = () => store('fa_quiz', () => ({ ans: {}, review: [] }));
  const qFor = key => { const m = /^c(\d)d(\d+)$/.exec(key); const b = m && Q['c' + m[1]]; return b ? b[(+m[2] - 1) % b.length] : null; };
  const qOrder = key => [[0, 1, 2], [1, 0, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0]][hash(key) % 6];
  const dueReview = () => qz().review.find(r => r.due <= today() && r.key !== A.logKey());
  function quizCard(key, isReview) {
    const q = qFor(key); if (!q) return '';
    const a = qz().ans[key], ord = qOrder(key);
    const lbl = isReview ? '🔁 مرور: سؤالی از چند روز پیش' : '🧠 سؤال یک‌دقیقه‌ای درس امروز';
    if (a && a.date === today() && !isReview) return `<div class="card fa-quiz stack" id="fa-quiz" style="gap:6px"><div class="row" style="justify-content:space-between"><span class="eyebrow">${lbl}</span><span class="chip ${a.ok ? 'mint' : 'berry'}">${a.ok ? '✓ درست' : '↺ سه روز دیگه مرورش می‌کنیم'}</span></div><p class="small"><b>${q[0]}</b></p><p class="small muted">✔ ${q[1][0]}، ${q[2]}</p></div>`;
    return `<div class="card fa-quiz stack" id="fa-quiz" data-key="${key}" data-rev="${isReview ? 1 : ''}" style="gap:8px"><span class="eyebrow">${lbl}</span><b>${q[0]}</b>
      <div class="fa-opts">${ord.map(i => `<button type="button" data-o="${i}">${q[1][i]}</button>`).join('')}</div><p class="small" id="fa-qr" aria-live="polite"></p></div>`;
  }
  function quizWidget() {
    if (!on('quiz') || pref().quiz === false || D().cycleDone) return '';
    const key = A.logKey(), a = qz().ans[key];
    if (a) { const r = dueReview(); if (r) return quizCard(r.key, true); }
    if (a && a.date !== today()) return `<a class="fa-slim" href="#quiz"><span>🧠</span><span class="small">سؤال این درس رو قبلاً جواب دادی ${a.ok ? '✓' : ''}</span><span class="small muted">مرور ←</span></a>`;
    return quizCard(key, false);
  }
  function answerQuiz(key, picked, isReview) {
    const st = qz(), ok = picked === 0;
    st.review = st.review.filter(r => r.key !== key);
    if (!ok) st.review.push({ key, due: addDays(today(), 3) });
    if (isReview) st.ans[key] = { ...(st.ans[key] || {}), reviewOk: ok, reviewDate: today() };
    else st.ans[key] = { ok, picked, date: today() };
    A.save(); return ok;
  }
  function bindQuiz() {
    const box = $('#fa-quiz[data-key]'); if (!box) return;
    const key = box.dataset.key, rev = !!box.dataset.rev, q = qFor(key);
    $$('[data-o]', box).forEach(b => b.onclick = () => {
      const ok = answerQuiz(key, +b.dataset.o, rev);
      $$('[data-o]', box).forEach(x => { x.disabled = true; if (+x.dataset.o === 0) x.classList.add('ok'); else if (x === b) x.classList.add('no'); });
      $('#fa-qr', box).innerHTML = (ok ? '<b>آفرین، درسته! ✨</b> ' : '<b>نزدیک بود.</b> سه روز دیگه دوباره ازت می‌پرسیم. ') + esc(q[2]);
      updateCompanion();
    });
  }
  page('quiz', 'کوییز درس‌ها', () => {
    const st = qz(), keys = Object.keys(st.ans).sort((a, b) => (st.ans[b].date || '').localeCompare(st.ans[a].date || ''));
    const ok = keys.filter(k => st.ans[k].ok).length, r = dueReview();
    return `<section class="wrap auth stack" style="gap:16px;max-width:680px">
      ${head('درس ۳ دقیقه‌ای', 'کوییز درس‌ها', 'بعد از هر متن روزانه یک سؤال. اگه اشتباه جواب بدی، سه روز بعد دوباره میاد؛ این‌طوری بهتر توی ذهن می‌مونه.')}
      <div class="card stat-row"><div><b class="num">${fa(keys.length)}</b><span class="small muted">جواب داده</span></div><div><b class="num">${fa(ok)}</b><span class="small muted">درست</span></div><div><b class="num">${fa(st.review.length)}</b><span class="small muted">در صف مرور</span></div></div>
      ${r ? quizCard(r.key, true) : '<div class="card small muted">فعلاً سؤالی برای مرور نداری 🌿</div>'}
      ${keys.length ? `<div class="card stack" style="gap:8px"><b>سؤال‌های قبلی</b>${keys.slice(0, 30).map(k => { const q = qFor(k); return q ? `<details class="fa-det"><summary><span class="chip ${st.ans[k].ok ? 'mint' : 'berry'}">${st.ans[k].ok ? '✓' : '↺'}</span> ${q[0]}</summary><p class="small">✔ ${q[1][0]}</p><p class="small muted">${q[2]}</p></details>` : ''; }).join('')}</div>` : ''}
    </section>`;
  }, () => bindQuiz());

  /* ================= 6. companion & energy ================= */
  const LINES = {
    low: ['سلام! من اینجام. هر وقت آماده بودی، با یه کار کوچیک شروع کنیم؟', 'یه لیوان آب بخوریم؟ برای شروع روز عالیه 💧', 'امروز لازم نیست قهرمان باشی؛ فقط یه قدم کوچیک.', 'دلم یه پیاده‌روی کوتاه می‌خواد… با من میای؟', 'متن امروز رو بخونیم؟ فقط سه دقیقه‌ست.', 'اگه حالت گرفته‌ست، اشکالی نداره. با همین حال هم می‌شه ادامه داد.', 'پنج تا نفس شکمی؟ من می‌شمرم: دم… بازدم…', 'دیروز هر چی بود، امروز یه صفحه‌ی تازه‌ست.', 'هر کار کوچیک یه ذره به من انرژی می‌ده. بزن بریم!', 'کفش‌هات کجان؟ ده دقیقه قدم زدن معجزه می‌کنه.', 'شیرینی صدات کرد؟ دکمه‌ی «هوس دارم» رو بزن، با هم ردش می‌کنیم.', 'صبحانه‌ی پروتئینی یعنی عصر آروم‌تر. یادت نره!', 'من صبورم. هر وقت تونستی.'],
    mid: ['داریم خوب پیش می‌ریم! انرژی‌ام داره بالا میاد ⚡', 'دیدی؟ همین چند کار کوچیک حالمون رو عوض کرد.', 'یه کم دیگه حرکت کنیم؟ بدنت ازت ممنون می‌شه.', 'آفرین که امروز اومدی. اومدن، نصف کاره.', 'یه چای دارچین بی‌قند الان خیلی می‌چسبه.', 'ساعت هوس نزدیکه؟ میان‌وعده‌ات رو آماده کن.', 'نصف روز رو با هم اومدیم. بقیه‌اش هم میایم.', 'تنفس شکمی یادت هست؟ شکم بالا، شکم پایین…', 'هر هوسی که رد می‌کنی، مسیر قدیمی مغزت کم‌رنگ‌تر می‌شه.', 'امروز یه نفر رو هم تشویق کن؛ حال خوب پخش می‌شه.', 'من الان کلی سرحالم! بریم سراغ کار بعدی؟', 'یادت نره شب چک‌لیستت رو تیک بزنی 🌙', 'داری عادت می‌سازی، نه فقط یه روز رو رد می‌کنی.', 'به خودت افتخار کن، جدی می‌گم!'],
    high: ['وای! امروز پر از انرژی‌ام! تو فوق‌العاده‌ای 🌟', 'امروز یکی از اون روزهای عالیه. یادش بمونه!', 'بدنت، ذهنت و من، هر سه ازت ممنونیم 💚', 'امروز رو کامل ساختی. حالا استراحت حقته.', 'این روز رو یادت بمونه برای روزهای سخت.', 'من رسماً شارژ کاملم! ⚡⚡⚡', 'تو داری ثابت می‌کنی که می‌شه. آفرین!', 'فردا هم همین‌قدر قشنگ می‌سازیمش.', 'نهالت امروز حسابی آب خورد 🌱', 'اگه کسی پرسید چطوری تونستی، بگو: «یه روز در یک زمان».', 'امروز تموم شد؛ به خودت یه پاداش غیرخوراکی بده!', 'از اون روزهاست که آدم دلش می‌خواد بغلت کنه 🤗', 'یه حرف بین خودمون: تو خیلی قوی‌تر از هوس‌هایی.'],
  };
  function energy() {
    const s = D(), t = today(), m = acts()[t] || {}, mv = s.move[A.logKey()] || {};
    let e = 0;
    if (ck()[t]) e += 10;
    const qa = qz().ans[A.logKey()]; if (qa && qa.date === t) e += 15;
    if (m.night) e += 20;
    e += m.walk ? 20 : mv.walk > 0 ? 8 : 0;
    e += m.breath ? 15 : mv.breaths > 0 ? 6 : 0;
    if (m.routine) e += 15;
    e += Math.min(10, (m.sos || 0) * 5);
    const j = JOURNEYS.find(x => x.id === jp().active); if (j && jProg(j.id).done.includes(t)) e += 5;
    return Math.min(100, e);
  }
  function companionWidget() {
    if (D().cycleDone) return '';
    const showC = on('companion') && pref().companion !== false;
    const c = ck()[today()];
    const chips = [
      on('freeze') ? `<${on('challenges') ? 'a href="#challenges"' : 'span'} class="chip lav" title="هر ۷ روز بی‌لغزش یک روز امن (حداکثر ۲)">❄️ روز امن: ${fa(frz().count)}</${on('challenges') ? 'a' : 'span'}>` : '',
      bestChalChip(), activeJourneyChip(),
      on('checkin') && c ? `<span class="chip">${MOODS[c.mood]} انرژی ${fa(c.energy)}/۵</span>` : '',
    ].filter(Boolean).join('');
    const offer = prepOffer();
    if (!showC && !chips && !offer) return '';
    const e = energy(), band = e <= 30 ? 'low' : e <= 70 ? 'mid' : 'high';
    const line = seedPick(LINES[band], today() + band + e);
    return `<div class="card stack fa-comp" id="fa-comp" style="gap:10px">
      ${showC ? `<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:10px"><div class="fa-av">${A.ART.mascot(band === 'high' ? 'wow' : band === 'mid' ? 'happy' : 'calm', band === 'high' ? { arms: 'up' } : {})}</div>
        <div class="stack" style="gap:6px;min-width:0;flex:1"><div class="fa-bubble small">${line}</div>
        <div class="row small" style="flex-wrap:nowrap;gap:8px" title="انرژی امروز همراهت؛ با هر کار سالم بالا می‌ره"><span aria-hidden="true">⚡</span><div class="progress" style="flex:1" role="img" aria-label="انرژی امروز ${fa(e)} از ۱۰۰"><i style="width:${e}%;background:var(--sun)"></i></div><span class="num">${fa(e)}</span></div></div></div>` : ''}
      <div class="fa-chips">${chips}<span id="fa-cheer-chip" hidden></span></div>${offer}</div>`;
  }
  function updateCompanion() {
    const c = $('#fa-comp'); if (!c) return;
    const t = document.createElement('div'); t.innerHTML = companionWidget(); const n = t.firstElementChild;
    if (n) { c.replaceWith(n); bindCompanion(); loadCheerChip(); }
  }
  function bindCompanion() { const b = $('#fa-prep-no'); if (b) b.onclick = () => { prep().dismissed = true; A.save(); updateCompanion(); }; }

  /* ================= 7/8/9. social: buddy, team, league ================= */
  const soc = () => store('fa_social', () => ({ on: false, nick: '', code: '', friends: [], team: '', teamJoined: null, league: false, cheered: {}, seenCheer: null }));
  const SOCIAL = () => A.STORE && A.STORE.social;
  const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const mkCode = (n = 6) => Array.from({ length: n }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join('');
  const isoWeek = (k = today()) => { const d = new Date(k + 'T12:00'); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd + 3); const y = d.getFullYear(); const j4 = new Date(y, 0, 4, 12); const w = 1 + Math.round(((d - j4) / 864e5 - 3 + ((j4.getDay() + 6) % 7)) / 7); return `${y}-W${String(w).padStart(2, '0')}`; };
  function weekPoints(week = isoWeek()) {
    const m = acts(); let p = 0;
    for (const [k, o] of Object.entries(m)) if (isoWeek(k) === week) p += o.night * 30 + o.walk * 15 + o.breath * 10 + o.routine * 15 + Math.min(4, o.sos) * 5;
    for (const a of Object.values(qz().ans)) if (a.ok && a.date && isoWeek(a.date) === week) p += 5;
    for (const k of Object.keys(ck())) if (isoWeek(k) === week) p += 3;
    return p;
  }
  function teamDamage() {
    const s = soc(); if (!s.team) return 0;
    const from = s.teamJoined || '0000'; let d = 0;
    for (const [k, o] of Object.entries(acts())) if (k >= from) d += (o.night && o.slip !== 'lot' ? 100 : 0) + o.walk * 20 + o.breath * 10 + o.routine * 20 + Math.min(4, o.sos) * 10;
    return d;
  }
  const doneToday = () => { const l = D().log[A.logKey()]; return !!(l && l.done && l.date === today()); };
  async function publish(quiet = true) {
    if (!(on('buddy') || on('team') || on('league'))) return false;
    const s = soc(), api = SOCIAL(); if (!s.on || !s.code || !api) return false;
    const row = { code: s.code, nick: s.nick, streak: A.stats().streak, done_today: doneToday(), week_points: s.league ? weekPoints() : 0, week: isoWeek(), team: s.team || null, league: !!s.league };
    try {
      try { await api.publish({ ...row, team_dmg: teamDamage() }); } catch (e) { await api.publish(row); }
      s.lastPub = Date.now(); return true;
    } catch (e) { if (!quiet) A.toast('اتصال به سرور برقرار نشد. وقتی آنلاین شدی دوباره امتحان کن.', 'bell'); return false; }
  }
  const safe = async (fn, fb) => { try { return await fn(); } catch (e) { return fb; } };
  const fresh = r => r && r.updated_at && A.dateKey(new Date(r.updated_at)) === today();
  const tabs = cur => `<div class="filters fa-tabs" role="tablist">${[['friends', '🤝 یار بی‌قند', 'buddy'], ['team', '👨‍👩‍👧 تیم خانواده', 'team'], ['league', '🏆 لیگ هفتگی', 'league']].filter(t => on(t[2])).map(([r, t]) => `<a href="#${r}" role="tab" aria-selected="${cur === r}" class="${cur === r ? 'on' : ''}">${t}</a>`).join('')}</div>`;
  const PRIVACY = 'فقط این‌ها با دیگران به اشتراک گذاشته می‌شه: <b>نام مستعار</b>، <b>طول زنجیره‌ی روزها</b> و اینکه <b>امروز چک‌لیستت رو زدی یا نه</b> (و اگه خودت عضو تیم یا لیگ بشی، امتیاز کارهای سالم). ایمیل، نام واقعی، لغزش‌ها، هوس‌ها و یادداشت‌هات هرگز نشون داده نمی‌شن.';
  function optInCard() {
    const s = soc();
    return `<div class="card pop stack" style="gap:10px"><b>🤝 با هم، راحت‌تره</b><p class="small">یک نام مستعار انتخاب کن تا یک کد اختصاصی بگیری. این کد رو به همسر، خواهر یا دوستت بده تا هوای همدیگه رو داشته باشید.</p>
      <p class="small muted fa-priv">🔒 ${PRIVACY}</p>
      <div class="field"><label for="fa-nick">نام مستعار</label><input class="input" id="fa-nick" maxlength="20" placeholder="مثلاً: مریم بی‌قند" value="${esc(s.nick || '')}"></div>
      <button class="btn primary" id="fa-optin" type="button">روشن کردن و گرفتن کد</button><p class="err" id="fa-err"></p></div>`;
  }
  function bindOptIn() {
    const b = $('#fa-optin'); if (!b) return;
    b.onclick = async () => {
      const nick = $('#fa-nick').value.trim().replace(/[<>]/g, '');
      if (nick.length < 2) { $('#fa-err').textContent = 'یک نام مستعار دست‌کم دوحرفی بنویس.'; return; }
      const s = soc(); s.nick = nick; s.on = true; s.code = s.code || mkCode(); A.save();
      b.disabled = true; const ok = await publish(true);
      if (!ok) A.toast('کدت ساخته شد، ولی الان به سرور وصل نیستیم. بعداً خودکار همگام می‌شه.', 'bell');
      refresh();
    };
  }
  const CHEERS = ['آفرین! ادامه بده 💪', 'بهت افتخار می‌کنم 🌟', 'امروز هم با همیم 🤝', 'هوس‌ها حریفت نیستن 🛡️', 'یه چای بی‌قند مهمون من ☕', 'تو الگوی منی 🌱'];
  let cheerCache = null; // { code, t, list }: avoids a server call on every Today render
  async function loadCheerChip() {
    const s = soc(), api = SOCIAL();
    if (!$('#fa-cheer-chip') || !s.on || !api || !on('buddy')) return;
    let list = cheerCache && cheerCache.code === s.code && Date.now() - cheerCache.t < 5 * 60e3 ? cheerCache.list : null;
    if (!list) { list = await safe(() => api.myCheers(s.code), null); if (list) cheerCache = { code: s.code, t: Date.now(), list }; }
    const n = (list || []).filter(c => !s.seenCheer || c.created_at > s.seenCheer).length;
    const slot = $('#fa-cheer-chip');
    if (n && slot) slot.outerHTML = `<a class="chip berry" href="#friends">💌 ${fa(n)} تشویق تازه</a>`;
  }
  page('friends', 'یار بی‌قند', () => {
    const s = soc();
    return `<section class="wrap stack" style="gap:16px;max-width:720px">
      ${head('با هم بی‌قند', 'یار بی‌قند', 'پاسخ‌گو بودن به یک نفر مشخص، یکی از قوی‌ترین دلیل‌های ادامه دادنه.')}${tabs('friends')}
      ${!s.on ? optInCard() : `
      <div class="card stack" style="gap:8px"><div class="row" style="justify-content:space-between"><b>کد تو</b><span class="small muted">${esc(s.nick)}</span></div>
        <div class="row"><span class="fa-code" dir="ltr">${esc(s.code)}</span><button class="btn" id="fa-copy" type="button">کپی</button>${navigator.share ? '<button class="btn ghost" id="fa-share" type="button">فرستادن</button>' : ''}</div>
        <p class="small muted">این کد رو برای کسی که می‌خوای یارت باشه بفرست. اون هم باید کد تو رو اضافه کنه تا تو رو ببینه.</p></div>
      <div class="card stack" style="gap:8px"><label for="fa-add"><b>اضافه کردن یار</b></label><div class="row" style="flex-wrap:nowrap"><input class="input" id="fa-add" dir="ltr" maxlength="8" placeholder="ABC123" autocomplete="off" style="text-transform:uppercase"><button class="btn primary" id="fa-addb" type="button">اضافه</button></div><p class="err" id="fa-err"></p></div>
      <div class="card stack" style="gap:10px" id="fa-flist"><b>یارهای من</b>${s.friends.length ? '<p class="small muted">در حال بارگذاری…</p>' : '<p class="small muted">هنوز یاری اضافه نکردی.</p>'}</div>
      <div class="card stack" style="gap:8px" id="fa-cheers"><b>💌 تشویق‌هایی که گرفتی</b><p class="small muted">در حال بارگذاری…</p></div>
      <div class="card stack" style="gap:6px"><p class="small muted fa-priv">🔒 ${PRIVACY}</p><div class="row"><button class="btn ghost" id="fa-off" type="button">خاموش کردن اشتراک‌گذاری</button></div></div>`}
    </section>`;
  }, async () => {
    bindOptIn();
    const s = soc(); if (!s.on) return;
    const api = SOCIAL();
    $('#fa-copy').onclick = async () => { try { await navigator.clipboard.writeText(s.code); A.toast('کد کپی شد.', 'bell'); } catch (e) { A.toast('کدت: ' + s.code, 'bell'); } };
    const sh = $('#fa-share'); if (sh) sh.onclick = () => navigator.share({ text: `بیا با هم قند رو کم کنیم! توی یوژو کد من رو اضافه کن: ${s.code}` }).catch(() => {});
    $('#fa-off').onclick = async () => {
      if (api) await safe(() => api.publish({ code: s.code, nick: '', streak: 0, done_today: false, week_points: 0, week: '', team: null, league: false }));
      s.on = false; s.league = false; s.team = ''; A.save(); A.toast('اشتراک‌گذاری خاموش شد. دیگه چیزی از تو نمایش داده نمی‌شه.', 'bell'); refresh();
    };
    $('#fa-addb').onclick = async () => {
      const code = $('#fa-add').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const err = $('#fa-err');
      if (code.length < 4) { err.textContent = 'کد رو کامل وارد کن.'; return; }
      if (code === s.code) { err.textContent = 'این کد خودته 🙂'; return; }
      if (s.friends.includes(code)) { err.textContent = 'این یار رو قبلاً اضافه کردی.'; return; }
      if (s.friends.length >= 20) { err.textContent = 'حداکثر ۲۰ یار.'; return; }
      let found = null, offline = false;
      try { found = (await api.byCodes([code]))[0]; } catch (e) { offline = true; }
      if (offline) { err.textContent = 'الان به سرور وصل نیستیم؛ اینترنتت رو بررسی کن و دوباره امتحان کن.'; return; }
      if (!found) { err.textContent = 'این کد پیدا نشد. دوباره بررسیش کن.'; return; }
      s.friends.push(code); A.save(); A.toast(`${found.nick || 'یار'} اضافه شد 🤝`, null, 'happy'); refresh();
    };
    publish(true);
    const box = $('#fa-flist');
    if (s.friends.length && box) {
      let rows = null; try { rows = await api.byCodes(s.friends); } catch (e) { rows = null; }
      if (!document.body.contains(box)) return;
      box.innerHTML = '<b>یارهای من</b>' + (rows === null ? '<p class="small muted">الان به سرور وصل نیستیم؛ وضعیت یارها بعداً نشون داده می‌شه.</p>' : '') + s.friends.map(c => {
        const r = (rows || []).find(x => x.code === c); const done = fresh(r) && r.done_today; const sent = s.cheered[c] === today();
        return `<div class="fa-friend"><div class="stack" style="gap:0;min-width:0"><b>${esc((r && r.nick) || c)}</b><span class="small muted">${r ? `🔥 ${fa(r.streak || 0)} روز، ${done ? '<span style="color:var(--mint)">✓ امروز چک‌لیستش رو زده</span>' : 'امروز هنوز نه'}` : 'وضعیت نامعلوم'}</span></div>
          <div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn ${sent ? 'ghost' : 'sun'} fa-sm" data-cheer="${c}" ${sent || !r ? 'disabled' : ''} type="button">${sent ? 'فرستادی ✓' : '👏 تشویق'}</button><button class="fa-x" data-rm="${c}" type="button" aria-label="حذف">✕</button></div></div>`;
      }).join('');
      $$('[data-rm]', box).forEach(b => b.onclick = () => { s.friends = s.friends.filter(x => x !== b.dataset.rm); A.save(); refresh(); });
      $$('[data-cheer]', box).forEach(b => b.onclick = () => A.modal(`<div class="stack"><h3>یه تشویق بفرست</h3><div class="stack" style="gap:8px">${CHEERS.map((t, i) => `<button class="btn ghost" data-ct="${i}" type="button">${t}</button>`).join('')}</div></div>`, (m, close) => {
        $$('[data-ct]', m).forEach(x => x.onclick = async () => {
          try { await api.cheer(b.dataset.cheer, s.nick, CHEERS[+x.dataset.ct]); s.cheered[b.dataset.cheer] = today(); A.save(); close(); A.toast('تشویقت فرستاده شد 💌', null, 'happy'); refresh(); }
          catch (e) { close(); A.toast('فرستادن نشد؛ اتصال اینترنت رو بررسی کن.', 'bell'); }
        });
      }));
    }
    const cb = $('#fa-cheers');
    const list = await safe(() => api.myCheers(s.code), null);
    if (list) cheerCache = { code: s.code, t: Date.now(), list };
    if (!cb || !document.body.contains(cb)) return;
    cb.innerHTML = '<b>💌 تشویق‌هایی که گرفتی</b>' + (list === null ? '<p class="small muted">الان به سرور وصل نیستیم.</p>' : list.length ? list.slice(0, 10).map(c => `<div class="fa-cheer"><span>${esc(c.text)}</span><span class="small muted">از ${esc(c.from_nick || 'یک یار')}</span></div>`).join('') : '<p class="small muted">هنوز تشویقی نرسیده. تو اول شروع کن! 🙂</p>');
    if (list && list.length && list[0].created_at !== s.seenCheer) { s.seenCheer = list[0].created_at; A.save(); }
  });

  const MONSTERS = ['غول قندی', 'هیولای شربت', 'اژدهای شکلات', 'دیو پشمک', 'غول نوشابه'];
  const HP = 2100;
  const monsterSvg = pct => `<svg viewBox="0 0 120 110" class="fa-mon" aria-hidden="true"><g style="opacity:${(.35 + .65 * pct).toFixed(2)}"><path d="M20 95 Q10 40 40 25 Q60 5 80 25 Q110 40 100 95 Z" style="fill:var(--berry-soft);stroke:var(--ink)" stroke-width="4" stroke-linejoin="round"/><circle cx="35" cy="22" r="7" style="fill:var(--sun);stroke:var(--ink)" stroke-width="3"/><circle cx="62" cy="12" r="7" style="fill:var(--mint-soft);stroke:var(--ink)" stroke-width="3"/><circle cx="88" cy="24" r="7" style="fill:var(--lav-soft);stroke:var(--ink)" stroke-width="3"/>
    <circle cx="45" cy="55" r="9" style="fill:var(--surface);stroke:var(--ink)" stroke-width="3"/><circle cx="75" cy="55" r="9" style="fill:var(--surface);stroke:var(--ink)" stroke-width="3"/><circle cx="${pct > .3 ? 47 : 45}" cy="57" r="4" style="fill:var(--ink)"/><circle cx="${pct > .3 ? 77 : 75}" cy="57" r="4" style="fill:var(--ink)"/>
    <path d="${pct > .3 ? 'M45 78 Q60 70 75 78' : 'M45 76 Q60 86 75 76'}" fill="none" style="stroke:var(--ink)" stroke-width="4" stroke-linecap="round"/></g></svg>`;
  page('team', 'تیم خانواده', () => {
    const s = soc();
    return `<section class="wrap stack" style="gap:16px;max-width:720px">
      ${head('کوئست گروهی', 'تیم خانواده', 'با خانواده یا دوستان (۲ تا ۶ نفر) یک تیم بسازید و با هم «غول قند» رو شکست بدید. هر روز کامل، هر پیاده‌روی و هر هوسِ ردشده بهش ضربه می‌زنه. لغزش هیچ جریمه‌ای نداره.')}${tabs('team')}
      ${!s.on ? optInCard() : !s.team ? `<div class="card stack" style="gap:10px"><b>تیم بساز یا عضو شو</b>
        <button class="btn primary" id="fa-tnew" type="button">ساختن تیم تازه</button>
        <label class="small" for="fa-tcode">یا کد تیم خانواده‌ات رو وارد کن:</label>
        <div class="row" style="flex-wrap:nowrap"><input class="input" id="fa-tcode" dir="ltr" maxlength="8" placeholder="T-XXXXX" autocomplete="off"><button class="btn" id="fa-tjoin" type="button">عضو شدن</button></div><p class="err" id="fa-err"></p>
        <p class="small muted">🔒 اعضای تیم فقط نام مستعار، زنجیره‌ی روزها و میزان ضربه‌ی هر نفر رو می‌بینن.</p></div>`
      : `<div class="card pop stack fa-boss" id="fa-boss" style="gap:10px"><p class="small muted">در حال بارگذاری تیم…</p></div>
        <div class="card stack" style="gap:6px"><div class="row"><span class="small">کد تیم:</span><span class="fa-code" dir="ltr">${esc(s.team)}</span><button class="btn ghost" id="fa-tcopy" type="button">کپی</button></div><p class="small muted">این کد رو برای اعضای خانواده بفرست.</p><button class="btn ghost" id="fa-tleave" type="button">خروج از تیم</button></div>`}
      <div class="card small muted stack" style="gap:4px"><b>ضربه‌ها چطور حساب می‌شن؟</b><span>روز کامل (بدون لغزش زیاد): ۱۰۰، پیاده‌روی کامل: ۲۰، جلسه‌ی حرکتی: ۲۰، تنفس شکمی: ۱۰، هر هوس ردشده: ۱۰</span></div>
    </section>`;
  }, async () => {
    bindOptIn();
    const s = soc(), api = SOCIAL(); if (!s.on) return;
    const n = $('#fa-tnew'); if (n) n.onclick = async () => { s.team = 'T-' + mkCode(5); s.teamJoined = today(); A.save(); await publish(); refresh(); };
    const j = $('#fa-tjoin'); if (j) j.onclick = async () => {
      let code = $('#fa-tcode').value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, ''); if (!code.startsWith('T-')) code = 'T-' + code.replace(/^T/, '');
      if (code.length < 5) { $('#fa-err').textContent = 'کد تیم رو کامل وارد کن.'; return; }
      let rows = null; try { rows = await api.team(code); } catch (e) { rows = null; }
      if (rows && !rows.length) { $('#fa-err').textContent = 'تیمی با این کد پیدا نشد.'; return; }
      if (rows && rows.filter(r => r.code !== s.code).length >= 6) { $('#fa-err').textContent = 'این تیم پره (حداکثر ۶ نفر).'; return; }
      s.team = code; s.teamJoined = today(); A.save(); await publish(); A.toast('به تیم پیوستی! با هم غول رو شکست بدید 💪', null, 'happy'); refresh();
    };
    const tc = $('#fa-tcopy'); if (tc) tc.onclick = async () => { try { await navigator.clipboard.writeText(s.team); A.toast('کد تیم کپی شد.', 'bell'); } catch (e) { A.toast('کد تیم: ' + s.team, 'bell'); } };
    const tl = $('#fa-tleave'); if (tl) tl.onclick = async () => { s.team = ''; s.teamJoined = null; A.save(); await publish(); refresh(); };
    const box = $('#fa-boss'); if (!box) return;
    await publish(true);
    let rows = await safe(() => api.team(s.team), null);
    if (!document.body.contains(box)) return;
    const me = { code: s.code, nick: s.nick, streak: A.stats().streak, team_dmg: teamDamage(), done_today: doneToday(), updated_at: new Date().toISOString() };
    const offline = rows === null;
    rows = (rows || []).filter(r => r.code !== s.code).concat([me]);
    const dmgOf = r => r.team_dmg != null ? r.team_dmg : (r.streak || 0) * 100;
    const total = rows.reduce((a, r) => a + dmgOf(r), 0);
    const lvl = Math.floor(total / HP), left = HP - (total % HP), pct = left / HP;
    box.innerHTML = `${offline ? '<p class="small muted">الان به سرور وصل نیستیم؛ فقط سهم خودت نمایش داده می‌شه.</p>' : ''}
      <div class="row" style="flex-wrap:nowrap;gap:14px"><div style="width:100px;flex:none">${monsterSvg(pct)}</div><div class="stack" style="gap:4px;flex:1;min-width:0"><span class="eyebrow">غول شماره‌ی ${fa(lvl + 1)}</span><h3>${MONSTERS[lvl % MONSTERS.length]}</h3>
      <div class="progress" role="img" aria-label="جان غول ${fa(left)} از ${fa(HP)}"><i style="width:${(pct * 100).toFixed(1)}%;background:var(--berry)"></i></div><span class="small num">❤️ ${fa(left)} از ${fa(HP)}</span>
      ${lvl ? `<span class="chip mint" style="align-self:flex-start">🏆 ${fa(lvl)} غول شکست خورده</span>` : ''}</div></div>
      <div class="stack" style="gap:6px">${rows.sort((a, b) => dmgOf(b) - dmgOf(a)).map(r => `<div class="fa-friend"><span><b>${esc(r.nick || r.code)}</b>${r.code === s.code ? ' <span class="small muted">(تو)</span>' : ''} <span class="small muted">🔥 ${fa(r.streak || 0)}</span> ${fresh(r) && r.done_today ? '✓' : ''}</span><span class="chip sun num">⚔️ ${fa(dmgOf(r))}</span></div>`).join('')}</div>`;
  });

  page('league', 'لیگ هفتگی', () => {
    const s = soc();
    return `<section class="wrap stack" style="gap:16px;max-width:720px">
      ${head('اختیاری، پیش‌فرض خاموش', 'لیگ هفتگی', 'برای کسانی که رقابت بهشون انگیزه می‌ده. امتیاز فقط از کارهای سالم میاد، نه از «کمتر خوردن»؛ هر دوشنبه از صفر.')}${tabs('league')}
      ${!s.on ? optInCard() : !s.league ? `<div class="card stack" style="gap:10px"><b>لیگ برای تو خاموشه</b><p class="small">اگه روشنش کنی، نام مستعار و امتیاز این هفته‌ات در جدول عمومی لیگ دیده می‌شه. هر وقت خواستی می‌تونی خارج بشی.</p><button class="btn primary" id="fa-lon" type="button">ورود به لیگ این هفته</button></div>`
      : `<div class="card row" style="justify-content:space-between"><b>امتیاز این هفته‌ی تو</b><span class="chip sun num">${fa(weekPoints())} امتیاز</span></div>
        <div class="card stack" style="gap:6px" id="fa-board"><p class="small muted">در حال بارگذاری جدول…</p></div>
        <button class="btn ghost" id="fa-loff" type="button">خروج از لیگ</button>`}
      <div class="card small muted stack" style="gap:4px"><b>امتیازها</b><span>چک‌لیست شب: ۳۰، پیاده‌روی: ۱۵، جلسه‌ی حرکتی: ۱۵، تنفس شکمی: ۱۰، هوس ردشده: ۵ (حداکثر ۴ در روز)، جواب درست کوییز: ۵، چک‌این صبح: ۳</span></div>
    </section>`;
  }, async () => {
    bindOptIn();
    const s = soc(), api = SOCIAL(); if (!s.on) return;
    const lo = $('#fa-lon'); if (lo) lo.onclick = async () => { s.league = true; A.save(); await publish(false); refresh(); };
    const lf = $('#fa-loff'); if (lf) lf.onclick = async () => { s.league = false; A.save(); await publish(); A.toast('از لیگ خارج شدی. امتیازهات دیگه نمایش داده نمی‌شه.', 'bell'); refresh(); };
    const box = $('#fa-board'); if (!box) return;
    await publish(true);
    const rows = await safe(() => api.league(isoWeek()), null);
    if (!document.body.contains(box)) return;
    if (rows === null) { box.innerHTML = '<p class="small muted">الان به سرور وصل نیستیم؛ جدول بعداً نمایش داده می‌شه.</p>'; return; }
    box.innerHTML = '<b>جدول این هفته</b>' + (rows.length ? rows.map((r, i) => `<div class="fa-friend ${r.code === s.code ? 'fa-me' : ''}"><span><span class="num">${fa(i + 1)}.</span> ${i < 3 ? ['🥇', '🥈', '🥉'][i] : ''} <b>${esc(r.nick || '—')}</b></span><span class="num small">${fa(r.week_points || 0)} امتیاز</span></div>`).join('') : '<p class="small muted">هنوز کسی امتیاز نگرفته.</p>');
  });

  /* ================= 12. slip-chain wizard ================= */
  const TRIG = [
    ['tired', '😴 خستگی', 'اگر عصر خسته بودم، آنگاه اول ۱۰ دقیقه استراحت می‌کنم یا یک چای و چند گردو می‌خورم.'],
    ['stress', '😣 استرس', 'اگر استرس داشتم، آنگاه ۱۰ نفس شکمی می‌کشم و بعد تصمیم می‌گیرم.'],
    ['party', '🎉 مهمونی و تعارف', 'اگر کسی شیرینی تعارف کرد، آنگاه جمله‌ی آماده‌ام رو می‌گم و چای بی‌قند برمی‌دارم.'],
    ['bored', '🥱 بی‌حوصلگی', 'اگر بی‌حوصله شدم، آنگاه ۵ دقیقه قدم می‌زنم یا به یک دوست پیام می‌دم.'],
    ['hungry', '🍽️ گرسنگی', 'اگر بین وعده‌ها گرسنه شدم، آنگاه میان‌وعده‌ی پروتئین‌دار آماده‌ام رو می‌خورم.'],
    ['seen', '👀 دیدن شیرینی', 'اگر شیرینی جلوی چشمم بود، آنگاه از دیدم دورش می‌کنم و یک لیوان آب می‌خورم.'],
    ['lonely', '💭 تنهایی یا دلتنگی', 'اگر احساس تنهایی کردم، آنگاه به یک نفر زنگ می‌زنم.'],
    ['meal', '🍛 عادت بعد از غذا', 'اگر غذام تموم شد، آنگاه مسواک می‌زنم یا یک چای دارچین می‌خورم.'],
    ['sad', '😔 ناراحتی', 'اگر ناراحت شدم، آنگاه اسم احساسم رو می‌نویسم و یک کار مهربون برای خودم می‌کنم.'],
  ];
  const THOUGHTS = [
    ['یه دونه که چیزی نمی‌شه', 'یه دونه واقعاً فاجعه نیست؛ ولی «یه دونه» معمولاً دومی و سومی هم داره. می‌تونم آگاهانه انتخاب کنم.'],
    ['حقمه، امروز سخت بود', 'حقم یه پاداشه؛ ولی پاداش می‌تونه یک دوش گرم، یک آهنگ یا یک پیاده‌روی باشه.'],
    ['حالا که خراب شد، بذار کامل بخورم', 'یک لغزش، روز رو خراب نمی‌کنه. وعده‌ی بعدی یک شروع تازه‌ست.'],
    ['نمی‌شه تعارف رو رد کرد', 'می‌شه با احترام و لبخند رد کرد. جمله‌ی آماده کمکم می‌کنه.'],
    ['فقط همین یه بار', '«همین یه بار» رو قبلاً هم گفتم؟ اگه آره، این یه الگوئه که می‌شه عوضش کرد.'],
    ['اصلاً فکر نکردم، خودکار بود', 'عادت‌ها خودکارن؛ برای همین نشانه رو پیدا می‌کنم و یک مکث کوچیک جلوش می‌ذارم.'],
  ];
  const slips = () => store('fa_slips', () => []);
  let pendingSlip = null, wiz = null;
  const topTrigger = () => { const c = {}; slips().forEach(x => { c[x.trigger] = (c[x.trigger] || 0) + 1; }); const t = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return t ? { id: t[0], n: t[1], t: TRIG.find(x => x[0] === t[0]) } : null; };
  page('slip', 'زنجیره‌ی لغزش', () => {
    const w = wiz = wiz || { step: 0, trigger: null, thought: '', behaviour: '', amount: '', plan: '' };
    const tt = topTrigger(), list = slips(), step = w.step;
    const steps = ['محرک', 'فکر', 'رفتار', 'نقشه‌ی تازه'];
    let body = '';
    if (step === 0) body = `<b>۱. چی شروعش کرد؟</b><p class="small muted">لحظه‌ی قبل از خوردن رو به یاد بیار. کدوم بیشتر بود؟</p><div class="fa-pick">${TRIG.map(([id, t]) => `<button type="button" data-tr="${id}" class="${w.trigger === id ? 'on' : ''}">${t}</button>`).join('')}</div>`;
    if (step === 1) { const r = THOUGHTS.find(x => x[0] === w.thought); body = `<b>۲. چه فکری از ذهنت گذشت؟</b><div class="fa-pick">${THOUGHTS.map(([t], i) => `<button type="button" data-th="${i}" class="${w.thought === t ? 'on' : ''}">«${t}»</button>`).join('')}</div><label class="small muted" for="fa-th">یا با کلمه‌های خودت بنویس:</label><textarea class="input" id="fa-th" rows="2">${esc(w.thought)}</textarea>
      ${r ? `<div class="fa-reframe small">💬 یه نگاه مهربون‌تر: ${r[1]}</div>` : ''}`; }
    if (step === 2) body = `<b>۳. چی شد؟</b><div class="fa-pick">${['یه کم', 'یه وعده‌ی کامل', 'بیشتر از اونی که می‌خواستم'].map(t => `<button type="button" data-am="${t}" class="${w.amount === t ? 'on' : ''}">${t}</button>`).join('')}</div><textarea class="input" id="fa-bh" rows="2" aria-label="توضیح" placeholder="مثلاً: سر کار سه تا شیرینی برداشتم…">${esc(w.behaviour)}</textarea><p class="small muted">قضاوتی در کار نیست؛ فقط داده جمع می‌کنیم.</p>`;
    if (step === 3) { const t = TRIG.find(x => x[0] === w.trigger); body = `<b>۴. دفعه‌ی بعد: اگر… آنگاه…</b><p class="small muted">یک پیشنهاد آماده کردیم؛ هر طور دوست داری عوضش کن.</p><textarea class="input" id="fa-pl" rows="3" aria-label="نقشه‌ی اگر آنگاه">${esc(w.plan || (t ? t[2] : ''))}</textarea><label class="check" for="fa-main"><input type="checkbox" id="fa-main"><span class="small">این بشه برنامه‌ی «اگر… آنگاه…» اصلی من (روی صفحه‌ی امروز)</span></label>`; }
    return `<section class="wrap auth stack" style="gap:16px;max-width:640px">
      ${head('لغزش = داده، نه شکست', 'جادوگر زنجیره‌ی لغزش', 'چهار قدم کوتاه تا بفهمیم چی شد و برای دفعه‌ی بعد یک نقشه‌ی تازه بسازیم.')}
      <div class="fa-stepper">${steps.map((t, i) => `<span class="${i < step ? 'ok' : i === step ? 'cur' : ''}">${fa(i + 1)}. ${t}</span>`).join('')}</div>
      <div class="card pop stack" style="gap:10px">${body}
        <div class="row" style="justify-content:space-between">${step ? '<button class="btn ghost" id="fa-wb" type="button">قبلی</button>' : '<span></span>'}<button class="btn primary" id="fa-wn" type="button">${step === 3 ? 'ذخیره‌ی نقشه' : 'بعدی'}</button></div><p class="err" id="fa-err"></p></div>
      ${tt ? `<div class="card stack fa-soft-lav" style="gap:4px"><b>محرک شماره‌ی ۱ تو: ${tt.t ? tt.t[1] : ''}</b><p class="small">${fa(tt.n)} بار از ${fa(list.length)} لغزش ثبت‌شده. نقشه‌ات برای این لحظه رو دم دست نگه دار.</p></div>` : ''}
      ${list.length ? `<div class="card stack" style="gap:8px"><b>زنجیره‌های قبلی</b>${list.slice(-5).reverse().map(x => { const t = TRIG.find(y => y[0] === x.trigger); return `<details class="fa-det"><summary>${esc(A.jalali(new Date(x.date + 'T12:00')) || x.date)}، ${t ? t[1] : ''}</summary>${x.thought ? `<p class="small">💭 «${esc(x.thought)}»</p>` : ''}${x.behaviour || x.amount ? `<p class="small muted">${esc(x.amount)} ${esc(x.behaviour)}</p>` : ''}<p class="small">✅ ${esc(x.plan)}</p></details>`; }).join('')}</div>` : ''}
    </section>`;
  }, () => {
    const w = wiz;
    const keep = () => { const th = $('#fa-th'); if (th) w.thought = th.value.trim(); const bh = $('#fa-bh'); if (bh) w.behaviour = bh.value.trim(); const pl = $('#fa-pl'); if (pl) w.plan = pl.value.trim(); };
    $$('[data-tr]').forEach(b => b.onclick = () => { w.trigger = b.dataset.tr; w.plan = ''; w.step = 1; refresh(); });
    $$('[data-th]').forEach(b => b.onclick = () => { w.thought = THOUGHTS[+b.dataset.th][0]; refresh(); });
    $$('[data-am]').forEach(b => b.onclick = () => { keep(); w.amount = b.dataset.am; refresh(); });
    const bk = $('#fa-wb'); if (bk) bk.onclick = () => { keep(); w.step--; refresh(); };
    $('#fa-wn').onclick = () => {
      keep();
      if (w.step === 0 && !w.trigger) { $('#fa-err').textContent = 'یکی از گزینه‌ها رو انتخاب کن.'; return; }
      if (w.step < 3) { w.step++; refresh(); return; }
      if (!w.plan) { $('#fa-err').textContent = 'نقشه‌ی «اگر… آنگاه…» رو بنویس.'; return; }
      slips().push({ date: today(), trigger: w.trigger, thought: w.thought, behaviour: w.behaviour, amount: w.amount, plan: w.plan });
      if (slips().length > 60) D().fa_slips = slips().slice(-60);
      if ($('#fa-main') && $('#fa-main').checked && D().profile) { const m = /آنگاه\s*(.+)$/.exec(w.plan); D().profile.ifthen = m ? m[1] : w.plan; }
      wiz = null; A.save(); A.toast('نقشه‌ات ذخیره شد. هر لغزش یه درس تازه‌ست، و تو الان یه قدم جلوتری 🌱', null, 'happy'); refresh();
    };
  });

  /* ================= 13. taarof phrase bank ================= */
  const TAAROF = [
    { id: 'wedding', icon: '💍', title: 'عروسی', host: '«یه تیکه کیک بردار، شگون داره!»', lines: ['ان‌شاءالله همیشه به شادی. من از میوه‌ها برمی‌دارم، دستتون درد نکنه.', 'چه کیک قشنگی! عکسش رو گرفتم، همین برام کافیه.', 'مبارک باشه! شام حسابی خوردم، دیگه جا ندارم.', 'اگه چای بی‌قند هست، عالیه. ممنونم.', 'شادی شما شیرینی منه؛ نوش جون بقیه.', 'دستتون طلا؛ من مدتیه شیرینی نمی‌خورم و حالم خیلی بهتره.', 'بعد از رقص! الان نفسم بند اومده 😄'] },
    { id: 'mourning', icon: '🕊️', title: 'عزا و ختم', host: '«حلوا بردارید، خدا رحمتش کنه.»', lines: ['خدا رحمتشون کنه. فاتحه‌شون رو خوندم؛ با همین چای ممنونم.', 'غم آخرتون باشه. الان میل ندارم، ممنون از لطفتون.', 'خدا بیامرزه. یک دونه خرما به نیتشون برمی‌دارم، دستتون درد نکنه.', 'سلامت باشید؛ من فقط چای بی‌قند می‌خورم.', 'خدا رحمتش کنه؛ به نیتش یک کار خیر انجام می‌دم.', 'یه قاشق کوچیک به نیت تبرک، بقیه‌اش برای دیگران.'] },
    { id: 'party', icon: '🏠', title: 'مهمونی', host: '«تعارف نکن، خودم پختمش!»', lines: ['وای چه بوی خوبی! حتماً رسپی‌اش رو بهم بدید.', 'دستتون درد نکنه، الان واقعاً سیرم. یه چای بی‌قند می‌خورم.', 'دارم یه چالش بی‌قند انجام می‌دم؛ دعا کنید تا آخرش برم!', 'یه تیکه‌ی خیلی کوچیک، فقط برای چشیدن دستپختتون.', 'از اون میوه‌ها برمی‌دارم که از اول چشمم دنبالشه!', 'خیلی لطف دارید؛ «نه»ی من این بار تعارف نیست 😊', 'بذارید آخر مهمونی، اگه جا داشتم حتماً.'] },
    { id: 'work', icon: '💼', title: 'محل کار', host: '«تولد همکاره، یه برش کیک بردار.»', lines: ['تولدت مبارک! من با چای باهات می‌زنم به سلامتی.', 'مرسی، ناهار سنگینی خوردم؛ نوش جون همه.', 'دارم یه برنامه‌ی بی‌قند می‌رم؛ تشویقم کنید!', 'من میوه آوردم؛ کسی می‌خواد؟', 'ممنون که یادم بودی؛ همین تعارفت برام شیرینه.', 'قند خواب‌آلودم می‌کنه و امروز کلی کار دارم.', 'یه کم برام کنار بذار، بعد از جلسه.'] },
    { id: 'family', icon: '👵', title: 'خانواده', host: '«ننه‌جون، از دست من نمی‌خوری؟»', lines: ['قربون دستتون برم؛ یه کم برام کنار بذارید، بعداً با چای بی‌قند می‌خورم.', 'مامان‌جان، دارم مراقب سلامتیم هستم؛ دعام کنید.', 'به‌جای شیرینی یه بغل بدید، اون شیرین‌تره!', 'یه قاشق برمی‌دارم که دلتون نشکنه، بقیه‌اش نوش جون شما.', 'بیاید با هم یه چای دارچین بخوریم؛ من دم می‌کنم.', 'دفعه‌ی بعد با هم یه نسخه‌ی کم‌قندش رو بپزیم؟', 'دارم یه کار سخت می‌کنم؛ کمکم کنید و تعارف نکنید لطفاً.'] },
    { id: 'nowruz', icon: '🌷', title: 'عید و نوروز', host: '«از این نون‌برنجی‌ها هم بخورید، عیده!»', lines: ['عیدتون مبارک! سال نو پر از سلامتی. من آجیل برمی‌دارم.', 'چه سفره‌ی قشنگی! از سیب و سنجدش برمی‌دارم.', 'ممنون، امروز چند جا بودم و حسابی پذیرایی شدم.', 'یه دونه‌ی کوچیک به رسم عید، بقیه‌اش نوش جونتون.', 'چای تازه‌دم بی‌قند از هر چیزی بیشتر می‌چسبه.', 'امسال با خودم قرار گذاشتم کمتر شیرینی بخورم؛ شما هم باهام باشید!', 'اول یه کم میوه، بعد اگه جا داشتم چشم.'] },
  ];
  const tf = () => store('fa_taarof', () => ({ fav: [] }));
  let tfGroup = 'all';
  const inGroup = (g, i) => tfGroup === 'all' || g.id === tfGroup || (tfGroup === 'fav' && tf().fav.includes(g.id + i));
  page('phrases', 'جمله‌های تعارف', () => {
    const favs = tf().fav;
    const cards = TAAROF.map(g => {
      const ls = g.lines.map((l, i) => { if (!inGroup(g, i)) return ''; const f = favs.includes(g.id + i); return `<div class="fa-line"><span>${l}</span><button class="fa-star ${f ? 'on' : ''}" data-fav="${g.id + i}" type="button" aria-pressed="${f}" aria-label="${f ? 'حذف از منتخب' : 'افزودن به منتخب'}">${f ? '★' : '☆'}</button></div>`; }).join('');
      return ls ? `<div class="card stack" style="gap:8px"><h3>${g.icon} ${g.title}</h3><p class="small muted">میزبان: ${g.host}</p>${ls}</div>` : '';
    }).join('');
    return `<section class="wrap stack" style="gap:16px;max-width:860px">
      ${head('«بفرمایید!»', 'بانک جمله‌های تعارف', 'سخت‌ترین لحظه، تعارف میزبانه. یک جمله‌ی مؤدبانه انتخاب کن، ستاره بزن و قبل از مهمونی دو بار بلند تمرینش کن.')}
      <div class="filters">${[['all', 'همه'], ...TAAROF.map(g => [g.id, g.icon + ' ' + g.title]), ['fav', '★ منتخب من']].map(([id, t]) => `<button type="button" data-g="${id}" class="${tfGroup === id ? 'on' : ''}">${t}</button>`).join('')}</div>
      <div><button class="btn sun" id="fa-practice" type="button">🎭 تمرین با کارت‌ها</button></div>
      ${cards ? `<div class="fa-tf-grid">${cards}</div>` : '<div class="card small muted">هنوز جمله‌ای ستاره نزدی. روی ☆ کنار هر جمله بزن.</div>'}
      <p class="small muted">💡 لحن مهم‌تر از کلمه‌هاست: لبخند، تشکر از زحمت میزبان و یک «نه»ی روشن. لازم نیست توضیح طولانی بدی یا کسی رو نصیحت کنی.</p>
    </section>`;
  }, () => {
    $$('[data-g]').forEach(b => b.onclick = () => { tfGroup = b.dataset.g; refresh(); });
    $$('[data-fav]').forEach(b => b.onclick = () => { const f = tf(); const id = b.dataset.fav; f.fav = f.fav.includes(id) ? f.fav.filter(x => x !== id) : [...f.fav, id]; A.save(); refresh(); });
    $('#fa-practice').onclick = () => {
      const pool = [];
      TAAROF.forEach(g => g.lines.forEach((l, i) => { if (inGroup(g, i)) pool.push([g, l]); }));
      if (!pool.length) return A.toast('اول چند جمله رو ستاره بزن.', 'bell');
      let idx = Math.floor(Math.random() * pool.length);
      A.modal(`<div class="stack" style="gap:12px;text-align:center"><span class="eyebrow">تمرین تعارف</span><div class="fa-flip" id="fa-card" tabindex="0" role="button" aria-label="برگردوندن کارت"><div class="fa-face fa-front"></div><div class="fa-face fa-back"></div></div><p class="small muted">اول خودت جواب بده (بلند!)، بعد کارت رو برگردون.</p><div class="row" style="justify-content:center"><button class="btn" id="fa-flipb" type="button">برگردون</button><button class="btn primary" id="fa-next" type="button">کارت بعدی</button></div></div>`, m => {
        const card = $('#fa-card', m);
        const show = () => { const [g, l] = pool[idx]; card.classList.remove('on'); $('.fa-front', m).innerHTML = `<span class="fa-big-i">${g.icon}</span><b>${g.title}</b><p>میزبان می‌گه: ${g.host}</p><span class="small muted">تو چی می‌گی؟</span>`; $('.fa-back', m).innerHTML = `<span class="small muted">یک جواب خوب:</span><p><b>«${l}»</b></p>`; };
        const flip = () => card.classList.toggle('on');
        card.onclick = flip; card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } };
        $('#fa-flipb', m).onclick = flip;
        $('#fa-next', m).onclick = () => { if (pool.length > 1) idx = (idx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length; show(); };
        show();
      });
    };
  });

  /* ================= 3. mindful reintroduction ================= */
  const FOODS = [
    ['🌴', 'دو عدد خرما', 'با چند مغز گردو، عصر.'],
    ['🍫', 'یک مربع شکلات تلخ ۷۰٪', 'بعد از ناهار، آروم و با حواس جمع.'],
    ['🍵', 'یک استکان چای با نصف حبه قند', 'صبح یا عصر، فقط یک استکان.'],
    ['🍰', 'یک تکه‌ی کوچک کیک خانگی', 'اندازه‌ی یک قوطی کبریت، در جمع.'],
    ['🍯', 'یک قاشق چای‌خوری عسل در ماست', 'به‌عنوان میان‌وعده.'],
  ];
  const ri = () => store('fa_reintro', () => ({ start: null, entries: {} }));
  const LV = ['خیلی کم', 'کم', 'متوسط', 'زیاد', 'خیلی زیاد'];
  const VERD = [['ok', '🟢 برام اوکیه'], ['care', '🟡 با احتیاط و اندازه'], ['no', '🔴 فعلاً نه']];
  const reintroDone = () => Object.values(ri().entries).filter(e => e.verdict).length;
  const reintroActive = () => !!ri().start && A.dayDiff(ri().start, today()) <= 14 && reintroDone() < FOODS.length;
  page('reintro', 'بازگشت آگاهانه', () => {
    const r = ri();
    const dayN = r.start ? A.dayDiff(r.start, today()) + 1 : 0;
    const curFood = r.start ? Math.max(0, Math.min(4, Math.floor((dayN - 1) / 2))) : 0;
    const done = reintroDone(), firstOpen = FOODS.findIndex((_, i) => !(r.entries[i] && r.entries[i].verdict));
    const rule = () => {
      const by = k => FOODS.filter((_, i) => r.entries[i] && r.entries[i].verdict === k).map(f => f[1]);
      const ok = by('ok'), care = by('care'), no = by('no');
      return `<div class="card pop stack fa-rule" style="gap:8px"><span class="eyebrow">کارت شخصی</span><h3>📜 قانون شخصی من</h3>
        ${ok.length ? `<p>🟢 <b>گاه‌به‌گاه و با لذت:</b> ${ok.join('، ')}</p>` : ''}${care.length ? `<p>🟡 <b>فقط با اندازه و برنامه:</b> ${care.join('، ')}</p>` : ''}${no.length ? `<p>🔴 <b>فعلاً نه، چون هوسم رو بیدار می‌کنه:</b> ${no.join('، ')}</p>` : ''}
        <p class="small muted">${done < 5 ? 'کارت با هر نتیجه‌ی تازه کامل‌تر می‌شه.' : no.length > 2 ? 'بدنت هنوز به شیرینی حساسه؛ چند هفته‌ی دیگه دوباره امتحان کن.' : 'تو مرزت رو می‌شناسی. شیرینی دیگه رئیس نیست؛ تو تصمیم می‌گیری.'}</p></div>`;
    };
    return `<section class="wrap auth stack" style="gap:16px;max-width:720px">
      ${head('بعد از ۶۳ روز، یا هر وقت آماده بودی', 'بازگشت آگاهانه', 'یک آزمایش ۱۰ روزه: هر خوراکی یک روز امتحان، بعد ۴۸ ساعت مشاهده. هدف، پیدا کردن مرز شخصی خودته، نه برگشتن به عادت قدیمی.')}
      ${!r.start ? `<div class="card stack" style="gap:10px"><b>چطور کار می‌کنه؟</b><ul class="fa-ul small"><li>۵ خوراکی، هر کدوم ۲ روز: روز اول یک بار و با حواس جمع می‌خوری؛ روز دوم فقط مشاهده می‌کنی.</li><li>شب روز امتحان و ۴۸ ساعت بعد، هوس، خواب و حالت رو ثبت می‌کنی.</li><li>آخرش یک «کارت قانون شخصی» می‌گیری.</li></ul>
        <p class="small muted">اگه هنوز دوره‌ها رو تموم نکردی، بهتره صبر کنی. اگه دیابت یا سابقه‌ی پرخوری داری، قبلش با پزشک یا مشاورت هماهنگ کن.</p>
        <button class="btn primary" id="fa-ri-go" type="button">شروع آزمایش ۱۰ روزه</button></div>` : `
      <div class="card row" style="flex-wrap:nowrap">${miniRing(done, 5, 'var(--lav)')}<div class="stack" style="gap:2px;min-width:0"><b>${done >= 5 ? 'آزمایش تموم شد 🎉' : `روز ${fa(Math.min(dayN, 10))} از ۱۰`}</b><span class="small muted">${done >= 5 ? 'کارت قانونت آماده‌ست.' : `پیشنهاد امروز: ${FOODS[curFood][1]} (${dayN % 2 === 1 ? 'روز امتحان' : 'روز مشاهده'})`}</span></div></div>
      ${done ? rule() : ''}
      <div class="stack" style="gap:10px">${FOODS.map((f, i) => { const e = r.entries[i] || {}; const open = i === firstOpen;
        return `<details class="card fa-food" ${open ? 'open' : ''}><summary><span class="fa-big-i">${f[0]}</span><span class="stack" style="gap:0;min-width:0"><b>${f[1]}</b><span class="small muted">${e.verdict ? VERD.find(v => v[0] === e.verdict)[1] : `روز ${fa(i * 2 + 1)} و ${fa(i * 2 + 2)}، ${f[2]}`}</span></span></summary>
          <div class="stack" style="gap:12px;margin-top:10px">
          ${['test', 'obs'].map(ph => `<div class="stack" style="gap:6px"><b class="small">${ph === 'test' ? 'شب روز امتحان' : '۴۸ ساعت بعد'}</b>
            <div class="fa-rrow small"><span class="muted">هوس</span><div class="fa-taps">${LV.map((t, v) => `<button type="button" data-ri="${i}|${ph}|craving|${v}" class="${e[ph] && e[ph].craving === v ? 'on' : ''}" aria-label="هوس ${t}" title="${t}">${fa(v)}</button>`).join('')}</div></div>
            <div class="fa-rrow small"><span class="muted">خواب</span><div class="fa-taps">${['بد', 'معمولی', 'خوب'].map((t, v) => `<button type="button" data-ri="${i}|${ph}|sleep|${v}" class="${e[ph] && e[ph].sleep === v ? 'on' : ''}">${t}</button>`).join('')}</div></div>
            <div class="fa-rrow small"><span class="muted">حال</span><div class="fa-taps">${['😕', '😐', '🙂'].map((t, v) => `<button type="button" data-ri="${i}|${ph}|mood|${v}" class="${e[ph] && e[ph].mood === v ? 'on' : ''}" aria-label="حال ${fa(v + 1)}">${t}</button>`).join('')}</div></div></div>`).join('')}
          <div class="stack" style="gap:6px"><b class="small">نتیجه‌ی من</b><div class="fa-taps fa-wrap">${VERD.map(([k, t]) => `<button type="button" data-rv="${i}|${k}" class="${e.verdict === k ? 'on' : ''}">${t}</button>`).join('')}</div>
          ${e.obs && e.obs.craving >= 3 ? '<p class="small muted">هوست بعدش بالا رفت؛ شاید «فعلاً نه» برای این یکی بهتر باشه.</p>' : e.obs && e.obs.craving != null ? '<p class="small muted">هوست بعدش آروم موند. نشونه‌ی خوبیه.</p>' : ''}</div></div></details>`; }).join('')}</div>
      <div><button class="btn ghost" id="fa-ri-reset" type="button">شروع دوباره‌ی آزمایش</button></div>`}
    </section>`;
  }, () => {
    const g = $('#fa-ri-go'); if (g) g.onclick = () => { ri().start = today(); ri().entries = {}; A.save(); refresh(); };
    const rs = $('#fa-ri-reset'); if (rs) rs.onclick = () => { if (rs.dataset.sure) { D().fa_reintro = { start: null, entries: {} }; A.save(); refresh(); } else { rs.dataset.sure = 1; rs.textContent = 'مطمئنی؟ دوباره بزن'; } };
    $$('[data-ri]').forEach(b => b.onclick = () => { const [i, ph, f, v] = b.dataset.ri.split('|'); const e = ri().entries[i] = ri().entries[i] || {}; e[ph] = e[ph] || {}; e[ph][f] = +v; A.save(); refresh(); });
    $$('[data-rv]').forEach(b => b.onclick = () => { const [i, k] = b.dataset.rv.split('|'); const e = ri().entries[i] = ri().entries[i] || {}; e.verdict = k; A.save(); if (reintroDone() === 5) { A.confetti(); A.toast('کارت قانون شخصی‌ات آماده شد 📜', 'trophy'); } refresh(); });
  });

  /* ================= 11. coach feedback ================= */
  const SLOTS = [['صبح', 5, 12], ['ظهر', 12, 15], ['عصر', 15, 19], ['شب', 19, 24], ['نیمه‌شب', 0, 5]];
  function summary(from, to) {
    const m = acts(), s = D();
    const ds = Object.keys(m).filter(k => inRange(k, from, to)).map(k => m[k]);
    const cnt = f => ds.filter(o => o[f]).length;
    const sos = ds.reduce((a, o) => a + o.sos, 0);
    const cr = ds.filter(o => o.craving != null).map(o => o.craving); const avgCr = cr.length ? cr.reduce((a, b) => a + b, 0) / cr.length : null;
    const evs = (s.sos.events || []).filter(e => inRange(A.dateKey(new Date(e.t)), from, to));
    const sc = SLOTS.map(([, a, b]) => evs.filter(e => e.hour >= a && e.hour < b).length); const mx = Math.max(...sc); const top = mx ? SLOTS[sc.indexOf(mx)][0] : null;
    const cis = Object.entries(ck()).filter(([k]) => inRange(k, from, to)).map(([, v]) => v); const avgEn = cis.length ? cis.reduce((a, c) => a + c.energy, 0) / cis.length : null;
    return { nights: cnt('night'), clean: cnt('clean'), walk: cnt('walk'), breath: cnt('breath'), routine: cnt('routine'), sos, avgCr, top, avgEn, slipsN: slips().filter(x => inRange(x.date, from, to)).length };
  }
  function feedback(x, span) {
    const good = [], next = [];
    if (x.nights >= Math.ceil(span * .7)) good.push(`${fa(x.nights)} شب از ${fa(span)} شب چک‌لیستت رو ثبت کردی. این نظم، ستون اصلی تغییره.`);
    else if (x.nights) good.push(`${fa(x.nights)} شب چک‌لیست ثبت کردی. هر شب ثبت، یعنی یک روز آگاه‌تر.`);
    if (x.clean >= 3) good.push(`${fa(x.clean)} روز بدون قند افزوده داشتی.`);
    if (x.walk >= 3) good.push(`${fa(x.walk)} روز پیاده‌روی کامل کردی؛ بدنت داره به حرکت عادت می‌کنه.`);
    if (x.sos >= 2) good.push(`${fa(x.sos)} هوس رو با دکمه‌ی «هوس دارم» رد کردی. هر بار، مسیر عادت قدیمی ضعیف‌تر می‌شه.`);
    if (x.avgCr != null && x.avgCr <= 1.5) good.push('میانگین شدت هوس‌هات پایین بوده. ذائقه‌ات داره آروم می‌گیره.');
    if (x.top) next.push(`بیشتر هوس‌ها ${x.top} سراغت اومده. برای همون ساعت یک میان‌وعده‌ی پروتئین‌دار و یک لیوان آب آماده کن.`);
    if (x.walk < 3) next.push('پیاده‌روی رو به یک ساعت ثابت (مثلاً بعد از ناهار) گره بزن؛ حتی ۱۰ دقیقه هم حساب می‌شه.');
    if (x.avgEn != null && x.avgEn <= 2.5) next.push('انرژی صبح‌هات پایین بوده. خواب منظم‌تر و صبحانه‌ی پروتئینی رو امتحان کن.');
    if (x.nights < Math.ceil(span * .5)) next.push('برای چک‌لیست شب یک یادآور ثابت بذار؛ دو دقیقه کافیه.');
    if (x.slipsN) next.push(`${fa(x.slipsN)} بار زنجیره‌ی لغزش رو بررسی کردی؛ نقشه‌های «اگر–آنگاه»ت رو یک بار مرور کن.`);
    return { good: good.slice(0, 3), next: next.slice(0, 2) };
  }
  function coachNotes() {
    const out = []; const site = A.site && A.site.settings && A.site.settings.coach && A.site.settings.coach.text; if (site) out.push({ text: site });
    const n = D().coach_notes;
    if (typeof n === 'string' && n.trim()) out.push({ text: n });
    else if (Array.isArray(n)) n.forEach(x => out.push(typeof x === 'string' ? { text: x } : { text: x.body || x.text || '' }));
    else if (n && typeof n === 'object') Object.values(n).forEach(v => out.push({ text: typeof v === 'string' ? v : (v.body || v.text || '') }));
    return out.filter(x => x.text);
  }
  page('coach', 'بازخورد مربی', () => {
    const t = today(), x = summary(addDays(t, -6), t), fb = feedback(x, 7), s = D();
    const notes = coachNotes(), tt = on('slipwizard') && topTrigger();
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const cyc = A.PROGRAM.cycles.map(c => {
      const L = d => s.log[`c${c.id}d${d.day}`];
      const ls = c.days.map(L).filter(l => l && l.done); if (!ls.length) return '';
      const finished = (s.completedCycles || []).includes(c.id);
      const clean = ls.filter(l => l.slip === 'no').length;
      const w1 = avg(c.days.slice(0, 7).map(L).filter(l => l && l.done).map(l => l.craving || 0));
      const w3 = avg(c.days.slice(14).map(L).filter(l => l && l.done).map(l => l.craving || 0));
      const trend = w1 != null && w3 != null ? (w3 < w1 ? `شدت هوس از هفته‌ی اول تا هفته‌ی سوم کمتر شد (از ${fa(w1.toFixed(1))} به ${fa(w3.toFixed(1))} از ۴).` : 'شدت هوس‌ها تقریباً ثابت موند؛ این هم طبیعیه و با زمان آروم‌تر می‌شه.') : '';
      return `<div class="card stack" style="gap:6px"><div class="row" style="justify-content:space-between"><b style="color:${c.color}">دوره‌ی ${fa(c.id)}: ${esc(c.title)}</b><span class="chip ${finished ? 'mint' : ''}">${finished ? 'تمام‌شده' : 'در جریان'}</span></div>
        <p class="small">${fa(ls.length)} روز از ۲۱ روز رو ثبت کردی و ${fa(clean)} روزش کاملاً بی‌قند بود. ${trend}</p>
        ${finished ? `<p class="small muted">${clean >= 14 ? 'دوره‌ی خیلی محکمی بود. عادت‌هات دارن خودکار می‌شن.' : 'هر روزی که اومدی حساب شد. دوره‌ی بعد رو با یک تمرکز کوچیک شروع کن، مثلاً فقط چای بی‌قند.'}</p>` : ''}</div>`;
    }).join('');
    return `<section class="wrap auth stack" style="gap:16px;max-width:720px">
      ${head('گزارش خودکار از داده‌های خودت', 'بازخورد مربی', 'هر هفته و در پایان هر دوره، یوژو کارهایی که کردی رو می‌بینه و جمع‌بندی می‌کنه؛ بدون سرزنش.')}
      ${notes.length ? `<div class="card pop stack" style="gap:8px"><span class="eyebrow">✍️ یادداشت مربی</span>${notes.map(n => `<p>${esc(n.text)}</p>`).join('')}</div>` : ''}
      <div class="card stack" style="gap:10px"><div class="row" style="justify-content:space-between"><b>📅 هفت روز اخیر</b><span class="small muted">${fa(x.nights)} شب ثبت، ${fa(x.walk)} پیاده‌روی، ${fa(x.sos)} هوس رد شده</span></div>
        ${fb.good.length ? `<div class="stack" style="gap:4px"><b class="small" style="color:var(--mint)">چه چیزی خوب پیش رفت</b>${fb.good.map(g => `<p class="small">🌿 ${g}</p>`).join('')}</div>` : '<p class="small muted">هنوز داده‌ی کافی برای این هفته نیست. با چند روز ثبت، اینجا پر می‌شه.</p>'}
        ${fb.next.length ? `<div class="stack" style="gap:4px"><b class="small" style="color:var(--berry)">پیشنهاد برای هفته‌ی بعد</b>${fb.next.map(g => `<p class="small">🎯 ${g}</p>`).join('')}</div>` : ''}</div>
      ${cyc}
      ${tt ? `<a class="card row" href="#slip" style="text-decoration:none;color:inherit;flex-wrap:nowrap"><span class="fa-big-i">🔗</span><span class="small">محرک شماره‌ی ۱ تو: <b>${tt.t ? tt.t[1] : ''}</b>، مرور نقشه‌ها ←</span></a>` : ''}
    </section>`;
  });

  /* ================= hooks: today / night / journey / settings ================= */
  hook('todayTop', () => { if (!D().profile || D().cycleDone) return ''; freezeCheck(); return checkinWidget(); });
  hook('todayMain', () => quizWidget());
  hook('todayAside', () => companionWidget());
  hook('mount', r => {
    if (!A.user || !D().profile || r !== 'today') return;
    chalAward();
    bindCheckin(); bindQuiz(); bindCompanion(); loadCheerChip();
    const s = soc(); if (s.on && (!s.lastPub || Date.now() - s.lastPub > 30 * 60e3)) publish(true);
    if (pendingSlip && on('slipwizard')) {
      pendingSlip = null;
      setTimeout(() => (!location.hash || location.hash === '#today') && A.modal(`<div class="stack" style="text-align:center;gap:12px"><div style="width:110px;margin:0 auto">${A.ART.mascot('calm')}</div><h3>بیا با هم نگاهش کنیم</h3><p class="small">امروز یه لغزش ثبت کردی. این شکست نیست؛ یه داده‌ی ارزشمنده. با چهار سؤال کوتاه پیدا می‌کنیم از کجا شروع شد و برای دفعه‌ی بعد یک نقشه‌ی تازه می‌سازیم.</p><div class="row" style="justify-content:center"><a class="btn primary" href="#slip" id="fa-sgo">بزن بریم (۲ دقیقه)</a><button class="btn ghost" id="fa-slater" type="button">الان نه</button></div></div>`, (m, close) => { $('#fa-sgo', m).onclick = () => close(); $('#fa-slater', m).onclick = close; }), 1800);
    }
  });
  hook('nightSubmit', (log, first) => {
    if (log.slip && log.slip !== 'no' && first) { pendingSlip = today(); wiz = null; }
    if (freezeEarn()) setTimeout(() => A.toast(`هفت روز بی‌لغزش! یک «روز امن» ❄️ گرفتی (الان ${fa(frz().count)} تا داری). اگه روزی جا موند، زنجیره‌ات رو نگه می‌داره.`, 'trophy'), 2500);
    setTimeout(() => { chalAward(); publish(true); }, 600);
  });
  hook('nightExtra', () => on('slipwizard') ? `<p class="small muted">اگه امروز لغزش داشتی، بعد از ثبت با هم دو دقیقه زنجیره‌اش رو بررسی می‌کنیم. لغزش = داده، نه شکست.</p>` : '');
  hook('journey', () => {
    const items = [], li = (href, icon, title, sub) => `<${href ? `a class="fa-jl" href="#${href}"` : 'div class="fa-jl"'}><span class="fa-big-i">${icon}</span><span class="stack" style="gap:0;min-width:0"><b class="small">${title}</b><span class="small muted">${sub}</span></span></${href ? 'a' : 'div'}>`;
    if (on('timeline')) { const n = progDay(), p = PHASES.find(x => n >= x[0] && n <= x[1]); items.push(li('body', p[3], `بدنت الان: ${p[2]}`, `روز ${fa(n)} از ۶۳`)); }
    if (on('coach')) { const t = today(), x = summary(addDays(t, -6), t); items.push(li('coach', '📋', 'بازخورد این هفته', `${fa(x.nights)} شب ثبت، ${fa(x.clean)} روز بی‌قند`)); }
    if (on('freeze')) { const f = frz(); items.push(li(on('challenges') ? 'challenges' : '', '❄️', `${fa(f.count)} روز امن ذخیره`, f.used.length ? `${fa(f.used.length)} بار زنجیره‌ات رو نجات داد` : 'هر ۷ روز بی‌لغزش، یکی')); }
    if (on('challenges')) { const w = Object.values(chs().wins).reduce((a, b) => a + b.length, 0); items.push(li('challenges', '🎯', 'چالش‌ها', `${fa(w)} بار برنده شدی`)); }
    if (on('reintro') && ((D().completedCycles || []).includes(3) || ri().start)) items.push(li('reintro', '📜', 'بازگشت آگاهانه', ri().start ? 'ادامه‌ی آزمایش' : 'آماده‌ی پیدا کردن مرز شخصی‌ات؟'));
    return items.length ? `<div class="card stack" style="gap:10px"><b>بیشتر از مسیر تو</b><div class="fa-jgrid">${items.join('')}</div></div>` : '';
  });
  hook('settings', () => {
    const rows = [['checkin', 'fa-s1', 'checkin', 'امروز چطوری؟ (حال و انرژی)'], ['companion', 'fa-s2', 'companion', 'همراه و انرژی روزانه'], ['quiz', 'fa-s3', 'quiz', 'سؤال یک‌دقیقه‌ای بعد از متن روز']].filter(r => on(r[0]));
    const social = on('buddy') || on('team') || on('league');
    if (!rows.length && !social) return '';
    return `<div class="card stack" style="gap:8px"><b>صفحه‌ی امروز</b>${rows.map(([, id, k, t]) => `<label class="check" for="${id}"><input type="checkbox" id="${id}" ${pref()[k] !== false ? 'checked' : ''}><span>${t}</span></label>`).join('')}
      ${social ? `<p class="small muted">اشتراک‌گذاری با دوستان: ${soc().on ? `روشن (${esc(soc().nick)})` : 'خاموش'}، <a href="#friends">مدیریت</a></p>` : ''}</div>`;
  });
  hook('settingsSave', () => { const p = pref(); [['fa-s1', 'checkin'], ['fa-s2', 'companion'], ['fa-s3', 'quiz']].forEach(([id, k]) => { const el = $('#' + id); if (el) p[k] = el.checked; }); });
  hook('reminders', () => {
    if (!A.user || !D().profile) return [];
    const out = [], t0 = (D().settings.times || [])[0] || '09:00';
    const p = D().fa_prep;
    if (p && p.started && prepEligible() && prepDoneN() < 7) { const i = PREP.findIndex((_, k) => !(p.done || [])[k]); if (PREP[i]) out.push({ time: A.addMin(t0, 30), text: `قند آهسته، قدم امروز: ${PREP[i][0]}. ${PREP[i][1]}`, spot: 'water', url: '#slow' }); }
    if (on('reintro') && D().fa_reintro && reintroActive()) out.push({ time: '21:00', text: 'بازگشت آگاهانه: هوس، خواب و حال امروزت رو ثبت کن 📜', spot: 'moon', url: '#reintro' });
    return out;
  });

  /* ================= tools hub ================= */
  [
    ['slow', '🍬', 'قند آهسته', 'هفته‌ی اختیاری کاهش، پیش از شروع', 'prep'],
    ['paths', '🧭', 'مسیرهای موضوعی', 'چای بی‌قند در ۵ روز، مهمونی بی‌قند و…', 'journeys'],
    ['challenges', '🎯', 'چالش‌ها و روز امن', '«X بار در Y روز»، خودکار از کارهات', 'challenges'],
    ['quiz', '🧠', 'کوییز درس‌ها', 'یک سؤال بعد از هر متن و مرور سه‌روزه', 'quiz'],
    ['phrases', '🙏', 'جمله‌های تعارف', 'رد کردن مؤدبانه‌ی شیرینی در جمع', 'taarof'],
    ['slip', '🔗', 'زنجیره‌ی لغزش', 'محرک ← فکر ← رفتار ← نقشه‌ی تازه', 'slipwizard'],
    ['coach', '📋', 'بازخورد مربی', 'جمع‌بندی هفتگی و پایان هر دوره', 'coach'],
    ['body', '🫀', 'خط زمانی بدن', 'الان در بدنت چه می‌گذره؟', 'timeline'],
    ['friends', '🤝', 'یار بی‌قند', 'زنجیره‌ی مشترک با یک دوست', 'buddy'],
    ['team', '👨‍👩‍👧', 'تیم خانواده', 'با هم غول قند رو شکست بدید', 'team'],
    ['league', '🏆', 'لیگ هفتگی', 'اختیاری؛ امتیاز فقط از کارهای سالم', 'league'],
    ['reintro', '📜', 'بازگشت آگاهانه', 'آزمایش ۱۰ روزه و قانون شخصی من', 'reintro'],
  ].forEach(([route, icon, title, desc, key]) => A.tools.push({ route, icon, title, desc, show: () => on(key) }));
});

// Offer the reintroduction test on the "cycle finished" screen after cycle 3.
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  A.H.cycleDone = (A.H.cycleDone || []).concat(n => n === 3 && A.site.settings.features?.reintro !== false && A.views.reintro
    ? `<a class="card row" href="#reintro" style="text-decoration:none;color:inherit;flex-wrap:nowrap;text-align:start"><span style="font-size:1.8rem">🧪</span><span class="stack" style="gap:2px"><b>بازگشت آگاهانه</b><span class="small muted">۱۰ روز آزمایش کن کدوم خوراکی‌ها برای تو بی‌خطرن و قانون شخصی خودت رو بساز.</span></span></a>` : '');
});
