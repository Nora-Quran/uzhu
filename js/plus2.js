/* Uzhu improvements round 3 (plugin P): "your next step" card + quick tour, install-as-app prompt, daily sugar diary
   with a WHO-based budget, diabetes risk test (FINDRISC), backup & restore, badge gallery, 5-week calendar heatmap,
   body & lab tracker, printable report for a doctor, and readability (text size, reduced motion, read aloud).
   State: A.D().p2 (account) and localStorage 'uzhu:a11y' / 'uzhu:install' (this device). Gated by feature keys. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const P = () => { const d = A.D(); d.p2 = d.p2 || {}; d.p2.sugar = d.p2.sugar || {}; d.p2.body = d.p2.body || []; return d.p2; };
  const guest = () => !A.user || !A.D().profile;
  const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const dec = (n, d = 1) => fa(Number(n).toFixed(d)).replace('.', '٫');
  const num = v => { const x = parseFloat(String(v || '').replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace('٫', '.')); return isNaN(x) ? null : x; };
  const page = (eyebrow, title, sub, body, max = 860) => `<section class="wrap stack" style="gap:16px;max-width:${max}px">
    <div class="section-head" style="margin:0"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${body}</section>`;
  const tool = (route, icon, title, desc, key) => A.tools.push({ route, icon, title, desc, show: () => on(key) });

  /* ================= 1. your next step + quick tour ================= */
  function nextStep() {
    const s = A.D(), h = new Date().getHours(), lg = s.log[A.logKey()] || {}, sl = s.sl || {};
    const lastNight = A.dateKey(new Date(Date.now() - 14 * 3600e3));
    const ex = A.exDay(s.cycle, s.day), mv = s.move[A.logKey()] || {};
    const moveDone = ex && (mv.walk >= ex.walk || mv.routine);
    const sugarToday = (P().sugar[A.dateKey()] || []).length;
    if (lg.done) return h < 21 && !moveDone && on('move') ? ['🚶‍♀️', 'امروز رو تموم کردی؛ فقط ورزش مونده', 'یه پیاده‌روی کوتاه یا جلسه‌ی ۵ دقیقه‌ای، خوابت رو هم بهتر می‌کنه.', '#move', 'برو به ورزش']
      : on('sleep') ? ['🌙', 'امروزت کامله، آفرین!', 'حالا وقت استراحته. اگه خواستی صداهای خواب رو روشن کن.', '#sleep', 'بخش خواب']
      : ['🌙', 'امروزت کامله، آفرین!', 'حالا وقت استراحته. فردا صبح ادامه می‌دیم.', '#journey', 'مسیر من'];
    if (h >= 5 && h < 12 && on('sleep') && !(sl.diary || {})[lastNight]) return ['📔', 'اول صبح: دیشب چطور خوابیدی؟', 'یک دقیقه وقت می‌بره و رابطه‌ی خواب و هوست رو نشونت می‌ده.', '#sleepdiary', 'ثبت خواب دیشب'];
    if (h < 14) return ['📖', 'متن امروز رو بخون و مأموریتت رو ببین', 'دو دقیقه خوندن، یک کار کوچیک برای امروز.', '#read', 'خوندن متن امروز'];
    if (h < 20 && on('sugardiary') && !sugarToday) return ['🍬', 'امروز چقدر قند افزوده خوردی؟', 'با چند تیک، بودجه‌ی قند امروزت رو ببین.', '#sugar', 'دفترچه‌ی قند'];
    if (h < 20 && ex && !moveDone && on('move')) return ['🚶‍♀️', `${fa(ex.walk)} دقیقه پیاده‌روی امروز`, 'بهترین زمانش همین الانه، به‌خصوص بعد از غذا.', '#move', 'برو به ورزش'];
    if (h >= 20 || h < 4) return ['🌙', 'وقت چک‌لیست آخر شبه', 'روزت رو تیک بزن تا فردا روز بعدی باز بشه.', '#night', 'چک‌لیست شب'];
    return ['🍰', 'یه خوراکی بی‌قند برای عصرونه', 'از رسپی‌های سریع یکی رو امتحان کن.', '#recipes', 'دیدن رسپی‌ها'];
  }
  add('todayTop', () => {
    let out = '';
    if (on('nextstep')) {
      const [icon, title, sub, href, btn] = nextStep();
      out += `<div class="card p2-next"><span class="p2-ni">${icon}</span><div class="stack" style="gap:2px;min-width:0"><span class="eyebrow">قدم بعدی تو</span><b>${esc(title)}</b><span class="small muted">${esc(sub)}</span></div><a class="btn primary" href="${href}">${esc(btn)}</a></div>`;
      if (!P().tour) out += `<div class="card p2-tour stack"><div class="row" style="justify-content:space-between"><b>👋 راهنمای سریع حبه</b><button class="btn ghost" id="p2tour">فهمیدم</button></div>
        <ol><li><b>صبح:</b> متن امروز رو بخون و مأموریت روز رو ببین.</li><li><b>طول روز:</b> یادآورها میان؛ هر وقت هوس شیرینی کردی دکمه‌ی صورتی <b>«هوس دارم»</b> رو بزن.</li><li><b>آخر شب:</b> چک‌لیست شب رو تیک بزن تا روز بعد باز بشه.</li><li><b>ابزارها:</b> ورزش، خواب، رسپی‌ها و ده‌ها ابزار دیگه از منوی پایین در دسترسه.</li></ol></div>`;
    }
    out += installCard();
    return out;
  });
  add('mount', r => {
    if (r !== 'today') return;
    const t = $('#p2tour'); if (t) t.onclick = () => { P().tour = true; A.save(); t.closest('.p2-tour').remove(); };
    const rd = $('.p2-next a[href="#read"]'); if (rd) rd.onclick = e => { e.preventDefault(); $('.reading')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    bindInstall();
  });

  /* ================= 2. install as an app ================= */
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (A.user && A.D && A.D() && /today|home/.test(location.hash)) try { A.render(); } catch (err) {} });
  window.addEventListener('appinstalled', () => { deferred = null; ls.set('uzhu:install', { done: true }); });
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ios = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  function installCard() {
    if (!on('install') || standalone()) return '';
    const st = ls.get('uzhu:install', {}); if (st.done || (st.later && Date.now() - st.later < 14 * 864e5)) return '';
    if (!deferred && !ios()) return '';
    return `<div class="card p2-install"><span class="p2-ni">📲</span><div class="stack" style="gap:2px;min-width:0"><b>حبه رو مثل یک اپ روی گوشیت نصب کن</b><span class="small muted">باز شدن با یک لمس، کار بدون اینترنت${ios() ? ' و روی آیفون، تنها راه گرفتن اعلان‌ها' : ' و اعلان‌های مطمئن‌تر'}.</span></div><div class="row" style="flex-wrap:nowrap"><button class="btn primary" id="p2inst">نصب</button><button class="btn ghost" id="p2later" aria-label="بعداً">بعداً</button></div></div>`;
  }
  function bindInstall() {
    const b = $('#p2inst'); if (!b) return;
    b.onclick = async () => {
      if (deferred) { deferred.prompt(); const r = await deferred.userChoice.catch(() => ({})); deferred = null; if (r.outcome === 'accepted') ls.set('uzhu:install', { done: true }); A.render(); return; }
      A.modal(`<div class="stack"><h2>نصب حبه روی آیفون</h2><ol class="p2-steps"><li>این صفحه رو در <b>Safari</b> باز کن.</li><li>دکمه‌ی <b>اشتراک‌گذاری</b> (مربع با فلش رو به بالا) پایین صفحه رو بزن.</li><li>گزینه‌ی <b>Add to Home Screen</b> رو انتخاب کن و <b>Add</b> رو بزن.</li><li>از این به بعد حبه رو از آیکونش روی صفحه‌ی اصلی باز کن و توی تنظیمات اجازه‌ی اعلان بده.</li></ol></div>`);
    };
    $('#p2later').onclick = () => { ls.set('uzhu:install', { later: Date.now() }); $('.p2-install')?.remove(); };
  }
  add('homeHero', () => (on('install') && !standalone() && (deferred || ios())) ? `<button class="btn ghost" id="p2inst-h">📲 نصب اپ</button>` : '');
  add('mount', r => { if (r !== 'home') return; const b = $('#p2inst-h'); if (b) b.onclick = () => { if (deferred) deferred.prompt(); else A.modal('<div class="stack"><h2>نصب حبه روی آیفون</h2><p>در Safari دکمه‌ی اشتراک‌گذاری رو بزن و «Add to Home Screen» رو انتخاب کن.</p></div>'); }; });

  /* ================= 3. sugar diary with a daily budget ================= */
  // Free sugar per usual serving, in grams (estimates from typical Iranian products and USDA/label values).
  const FOODS = [
    ['حبه‌قند با چای', '۱ حبه', 4.5, 'چای'], ['شکر در چای یا قهوه', '۱ قاشق چای‌خوری', 4, 'چای'], ['نبات', '۱ تکه‌ی کوچک', 5, 'چای'], ['قهوه‌ی فوری ۳در۱', '۱ ساشه', 11, 'چای'], ['شربت (آبلیمو، بهارنارنج، سکنجبین)', '۱ لیوان', 25, 'نوشیدنی'],
    ['نوشابه', '۱ قوطی', 35, 'نوشیدنی'], ['ماءالشعیر شیرین', '۱ قوطی', 25, 'نوشیدنی'], ['آبمیوه‌ی پاکتی', '۱ پاکت کوچک', 20, 'نوشیدنی'], ['شیرکاکائو', '۱ پاکت', 18, 'نوشیدنی'], ['دوغ یا ماست ساده', '۱ لیوان', 0, 'نوشیدنی'],
    ['شکلات شیری', '۱ تخته‌ی کوچک', 13, 'شیرینی'], ['کیک یزدی یا کیک بسته‌ای', '۱ عدد', 15, 'شیرینی'], ['بیسکویت شیرین', '۳ عدد', 7, 'شیرینی'], ['شیرینی خامه‌ای', '۱ عدد', 15, 'شیرینی'], ['شیرینی خشک یا نخودچی', '۳ عدد', 6, 'شیرینی'],
    ['گز یا سوهان', '۲ تکه', 14, 'شیرینی'], ['باقلوا', '۱ تکه', 12, 'شیرینی'], ['زولبیا و بامیه', '۲ تکه', 20, 'شیرینی'], ['بستنی', '۱ اسکوپ', 14, 'شیرینی'], ['آب‌نبات یا پاستیل', '۱ مشت کوچک', 15, 'شیرینی'],
    ['شله‌زرد یا فرنی شیرین', '۱ کاسه‌ی کوچک', 22, 'دسر'], ['حلوا', '۲ قاشق غذاخوری', 15, 'دسر'], ['ماست میوه‌ای', '۱ عدد', 12, 'دسر'], ['مربا', '۱ قاشق غذاخوری', 10, 'صبحانه'], ['عسل یا شیره', '۱ قاشق غذاخوری', 16, 'صبحانه'],
    ['کورن‌فلکس شیرین', '۱ کاسه', 12, 'صبحانه'], ['نان شیرمال یا کشمشی', '۱ عدد', 10, 'صبحانه'], ['سس کچاپ', '۱ قاشق غذاخوری', 4, 'غذا'], ['رسپی بی‌قند حبه', '۱ وعده', 0, 'صبحانه'], ['میوه‌ی کامل', '۱ عدد', 0, 'صبحانه'],
  ];
  const BUDGET = 25, LIMIT = 50; // WHO: free sugars under 10% of energy (~50 g), ideally under 5% (~25 g).
  const sumDay = k => (P().sugar[k] || []).reduce((a, [i, n]) => a + (FOODS[i] ? FOODS[i][2] * n : 0), 0);
  const ringSvg = g => { const r = 52, c = 2 * Math.PI * r, f = Math.min(1, g / LIMIT), col = g <= BUDGET ? 'var(--mint)' : g <= LIMIT ? 'var(--sun)' : 'var(--berry)';
    return `<svg viewBox="0 0 130 130" class="p2-ring" role="img" aria-label="${fa(Math.round(g))} گرم قند افزوده"><circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="14"/><circle cx="65" cy="65" r="${r}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 65 65)"/><text x="65" y="64" text-anchor="middle" class="p2-rt">${fa(Math.round(g))}</text><text x="65" y="84" text-anchor="middle" class="p2-rs">گرم از ${fa(LIMIT)}</text></svg>`; };
  let sugarCat = 'همه';
  A.titles.sugar = 'دفترچه‌ی قند'; A.appRoutes.push('sugar');
  A.views.sugar = () => {
    const k = A.dateKey(), list = P().sugar[k] || [], g = sumDay(k), cnt = i => (list.find(x => x[0] === i) || [0, 0])[1];
    const cats = ['همه', ...new Set(FOODS.map(f => f[3]))];
    const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); const kk = A.dateKey(d); return [kk, sumDay(kk), (P().sugar[kk] || []).length > 0]; });
    const logged = week.filter(w => w[2]), avg = logged.length ? logged.reduce((a, w) => a + w[1], 0) / logged.length : 0;
    return page('دفترچه‌ی قند', 'امروز چقدر قند افزوده خوردی؟', `سازمان جهانی بهداشت می‌گه قند آزاد کمتر از ۵۰ گرم در روز باشه و بهتره زیر ${fa(BUDGET)} گرم (حدود ۶ حبه‌قند) بمونه. قند طبیعی میوه‌ی کامل، شیر و ماست ساده جزو این حساب نیست.`,
      `<div class="p2-sugar-top card"><div class="p2-ringw">${ringSvg(g)}</div><div class="stack" style="gap:6px"><b>${g <= BUDGET ? (g ? 'عالیه! زیر بودجه‌ی ایده‌آل هستی 🌱' : 'هنوز چیزی ثبت نکردی') : g <= LIMIT ? 'از بودجه‌ی ایده‌آل گذشتی، ولی هنوز زیر سقفی 🙂' : 'امروز از سقف روزانه گذشتی؛ اشکال نداره، فردا دوباره 💪'}</b><span class="small muted">حدود ${fa(Math.round(g / 4.5))} حبه‌قند، میانگین ${fa(logged.length)} روز ثبت‌شده‌ی این هفته: ${fa(Math.round(avg))} گرم</span>
        <div class="p2-week">${week.map(([kk, v, has]) => `<div title="${fa(Math.round(v))} گرم"><i style="height:${has ? Math.max(6, Math.min(100, v / LIMIT * 100)) : 0}%" class="${v <= BUDGET ? 'ok' : v <= LIMIT ? 'mid' : 'bad'}"></i><span>${fa(kk.slice(8))}</span></div>`).join('')}</div></div></div>
      <div class="filters">${cats.map(c => `<button data-sc="${esc(c)}" class="${c === sugarCat ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>
      <div class="p2-foods">${FOODS.map((f, i) => (sugarCat === 'همه' || f[3] === sugarCat) ? `<div class="card p2-food ${cnt(i) ? 'on' : ''}"><div class="stack" style="gap:0;min-width:0"><b>${esc(f[0])}</b><span class="small muted">${esc(f[1])}، ${f[2] ? `${fa(f[2]).replace('.', '٫')} گرم` : 'بدون قند افزوده'}</span></div><div class="p2-cnt"><button data-dn="${i}" aria-label="کم کن">−</button><b>${fa(cnt(i))}</b><button data-up="${i}" aria-label="اضافه کن">+</button></div></div>` : '').join('')}</div>
      <p class="small muted">اعداد تخمینی‌ان و از برچسب محصولات رایج و جدول‌های تغذیه‌ای اومدن. برای عدد دقیق، از «ماشین‌حساب برچسب» استفاده کن.</p>`);
  };
  A.mounts.sugar = () => {
    $$('[data-sc]').forEach(b => b.onclick = () => { sugarCat = b.dataset.sc; A.render(); });
    const ch = (i, d) => { const k = A.dateKey(), l = (P().sugar[k] = P().sugar[k] || []), e = l.find(x => x[0] === i); if (e) e[1] = Math.max(0, e[1] + d); else if (d > 0) l.push([i, 1]); P().sugar[k] = l.filter(x => x[1] > 0); A.save(); const y = scrollY; A.render(); scrollTo(0, y); };
    $$('[data-up]').forEach(b => b.onclick = () => ch(Number(b.dataset.up), 1));
    $$('[data-dn]').forEach(b => b.onclick = () => ch(Number(b.dataset.dn), -1));
  };
  add('nightExtra', () => on('sugardiary') && !guest() ? `<a class="card row sl-today" href="#sugar"><span class="sl-ti">🍬</span><span class="stack" style="gap:2px"><b>قند افزوده‌ی امروز: ${fa(Math.round(sumDay(A.dateKey())))} گرم</b><span class="small muted">دفترچه‌ی قند رو کامل کن</span></span></a>` : '');

  /* ================= 4. type 2 diabetes risk test (FINDRISC) ================= */
  const RISK = [
    ['age', 'چند سالته؟', [['کمتر از ۴۵', 0], ['۴۵ تا ۵۴', 2], ['۵۵ تا ۶۴', 3], ['بیشتر از ۶۴', 4]]],
    ['act', 'هر روز دست‌کم ۳۰ دقیقه فعالیت بدنی داری (کار یا ورزش)؟', [['بله', 0], ['نه', 2]]],
    ['veg', 'هر روز سبزی یا میوه می‌خوری؟', [['بله', 0], ['نه هر روز', 1]]],
    ['bp', 'تا حالا داروی فشار خون مصرف کردی؟', [['نه', 0], ['بله', 2]]],
    ['glu', 'تا حالا در آزمایش یا بارداری، قند خونت بالا گزارش شده؟', [['نه', 0], ['بله', 5]]],
    ['fam', 'کسی از خانواده‌ات دیابت داره یا داشته؟', [['نه', 0], ['پدربزرگ، مادربزرگ، عمو، خاله، دایی یا عمه', 3], ['پدر، مادر، خواهر، برادر یا فرزند', 5]]],
  ];
  const RLEVEL = [[7, 'کم', 'mint', 'حدود ۱ نفر از ۱۰۰ نفر در ۱۰ سال آینده'], [12, 'کمی بالا', 'mint', 'حدود ۱ نفر از ۲۵ نفر'], [15, 'متوسط', 'sun', 'حدود ۱ نفر از ۶ نفر'], [21, 'بالا', 'berry', 'حدود ۱ نفر از ۳ نفر'], [99, 'خیلی بالا', 'berry', 'حدود ۱ نفر از ۲ نفر']];
  A.titles.risk = 'آزمون خطر دیابت';
  A.views.risk = () => {
    const prev = !guest() && P().risk;
    return page('آزمون خطر دیابت نوع ۲', 'در ۲ دقیقه خطر دیابت ۱۰ سال آینده‌ات رو بسنج', 'بر پایه‌ی آزمون FINDRISC (فنلاند)، یکی از معتبرترین پرسشنامه‌های غربالگری دیابت در دنیا. این آزمون تشخیص نیست و جای آزمایش خون رو نمی‌گیره.',
      `${prev ? `<div class="card sl-tip"><b>آخرین نتیجه‌ات: ${fa(prev.score)} امتیاز، خطر ${esc(prev.level)}</b><p class="small">${esc(A.jalali(new Date(prev.date + 'T12:00')))}</p></div>` : ''}
      <form id="rkf" class="card stack" style="gap:14px">
        <div class="two"><div class="field"><label for="rh">قد (سانتی‌متر)</label><input class="input" id="rh" inputmode="decimal" placeholder="۱۶۵"></div><div class="field"><label for="rw">وزن (کیلوگرم)</label><input class="input" id="rw" inputmode="decimal" placeholder="۶۸"></div></div>
        <div class="two"><div class="field"><label for="rs">جنسیت</label><select class="input" id="rs"><option value="f">زن</option><option value="m">مرد</option></select></div><div class="field"><label for="rwa">دور کمر، هم‌سطح ناف (سانتی‌متر)</label><input class="input" id="rwa" inputmode="decimal" placeholder="۸۵"></div></div>
        ${RISK.map(([k, q, o]) => `<div class="stack" style="gap:6px"><span>${esc(q)}</span><div class="row">${o.map(([t, sc]) => `<label class="p2-opt"><input type="radio" name="r-${k}" value="${sc}"><span>${esc(t)}</span></label>`).join('')}</div></div>`).join('')}
        <button class="btn primary" type="submit">محاسبه‌ی خطر</button><div id="rkr"></div></form>
      <p class="small muted">منبع: Lindström J, Tuomilehto J. The diabetes risk score. Diabetes Care 2003. اگر نتیجه متوسط یا بالاست، آزمایش قند ناشتا یا HbA1c رو با پزشکت هماهنگ کن.</p>`);
  };
  A.mounts.risk = () => {
    $('#rkf').onsubmit = e => {
      e.preventDefault();
      const h = num($('#rh').value), w = num($('#rw').value), wa = num($('#rwa').value), sex = $('#rs').value;
      const miss = RISK.find(([k]) => !$(`[name="r-${k}"]:checked`));
      if (!h || !w || !wa || miss) { A.toast('همه‌ی سؤال‌ها رو جواب بده 🙂'); return; }
      const bmi = w / ((h / 100) ** 2);
      let sc = RISK.reduce((a, [k]) => a + Number($(`[name="r-${k}"]:checked`).value), 0);
      sc += bmi < 25 ? 0 : bmi <= 30 ? 1 : 3;
      sc += sex === 'm' ? (wa < 94 ? 0 : wa <= 102 ? 3 : 4) : (wa < 80 ? 0 : wa <= 88 ? 3 : 4);
      const L = RLEVEL.find(x => sc < x[0]);
      const tips = ['هر کیلو وزنی که کم کنی و هر ۳۰ دقیقه پیاده‌روی، این خطر رو پایین میاره؛ برنامه‌ی پیشگیری از دیابت آمریکا نشون داد کاهش ۵ تا ۷ درصد وزن خطر رو حدود ۵۸ درصد کم می‌کنه.'];
      if (sc >= 12) tips.unshift('با پزشکت درباره‌ی آزمایش قند ناشتا یا HbA1c صحبت کن.');
      $('#rkr').innerHTML = `<div class="p2-risk ${L[2]}"><span class="small">امتیاز تو</span><b class="num">${fa(sc)}</b><span>خطر <b>${L[1]}</b>: ${L[3]}</span><span class="small">نمایه‌ی توده‌ی بدنی (BMI): ${dec(bmi)}</span></div><ul>${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
      if (!guest()) { P().risk = { score: sc, level: L[1], date: A.dateKey(), bmi: Math.round(bmi * 10) / 10 }; A.save(); }
    };
  };

  /* ================= 5. backup & restore ================= */
  add('settings', () => on('backup') ? `<div class="card stack" style="gap:10px"><b>💾 پشتیبان‌گیری از اطلاعات</b><p class="small muted">همه‌ی پیشرفت، چک‌لیست‌ها و یادداشت‌هات رو در یک فایل ذخیره کن تا روی گوشی یا مرورگر دیگه هم داشته باشیشون.</p>
    <div class="row"><button class="btn ghost" type="button" id="p2exp">⬇️ دانلود فایل پشتیبان</button><label class="btn ghost" for="p2imp">⬆️ بازگردانی از فایل</label><input type="file" id="p2imp" accept="application/json,.json" hidden></div></div>` : '');
  add('mount', r => {
    if (r !== 'settings') return;
    const ex = $('#p2exp'); if (ex) ex.onclick = () => {
      const blob = new Blob([JSON.stringify({ app: 'uzhu', v: 1, at: new Date().toISOString(), name: A.user.name, data: A.D() }, null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `uzhu-backup-${A.dateKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000); A.toast('فایل پشتیبان آماده شد.', 'bell');
    };
    const im = $('#p2imp'); if (im) im.onchange = async () => {
      const f = im.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        if (j.app !== 'uzhu' || !j.data || typeof j.data !== 'object' || Array.isArray(j.data) || !j.data.log) throw new Error('bad');
        // Clean the file before it replaces anything: bad numbers or times would break the program day and reminders.
        const d = j.data, hm = t => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
        if (!Number.isInteger(d.cycle) || d.cycle < 1) delete d.cycle;
        if (!Number.isInteger(d.day) || d.day < 1 || d.day > 21) delete d.day;
        if (d.settings && typeof d.settings === 'object') {
          if (!Array.isArray(d.settings.times) || !d.settings.times.every(hm)) delete d.settings.times;
          if (d.settings.moveTime != null && !hm(d.settings.moveTime)) delete d.settings.moveTime;
        } else delete d.settings;
        j.data = A.normalize(d);
        A.modal(`<div class="stack"><h2>بازگردانی پشتیبان؟</h2><p>اطلاعات فعلی این حساب با فایل پشتیبان تاریخ ${esc(A.jalali(new Date(j.at)))} جایگزین می‌شه. این کار برگشت نداره.</p><div class="row"><button class="btn berry" id="p2ok">بله، بازگردانی کن</button><button class="btn ghost" id="p2no">انصراف</button></div></div>`, (el, close) => {
          $('#p2no', el).onclick = close;
          $('#p2ok', el).onclick = async () => { Object.keys(A.D()).forEach(k => delete A.D()[k]); Object.assign(A.D(), j.data); await A.save(); close(); A.toast('اطلاعاتت بازگردانی شد 🌱', null, 'happy'); A.go('today'); };
        });
      } catch (e) { A.toast('این فایل پشتیبان حبه نیست یا خراب شده.'); }
      im.value = '';
    };
  });

  /* ================= 6. badge gallery ================= */
  const nights = () => Object.values(A.D().sl?.nights || {}).length;
  const walks = () => Object.values(A.D().move || {}).filter(m => m.walk >= 20).length;
  const routines = () => Object.values(A.D().move || {}).filter(m => m.routine).length;
  const sugarDays = () => Object.keys(P().sugar).filter(k => (P().sugar[k] || []).length && sumDay(k) <= BUDGET).length;
  const BADGES = [
    ['🌱', 'جوانه', 'اولین روز برنامه رو کامل کردی', () => A.stats().total >= 1],
    ['🔥', 'سه روز پشت هم', '۳ روز پیاپی', () => A.stats().streak >= 3 || A.stats().total >= 3],
    ['⭐', 'یک هفته', '۷ روز کامل', () => A.stats().total >= 7],
    ['🌿', 'دو هفته', '۱۴ روز کامل', () => A.stats().total >= 14],
    ['🌸', 'دوره‌ی اول', 'اولین دوره‌ی ۲۱ روزه تموم شد', () => (A.D().completedCycles || []).length >= 1],
    ['🌳', 'سه دوره', 'هر سه دوره‌ی ۲۱ روزه', () => (A.D().completedCycles || []).length >= 3],
    ['🦸', 'هوس‌شکن', '۵ هوس رو با دکمه‌ی «هوس دارم» شکست دادی', () => A.stats().beaten >= 5],
    ['🏅', 'قهرمان هوس', '۲۰ هوسِ شکست‌خورده', () => A.stats().beaten >= 20],
    ['🍬', 'زیر بودجه', 'یک روز قند افزوده زیر ۲۵ گرم', () => sugarDays() >= 1],
    ['🍃', 'هفته‌ی کم‌قند', '۷ روز زیر بودجه‌ی قند', () => sugarDays() >= 7],
    ['🚶‍♀️', 'پیاده‌رو', '۵ پیاده‌روی ۲۰ دقیقه‌ای یا بیشتر', () => walks() >= 5],
    ['🧘', 'یوگی', '۱۰ جلسه‌ی یوگا یا پیلاتس', () => routines() >= 10],
    ['😴', 'خواب‌یار', '۷ شب چک‌لیست خواب', () => nights() >= 7],
    ['📔', 'خودشناس', 'دفترچه‌ی خواب ۷ صبح', () => Object.keys(A.D().sl?.diary || {}).length >= 7],
    ['❤️', 'آشپز بی‌قند', '۳ رسپی رو نشون کردی', () => (A.D().cp_fav || []).length >= 3],
    ['🩺', 'آگاه', 'آزمون خطر دیابت رو دادی', () => !!P().risk],
    ['📏', 'اندازه‌گیر', '۳ بار اندازه‌های بدنت رو ثبت کردی', () => P().body.length >= 3],
    ['💰', 'پس‌انداز', '۵۰۰ هزار تومان پس‌انداز از شیرینی', () => A.stats().toman >= 500000],
    ['🧊', 'صد حبه', '۱۰۰ حبه‌قند کمتر', () => A.stats().cubes >= 100],
    ['🌙', 'شب‌زنده‌دار سالم', '۱۰ چک‌لیست شب', () => Object.values(A.D().log || {}).filter(l => l.done).length >= 10],
  ];
  const earned = () => BADGES.map(b => { try { return b[3](); } catch (e) { return false; } });
  A.titles.badges = 'نشان‌ها'; A.appRoutes.push('badges');
  A.views.badges = () => {
    const e = earned(), n = e.filter(Boolean).length;
    return page('نشان‌ها', `${fa(n)} از ${fa(BADGES.length)} نشان`, 'هر نشان یک قدم واقعیه، نه یک عدد. نشان‌های خاکستری منتظرتن.',
      `<div class="progress"><i style="width:${n / BADGES.length * 100}%"></i></div><div class="p2-badges">${BADGES.map((b, i) => `<div class="card p2-badge ${e[i] ? 'on' : ''}"><span class="p2-bi">${b[0]}</span><b>${esc(b[1])}</b><span class="small muted">${esc(b[2])}</span></div>`).join('')}</div>`);
  };
  // Celebrate a newly earned badge once.
  add('mount', r => {
    if (guest() || !on('badges')) return;
    const e = earned(), seen = P().seen || [], fresh = BADGES.filter((b, i) => e[i] && !seen.includes(b[1]));
    if (!fresh.length) return;
    P().seen = BADGES.filter((b, i) => e[i]).map(b => b[1]); A.save();
    if (seen.length || fresh.length < 3) fresh.slice(0, 2).forEach(b => A.toast(`نشان تازه: ${b[0]} ${b[1]}! ${b[2]}`, null, 'wow'));
  });

  /* ================= 7. five-week calendar ================= */
  A.titles.calendar = 'تقویم من'; A.appRoutes.push('calendar');
  A.views.calendar = () => {
    const s = A.D(), byDate = {};
    Object.entries(s.log || {}).forEach(([k, l]) => { if (l.date) byDate[l.date] = { ...l, key: k }; });
    const start = new Date(); start.setDate(start.getDate() - 34);
    // Align so the grid starts on Saturday (the Iranian week).
    while (start.getDay() !== 6) start.setDate(start.getDate() - 1);
    const cells = []; const d = new Date(start);
    while (d <= new Date()) { cells.push(new Date(d)); d.setDate(d.getDate() + 1); }
    const dayNum = x => { try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' }).format(x); } catch (e) { return fa(x.getDate()); } };
    return page('تقویم من', 'پنج هفته‌ی اخیر در یک نگاه', 'سبز یعنی روز کامل، زرد یعنی لغزش کوچیک، صورتی یعنی روز سخت. نقطه‌ها: ورزش 🟢، خواب ✨ و قند زیر بودجه 🍬. روی هر روز بزن.',
      `<div class="card"><div class="p2-cal">${['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(w => `<span class="p2-cw">${w}</span>`).join('')}
        ${cells.map(x => { const k = A.dateKey(x), l = byDate[k], mv = l && s.move[l.key], sn = s.sl?.nights?.[k], sg = (P().sugar[k] || []).length;
          const cls = !l ? '' : l.slip === 'lot' ? 'bad' : l.slip === 'bit' ? 'mid' : l.done ? 'ok' : '';
          return `<button class="p2-cd ${cls} ${k === A.dateKey() ? 'today' : ''}" data-cd="${k}"><span>${dayNum(x)}</span><i>${mv && (mv.walk || mv.routine) ? '<em class="m"></em>' : ''}${sn ? '<em class="s"></em>' : ''}${sg && sumDay(k) <= BUDGET ? '<em class="g"></em>' : ''}</i></button>`; }).join('')}</div></div>
      <div id="cdd"></div>`);
  };
  A.mounts.calendar = () => $$('[data-cd]').forEach(b => b.onclick = () => {
    const k = b.dataset.cd, s = A.D(), l = Object.values(s.log).find(x => x.date === k), mv = l && s.move[Object.keys(s.log).find(x => s.log[x] === l)], dia = s.sl?.diary?.[k];
    const crav = ['بدون هوس', 'کم', 'متوسط', 'زیاد', 'خیلی زیاد'];
    $('#cdd').innerHTML = `<div class="card stack" style="gap:6px"><b>${esc(A.jalali(new Date(k + 'T12:00')))}</b>
      ${l ? `<span>${l.done ? '✓ چک‌لیست شب ثبت شد' : 'چک‌لیست ثبت نشده'}${l.craving != null ? `، شدت هوس: ${crav[l.craving] || ''}` : ''}${l.slip === 'lot' ? '، روز سخت' : l.slip === 'bit' ? '، لغزش کوچیک' : ''}</span>${l.reflect ? `<span class="small muted">«${esc(l.reflect)}»</span>` : ''}` : '<span class="muted">برای این روز چیزی ثبت نشده.</span>'}
      ${mv && (mv.walk || mv.routine) ? `<span>🚶‍♀️ ${fa(mv.walk || 0)} دقیقه پیاده‌روی${mv.routine ? '، جلسه‌ی یوگا/پیلاتس' : ''}</span>` : ''}
      ${(P().sugar[k] || []).length ? `<span>🍬 ${fa(Math.round(sumDay(k)))} گرم قند افزوده</span>` : ''}
      ${dia ? `<span>😴 خواب شبِ این روز ثبت شده</span>` : ''}</div>`;
    $$('[data-cd]').forEach(x => x.classList.toggle('sel', x === b));
  });

  /* ================= 8. body & lab tracker ================= */
  const FIELDS = [['weight', 'وزن', 'کیلوگرم'], ['waist', 'دور کمر', 'سانتی‌متر'], ['fbs', 'قند ناشتا', 'mg/dL'], ['a1c', 'HbA1c', '٪'], ['tg', 'تری‌گلیسرید', 'mg/dL']];
  const line = (pts, label, unit) => {
    if (pts.length < 2) return '';
    const W = 260, H = 110, xs = pts.map((_, i) => W - 22 - i * (W - 44) / (pts.length - 1)), vs = pts.map(p => p[1]), mn = Math.min(...vs), mx = Math.max(...vs), sp = mx - mn || 1;
    const ys = vs.map(v => H - 22 - (v - mn) / sp * (H - 44));
    return `<div class="card stack" style="gap:4px"><b>${label} <span class="small muted">(${unit})</span></b><svg viewBox="0 0 ${W} ${H}" class="p2-line"><polyline points="${xs.map((x, i) => `${x},${ys[i]}`).join(' ')}" fill="none" stroke="var(--mint)" stroke-width="3" stroke-linejoin="round"/>${xs.map((x, i) => `<circle cx="${x}" cy="${ys[i]}" r="4" fill="var(--mint)"/><text x="${x}" y="${ys[i] - 8}" text-anchor="middle" class="p2-lt">${fa(vs[i])}</text>`).join('')}</svg>
      <span class="small muted">${vs[vs.length - 1] < vs[0] ? `${fa(Math.round((vs[0] - vs[vs.length - 1]) * 10) / 10)} ${unit} کمتر از اولین ثبت 👏` : 'تغییرها آروم‌آروم میان؛ ادامه بده.'}</span></div>`;
  };
  A.titles.body2 = 'اندازه‌های بدن'; A.appRoutes.push('body2');
  A.views.body2 = () => {
    const b = P().body.slice().sort((x, y) => x.date.localeCompare(y.date));
    return page('اندازه‌های بدن و آزمایش‌ها', 'تغییرهایی که آینه نشون نمی‌ده', 'هر دو هفته یک بار کافیه. وزن روزانه بالا و پایین می‌ره؛ دور کمر و آزمایش‌ها نشونه‌ی بهتری از سلامت متابولیکن. هر کدوم رو داری وارد کن.',
      `<form id="bdf" class="card stack" style="gap:12px"><div class="p2-bfields">${FIELDS.map(([k, t, u]) => `<div class="field"><label for="bd-${k}">${t} <span class="small muted">(${u})</span></label><input class="input" id="bd-${k}" inputmode="decimal"></div>`).join('')}</div><button class="btn primary" type="submit">ثبت</button></form>
      <div class="p2-lines">${FIELDS.map(([k, t, u]) => line(b.filter(x => x[k] != null).map(x => [x.date, x[k]]), t, u)).join('')}</div>
      ${b.length ? `<div class="card" style="overflow-x:auto"><table class="sl-plan"><tr><th>تاریخ</th>${FIELDS.map(f => `<th>${f[1]}</th>`).join('')}<th></th></tr>${b.slice().reverse().map(x => `<tr><td>${esc(A.jalali(new Date(x.date + 'T12:00')))}</td>${FIELDS.map(([k]) => `<td class="num">${x[k] != null ? fa(x[k]) : '–'}</td>`).join('')}<td><button class="p2-del" data-del="${esc(x.date)}" aria-label="حذف">✕</button></td></tr>`).join('')}</table></div>` : ''}
      <div class="card stack" style="gap:4px;background:var(--lav-soft);border-color:transparent"><b>🔬 محدوده‌های مرجع (بزرگسالان، انجمن دیابت آمریکا)</b><span class="small">قند ناشتا: کمتر از ۱۰۰ طبیعی، ۱۰۰ تا ۱۲۵ پیش‌دیابت، ۱۲۶ و بالاتر نیاز به بررسی پزشک</span><span class="small">HbA1c: کمتر از ۵٫۷ طبیعی، ۵٫۷ تا ۶٫۴ پیش‌دیابت، ۶٫۵ و بالاتر نیاز به بررسی پزشک</span><span class="small">تری‌گلیسرید ناشتا: کمتر از ۱۵۰ مطلوب</span><span class="small muted">تفسیر آزمایش با پزشکه؛ این عددها فقط برای آشنایی‌ان.</span></div>`);
  };
  A.mounts.body2 = () => {
    $('#bdf').onsubmit = e => {
      e.preventDefault();
      const row = { date: A.dateKey() }; let any = false;
      FIELDS.forEach(([k]) => { const v = num($('#bd-' + k).value); if (v != null) { row[k] = v; any = true; } });
      if (!any) { A.toast('دست‌کم یک عدد وارد کن.'); return; }
      const b = P().body, i = b.findIndex(x => x.date === row.date); if (i >= 0) b[i] = { ...b[i], ...row }; else b.push(row);
      A.save(); A.toast('ثبت شد 📏', null, 'happy'); A.render();
    };
    $$('[data-del]').forEach(x => x.onclick = () => { P().body = P().body.filter(r => r.date !== x.dataset.del); A.save(); A.render(); });
  };

  /* ================= 9. printable report for a doctor or nutritionist ================= */
  A.titles.report = 'گزارش برای پزشک'; A.appRoutes.push('report');
  A.views.report = () => {
    const s = A.D(), st = A.stats(), p = s.profile || {};
    const logs = Object.values(s.log || {}).filter(l => l.date).sort((a, b) => a.date.localeCompare(b.date));
    const wk = []; for (let i = 0; i < logs.length; i += 7) { const ch = logs.slice(i, i + 7).filter(l => l.craving != null); if (ch.length) wk.push(ch.reduce((a, l) => a + l.craving, 0) / ch.length); }
    const sug = Object.keys(P().sugar).filter(k => (P().sugar[k] || []).length), sugAvg = sug.length ? sug.reduce((a, k) => a + sumDay(k), 0) / sug.length : null;
    const dia = Object.values(s.sl?.diary || {}), slp = dia.length ? dia.reduce((a, e) => { let m = (Number(e.wake.slice(0, 2)) * 60 + Number(e.wake.slice(3))) - (Number(e.bed.slice(0, 2)) * 60 + Number(e.bed.slice(3))); if (m <= 0) m += 1440; return a + m - (e.latency || 0) - (e.awake || 0); }, 0) / dia.length / 60 : null;
    const b = P().body.slice().sort((x, y) => x.date.localeCompare(y.date)), first = b[0], last = b[b.length - 1];
    const walksN = Object.values(s.move || {}).reduce((a, m) => a + (m.walk || 0), 0);
    const goals = { weight: 'کاهش وزن', skin: 'پوست و مو', pcos: 'PCOS / تعادل هورمونی', insulin: 'مقاومت به انسولین', energy: 'انرژی و خلق', teeth: 'دندان', control: 'کنترل رفتار خوردن' };
    const row = (k, v) => v == null || v === '' ? '' : `<tr><th>${k}</th><td>${v}</td></tr>`;
    return `<section class="wrap stack p2-report" style="gap:16px;max-width:820px">
      <div class="row no-print" style="justify-content:space-between"><a class="small sl-back" href="#more">→ ابزارها</a><button class="btn primary" id="prt">🖨 چاپ یا ذخیره به PDF</button></div>
      <div class="card stack" style="gap:12px"><div class="row" style="justify-content:space-between"><h2>گزارش پیشرفت حبه</h2><span class="small muted">${esc(A.jalali())}</span></div>
        <p class="small muted">این گزارش از اطلاعاتی ساخته شده که ${esc(A.user.name)} خودش در حبه (برنامه‌ی کاهش قند افزوده) ثبت کرده. عددها خوداظهاری‌ان و تخمینی.</p>
        <table class="p2-rt-table">
          ${row('شروع برنامه', (p.signedAt || s.startedAt) ? esc(A.jalali(new Date((p.signedAt || s.startedAt) + 'T12:00'))) : null)}
          ${row('هدف‌ها', esc((p.goal || []).map(g => goals[g] || g).join('، ')))}
          ${row('دوره و روز فعلی', `دوره‌ی ${fa(s.cycle)}، روز ${fa(s.day)} از ۲۱ (${fa((s.completedCycles || []).length)} دوره‌ی کامل)`)}
          ${row('روزهای کامل / پیاپی', `${fa(st.total)} روز / ${fa(st.streak)} روز`)}
          ${row('هوس‌هایی که مهار شد', fa(st.beaten))}
          ${row('میانگین شدت هوس در هفته‌ها (۰ تا ۴)', wk.length ? wk.map(v => dec(v)).join(' ← ') : null)}
          ${row('میانگین قند افزوده‌ی روزانه', sugAvg != null ? `${fa(Math.round(sugAvg))} گرم (${fa(sug.length)} روز ثبت)` : null)}
          ${row('مجموع پیاده‌روی ثبت‌شده', walksN ? `${fa(walksN)} دقیقه` : null)}
          ${row('میانگین خواب', slp != null ? `${dec(slp)} ساعت (${fa(dia.length)} شب ثبت)` : null)}
          ${row('آزمون خطر دیابت (FINDRISC)', P().risk ? `${fa(P().risk.score)} امتیاز، خطر ${esc(P().risk.level)} (BMI ${dec(P().risk.bmi)})` : null)}
          ${first ? FIELDS.map(([k, t, u]) => { const f = b.find(x => x[k] != null), l = b.slice().reverse().find(x => x[k] != null); return f ? row(t, f === l ? `${fa(f[k])} ${u}` : `${fa(f[k])} ← ${fa(l[k])} ${u}`) : ''; }).join('') : ''}
        </table>
        ${p.why ? `<p><b>دلیل شخصی:</b> ${esc(p.why)}</p>` : ''}
        <p class="small muted">حبه ابزار تغییر عادته و جای تشخیص و درمان پزشکی رو نمی‌گیره.</p></div></section>`;
  };
  A.mounts.report = () => { $('#prt').onclick = () => window.print(); };

  /* ================= 10. readability: text size, reduced motion, read aloud ================= */
  const a11y = () => ls.get('uzhu:a11y', {});
  const applyA11y = () => { const a = a11y(), h = document.documentElement; h.style.fontSize = a.size ? a.size + '%' : ''; h.classList.toggle('p2-calm', !!a.calm); };
  applyA11y();
  add('settings', () => on('a11y') ? `<div class="card stack" style="gap:10px"><b>🔠 خوانایی</b>
    <div class="row"><span class="small">اندازه‌ی متن:</span>${[[0, 'معمولی'], [112, 'بزرگ'], [125, 'خیلی بزرگ']].map(([v, t]) => `<button type="button" class="chip ${Number(a11y().size || 0) === v ? 'mint' : ''}" data-fs="${v}">${t}</button>`).join('')}</div>
    <label class="check" for="p2calm"><input type="checkbox" id="p2calm" ${a11y().calm ? 'checked' : ''}><span>حرکت و انیمیشن کمتر</span></label></div>` : '');
  add('mount', r => {
    if (r !== 'settings') return;
    $$('[data-fs]').forEach(b => b.onclick = () => { ls.set('uzhu:a11y', { ...a11y(), size: Number(b.dataset.fs) }); applyA11y(); $$('[data-fs]').forEach(x => x.classList.toggle('mint', x === b)); });
    const c = $('#p2calm'); if (c) c.onchange = () => { ls.set('uzhu:a11y', { ...a11y(), calm: c.checked }); applyA11y(); };
  });
  // Read aloud, only when the device has a Persian voice.
  let faVoice = null;
  const findVoice = () => { try { faVoice = (speechSynthesis.getVoices() || []).find(v => /^fa/i.test(v.lang)) || null; } catch (e) { faVoice = null; } };
  if ('speechSynthesis' in window) { findVoice(); speechSynthesis.onvoiceschanged = findVoice; }
  add('readingEnd', () => on('a11y') && faVoice ? `<button class="btn ghost p2-say" id="p2say" type="button">🔊 برام بخون</button>` : '');
  add('mount', r => {
    const b = $('#p2say'); if (!b) return;
    b.onclick = () => {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); b.textContent = '🔊 برام بخون'; return; }
      const art = b.closest('.reading'), txt = [...art.querySelectorAll('h2, p')].map(x => x.textContent).join('. ');
      const u = new SpeechSynthesisUtterance(txt); u.voice = faVoice; u.lang = faVoice.lang; u.rate = .95;
      u.onend = () => { b.textContent = '🔊 برام بخون'; };
      speechSynthesis.speak(u); b.textContent = '⏹ توقف';
    };
  });
  add('mount', r => { if (r !== 'today' && 'speechSynthesis' in window && speechSynthesis.speaking) speechSynthesis.cancel(); });

  /* ================= tools hub ================= */
  tool('sugar', '🍬', 'دفترچه‌ی قند', 'قند افزوده‌ی امروز در برابر بودجه‌ی ۲۵ گرمی', 'sugardiary');
  tool('calendar', '📅', 'تقویم من', 'پنج هفته‌ی اخیر: روزهای کامل، ورزش، خواب و قند', 'calendar');
  tool('badges', '🏅', 'نشان‌ها', '۲۰ نشان برای قدم‌های واقعی', 'badges');
  tool('body2', '📏', 'اندازه‌ها و آزمایش‌ها', 'وزن، دور کمر، قند ناشتا، HbA1c', 'bodytrack');
  tool('risk', '🩺', 'آزمون خطر دیابت', 'FINDRISC؛ ۲ دقیقه، معتبر و رایگان', 'risk');
  tool('report', '🖨', 'گزارش برای پزشک', 'خلاصه‌ی پیشرفتت، آماده‌ی چاپ', 'report');
  (A.searchExtra = A.searchExtra || []).push(() => [
    on('risk') && { icon: '🩺', title: 'آزمون خطر دیابت نوع ۲', sub: 'ابزار', text: 'دیابت خطر آزمون قند خون پیش دیابت FINDRISC', open: () => A.go('risk') },
    on('sugardiary') && { icon: '🍬', title: 'دفترچه‌ی قند', sub: 'ابزار', text: 'قند افزوده گرم حبه بودجه روزانه نوشابه شکلات', open: () => A.go('sugar') },
  ].filter(Boolean));
  add('boot', () => { const f = $('.cp-foot'); if (f && on('risk') && !$('a[href="#risk"]', f)) f.insertAdjacentHTML('beforeend', '<a href="#risk">آزمون خطر دیابت</a>'); });
});
