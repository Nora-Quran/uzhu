/* Uzhu move21: a 21-day exercise program in three levels (beginner / intermediate / advanced).
   Day 1 opens when the person picks a level; each next day opens once the previous one is done AND the
   calendar day has changed (the app's 4 a.m. cutoff, A.nightKey). Progress is kept per level, so switching
   back and forth never loses anything. Data: window.UZHU_EXERCISE.m21 (js/exercise.js), poses in js/poses.js.
   State: A.D().m21 = { level, start, done: { dayN: dateKey }, saved: { otherLevel: { start, done } }, byLog }.
   It feeds A.exDay() through the H.exDay hook, so the night checklist, today card and reminders follow the
   chosen level's current day. Admin feature key: 'move21'. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const EX = A.EX, P = EX && EX.m21;
  if (!P) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc, pad = A.pad;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const LV = id => P.levels.find(l => l.id === id) || P.levels[0];
  const TY = t => P.types[t] || { name: t, icon: '✨' };

  /* ---------- state ---------- */
  const st = () => {
    const d = A.D(), m = d.m21 = d.m21 && typeof d.m21 === 'object' ? d.m21 : {};
    if (!m.done || typeof m.done !== 'object') m.done = {};
    if (!m.saved || typeof m.saved !== 'object') m.saved = {};
    if (!m.byLog || typeof m.byLog !== 'object') m.byLog = {};
    return m;
  };
  const ready = () => !!(A.user && A.D() && A.D().profile);
  const active = () => ready() && on('move21') && [1, 2, 3].includes(st().level);
  const today = () => A.nightKey();
  const doneCount = m => Object.keys(m.done).filter(k => m.done[k] && +k >= 1 && +k <= 21).length;
  // 'done' | 'open' | 'tomorrow' (previous day finished today) | 'locked'
  function status(n, m = st()) {
    if (m.done[n]) return 'done';
    if (n === 1) return 'open';
    const p = m.done[n - 1];
    if (!p) return 'locked';
    return p < today() ? 'open' : 'tomorrow';
  }
  const firstUndone = m => { for (let n = 1; n <= 21; n++) if (!m.done[n]) return n; return 22; };
  // The program day that belongs to "today": the one finished today, otherwise the next open one.
  function todayN(m = st()) {
    const n = firstUndone(m);
    if (n > 21) return 21;
    if (n > 1 && m.done[n - 1] === today()) return n - 1;
    return n;
  }
  const finished = m => firstUndone(m) > 21;

  /* ---------- building a day ---------- */
  const amt = x => typeof x[1] === 'string' ? { id: x[0], secs: parseInt(x[1], 10) } : { id: x[0], reps: x[1] };
  const side = id => !!(EX.moves[id] && EX.moves[id].side);
  const secsOf = s => (s.secs || s.reps * 3.5) * (side(s.id) ? 2 : 1);
  function build(lv, n) {
    const D0 = (P.days[lv] || [])[n - 1]; if (!D0) return null;
    const week = Math.min(3, Math.ceil(n / 7));
    const warm = (P.warm[D0.w] || P.warm.std).map(amt), cool = (P.cool[D0.c] || P.cool.breath).map(amt);
    const main = { r: D0.m.r || 1, rest: D0.m.rest || 0, list: D0.m.list.map(amt) };
    const secs = warm.reduce((a, s) => a + secsOf(s), 0) + cool.reduce((a, s) => a + secsOf(s), 0) + main.r * main.list.reduce((a, s) => a + secsOf(s) + main.rest, 0);
    const rest = D0.t === 'rest';
    const walk = P.targets.walk[lv - 1][week - 1] + (rest ? P.targets.restWalk : 0);
    const breath = rest ? P.targets.restBreath : P.targets.breath[week - 1];
    return Object.assign({}, D0, { lv, n, week, warm, cool, main, minutes: Math.max(5, Math.round(secs / 60)), walk, breath });
  }
  // Shape expected by A.exDay() callers (night checklist, today card, reminders, stats).
  function toEx(lv, n) {
    const d = build(lv, n); if (!d) return null;
    return {
      day: n, walk: d.walk, breath: d.breath, note: d.note,
      walkTip: 'پیاده‌روی رو می‌تونی تیکه‌تیکه کنی: چند دقیقه بعد از هر وعده‌ی غذا.',
      routine: { title: `روز ${fa(n)}: ${d.title}`, style: TY(d.t).name, minutes: d.minutes, moves: [...d.main.list, ...d.warm, ...d.cool] },
      m21: { level: lv, n },
    };
  }
  add('exDay', (c, d) => {
    if (!active()) return null;
    const s = A.D(), m = st(), key = `c${c}d${d}`;
    if (c === s.cycle && d >= s.day) {
      let n = todayN(m);
      if (d > s.day) n = Math.min(21, (m.done[n] ? n + 1 : n) + (d - s.day) - 1);
      else if (!m.byLog[key] || m.byLog[key].n !== n || m.byLog[key].lv !== m.level) m.byLog[key] = { lv: m.level, n };
      return toEx(m.level, n);
    }
    const b = m.byLog[key];
    return b ? toEx(b.lv, b.n) : null;
  });

  /* ---------- actions ---------- */
  let sel = null; // day picked on the path (null = today's day)
  async function startLevel(lv, quiet) {
    const m = st();
    if (m.level === lv) return;
    if ([1, 2, 3].includes(m.level)) m.saved[m.level] = { start: m.start, done: m.done };
    const sv = m.saved[lv];
    m.level = lv; m.start = sv?.start || today(); m.done = sv?.done || {};
    delete m.saved[lv];
    sel = null;
    await A.save();
    A.render();
    if (!quiet) A.toast(sv && doneCount(m) ? `برگشتی به سطح «${LV(lv).name}»؛ از روز ${fa(todayN(m))} ادامه می‌دی.` : `سطح «${LV(lv).name}» شروع شد! روز ۱ همین الان بازه 🌱`, null, 'happy');
  }
  async function restartLevel() {
    const m = st(); m.done = {}; m.start = today(); sel = null;
    await A.save(); A.render(); A.toast('از روز ۱ دوباره شروع کردی. این بار با تجربه‌ی بیشتر 💪', null, 'happy');
  }
  async function complete(n, viaPlayer) {
    const m = st();
    if (m.done[n] || status(n, m) !== 'open') return false;
    m.done[n] = today();
    const d = build(m.level, n);
    try {
      const l = A.moveLog(); l.routine = true;
      // Walking inside the session counts toward today's walking minutes too.
      const w = d ? d.main.r * d.main.list.filter(s => /^walk-/.test(s.id) && s.secs).reduce((a, s) => a + s.secs, 0) / 60 : 0;
      if (w >= 1) l.walk = (l.walk || 0) + Math.round(w);
    } catch (e) {}
    sel = null;
    await A.save();
    A.render();
    A.confetti();
    if (n >= 21) A.toast(`هر ۲۱ روز سطح «${LV(m.level).name}» تموم شد! 🎉 به خودت افتخار کن.`, null, 'happy');
    else A.toast(`روز ${fa(n)} تموم شد${viaPlayer ? '' : ' و ثبت شد'}! 🎉 روز ${fa(n + 1)} فردا باز می‌شه.`, null, 'happy');
    return true;
  }
  // Ticking "I did today's session" on the night checklist counts as finishing today's open day.
  add('nightSubmit', log => {
    if (!active() || !log || !log.move || !log.move[2]) return;
    const m = st(), n = todayN(m);
    if (!m.done[n] && status(n, m) === 'open') m.done[n] = today();
  });

  /* ---------- views ---------- */
  const amountTxt = s => `${s.reps ? `${fa(s.reps)} بار` : `${fa(s.secs)} ثانیه`}${side(s.id) ? ' هر طرف' : ''}`;
  const moveBtn = s => { const M = EX.moves[s.id] || {}; return `<button type="button" class="mini m21-mv" data-mv="${esc(s.id)}">${A.fig(s.id)}<span class="small"><b>${esc(M.name || s.id)}</b><br><span class="muted">${amountTxt(s)}</span></span></button>`; };
  const levelCards = (curLv, prog, attr) => P.levels.map(l => `<button type="button" class="card m21-lv ${l.id === curLv ? 'cur' : ''}" ${attr}="${l.id}"><span class="m21-lv-i" aria-hidden="true">${l.icon}</span><b>${esc(l.name)}${l.id === curLv ? ' (الان)' : ''}</b><span class="small">${esc(l.short)}</span><span class="small muted">${esc(l.desc)}</span>${prog && prog(l.id) ? `<span class="chip mint">${fa(prog(l.id))} از ۲۱ روز انجام شده</span>` : ''}${attr === 'data-m21lv' ? `<span class="btn primary m21-lv-go">شروع ${esc(l.name)}</span>` : ''}</button>`).join('');

  function startCard() {
    return `<div class="card pop stack m21-start" style="gap:14px">
      <div class="row m21-start-top"><div class="fig m21-start-fig" data-pose="str-squat"></div>
        <div class="stack" style="gap:4px;min-width:0;flex:1"><span class="eyebrow">تازه: برنامه‌ی ۲۱ روزه‌ی ورزش</span><h3>هر روز یه قدم، به اندازه‌ی بدن خودت</h3>
        <p class="small muted">پیاده‌روی، قدرتی با وزن بدن، کشش، شکم و تعادل؛ هر روز با گرم کردن و سرد کردن. روز ۱ همین الان باز می‌شه و هر روز بعدی، فردای همون روزی که تمومش کردی. سطحت رو انتخاب کن:</p></div></div>
      <div class="m21-levels">${levelCards(0, null, 'data-m21lv')}</div>
      <button type="button" class="btn ghost" id="m21quiz">🤔 نمی‌دونی کدوم؟ سه تا سؤال کوتاه</button>
    </div>`;
  }

  function pathHtml(m, cur) {
    const tn = todayN(m);
    let html = '';
    for (let w = 0; w < 3; w++) {
      html += `<div class="m21-week"><span class="m21-wk small muted">هفته‌ی ${fa(w + 1)}</span><div class="m21-row">`;
      for (let i = 1; i <= 7; i++) {
        const n = w * 7 + i, s = status(n, m), d = (P.days[m.level] || [])[n - 1] || {}, ty = TY(d.t);
        const cls = ['m21-node', s, n === cur ? 'sel' : '', n === tn && s !== 'done' ? 'now' : ''].join(' ').trim();
        const lbl = s === 'done' ? 'انجام شد' : s === 'open' ? 'بازه' : s === 'tomorrow' ? 'فردا باز می‌شه' : 'قفله';
        html += `<button type="button" class="${cls}" data-m21d="${n}" aria-label="روز ${fa(n)}، ${esc(ty.name)}، ${lbl}"${n === cur ? ' aria-current="true"' : ''}><span class="m21-n">${s === 'done' ? '✓' : s === 'open' ? fa(n) : '🔒'}</span><span class="m21-ti" aria-hidden="true">${s === 'locked' || s === 'tomorrow' ? fa(n) : ty.icon}</span>${s === 'tomorrow' ? '<span class="m21-tom">فردا باز می‌شه</span>' : ''}</button>`;
      }
      html += '</div></div>';
    }
    return `<div class="card m21-path" role="group" aria-label="مسیر ۲۱ روزه">${html}</div>`;
  }

  function dayCard(m, n) {
    const d = build(m.level, n); if (!d) return '';
    const s = status(n, m), ty = TY(d.t), doneAt = m.done[n];
    const sec = (t, sub, list) => `<div class="m21-sec"><div class="m21-sec-h"><b>${t}</b>${sub ? `<span class="small muted">${sub}</span>` : ''}</div><div class="routine-list m21-list">${list.map(moveBtn).join('')}</div></div>`;
    return `<div class="card stack m21-day ${s === 'done' ? 'done-card' : ''}" style="gap:12px" id="m21day">
      <div class="row" style="justify-content:space-between;gap:8px"><div class="stack" style="gap:2px;min-width:0"><span class="eyebrow">روز ${fa(n)} از ۲۱${n === todayN(m) ? '، برنامه‌ی امروز' : ''}</span><h3>${ty.icon} ${esc(d.title)}</h3></div>
        <div class="row" style="gap:6px"><span class="chip lav">${esc(ty.name)}</span><span class="chip">حدود ${fa(d.minutes)} دقیقه</span></div></div>
      ${d.note ? `<p class="small muted">${esc(d.note)}</p>` : ''}
      <div class="m21-secs">
        ${sec('۱. گرم کردن', 'آروم شروع کن', d.warm)}
        ${sec('۲. تمرین اصلی', `${d.main.r > 1 ? fa(d.main.r) + ' دور' : 'یک دور'}${d.main.rest ? `، ${fa(d.main.rest)} ثانیه استراحت بین حرکت‌ها` : ''}`, d.main.list)}
        ${sec('۳. سرد کردن', 'کشش و نفس', d.cool)}
      </div>
      <p class="small muted">روی هر حرکت بزن تا ببینی دقیقاً چطوری انجامش بدی و اشتباه رایجش چیه.</p>
      ${s === 'done'
        ? `<div class="row"><span class="chip mint">✓ انجامش دادی${doneAt === today() ? '، همین امروز' : ''}</span><button type="button" class="btn ghost" id="m21play">↻ دوباره تمرین کن</button></div>`
        : `<div class="row"><button type="button" class="btn berry big" id="m21play">▶ شروع با راهنما</button><button type="button" class="btn ghost" id="m21done">✓ انجامش دادم</button></div>`}
    </div>`;
  }

  function finishCard(m) {
    const next = P.levels.find(l => l.id === m.level + 1);
    return `<div class="card pop stack m21-fin" style="gap:10px;text-align:center"><span style="font-size:2.4rem" aria-hidden="true">🏆</span><h3>۲۱ روز سطح «${esc(LV(m.level).name)}» تموم شد!</h3>
      <p class="small muted">یعنی ۲۱ جلسه که به خودت قول دادی و انجامش دادی. ${next ? `اگه حس می‌کنی حرکت‌ها راحت شدن، وقت سطح «${esc(next.name)}» رسیده.` : 'می‌تونی همین سطح رو دوباره از اول بری؛ این بار با تکرارهای راحت‌تر.'}</p>
      <div class="row" style="justify-content:center">${next ? `<button type="button" class="btn primary" data-m21lv="${next.id}">شروع سطح ${esc(next.name)}</button>` : ''}<button type="button" class="btn ghost" id="m21again">دوباره از روز ۱</button></div></div>`;
  }
  const curDay = m => (sel && ['done', 'open'].includes(status(sel, m)) ? sel : todayN(m));

  add('moveProgram', () => {
    if (!ready() || !on('move21')) return '';
    if (!active()) return startCard();
    const m = st(), tn = todayN(m), cnt = doneCount(m), cur = curDay(m), fu = firstUndone(m);
    const tom = fu <= 21 && status(fu, m) === 'tomorrow';
    return `<div class="stack m21" style="gap:12px">
      <div class="card pop m21-head"><div class="stack" style="gap:2px;min-width:0"><span class="eyebrow">برنامه‌ی ۲۱ روزه، سطح ${esc(LV(m.level).name)} ${LV(m.level).icon}</span>
        <b>${finished(m) ? 'همه‌ی ۲۱ روز انجام شد 🎉' : tom ? `روز ${fa(tn)} امروز انجام شد ✓ روز ${fa(tn + 1)} فردا صبح باز می‌شه` : `امروز نوبت روز ${fa(tn)}ه`}</b>
        <span class="small muted">${fa(cnt)} از ۲۱ روز انجام شده</span></div>
        <div class="progress m21-prog"><i style="width:${cnt / 21 * 100}%"></i></div>
        <button type="button" class="btn ghost m21-chg" id="m21lvl">تغییر سطح</button></div>
      ${finished(m) ? finishCard(m) : ''}
      ${pathHtml(m, cur)}
      ${dayCard(m, cur)}
      <details class="card m21-safe"><summary><b>⚠️ قبل از شروع، نکته‌های ایمنی</b></summary><ul class="small">${(EX.safety || []).map(x => `<li>${esc(x)}</li>`).join('')}<li>حرکت‌های پرشی همیشه یه نسخه‌ی بدون پرش دارن؛ زانوهات و همسایه‌ی طبقه‌ی پایین هر دو ازت ممنون می‌شن.</li><li>اگه یه روز نتونستی، اشکالی نداره؛ روزها منتظرت می‌مونن و از همون‌جا ادامه می‌دی.</li></ul></details>
    </div>`;
  });

  add('mount', r => {
    if (r !== 'move' || !ready() || !on('move21')) return;
    $$('[data-m21lv]').forEach(b => b.onclick = () => startLevel(Number(b.dataset.m21lv)));
    const q = $('#m21quiz'); if (q) q.onclick = () => levelModal(true);
    if (!active()) return;
    const m = st(), cur = curDay(m);
    $$('[data-m21d]').forEach(b => b.onclick = () => {
      const n = Number(b.dataset.m21d), s = status(n, m);
      if (s === 'tomorrow') return A.toast(`روز ${fa(n)} فردا صبح باز می‌شه. امروز کارت رو کردی؛ استراحت هم بخشی از تمرینه 🌙`, 'moon');
      if (s === 'locked') return A.toast(`روز ${fa(n)} هنوز قفله. روزها یکی‌یکی و هر روز یکی باز می‌شن.`, 'bell');
      sel = n; A.render();
      setTimeout(() => { const el = $('#m21day'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
    });
    const lv = $('#m21lvl'); if (lv) lv.onclick = () => levelModal(false);
    const ag = $('#m21again'); if (ag) ag.onclick = restartLevel;
    const pl = $('#m21play'); if (pl) pl.onclick = () => openPlayer(m.level, cur);
    const dn = $('#m21done'); if (dn) dn.onclick = () => complete(cur, false);
  });

  /* ---------- level picker + self-check ---------- */
  function levelModal(quizFirst) {
    const m = st(), curLv = active() ? m.level : 0;
    const prog = id => id === curLv ? doneCount(m) : m.saved[id] ? Object.keys(m.saved[id].done || {}).length : 0;
    A.modal(`<div class="stack m21-modal" style="gap:14px"><span class="eyebrow">سطح برنامه‌ی ورزش</span><h2>کدوم سطح به بدنت می‌خوره؟</h2>
      <p class="small muted">هر وقت خواستی می‌تونی سطح رو عوض کنی. پیشرفت هر سطح جدا نگه داشته می‌شه؛ اگه برگردی، از همون روزی که بودی ادامه می‌دی.</p>
      <div class="m21-levels">${levelCards(curLv, prog, 'data-m21pick')}</div>
      <details class="card m21-quiz" ${quizFirst ? 'open' : ''}><summary><b>🤔 سه تا سؤال کوتاه برای پیدا کردن سطحت</b></summary>
        <form id="m21qf" class="stack" style="gap:12px;margin-top:10px">${P.quiz.map((x, i) => `<fieldset class="m21-q"><legend class="small"><b>${fa(i + 1)}. ${esc(x.q)}</b></legend><div class="m21-opts">${x.a.map((a, j) => `<label class="m21-opt"><input type="radio" name="q${i}" value="${j}" required><span>${esc(a)}</span></label>`).join('')}</div></fieldset>`).join('')}
          <button type="submit" class="btn primary">پیشنهادم کدومه؟</button><div id="m21qr" aria-live="polite"></div></form></details>
      ${curLv && doneCount(m) ? `<button type="button" class="btn ghost" id="m21reset">↺ این سطح رو از روز ۱ دوباره شروع کن</button>` : ''}
      <p class="small muted">${esc((EX.safety || [])[0] || '')}</p></div>`, (el, close) => {
      $$('[data-m21pick]', el).forEach(b => b.onclick = () => { const id = Number(b.dataset.m21pick); close(); if (id !== curLv) startLevel(id); });
      const rs = $('#m21reset', el); if (rs) rs.onclick = () => { if (rs.dataset.sure) { close(); restartLevel(); } else { rs.dataset.sure = 1; rs.textContent = 'مطمئنی؟ یه بار دیگه بزن تا از اول شروع بشه'; } };
      $('#m21qf', el).onsubmit = e => {
        e.preventDefault();
        const sc = P.quiz.reduce((a, x, i) => a + Number((el.querySelector(`input[name=q${i}]:checked`) || {}).value || 0), 0);
        const id = sc <= 1 ? 1 : sc <= 4 ? 2 : 3, l = LV(id);
        $('#m21qr', el).innerHTML = `<div class="card stack m21-res" style="gap:6px"><b>پیشنهاد ما: سطح ${esc(l.name)} ${l.icon}</b><span class="small muted">${id === 1 ? 'از پایه شروع کن؛ بدنت خیلی زود جواب می‌ده و هر وقت خواستی سطح رو بالا می‌بری.' : id === 2 ? 'یه پایه‌ی خوب داری. اگه هفته‌ی اول زیادی سخت بود، بی‌خیال برگرد به مبتدی.' : 'بدنت آماده‌ی کار جدی‌تره. فقط فرم درست رو فدای سرعت نکن.'} اگه درد یا بیماری خاصی داری، مبتدی رو انتخاب کن و با پزشکت مشورت کن.</span>
          ${id === curLv ? '<span class="chip mint">همین الان توی این سطحی 👌</span>' : `<button type="button" class="btn primary" id="m21qgo">شروع سطح ${esc(l.name)}</button>`}</div>`;
        const g = $('#m21qgo', el); if (g) g.onclick = () => { close(); startLevel(id); };
      };
    });
  }

  /* ---------- guided player ---------- */
  let actx = null;
  function beep(f = 660, ms = 120) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; g.gain.value = .06;
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + ms / 1000);
    } catch (e) {}
  }
  function stepsFor(d) {
    const out = [], push = (phase, s, extra) => out.push(Object.assign({ phase, id: s.id, reps: s.reps, secs: s.secs ? s.secs * (side(s.id) ? 2 : 1) : 0, half: !!(s.secs && side(s.id)), base: s }, extra || {}));
    d.warm.forEach(s => push('گرم کردن', s));
    out.push({ rest: true, secs: 15, phase: 'آماده‌ی تمرین اصلی' });
    for (let r = 1; r <= d.main.r; r++) {
      d.main.list.forEach((s, i) => {
        push('تمرین اصلی', s, { round: r, rounds: d.main.r });
        const last = i === d.main.list.length - 1;
        if (last && r < d.main.r) out.push({ rest: true, secs: Math.max(45, d.main.rest), phase: 'استراحت بین دورها' });
        else if (!last && d.main.rest) out.push({ rest: true, secs: d.main.rest, phase: 'استراحت' });
      });
    }
    out.push({ rest: true, secs: 10, phase: 'وقت سرد کردن' });
    d.cool.forEach(s => push('سرد کردن', s));
    return out;
  }
  function openPlayer(lv, n) {
    const d = build(lv, n); if (!d) return;
    const steps = stepsFor(d), total = steps.length;
    let i = 0, left = 0, paused = false, iv = null, done = false;
    A.modal(`<div class="stack m21-player" style="gap:8px;text-align:center"><span class="eyebrow">روز ${fa(n)}، ${esc(d.title)}</span>
      <div class="progress"><i id="m21pb" style="width:0"></i></div>
      <span class="chip lav m21-phase" id="m21ph"></span>
      <div id="m21pf" class="m21-pfig"></div>
      <h3 id="m21pn"></h3><span class="small muted" id="m21pr"></span>
      <div class="timer num" id="m21pt" aria-live="polite"></div><span class="small m21-swap" id="m21ps"></span>
      <p class="small muted" id="m21pc"></p>
      <div class="row m21-ctrl"><button type="button" class="btn ghost" id="m21prev" aria-label="حرکت قبلی">⏮ قبلی</button><button type="button" class="btn primary big" id="m21main"></button><button type="button" class="btn ghost" id="m21next" aria-label="حرکت بعدی">بعدی ⏭</button></div>
      <span class="small muted" id="m21pnx"></span>
      <details class="m21-how" id="m21how"><summary class="small"><b>چطوری انجامش بدم؟</b></summary><div id="m21hw" class="small" style="text-align:start"></div></details></div>`, (el, close) => {
      const g = id => $(id, el);
      const nameOf = id => (EX.moves[id] || {}).name || id;
      const fmt = s => fa(`${pad(Math.floor(s / 60))}:${pad(s % 60)}`);
      const tick = () => {
        const s = steps[i];
        if (s.secs) g('#m21pt').textContent = fmt(Math.max(0, left));
        if (s.half) g('#m21ps').textContent = left <= s.secs / 2 ? '🔁 حالا طرف دیگه' : 'طرف اول';
      };
      const show = () => {
        clearInterval(iv); iv = null; paused = false;
        const s = steps[i], M = EX.moves[s.id] || {};
        g('#m21pb').style.width = (i / total * 100) + '%';
        g('#m21ph').textContent = s.rest ? s.phase : s.round ? `${s.phase}، دور ${fa(s.round)} از ${fa(s.rounds)}` : s.phase;
        const nx = steps.slice(i + 1).find(x => !x.rest);
        g('#m21pnx').textContent = nx ? `بعدی: ${nameOf(nx.id)}` : 'این آخرین حرکته 💪';
        g('#m21ps').textContent = '';
        if (s.rest) {
          g('#m21pf').innerHTML = `<div class="m21-rest"><span aria-hidden="true">💧</span><span class="small muted">نفس بگیر، یه قلپ آب بخور</span></div>`;
          g('#m21pn').textContent = 'استراحت'; g('#m21pr').textContent = '';
          g('#m21pc').textContent = nx ? (EX.moves[nx.id]?.cue || '') : '';
          g('#m21how').hidden = true;
        } else {
          g('#m21pf').innerHTML = A.fig(s.id, 'big');
          g('#m21pn').textContent = M.name || s.id;
          g('#m21pr').textContent = amountTxt(s.base);
          g('#m21pc').textContent = M.cue || '';
          g('#m21how').hidden = false; g('#m21how').open = false;
          g('#m21hw').innerHTML = `<ol class="steps">${(M.how || []).map(h => `<li>${esc(h)}</li>`).join('')}</ol>${M.avoid ? `<p><b>اشتباه رایج:</b> ${esc(M.avoid)}</p>` : ''}${M.easier ? `<p><b>آسون‌ترش:</b> ${esc(M.easier)}</p>` : ''}`;
          if (A.POSE) A.POSE.animate();
        }
        if (s.secs) {
          left = s.secs; g('#m21main').textContent = s.rest ? 'رد کردن استراحت ⏭' : '⏸ مکث'; tick();
          iv = setInterval(() => {
            if (paused) return;
            left--;
            if (steps[i].half && left === Math.floor(steps[i].secs / 2)) beep(880, 200);
            if (left > 0 && left <= 3) beep(520, 80);
            if (left <= 0) { beep(760, 220); go(i + 1); } else tick();
          }, 1000);
        } else {
          g('#m21pt').textContent = fa(s.reps) + ' بار'; g('#m21main').textContent = '✓ انجام دادم';
        }
        g('#m21prev').disabled = i === 0;
      };
      const finish = async () => {
        if (done) return; done = true; clearInterval(iv); close();
        const ok = await complete(n, true);
        if (!ok) { try { A.moveLog().routine = true; await A.save(); } catch (e) {} A.confetti(); A.toast('یه جلسه‌ی دیگه! بدنت ازت ممنونه 💪', null, 'happy'); }
      };
      const go = k => { if (k >= total) return finish(); i = Math.max(0, k); show(); };
      g('#m21main').onclick = () => {
        const s = steps[i];
        if (s.rest || !s.secs) return go(i + 1);
        paused = !paused; g('#m21main').textContent = paused ? '▶ ادامه' : '⏸ مکث';
      };
      g('#m21next').onclick = () => go(i + 1);
      g('#m21prev').onclick = () => go(i - 1);
      el._cleanup = () => clearInterval(iv);
      show();
    });
  }

  // Small API for other modules and tests.
  A.m21 = { status, todayN, build, toEx, startLevel, complete, openPlayer, levelModal, steps: d => stepsFor(d) };
});
