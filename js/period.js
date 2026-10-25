/* Uzhu period calendar (plugin «تقویم پریود», route #period, admin feature key 'period').
   Opt-in only: a toggle in Settings and a one-time gentle card on Today. Nothing period-related shows until enabled.
   Logging (flow, symptoms, mood) on a Jalali month calendar, predictions from the last up to 6 cycles, a phase ring,
   nutrition by phase tied to sugar cravings, evidence-based articles with sources, and a reminder 2 days before.
   State: A.D().period = { on, asked, rem, typical:{cycle,len}, days:{dateKey:{flow,sym,mood}}, starts:[dateKey], done }
   (starts is derived from the flow days and kept in sync; done = start of the period the user marked as finished). */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const signed = () => !!(A.user && A.D() && A.D().profile);
  const raw = () => (signed() && A.D().period) || null;
  const enabled = () => on('period') && !!raw()?.on;
  const P = () => {
    const d = A.D(), p = d.period = d.period && typeof d.period === 'object' ? d.period : {};
    p.typical = Object.assign({ cycle: 28, len: 5 }, p.typical || {});
    if (!p.days || typeof p.days !== 'object') p.days = {};
    if (!Array.isArray(p.starts)) p.starts = [];
    return p;
  };

  /* ---------- dates ---------- */
  const key = d => A.dateKey(d);
  const parse = k => new Date(k + 'T12:00');
  const addD = (k, n) => { const d = parse(k); d.setDate(d.getDate() + n); return key(d); };
  const diff = (a, b) => A.dayDiff(a, b); // b - a, in days
  const today = () => key(new Date());
  const fmt = o => { try { return new Intl.DateTimeFormat('fa-IR-u-ca-persian', o); } catch (e) { return null; } };
  const F_DM = fmt({ day: 'numeric', month: 'long' }), F_WDM = fmt({ weekday: 'long', day: 'numeric', month: 'long' }), F_MY = fmt({ month: 'long', year: 'numeric' });
  let F_NUM = null; try { F_NUM = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }); } catch (e) {}
  const jdm = k => F_DM ? F_DM.format(parse(k)) : fa(k);
  const jwdm = k => F_WDM ? F_WDM.format(parse(k)) : fa(k);
  const jparts = d => { const o = {}; if (F_NUM) F_NUM.formatToParts(d).forEach(x => { o[x.type] = x.value; }); return { y: parseInt(o.year, 10) || d.getFullYear(), m: parseInt(o.month, 10) || d.getMonth() + 1, d: parseInt(o.day, 10) || d.getDate() }; };
  const rel = n => n === 0 ? 'امروز' : n === 1 ? 'فردا' : n === 2 ? 'پس‌فردا' : n > 0 ? `${fa(n)} روز دیگه` : n === -1 ? 'دیروز' : `${fa(-n)} روز پیش`;

  /* ---------- labels ---------- */
  const FLOW = [[0, 'هیچ'], [1, 'کم'], [2, 'متوسط'], [3, 'زیاد']];
  const SYM = [['cramps', 'دل‌درد و گرفتگی', '〰️'], ['bloat', 'نفخ', '🎈'], ['head', 'سردرد', '🤕'], ['breast', 'حساسیت سینه', '💗'], ['mood', 'نوسان خلق', '🎢'], ['tired', 'خستگی', '🥱'], ['acne', 'جوش', '🔴'], ['crave', 'هوس شیرینی', '🍫'], ['back', 'کمردرد', '🦴'], ['nausea', 'تهوع', '🤢'], ['sleep', 'خواب بد', '🌙']];
  const MOOD = [['good', 'خوب', '😊'], ['calm', 'آروم', '😌'], ['energy', 'پرانرژی', '⚡'], ['meh', 'بی‌حوصله', '😕'], ['sad', 'غمگین', '😢'], ['angry', 'زودرنج', '😠'], ['anx', 'نگران', '😟']];
  const symName = id => (SYM.find(s => s[0] === id) || [, id])[1];
  const PH = {
    men: { name: 'قاعدگی', color: '#e98da0', soft: 'var(--pd-men-s)', icon: '🌸', short: 'روزهای پریود' },
    fol: { name: 'فولیکولی', color: '#97c79f', soft: 'var(--pd-fol-s)', icon: '🌱', short: 'انرژی کم‌کم بالا میاد' },
    ovu: { name: 'تخمک‌گذاری', color: '#efc95f', soft: 'var(--pd-ovu-s)', icon: '🌼', short: 'وسط چرخه' },
    lut: { name: 'لوتئال', color: '#f1a57c', soft: 'var(--pd-lut-s)', icon: '🍂', short: 'نیمه‌ی دوم چرخه' },
  };

  /* ---------- derived cycle data ---------- */
  // A period is a run of days with flow; one missing day inside a run still counts as the same period.
  function periods(p) {
    const ks = Object.keys(p.days).filter(k => (p.days[k].flow || 0) > 0).sort(), out = [];
    let g = null;
    ks.forEach(k => { if (g && diff(g.end, k) <= 2) { g.end = k; g.n++; } else { g = { start: k, end: k, n: 1 }; out.push(g); } });
    return out;
  }
  const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  const span = g => diff(g.start, g.end) + 1;
  function calc(p = P(), t = today()) {
    const g = periods(p).filter(x => x.start <= t), starts = g.map(x => x.start);
    const cycles = starts.slice(1).map((s, i) => diff(starts[i], s));
    const recent = cycles.slice(-6), valid = recent.filter(c => c >= 15 && c <= 90);
    const C = valid.length >= 2 ? Math.round(mean(valid)) : p.typical.cycle;
    const last = g[g.length - 1] || null;
    const cd = last ? diff(last.start, t) + 1 : 0;
    const open = L0 => !!last && p.done !== last.start && cd <= 12 && (diff(last.end, t) <= 1 || cd <= L0);
    const finished = open(p.typical.len) ? g.slice(0, -1) : g;
    const lens = finished.filter(x => span(x) >= 2 || p.done === x.start).map(span).slice(-6).filter(l => l <= 15);
    const L = Math.max(1, Math.min(lens.length >= 2 ? Math.round(mean(lens)) : p.typical.len, C - 5));
    const ongoing = open(L);
    const pEnd = last ? (ongoing && diff(last.end, addD(last.start, L - 1)) > 0 ? addD(last.start, L - 1) : last.end) : null;
    const O = Math.max(L + 1, C - 14); // estimated ovulation day of the cycle (luteal phase ~14 days)
    const next = last ? addD(last.start, C) : null;
    const late = last && !ongoing && cd > C ? cd - C : 0;
    let phase = null, pms = false;
    if (last) {
      if (ongoing || t <= pEnd) phase = 'men';
      else if (cd < O - 2) phase = 'fol';
      else if (cd <= O + 1) phase = 'ovu';
      else { phase = 'lut'; pms = cd > C - 7; }
    }
    // the next estimated fertile window that has not ended yet (ovulation day -5 … +1)
    let fert = null;
    if (last) for (let i = 0; i < 4 && !fert; i++) {
      const N = late ? addD(t, 1 + i * C) : addD(next, i * C), ov = addD(N, -14), w = { start: addD(ov, -5), ov, end: addD(ov, 1) };
      if (w.end >= t && ov > pEnd) fert = w;
    }
    const spread = valid.length >= 2 ? Math.max(...valid) - Math.min(...valid) : 0;
    const outRange = recent.filter(c => c < 21 || c > 35);
    const longP = lens.filter(l => l > 7).length;
    return { g, starts, cycles: recent, C, L, O, last, cd, ongoing, pEnd, next, late, phase, pms, fert, spread, outRange, longP, dataC: valid.length >= 2, dataL: lens.length >= 2 };
  }
  const phaseName = c => c.phase ? (c.phase === 'lut' && c.pms ? 'لوتئال (پیش از قاعدگی)' : PH[c.phase].name) : '';
  // Phase of any logged day, for the symptom patterns.
  function phaseAt(k, c) {
    const s = c.starts.filter(x => x <= k).pop(); if (!s) return null;
    const i = c.starts.indexOf(s), nx = c.starts[i + 1], len = nx ? diff(s, nx) : c.C;
    const d = diff(s, k) + 1, O = Math.max(c.L + 1, len - 14);
    if (k <= c.g[i].end || (i === c.g.length - 1 && c.ongoing && k <= c.pEnd)) return 'men';
    if (d < O - 2) return 'fol'; if (d <= O + 1) return 'ovu'; return 'lut';
  }
  // Drop empty entries and keep the stored starts list in sync with the logged days.
  function sync(p) {
    Object.keys(p.days).forEach(k => { const v = p.days[k]; if (!v.flow) delete v.flow; if (!v.sym || !v.sym.length) delete v.sym; if (!v.mood) delete v.mood; if (!Object.keys(v).length) delete p.days[k]; });
    p.starts = periods(p).map(x => x.start);
    if (p.done && !p.starts.includes(p.done)) delete p.done;
  }
  const day = (p, k) => (p.days[k] = p.days[k] || {});

  /* ---------- watercolor art ---------- */
  let uid = 0;
  const filt = id => `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="3" result="g"/><feColorMatrix in="g" type="saturate" values="0" result="gg"/><feComposite in="gg" in2="d" operator="in" result="gm"/><feBlend in="d" in2="gm" mode="multiply" result="b"/><feComposite in="b" in2="d" operator="atop"/></filter>`;
  const face = (x, y, s = 1) => `<g transform="translate(${x.toFixed ? x.toFixed(1) : x} ${y.toFixed ? y.toFixed(1) : y}) scale(${s})"><circle cx="-6" cy="-2" r="1.8" fill="#5a4040"/><circle cx="6" cy="-2" r="1.8" fill="#5a4040"/><path d="M-3.5 3 q3.5 3.2 7 0" fill="none" stroke="#6b4f4f" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="-10" cy="3" rx="3" ry="1.8" fill="#f28fa5" opacity=".6"/><ellipse cx="10" cy="3" rx="3" ry="1.8" fill="#f28fa5" opacity=".6"/></g>`;
  function flower(size = 96) {
    const id = `wc-pd-fl-${++uid}`;
    const petals = [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} 50 50)"><ellipse cx="50" cy="24" rx="17" ry="22" fill="#f4a7b6" opacity=".55"/><ellipse cx="50" cy="20" rx="13" ry="16" fill="#ee8fa3" opacity=".35"/><ellipse cx="46" cy="16" rx="5" ry="7" fill="#fff" opacity=".25"/></g>`).join('');
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" class="pd-flower"><defs>${filt(id)}</defs><g filter="url(#${id})">${petals}<circle cx="50" cy="50" r="19" fill="#f8d979" opacity=".85"/><circle cx="53" cy="53" r="15" fill="#f2c45a" opacity=".45"/></g>${face(50, 50, .9)}</svg>`;
  }
  function ring(c, size = 220, mini = false) {
    const id = `wc-pd-ring-${++uid}`, r = 82, cx = 110, cir = 2 * Math.PI * r, C = Math.max(c.C, c.cd), Lp = Math.max(c.L, diff(c.last.start, c.pEnd) + 1);
    const segs = [['men', 1, Lp], ['fol', Lp + 1, c.O - 3], ['ovu', Math.max(Lp + 1, c.O - 2), c.O + 1], ['lut', c.O + 2, C]].filter(s => s[2] >= s[1]);
    const arc = (a, b, col, w, op) => `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}" stroke-dasharray="${Math.max(1, (b - a + 1) / C * cir - 2).toFixed(1)} ${cir.toFixed(1)}" stroke-dashoffset="${(-(a - 1) / C * cir).toFixed(1)}" transform="rotate(-90 ${cx} ${cx})"/>`;
    const ang = ((Math.min(c.cd, C) - .5) / C) * 2 * Math.PI - Math.PI / 2, mx = cx + r * Math.cos(ang), my = cx + r * Math.sin(ang);
    const label = `روز ${fa(c.cd)} از چرخه، فاز ${phaseName(c)}${c.late ? `، ${fa(c.late)} روز دیرکرد` : ''}`;
    return `<svg viewBox="0 0 220 220" width="${size}" height="${size}" class="pd-ring" role="img" aria-label="${esc(label)}"><defs>${filt(id)}</defs>
      <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--pd-track)" stroke-width="26"/>
      <g filter="url(#${id})">${segs.map(([k, a, b]) => arc(a, b, PH[k].color, 26, .55) + arc(a, b, PH[k].color, 13, .6)).join('')}</g>
      <g filter="url(#${id})"><circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="18" fill="#fff6f2"/><circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="15" fill="${PH[c.phase].color}" opacity=".95"/></g>${face(mx, my + 1, .62)}
      ${mini ? `<text x="110" y="128" text-anchor="middle" class="pd-rt1 pd-rtm">${fa(c.cd)}</text>` : `<text x="110" y="100" text-anchor="middle" class="pd-rt1">روز ${fa(c.cd)}</text>
      <text x="110" y="124" text-anchor="middle" class="pd-rt2">از چرخه‌ی ~${fa(c.C)} روزه</text>
      <text x="110" y="148" text-anchor="middle" class="pd-rt3">${esc(PH[c.phase].icon + ' ' + PH[c.phase].name)}</text>`}</svg>`;
  }

  /* ---------- content: tips, nutrition, articles ---------- */
  const TIPS = {
    men: ['کیسه‌ی آب گرم یا حوله‌ی گرم روی شکم، توی مطالعه‌ها تقریباً هم‌اندازه‌ی مسکن‌های ساده دل‌درد رو کم کرده.', 'این روزها یه وعده غذای آهن‌دار مثل عدسی، خورش قیمه یا کوکوسبزی بخور و کنارش یه چیز ویتامین C‌دار، مثل نارنگی یا آبلیمو تازه.', 'چای رو یکی دو ساعت بعد از غذا بخور، نه همراهش؛ چای جذب آهن غذا رو کم می‌کنه.', 'یه پیاده‌روی آروم ۱۵ دقیقه‌ای یا چند حرکت کشش ملایم، برای خیلی‌ها گرفتگی رو کمتر می‌کنه.', 'دمنوش زنجبیل یا دارچین بدون قند، هم گرمت می‌کنه هم جای نوشیدنی شیرین رو می‌گیره.', 'اگه مسکن می‌خوری (مثل ایبوپروفن یا مفنامیک‌اسید)، همون اول درد و طبق بروشور بخور، با غذا. معده‌درد یا آسم داری؟ اول با داروساز چک کن.', 'آب کافی بخور؛ کم‌آبی سردرد و خستگی این روزها رو بیشتر می‌کنه.', 'اگه هر ۱ تا ۲ ساعت پد عوض می‌کنی یا لخته‌های درشت می‌بینی، این رو به پزشک بگو. پریود سنگین درمان داره.'],
    fol: ['انرژی‌ات معمولاً این روزها بیشتره؛ وقت خوبیه یه رسپی بی‌قند تازه امتحان کنی یا برای هفته‌ی بعد میان‌وعده آماده کنی.', 'صبحانه‌ی پروتئین‌دار (تخم‌مرغ، پنیر و گردو، ماست ساده) قند خونت رو تا ظهر آروم نگه می‌داره.', 'حبوبات، سبزی و غلات سبوس‌دار رو با هم بچین؛ فیبر به سیری و میکروب‌های خوب روده کمک می‌کنه.', 'اگه حالش رو داری، این روزها برای ورزش‌های پرتحرک‌تر هم خوبن؛ ولی اگه حس نکردی، اصلاً اشکالی نداره.', 'خوراکی‌های تخمیری مثل ماست، کشک و دوغ کم‌نمک رو توی برنامه‌ات داشته باش.', 'آهنی که توی پریود از دست دادی رو با غذاهای آهن‌دار و ویتامین C جبران کن.'],
    ovu: ['وسط چرخه بعضی‌ها یه درد خفیف یک‌طرفه‌ی زیر شکم حس می‌کنن (درد تخمک‌گذاری). معمولاً بی‌خطره؛ اگه شدید بود، به پزشک بگو.', 'سالاد رنگی، سبزی خوردن و میوه‌ی کامل؛ فیبر و آنتی‌اکسیدان برای همه‌ی روزهای چرخه خوبه.', 'آب بیشتر بخور، مخصوصاً اگه ورزش می‌کنی یا هوا گرمه.', 'یادت باشه: پنجره‌ی باروری که اینجا می‌بینی یه تخمینه و روش جلوگیری از بارداری نیست.', 'ماهی، مرغ، تخم‌مرغ یا حبوبات توی هر وعده، سیری‌ات رو طولانی‌تر می‌کنه.'],
    lut: ['هوس شیرینی این روزها واقعیه و تقصیر تو نیست. بهترین دفاع: وعده‌های منظم هر ۳ تا ۴ ساعت، با پروتئین و فیبر.', 'یه مشت بادام، تخمه کدو یا یه قاشق ارده؛ منیزیم دارن و کمک می‌کنن تا وعده‌ی بعد سیر بمونی.', 'اگه شکلات می‌خوای، یه مربع کوچیک شکلات تلخ ۷۰٪ یا بیشتر، آروم و با حوصله، کنار چند تا گردو.', 'نمک رو کمتر کن (ترشی، چیپس، پنیر شور، سوسیس)؛ نفخ و احساس سنگینی کمتر می‌شه.', 'کافئین رو بعد از ظهر کم کن؛ خواب این روزها حساس‌تره و کم‌خوابی هوس شیرینی رو بیشتر می‌کنه.', 'لبنیات یا کشک و ارده (کلسیم) و کمی آفتاب (ویتامین D)؛ کلسیم توی کارآزمایی‌ها علائم PMS رو کم کرده.', 'ماهی چرب مثل قزل‌آلا یا گردو و بذر کتان، برای امگا ۳.', 'برنامه‌ی «اگر… آنگاه…»ت رو برای هوس عصرها آماده کن: مثلاً «اگه هوس کردم، اول یه لیوان آب و یه ماست با دارچین».', 'اگه این روزها غم یا زودرنجی‌ات خیلی شدیده و کار و رابطه‌هات رو به هم می‌ریزه، ممکنه PMDD باشه. درمان داره؛ با پزشک حرف بزن.'],
  };
  const NUT = {
    men: { title: 'روزهای پریود: آهن، گرما و آب', why: 'با خون‌ریزی آهن از دست می‌دی و خیلی‌ها خسته‌ان و دل‌درد دارن. هدف این روزها: جبران آهن، گرم و آروم نگه داشتن بدن و غذاهای ضدالتهاب.',
      eat: ['آهن: عدسی، خورش قیمه، قورمه‌سبزی با لوبیا قرمز، گوشت قرمز کم‌چرب، مرغ، ماهی، تخم‌مرغ، کوکوسبزی، بورانی اسفناج', 'ویتامین C کنار غذای آهن‌دار: آبلیمو یا نارنج تازه، پرتقال، نارنگی، کیوی، فلفل دلمه‌ای، گوجه', 'نوشیدنی گرم بی‌قند: دمنوش زنجبیل، چای دارچین، نعناع', 'ضدالتهاب: ماهی چرب، گردو، روغن زیتون، سبزی‌های رنگی، زردچوبه', 'آب کافی، سوپ و آش سبک (مثل سوپ جو یا سوپ عدس)'],
      less: ['چای پررنگ و قهوه همراه غذا (جذب آهن رو کم می‌کنه)', 'غذای خیلی شور و سرخ‌کرده', 'نوشیدنی‌های شیرین و انرژی‌زا'], recipes: ['cinnamon-tea', 'golden-milk', 'green-smoothie', 'oatmeal'] },
    fol: { title: 'فولیکولی: انرژی تازه، پایه‌ی سالم', why: 'استروژن کم‌کم بالا می‌ره و خیلی‌ها حس بهتری دارن. وقت خوبیه برای ساختن عادت‌های غذایی محکم و جبران آهن.',
      eat: ['پروتئین هر وعده: تخم‌مرغ، پنیر، ماست ساده، مرغ، ماهی، حبوبات', 'غلات کامل: نان سنگک یا بربری سبوس‌دار، جو دوسر، بلغور، برنج قهوه‌ای', 'خوراکی‌های تخمیری: ماست، کشک، دوغ کم‌نمک', 'سبزی‌های چلیپایی: کلم، بروکلی، گل‌کلم؛ سالاد شیرازی', 'جبران آهن: عدس، نخود، اسفناج، با ویتامین C'],
      less: ['صبحانه‌ی فقط نون و مربا (قند خون رو بالا و پایین می‌بره)', 'گرسنگی طولانی'], recipes: ['oatmeal', 'chia-pudding', 'yogurt-fruit', 'banana-pancake'] },
    ovu: { title: 'تخمک‌گذاری: سبک، رنگی و پرآب', why: 'وسط چرخه‌ای و خیلی‌ها این روزها اشتهای کمتری دارن. فیبر، آنتی‌اکسیدان و آب کافی بهترین همراه‌هان.',
      eat: ['سالاد و سبزی خوردن، خیار، گوجه، فلفل رنگی', 'میوه‌ی کامل: انار، سیب، پرتقال، توت‌ها', 'پروتئین سبک: ماهی، مرغ، تخم‌مرغ، عدس', 'دانه‌ها: کنجد، تخمه کدو، بذر کتان', 'آب و دوغ کم‌نمک'],
      less: ['آب‌میوه‌ی صنعتی به‌جای میوه‌ی کامل', 'تنقلات شور'], recipes: ['green-smoothie', 'yogurt-fruit', 'nokhodchi-kishmish'] },
    lut: { title: 'لوتئال و پیش از قاعدگی: آروم کردن هوس شیرینی', why: 'پروژسترون بالاست، بدن کمی انرژی بیشتری مصرف می‌کنه و خیلی‌ها هوس شیرینی و نفخ دارن. با وعده‌های منظم و پروتئین و فیبر، قند خون یکنواخت‌تر می‌مونه و هوس‌ها کوچیک‌تر می‌شن.',
      eat: ['پروتئین + فیبر در هر وعده: نون سنگک با پنیر و گردو و سبزی، عدسی، لوبیا، تخم‌مرغ، ماست پرپروتئین', 'کربوهیدرات پیچیده: جو دوسر، بلغور، سیب‌زمینی یا سیب‌زمینی شیرین با پوست، کمی برنج قهوه‌ای', 'منیزیم: بادام، تخمه کدو، کنجد و ارده، اسفناج، لوبیا، یه مربع کوچیک کاکائوی تلخ ۷۰٪', 'کلسیم و ویتامین D: ماست، شیر، کشک، پنیر کم‌نمک، ارده، کمی آفتاب', 'امگا ۳: قزل‌آلا یا ماهی جنوب، گردو، بذر کتان', 'میان‌وعده‌ی ضدهوس: ۲ تا خرما با ۲ تا گردو، ماست با دارچین، نخودچی'],
      less: ['نمک زیاد (ترشی، چیپس، سوسیس، پنیر شور) که نفخ رو بیشتر می‌کنه', 'کافئین زیاد، مخصوصاً بعد از ظهر', 'الکل', 'شیرینی و نوشابه که قند خون رو بالا و پایین می‌برن'], recipes: ['avocado-mousse', 'tahini-sesame-bar', 'peanut-oat-bar', 'chia-pudding', 'golden-milk'] },
  };
  const ART = [
    { id: 'pms-sugar', icon: '🍫', title: 'PMS و هوس شیرینی: چرا و چی کار کنیم؟', sum: 'چرا یه هفته قبل از پریود شکلات صدات می‌زنه، و یه برنامه‌ی ساده برای این روزها.',
      html: `<p>اگه چند روز قبل از پریود هوس شیرینی، نفخ، حساسیت سینه یا زودرنجی سراغت میاد، تنها نیستی. به این علائم که توی ۱ تا ۲ هفته‌ی قبل از پریود میان و با شروعش کم‌کم می‌رن، <b>سندرم پیش از قاعدگی (PMS)</b> می‌گن و خیلی از زن‌ها دست‌کم یکی دو تا از علائمش رو دارن.</p>
<h3>چرا هوس شیرینی؟</h3><p>توی نیمه‌ی دوم چرخه (فاز لوتئال) هورمون‌ها جابه‌جا می‌شن و بدن کمی انرژی بیشتری مصرف می‌کنه. مطالعه‌ها نشون دادن اشتها و انتخاب غذا توی طول چرخه عوض می‌شه. خستگی، خواب بد و استرس هم هوس رو بیشتر می‌کنن. یعنی این هوس «بی‌ارادگی» نیست؛ یه موج قابل‌پیش‌بینیه که می‌شه براش آماده بود.</p>
<h3>برنامه‌ی ساده برای این روزها</h3><ul><li><b>وعده‌های منظم:</b> هر ۳ تا ۴ ساعت یه چیزی بخور که پروتئین و فیبر داشته باشه. گرسنگی طولانی، بزرگ‌ترین سوخت هوسه.</li><li><b>میان‌وعده‌ی آماده:</b> ۲ تا خرما با گردو، ماست ساده با دارچین، یه مشت بادام، یا یکی از پروتئین‌بارهای بی‌قند حبه.</li><li><b>شکلات؟ اشکالی نداره:</b> یه مربع کوچیک شکلات تلخ ۷۰٪ یا بیشتر، آروم و با حوصله؛ بهتر از اینه که سه روز با خودت بجنگی و بعد یه بسته رو تموم کنی.</li><li><b>نمک و کافئین کمتر:</b> برای نفخ کمتر و خواب بهتر.</li><li><b>حرکت:</b> پیاده‌روی و ورزش منظم توی راهنماهای معتبر جزو اولین توصیه‌ها برای PMS هستن.</li><li><b>کلسیم:</b> توی یه کارآزمایی بزرگ، مصرف روزانه‌ی کلسیم علائم PMS رو بیشتر از دارونما کم کرد. از لبنیات، کشک و ارده شروع کن؛ مکمل رو با پزشک هماهنگ کن.</li></ul>
<p>اگه علائمت خیلی شدیده یا زندگی روزمره‌ات رو به هم می‌ریزه، با پزشک حرف بزن؛ درمان‌های مؤثر وجود داره.</p>`,
      refs: [['ACOG — Premenstrual Syndrome (PMS), patient FAQ', 'https://www.acog.org/womens-health/faqs/premenstrual-syndrome'], ['NHS — PMS (premenstrual syndrome)', 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/'], ['Gorczyca AM, et al. Eur J Nutr 2016 — Changes in macronutrient, micronutrient, and food group intakes throughout the menstrual cycle in healthy, premenopausal women (BioCycle Study)', 'https://pubmed.ncbi.nlm.nih.gov/26043860/'], ['Thys-Jacobs S, et al. Am J Obstet Gynecol 1998 — Calcium carbonate and the premenstrual syndrome', 'https://doi.org/10.1016/s0002-9378(98)70377-1']] },
    { id: 'pain', icon: '🔥', title: 'دل‌درد پریود: چی واقعاً کمک می‌کنه؟', sum: 'گرما، ورزش، مسکن درست، و اینکه کی باید به پزشک سر بزنی.',
      html: `<p>درد پریود (دیسمنوره) خیلی شایعه. معمولاً یکی دو روز قبل یا همزمان با شروع خون‌ریزی میاد و ۱ تا ۳ روز طول می‌کشه. علتش موادی به اسم پروستاگلاندین‌هاست که رحم رو منقبض می‌کنن.</p>
<h3>کارهایی که شواهد پشتشونه</h3><ul><li><b>گرما:</b> کیسه‌ی آب گرم یا پد گرم روی شکم یا کمر. یه مرور سیستماتیک نشون داد گرما درد رو کم می‌کنه و شاید تقریباً هم‌اندازه‌ی مسکن‌ها کمک کنه. مراقب باش نسوزی.</li><li><b>ورزش:</b> مرور کاکرین نشون داد ورزش منظم (مثلاً ۴۵ تا ۶۰ دقیقه، سه بار در هفته، حتی با شدت کم) می‌تونه شدت درد رو کم کنه.</li><li><b>مسکن‌های ضدالتهاب (NSAIDs):</b> مثل ایبوپروفن، ناپروکسن یا مفنامیک‌اسید. طبق مرور کاکرین مؤثرن. بهترین زمان، اول درد یا حتی کمی قبل از شروع پریوده. <b>طبق بروشور</b> و با غذا بخور. اگه زخم معده، بیماری کلیه یا آسم حساس به آسپرین داری یا ممکنه باردار باشی، اول با داروساز یا پزشک حرف بزن.</li><li>اگه درد با این کارها کم نمی‌شه، پزشک ممکنه درمان‌های هورمونی رو پیشنهاد بده.</li></ul>
<h3>کی باید به پزشک سر بزنی؟</h3><ul><li>درد اون‌قدر شدیده که با مسکن هم مدرسه، کار یا زندگی‌ات رو تعطیل می‌کنه.</li><li>درد سال‌به‌سال بدتر شده یا بعد از ۲۵ سالگی تازه شروع شده.</li><li>بیرون از روزهای پریود هم درد لگن داری، یا موقع رابطه‌ی جنسی درد داری.</li><li>همراه درد، خون‌ریزی خیلی زیاد یا نامنظم داری.</li></ul><p>این‌ها می‌تونن نشونه‌ی چیزهایی مثل اندومتریوز یا فیبروم باشن که تشخیص و درمان دارن. «درد پریود عادیه، تحمل کن» جواب درستی نیست.</p>`,
      refs: [['ACOG — Dysmenorrhea: Painful Periods, patient FAQ', 'https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods'], ['NHS — Period pain', 'https://www.nhs.uk/conditions/period-pain/'], ['Marjoribanks J, et al. Cochrane Database Syst Rev 2015 — Nonsteroidal anti-inflammatory drugs for dysmenorrhoea (CD001751)', 'https://pubmed.ncbi.nlm.nih.gov/26224322/'], ['Armour M, et al. Cochrane Database Syst Rev 2019 — Exercise for dysmenorrhoea (CD004142)', 'https://pubmed.ncbi.nlm.nih.gov/31538328/'], ['Jo J, Lee SH. Sci Rep 2018 — Heat therapy for primary dysmenorrhea: a systematic review and meta-analysis', 'https://www.nature.com/articles/s41598-018-34303-z']] },
    { id: 'iron', icon: '🩸', title: 'پریود سنگین و آهن: نشونه‌هایی که نباید نادیده بگیری', sum: 'چقدر خون‌ریزی زیاده، کم‌خونی چه نشونه‌هایی داره و چی بخوریم.',
      html: `<p>پریود سنگین یکی از شایع‌ترین علت‌های کم‌خونی فقر آهن توی زن‌هاست؛ و چون کم‌کم پیش میاد، خیلی‌ها فکر می‌کنن خستگی همیشگی «عادی» است.</p>
<h3>کی پریودت سنگین حساب می‌شه؟</h3><ul><li>هر ۱ تا ۲ ساعت، چند ساعت پشت‌سرهم، پد یا تامپون پر می‌شه.</li><li>شب‌ها باید بیدار شی تا پد رو عوض کنی، یا دو تا پد با هم لازم داری.</li><li>لخته‌های درشت (بزرگ‌تر از یه سکه‌ی درشت) می‌بینی.</li><li>پریودت بیشتر از ۷ روز طول می‌کشه.</li><li>از ترس نشت، برنامه‌هات رو کنسل می‌کنی.</li></ul>
<h3>نشونه‌های کم‌خونی</h3><p>خستگی زیاد، نفس‌تنگی با کار سبک، سرگیجه، رنگ‌پریدگی، تپش قلب، ریزش مو، ناخن‌های شکننده یا هوس خوردن یخ. اگه این‌ها رو داری، یه آزمایش خون ساده (CBC و فریتین) کمک می‌کنه.</p>
<h3>غذا برای آهن</h3><ul><li><b>آهن هِم (جذب بهتر):</b> گوشت قرمز کم‌چرب، مرغ، ماهی.</li><li><b>آهن گیاهی:</b> عدس، لوبیا، نخود، اسفناج، جعفری، کنجد و تخمه کدو؛ کنارشون ویتامین C بخور (آبلیمو تازه، پرتقال، فلفل دلمه‌ای).</li><li>چای و قهوه رو با فاصله از غذا بخور.</li></ul>
<p><b>مکمل آهن رو خودسر و طولانی مصرف نکن</b>؛ آهن زیادی هم ضرر داره. اول آزمایش، بعد دوز درست با نظر پزشک. پریود سنگین خودش هم درمان داره و علتش (مثل فیبروم، پولیپ یا اختلال هورمونی) باید بررسی بشه.</p>`,
      refs: [['ACOG — Heavy Menstrual Bleeding, patient FAQ', 'https://www.acog.org/womens-health/faqs/heavy-menstrual-bleeding'], ['NHS — Heavy periods', 'https://www.nhs.uk/conditions/heavy-periods/'], ['WHO — Anaemia, fact sheet', 'https://www.who.int/news-room/fact-sheets/detail/anaemia'], ['NIH Office of Dietary Supplements — Iron fact sheet', 'https://ods.od.nih.gov/factsheets/Iron-Consumer/']] },
    { id: 'pcos', icon: '🌀', title: 'PCOS، چرخه‌ی نامنظم و انسولین', sum: 'چرا ثبت چرخه برای PCOS مهمه و کم کردن قند کجای ماجراست.',
      html: `<p><b>سندرم تخمدان پلی‌کیستیک (PCOS)</b> یکی از شایع‌ترین اختلال‌های هورمونی زن‌هاست؛ طبق سازمان جهانی بهداشت حدود ۸ تا ۱۳ درصد زنان سنین باروری رو درگیر می‌کنه و خیلی‌ها هنوز تشخیص داده نشدن. نشونه‌های رایجش: پریود نامنظم یا خیلی دیر به دیر، جوش، موی زائد و گاهی سختی باردار شدن.</p>
<h3>انسولین چه نقشی داره؟</h3><p>توی خیلی از زن‌های مبتلا، بدن به انسولین کمتر جواب می‌ده (مقاومت به انسولین) و این، تخمدان‌ها رو به ساختن آندروژن بیشتر تشویق می‌کنه. برای همین سبک زندگی، یعنی غذای پرفیبر و کم‌قند افزوده، تحرک منظم و خواب کافی، توی راهنمای بین‌المللی ۲۰۲۳ پایه‌ی درمانه. این راهنما یه رژیم خاص رو برتر نمی‌دونه؛ مهم اینه که برنامه‌ای باشه که بتونی ادامه‌اش بدی. اگه اضافه‌وزن داری، حتی ۵ تا ۱۰ درصد کاهش وزن می‌تونه به نظم چرخه کمک کنه.</p>
<h3>این تقویم چطور کمک می‌کنه؟</h3><ul><li>طول چرخه‌هات رو می‌بینی و الگوی نامنظم بودن معلوم می‌شه.</li><li>یه سابقه‌ی دقیق برای ویزیت پزشک داری.</li><li>می‌بینی هوس شیرینی و جوش‌هات کجای چرخه بیشترن.</li></ul>
<p>اگه چرخه‌هات مرتب کوتاه‌تر از ۲۱ یا بلندتر از ۳۵ روزه‌ان، یا بیشتر از ۳ ماه پریود نشدی، با پزشک زنان یا غدد حرف بزن. PCOS درمان و مدیریت خوبی داره.</p>
<p class="row"><button class="btn ghost pd-art-link" data-art="pcos-and-sugar" type="button">📖 مقاله‌ی حبه: PCOS و قند</button><button class="btn ghost pd-art-link" data-art="insulin-resistance-diabetes" type="button">📖 مقاومت به انسولین چیه؟</button></p>`,
      refs: [['WHO — Polycystic ovary syndrome, fact sheet', 'https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome'], ['Teede HJ, et al. 2023 — Recommendations from the 2023 International Evidence-based Guideline for the Assessment and Management of Polycystic Ovary Syndrome (J Clin Endocrinol Metab, Hum Reprod, Fertil Steril, Eur J Endocrinol)', 'https://doi.org/10.1210/clinem/dgad463'], ['ACOG — Amenorrhea: Absence of Periods, patient FAQ', 'https://www.acog.org/womens-health/faqs/amenorrhea-absence-of-periods']] },
    { id: 'pmdd', icon: '💜', title: 'وقتی PMS خیلی سنگینه: PMDD', sum: 'غم، اضطراب یا خشم شدید قبل از پریود، فقط «بداخلاقی» نیست؛ کمک بگیر.',
      html: `<p><b>اختلال ملال پیش از قاعدگی (PMDD)</b> نوع شدید PMS است که درصد کمی از زن‌ها (حدود ۳ تا ۸ درصد) دارن. علائمش توی هفته‌ی قبل از پریود میان و چند روز بعد از شروعش می‌رن، ولی اون‌قدر شدیدن که کار، درس و رابطه‌ها رو به هم می‌ریزن:</p>
<ul><li>غم یا ناامیدی شدید، گریه‌ی زیاد</li><li>زودرنجی یا خشم شدید، دعوا با اطرافیان</li><li>اضطراب و تنش زیاد، حس از دست دادن کنترل</li><li>بی‌علاقگی، خستگی، تغییر خواب و اشتها</li></ul>
<h3>چی کمک می‌کنه؟</h3><p>PMDD تقصیر تو نیست و درمان‌های مؤثری داره: بعضی داروهای ضدافسردگی (SSRIها) که طبق مرور کاکرین علائم رو کم می‌کنن، درمان‌های هورمونی و روان‌درمانی شناختی‌رفتاری. ثبت روزانه‌ی علائم توی همین تقویم، دست‌کم دو چرخه، به پزشک برای تشخیص خیلی کمک می‌کنه.</p>
<p class="pd-alert"><b>اگه فکر آسیب زدن به خودت رو داری،</b> همین الان با کسی حرف بزن: اورژانس ۱۱۵، اورژانس اجتماعی ۱۲۳ یا صدای مشاور بهزیستی ۱۴۸۰. تنها نیستی و این حال گذراست.</p>`,
      refs: [['ACOG — Premenstrual Syndrome (PMS), patient FAQ (includes PMDD)', 'https://www.acog.org/womens-health/faqs/premenstrual-syndrome'], ['ACOG — What I Wish Everyone Knew About Premenstrual Dysphoric Disorder', 'https://www.acog.org/womens-health/experts-and-stories/the-latest/what-i-wish-everyone-knew-about-premenstrual-dysphoric-disorder'], ['ACOG 2023 — Clinical Practice Guideline: Management of Premenstrual Disorders', 'https://www.acog.org/news/news-articles/2023/11/acog-releases-new-guidelines-on-management-of-premenstrual-disorders'], ['Marjoribanks J, et al. Cochrane Database Syst Rev 2013 — Selective serotonin reuptake inhibitors for premenstrual syndrome (CD001396)', 'https://doi.org/10.1002/14651858.CD001396.pub3']] },
    { id: 'sleep', icon: '😴', title: 'خواب و چرخه‌ی قاعدگی', sum: 'چرا چند شب قبل و اول پریود بدتر می‌خوابی و چی کار کنی.',
      html: `<p>خیلی از زن‌ها می‌گن چند شب قبل از پریود و روزهای اولش بدتر می‌خوابن. پژوهش‌ها هم نشون می‌دن کیفیت خواب گزارش‌شده این روزها پایین‌تره، مخصوصاً در کسانی که PMS یا درد پریود دارن. توی فاز لوتئال دمای بدن کمی بالاتره و این هم می‌تونه خواب رو سبک‌تر کنه.</p>
<h3>چند کار ساده</h3><ul><li>اتاق خواب رو خنک‌تر نگه دار و لباس سبک بپوش.</li><li>ساعت خواب و بیداری رو ثابت نگه دار، حتی آخر هفته.</li><li>کافئین رو از بعد از ظهر قطع کن.</li><li>اگه درد بیدارت می‌کنه، قبل از خواب گرما یا مسکن مناسب (طبق بروشور) کمک می‌کنه.</li><li>یادت باشه کم‌خوابی فردا هوس شیرینی رو بیشتر می‌کنه؛ پس این شب‌ها با خودت مهربون‌تر باش و زودتر برو تو رختخواب.</li></ul>`,
      refs: [['Baker FC, Lee KA. Sleep Med Clin 2018 — Menstrual Cycle Effects on Sleep', 'https://pubmed.ncbi.nlm.nih.gov/30098748/'], ['NHS — PMS (premenstrual syndrome)', 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/']] },
    { id: 'exercise', icon: '🧘‍♀️', title: 'ورزش توی فازهای مختلف چرخه', sum: 'صادقانه: «ورزش هماهنگ با چرخه» شواهد محکمی نداره؛ به بدنت گوش بده.',
      html: `<p>شاید توی شبکه‌های اجتماعی شنیده باشی که باید برنامه‌ی ورزشی رو دقیقاً با فاز چرخه تنظیم کنی (cycle syncing). بیا صادق باشیم: <b>شواهد علمی برای این کار محدوده</b>.</p>
<ul><li>یه مرور سیستماتیک بزرگ (۲۰۲۰) دید عملکرد ورزشی شاید توی روزهای اول چرخه کمی پایین‌تر باشه، ولی این اثر خیلی کوچیک و نامطمئن بود و نویسنده‌ها گفتن بهتره برای هر نفر جداگونه تصمیم گرفت.</li><li>یه مرور دیگه (۲۰۲۳) نتیجه گرفت فاز چرخه روی قدرت و نتیجه‌ی تمرین مقاومتی اثر مشخصی نداره.</li></ul>
<h3>پس چی کار کنیم؟</h3><ul><li><b>به بدنت گوش بده:</b> روزهایی که خسته‌ای یا درد داری، ورزش سبک‌تر (پیاده‌روی، کشش، یوگا) کافیه. روزهایی که پرانرژی‌ای، می‌تونی بیشتر فشار بیاری.</li><li><b>حرکت توی پریود ممنوع نیست:</b> برای خیلی‌ها حتی درد رو کمتر می‌کنه.</li><li><b>ثبت کن:</b> اگه توی این تقویم خستگی‌ها و حال‌هات رو ثبت کنی، الگوی <i>خودت</i> رو پیدا می‌کنی، که از هر قانون کلی‌ای دقیق‌تره.</li><li>ورزش منظم توی کل چرخه به PMS، خواب و حساسیت به انسولین کمک می‌کنه.</li></ul>`,
      refs: [['McNulty KL, et al. Sports Med 2020 — The Effects of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women: A Systematic Review and Meta-Analysis', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7497427/'], ['Colenso-Semple LM, et al. Front Sports Act Living 2023 — Current evidence shows no influence of women\'s menstrual cycle phase on acute strength performance or adaptations to resistance exercise training', 'https://doi.org/10.3389/fspor.2023.1054542'], ['Armour M, et al. Cochrane Database Syst Rev 2019 — Exercise for dysmenorrhoea', 'https://pubmed.ncbi.nlm.nih.gov/31538328/']] },
    { id: 'supps', icon: '💊', title: 'منیزیم، ویتامین B6، امگا ۳: واقعاً جواب می‌دن؟', sum: 'خلاصه‌ی صادقانه‌ی شواهد مکمل‌ها برای PMS و درد پریود.',
      html: `<p>درباره‌ی مکمل‌ها خیلی حرف هست؛ این خلاصه‌ی صادقانه‌ی شواهده:</p>
<ul><li><b>کلسیم:</b> بین این‌ها بهترین شواهد رو داره. توی یه کارآزمایی بزرگ، ۱۲۰۰ میلی‌گرم کلسیم در روز علائم PMS رو بیشتر از دارونما کم کرد. اول از غذا (لبنیات، کشک، ارده) شروع کن.</li><li><b>ویتامین B6:</b> یه مرور سیستماتیک (BMJ، ۱۹۹۹) نشون داد شاید به علائم PMS کمک کنه، ولی کیفیت مطالعه‌ها پایین بود. دوز بالا و طولانی B6 می‌تونه به اعصاب آسیب بزنه (بی‌حسی و گزگز)؛ بیشتر از ۱۰۰ میلی‌گرم در روز نه، و بهتره با نظر پزشک.</li><li><b>منیزیم:</b> چند مطالعه‌ی کوچیک نتیجه‌ی امیدوارکننده داشتن، ولی شواهد هنوز محکم نیست. از غذا بگیرش: بادام، تخمه کدو، کنجد، اسفناج، حبوبات. مکملش ممکنه اسهال بده و اگه بیماری کلیه داری، بدون نظر پزشک نه.</li><li><b>امگا ۳ و زنجبیل:</b> مرور کاکرین روی مکمل‌ها برای درد پریود، برای هیچ مکملی شواهد باکیفیت پیدا نکرد؛ برای چند تا مثل زنجبیل و روغن ماهی شواهد ضعیفی از اثر بود. خوردن ماهی و دمنوش زنجبیل ضرری نداره و ارزون‌تره.</li></ul>
<p>مکمل‌ها می‌تونن با دارو تداخل داشته باشن. اگه باردار یا شیرده‌ای، بیماری داری یا دارو مصرف می‌کنی، قبلش با پزشک یا داروساز مشورت کن.</p>`,
      refs: [['Pattanittum P, et al. Cochrane Database Syst Rev 2016 — Dietary supplements for dysmenorrhoea (CD002124)', 'https://pubmed.ncbi.nlm.nih.gov/27000311/'], ['Wyatt KM, et al. BMJ 1999 — Efficacy of vitamin B-6 in the treatment of premenstrual syndrome: systematic review', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC27878/'], ['Thys-Jacobs S, et al. Am J Obstet Gynecol 1998 — Calcium carbonate and the premenstrual syndrome', 'https://doi.org/10.1016/s0002-9378(98)70377-1'], ['NIH Office of Dietary Supplements — Magnesium fact sheet', 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/']] },
  ];
  const RED = ['خون‌ریزی خیلی زیاد: هر ساعت یا دو ساعت پد یا تامپون پر می‌شه، یا لخته‌های درشت', 'خون‌ریزی بین دو پریود، بعد از رابطه‌ی جنسی یا بعد از یائسگی', 'درد شدیدی که با مسکن هم کم نمی‌شه، یا درد ناگهانی و شدید یک‌طرفه‌ی شکم', 'پریودی که بیشتر از ۳ ماه نیومده (و باردار نیستی)', 'احتمال بارداری همراه با درد یا خون‌ریزی: فوری به پزشک یا اورژانس', 'تب، سرگیجه‌ی شدید یا ضعف همراه پریود'];
  const DISC = 'این بخش آموزشیه و جای ویزیت پزشک رو نمی‌گیره. پیش‌بینی‌ها از روی میانگین چرخه‌هات حساب شدن و همیشه دقیق نیستن.';

  function openArt(id) {
    const a = ART.find(x => x.id === id); if (!a) return;
    A.modal(`<div class="stack article-body pd-art"><span class="eyebrow">تقویم پریود، مقاله</span><h2>${a.icon} ${esc(a.title)}</h2>${a.html}
      <h3>منابع</h3><ol class="refs">${a.refs.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ol>
      <p class="small muted">${DISC} اگه یکی از نشونه‌های هشدار رو داری، دیر نکن و به پزشک سر بزن.</p></div>`,
      (el, close) => $$('.pd-art-link', el).forEach(b => b.onclick = () => { close(); A.openArticle(b.dataset.art); }));
  }

  /* ---------- page state ---------- */
  let sel = null, monthOff = 0, nutTab = null;

  /* ---------- Jalali month calendar ---------- */
  function monthFirst(off) {
    const d = parse(today()); d.setDate(d.getDate() - (jparts(d).d - 1));
    for (let i = 0; i < Math.abs(off); i++) {
      d.setDate(d.getDate() + (off < 0 ? -1 : 32));
      d.setDate(d.getDate() - (jparts(d).d - 1));
    }
    return d;
  }
  function predicted(c, t) {
    const pred = new Set(), fert = new Set(), ov = new Set();
    if (!c.last) return { pred, fert, ov };
    if (c.ongoing) for (let k = addD(c.last.end, 1); k <= c.pEnd; k = addD(k, 1)) pred.add(k);
    for (let i = 0; i < 4; i++) {
      const N = c.late ? addD(t, 1 + i * c.C) : addD(c.next, i * c.C);
      for (let j = 0; j < c.L; j++) pred.add(addD(N, j));
      const o = addD(N, -14);
      if (o > c.pEnd && addD(o, 1) >= t) { for (let j = -5; j <= 1; j++) fert.add(addD(o, j)); ov.add(o); }
    }
    return { pred, fert, ov };
  }
  function calendar(p, c) {
    const t = today(), first = monthFirst(monthOff), fk = key(first), mp = jparts(first).m;
    const cells = [], lead = (first.getDay() + 1) % 7, pr = predicted(c, t);
    for (let i = 0; i < lead; i++) cells.push('<span class="pd-c pd-empty" aria-hidden="true"></span>');
    for (let k = fk, n = 0; jparts(parse(k)).m === mp && n < 32; k = addD(k, 1), n++) {
      const v = p.days[k] || {}, f = v.flow || 0, isP = !f && pr.pred.has(k) && k >= t, isO = !f && pr.ov.has(k), isF = !f && pr.fert.has(k), hasS = (v.sym || []).length || v.mood;
      const desc = [jwdm(k), f ? `پریود (${FLOW[f][1]})` : '', isP ? 'پیش‌بینی پریود' : '', isO ? 'تخمین روز تخمک‌گذاری' : isF ? 'تخمین پنجره‌ی باروری' : '', hasS ? 'علامت یا حال ثبت شده' : '', k === t ? 'امروز' : ''].filter(Boolean).join('، ');
      cells.push(`<button type="button" class="pd-c${f ? ' pd-flow f' + f : ''}${isP ? ' pd-pred' : ''}${isF ? ' pd-fert' : ''}${isO ? ' pd-ov' : ''}${k === t ? ' pd-today' : ''}${k === (sel || t) ? ' pd-sel' : ''}${k > t ? ' pd-fut' : ''}" data-k="${k}" aria-label="${esc(desc)}" aria-pressed="${k === (sel || t)}"><span class="pd-n">${fa(jparts(parse(k)).d)}</span>${f ? `<i class="pd-drops" aria-hidden="true">${'●'.repeat(f)}</i>` : isO ? '<i class="pd-mk" aria-hidden="true">✿</i>' : ''}${hasS ? '<i class="pd-dot" aria-hidden="true"></i>' : ''}</button>`);
    }
    return `<div class="card stack pd-cal" style="gap:10px">
      <div class="row pd-cal-h"><button class="btn ghost pd-nav" id="pdPrev" type="button" aria-label="ماه قبل">→</button><b class="pd-month">${esc(F_MY ? F_MY.format(first) : fk)}</b><button class="btn ghost pd-nav" id="pdNext" type="button" aria-label="ماه بعد" ${monthOff >= 3 ? 'disabled' : ''}>←</button></div>
      <div class="pd-grid pd-wd" aria-hidden="true">${['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(w => `<span>${w}</span>`).join('')}</div>
      <div class="pd-grid" role="group" aria-label="روزهای ماه؛ روی هر روز بزن تا ثبتش کنی">${cells.join('')}</div>
      <div class="pd-legend small"><span><i class="pd-lg pd-flow f2"></i>پریود ثبت‌شده (● تا ●●● یعنی کم تا زیاد)</span><span><i class="pd-lg pd-pred"></i>پیش‌بینی پریود (خط‌چین)</span><span><i class="pd-lg pd-fert"></i>تخمین روزهای باروری (نقطه‌چین)، ✿ تخمک‌گذاری</span><span><i class="pd-lg pd-lgdot"><i class="pd-dot"></i></i>علامت یا حال ثبت‌شده</span></div>
      ${monthOff ? '<button class="btn ghost pd-back" id="pdToday" type="button">برگشت به این ماه</button>' : ''}
      ${editor(p, c)}</div>`;
  }
  function editor(p, c) {
    const t = today(), k = sel || t, v = p.days[k] || {}, f = v.flow || 0;
    if (k > t) return `<div class="pd-ed"><b>${esc(jwdm(k))}</b><p class="small muted">این روز هنوز نیومده. وقتی رسید، می‌تونی ثبتش کنی.</p></div>`;
    // A day up to a week after a logged period (and within 14 days of its start) can close that period.
    const grp = c.g.filter(x => x.start <= k && diff(x.start, k) <= 14).pop(), near = !!grp && (!!f || diff(grp.end, k) <= 7);
    const canEnd = near && k > grp.start && !(p.done === grp.start && k === grp.end);
    return `<div class="pd-ed stack" style="gap:12px" id="pdEd">
      <div class="row" style="justify-content:space-between"><b>📝 ${k === t ? 'امروز، ' : ''}${esc(jwdm(k))}</b>${!f && !near ?`<button class="btn ghost pd-sm" type="button" data-start="${k}">🌸 پریودم این روز شروع شد</button>` : canEnd ? `<button class="btn ghost pd-sm" type="button" data-end="${k}">✓ پریودم این روز تموم شد</button>` : ''}</div>
      <div class="stack" style="gap:6px"><span class="small muted" id="pdFl">خون‌ریزی</span><div class="pd-chips" role="group" aria-labelledby="pdFl">${FLOW.map(([n, l]) => `<button type="button" class="pd-chip${f === n ? ' on' : ''}" data-flow="${n}" aria-pressed="${f === n}">${n ? `<span aria-hidden="true">${'●'.repeat(n)}</span> ` : ''}${l}</button>`).join('')}</div></div>
      <div class="stack" style="gap:6px"><span class="small muted" id="pdSy">علائم (هر چندتا که هست)</span><div class="pd-chips" role="group" aria-labelledby="pdSy">${SYM.map(([id, l, i]) => { const o = (v.sym || []).includes(id); return `<button type="button" class="pd-chip${o ? ' on' : ''}" data-sym="${id}" aria-pressed="${o}"><span aria-hidden="true">${i}</span> ${l}${o ? ' ✓' : ''}</button>`; }).join('')}</div></div>
      <div class="stack" style="gap:6px"><span class="small muted" id="pdMo">حال و هوا</span><div class="pd-chips" role="group" aria-labelledby="pdMo">${MOOD.map(([id, l, i]) => `<button type="button" class="pd-chip${v.mood === id ? ' on' : ''}" data-mood="${id}" aria-pressed="${v.mood === id}"><span aria-hidden="true">${i}</span> ${l}${v.mood === id ? ' ✓' : ''}</button>`).join('')}</div></div>
      ${(v.sym || []).includes('crave') ? `<p class="small pd-hint">🍫 هوس شیرینی ثبت شد. ${c.phase === 'lut' && k === t ? 'توی فاز لوتئال این خیلی طبیعیه. ' : ''}یه میان‌وعده‌ی پروتئین‌دار و یه لیوان آب کمک می‌کنه، و اگه سخت شد، دکمه‌ی «هوس دارم» حبه کنارته.</p>` : ''}
    </div>`;
  }

  /* ---------- the page ---------- */
  A.titles.period = 'تقویم پریود'; A.appRoutes.push('period');
  A.views.period = () => {
    if (!on('period')) return `<section class="wrap"><div class="card">این بخش فعلاً در دسترس نیست. <a href="#today">برگشت</a></div></section>`;
    const p = P();
    if (!p.on) return `<section class="wrap auth stack pd" style="gap:16px;max-width:620px"><div class="card stack pd-ask" style="gap:12px;text-align:center"><div style="margin:0 auto">${flower(90)}</div><h2>تقویم پریود خاموشه</h2><p class="muted">اگه دوست داری روزهای پریودت رو ثبت کنی، بدونی کجای چرخه‌ای و تغذیه‌ات رو با هر فاز هماهنگ کنی، روشنش کن. اطلاعاتت فقط توی حساب خودته و هر وقت بخوای پاکش می‌کنی.</p><div class="row" style="justify-content:center"><button class="btn primary" id="pdOn" type="button">آره، فعالش کن</button><a class="btn ghost" href="#today">نه، ممنون</a></div></div></section>`;
    const t = today(), c = calc(p, t);
    if (sel && sel > t) sel = null;
    if (!nutTab) nutTab = c.phase || 'lut';
    const tipList = TIPS[c.phase || 'fol'], tip = tipList[(parseInt(t.replace(/-/g, ''), 10) + c.cd) % tipList.length];
    let hero;
    if (!c.last) {
      hero = `<div class="card pd-hero"><div class="pd-ringw">${flower(130)}</div><div class="stack" style="gap:10px;min-width:0"><span class="eyebrow">تقویم پریود</span><h2>بیا با اولین پریود شروع کنیم 🌸</h2><p class="muted">اگه امروز پریود شدی، دکمه‌ی پایین رو بزن. اگه قبلاً بوده، توی تقویم روی روز شروعش بزن و «پریودم این روز شروع شد» رو انتخاب کن. هرچی چرخه‌های بیشتری ثبت کنی، پیش‌بینی‌ها دقیق‌تر می‌شن.</p><div class="row"><button class="btn berry" type="button" data-start="${t}">🌸 پریودم امروز شروع شد</button></div></div></div>`;
    } else {
      const dn = diff(t, c.next), nEnd = addD(c.next, c.L - 1), lines = [];
      if (c.ongoing) lines.push(`روز ${fa(diff(c.last.start, t) + 1)} پریود؛ احتمالاً تا ${esc(jdm(c.pEnd))} ادامه داره.`);
      if (c.late) lines.push(`پریودت ${fa(c.late)} روز از زمان پیش‌بینی‌شده عقب‌تره.`);
      else lines.push(`پریود بعدی: حدوداً <b>${esc(jdm(c.next))}</b> (${rel(dn)})، تا حدود ${esc(jdm(nEnd))}.`);
      hero = `<div class="card pd-hero"><div class="pd-ringw">${ring(c)}</div><div class="stack" style="gap:10px;min-width:0">
        <span class="eyebrow">تقویم پریود</span><h2>روز ${fa(c.cd)} از چرخه</h2>
        <div class="row" style="gap:8px"><span class="chip pd-phase" style="background:${PH[c.phase].soft}">${PH[c.phase].icon} فاز ${esc(phaseName(c))}</span><span class="chip">${esc(PH[c.phase].short)}</span></div>
        ${lines.map(l => `<p class="pd-line">${l}</p>`).join('')}
        <div class="row">${c.ongoing ? `<button class="btn primary" type="button" data-end="${t}">✓ تموم شد</button>` : `<button class="btn berry" type="button" data-start="${t}">🌸 پریودم شروع شد</button>`}</div>
        <p class="small muted">${c.dataC ? `میانگین ${fa(c.cycles.length)} چرخه‌ی اخیرت: ${fa(c.C)} روز` : `تا وقتی دست‌کم دو چرخه ثبت نشده، از عدد معمول خودت (${fa(c.C)} روز) استفاده می‌کنیم`}، طول پریود حدود ${fa(c.L)} روز.</p></div></div>`;
    }
    const notes = [];
    if (c.late >= 1) notes.push(`<div class="card pd-note"><b>⏳ پریودت دیر کرده</b><p>چند روز تأخیر خیلی معموله؛ استرس، سفر، بیماری، تغییر وزن یا ورزش سنگین می‌تونن چرخه رو جابه‌جا کنن. ${c.late >= 5 ? 'اگه احتمال بارداری هست، یه تست بارداری خونگی بده. ' : ''}اگه بیشتر از ۳ ماه پریود نشدی یا نگرانی، با پزشک حرف بزن.${c.late > 45 ? ' اگه فقط ثبت کردنش یادت رفته، آخرین پریودت رو توی تقویم ثبت کن.' : ''}</p></div>`);
    if (c.spread > 8 || c.outRange.length) notes.push(`<div class="card pd-note"><b>🌀 چرخه‌هات کمی نامنظم به نظر میان</b><p>${c.spread > 8 ? `فاصله‌ی کوتاه‌ترین و بلندترین چرخه‌ی اخیرت ${fa(c.spread)} روزه. ` : ''}${c.outRange.length ? `${fa(c.outRange.length)} چرخه کوتاه‌تر از ۲۱ یا بلندتر از ۳۵ روز بوده. ` : ''}گاهی نامنظمی یه دوره‌ی گذراست، ولی اگه ادامه داشت، خوبه با پزشک زنان حرف بزنی. یکی از علت‌های شایعش تخمدان پلی‌کیستیک (PCOS) است که مدیریت خوبی داره. با چرخه‌ی نامنظم، پیش‌بینی‌ها هم دقت کمتری دارن.</p><div class="row"><button class="btn ghost pd-sm" type="button" data-art="pcos">بیشتر درباره‌ی PCOS</button></div></div>`);
    if (c.longP) notes.push(`<div class="card pd-note"><b>🩸 پریودهای طولانی</b><p>بعضی از پریودهای ثبت‌شده‌ات بیشتر از ۷ روز طول کشیدن. اگه خون‌ریزی‌ات زیاده یا خسته و بی‌حالی، با پزشک درباره‌ی پریود سنگین و کم‌خونی حرف بزن.</p><div class="row"><button class="btn ghost pd-sm" type="button" data-art="iron">نشونه‌های پریود سنگین</button></div></div>`);
    const fertCard = c.fert ? `<div class="card stack pd-fertc" style="gap:6px"><b>🌼 تخمین روزهای باروری</b><p>از ${esc(jdm(c.fert.start))} تا ${esc(jdm(c.fert.end))}؛ تخمین روز تخمک‌گذاری: حدود ${esc(jdm(c.fert.ov))}.</p><p class="small pd-warn"><b>مهم:</b> این فقط یه تخمین از روی میانگین چرخه‌هاته، <b>روش جلوگیری از بارداری نیست</b> و برای اقدام به بارداری هم کافی نیست. تخمک‌گذاری می‌تونه هر ماه چند روز جابه‌جا بشه.</p></div>` : '';
    const bars = c.cycles.length ? `<div class="pd-bars" role="img" aria-label="طول چرخه‌های اخیر: ${c.cycles.map(x => fa(x)).join('، ')} روز">${c.cycles.map(x => `<div><i style="height:${Math.max(10, Math.min(100, x / 45 * 100))}%"></i><span>${fa(x)}</span></div>`).join('')}</div>` : '<p class="small muted">بعد از دومین پریود ثبت‌شده، طول چرخه‌هات اینجا میاد.</p>';
    const symCount = {}, symPh = {};
    Object.entries(p.days).forEach(([k, v]) => (v.sym || []).forEach(s => { symCount[s] = (symCount[s] || 0) + 1; const pp = phaseAt(k, c); if (pp) { symPh[s] = symPh[s] || {}; symPh[s][pp] = (symPh[s][pp] || 0) + 1; } }));
    const top = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const patt = top.length ? `<ul class="pd-patt">${top.map(([s, n]) => { const bp = Object.entries(symPh[s] || {}).sort((a, b) => b[1] - a[1])[0]; return `<li><b>${esc(symName(s))}</b>: ${fa(n)} روز${bp ? `، بیشتر توی فاز ${PH[bp[0]].name}` : ''}</li>`; }).join('')}</ul>${symPh.crave?.lut ? '<p class="small">🍫 هوس شیرینی‌هات بیشتر توی نیمه‌ی دوم چرخه‌ان؛ این روزها میان‌وعده‌ی پروتئین‌دار رو از قبل آماده کن.</p>' : ''}` : '<p class="small muted">وقتی چند روز علائم ثبت کنی، اینجا می‌بینی کدوم علامت کجای چرخه بیشتره.</p>';
    const N = NUT[nutTab], recs = N.recipes.map(id => A.RECIPES.find(r => r.id === id)).filter(Boolean);
    return `<section class="wrap stack pd" style="gap:16px;max-width:1000px">
      ${hero}
      ${notes.join('')}
      ${c.last ? `<div class="card pd-tip"><b>💡 نکته‌ی امروز برای فاز ${esc(phaseName(c))}</b><p>${esc(tip)}</p></div>` : ''}
      <div class="pd-two">${calendar(p, c)}
        <div class="stack" style="gap:16px">${fertCard}
          <div class="card stack" style="gap:8px"><b>📊 چرخه‌های من</b>${bars}<div class="row small" style="gap:8px"><span class="chip">میانگین چرخه: ${fa(c.C)} روز</span><span class="chip">طول پریود: ${fa(c.L)} روز</span></div>
            <details class="pd-typ"><summary class="small">عددهای معمول من رو تنظیم کن</summary><div class="row" style="margin-top:8px"><label class="small" for="pdTc">طول چرخه (روز)<br><input class="input" id="pdTc" type="number" inputmode="numeric" min="20" max="45" value="${p.typical.cycle}" style="width:110px"></label><label class="small" for="pdTl">طول پریود (روز)<br><input class="input" id="pdTl" type="number" inputmode="numeric" min="2" max="10" value="${p.typical.len}" style="width:110px"></label></div><p class="small muted">تا وقتی دو چرخه‌ی کامل ثبت نشده، پیش‌بینی‌ها از همین عددها استفاده می‌کنن.</p></details></div>
          <div class="card stack" style="gap:6px"><b>🔎 الگوهای من</b>${patt}</div></div></div>
      <div class="card stack pd-nut" style="gap:12px"><b>🥗 تغذیه‌ی هماهنگ با چرخه</b>
        <div class="filters" role="tablist" aria-label="فازهای چرخه">${Object.keys(NUT).map(k => `<button type="button" role="tab" data-nut="${k}" class="${k === nutTab ? 'on' : ''}" aria-selected="${k === nutTab}">${PH[k].icon} ${PH[k].name}${k === c.phase ? ' (الان)' : ''}</button>`).join('')}</div>
        <h3>${esc(N.title)}</h3><p class="muted">${esc(N.why)}</p>
        <div class="pd-nut-g"><div class="pd-eat"><b class="small">✓ بیشتر بخور</b><ul>${N.eat.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="pd-less"><b class="small">− کمترش کن</b><ul>${N.less.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
        ${recs.length ? `<div class="stack" style="gap:6px"><b class="small">رسپی‌های حبه که به این روزها میان</b><div class="row">${recs.map(r => `<button type="button" class="chip pd-rec" data-rec="${esc(r.id)}">🍽 ${esc(r.title)}</button>`).join('')}</div></div>` : ''}</div>
      <div class="stack" style="gap:10px"><h3>📚 مقاله‌ها و نکته‌ها</h3><div class="pd-arts">${ART.map(a => `<button type="button" class="card pd-artc" data-art="${a.id}"><span class="pd-ai" aria-hidden="true">${a.icon}</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(a.title)}</b><span class="small muted">${esc(a.sum)}</span></span></button>`).join('')}</div></div>
      <div class="card stack pd-red" style="gap:6px"><b>🚩 این نشونه‌ها رو جدی بگیر و به پزشک سر بزن</b><ul>${RED.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
      <p class="small muted pd-disc">${DISC} اطلاعاتت فقط توی حساب خودته؛ از <a href="#settings">تنظیمات</a> می‌تونی این بخش رو خاموش یا همه‌ی اطلاعاتش رو پاک کنی.</p>
    </section>`;
  };
  const rerender = () => { const y = scrollY; A.render(); scrollTo(0, y); };
  function startOn(k) {
    const p = P(); if (!p.days[k]?.flow) day(p, k).flow = 2;
    sync(p); sel = k; A.save();
    A.toast(k === today() ? 'ثبت شد 🌸 این روزها با خودت مهربون باش؛ گرما، آب و یه غذای آهن‌دار کمک می‌کنه.' : 'شروع پریود ثبت شد 🌸', null, 'calm');
  }
  function endOn(k) {
    const p = P(), g = periods(p).filter(x => x.start <= k).pop(); if (!g) return;
    for (let d = g.start; d <= k; d = addD(d, 1)) if (!p.days[d]?.flow) day(p, d).flow = d === g.start ? 2 : 1;
    for (let d = addD(k, 1); d <= g.end; d = addD(d, 1)) if (p.days[d]) delete p.days[d].flow;
    sync(p); p.done = g.start; sel = k; A.save();
    A.toast('پایان پریود ثبت شد ✓ آفرین که ثبتش کردی.', null, 'happy');
  }
  A.mounts.period = () => {
    const pdOn = $('#pdOn'); if (pdOn) pdOn.onclick = () => { const p = P(); p.on = true; p.asked = true; A.save(); A.render(); };
    if (!enabled()) return;
    const p = P(), k = () => sel || today(), edit = fn => { fn(day(p, k())); sync(p); A.save(); rerender(); };
    $$('#app [data-start]').forEach(b => b.onclick = () => { startOn(b.dataset.start); rerender(); });
    $$('#app [data-end]').forEach(b => b.onclick = () => { endOn(b.dataset.end); rerender(); });
    $$('.pd-c[data-k]').forEach(b => b.onclick = () => { sel = b.dataset.k; rerender(); const e = $('#pdEd'); if (e && innerWidth < 900) e.scrollIntoView({ block: 'nearest' }); });
    const pv = $('#pdPrev'), nx = $('#pdNext'), td = $('#pdToday');
    if (pv) pv.onclick = () => { monthOff--; rerender(); };
    if (nx) nx.onclick = () => { if (monthOff < 3) { monthOff++; rerender(); } };
    if (td) td.onclick = () => { monthOff = 0; rerender(); };
    $$('[data-flow]').forEach(b => b.onclick = () => edit(v => { v.flow = Number(b.dataset.flow); }));
    $$('[data-sym]').forEach(b => b.onclick = () => edit(v => { const s = new Set(v.sym || []); s.has(b.dataset.sym) ? s.delete(b.dataset.sym) : s.add(b.dataset.sym); v.sym = [...s]; }));
    $$('[data-mood]').forEach(b => b.onclick = () => edit(v => { v.mood = v.mood === b.dataset.mood ? '' : b.dataset.mood; }));
    $$('[data-nut]').forEach(b => b.onclick = () => { nutTab = b.dataset.nut; rerender(); });
    $$('[data-rec]').forEach(b => b.onclick = () => A.openRecipe(b.dataset.rec));
    $$('#app [data-art]').forEach(b => b.onclick = () => openArt(b.dataset.art));
    const tc = $('#pdTc'), tl = $('#pdTl');
    const setT = () => { const cy = Math.round(Number(tc.value)), ln = Math.round(Number(tl.value)); if (cy >= 20 && cy <= 45) p.typical.cycle = cy; if (ln >= 2 && ln <= 10) p.typical.len = ln; A.save(); rerender(); const d = $('.pd-typ'); if (d) d.open = true; };
    if (tc) tc.onchange = setT; if (tl) tl.onchange = setT;
  };

  /* ---------- Today: one-time invitation, then the daily card ---------- */
  add('todayAside', () => {
    if (!on('period') || !signed()) return '';
    const r = raw();
    if (!r || (!r.on && !r.asked)) {
      const pcos = (A.D().profile.goal || []).includes('pcos');
      return `<div class="card stack pd-ask" style="gap:10px" id="pdAsk"><div class="row" style="flex-wrap:nowrap;gap:12px"><div style="flex:none">${flower(64)}</div><div class="stack" style="gap:4px;min-width:0"><b>یه تقویم پریود هم می‌خوای؟</b><p class="small muted">اگه پریود می‌شی، می‌تونی روزهاش رو ثبت کنی، بدونی کجای چرخه‌ای و غذات رو با هر فاز هماهنگ کنی؛ مثلاً برای هوس شیرینی قبل از پریود.</p></div></div>${pcos ? '<p class="small pd-pcos">🌀 چون گفتی تخمدان پلی‌کیستیک یا تعادل هورمونی برات مهمه، این تقویم مخصوصاً به دیدن نظم چرخه‌ات و حرف زدن دقیق‌تر با پزشک کمک می‌کنه.</p>' : ''}<p class="small muted">کاملاً اختیاریه، اطلاعاتش فقط توی حساب خودته و هر وقت بخوای از تنظیمات خاموش یا پاکش می‌کنی.</p><div class="row"><button class="btn primary" type="button" id="pdYes">آره، فعالش کن</button><button class="btn ghost" type="button" id="pdNo">نه، ممنون</button></div></div>`;
    }
    if (!r.on) return '';
    const c = calc(P());
    if (!c.last) return `<a class="card row pd-todayc" href="#period" style="flex-wrap:nowrap"><div style="flex:none">${flower(56)}</div><span class="stack" style="gap:2px;min-width:0"><b>تقویم پریود</b><span class="small muted">اولین پریودت رو ثبت کن تا پیش‌بینی‌ها شروع بشن.</span></span></a>`;
    const tl = TIPS[c.phase], t = today(), tip = tl[(parseInt(t.replace(/-/g, ''), 10) + c.cd) % tl.length], dn = diff(t, c.next);
    const rem = c.late ? `⏳ پریودت ${fa(c.late)} روز دیر کرده.` : !c.ongoing && dn >= 0 && dn <= 2 ? `🔔 احتمالاً ${rel(dn)} پریود می‌شی؛ یه پد توی کیفت بذار و میان‌وعده‌ی پروتئین‌دار آماده کن.` : '';
    return `<a class="card stack pd-todayc" href="#period" style="gap:8px"><div class="row" style="flex-wrap:nowrap;gap:12px"><div style="flex:none">${ring(c, 76, true)}</div><span class="stack" style="gap:2px;min-width:0"><b>روز ${fa(c.cd)} چرخه، فاز ${esc(phaseName(c))}</b><span class="small muted">${c.ongoing ? `روز ${fa(diff(c.last.start, t) + 1)} پریود` : c.late ? 'هر روز ممکنه شروع بشه' : `پریود بعدی: حدوداً ${esc(jdm(c.next))}`}</span></span></div>${rem ? `<span class="small pd-remline">${rem}</span>` : ''}<span class="small pd-tline">💡 ${esc(tip)}</span></a>`;
  });
  add('mount', r => {
    if (r !== 'today') return;
    const y = $('#pdYes'), n = $('#pdNo');
    if (y) y.onclick = () => { const p = P(); p.on = true; p.asked = true; A.save(); A.toast('تقویم پریود فعال شد 🌸 از ابزارها یا کارت صفحه‌ی امروز بهش سر بزن.', null, 'happy'); A.go('period'); };
    if (n) n.onclick = () => { const p = P(); p.on = false; p.asked = true; A.save(); const c = $('#pdAsk'); if (c) c.remove(); A.toast('باشه، دیگه نمی‌پرسیم. اگه یه روز خواستی، از تنظیمات روشنش کن.', 'bell'); };
  });

  /* ---------- Settings ---------- */
  add('settings', () => {
    if (!on('period') || !signed()) return '';
    const r = raw() || {}, n = r.days ? Object.keys(r.days).length : 0;
    return `<div class="card stack pd-set" style="gap:10px"><b>🌸 تقویم پریود</b>
      <label class="check" for="pdTog"><input type="checkbox" id="pdTog" ${r.on ? 'checked' : ''}><span>تقویم پریود رو نشونم بده</span></label>
      <p class="small muted">اختیاریه. با روشن کردنش، تقویم پریود به ابزارها و صفحه‌ی امروز اضافه می‌شه. اطلاعاتش فقط توی حساب خودت ذخیره می‌شه.</p>
      <div class="stack" id="pdSetMore" style="gap:10px" ${r.on ? '' : 'hidden'}>
        <label class="check" for="pdRem"><input type="checkbox" id="pdRem" ${r.rem !== false ? 'checked' : ''}><span>دو روز قبل از پریود پیش‌بینی‌شده یادم بنداز</span></label>
        <div class="row"><a class="btn ghost" href="#period">باز کردن تقویم پریود</a></div></div>
      ${n || r.on ? `<div class="stack" style="gap:6px"><span class="small muted">${fa(n)} روز ثبت‌شده</span><div class="row"><button class="btn ghost" type="button" id="pdDel">پاک کردن همه‌ی اطلاعات پریود</button><button class="btn berry" type="button" id="pdDelOk" hidden>بله، همه رو پاک کن</button></div></div>` : ''}</div>`;
  });
  add('mount', r => {
    if (r !== 'settings') return;
    const tog = $('#pdTog'); if (!tog) return;
    tog.onchange = () => { const p = P(); p.on = tog.checked; p.asked = true; A.save(); $('#pdSetMore').hidden = !tog.checked; A.toast(tog.checked ? 'تقویم پریود روشن شد 🌸' : 'تقویم پریود خاموش شد. اطلاعاتت سر جاشه.', 'bell'); };
    const rem = $('#pdRem'); if (rem) rem.onchange = () => { P().rem = rem.checked; A.save(); };
    const del = $('#pdDel'), ok = $('#pdDelOk');
    if (del) del.onclick = () => { ok.hidden = false; del.textContent = 'مطمئنی؟ این کار برگشت نداره'; ok.focus(); };
    if (ok) ok.onclick = () => { const d = A.D(); d.period = { on: !!d.period?.on, asked: true }; sel = null; monthOff = 0; A.save(); A.toast('همه‌ی اطلاعات پریود پاک شد.', 'bell'); A.render(); };
  });

  /* ---------- reminders: 2 days before, and on the expected day ---------- */
  add('reminders', dayN => {
    if (!enabled() || P().rem === false) return [];
    const d = new Date(); d.setDate(d.getDate() + (dayN - A.D().day));
    const c = calc(P()); if (!c.last || c.ongoing || c.late) return [];
    const dn = diff(key(d), c.next);
    if (dn === 2) return [{ time: '10:00', text: '🌸 یادآور تقویمت: احتمالاً دو روز دیگه پریود می‌شی. یه پد توی کیفت بذار، آب بیشتر بخور و میان‌وعده‌ی پروتئین‌دار آماده کن تا هوس شیرینی کمتر اذیتت کنه.', spot: 'bell', url: '#period' }];
    if (dn === 0) return [{ time: '20:00', text: '🌸 طبق پیش‌بینی، پریودت از امروز ممکنه شروع بشه. اگه شروع شد، توی تقویم پریود ثبتش کن تا پیش‌بینی‌ها دقیق‌تر بشن.', spot: 'bell', url: '#period' }];
    return [];
  });

  /* ---------- entry points (only when enabled) ---------- */
  A.tools.push({ route: 'period', icon: '🌸', title: 'تقویم پریود', desc: 'ثبت روزها، روز چرخه، پیش‌بینی و تغذیه‌ی هر فاز', show: () => enabled() });
  (A.searchExtra = A.searchExtra || []).push(() => !enabled() ? [] : [
    { icon: '🌸', title: 'تقویم پریود', sub: 'ابزار', group: 'ابزارها', text: 'تقویم پریود قاعدگی عادت ماهانه چرخه تخمک گذاری باروری PMS پی ام اس', open: () => A.go('period') },
    ...ART.map(a => ({ icon: a.icon, title: a.title, sub: 'تقویم پریود', group: 'ابزارها', text: [a.title, a.sum, a.html.replace(/<[^>]+>/g, ' ')].join(' '), note: a.sum, open: () => openArt(a.id) })),
  ]);
  A.period = { calc, periods, phaseAt };
});
