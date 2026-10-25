/* Uzhu sleep section (plugin S): guide chapters, nightly sleep checklist, morning sleep diary with charts and the
   sleep–craving link, chronotype quiz + gradual early-riser plan with reminders, synthesized sleep sounds with a fade-out
   timer, wind-down routine, guided body scan, cognitive shuffle, myths and curated sleep music.
   Data: js/sleep-data.js (window.UZHU_SLEEP), sounds: js/sleep-sound.js (window.UZHU_SOUND). State: A.D().sl. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc, pad = A.pad;
  const S = window.UZHU_SLEEP || {}, SND = window.UZHU_SOUND;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const sl = () => { const d = A.D(); d.sl = d.sl || {}; d.sl.nights = d.sl.nights || {}; d.sl.diary = d.sl.diary || {}; return d.sl; };
  const toMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + m; };
  const fromMin = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
  const faT = t => fa(t);
  const hrs = m => { const h = Math.floor(m / 60), r = Math.round(m % 60); return r ? `${fa(h)} ساعت و ${fa(r)} دقیقه` : `${fa(h)} ساعت`; };
  const keyOf = d => A.dateKey(d);
  // The night that is "tonight": until 5 a.m. it is still yesterday's night.
  const tonightKey = () => keyOf(new Date(Date.now() - 5 * 3600e3));
  // In the morning the diary is about the night that started yesterday evening.
  const lastNightKey = () => keyOf(new Date(Date.now() - 29 * 3600e3));
  const doy = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  const guest = () => !A.user || !A.D().profile;

  /* ---------- plan: target times, with a gradual 15-minute shift every 3 days ---------- */
  function planFor(date = new Date()) {
    const p = !guest() && sl().plan; if (!p) return null;
    const days = Math.max(0, A.dayDiff(p.start, keyOf(date)));
    const steps = Math.floor(days / 3), cur = toMin(p.curWake), goal = toMin(p.goalWake);
    let diff = cur - goal; if (diff < -720) diff += 1440; if (diff > 720) diff -= 1440;
    const moved = Math.min(Math.abs(diff), steps * 15) * Math.sign(diff);
    const wake = cur - moved, bed = wake - p.need * 60;
    return { wake: fromMin(wake), bed: fromMin(bed), done: Math.abs(moved) >= Math.abs(diff), left: Math.max(0, Math.ceil(Math.abs(diff) / 15) * 3 - days) };
  }
  function planSteps(p) {
    const cur = toMin(p.curWake), goal = toMin(p.goalWake);
    let diff = cur - goal; if (diff < -720) diff += 1440; if (diff > 720) diff -= 1440;
    const n = Math.ceil(Math.abs(diff) / 15), out = [];
    for (let i = 0; i <= n; i++) {
      const w = cur - Math.min(Math.abs(diff), i * 15) * Math.sign(diff), d = new Date(p.start + 'T12:00'); d.setDate(d.getDate() + i * 3);
      out.push({ date: d, wake: fromMin(w), bed: fromMin(w - p.need * 60) });
    }
    return out;
  }

  /* ---------- reminders (bedtime, caffeine cutoff, morning light) ---------- */
  add('reminders', dayN => {
    if (guest() || !on('sleep')) return [];
    const s = sl(); if (!s.plan || s.rem === false) return [];
    const d = new Date(); d.setDate(d.getDate() + (dayN - A.D().day));
    const p = planFor(d); if (!p) return [];
    const bed = toMin(p.bed) < 720 ? toMin(p.bed) + 1440 : toMin(p.bed), wake = toMin(p.wake);
    return [
      { time: fromMin(Math.max(toMin('13:00'), Math.min(toMin('16:00'), bed - 8 * 60))), text: 'از الان دیگه چای پررنگ و قهوه نه ☕ کافئین تا ۸ ساعت توی بدن می‌مونه و خواب عمیق امشب رو کم می‌کنه. دمنوش یا چای کم‌رنگ عالیه.', spot: 'moon', url: '#sleep' },
      { time: fromMin(bed - 60), text: 'یک ساعت تا وقت خوابت مونده 🌙 نورهای خونه رو کم کن، گوشی رو بذار شارژ و یه کار آروم شروع کن.', spot: 'moon', url: '#sleep' },
      { time: fromMin(bed - 15), text: 'وقت چک‌لیست خواب و رفتن به رختخوابه 😴 اگه خوابت نمی‌بره، صداهای خواب حبه رو روشن کن.', spot: 'moon', url: '#sleepcheck' },
      { time: fromMin(wake + 10), text: 'صبح بخیر ☀️ پرده رو کنار بزن و ۱۰ دقیقه نور صبح بگیر؛ ساعت بدنت با همین تنظیم می‌شه. دفترچه‌ی خواب دیشب رو هم پر کن.', spot: 'bell', url: '#sleepdiary' },
    ].filter(r => /^\d\d:\d\d$/.test(r.time));
  });

  const off = () => `<section class="wrap"><div class="card">این بخش فعلاً در دسترس نیست. <a href="#today">برگشت</a></div></section>`;
  /* ---------- shared pieces ---------- */
  const hero = (title, sub, extra = '') => `<div class="sl-hero"><div class="sl-stars" aria-hidden="true"></div><div class="sl-moon">${A.ART.mascot('sleepy')}</div><div class="stack" style="gap:8px;min-width:0"><span class="eyebrow">خواب</span><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}${extra}</div></div>`;
  const back = `<a class="small sl-back" href="#sleep">→ برگشت به بخش خواب</a>`;
  function openChapter(id) {
    const list = S.guide || [], i = list.findIndex(c => c.id === id), c = list[i]; if (!c) return;
    const next = list[i + 1];
    A.modal(`<div class="stack article-body sl-ch"><span class="eyebrow">راهنمای خواب، فصل ${fa(i + 1)} از ${fa(list.length)}</span><h2>${c.icon || ''} ${esc(c.title)}</h2>
      <div class="row cp-art-meta"><span class="chip">⏱ ${fa(c.readMin || 3)} دقیقه</span></div>
      ${c.keyPoints?.length ? `<div class="cp-keys"><b>خلاصه در ۳ نکته</b><ul>${c.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
      ${c.html || ''}
      ${c.refs?.length ? `<h3>منابع</h3><ol class="refs">${c.refs.map(r => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.text)}</a>` : esc(r.text)}</li>`).join('')}</ol>` : ''}
      ${next ? `<button class="card sl-next" data-next="${esc(next.id)}"><span class="small muted">فصل بعد</span><b>${next.icon || ''} ${esc(next.title)} ←</b></button>` : ''}
      <p class="small muted">این مطالب جای مشاوره‌ی پزشکی رو نمی‌گیره. اگه بی‌خوابی‌ات بیشتر از سه ماهه، خروپف شدید یا وقفه‌ی تنفسی داری یا دارو مصرف می‌کنی، با پزشک صحبت کن.</p></div>`,
      (el, close) => { const n = $('[data-next]', el); if (n) n.onclick = () => { close(); openChapter(n.dataset.next); }; });
  }
  A.openSleepChapter = openChapter;

  function windDown() {
    const p = planFor(), steps = (S.windDown || []).slice().sort((a, b) => b.min - a.min);
    A.modal(`<div class="stack"><span class="eyebrow">روال آرام شدن</span><h2>۴۵ دقیقه‌ی آخر شب، قدم به قدم</h2>
      <p class="muted">${p ? `وقت خواب امشبت ساعت ${faT(p.bed)}ه. ساعت هر قدم رو برات حساب کردیم.` : 'با تنظیم «برنامه‌ی خواب»، ساعت دقیق هر قدم رو هم می‌بینی.'}</p>
      <ol class="sl-wind">${steps.map(w => `<li><span class="sl-wt">${p ? faT(fromMin(toMin(p.bed) - w.min)) : `${fa(w.min)} دقیقه قبل`}</span><div><b>${esc(w.title)}</b><p class="muted">${esc(w.text)}</p></div></li>`).join('')}</ol></div>`);
  }

  function bodyScan() {
    const steps = S.bodyScan || []; if (!steps.length) return;
    let i = 0, left = steps[0].sec, paused = false, t = null, bg = false;
    const total = steps.reduce((a, s) => a + s.sec, 0);
    A.modal(`<div class="stack sl-scan"><span class="eyebrow">ریلکسیشن بدن</span><h2>آروم‌آروم، از نوک پا تا سر</h2>
      <p class="small muted">دراز بکش، چشم‌هات رو ببند و فقط گوش کن به بدنت. هر مرحله خودش جلو می‌ره و با یه صدای زنگ ملایم خبرت می‌کنه. حدود ${fa(Math.round(total / 60))} دقیقه طول می‌کشه.</p>
      <div class="sl-scan-card"><span class="small" id="bsn"></span><p id="bst"></p></div>
      <div class="progress"><i id="bsp" style="width:0"></i></div>
      <div class="row" style="justify-content:center"><button class="btn ghost" id="bsb">→ قبلی</button><button class="btn primary" id="bsg">⏸ مکث</button><button class="btn ghost" id="bsf">بعدی ←</button></div>
      ${SND && SND.supported() ? `<label class="check" for="bsbg"><input type="checkbox" id="bsbg"><span>صدای زمینه‌ی آرام (نویز قهوه‌ای)</span></label>` : ''}</div>`,
      el => {
        const draw = () => {
          $('#bsn', el).textContent = `مرحله‌ی ${fa(i + 1)} از ${fa(steps.length)}`;
          $('#bst', el).textContent = steps[i].text;
          const done = steps.slice(0, i).reduce((a, s) => a + s.sec, 0) + (steps[i].sec - left);
          $('#bsp', el).style.width = Math.min(100, done / total * 100) + '%';
        };
        let ended = false;
        const goTo = n => { if (ended && n < steps.length) { ended = false; t = setInterval(stepT, 1000); } if (n >= steps.length) { ended = true; clearInterval(t); $('#bst', el).textContent = 'تموم شد. همون‌طور آروم بمون و بذار خواب خودش بیاد 🌙'; $('#bsp', el).style.width = '100%'; return; } i = Math.max(0, n); left = steps[i].sec; SND && SND.chime(); draw(); };
        const stepT = () => { if (paused) return; left--; if (left <= 0) goTo(i + 1); else draw(); };
        t = setInterval(stepT, 1000);
        $('#bsg', el).onclick = e => { paused = !paused; e.target.textContent = paused ? '▶ ادامه' : '⏸ مکث'; };
        $('#bsb', el).onclick = () => goTo(i - 1);
        $('#bsf', el).onclick = () => goTo(i + 1);
        const c = $('#bsbg', el); if (c) c.onchange = () => { bg = c.checked; SND.set('brown', bg ? .35 : 0); };
        el._cleanup = () => { clearInterval(t); if (bg) SND.set('brown', 0); };
        draw();
      });
  }

  function shuffle() {
    const words = S.shuffle || []; if (!words.length) return;
    let t = null, last = -1;
    const ov = document.createElement('div'); ov.className = 'sl-shuffle'; ov.setAttribute('role', 'dialog');
    ov.innerHTML = `<button class="btn ghost sl-sx">بستن ✕</button><p class="sl-si">هر کلمه رو که دیدی، تصویرش رو آروم توی ذهنت بساز: رنگش، شکلش، جایی که هست. بعد بذار بره. این کار ذهن رو از نگرانی دور می‌کنه و راه خواب رو باز می‌کنه.</p><div class="sl-sw" aria-live="polite"></div><p class="small sl-sh">برای کلمه‌ی بعد، روی صفحه بزن</p>`;
    document.body.appendChild(ov);
    const next = () => { let n; do n = Math.floor(Math.random() * words.length); while (n === last && words.length > 1); last = n; const w = $('.sl-sw', ov); w.classList.remove('in'); void w.offsetWidth; w.textContent = words[n]; w.classList.add('in'); clearTimeout(t); t = setTimeout(next, 10000); };
    const close = () => { clearTimeout(t); ov.remove(); document.removeEventListener('keydown', key); removeEventListener('hashchange', close); };
    addEventListener('hashchange', close);
    const key = e => { if (e.key === 'Escape') close(); else if (e.key === ' ' || e.key === 'Enter') next(); };
    ov.onclick = e => { if (e.target.closest('.sl-sx')) close(); else next(); };
    document.addEventListener('keydown', key);
    next();
  }

  /* ---------- hub (#sleep) ---------- */
  A.titles.sleep = 'خواب';
  A.views.sleep = () => {
    if (!on('sleep')) return off();
    const tips = S.tips || [], tip = tips.length ? tips[doy() % tips.length] : '';
    let mine = '';
    if (!guest()) {
      const s = sl(), p = planFor(), n = s.nights[tonightKey()], cnt = (n?.items || []).length, tot = (S.checklist || []).length;
      const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
      let until = p ? toMin(p.bed) - nm : 0; if (p && until < -180) until += 1440;
      const diary = Object.entries(s.diary).sort().slice(-7);
      mine = `<div class="sl-mine">
        <div class="card stack" style="gap:6px"><b>🛏 برنامه‌ی خواب تو</b>${p ? `<p>خواب: <b class="num">${faT(p.bed)}</b>، بیداری: <b class="num">${faT(p.wake)}</b></p><p class="small muted">${until > 0 && until < 720 ? `${hrs(until)} تا وقت خواب` : until <= 0 && until > -180 ? 'الان وقت خوابه 🌙' : ''}${p.done ? '، به هدفت رسیدی 🎉' : `، ${fa(p.left)} روز تا هدف`}</p>` : `<p class="muted small">هنوز ساعت خواب و بیداری‌ات رو تنظیم نکردی.</p>`}<a class="btn ghost" href="#sleepplan">${p ? 'تغییر برنامه' : 'تنظیم برنامه‌ی خواب'}</a></div>
        <a class="card stack sl-link" href="#sleepcheck" style="gap:6px"><b>🌙 چک‌لیست خواب امشب</b><div class="progress"><i style="width:${tot ? cnt / tot * 100 : 0}%"></i></div><span class="small muted">${fa(cnt)} از ${fa(tot)} کار</span></a>
        <a class="card stack sl-link" href="#sleepdiary" style="gap:6px"><b>📔 دفترچه‌ی خواب</b>${diary.length ? chart(diary, 120) : '<span class="small muted">صبح‌ها ثبت کن دیشب چطور خوابیدی تا الگوی خوابت رو ببینی.</span>'}</a>
      </div>`;
    }
    const tools = [
      ['#sleepsounds', '🎧', 'صداها و موسیقی خواب', 'باران، موج، لالایی، نویز صورتی، با تایمر خاموشی'],
      ['wind', '🕯', 'روال آرام شدن', '۴۵ دقیقه‌ی آخر شب، قدم به قدم'],
      ['scan', '🧘', 'ریلکسیشن بدن', 'شل کردن عضله‌ها از پا تا سر، با راهنما'],
      ['shuffle', '🔀', 'بازی ذهنی خواب', 'وقتی فکرها نمی‌ذارن بخوابی'],
      ['#sleepplan', '⏰', 'سحرخیز شو', 'تیپ خوابت رو بشناس و آروم‌آروم زودتر بخواب'],
      ['#sleepcheck', '✅', 'چک‌لیست خواب', '۱۴ عادت شب برای خواب عمیق‌تر'],
    ];
    return `<section class="wrap stack" style="gap:18px">
      ${hero('خواب خوب، هوس کمتر', 'یک شب کم‌خوابی کافیه تا هورمون‌های گرسنگی به‌هم بریزن و هوس شیرینی بیشتر بشه. این بخش کمکت می‌کنه زودتر بخوابی، عمیق‌تر بخوابی و سرحال بیدار شی.',
        `<div class="row"><a class="btn sun" href="#sleepsounds">🎧 صداهای خواب</a>${guest() ? '<a class="btn ghost sl-ghost" href="#signup">ثبت‌نام برای چک‌لیست و دفترچه</a>' : '<a class="btn ghost sl-ghost" href="#sleepcheck">🌙 چک‌لیست امشب</a>'}</div>`)}
      ${tip ? `<div class="card sl-tip"><b>💡 نکته‌ی خواب امروز</b><p>${esc(tip)}</p></div>` : ''}
      ${mine}
      <div class="tools-grid">${tools.map(([r, i, t, d]) => r[0] === '#' ? `<a class="card tool" href="${r}"><span class="tool-i">${i}</span><b>${t}</b><span class="small muted">${d}</span></a>` : `<button class="card tool" data-tool="${r}"><span class="tool-i">${i}</span><b>${t}</b><span class="small muted">${d}</span></button>`).join('')}</div>
      <div class="section-head" style="margin:8px 0 0"><span class="eyebrow">راهنمای کامل خواب</span><h2>هر چیزی که باید درباره‌ی خواب بدونی</h2><p class="muted">بر پایه‌ی راهنماهای تازه‌ی AASM، بنیاد ملی خواب، NHS و پژوهش‌های چند سال اخیر.</p></div>
      <div class="sl-guide">${(S.guide || []).map((c, n) => `<button class="card sl-chap" data-ch="${esc(c.id)}"><span class="sl-ci">${c.icon || '🌙'}</span><span class="stack" style="gap:2px;min-width:0"><span class="small muted">فصل ${fa(n + 1)}، ${fa(c.readMin || 3)} دقیقه</span><b>${esc(c.title)}</b><span class="small muted">${esc(c.summary || '')}</span></span></button>`).join('') || '<div class="card">راهنما به‌زودی اضافه می‌شه.</div>'}</div>
      ${(S.myths || []).length ? `<div class="section-head" style="margin:8px 0 0"><span class="eyebrow">باور یا واقعیت؟</span><h2>باورهای رایج درباره‌ی خواب</h2></div>
        <div class="sl-myths sl-fold">${S.myths.map((m, i) => `<details class="card ${i > 3 ? 'sl-x' : ''}"><summary><span class="chip berry">باور</span> ${esc(m.myth)}</summary><p><span class="chip mint">واقعیت</span> ${esc(m.fact)}</p></details>`).join('')}</div>${S.myths.length > 4 ? `<button class="btn ghost sl-all">همه‌ی ${fa(S.myths.length)} باور ↓</button>` : ''}` : ''}
      ${musicList()}
      <p class="small muted">بخش خواب حبه ابزار آموزشیه و جای تشخیص و درمان پزشکی رو نمی‌گیره.</p>
    </section>`;
  };
  A.mounts.sleep = () => {
    $$('[data-ch]').forEach(b => b.onclick = () => openChapter(b.dataset.ch));
    bindFold();
    $$('[data-tool]').forEach(b => b.onclick = () => ({ wind: windDown, scan: bodyScan, shuffle })[b.dataset.tool]());
  };
  function bindFold() { $$('.sl-all').forEach(b => b.onclick = () => { b.previousElementSibling.classList.remove('sl-fold'); b.remove(); }); }
  function musicList() {
    const m = S.music || []; if (!m.length) return '';
    return `<div class="section-head" style="margin:8px 0 0"><span class="eyebrow">موسیقی خواب</span><h2>موسیقی‌های آرام‌بخش برای خواب</h2><p class="muted">از کانال‌های رسمی هنرمندها و ناشرها. موسیقی آرام با ضرب‌آهنگ کند (حدود ۶۰ تا ۸۰ ضرب در دقیقه) به آروم شدن کمک می‌کنه.</p></div>
      <div class="sl-music sl-fold">${m.map((x, i) => `<a class="card sl-mu ${i > 3 ? 'sl-x' : ''}" href="${esc(x.url)}" target="_blank" rel="noopener"><span class="sl-mi">▶</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(x.title)}</b><span class="small muted">${esc(x.by || '')}${x.mins ? `، ${fa(x.mins)} دقیقه` : ''}</span>${x.note ? `<span class="small">${esc(x.note)}</span>` : ''}</span></a>`).join('')}</div>${m.length > 4 ? `<button class="btn ghost sl-all">همه‌ی ${fa(m.length)} موسیقی ↓</button>` : ''}`;
  }

  /* ---------- sounds (#sleepsounds) ---------- */
  const PRESETS = [
    ['شب بارونی', { rain: .7, brown: .3 }], ['کنار دریا', { waves: .75, wind: .25 }], ['کلبه‌ی جنگلی', { fire: .6, rain: .35, night: .2 }],
    ['لالایی', { lullaby: .7, drone: .3 }], ['فقط نویز', { pink: .6 }], ['شب تابستون', { night: .6, wind: .3 }],
  ];
  let soundTimer = 0, tick = null, timerChosen = false;
  A.titles.sleepsounds = 'صداهای خواب';
  A.views.sleepsounds = () => {
    if (!on('sleep')) return off();
    const st = SND ? SND.state() : { on: {} };
    return `<section class="wrap stack" style="gap:18px">${back}
      ${hero('صداهای خواب', 'صداها رو با هم ترکیب کن، بلندیِ هر کدوم رو تنظیم کن و تایمر بذار تا آروم‌آروم خاموش بشن. همه‌ی صداها همین‌جا ساخته می‌شن و اینترنت مصرف نمی‌کنن.')}
      ${SND && SND.supported() ? `
      <div class="row sl-presets">${PRESETS.map(([n], i) => `<button class="chip lav" data-pre="${i}">${n}</button>`).join('')}</div>
      <div class="sl-layers">${SND.layers.map(l => { const v = st.on[l.id] || 0; return `<div class="card sl-layer ${v ? 'on' : ''}" data-l="${l.id}"><button class="sl-lt" data-tg="${l.id}" aria-pressed="${!!v}"><span class="sl-li">${l.icon}</span><b>${l.name}</b></button><input type="range" min="0" max="100" value="${Math.round((v || .6) * 100)}" data-vol="${l.id}" aria-label="بلندی ${l.name}"></div>`; }).join('')}</div>
      <div class="card stack" style="gap:10px"><b>⏲ تایمر خاموشی</b><div class="row">${[0, 15, 30, 45, 60, 90].map(m => `<button class="chip ${soundTimer === m ? 'mint' : ''}" data-tm="${m}">${m ? fa(m) + ' دقیقه' : 'بدون تایمر'}</button>`).join('')}</div><span class="small muted" id="sltl"></span>
        <button class="btn berry" id="slstop">⏹ خاموش کردن همه</button></div>
      <p class="small muted">برای پخش در طول شب، صفحه رو باز بذار؛ روی بعضی گوشی‌ها با قفل شدن صفحه، صدا هم قطع می‌شه. بلندی رو کم نگه دار: صدای پس‌زمینه باید از صحبت آروم کمتر باشه.</p>`
      : '<div class="card">این مرورگر پخش صدا رو پشتیبانی نمی‌کنه. از موسیقی‌های پایین صفحه استفاده کن.</div>'}
      ${musicList()}
    </section>`;
  };
  A.mounts.sleepsounds = () => {
    if (!SND) return;
    const sync = () => {
      const st = SND.state();
      $$('.sl-layer').forEach(c => { const v = st.on[c.dataset.l]; c.classList.toggle('on', !!v); $('[data-tg]', c).setAttribute('aria-pressed', !!v); });
      const tl = $('#sltl'); if (tl) tl.textContent = st.endAt ? `خاموش می‌شه حدود ساعت ${fa(fromMin(new Date(st.endAt).getHours() * 60 + new Date(st.endAt).getMinutes()))}` : '';
      if (!st.endAt && soundTimer) { soundTimer = 0; $$('[data-tm]').forEach(b => b.classList.toggle('mint', b.dataset.tm === '0')); }
    };
    SND.onchange = sync;
    $$('[data-tg]').forEach(b => b.onclick = () => { const id = b.dataset.tg, st = SND.state(); SND.set(id, st.on[id] ? 0 : (Number($(`[data-vol="${id}"]`).value) || ($(`[data-vol="${id}"]`).value = 60)) / 100); });
    $$('[data-vol]').forEach(r => r.oninput = () => { const v = r.value / 100 || 0, isOn = SND.state().on[r.dataset.vol] != null; if (isOn || v > 0) SND.set(r.dataset.vol, v); });
    $$('[data-pre]').forEach(b => b.onclick = () => {
      const p = PRESETS[b.dataset.pre][1];
      SND.layers.forEach(l => { SND.set(l.id, p[l.id] || 0); const r = $(`[data-vol="${l.id}"]`); if (p[l.id] && r) r.value = p[l.id] * 100; });
      if (!timerChosen && !soundTimer) { soundTimer = 45; SND.timer(45); $$('[data-tm]').forEach(x => x.classList.toggle('mint', x.dataset.tm === '45')); }
    });
    $$('[data-tm]').forEach(b => b.onclick = () => { timerChosen = true; soundTimer = Number(b.dataset.tm); SND.timer(soundTimer); $$('[data-tm]').forEach(x => x.classList.toggle('mint', x === b)); });
    bindFold();
    const st = $('#slstop'); if (st) st.onclick = () => { soundTimer = 0; SND.stopAll(); };
    clearInterval(tick); tick = setInterval(() => { if (!$('#sltl')) { clearInterval(tick); SND.onchange = null; } }, 5000);
    sync();
  };

  /* ---------- nightly sleep checklist (#sleepcheck) ---------- */
  const CAT = { day: '☀️ در طول روز', evening: '🌆 عصر و شب', bedroom: '🛏 اتاق خواب', mind: '🧠 ذهن آروم' };
  A.titles.sleepcheck = 'چک‌لیست خواب'; A.appRoutes.push('sleepcheck');
  A.views.sleepcheck = () => {
    if (!on('sleep')) return off();
    const s = sl(), k = tonightKey(), n = s.nights[k] || { items: [] }, items = S.checklist || [];
    const keys = Object.keys(s.nights).sort(), good = keys.filter(x => (s.nights[x].items || []).length >= Math.ceil(items.length * .7)).length;
    return `<section class="wrap stack" style="gap:16px;max-width:760px">${back}
      ${hero('چک‌لیست خواب امشب', 'هر کاری رو که امروز برای خواب بهتر انجام دادی تیک بزن. لازم نیست همه‌اش کامل باشه؛ هر تیک یعنی خواب عمیق‌تر.', `<p class="small">تا الان ${fa(good)} شب بیشتر از ۷۰٪ چک‌لیست رو انجام دادی.</p>`)}
      <form id="slf" class="stack" style="gap:14px">
        ${Object.entries(CAT).map(([c, t]) => { const list = items.filter(x => x.cat === c); return list.length ? `<div class="card stack" style="gap:8px"><b>${t}</b>${list.map(x => `<label class="check" for="sc-${esc(x.id)}"><input type="checkbox" id="sc-${esc(x.id)}" value="${esc(x.id)}" ${n.items.includes(x.id) ? 'checked' : ''}><span>${esc(x.text)}</span></label>`).join('')}</div>` : ''; }).join('')}
        <div class="card stack" style="gap:6px"><label for="slbed"><b>امشب چه ساعتی می‌خوابی؟</b></label><input class="input" type="time" id="slbed" value="${esc(n.bed || planFor()?.bed || '23:00')}" style="max-width:180px"></div>
        <button class="btn primary big" type="submit">ثبت چک‌لیست خواب 🌙</button>
      </form></section>`;
  };
  A.mounts.sleepcheck = () => {
    const f = $('#slf'); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      const s = sl(), ids = $$('input[type=checkbox]:checked', f).map(i => i.value), tot = (S.checklist || []).length;
      s.nights[tonightKey()] = { items: ids, bed: $('#slbed').value, at: Date.now() };
      A.save();
      const r = tot ? ids.length / tot : 0;
      if (r >= .7) A.confetti();
      A.toast(r >= .7 ? `${fa(ids.length)} کار برای خواب خوب! شب بخیر، خواب‌های خوب ببینی 🌙` : r >= .4 ? 'خوبه! فردا یکی دو تیک بیشتر رو امتحان کن. شب بخیر 🌙' : 'ثبت شد. از فردا فقط یک عادت رو انتخاب کن و روش کار کن. شب بخیر 🌙', null, 'sleepy');
      A.go('sleep');
    };
  };

  /* ---------- morning sleep diary (#sleepdiary) ---------- */
  const QUAL = ['😫', '😕', '😐', '🙂', '😴'];
  const dur = e => { let m = toMin(e.wake) - toMin(e.bed); if (m <= 0) m += 1440; return Math.max(0, m - (e.latency || 0) - (e.awake || 0)); };
  function chart(entries, h = 160) {
    const W = 320, bw = W / Math.max(entries.length, 7), max = 11 * 60;
    const y = m => h - 18 - (m / max) * (h - 30);
    return `<svg class="sl-chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="ساعت خواب شب‌های اخیر">
      <rect x="0" y="${y(9 * 60)}" width="${W}" height="${y(7 * 60) - y(9 * 60)}" class="sl-band"/>
      ${entries.map(([k, e], i) => { const m = dur(e), x = W - (i + 1) * bw + bw * .2; const cls = m < 360 ? 'bad' : m < 420 ? 'mid' : 'ok';
        return `<rect x="${x}" y="${y(m)}" width="${bw * .6}" height="${h - 18 - y(m)}" rx="4" class="sl-bar ${cls}"><title>${fa(k)}: ${hrs(m)}</title></rect><text x="${x + bw * .3}" y="${h - 4}" text-anchor="middle" class="sl-ax">${fa(k.slice(8))}</text>`; }).join('')}
    </svg>`;
  }
  A.titles.sleepdiary = 'دفترچه‌ی خواب'; A.appRoutes.push('sleepdiary');
  A.views.sleepdiary = () => {
    if (!on('sleep')) return off();
    const s = sl(), k = lastNightKey(), e = s.diary[k] || {}, p = planFor();
    const all = Object.entries(s.diary).sort(), last = all.slice(-14);
    let stats = '';
    if (all.length) {
      const l7 = all.slice(-7), avg = l7.reduce((a, [, x]) => a + dur(x), 0) / l7.length, q = l7.reduce((a, [, x]) => a + (x.quality || 0), 0) / l7.length;
      const wakes = l7.map(([, x]) => { let m = toMin(x.wake); if (m < 180) m += 1440; return m; }), spread = Math.max(...wakes) - Math.min(...wakes);
      // Sleep–craving link: the night of date d affects the craving logged on d+1.
      const crav = {}; Object.values(A.D().log || {}).forEach(l => { if (l.date && l.craving != null) crav[l.date] = l.craving; });
      const pairs = all.map(([d, x]) => { const n = new Date(d + 'T12:00'); n.setDate(n.getDate() + 1); return [dur(x), crav[keyOf(n)]]; }).filter(x => x[1] != null);
      const short = pairs.filter(x => x[0] < 390), longer = pairs.filter(x => x[0] >= 390);
      const av = arr => arr.reduce((a, x) => a + x[1], 0) / arr.length;
      stats = `<div class="stat-row card"><div><b class="num">${fa((avg / 60).toFixed(1)).replace('.', '٫')}</b><span class="small muted">میانگین ساعت خواب (۷ شب)</span></div><div><b class="num">${QUAL[Math.round(q) - 1] || '-'}</b><span class="small muted">کیفیت خواب</span></div><div><b class="num">${fa(Math.round(spread))}</b><span class="small muted">دقیقه نوسان ساعت بیداری</span></div></div>
        ${spread > 60 ? '<div class="card sl-tip"><b>⏰ ساعت بیداری‌ات ثابت نیست</b><p>ساعت بیداری‌ات این هفته بیشتر از یک ساعت بالا و پایین شده. ثابت نگه داشتن ساعت بیداری، حتی آخر هفته‌ها، قوی‌ترین کار برای تنظیم ساعت بدنه.</p></div>' : ''}
        ${short.length >= 2 && longer.length >= 2 ? `<div class="card sl-tip"><b>🍬 خواب و هوس تو</b><p>فردای شب‌هایی که کمتر از ۶ و نیم ساعت خوابیدی، میانگین شدت هوست ${fa(av(short).toFixed(1)).replace('.', '٫')} از ۴ بود؛ بعد از شب‌های با خواب کافی ${fa(av(longer).toFixed(1)).replace('.', '٫')}. ${av(short) > av(longer) ? 'خواب کافی واقعاً هوست رو کم می‌کنه!' : 'جالبه! کم‌خوابی فعلاً روی هوست اثر زیادی نذاشته.'}</p></div>` : ''}`;
    }
    const lat = [[5, 'کمتر از ۱۰ دقیقه'], [15, 'حدود ۱۵ دقیقه'], [30, 'نیم ساعت'], [45, '۴۵ دقیقه'], [75, 'بیشتر از یک ساعت']];
    const awk = [[0, 'اصلاً'], [10, 'یک بار کوتاه'], [30, 'چند بار'], [60, 'زیاد، بیشتر از یک ساعت']];
    return `<section class="wrap stack" style="gap:16px;max-width:760px">${back}
      ${hero('دفترچه‌ی خواب', 'هر صبح یک دقیقه وقت بذار و بنویس دیشب چطور خوابیدی. بعد از یک هفته الگوی خوابت و رابطه‌اش با هوست رو می‌بینی.')}
      <form id="sdf" class="card stack" style="gap:12px"><b>دیشب (${esc(A.jalali(new Date(k + 'T12:00')))})</b>
        <div class="two"><div class="field"><label for="sdb">کِی رفتی توی رختخواب؟</label><input class="input" type="time" id="sdb" value="${esc(e.bed || sl().nights[k]?.bed || p?.bed || '23:00')}"></div>
        <div class="field"><label for="sdw">کِی بیدار شدی؟</label><input class="input" type="time" id="sdw" value="${esc(e.wake || p?.wake || '07:00')}"></div></div>
        <div class="field"><label for="sdl">چقدر طول کشید خوابت ببره؟</label><select class="input" id="sdl">${lat.map(([v, t]) => `<option value="${v}" ${e.latency === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="field"><label for="sda">وسط شب بیدار شدی؟</label><select class="input" id="sda">${awk.map(([v, t]) => `<option value="${v}" ${e.awake === v ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="field"><span>کیفیت خوابت چطور بود؟</span><div class="row sl-q">${QUAL.map((q, i) => `<button type="button" class="${e.quality === i + 1 ? 'on' : ''}" data-q="${i + 1}" aria-label="کیفیت ${fa(i + 1)}">${q}</button>`).join('')}</div></div>
        <button class="btn primary" type="submit">ثبت خواب دیشب</button><div id="sdr"></div></form>
      ${last.length ? `<div class="card stack"><b>شب‌های اخیر</b>${chart(last)}<span class="small muted">نوار سبز کم‌رنگ یعنی محدوده‌ی پیشنهادی ۷ تا ۹ ساعت برای بزرگسال‌ها.</span></div>` : ''}
      ${stats}
    </section>`;
  };
  A.mounts.sleepdiary = () => {
    let q = sl().diary[lastNightKey()]?.quality || 0;
    $$('[data-q]').forEach(b => b.onclick = () => { q = Number(b.dataset.q); $$('[data-q]').forEach(x => x.classList.toggle('on', x === b)); });
    const f = $('#sdf'); if (!f) return;
    f.onsubmit = e => {
      e.preventDefault();
      if (!q) { A.toast('کیفیت خوابت رو هم انتخاب کن 🙂'); return; }
      const en = { bed: $('#sdb').value, wake: $('#sdw').value, latency: Number($('#sdl').value), awake: Number($('#sda').value), quality: q };
      sl().diary[lastNightKey()] = en; A.save();
      const m = dur(en), t = S.diaryTips || {};
      A.toast(`${hrs(m)} خواب ثبت شد. ${m < 360 ? t.short || '' : m < 420 ? t.ok || '' : m <= 570 ? t.good || '' : t.long || ''}`, null, m >= 420 ? 'happy' : 'calm');
      A.render();
    };
  };

  /* ---------- chronotype + early-riser plan (#sleepplan) ---------- */
  A.titles.sleepplan = 'سحرخیز شو';
  A.views.sleepplan = () => {
    if (!on('sleep')) return off();
    const ch = S.chronotype || {}, qs = ch.questions || [], saved = !guest() && sl().chrono, p = !guest() && sl().plan;
    const res = saved && ch.results?.[saved];
    return `<section class="wrap stack" style="gap:16px;max-width:820px">${back}
      ${hero('سحرخیز شو، آروم‌آروم', 'بدن با تغییرهای ناگهانی کنار نمیاد. هر سه روز فقط ۱۵ دقیقه زودتر بیدار شو و زودتر بخواب، و ساعت بیداری رو حتی آخر هفته‌ها ثابت نگه دار.')}
      ${qs.length ? `<div class="card stack" style="gap:12px" id="chq"><b>🦉 تیپ خوابت چیه؟ (۵ سؤال)</b>
        ${res ? `<div class="sl-res"><h3>${esc(res.title)}</h3><p>${esc(res.text)}</p><button class="btn ghost" id="chre">دوباره جواب بده</button></div>` : `
        ${qs.map((x, i) => `<div class="stack" style="gap:6px"><span>${fa(i + 1)}. ${esc(x.q)}</span><div class="row">${x.o.map(([t, sc]) => `<button type="button" class="chip" data-cq="${i}" data-sc="${sc}">${esc(t)}</button>`).join('')}</div></div>`).join('')}
        <button class="btn primary" id="chgo">نتیجه رو ببین</button><div id="chr"></div>`}</div>` : ''}
      <form class="card stack" style="gap:12px" id="spf"><b>⏰ برنامه‌ی خواب من</b>
        <div class="two"><div class="field"><label for="spc">الان معمولاً ساعت چند بیدار می‌شی؟</label><input class="input" type="time" id="spc" value="${esc(p?.curWake || '08:30')}"></div>
        <div class="field"><label for="spg">دوست داری ساعت چند بیدار شی؟</label><input class="input" type="time" id="spg" value="${esc(p?.goalWake || '06:30')}"></div></div>
        <div class="field"><label for="spn">چند ساعت خواب لازم داری؟</label><select class="input" id="spn">${[7, 7.5, 8, 8.5, 9].map(h => `<option value="${h}" ${(p?.need || 8) === h ? 'selected' : ''}>${fa(String(h).replace('.5', ' و نیم'))} ساعت</option>`).join('')}</select><span class="small muted">بیشتر بزرگسال‌ها به ۷ تا ۹ ساعت خواب نیاز دارن.</span></div>
        <label class="check" for="spr"><input type="checkbox" id="spr" ${sl0().rem !== false ? 'checked' : ''}><span>یادآور ساعت خواب، قطع کافئین و نور صبح رو بفرست</span></label>
        <button class="btn primary" type="submit">${guest() ? 'دیدن برنامه' : 'ذخیره‌ی برنامه'}</button></form>
      <div id="spout">${p ? planTable(p) : ''}</div>
    </section>`;
  };
  const sl0 = () => (guest() ? {} : sl());
  function planTable(p) {
    const st = planSteps(p), today = keyOf(new Date());
    return `<div class="card stack" style="gap:10px"><b>مسیر تو تا ساعت ${faT(p.goalWake)}</b><p class="small muted">${st.length > 1 ? `${fa((st.length - 1) * 3)} روز، هر سه روز ۱۵ دقیقه.` : 'از همین امشب می‌تونی با ساعت هدفت شروع کنی.'} اگه یه شب دیر خوابیدی، باز هم سر ساعت بیدار شو؛ خواب شب بعد جبرانش می‌کنه.</p>
      <div style="overflow-x:auto"><table class="sl-plan"><tr><th>از تاریخ</th><th>خواب</th><th>بیداری</th></tr>${st.map((s, i) => { const k = keyOf(s.date), nk = st[i + 1] ? keyOf(st[i + 1].date) : '9999'; const now = k <= today && today < nk;
        return `<tr class="${now ? 'now' : ''}"><td>${esc(A.jalali(s.date))}${now ? ' <span class="chip sun">الان</span>' : ''}</td><td class="num">${faT(s.bed)}</td><td class="num">${faT(s.wake)}</td></tr>`; }).join('')}</table></div></div>`;
  }
  A.mounts.sleepplan = () => {
    const ans = {};
    $$('[data-cq]').forEach(b => b.onclick = () => { ans[b.dataset.cq] = Number(b.dataset.sc); $$(`[data-cq="${b.dataset.cq}"]`).forEach(x => x.classList.toggle('lav', x === b)); });
    const g = $('#chgo'); if (g) g.onclick = () => {
      const qs = S.chronotype.questions; if (Object.keys(ans).length < qs.length) { A.toast('به همه‌ی سؤال‌ها جواب بده 🙂'); return; }
      const sc = Object.values(ans).reduce((a, b) => a + b, 0), max = qs.length * 4, min = qs.length, r = (sc - min) / (max - min);
      const bd = S.chronotype.bands, type = bd ? (sc >= bd.morning[0] ? 'morning' : sc <= bd.evening[1] ? 'evening' : 'middle') : r >= .62 ? 'morning' : r <= .38 ? 'evening' : 'middle', res = S.chronotype.results[type];
      if (!guest()) { sl().chrono = type; A.save(); }
      $('#chr').innerHTML = `<div class="sl-res"><h3>${esc(res.title)}</h3><p>${esc(res.text)}</p></div>`;
    };
    const re = $('#chre'); if (re) re.onclick = () => { delete sl().chrono; A.render(); };
    $('#spf').onsubmit = e => {
      e.preventDefault();
      const p = { curWake: $('#spc').value, goalWake: $('#spg').value, need: Number($('#spn').value), start: keyOf(new Date()) };
      if (!/^\d\d:\d\d$/.test(p.curWake) || !/^\d\d:\d\d$/.test(p.goalWake)) { A.toast('هر دو ساعت رو وارد کن 🙂'); return; }
      if (guest()) { $('#spout').innerHTML = planTable(p) + '<div class="card"><a href="#signup">با ثبت‌نام</a> این برنامه ذخیره می‌شه و یادآور ساعت خوابت هم میاد.</div>'; return; }
      const s = sl(), old = s.plan;
      if (old && old.curWake === p.curWake && old.goalWake === p.goalWake) p.start = old.start;
      s.plan = p; s.rem = $('#spr').checked; A.save();
      A.toast('برنامه‌ی خوابت ذخیره شد. امشب ساعت ' + fa(planFor().bed) + ' وقت خوابه 🌙', null, 'happy');
      $('#spout').innerHTML = planTable(p);
    };
  };

  /* ---------- hooks into the rest of the app ---------- */
  add('todayAside', () => {
    if (!on('sleep')) return '';
    const s = sl(), h = new Date().getHours(), p = planFor();
    if (h >= 5 && h < 13 && !s.diary[lastNightKey()]) return `<a class="card row sl-today" href="#sleepdiary"><span class="sl-ti">📔</span><span class="stack" style="gap:2px"><b>دیشب چطور خوابیدی؟</b><span class="small muted">یک دقیقه، توی دفترچه‌ی خواب</span></span></a>`;
    if (h >= 19 || h < 3) { const n = (s.nights[tonightKey()]?.items || []).length; return `<a class="card row sl-today" href="#sleepcheck"><span class="sl-ti">😴</span><span class="stack" style="gap:2px"><b>چک‌لیست خواب امشب ${n ? '، ' + fa(n) + ' تیک' : ''}</b><span class="small muted">${p ? `وقت خواب: ساعت ${faT(p.bed)}` : 'عادت‌های شب برای خواب عمیق'}</span></span></a>`; }
    return `<a class="card row sl-today" href="#sleep"><span class="sl-ti">🌙</span><span class="stack" style="gap:2px"><b>خواب</b><span class="small muted">${p ? `امشب ساعت ${faT(p.bed)} بخواب، فردا ${faT(p.wake)} بیدار شو` : 'راهنما، صداهای خواب و برنامه‌ی سحرخیزی'}</span></span></a>`;
  });
  add('nightExtra', () => on('sleep') ? `<a class="card row sl-today" href="#sleepcheck"><span class="sl-ti">😴</span><span class="stack" style="gap:2px"><b>چک‌لیست خواب رو هم بزن</b><span class="small muted">بعدش صداهای خواب رو روشن کن و آروم بخواب</span></span></a>` : '');
  add('mount', r => {
    const nav = $('#nav'); if (!nav || !on('sleep') || $('.sl-nav', nav)) return;
    const a = document.createElement('a'); a.href = '#sleep'; a.className = 'sl-nav' + (String(r).startsWith('sleep') ? ' on' : ''); a.textContent = 'خواب';
    const learn = $('a[href="#learn"]', nav); if (learn) learn.after(a); else nav.append(a);
  });
  add('boot', () => {
    const f = $('.cp-foot'); if (f && on('sleep') && !$('a[href="#sleep"]', f)) f.insertAdjacentHTML('afterbegin', '<a href="#sleep">خواب</a>');
  });
  A.tools.unshift({ route: 'sleep', icon: '😴', title: 'خواب', desc: 'راهنما، چک‌لیست، دفترچه و صداهای خواب', show: () => on('sleep') });
  (A.searchExtra = A.searchExtra || []).push(() => !on('sleep') ? [] : [
    ...(S.guide || []).map(c => ({ icon: c.icon || '🌙', title: c.title, sub: 'راهنمای خواب', text: [c.title, c.summary, ...(c.keyPoints || []), String(c.html || '').replace(/<[^>]+>/g, ' ')].join(' '), open: () => openChapter(c.id) })),
    ...(S.myths || []).map(m => ({ icon: '💭', title: m.myth, sub: 'باور درباره‌ی خواب', text: m.myth + ' ' + m.fact, note: m.fact, open: () => A.go('sleep') })),
    { icon: '🎧', title: 'صداهای خواب', sub: 'خواب', text: 'صدا موسیقی باران موج لالایی نویز خواب', open: () => A.go('sleepsounds') },
    { icon: '⏰', title: 'سحرخیز شو', sub: 'خواب', text: 'سحرخیزی زود خوابیدن زود بیدار شدن تیپ خواب', open: () => A.go('sleepplan') },
  ]);
});
