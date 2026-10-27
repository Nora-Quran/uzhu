/* Uzhu pregnancy & postpartum plugin («بارداری و پس از زایمان», route #pregnancy, admin feature key 'pregnancy').
   Opt-in: nothing shows on Today until the user sets it up from the tools hub, search or Settings.
   Pregnancy mode: week counter from LMP / due date / ultrasound age, week-by-week notes, prenatal checklist,
   IOM weight-gain chart, kick counter, contraction timer, glucose log with ACOG/ADA targets, ACOG exercise guidance,
   Kegel trainer, nutrition, articles with sources and red flags. Postpartum mode: stage notes, postnatal checklist,
   mood log with depression warning, exercise, nutrition and the same red-flag sheet.
   Content and sources live in js/pregnancy-data.js (window.UZHU_PREG).
   State: A.D().preg = { on, asked, mode:'preg'|'post', lmp, edd, cyc, twins, gdm, htn, pre:{h,w}, wt:{key:kg},
     kick:[{s,e,n}], kickNow:{s,n}, ctr:[{s,e}], ctrNow, glu:{key:{f,b,l,d}}, gluT:{f,a,b}, gluMode:'1'|'2',
     birth, btype:'vag'|'cs', bf, mood:{key:1-5}, done:{id:true}, supp:{key:true}, rem:{on,time}, kegel:{key:n} } */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const G = window.UZHU_PREG; if (!G) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const signed = () => !!(A.user && A.D() && A.D().profile);
  const raw = () => (signed() && A.D().preg) || null;
  const enabled = () => on('pregnancy') && !!raw()?.on;
  const P = () => {
    const d = A.D(), p = d.preg = d.preg && typeof d.preg === 'object' ? d.preg : {};
    ['wt', 'glu', 'mood', 'done', 'supp', 'kegel'].forEach(k => { if (!p[k] || typeof p[k] !== 'object') p[k] = {}; });
    ['kick', 'ctr'].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; });
    p.gluT = Object.assign({ f: 95, a: 140, b: 120 }, p.gluT || {});
    if (!p.pre || typeof p.pre !== 'object') p.pre = {};
    return p;
  };
  const num = (x, d = 1) => fa(String(Math.round(x * 10 ** d) / 10 ** d)).replace('.', '٫');

  /* ---------- dates (Gregorian keys, Jalali display) ---------- */
  const key = d => A.dateKey(d);
  const parse = k => new Date(k + 'T12:00');
  const addD = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
  const diff = (a, b) => A.dayDiff(a, b); // b - a, in days
  const today = () => key(new Date());
  const fmt = o => { try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', o); } catch (e) { return null; } };
  const F_DM = fmt({ day: 'numeric', month: 'long' }), F_DMY = fmt({ day: 'numeric', month: 'long', year: 'numeric' }), F_WD = fmt({ weekday: 'long' });
  let F_NUM = null; try { F_NUM = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }); } catch (e) {}
  const jdm = k => F_DM ? F_DM.format(parse(k)) : fa(k);
  const jdmy = k => F_DMY ? F_DMY.format(parse(k)) : fa(k);
  const jwd = k => F_WD ? `${F_WD.format(parse(k))} ${jdm(k)}` : fa(k.slice(5));
  const jparts = d => { const o = {}; if (F_NUM) F_NUM.formatToParts(d).forEach(x => { o[x.type] = x.value; }); return { y: parseInt(o.year, 10) || d.getFullYear(), m: parseInt(o.month, 10) || d.getMonth() + 1, d: parseInt(o.day, 10) || d.getDate() }; };
  // Jalali → Gregorian key: estimate from Nowruz, then nudge until Intl agrees (handles Mar 20/21 and leap years).
  function j2g(jy, jm, jd) {
    if (!F_NUM) return null;
    const d = new Date(jy + 621, 2, 21, 12); d.setDate(d.getDate() + (jm <= 6 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) + jd - 1);
    for (let i = 0; i < 6; i++) {
      const p = jparts(d), c = (p.y - jy) * 400 + (p.m - jm) * 32 + (p.d - jd);
      if (!c) return key(d);
      d.setDate(d.getDate() + (c > 0 ? -1 : 1));
    }
    return null;
  }
  const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  function dateSel(id, k) {
    const j = jparts(parse(k || today())), y0 = jparts(new Date()).y;
    return `<span class="pg-dsel" id="${id}"><select class="input" data-p="d" aria-label="روز">${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}"${i + 1 === j.d ? ' selected' : ''}>${fa(i + 1)}</option>`).join('')}</select><select class="input" data-p="m" aria-label="ماه">${MONTHS.map((m, i) => `<option value="${i + 1}"${i + 1 === j.m ? ' selected' : ''}>${m}</option>`).join('')}</select><select class="input" data-p="y" aria-label="سال">${[y0 - 1, y0, y0 + 1].map(y => `<option value="${y}"${y === j.y ? ' selected' : ''}>${fa(y)}</option>`).join('')}</select></span>`;
  }
  const readSel = id => { const el = $('#' + id); if (!el) return null; const v = p => Number($(`[data-p="${p}"]`, el).value); return j2g(v('y'), v('m'), v('d')); };

  /* ---------- pregnancy math ---------- */
  const eddOf = p => p.edd || (p.lmp ? addD(p.lmp, 280 + ((p.cyc || 28) - 28)) : null);
  function ga(p, t = today()) {
    const e = eddOf(p); if (!e) return null;
    const days = 280 - diff(t, e);
    return { days, w: Math.floor(days / 7), d: ((days % 7) + 7) % 7, edd: e, left: diff(t, e), tri: days < 98 ? 1 : days < 196 ? 2 : 3 };
  }
  const gaAt = (p, k) => { const e = eddOf(p); return e ? (280 - diff(k, e)) / 7 : null; };
  const weekRow = w => G.WEEKS.find(r => w >= r.from && w <= r.to) || (w < 1 ? G.WEEKS[0] : G.WEEKS[G.WEEKS.length - 1]);
  const postDay = p => p.birth ? diff(p.birth, today()) : null;
  const stage = pd => G.POST.find(s => pd >= s.from && pd <= s.to) || G.POST[G.POST.length - 1];
  const TRI = ['', 'سه‌ماهه‌ی اول', 'سه‌ماهه‌ی دوم', 'سه‌ماهه‌ی سوم'];

  /* weight band (IOM 2009): 0.5–2 kg by week 13, then the weekly rate range */
  const bmiOf = p => p.pre.h && p.pre.w ? p.pre.w / ((p.pre.h / 100) ** 2) : null;
  const catOf = b => b == null ? -1 : G.WT.findIndex(c => b < c.max);
  const band = (c, w) => w <= 13 ? [0.5 * w / 13, 2 * w / 13] : [0.5 + c.rate[0] * (w - 13), 2 + c.rate[1] * (w - 13)];

  /* ---------- shared bits ---------- */
  const refList = ks => `<details class="pg-refs"><summary class="small">📚 منابع</summary><ol class="refs">${ks.map(k => G.REFS[k]).filter(Boolean).map(([t, u]) => `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t)}</li>`).join('')}</ol></details>`;
  const ul = (a, cls = '') => `<ul class="${cls}">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const help = () => `<div class="pg-help">${G.HELP.map(([n, t, h]) => `<a class="btn ${n === '۱۱۵' ? 'berry' : 'ghost'} pg-sm" href="${h}">📞 ${n}<span class="small">${esc(t)}</span></a>`).join('')}</div>`;
  function redHtml(mode) {
    const R = mode === 'post' ? G.RED_POST : G.RED_PREG;
    return `<div class="stack" style="gap:10px"><div class="pg-red-now"><b>🚨 فوری: با ۱۱۵ تماس بگیر یا به نزدیک‌ترین بیمارستان برو</b>${ul(R.now)}</div>
      <div class="pg-red-day"><b>📞 همون روز با پزشک یا ماما تماس بگیر</b>${ul(R.day)}</div>${help()}
      <p class="small muted">اگه مطمئن نیستی جدیه یا نه، تماس بگیر. پزشک‌ها ترجیح می‌دن صد بار بی‌دلیل ببیننت تا یه بار دیر برسی.</p></div>`;
  }
  function openRed(mode) {
    A.modal(`<div class="stack pg-art"><span class="eyebrow">${mode === 'post' ? 'بعد از زایمان' : 'بارداری'}</span><h2>🚩 علائم خطر</h2>${redHtml(mode)}${refList(mode === 'post' ? ['hearHer', 'whoPnc', 'acog736', 'nimh'] : ['hearHer', 'whoAnc', 'nhsMove', 'nvp'])}</div>`);
  }
  function nutHtml(m) {
    const N = G.NUT[m];
    return `<p>${esc(N.cal)}</p><h3>مکمل‌ها</h3><div class="pg-supp">${N.supp.map(([t, d]) => `<div class="pg-sitem"><b>${esc(t)}</b><span class="small">${esc(d)}</span></div>`).join('')}</div>
      <div class="pg-nut-g"><div class="pg-eat"><b class="small">✓ بیشتر بخور</b>${ul(N.eat)}</div><div class="pg-less"><b class="small">✗ نخور یا کم کن</b>${ul(N.avoid)}</div></div>`;
  }
  function openArt(id) {
    const a = G.ARTS.find(x => x.id === id); if (!a) return;
    const body = a.nut ? nutHtml(a.nut) : a.html, refs = a.nut ? G.NUT[a.nut].refs : a.refs;
    A.modal(`<div class="stack article-body pg-art"><span class="eyebrow">بارداری و پس از زایمان</span><h2>${a.icon} ${esc(a.title)}</h2>${body}
      <h3>منابع</h3><ol class="refs">${refs.map(k => G.REFS[k]).filter(Boolean).map(([t, u]) => `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>` : esc(t)}</li>`).join('')}</ol>
      <p class="small muted">${esc(G.DISC)}</p></div>`);
  }

  /* ---------- art ---------- */
  function ring(frac, big, small, size = 190) {
    const r = 78, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
    return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" class="pg-ring" role="img" aria-label="${esc(big + ' ' + small)}">
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--pg-track)" stroke-width="16"/>
      <circle cx="100" cy="100" r="${r}" fill="none" stroke="url(#pgGr)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(f * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 100 100)"/>
      <defs><linearGradient id="pgGr" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f3a6b8"/><stop offset="1" stop-color="#a99be6"/></linearGradient></defs>
      <circle cx="100" cy="100" r="60" fill="var(--pg-soft)"/>
      <path d="M100 118 q-3 -18 0 -30" stroke="#5fa86a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="91" cy="92" rx="9" ry="5" fill="#8fcf8f" transform="rotate(-30 91 92)"/><ellipse cx="109" cy="88" rx="9" ry="5" fill="#8fcf8f" transform="rotate(30 109 88)"/>
      <text x="100" y="78" text-anchor="middle" class="pg-rt1">${esc(big)}</text><text x="100" y="140" text-anchor="middle" class="pg-rt2">${esc(small)}</text></svg>`;
  }

  /* ---------- page state ---------- */
  let tab = 'home', setupMode = null, setupBy = 'lmp', showAllAnc = false, kegel = null, tick = null;
  const stopTick = () => { if (tick) clearInterval(tick); tick = null; };
  const rerender = () => { const y = scrollY; A.render(); scrollTo(0, y); };
  const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${fa(Math.floor(s / 60))}:${fa(String(s % 60).padStart(2, '0'))}`; };

  /* ---------- setup ---------- */
  function setupView(p) {
    const m = setupMode;
    return `<section class="wrap auth stack pg" style="gap:16px;max-width:680px">
      <div class="card stack" style="gap:14px"><span class="eyebrow">بارداری و پس از زایمان</span><h2>کجای این مسیری؟ 🤍</h2>
        <p class="muted">حبه کنارته: هفته‌شمار، مراقبت‌ها، وزن، حرکت‌های بچه، قند خون، ورزش ایمن و حال روحی. همه با منبع معتبر.</p>
        <div class="pg-modes"><button type="button" class="pg-mode${m === 'preg' ? ' on' : ''}" data-setmode="preg" aria-pressed="${m === 'preg'}"><span aria-hidden="true">🤰</span><b>باردارم</b></button><button type="button" class="pg-mode${m === 'post' ? ' on' : ''}" data-setmode="post" aria-pressed="${m === 'post'}"><span aria-hidden="true">👶</span><b>تازه زایمان کردم</b></button></div>
        ${m === 'preg' ? `<div class="stack" style="gap:10px"><b>سن بارداری رو از روی چی حساب کنیم؟</b>
          <div class="filters" role="group">${[['lmp', 'اولین روز آخرین پریود'], ['edd', 'تاریخ زایمانی که پزشک گفته'], ['ga', 'سن بارداری توی سونوگرافی']].map(([k, t]) => `<button type="button" data-by="${k}" class="${setupBy === k ? 'on' : ''}" aria-pressed="${setupBy === k}">${t}</button>`).join('')}</div>
          ${setupBy === 'lmp' ? `<label class="small">اولین روز آخرین پریود</label>${dateSel('pgD', p.lmp || addD(today(), -60))}<label class="small" for="pgCyc">طول معمول چرخه‌ات (روز)</label><input class="input" id="pgCyc" type="number" inputmode="numeric" min="21" max="45" value="${p.cyc || 28}" style="width:110px">`
          : setupBy === 'edd' ? `<label class="small">تاریخ تقریبی زایمان</label>${dateSel('pgD', p.edd || addD(today(), 200))}`
          : `<div class="row"><label class="small" for="pgGw">هفته<br><input class="input" id="pgGw" type="number" inputmode="numeric" min="1" max="42" value="12" style="width:90px"></label><label class="small" for="pgGd">روز<br><input class="input" id="pgGd" type="number" inputmode="numeric" min="0" max="6" value="0" style="width:90px"></label><label class="small">تاریخ سونوگرافی<br>${dateSel('pgD', today())}</label></div>`}
          <p class="small muted">اگه سونوگرافی سه‌ماهه‌ی اول داشتی، تاریخی که پزشک از روی اون گفته دقیق‌تره.</p>
          <label class="check" for="pgTw"><input type="checkbox" id="pgTw" ${p.twins ? 'checked' : ''}><span>دوقلو یا چندقلو</span></label></div>` : ''}
        ${m === 'post' ? `<div class="stack" style="gap:10px"><label class="small">تاریخ زایمان</label>${dateSel('pgD', p.birth || today())}
          <div class="row"><label class="small" for="pgBt">نوع زایمان<br><select class="input" id="pgBt"><option value="vag">طبیعی</option><option value="cs"${p.btype === 'cs' ? ' selected' : ''}>سزارین</option></select></label>
          <label class="small" for="pgBf">تغذیه‌ی نوزاد<br><select class="input" id="pgBf"><option value="bf">شیر مادر</option><option value="mix"${p.bf === 'mix' ? ' selected' : ''}>شیر مادر و شیر خشک</option><option value="ff"${p.bf === 'ff' ? ' selected' : ''}>شیر خشک</option></select></label></div></div>` : ''}
        ${m ? `<label class="check" for="pgGdm"><input type="checkbox" id="pgGdm" ${p.gdm ? 'checked' : ''}><span>دیابت بارداری دارم یا داشتم</span></label>
          <label class="check" for="pgHtn"><input type="checkbox" id="pgHtn" ${p.htn ? 'checked' : ''}><span>فشار خون بالا یا پره‌اکلامپسی دارم یا داشتم</span></label>
          <p class="small pg-err" id="pgErr" role="alert" hidden></p>
          <div class="row"><button class="btn primary" type="button" id="pgSave">شروع کن</button>${p.mode ? '<button class="btn ghost" type="button" id="pgCancel">انصراف</button>' : ''}</div>` : ''}
      </div>
      <p class="small muted pg-disc">${esc(G.DISC)} اطلاعاتت فقط توی حساب خودته.</p></section>`;
  }
  function setupSave() {
    const p = P(), err = t => { const e = $('#pgErr'); e.textContent = t; e.hidden = false; };
    const k = readSel('pgD'); if (!k) return err('تاریخ معتبر نیست.');
    if (setupMode === 'preg') {
      let lmp = null, edd = null, cyc = 28;
      if (setupBy === 'lmp') { cyc = Math.round(Number($('#pgCyc').value)); if (!(cyc >= 21 && cyc <= 45)) return err('طول چرخه باید بین ۲۱ تا ۴۵ روز باشه.'); lmp = k; }
      else if (setupBy === 'edd') edd = k;
      else { const w = Math.round(Number($('#pgGw').value)), d = Math.round(Number($('#pgGd').value)); if (!(w >= 1 && w <= 42 && d >= 0 && d <= 6)) return err('هفته بین ۱ تا ۴۲ و روز بین ۰ تا ۶.'); edd = addD(k, 280 - (w * 7 + d)); }
      const g = ga({ lmp, edd, cyc });
      if (g.days < 0) return err('این تاریخ هنوز نرسیده؛ دوباره نگاه کن.');
      if (g.days > 44 * 7) return err('با این تاریخ بیشتر از ۴۴ هفته می‌شه. اگه زایمان کردی، «تازه زایمان کردم» رو انتخاب کن.');
      Object.assign(p, { mode: 'preg', lmp, edd, cyc, twins: $('#pgTw').checked });
    } else {
      if (k > today()) return err('تاریخ زایمان نمی‌تونه در آینده باشه.');
      Object.assign(p, { mode: 'post', birth: k, btype: $('#pgBt').value, bf: $('#pgBf').value });
    }
    p.gdm = $('#pgGdm').checked; p.htn = $('#pgHtn').checked; p.on = true; p.asked = true;
    setupMode = null; tab = 'home'; A.save(); A.render(); scrollTo(0, 0);
    A.toast(p.mode === 'preg' ? 'هفته‌شمار بارداری آماده‌ست 🤰 هر هفته یه سر بزن.' : 'بخش بعد از زایمان آماده‌ست 🤍 به خودت هم برس.', null, 'happy');
  }

  /* ---------- pregnancy: tabs ---------- */
  function pregHero(p, g) {
    const frac = g.days / 280, over = g.left < 0;
    return `<div class="card pg-hero"><div class="pg-ringw">${ring(frac, `${fa(g.w)} هفته`, `و ${fa(g.d)} روز`)}</div>
      <div class="stack" style="gap:10px;min-width:0"><span class="eyebrow">بارداری</span><h2>هفته‌ی ${fa(g.w + 1)} بارداری</h2>
        <div class="row" style="gap:8px"><span class="chip pg-chip">${TRI[g.tri]}</span>${p.twins ? '<span class="chip">دوقلو</span>' : ''}${p.gdm ? '<span class="chip sun">دیابت بارداری</span>' : ''}</div>
        <p class="pg-line">تاریخ تقریبی زایمان: <b>${esc(jdmy(g.edd))}</b>${over ? `؛ ${fa(-g.left)} روز ازش گذشته.` : `؛ ${fa(g.left)} روز دیگه.`}</p>
        <p class="small muted">${fa(g.w)} هفته و ${fa(g.d)} روز تموم شده، یعنی الان توی هفته‌ی ${fa(g.w + 1)} هستی. تاریخ زایمان یه تخمینه و زایمان بین هفته‌ی ۳۷ تا ۴۲ طبیعیه.</p>
        <div class="row"><button class="btn berry" type="button" id="pgBorn">👶 بچه به دنیا اومد</button><button class="btn ghost pg-sm" type="button" data-edit="1">✎ ویرایش تاریخ‌ها</button></div></div></div>`;
  }
  function ancHtml(p, g) {
    const w = g.w, list = G.ANC.filter(a => showAllAnc || (a.from <= w + 4 && a.to >= w - 2) || (a.to < w && !p.done[a.id]));
    return `<div class="card stack" style="gap:8px"><div class="row" style="justify-content:space-between"><b>🗓 مراقبت‌های بارداری</b><button type="button" class="btn ghost pg-sm" id="pgAncAll">${showAllAnc ? 'فقط نزدیک‌ها' : 'همه'}</button></div>
      ${list.length ? list.map(a => `<label class="check pg-anc${a.to < w && !p.done[a.id] ? ' late' : ''}" for="anc-${a.id}"><input type="checkbox" id="anc-${a.id}" data-done="${a.id}" ${p.done[a.id] ? 'checked' : ''}><span><b>${esc(a.t)}</b> <span class="chip">هفته‌ی ${fa(a.from)}${a.to !== a.from ? ` تا ${fa(a.to)}` : ''}</span><br><span class="small muted">${esc(a.d)}</span></span></label>`).join('') : '<p class="small muted">فعلاً مراقبت خاصی توی این چند هفته نیست. ملاقات‌های معمولت رو برو.</p>'}
      <p class="small muted">برنامه‌ی دقیق رو پزشک، ماما یا مرکز بهداشتت تعیین می‌کنه.</p>${refList(['whoAnc', 'niceAnc', 'iranSupp', 'acogGdm'])}</div>`;
  }
  function suppHtml(p, label) {
    const t = today(), dots = Array.from({ length: 7 }, (_, i) => addD(t, i - 6)).map(k => `<i class="${p.supp[k] ? 'on' : ''}" title="${esc(jwd(k))}"></i>`).join('');
    return `<div class="card stack pg-suppc" style="gap:8px"><b>💊 ${esc(label)}</b>
      <div class="row" style="justify-content:space-between"><button type="button" class="btn ${p.supp[t] ? 'primary' : 'ghost'} pg-sm" data-supp="1" aria-pressed="${!!p.supp[t]}">${p.supp[t] ? '✓ امروز خوردم' : 'امروز خوردم'}</button><span class="pg-dots" aria-label="۷ روز اخیر">${dots}</span></div>
      <details><summary class="small">یادآور روزانه</summary><div class="row" style="margin-top:8px"><label class="check" for="pgRem"><input type="checkbox" id="pgRem" ${p.rem?.on ? 'checked' : ''}><span>یادم بنداز ساعت</span></label><input class="input" type="time" id="pgRemT" value="${esc(p.rem?.time || '10:00')}" style="width:120px"></div></details></div>`;
  }
  function weekCard(r, open = true) {
    return `<div class="card stack pg-week" style="gap:8px"><span class="eyebrow">هفته‌ی ${fa(r.from)} تا ${fa(r.to)}</span><h3>${esc(r.title)}</h3>
      <p><b>👶 بچه:</b> ${esc(r.baby)}</p><p><b>🤰 تو:</b> ${esc(r.mom)}</p>
      <div><b>✅ کارهای این هفته‌ها</b>${ul(r.todo)}</div>${open ? refList(r.refs) : ''}</div>`;
  }
  function weightTab(p, g) {
    const b = bmiOf(p), ci = catOf(b), c = G.WT[ci], t = today();
    const pre = `<details class="card stack" ${b ? '' : 'open'} style="gap:8px"><summary><b>قد و وزن قبل از بارداری</b>${b ? ` <span class="small muted">(شاخص توده‌ی بدنی ${num(b)}، ${esc(c.name)})</span>` : ''}</summary>
      <div class="row" style="margin-top:8px"><label class="small" for="pgH">قد (سانتی‌متر)<br><input class="input" id="pgH" type="number" inputmode="decimal" min="120" max="220" value="${p.pre.h || ''}" style="width:120px"></label><label class="small" for="pgW0">وزن قبل از بارداری (کیلو)<br><input class="input" id="pgW0" type="number" inputmode="decimal" min="30" max="250" step="0.1" value="${p.pre.w || ''}" style="width:120px"></label><button class="btn ghost pg-sm" type="button" id="pgPreSave">ذخیره</button></div></details>`;
    if (!b) return pre + `<p class="small muted">برای دیدن محدوده‌ی توصیه‌شده، اول قد و وزن قبل از بارداری‌ات رو وارد کن.</p>${refList(['iom', 'acogWt'])}`;
    const tw = p.twins ? G.WT_TWIN[ci] : null, range = p.twins ? tw : c.total;
    const ents = Object.entries(p.wt).sort((a, b2) => a[0] < b2[0] ? -1 : 1), last = ents[ents.length - 1];
    let status = '';
    if (last && !p.twins) {
      const wk = gaAt(p, last[0]), gain = last[1] - p.pre.w, [lo, hi] = band(c, Math.max(0, wk));
      status = gain < lo - 0.5 ? `<p class="pg-note">آخرین وزنت (${num(gain)} کیلو نسبت به قبل از بارداری) کمتر از محدوده‌ی تقریبی این هفته‌هاست. نگران نشو؛ تهوع یا اشتهای کم دلیل رایجشه. با پزشکت درباره‌ی رشد بچه و تغذیه‌ات حرف بزن.</p>`
        : gain > hi + 0.5 ? `<p class="pg-note">آخرین وزنت (${num(gain)} کیلو نسبت به قبل از بارداری) بیشتر از محدوده‌ی تقریبی این هفته‌هاست. توی بارداری رژیم نگیر؛ نوشیدنی‌های شیرین و شیرینی رو کم کن، پیاده‌روی کن و با پزشکت مشورت کن. افزایش ناگهانی وزن همراه با ورم صورت و دست‌ها رو فوراً گزارش کن.</p>`
        : `<p class="pg-ok">آخرین وزنت (${num(gain)} کیلو نسبت به قبل از بارداری) توی محدوده‌ی تقریبی این هفته‌هاست. 🌱</p>`;
    }
    // chart
    const W = 340, H = 200, x0 = 34, y0 = 12, pw = W - x0 - 10, ph = H - y0 - 28;
    const gains = ents.map(([k, v]) => [gaAt(p, k), v - p.pre.w]).filter(([w]) => w != null && w >= 0 && w <= 43);
    const ymax = Math.ceil(Math.max(p.twins ? (tw ? tw[1] : 20) : band(c, 42)[1], ...gains.map(x => x[1]), 4) + 1), ymin = Math.floor(Math.min(-1, ...gains.map(x => x[1])));
    const X = w => x0 + w / 42 * pw, Y = v => y0 + (ymax - v) / (ymax - ymin) * ph;
    const poly = p.twins ? '' : (() => { const ws = Array.from({ length: 43 }, (_, i) => i); return `<polygon class="pg-band" points="${ws.map(w => `${X(w).toFixed(1)},${Y(band(c, w)[1]).toFixed(1)}`).concat(ws.reverse().map(w => `${X(w).toFixed(1)},${Y(band(c, w)[0]).toFixed(1)}`)).join(' ')}"/>`; })();
    const ticksY = []; for (let v = Math.ceil(ymin / 5) * 5; v <= ymax; v += 5) ticksY.push(v);
    const svg = `<svg viewBox="0 0 ${W} ${H}" class="pg-chart" role="img" aria-label="نمودار افزایش وزن نسبت به هفته‌ی بارداری">
      ${ticksY.map(v => `<line x1="${x0}" x2="${W - 10}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="pg-grid"/><text x="${x0 - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="pg-ax">${fa(v)}</text>`).join('')}
      ${[0, 10, 20, 30, 40].map(w => `<text x="${X(w).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="pg-ax">${fa(w)}</text>`).join('')}
      ${poly}${g ? `<line x1="${X(Math.min(42, Math.max(0, g.days / 7))).toFixed(1)}" x2="${X(Math.min(42, Math.max(0, g.days / 7))).toFixed(1)}" y1="${y0}" y2="${y0 + ph}" class="pg-now"/>` : ''}
      ${gains.length > 1 ? `<polyline class="pg-line2" points="${gains.map(([w, v]) => `${X(w).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}"/>` : ''}
      ${gains.map(([w, v]) => `<circle cx="${X(w).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="4" class="pg-pt"/>`).join('')}</svg>`;
    return `${pre}
      <div class="card stack" style="gap:10px"><b>⚖️ افزایش وزن توصیه‌شده</b>
        <p>${p.twins ? (tw ? `برای بارداری دوقلو با شاخص توده‌ی بدنی «${esc(c.name)}»، محدوده‌ی موقت IOM <b>${num(tw[0])} تا ${num(tw[1])} کیلو</b> در کل بارداریه.` : 'برای بارداری دوقلو در گروه کم‌وزن، IOM محدوده‌ی مشخصی تعیین نکرده؛ هدفت رو پزشکت مشخص می‌کنه.')
          : `با شاخص توده‌ی بدنی قبل از بارداری <b>${num(b)}</b> (${esc(c.name)})، محدوده‌ی توصیه‌شده‌ی IOM برای کل بارداری <b>${num(c.total[0])} تا ${num(c.total[1])} کیلو</b>ه: حدود ۰٫۵ تا ۲ کیلو تا آخر سه‌ماهه‌ی اول و بعد هفته‌ای حدود ${num(c.rate[0], 2)} تا ${num(c.rate[1], 2)} کیلو.`}</p>
        ${status}
        ${svg}<p class="small muted">${p.twins ? '' : 'نوار رنگی محدوده‌ی تقریبی توصیه‌شده‌ست، '}محور افقی هفته‌ی بارداری و محور عمودی کیلوی اضافه‌شده نسبت به قبل از بارداری.</p>
        <div class="row"><label class="small" for="pgWv">وزن امروز (کیلو)<br><input class="input" id="pgWv" type="number" inputmode="decimal" min="30" max="250" step="0.1" style="width:120px"></label><button class="btn primary pg-sm" type="button" id="pgWAdd">ثبت</button></div>
        <p class="small muted">هفته‌ای یه بار، صبح، با لباس سبک و ترازوی ثابت کافیه.</p>
        ${ents.length ? `<details><summary class="small">وزن‌های ثبت‌شده (${fa(ents.length)})</summary><ul class="pg-wlist">${ents.slice().reverse().slice(0, 30).map(([k, v]) => `<li><span>${esc(jdm(k))}</span><b>${num(v)} کیلو</b><button type="button" class="pg-x" data-wdel="${k}" aria-label="حذف وزن ${esc(jdm(k))}">✕</button></li>`).join('')}</ul></details>` : ''}
        <p class="small">هدف بارداری کاهش وزن نیست. اگه اضافه‌وزن داری، با پزشکت درباره‌ی هدف مناسب خودت حرف بزن.</p>
        ${refList(['iom', 'acogWt'])}</div>`;
  }
  function kickHtml(p, g) {
    const k = p.kickNow, last = p.kick.slice(-6).reverse();
    const early = g && g.w < 24;
    return `<div class="card stack pg-kick" style="gap:10px"><b>👣 شمارش حرکت‌های بچه</b>
      <p class="small">مهم‌ترین چیز شناختن <b>الگوی بچه‌ی خودته</b>. اگه پزشکت شمارش رو خواسته: وقتی بچه معمولاً فعاله، به پهلو دراز بکش یا بشین و هر حرکت (لگد، چرخش، تکون) رو بزن. معمولاً زمانی که طول می‌کشه ۱۰ حرکت حس کنی ثبت می‌شه.</p>
      ${early ? '<p class="small muted">این ابزار بیشتر برای اواخر بارداری (معمولاً از هفته‌ی ۲۸) کاربرد داره.</p>' : ''}
      ${k ? `<div class="pg-kbig"><button type="button" class="pg-kbtn" id="pgKick" aria-label="یه حرکت حس کردم"><span class="pg-kn">${fa(k.n)}</span><span class="small">از ۱۰، بزن برای هر حرکت</span></button><div class="stack" style="gap:6px;align-items:center"><span class="pg-timer" id="pgKT">${mmss(Date.now() - k.s)}</span><button type="button" class="btn ghost pg-sm" id="pgKEnd">تموم</button></div></div>
        ${Date.now() - k.s > 2 * 3600e3 ? '<p class="pg-warn"><b>۲ ساعت گذشته و کمتر از ۱۰ حرکت حس کردی.</b> همین حالا با بیمارستان یا ماما تماس بگیر.</p>' : ''}`
        : `<button type="button" class="btn primary" id="pgKStart">شروع شمارش</button>`}
      ${last.length ? `<details><summary class="small">شمارش‌های قبلی</summary><ul class="pg-wlist">${last.map(x => `<li><span>${esc(jwd(key(new Date(x.s))))}</span><b>${fa(x.n)} حرکت در ${mmss(x.e - x.s)}</b></li>`).join('')}</ul></details>` : ''}
      <p class="pg-warn small">اگه حرکت‌ها کمتر شده، فرق کرده یا قطع شده، منتظر تموم شدن شمارش نمون؛ همین حالا تماس بگیر.</p>${refList(['nhsMove', 'acogTests'])}</div>`;
  }
  function ctrHtml(p, g) {
    const now = Date.now(), list = p.ctr.filter(c => now - c.s < 3 * 3600e3), cur = p.ctrNow;
    const done = list.filter(c => c.e), hr = done.filter(c => now - c.s < 3600e3);
    const durs = hr.map(c => (c.e - c.s) / 1000), gaps = hr.slice(1).map((c, i) => (c.s - hr[i].s) / 60000);
    const avg = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
    const pre37 = g && g.w < 37 && g.w >= 20;
    let msg = '';
    if (pre37 && hr.length >= 3) msg = '<p class="pg-warn"><b>قبل از هفته‌ی ۳۷ هستی و انقباض‌هات منظم شده.</b> همین حالا به بیمارستان برو یا با ۱۱۵ تماس بگیر.</p>';
    else if (hr.length >= 6 && avg(gaps) <= 5.5 && avg(durs) >= 45) msg = '<p class="pg-note"><b>انقباض‌هات حدود هر ۵ دقیقه یه بار و نزدیک به یه دقیقه‌ان.</b> اگه یه ساعته این‌طوریه یا ماما و پزشکت گفتن، وقت رفتن به بیمارستانه.</p>';
    return `<div class="card stack" style="gap:10px"><b>⏱ زمان‌سنج انقباض</b>
      <p class="small">شروع هر انقباض «شروع» و آخرش «تموم» رو بزن. فاصله از شروع یه انقباض تا شروع بعدی حساب می‌شه.</p>
      <div class="row" style="align-items:center"><button type="button" class="btn ${cur ? 'berry' : 'primary'}" id="pgCtr">${cur ? '■ تموم شد' : '▶ انقباض شروع شد'}</button>${cur ? `<span class="pg-timer" id="pgCT">${mmss(now - cur)}</span>` : ''}${list.length ? '<button type="button" class="btn ghost pg-sm" id="pgCtrClr">پاک کردن</button>' : ''}</div>
      ${hr.length ? `<div class="row small" style="gap:8px"><span class="chip">یک ساعت اخیر: ${fa(hr.length)} انقباض</span><span class="chip">میانگین طول: ${fa(Math.round(avg(durs)))} ثانیه</span>${gaps.length ? `<span class="chip">میانگین فاصله: ${num(avg(gaps))} دقیقه</span>` : ''}</div>` : ''}
      ${msg}
      ${done.length ? `<ul class="pg-wlist">${done.slice(-8).reverse().map((c, i, a) => `<li><span>${esc(new Date(c.s).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}</span><b>${fa(Math.round((c.e - c.s) / 1000))} ثانیه</b><span class="small muted">${a[i + 1] ? `فاصله ${num((c.s - a[i + 1].s) / 60000)} دقیقه` : ''}</span></li>`).join('')}</ul>` : ''}
      <button type="button" class="btn ghost pg-sm" data-art="move">نشونه‌های زایمان و کی برم بیمارستان؟</button>${refList(['labor', 'term'])}</div>`;
  }
  function gluTab(p) {
    const T = p.gluT, m2 = p.gluMode === '2', after = m2 ? T.b : T.a, t = today();
    const days = Array.from({ length: 7 }, (_, i) => addD(t, -i));
    const cls = (slot, v) => v == null || v === '' ? '' : v < 70 ? 'lo' : v < (slot === 'f' ? T.f : after) ? 'ok' : 'hi';
    const SL = [['f', 'ناشتا'], ['b', 'بعد صبحانه'], ['l', 'بعد ناهار'], ['d', 'بعد شام']];
    const vals = days.flatMap(k => SL.map(([s]) => [s, p.glu[k]?.[s]]).filter(([, v]) => v != null));
    const inR = vals.filter(([s, v]) => cls(s, v) === 'ok').length, low = vals.some(([s, v]) => v < 70);
    const highBySlot = SL.map(([s, n]) => [n, days.filter(k => cls(s, p.glu[k]?.[s]) === 'hi').length]).filter(([, c]) => c >= 2);
    const intro = `<div class="card stack" style="gap:8px"><b>🩸 قند خون در بارداری</b>
      <p>بین هفته‌ی ۲۴ تا ۲۸ همه‌ی باردارها آزمایش قند می‌دن. اگه دیابت بارداری تشخیص داده شد، معمولاً روزی ۴ بار قند گرفته می‌شه: ناشتا و بعد از هر وعده‌ی اصلی.</p>
      <div class="row"><button class="btn ghost pg-sm" type="button" data-art="gdm">🩸 همه چیز درباره‌ی دیابت بارداری</button><button class="btn ghost pg-sm" type="button" data-art="sugar">🍬 قند و شیرینی در بارداری</button></div></div>`;
    if (!p.gdm) return intro + `<div class="card stack" style="gap:8px"><p>اگه دیابت بارداری داری یا پزشکت گفته قندت رو ثبت کنی، دفترچه‌ی قند رو روشن کن.</p><div class="row"><button class="btn primary" type="button" id="pgGdmOn">دفترچه‌ی قند رو روشن کن</button></div></div>`;
    return intro + `<div class="card stack" style="gap:10px"><b>📒 دفترچه‌ی قند</b>
      <div class="row"><label class="small" for="pgGd">روز<br><select class="input" id="pgGd">${days.map((k, i) => `<option value="${k}">${i === 0 ? 'امروز' : i === 1 ? 'دیروز' : esc(jwd(k))}</option>`).join('')}</select></label>
        <label class="small" for="pgGs">زمان<br><select class="input" id="pgGs">${SL.map(([s, n]) => `<option value="${s}">${n}</option>`).join('')}</select></label>
        <label class="small" for="pgGv">قند (mg/dL)<br><input class="input" id="pgGv" type="number" inputmode="numeric" min="20" max="600" style="width:110px"></label><button class="btn primary pg-sm" type="button" id="pgGAdd">ثبت</button></div>
      <div class="pg-tblw"><table class="pg-tbl pg-gtbl"><tr><th>روز</th>${SL.map(([, n]) => `<th>${n}</th>`).join('')}</tr>${days.map((k, i) => `<tr><td>${i === 0 ? 'امروز' : esc(jwd(k))}</td>${SL.map(([s]) => { const v = p.glu[k]?.[s]; return `<td class="${cls(s, v)}">${v != null ? `${fa(v)}<button type="button" class="pg-x" data-gdel="${k}|${s}" aria-label="حذف">✕</button>` : '<span class="muted">-</span>'}</td>`; }).join('')}</tr>`).join('')}</table></div>
      <div class="row small" style="gap:8px"><span class="chip mint">در محدوده</span><span class="chip sun">بالاتر از هدف</span><span class="chip berry">کمتر از ۷۰</span>${vals.length ? `<span class="chip">۷ روز اخیر: ${fa(inR)} از ${fa(vals.length)} در محدوده</span>` : ''}</div>
      ${low ? '<p class="pg-warn"><b>قند زیر ۷۰ ثبت شده.</b> اگه انسولین یا قرص قند می‌خوری: ۱۵ گرم قند سریع (نصف لیوان آب‌میوه یا ۳ تا ۴ حبه قند)، ۱۵ دقیقه بعد دوباره قند بگیر و به پزشکت خبر بده.</p>' : ''}
      ${highBySlot.length ? `<p class="pg-note">توی هفته‌ی اخیر چند بار قند ${highBySlot.map(([n]) => n).join('، ')} بالاتر از هدف بوده. این دفترچه رو به پزشک یا متخصص تغذیه‌ات نشون بده؛ ممکنه برنامه‌ات نیاز به تنظیم داشته باشه.</p>` : ''}
      ${vals.some(([, v]) => v >= 200) ? '<p class="pg-warn">قند ۲۰۰ یا بیشتر ثبت شده؛ همون روز با پزشکت تماس بگیر.</p>' : ''}
      <details><summary class="small">هدف‌ها: ناشتا کمتر از ${fa(T.f)}، ${m2 ? '۲ ساعت' : '۱ ساعت'} بعد از غذا کمتر از ${fa(after)} (تغییر)</summary>
        <div class="stack" style="gap:8px;margin-top:8px"><div class="filters" role="group"><button type="button" data-gm="1" class="${m2 ? '' : 'on'}" aria-pressed="${!m2}">۱ ساعت بعد غذا</button><button type="button" data-gm="2" class="${m2 ? 'on' : ''}" aria-pressed="${m2}">۲ ساعت بعد غذا</button></div>
        <div class="row"><label class="small" for="pgTf">ناشتا<br><input class="input" id="pgTf" type="number" min="60" max="140" value="${T.f}" style="width:90px"></label><label class="small" for="pgTa">۱ ساعت بعد<br><input class="input" id="pgTa" type="number" min="90" max="200" value="${T.a}" style="width:90px"></label><label class="small" for="pgTb">۲ ساعت بعد<br><input class="input" id="pgTb" type="number" min="90" max="200" value="${T.b}" style="width:90px"></label><button class="btn ghost pg-sm" type="button" id="pgTSave">ذخیره</button></div>
        <p class="small muted">پیش‌فرض‌ها هدف‌های ACOG و انجمن دیابت آمریکان (ناشتا کمتر از ۹۵، یک ساعت بعد کمتر از ۱۴۰، دو ساعت بعد کمتر از ۱۲۰). اگه پزشکت عدد دیگه‌ای گفته، اون رو بذار.</p></div></details>
      ${refList(['acogGdm', 'adaPreg', 'adaHypo'])}</div>`;
  }
  function postGlu(p, pd) {
    if (!p.gdm) return `<div class="card stack" style="gap:8px"><b>🩸 قند خون بعد از زایمان</b><p>اگه توی بارداری دیابت بارداری داشتی، اینجا یادآور آزمایش بعد از زایمان رو برات نگه می‌داریم.</p><div class="row"><button class="btn ghost" type="button" id="pgGdmOn">دیابت بارداری داشتم</button><button class="btn ghost pg-sm" type="button" data-art="weight-post">⚖️ وزن بعد از زایمان و هوس شیرینی</button></div></div>`;
    const w = Math.floor(pd / 7), st = w < 4 ? `${fa(4 - w)} هفته‌ی دیگه وقتشه` : w <= 12 ? 'الان وقتشه' : 'اگه هنوز ندادی، هر چه زودتر بده';
    return `<div class="card stack" style="gap:10px"><b>🩸 بعد از دیابت بارداری</b>
      <label class="check pg-anc" for="pgOg"><input type="checkbox" id="pgOg" data-done="pg" ${p.done.pg ? 'checked' : ''}><span><b>آزمایش قند ۷۵ گرمی بین هفته‌ی ۴ تا ۱۲ بعد از زایمان</b> <span class="chip">${p.done.pg ? 'انجام شد ✓' : st}</span><br><span class="small muted">برای اینکه مطمئن بشیم قندت برگشته. بعد از اون هر ۱ تا ۳ سال یه بار آزمایش قند.</span></span></label>
      <p>یه متاآنالیز بزرگ نشون داد مادرهایی که دیابت بارداری داشتن حدود ۱۰ برابر بیشتر در خطر دیابت نوع ۲ هستن. شیر دادن، فعالیت بدنی منظم و کم کردن قند افزوده این خطر رو پایین میارن؛ برنامه‌ی ۲۱ روزه‌ی حبه دقیقاً برای همینه.</p>
      <div class="row"><a class="btn primary pg-sm" href="#today">برنامه‌ی ترک قند حبه</a><button class="btn ghost pg-sm" type="button" data-art="gdm">🩸 درباره‌ی دیابت بارداری</button></div>${refList(['adaPreg', 'acogGdm', 'vounz', 'cdcGdm'])}</div>`;
  }
  function kegelHtml(p) {
    const t = today(), n = p.kegel[t] || 0, k = kegel;
    return `<div class="card stack pg-keg" style="gap:10px"><b>🌸 تمرین کف لگن (کگل)</b>
      <p class="small">عضله‌هایی رو منقبض کن که برای نگه داشتن ادرار و باد شکم استفاده می‌کنی، انگار داری بالا می‌کشیشون. نفست رو حبس نکن و باسن و ران رو سفت نکن. هر بار ۱۰ انقباض آهسته (هر کدوم تا ۱۰ ثانیه نگه دار) و ۱۰ انقباض سریع؛ دست‌کم ۳ بار در روز. معمولاً ۳ تا ۵ ماه طول می‌کشه تا اثرش رو حس کنی.</p>
      ${k ? `<div class="pg-kg ${k.ph}" aria-live="polite"><span class="pg-kgt">${k.ph === 'sq' ? 'منقبض کن و نگه دار' : k.ph === 'rest' ? 'شل کن و استراحت' : k.ph === 'fast' ? 'سریع منقبض کن و ول کن' : 'آفرین! یه ست تموم شد'}</span><span class="pg-kgn">${k.ph === 'done' ? '✓' : fa(k.left)}</span><span class="small">${k.ph === 'fast' ? `${fa(k.rep)} از ۱۰ سریع` : k.ph === 'done' ? '' : `انقباض آهسته ${fa(k.rep)} از ۱۰`}</span></div>
        <button type="button" class="btn ghost pg-sm" id="pgKgStop">${k.ph === 'done' ? 'بستن' : 'توقف'}</button>`
        : `<div class="row"><label class="small" for="pgKgH">نگه داشتن (ثانیه)<br><select class="input" id="pgKgH">${[3, 5, 8, 10].map(s => `<option value="${s}"${s === (p.kgHold || 5) ? ' selected' : ''}>${fa(s)}</option>`).join('')}</select></label><button type="button" class="btn primary" id="pgKgGo">▶ شروع یه ست</button></div>`}
      <p class="small muted">امروز: ${fa(n)} ست از ۳</p>${refList(['pelvic', 'acog804'])}</div>`;
  }
  function exTab(p) {
    const E = G.EX, post = p.mode === 'post';
    const postCard = `<div class="card stack" style="gap:8px"><b>🤱 ورزش بعد از زایمان</b>${ul(E.post)}${p.btype === 'cs' ? '<p class="pg-note small">زایمانت سزارین بوده؛ زمان شروع ورزش‌های شکمی و سنگین رو با پزشکت هماهنگ کن.</p>' : ''}${refList(['acog804', 'acogExPostFaq', 'whoPA'])}</div>`;
    return `${post ? postCard : ''}
      <div class="card stack" style="gap:8px"><b>🏃‍♀️ ورزش در بارداری (راهنمای ACOG)</b><p>${esc(E.goal)}</p>
        <div class="pg-nut-g"><div class="pg-eat"><b class="small">✓ معمولاً ایمن</b>${ul(E.safe)}</div><div class="pg-less"><b class="small">✗ انجام نده</b>${ul(E.avoid)}</div></div>
        <div class="pg-red-now"><b>⛔ اگه این‌ها پیش اومد، ورزش رو قطع کن و با پزشک تماس بگیر</b>${ul(E.stop)}</div>
        <details><summary><b>کی ورزش نکنیم؟</b></summary><p class="small">اگه یکی از این‌ها رو داری، ورزش هوازی فقط با اجازه‌ی پزشک:</p>${ul(E.contra)}<p class="small">این‌ها هم یعنی باید قبلش با پزشکت مشورت کنی و برنامه‌ات شخصی بشه:</p>${ul(E.relative)}</details>
        <b class="small">نکته‌ها</b>${ul(E.tips)}
        <p class="small muted">برنامه‌ی ورزش روزانه‌ی حبه برای بارداری طراحی نشده؛ حرکت‌هاش رو با این راهنما تطبیق بده و حرکت‌های خوابیده به پشت، پرشی یا شکمی سنگین رو انجام نده.</p>
        ${refList(['acog804', 'acogExFaq', 'whoPA'])}</div>
      ${kegelHtml(p)}${post ? '' : postCard}`;
  }
  const artCards = mode => `<div class="pg-arts">${G.ARTS.filter(a => a.for === 'both' || a.for === mode).map(a => `<button type="button" class="card pg-artc" data-art="${a.id}"><span class="pg-ai" aria-hidden="true">${a.icon}</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(a.title)}</b><span class="small muted">${esc(a.sum)}</span></span></button>`).join('')}</div>`;
  const foodTab = m => `<div class="card stack pg-food" style="gap:10px"><b>🥗 ${m === 'post' ? 'تغذیه بعد از زایمان و شیردهی' : 'تغذیه در بارداری'}</b>${nutHtml(m)}${refList(G.NUT[m].refs)}</div>
    <div class="row">${m === 'post' ? '<button type="button" class="btn ghost pg-sm" data-art="baby-sugar">🍯 نوزاد و قند</button><button type="button" class="btn ghost pg-sm" data-art="weight-post">⚖️ وزن و هوس شیرینی</button>' : '<button type="button" class="btn ghost pg-sm" data-art="sugar">🍬 قند و شیرینی در بارداری</button>'}<a class="btn ghost pg-sm" href="#recipes">🍽 رسپی‌های بی‌قند حبه</a></div>`;

  /* ---------- postpartum ---------- */
  const MOODS = [[5, '😊', 'خوبم'], [4, '🙂', 'بد نیستم'], [3, '😐', 'معمولی'], [2, '😔', 'غمگین یا بی‌حوصله'], [1, '😰', 'خیلی مضطرب یا ناامید']];
  function moodHtml(p, pd, full) {
    const t = today(), v = p.mood[t], d14 = Array.from({ length: 14 }, (_, i) => addD(t, i - 13));
    const lows = d14.filter(k => p.mood[k] && p.mood[k] <= 2).length, logged = d14.filter(k => p.mood[k]).length;
    const warn = pd >= 14 && logged >= 5 && lows / logged >= 0.5;
    return `<div class="card stack pg-mood" style="gap:10px"><b>💜 امروز حالت چطوره؟</b>
      <div class="pg-chips" role="group" aria-label="حال امروز">${MOODS.map(([n, e, l]) => `<button type="button" class="pd-chip${v === n ? ' on' : ''}" data-mood="${n}" aria-pressed="${v === n}"><span aria-hidden="true">${e}</span> ${l}</button>`).join('')}</div>
      ${full ? `<div class="pg-strip" aria-label="۱۴ روز اخیر">${d14.map(k => `<span title="${esc(jwd(k))}">${p.mood[k] ? MOODS.find(m => m[0] === p.mood[k])[1] : '·'}</span>`).join('')}</div>` : ''}
      ${warn ? '<p class="pg-warn"><b>توی دو هفته‌ی اخیر بیشتر روزها حالت خوب نبوده.</b> این دیگه فقط خستگی یا بی‌بی‌بلوز نیست. لطفاً با پزشک یا ماما حرف بزن؛ افسردگی پس از زایمان شایعه و درمان داره.</p>'
        : v && v <= 2 ? `<p class="pg-note small">${pd < 14 ? 'روزهای اول بعد از زایمان، گریه و غم گذرا خیلی شایعه. استراحت کن و از اطرافیانت کمک بخواه. اگه بیشتر از ۲ هفته طول کشید، با پزشک حرف بزن.' : 'مرسی که ثبتش کردی. اگه این حال بیشتر روزها هست، با پزشک حرف بزن.'}</p>` : ''}
      <button type="button" class="btn berry pg-sm" id="pgCrisis">فکر آسیب زدن به خودم یا بچه دارم</button></div>`;
  }
  function postTodo(p, pd) {
    const list = G.POST_TODO.filter(x => !x.only || p[x.only]).filter(x => x.from <= pd + 7 && (x.to >= pd - 14 || !p.done[x.id]));
    return `<div class="card stack" style="gap:8px"><b>🗓 مراقبت‌های بعد از زایمان</b>
      ${list.map(x => `<label class="check pg-anc${x.to < pd && !p.done[x.id] ? ' late' : ''}" for="pt-${x.id}"><input type="checkbox" id="pt-${x.id}" data-done="${x.id}" ${p.done[x.id] ? 'checked' : ''}><span>${esc(x.t)}</span></label>`).join('') || '<p class="small muted">مراقبت خاصی در این روزها نمونده.</p>'}
      <p class="small muted">زمان‌ها از راهنمای سازمان جهانی بهداشت و ACOG؛ برنامه‌ی دقیق رو مرکز بهداشت یا پزشکت تعیین می‌کنه.</p>${refList(['whoPnc', 'acog736', 'iranSupp', 'adaPreg'])}</div>`;
  }
  function postHero(p, pd) {
    const s = stage(pd), w = Math.floor(pd / 7);
    return `<div class="card pg-hero"><div class="pg-ringw">${ring(Math.min(1, pd / 84), pd < 14 ? `روز ${fa(pd + 1)}` : `هفته‌ی ${fa(w + 1)}`, 'بعد از زایمان')}</div>
      <div class="stack" style="gap:10px;min-width:0"><span class="eyebrow">بعد از زایمان</span><h2>${esc(s.title)}</h2>
        <div class="row" style="gap:8px"><span class="chip pg-chip">${p.btype === 'cs' ? 'سزارین' : 'زایمان طبیعی'}</span><span class="chip">${p.bf === 'ff' ? 'شیر خشک' : p.bf === 'mix' ? 'شیر مادر و شیر خشک' : 'شیر مادر'}</span>${p.gdm ? '<span class="chip sun">دیابت بارداری داشتم</span>' : ''}</div>
        <p class="pg-line">${fa(pd)} روز از زایمانت (${esc(jdmy(p.birth))}) گذشته.</p>
        <div class="row"><button class="btn ghost pg-sm" type="button" data-edit="1">✎ ویرایش</button></div></div></div>`;
  }

  /* ---------- the page ---------- */
  A.titles.pregnancy = 'بارداری و پس از زایمان'; A.appRoutes.push('pregnancy');
  A.views.pregnancy = () => {
    if (!on('pregnancy')) return `<section class="wrap"><div class="card">این بخش فعلاً در دسترس نیست. <a href="#today">برگشت</a></div></section>`;
    const p = P();
    if (!p.on && !setupMode) return `<section class="wrap auth stack pg" style="gap:16px;max-width:620px"><div class="card stack" style="gap:12px;text-align:center"><div style="margin:0 auto">${ring(0.6, '🤍', 'حبه کنارته', 130)}</div><h2>بارداری و پس از زایمان</h2>
      <p class="muted">هفته‌شمار بارداری، مراقبت‌ها، وزن، حرکت‌های بچه، زمان‌سنج انقباض، دفترچه‌ی قند، ورزش ایمن طبق ACOG و مراقبت‌های بعد از زایمان؛ همه با منبع معتبر.</p>
      <div class="row" style="justify-content:center"><button class="btn primary" type="button" data-setmode="preg">🤰 باردارم</button><button class="btn ghost" type="button" data-setmode="post">👶 تازه زایمان کردم</button></div>
      <button type="button" class="btn ghost pg-sm" data-red="preg" style="align-self:center">🚩 علائم خطر بارداری و بعد از زایمان</button></div>
      <p class="small muted pg-disc">${esc(G.DISC)}</p></section>`;
    if (setupMode || !p.mode) { if (!setupMode) setupMode = 'preg'; return setupView(p); }
    const mode = p.mode, g = mode === 'preg' ? ga(p) : null, pd = mode === 'post' ? postDay(p) : null;
    const TABS = mode === 'preg'
      ? [['home', '🏠 خلاصه'], ['weeks', '📅 هفته‌به‌هفته'], ['weight', '⚖️ وزن'], ['move', '👣 حرکات و انقباض'], ['sugar', '🩸 قند'], ['ex', '🏃‍♀️ ورزش'], ['food', '🥗 تغذیه'], ['learn', '📚 مقاله‌ها']]
      : [['home', '🏠 خلاصه'], ['mood', '💜 حال من'], ['ex', '🏃‍♀️ ورزش و کف لگن'], ['food', '🥗 تغذیه و شیردهی'], ['sugar', '🩸 قند'], ['learn', '📚 مقاله‌ها']];
    if (!TABS.some(t => t[0] === tab)) tab = 'home';
    let body = '';
    if (mode === 'preg') {
      if (g.days > 44 * 7) body = `<div class="card pg-note stack" style="gap:8px"><b>به نظر می‌رسه زمان زایمان گذشته.</b><p>اگه بچه به دنیا اومده، بخش بعد از زایمان رو فعال کن. اگه تاریخ‌ها اشتباهه، ویرایششون کن.</p><div class="row"><button class="btn primary" type="button" id="pgBorn2">👶 بچه به دنیا اومد</button><button class="btn ghost" type="button" data-edit="1">ویرایش تاریخ</button></div></div>`;
      else if (tab === 'home') body = `${weekCard(weekRow(g.w + 1))}${ancHtml(p, g)}${suppHtml(p, g.w + 1 >= 16 ? 'مکمل‌های امروز (اسید فولیک، آهن و بقیه طبق دستور)' : 'اسید فولیک امروز')}
        ${g.w >= 23 ? `<div class="card row pg-quick" style="justify-content:space-between"><span><b>👣 حرکت‌های بچه</b><br><span class="small muted">الگوی حرکت‌ها رو بشناس؛ هر کاهشی رو فوراً گزارش کن.</span></span><button class="btn ghost pg-sm" type="button" data-tab="move">باز کن</button></div>` : ''}
        <div class="card stack pg-red" style="gap:8px"><b>🚩 علائم خطر بارداری</b>${redHtml('preg')}${refList(['hearHer', 'whoAnc', 'nhsMove'])}</div>`;
      else if (tab === 'weeks') body = G.WEEKS.map(r => { const cur = g.w + 1 >= r.from && g.w + 1 <= r.to; return `<details class="pg-wk"${cur ? ' open' : ''}><summary><b>هفته‌ی ${fa(r.from)} تا ${fa(r.to)}: ${esc(r.title)}</b>${cur ? ' <span class="chip pg-chip">الان</span>' : ''}</summary>${weekCard(r)}</details>`; }).join('');
      else if (tab === 'weight') body = weightTab(p, g);
      else if (tab === 'move') body = kickHtml(p, g) + ctrHtml(p, g);
      else if (tab === 'sugar') body = gluTab(p);
      else if (tab === 'ex') body = exTab(p);
      else if (tab === 'food') body = foodTab('preg');
      else body = artCards('preg');
    } else {
      const s = stage(pd);
      if (tab === 'home') body = `<div class="card stack pg-week" style="gap:8px"><span class="eyebrow">${esc(s.title)}</span>${ul(s.items)}${refList(['whoPnc', 'nicePnc', 'acog736', 'contra'])}</div>
        ${moodHtml(p, pd, false)}${postTodo(p, pd)}${pd <= 90 ? suppHtml(p, 'مکمل‌های امروز (آهن و بقیه طبق دستور)') : ''}
        <div class="card stack pg-red" style="gap:8px"><b>🚩 علائم خطر بعد از زایمان</b>${redHtml('post')}${refList(['hearHer', 'whoPnc', 'acog736', 'nimh'])}</div>`;
      else if (tab === 'mood') body = moodHtml(p, pd, true) + `<div class="card stack" style="gap:8px"><b>کمک گرفتن</b><p>اگه غم، اضطراب یا بی‌علاقگی بیشتر از ۲ هفته طول کشیده، یا هر وقت حس کردی از پسش برنمیای، با پزشک یا ماما حرف بزن. برای مشاوره‌ی تلفنی هم می‌تونی با این شماره‌ها تماس بگیری:</p>${help()}<button type="button" class="btn ghost pg-sm" data-art="mind">💜 بی‌بی‌بلوز، افسردگی و اضطراب پس از زایمان</button>${refList(['mh', 'nimh', 'ppdFaq'])}</div>`;
      else if (tab === 'ex') body = exTab(p);
      else if (tab === 'food') body = foodTab('post');
      else if (tab === 'sugar') body = postGlu(p, pd);
      else body = artCards('post');
    }
    return `<section class="wrap stack pg" style="gap:16px;max-width:1000px">
      ${mode === 'preg' ? pregHero(p, g) : postHero(p, pd)}
      <div class="pg-redbar"><button type="button" class="btn berry pg-sm" data-red="${mode}">🚩 علائم خطر: کی فوری برم؟</button><a class="btn ghost pg-sm" href="tel:115">📞 اورژانس ۱۱۵</a></div>
      <div class="filters pg-tabs" role="tablist" aria-label="بخش‌ها">${TABS.map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" class="${k === tab ? 'on' : ''}" aria-selected="${k === tab}">${t}</button>`).join('')}</div>
      <div class="stack" style="gap:16px">${body}</div>
      <p class="small muted pg-disc">${esc(G.DISC)} اطلاعاتت فقط توی حساب خودته؛ از <a href="#settings">تنظیمات</a> می‌تونی این بخش رو خاموش یا اطلاعاتش رو پاک کنی.</p>
    </section>`;
  };

  function birthModal() {
    const p = P();
    A.modal(`<div class="stack" style="gap:12px"><h2>👶 مبارکه!</h2><p>تاریخ زایمان رو وارد کن تا بخش بعد از زایمان برات فعال بشه. اطلاعات بارداری‌ات سر جاش می‌مونه.</p>
      <label class="small">تاریخ زایمان</label>${dateSel('pgBD', today())}
      <div class="row"><label class="small" for="pgBt2">نوع زایمان<br><select class="input" id="pgBt2"><option value="vag">طبیعی</option><option value="cs">سزارین</option></select></label><label class="small" for="pgBf2">تغذیه‌ی نوزاد<br><select class="input" id="pgBf2"><option value="bf">شیر مادر</option><option value="mix">شیر مادر و شیر خشک</option><option value="ff">شیر خشک</option></select></label></div>
      <p class="small pg-err" id="pgBErr" role="alert" hidden></p><button class="btn primary" type="button" id="pgBOk">ثبت</button></div>`, (el, close) => {
      $('#pgBOk', el).onclick = () => {
        const k = readSel('pgBD'); const e = $('#pgBErr', el);
        if (!k || k > today()) { e.textContent = 'تاریخ معتبر نیست.'; e.hidden = false; return; }
        Object.assign(p, { mode: 'post', birth: k, btype: $('#pgBt2', el).value, bf: $('#pgBf2', el).value, kickNow: null, ctrNow: null });
        tab = 'home'; A.save(); close(); A.render(); scrollTo(0, 0); A.confetti(); A.toast('قدم نوزاد مبارک 🤍 حالا نوبت مراقبت از خودته.', null, 'happy');
      };
    });
  }
  function startKegel(hold) { kegel = { ph: 'sq', rep: 1, left: hold, hold }; runKegel(); }
  function runKegel() {
    stopTick();
    tick = setInterval(() => {
      const k = kegel; if (!k) return stopTick();
      if (--k.left <= 0) {
        if (k.ph === 'sq') { k.ph = 'rest'; k.left = Math.max(5, k.hold); }
        else if (k.ph === 'rest') { if (k.rep >= 10) { k.ph = 'fast'; k.rep = 1; k.left = 2; } else { k.rep++; k.ph = 'sq'; k.left = k.hold; } }
        else if (k.ph === 'fast') { if (k.rep >= 10) { k.ph = 'done'; stopTick(); const p = P(), t = today(); p.kegel[t] = (p.kegel[t] || 0) + 1; A.save(); } else { k.rep++; k.left = 2; } }
      }
      const el = $('.pg-keg'); if (el) { el.outerHTML = kegelHtml(P()); bindKegel(); } else { kegel = null; stopTick(); }
    }, 1000);
  }
  function bindKegel() {
    const go = $('#pgKgGo'), st = $('#pgKgStop');
    if (go) go.onclick = () => { const p = P(); p.kgHold = Number($('#pgKgH').value) || 5; A.save(); startKegel(p.kgHold); rerender(); };
    if (st) st.onclick = () => { kegel = null; stopTick(); rerender(); };
  }

  A.mounts.pregnancy = () => {
    stopTick();
    $$('#app [data-setmode]').forEach(b => b.onclick = () => { setupMode = b.dataset.setmode; rerender(); });
    $$('#app [data-by]').forEach(b => b.onclick = () => { setupBy = b.dataset.by; rerender(); });
    $$('#app [data-red]').forEach(b => b.onclick = () => openRed(b.dataset.red));
    const sv = $('#pgSave'); if (sv) sv.onclick = setupSave;
    const cc = $('#pgCancel'); if (cc) cc.onclick = () => { setupMode = null; rerender(); };
    if (!enabled() || setupMode) return;
    const p = P();
    $$('#app [data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; kegel = null; rerender(); });
    $$('#app [data-art]').forEach(b => b.onclick = () => openArt(b.dataset.art));
    $$('#app [data-edit]').forEach(b => b.onclick = () => { setupMode = p.mode; setupBy = p.lmp ? 'lmp' : 'edd'; rerender(); scrollTo(0, 0); });
    [$('#pgBorn'), $('#pgBorn2')].forEach(b => { if (b) b.onclick = birthModal; });
    $$('#app [data-done]').forEach(c => c.onchange = () => { p.done[c.dataset.done] = c.checked; A.save(); if (c.checked) A.toast('ثبت شد ✓', null, 'happy'); rerender(); });
    const tb = $('.pg-tabs'), to = $('.pg-tabs .on'); if (tb && to) { const r = to.getBoundingClientRect(), q = tb.getBoundingClientRect(); tb.scrollLeft += (r.left + r.width / 2) - (q.left + q.width / 2); }
    const aa = $('#pgAncAll'); if (aa) aa.onclick = () => { showAllAnc = !showAllAnc; rerender(); };
    $$('#app [data-supp]').forEach(b => b.onclick = () => { const t = today(); p.supp[t] = !p.supp[t]; if (!p.supp[t]) delete p.supp[t]; A.save(); rerender(); });
    const rm = $('#pgRem'), rt = $('#pgRemT');
    const saveRem = () => { p.rem = { on: rm.checked, time: rt.value || '10:00' }; A.save(); if (rm.checked) A.toast(`یادآور مکمل ساعت ${fa(p.rem.time)} تنظیم شد 🔔`, 'bell'); };
    if (rm) rm.onchange = saveRem; if (rt) rt.onchange = saveRem;
    // weight
    const ps = $('#pgPreSave'); if (ps) ps.onclick = () => { const h = Number($('#pgH').value), w = Number($('#pgW0').value); if (!(h >= 120 && h <= 220 && w >= 30 && w <= 250)) return A.toast('قد بین ۱۲۰ تا ۲۲۰ سانت و وزن بین ۳۰ تا ۲۵۰ کیلو.', null); p.pre = { h, w }; A.save(); rerender(); };
    const wa = $('#pgWAdd'); if (wa) wa.onclick = () => { const v = Number($('#pgWv').value); if (!(v >= 30 && v <= 250)) return A.toast('وزن رو به کیلو وارد کن (۳۰ تا ۲۵۰).', null); p.wt[today()] = Math.round(v * 10) / 10; A.save(); rerender(); };
    $$('#app [data-wdel]').forEach(b => b.onclick = () => { delete p.wt[b.dataset.wdel]; A.save(); rerender(); });
    // kicks
    const ks = $('#pgKStart'); if (ks) ks.onclick = () => { p.kickNow = { s: Date.now(), n: 0 }; A.save(); rerender(); };
    const kk = $('#pgKick'); if (kk) kk.onclick = () => { const k = p.kickNow; k.n++; if (k.n >= 10) { p.kick.push({ s: k.s, e: Date.now(), n: k.n }); p.kick = p.kick.slice(-50); p.kickNow = null; A.toast(`۱۰ حرکت در ${mmss(Date.now() - k.s)} 👣 ثبت شد.`, null, 'happy'); } A.save(); rerender(); };
    const ke = $('#pgKEnd'); if (ke) ke.onclick = () => { const k = p.kickNow; if (k.n) { p.kick.push({ s: k.s, e: Date.now(), n: k.n }); p.kick = p.kick.slice(-50); } p.kickNow = null; A.save(); rerender(); if (k.n < 10) A.toast('اگه حس می‌کنی حرکت‌ها کمتر از همیشه‌ست، همین حالا با بیمارستان یا ماما تماس بگیر.', null); };
    // contractions
    const cb = $('#pgCtr'); if (cb) cb.onclick = () => { if (p.ctrNow) { p.ctr.push({ s: p.ctrNow, e: Date.now() }); p.ctr = p.ctr.slice(-60); p.ctrNow = null; } else p.ctrNow = Date.now(); A.save(); rerender(); };
    const cl = $('#pgCtrClr'); if (cl) cl.onclick = () => { p.ctr = []; p.ctrNow = null; A.save(); rerender(); };
    if (p.kickNow || p.ctrNow) tick = setInterval(() => { const a = $('#pgKT'), c = $('#pgCT'); if (a && p.kickNow) a.textContent = mmss(Date.now() - p.kickNow.s); if (c && p.ctrNow) c.textContent = mmss(Date.now() - p.ctrNow); if (!a && !c) stopTick(); }, 1000);
    // glucose
    const gon = $('#pgGdmOn'); if (gon) gon.onclick = () => { p.gdm = true; A.save(); rerender(); };
    const ga2 = $('#pgGAdd'); if (ga2) ga2.onclick = () => { const v = Math.round(Number($('#pgGv').value)); if (!(v >= 20 && v <= 600)) return A.toast('عدد قند رو به میلی‌گرم در دسی‌لیتر وارد کن (۲۰ تا ۶۰۰).', null); const k = $('#pgGd').value; (p.glu[k] = p.glu[k] || {})[$('#pgGs').value] = v; A.save(); rerender(); };
    $$('#app [data-gdel]').forEach(b => b.onclick = () => { const [k, s] = b.dataset.gdel.split('|'); if (p.glu[k]) { delete p.glu[k][s]; if (!Object.keys(p.glu[k]).length) delete p.glu[k]; } A.save(); rerender(); });
    $$('#app [data-gm]').forEach(b => b.onclick = () => { p.gluMode = b.dataset.gm; A.save(); rerender(); const d = $('.pg-gtbl')?.closest('.card')?.querySelector('details'); if (d) d.open = true; });
    const ts = $('#pgTSave'); if (ts) ts.onclick = () => { const f = Number($('#pgTf').value), a = Number($('#pgTa').value), b = Number($('#pgTb').value); if (!(f >= 60 && f <= 140 && a >= 90 && a <= 200 && b >= 90 && b <= 200)) return A.toast('عددها معتبر نیستن.', null); p.gluT = { f, a, b }; A.save(); rerender(); A.toast('هدف‌ها ذخیره شد ✓', null); };
    // mood
    $$('#app [data-mood]').forEach(b => b.onclick = () => { const t = today(), n = Number(b.dataset.mood); p.mood[t] = p.mood[t] === n ? undefined : n; if (!p.mood[t]) delete p.mood[t]; A.save(); rerender(); });
    const cr = $('#pgCrisis'); if (cr) cr.onclick = () => A.modal(`<div class="stack" style="gap:12px"><h2>💜 تنها نیستی</h2><p>این فکرها می‌تونن بعد از زایمان پیش بیان و نشونه‌ی بیماری‌ان، نه بد بودن تو. لطفاً <b>همین حالا</b> کمک بگیر:</p><ul><li>با <b>۱۱۵</b> تماس بگیر یا به نزدیک‌ترین اورژانس برو.</li><li>نوزاد رو پیش یه بزرگسال دیگه بذار و تنها نمون.</li><li>به یه نفر نزدیک بگو که الان چه حسی داری.</li></ul>${help()}${refList(['nimh', 'mh'])}</div>`);
    bindKegel();
    if (kegel && kegel.ph !== 'done') runKegel();
  };
  add('mount', r => { if (r !== 'pregnancy') { stopTick(); kegel = null; } });

  /* ---------- Today card ---------- */
  add('todayAside', () => {
    if (!enabled()) return '';
    const p = P(), t = today();
    if (p.mode === 'preg') {
      const g = ga(p); if (!g || g.days > 44 * 7) return '';
      return `<div class="card stack pg-todayc" style="gap:8px"><a class="row pg-tlink" href="#pregnancy" style="flex-wrap:nowrap;gap:12px"><span style="flex:none">${ring(g.days / 280, fa(g.w + 1), 'هفته', 76)}</span><span class="stack" style="gap:2px;min-width:0"><b>هفته‌ی ${fa(g.w + 1)} بارداری</b><span class="small muted">${TRI[g.tri]}، ${g.left >= 0 ? `${fa(g.left)} روز تا تاریخ زایمان` : `${fa(-g.left)} روز از تاریخ زایمان گذشته`}</span></span></a>
        <div class="row" style="gap:8px"><button type="button" class="btn ${p.supp[t] ? 'primary' : 'ghost'} pg-sm" data-tsupp="1">${p.supp[t] ? '✓ مکمل امروز' : '💊 مکمل امروز رو خوردم'}</button>${g.w >= 23 ? '<span class="small muted">حرکت‌های بچه رو زیر نظر داشته باش 👣</span>' : ''}</div></div>`;
    }
    if (p.mode === 'post') {
      const pd = postDay(p); if (pd == null || pd > 365) return '';
      const v = p.mood[t];
      return `<div class="card stack pg-todayc" style="gap:8px"><a class="row pg-tlink" href="#pregnancy" style="flex-wrap:nowrap;gap:12px"><span style="flex:none">${ring(Math.min(1, pd / 84), fa(pd + 1), 'روز', 76)}</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(stage(pd).title)}</b><span class="small muted">روز ${fa(pd + 1)} بعد از زایمان</span></span></a>
        <div class="pg-chips" role="group" aria-label="حال امروز">${MOODS.map(([n, e, l]) => `<button type="button" class="pd-chip${v === n ? ' on' : ''}" data-tmood="${n}" aria-pressed="${v === n}" title="${esc(l)}"><span aria-hidden="true">${e}</span></button>`).join('')}</div></div>`;
    }
    return '';
  });
  add('mount', r => {
    if (r !== 'today' || !enabled()) return;
    const p = P();
    $$('[data-tsupp]').forEach(b => b.onclick = () => { const t = today(); p.supp[t] = !p.supp[t]; if (!p.supp[t]) delete p.supp[t]; A.save(); A.render(); });
    $$('[data-tmood]').forEach(b => b.onclick = () => { const t = today(), n = Number(b.dataset.tmood); p.mood[t] = n; A.save(); A.render(); if (n <= 2) A.toast('مرسی که گفتی 💜 اگه این حال ادامه داره، از بخش «حال من» کمک بگیر.', null, 'calm'); });
  });

  /* ---------- notes on other pages ---------- */
  const careNote = where => {
    if (!enabled()) return '';
    const p = P(); if (p.mode === 'post' && (postDay(p) ?? 999) > 365) return '';
    return `<div class="card stack pg-care" style="gap:6px"><b>${p.mode === 'preg' ? '🤰 باردار هستی' : '🤱 تازه زایمان کردی'}</b><p class="small">${where === 'move'
      ? (p.mode === 'preg' ? 'حرکت‌های این برنامه برای بارداری طراحی نشدن. حرکت‌های خوابیده به پشت (بعد از سه‌ماهه‌ی اول)، پرشی و شکمی سنگین رو انجام نده و راهنمای ورزش بارداری ACOG رو ببین.' : 'ورزش رو آروم و تدریجی شروع کن؛ بعد از سزارین یا زایمان با عارضه، اول با پزشکت هماهنگ کن. تمرین کف لگن از همین حالا.')
      : (p.mode === 'preg' ? 'توی بارداری کم کردن کالری یا کاهش وزن توصیه نمی‌شه. از این ابزار فقط برای شناختن غذاها استفاده کن و هدف کالری‌ات رو با پزشک یا متخصص تغذیه تعیین کن.' : 'اگه شیر می‌دی، روزانه حدود ۳۳۰ تا ۴۰۰ کیلوکالری بیشتر لازم داری. رژیم خیلی کم‌کالری نگیر.')}</p><a class="btn ghost pg-sm" href="#pregnancy" data-pgtab="${where === 'move' ? 'ex' : 'food'}" style="align-self:flex-start">${where === 'move' ? 'ورزش ایمن در بارداری و بعد از زایمان' : 'تغذیه در این دوران'}</a></div>`;
  };
  add('moveTop', () => careNote('move'));
  add('mount', r => {
    if (r === 'calories' && enabled()) { const s = $('#app section'); if (s && !$('.pg-care', s)) s.insertAdjacentHTML('afterbegin', careNote('cal')); }
    $$('#app [data-pgtab]').forEach(a => a.addEventListener('click', () => { tab = a.dataset.pgtab; }));
  });

  /* ---------- Settings ---------- */
  add('settings', () => {
    if (!on('pregnancy') || !signed()) return '';
    const r = raw() || {};
    return `<div class="card stack pg-set" style="gap:10px"><b>🤰 بارداری و پس از زایمان</b>
      <label class="check" for="pgTog"><input type="checkbox" id="pgTog" ${r.on ? 'checked' : ''}><span>بخش بارداری و پس از زایمان رو نشونم بده</span></label>
      <p class="small muted">اختیاریه. با روشن کردنش، کارت هفته‌شمار یا بعد از زایمان به صفحه‌ی امروز اضافه می‌شه. اطلاعاتش فقط توی حساب خودت ذخیره می‌شه.</p>
      <div class="row"><a class="btn ghost" href="#pregnancy">باز کردن</a>${r.mode ? '<button class="btn ghost" type="button" id="pgDel">پاک کردن همه‌ی اطلاعات این بخش</button><button class="btn berry" type="button" id="pgDelOk" hidden>بله، همه رو پاک کن</button>' : ''}</div></div>`;
  });
  add('mount', r => {
    if (r !== 'settings') return;
    const tog = $('#pgTog'); if (!tog) return;
    tog.onchange = () => { const p = P(); p.on = tog.checked; p.asked = true; A.save(); A.toast(tog.checked ? (p.mode ? 'بخش بارداری روشن شد 🤍' : 'روشن شد؛ از «باز کردن» شروع کن 🤍') : 'بخش بارداری خاموش شد. اطلاعاتت سر جاشه.', 'bell'); };
    const del = $('#pgDel'), ok = $('#pgDelOk');
    if (del) del.onclick = () => { ok.hidden = false; del.textContent = 'مطمئنی؟ این کار برگشت نداره'; ok.focus(); };
    if (ok) ok.onclick = () => { A.D().preg = { asked: true }; tab = 'home'; setupMode = null; A.save(); A.toast('همه‌ی اطلاعات این بخش پاک شد.', 'bell'); A.render(); };
  });

  /* ---------- reminders ---------- */
  add('reminders', () => {
    if (!enabled()) return [];
    const p = P(); if (!p.rem?.on || !p.mode) return [];
    if (p.mode === 'post' && (postDay(p) ?? 999) > 90) return [];
    return [{ time: /^\d\d:\d\d$/.test(p.rem.time || '') ? p.rem.time : '10:00', text: p.mode === 'preg' ? '💊 وقت مکمل‌های بارداریه (اسید فولیک، آهن و بقیه طبق دستور پزشک). آهن رو با آب بخور، نه با چای.' : '💊 وقت مکمل‌های بعد از زایمانه (آهن و بقیه طبق دستور پزشک).', spot: 'bell', url: '#pregnancy' }];
  });

  /* ---------- entry points ---------- */
  A.tools.push({ route: 'pregnancy', icon: '🤰', title: 'بارداری و پس از زایمان', desc: 'هفته‌شمار، مراقبت‌ها، وزن، حرکات بچه، قند، ورزش ایمن و علائم خطر', show: () => on('pregnancy') });
  (A.searchExtra = A.searchExtra || []).push(() => !on('pregnancy') ? [] : [
    { icon: '🤰', title: 'بارداری و پس از زایمان', sub: 'ابزار', group: 'ابزارها', text: 'بارداری حاملگی باردار هفته بارداری زایمان بعد از زایمان پس از زایمان نوزاد شیردهی دیابت بارداری قند بارداری حرکات جنین انقباض کگل', open: () => A.go('pregnancy') },
    ...G.ARTS.map(a => ({ icon: a.icon, title: a.title, sub: 'بارداری و پس از زایمان', group: 'ابزارها', text: [a.title, a.sum, (a.html || '').replace(/<[^>]+>/g, ' ')].join(' '), note: a.sum, open: () => openArt(a.id) })),
    { icon: '🚩', title: 'علائم خطر بارداری و بعد از زایمان', sub: 'بارداری و پس از زایمان', group: 'ابزارها', text: 'علائم خطر بارداری خونریزی سردرد تاری دید ورم کاهش حرکت جنین تب بعد از زایمان', open: () => openRed(raw()?.mode === 'post' ? 'post' : 'preg') },
  ]);
  A.pregnancy = { ga, eddOf, j2g };
});
