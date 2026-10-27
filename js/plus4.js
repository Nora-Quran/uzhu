/* Uzhu improvements round 4, part 2 (plugin P4): learning content (myth-or-fact game, fruit & dates guide, fruit of the
   season, sugar in drinks, 40 names of sugar + quiz, kids & family, work & university, eating out), recipes (rating,
   "I cooked it", personal note, share link, print), installed app (#sos shortcut is in plus3; app-icon badge, persistent
   storage) and growth (invite a friend, about & method, privacy). Numbers refer to research/improvements-100.md.
   State: A.D().p4 (account) or localStorage 'uzhu:p4' for guests. Gated by feature keys. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const inApp = () => !!(A.user && A.D() && A.D().profile);
  const ls = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  // Recipe notes: in the account when signed in, otherwise in this browser.
  const Q = () => { if (inApp()) { const d = A.D(); d.p4 = d.p4 || {}; d.p4.rec = d.p4.rec || {}; return d.p4; } const g = ls.get('uzhu:p4', {}); g.rec = g.rec || {}; return g; };
  const saveQ = q => inApp() ? A.save() : ls.set('uzhu:p4', q);
  const off = () => `<section class="wrap"><div class="card stack" style="gap:8px;text-align:center"><b>این بخش فعلاً در دسترس نیست.</b><a class="btn ghost" href="#home">برگشت</a></div></section>`;
  const page = (eyebrow, title, sub, body, max = 860) => `<section class="wrap stack" style="gap:16px;max-width:${max}px">
    <div class="section-head" style="margin:0">${inApp() ? '<a class="small fb-back" href="#more">→ همه‌ی ابزارها</a>' : ''}<span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${body}</section>`;
  // Public pages (no sign-in needed): good for visitors and for sharing.
  const route = (r, key, title, view, mount) => { A.views[r] = () => on(key) ? view() : off(); A.mounts[r] = () => { if (on(key) && mount) mount(); }; A.titles[r] = title; };
  const tool = (route, icon, title, desc, key) => A.tools.push({ route, icon, title, desc, show: () => on(key) });
  const cubes = g => Math.round(g / 4 * 2) / 2;
  const cubeRow = g => { const n = cubes(g); return `<span class="p4-cubes" aria-label="${fa(n)} حبه‌قند">${'<i></i>'.repeat(Math.floor(n))}${n % 1 ? '<i class="h"></i>' : ''}</span>`; };
  const siteUrl = () => location.origin + location.pathname;
  async function copyText(t) { try { await navigator.clipboard.writeText(t); return true; } catch (e) { return false; } }
  const sources = list => `<details class="card"><summary><b>منابع</b></summary><ol class="refs small">${list.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join('')}</ol></details>`;

  A.moreFeatures = (A.moreFeatures || []).concat([
    ['myths', 'بازی افسانه یا واقعیت'], ['fruit', 'راهنمای میوه و خرما'], ['season', 'میوه‌ی فصل'], ['drinks', 'قند نوشیدنی‌ها'], ['sugarnames', '۴۰ اسم قند'],
    ['kids', 'راهنمای بچه‌ها و خانواده'], ['work', 'راهنمای محل کار'], ['eatout', 'راهنمای بیرون غذا خوردن'], ['recipenotes', 'امتیاز و یادداشت رسپی'], ['share', 'اشتراک رسپی و مقاله'],
    ['printrecipe', 'چاپ رسپی'], ['appbadge', 'نشان روی آیکن اپ'], ['persist', 'ذخیره‌سازی ماندگار'], ['invite', 'دعوت دوست'], ['about', 'درباره‌ی حبه'], ['privacy', 'حریم خصوصی'],
  ]);

  /* ================= 21. myth or fact ================= */
  const MYTHS = [
    ['عسل و شیره‌ی انگور چون طبیعی‌اند، قند افزوده حساب نمی‌شن.', false, 'سازمان جهانی بهداشت عسل، شیره‌ها و شربت‌ها رو جزو «قند آزاد» حساب می‌کنه؛ درست مثل شکر.'],
    ['آبمیوه‌ی ۱۰۰٪ طبیعی هم جزو قند آزاد حساب می‌شه.', true, 'وقتی میوه آب گرفته می‌شه، فیبرش جدا می‌شه و قندش سریع جذب می‌شه. برای همین سازمان جهانی بهداشت آبمیوه رو هم قند آزاد می‌دونه.'],
    ['میوه‌ی کامل رو هم باید مثل شیرینی کنار گذاشت.', false, 'قند داخل میوه‌ی کامل همراه فیبر و آبه و جزو قند آزاد نیست. ۲ تا ۳ واحد میوه در روز بخشی از رژیم سالمه.'],
    ['سازمان جهانی بهداشت می‌گه قند آزاد کمتر از ۱۰٪ انرژی روزانه باشه و کمتر از ۵٪ (حدود ۲۵ گرم) بهتره.', true, 'این توصیه‌ی رسمی سال ۲۰۱۵ سازمان جهانی بهداشته.'],
    ['قند باعث بیش‌فعالی بچه‌ها می‌شه.', false, 'مرور پژوهش‌های کنترل‌شده نشون داده قند رفتار بچه‌ها رو به‌طور معنادار عوض نمی‌کنه. البته دلیل‌های خیلی خوب دیگه‌ای برای کم کردنش هست، مثل دندون‌ها.'],
    ['شکر قهوه‌ای خیلی سالم‌تر از شکر سفیده.', false, 'شکر قهوه‌ای همون ساکارزه با کمی ملاس. مقدار مواد معدنی‌اش ناچیزه و اثرش روی بدن تقریباً یکیه.'],
    ['هوس معمولاً مثل موج بالا میاد و بعد از چند دقیقه تا نیم ساعت فروکش می‌کنه.', true, 'تمرین «موج‌سواری روی هوس» بر همین اساسه: اگه بهش واکنش نشون ندی، خودش آروم می‌شه.'],
    ['بعد از چند هفته کم کردن قند، ذائقه عوض می‌شه و خوراکی‌ها شیرین‌تر به نظر میان.', true, 'در پژوهش‌ها، کسانی که قند رو کم کردن بعد از چند هفته تا چند ماه همون دسر رو شیرین‌تر حس کردن.'],
    ['یک قوطی نوشابه‌ی معمولی بیشتر از کل سهم پیشنهادی قند یک روز (۲۵ گرم) قند داره.', true, 'هر قوطی ۳۳۰ میلی‌لیتری حدود ۳۵ گرم قند داره؛ نزدیک ۹ حبه‌قند.'],
    ['اگه یک روز لغزیدی، همه‌ی پیشرفتت از بین رفته.', false, 'روان‌شناس‌ها به این فکر می‌گن «اثر نقض پرهیز»؛ همین فکره که یک لغزش رو به ول کردن کامل تبدیل می‌کنه. یک روز، زحمت چند هفته رو پاک نمی‌کنه.'],
    ['کم‌خوابی هوس خوراکی‌های شیرین و پرکالری رو بیشتر می‌کنه.', true, 'بعد از یک شب کم‌خوابی، مغز به خوراکی‌های پرکالری واکنش بیشتری نشون می‌ده و هورمون‌های گرسنگی هم به هم می‌ریزن.'],
    ['ثابت شده که قند دقیقاً مثل مواد مخدر اعتیادآوره.', false, 'قند مسیر پاداش مغز رو فعال می‌کنه و هوس واقعیه، ولی شواهد انسانی برای «اعتیاد» به معنای پزشکی هنوز قطعی نیست. خبر خوب: عادت قابل تغییره.'],
    ['خرما چون قند طبیعی داره، هر چقدر بخوری اشکالی نداره.', false, 'خرما مغذیه ولی قندش متراکمه. یک خرمای بزرگ مجول حدود ۱۶ گرم قند داره. ۲ تا ۳ عدد همراه چند مغز گردو انتخاب خوبیه.'],
    ['«بدون شکر افزوده» روی برچسب یعنی محصول اصلاً قند نداره.', false, 'ممکنه قند طبیعی میوه یا شیر داشته باشه و هنوز شیرین باشه. جدول ارزش غذایی رو هم نگاه کن.'],
    ['صبحانه‌ی پروتئین‌دار به کم شدن هوس در طول روز کمک می‌کنه.', true, 'در پژوهش‌ها، صبحانه‌ی پرپروتئین هوس خوراکی‌های شیرین رو تا عصر کمتر کرده.'],
    ['۱۵ دقیقه پیاده‌روی تند می‌تونه هوس شکلات رو کم کنه.', true, 'در یک پژوهش، یک پیاده‌روی ۱۵ دقیقه‌ای هوس شکلات رو در لحظه کمتر کرد.'],
    ['همه‌ی کربوهیدرات‌ها قند افزوده‌ان.', false, 'نون سبوس‌دار، حبوبات، سبزی و میوه کربوهیدرات دارن ولی قند افزوده نیستن.'],
    ['نون سفید و برنج سفید هم قند خون رو سریع بالا می‌برن، حتی اگه شیرین نباشن.', true, 'نشاسته‌ی تصفیه‌شده سریع به گلوکز تبدیل می‌شه. جایگزین سبوس‌دار و همراه کردنش با پروتئین و سبزی کمک می‌کنه.'],
    ['برای ترک قند فقط قطع یک‌باره جواب می‌ده؛ کم‌کم کم کردن بی‌فایده‌ست.', false, 'هر دو روش برای آدم‌های مختلف جواب داده. مهم اینه که روشی رو انتخاب کنی که بتونی ادامه‌اش بدی.'],
    ['سس کچاپ، نون تست و ماست میوه‌ای ممکنه قند افزوده‌ی قابل‌توجهی داشته باشن.', true, 'قند پنهان در خوراکی‌های غیرشیرین زیاده. برچسب رو بخون.'],
    ['اگه در فهرست مواد کلمه‌ی «شکر» نیومده، یعنی قند افزوده نداره.', false, 'قند ده‌ها اسم دیگه داره: دکستروز، شربت گلوکز، مالتوز، کنسانتره‌ی آبمیوه و… فهرست «۴۰ اسم قند» رو ببین.'],
    ['استرس و تنهایی می‌تونن هوس شیرینی رو بیشتر کنن.', true, 'به این «خوردن هیجانی» می‌گن. برای همینه که حبه می‌پرسه «الان چی شده؟».'],
    ['قند زیاد فقط برای کسانی که اضافه‌وزن دارن ضرر داره.', false, 'پوسیدگی دندون، کبد چرب و بالا رفتن تری‌گلیسرید در وزن طبیعی هم ممکنه.'],
    ['شیرین‌کننده‌های بدون کالری برای کنترل وزن در درازمدت توصیه‌ی سازمان جهانی بهداشت‌اند.', false, 'سازمان جهانی بهداشت در سال ۲۰۲۳ گفت برای کنترل وزن از شیرین‌کننده‌های بدون قند استفاده نشه، چون فایده‌ی درازمدتی دیده نشده.'],
  ];
  route('myths', 'myths', 'افسانه یا واقعیت', () => page('بازی', 'افسانه یا واقعیت؟', `${fa(MYTHS.length)} جمله‌ی رایج درباره‌ی قند. هر کدوم رو حدس بزن و توضیحش رو بخون.`,
    `<div class="card stack p4-myth" id="p4m" style="gap:12px" aria-live="polite"></div>${sources([['WHO: Sugars intake guideline (2015)', 'https://www.who.int/publications/i/item/9789241549028'], ['WHO: Non-sugar sweeteners guideline (2023)', 'https://www.who.int/publications/i/item/9789240073616'], ['Wolraich et al., JAMA 1995: sugar and behavior in children', 'https://pubmed.ncbi.nlm.nih.gov/7474248/'], ['Oh & Taylor 2012: brisk walking and chocolate craving', 'https://pubmed.ncbi.nlm.nih.gov/22465597/'], ['Wise et al. 2016: reduced sugar diet and sweetness perception', 'https://pubmed.ncbi.nlm.nih.gov/26843387/'], ['Greer et al. 2013: sleep deprivation and food desire', 'https://pubmed.ncbi.nlm.nih.gov/23922121/'], ['Hoertel et al. 2014: protein breakfast and cravings', 'https://pubmed.ncbi.nlm.nih.gov/24886346/']])}`, 640),
  () => {
    const order = MYTHS.map((_, i) => i).sort(() => Math.random() - .5); let i = 0, score = 0;
    const box = $('#p4m');
    const show = () => {
      if (i >= order.length) { const q = Q(); q.myth = Math.max(q.myth || 0, score); saveQ(q); box.innerHTML = `<h3>${fa(score)} از ${fa(order.length)} درست!</h3><p class="muted">${score >= order.length - 3 ? 'تو یه کارشناس قندی 🏆' : score >= order.length / 2 ? 'خیلی خوب! چند تا باور غلط رو هم کنار گذاشتی.' : 'حالا چیزهای زیادی یاد گرفتی. دوباره امتحان کن!'}</p>${q.myth ? `<p class="small muted">بهترین امتیاز تو: ${fa(q.myth)}</p>` : ''}<button class="btn primary" id="p4mr">دوباره</button>`; $('#p4mr').onclick = () => A.render(); return; }
      const [s] = MYTHS[order[i]];
      box.innerHTML = `<span class="small muted">جمله‌ی ${fa(i + 1)} از ${fa(order.length)} · امتیاز ${fa(score)}</span><p class="p4-ms">«${esc(s)}»</p><div class="row" style="justify-content:center"><button class="btn primary big" data-ans="1">✅ واقعیت</button><button class="btn berry big" data-ans="0">❌ افسانه</button></div>`;
      $$('[data-ans]', box).forEach(b => b.onclick = () => {
        const [, f, why] = MYTHS[order[i]], ok = (b.dataset.ans === '1') === f; if (ok) score++;
        box.innerHTML = `<span class="small muted">جمله‌ی ${fa(i + 1)} از ${fa(order.length)} · امتیاز ${fa(score)}</span><p class="p4-ms">«${esc(MYTHS[order[i]][0])}»</p><div class="p4-verdict ${ok ? 'ok' : 'no'}"><b>${ok ? 'درسته!' : 'نه!'} این جمله ${f ? 'واقعیته' : 'افسانه‌ست'}.</b><p>${esc(why)}</p></div><button class="btn primary" id="p4mn">بعدی</button>`;
        i++; $('#p4mn').onclick = show; $('#p4mn').focus();
      });
    };
    show();
  });

  /* ================= 22. fruit, dates and dried fruit ================= */
  // Approximate total sugars (g) per common portion, rounded from USDA FoodData Central values.
  const FRUIT = [
    ['سیب', 'یک عدد متوسط', 19, 'fresh'], ['گلابی', 'یک عدد متوسط', 17, 'fresh'], ['موز', 'یک عدد متوسط', 14, 'fresh'], ['پرتقال', 'یک عدد متوسط', 12, 'fresh'], ['نارنگی', 'یک عدد', 9, 'fresh'],
    ['انگور', 'یک لیوان (۱۵۰ گرم)', 23, 'fresh'], ['گیلاس', 'یک لیوان (۱۴۰ گرم)', 18, 'fresh'], ['خرمالو', 'یک عدد', 21, 'fresh'], ['انار', 'نصف لیوان دانه', 12, 'fresh'], ['هلو', 'یک عدد متوسط', 13, 'fresh'],
    ['طالبی', 'یک لیوان مکعبی', 13, 'fresh'], ['هندوانه', 'یک لیوان مکعبی', 9, 'fresh'], ['انجیر تازه', 'یک عدد', 8, 'fresh'], ['توت‌فرنگی', 'یک لیوان', 7, 'fresh'], ['کیوی', 'یک عدد', 6, 'fresh'],
    ['خرمای مجول', 'یک عدد بزرگ', 16, 'dry'], ['خرمای مضافتی یا کبکاب', 'یک عدد', 7, 'dry'], ['کشمش', 'یک قاشق غذاخوری', 6, 'dry'], ['توت خشک', 'یک قاشق غذاخوری', 5, 'dry'], ['انجیر خشک', 'یک عدد', 4, 'dry'], ['زردآلوی خشک', 'یک عدد', 2, 'dry'],
    ['آب پرتقال طبیعی', 'یک لیوان', 21, 'juice'], ['آب انار یا آب سیب', 'یک لیوان', 27, 'juice'],
  ];
  const level = g => g >= 16 ? ['berry', 'زیاد'] : g >= 10 ? ['sun', 'متوسط'] : ['mint', 'کم'];
  route('fruit', 'fruit', 'میوه و خرما', () => page('راهنمای تغذیه', 'میوه، خرما و خشکبار؛ چقدر منطقیه؟', 'قند میوه‌ی کامل همراه فیبره و جزو «قند آزاد» نیست. ولی خشکبار و آبمیوه فرق دارن.',
    `<div class="two"><div class="card stack p4-rule" style="gap:6px"><b>🍎 میوه‌ی کامل</b><p class="small">روزی ۲ تا ۳ واحد. با پوست بخور و اگه هوس شیرینی داری، میوه رو با چند مغز یا ماست بخور تا دیرتر گرسنه بشی.</p></div>
      <div class="card stack p4-rule" style="gap:6px"><b>🌴 خرما و خشکبار</b><p class="small">قندشون متراکمه. ۲ تا ۳ خرما یا یک مشت کوچیک (کف دست) خشکبار در روز، ترجیحاً همراه گردو یا بادام.</p></div>
      <div class="card stack p4-rule" style="gap:6px"><b>🧃 آبمیوه</b><p class="small">حتی طبیعی‌اش قند آزاده. اگه می‌خوری، روزی حداکثر یک لیوان کوچیک (۱۵۰ میلی‌لیتر). میوه‌ی کامل همیشه بهتره.</p></div>
      <div class="card stack p4-rule" style="gap:6px"><b>🩺 دیابت داری؟</b><p class="small">مقدار و زمان میوه رو با پزشک یا متخصص تغذیه‌ات هماهنگ کن.</p></div></div>
    <div class="card stack"><b>قند هر واحد، به حبه‌قند</b><div class="p4-table" role="table">${FRUIT.map(([n, u, g, k]) => { const [c, t] = level(g); return `<div class="p4-tr" role="row"><span role="cell"><b>${n}</b><span class="small muted"> · ${u}</span>${k === 'juice' ? ' <span class="chip berry small">قند آزاد</span>' : ''}</span><span role="cell" class="num">${fa(g)} گرم</span><span role="cell">${cubeRow(g)}</span><span role="cell"><span class="chip ${c}">${t}</span></span></div>`; }).join('')}</div>
    <p class="small muted">عددها تقریبی‌اند (از پایگاه داده‌ی غذایی وزارت کشاورزی آمریکا، گرد شده). هر حبه‌قند حدود ۴ گرم حساب شده.</p></div>
    ${sources([['USDA FoodData Central', 'https://fdc.nal.usda.gov/'], ['WHO: Guideline on sugars intake (2015)', 'https://www.who.int/publications/i/item/9789241549028']])}`));

  /* ================= 23. fruit of the season (Persian months) ================= */
  const SEASON = [
    ['فروردین', ['توت‌فرنگی', 'گوجه‌سبز', 'پرتقال', 'لیموشیرین']], ['اردیبهشت', ['توت‌فرنگی', 'گوجه‌سبز', 'چغاله‌بادام', 'گیلاس']], ['خرداد', ['گیلاس', 'زردآلو', 'توت', 'آلبالو', 'هلو']],
    ['تیر', ['هلو', 'زردآلو', 'آلبالو', 'طالبی', 'هندوانه', 'آلو']], ['مرداد', ['هندوانه', 'خربزه', 'انگور', 'انجیر تازه', 'شلیل']], ['شهریور', ['انگور', 'انجیر تازه', 'خربزه', 'سیب', 'گلابی']],
    ['مهر', ['سیب', 'گلابی', 'انار', 'خرمای تازه', 'به']], ['آبان', ['انار', 'خرمالو', 'به', 'سیب', 'کیوی']], ['آذر', ['پرتقال', 'نارنگی', 'خرمالو', 'کیوی', 'انار']],
    ['دی', ['پرتقال', 'نارنگی', 'کیوی', 'لیموشیرین', 'گریپ‌فروت']], ['بهمن', ['پرتقال', 'نارنگی', 'کیوی', 'لیموشیرین', 'سیب']], ['اسفند', ['پرتقال', 'نارنگی', 'سیب', 'کیوی']],
  ];
  const curMonth = () => { try { return Number(new Intl.DateTimeFormat('en-u-ca-persian', { month: 'numeric' }).format(new Date())) - 1; } catch (e) { return 7; } };
  const fruitG = n => (FRUIT.find(f => f[0] === n || n.startsWith(f[0])) || [])[2];
  route('season', 'season', 'میوه‌ی فصل', () => {
    const m = curMonth();
    return page('میوه‌ی فصل', `میوه‌های ${SEASON[m][0]}`, 'میوه‌ی فصل تازه‌تر، خوش‌طعم‌تر و ارزون‌تره و بهترین جایگزین شیرینیه. (بسته به شهر و آب‌وهوا کمی فرق می‌کنه.)',
      `<div class="p4-season">${SEASON.map(([mn, fs], i) => `<div class="card stack ${i === m ? 'p4-now' : ''}" style="gap:6px"><b>${mn}${i === m ? ' · الان' : ''}</b><div class="row small">${fs.map(f => { const g = fruitG(f); return `<span class="chip ${g ? level(g)[0] : ''}">${f}</span>`; }).join('')}</div></div>`).join('')}</div>
      <p class="small muted">رنگ هر میوه: سبز یعنی قند کم در هر واحد، زرد متوسط و صورتی زیاد. <a href="#fruit">جدول کامل میوه و خرما</a></p>`);
  });

  /* ================= 24. sugar in drinks ================= */
  const DRINKS = [
    ['🥤', 'نوشابه‌ی کولا', 'یک قوطی ۳۳۰ میلی‌لیتری', 35], ['🍊', 'نوشابه‌ی میوه‌ای', 'یک قوطی ۳۳۰ میلی‌لیتری', 33], ['🍺', 'ماءالشعیر طعم‌دار', 'یک قوطی ۳۳۰ میلی‌لیتری', 25],
    ['⚡', 'نوشیدنی انرژی‌زا', 'یک قوطی ۲۵۰ میلی‌لیتری', 27], ['🧋', 'چای سرد بطری', 'یک بطری ۵۰۰ میلی‌لیتری', 35], ['🧃', 'آبمیوه‌ی پاکتی', 'یک پاکت ۲۰۰ میلی‌لیتری', 20],
    ['🍫', 'شیرکاکائو', 'یک پاکت ۲۰۰ میلی‌لیتری', 18], ['🥛', 'شیک یا معجون', 'یک لیوان بزرگ ۴۰۰ میلی‌لیتری', 50], ['🍋', 'شربت آبلیمو یا سکنجبین', 'یک لیوان', 25],
    ['☕', 'قهوه‌ی فوری ۳در۱', 'یک ساشه', 11], ['🍵', 'چای با ۲ حبه‌قند', 'یک استکان', 8], ['🫖', 'چای، قهوه یا دمنوش بی‌قند', 'یک لیوان', 0], ['🥛', 'دوغ ساده', 'یک لیوان', 0], ['💧', 'آب', 'یک لیوان', 0],
  ];
  route('drinks', 'drinks', 'قند نوشیدنی‌ها', () => page('نوشیدنی‌ها', 'توی لیوانت چند حبه‌قنده؟', 'نوشیدنی‌های شیرین بزرگ‌ترین منبع قند افزوده‌ان، چون سیر نمی‌کنن و زود خورده می‌شن. سهم پیشنهادی کل روز حدود ۲۵ گرمه (۶ حبه‌قند).',
    `<div class="stack">${DRINKS.map(([i, n, u, g]) => `<div class="card p4-drink"><span class="p4-di">${i}</span><div class="stack" style="gap:2px;min-width:0;flex:1"><b>${n}</b><span class="small muted">${u} · ${g ? `حدود ${fa(g)} گرم، ${fa(cubes(g))} حبه‌قند` : 'بدون قند افزوده'}</span>${g ? cubeRow(g) : '<span class="chip mint small">انتخاب عالی</span>'}</div>${g ? `<span class="chip ${g > 25 ? 'berry' : g > 10 ? 'sun' : 'mint'} num">${fa(Math.round(g / 25 * 100))}٪ سهم روز</span>` : ''}</div>`).join('')}</div>
    <p class="small muted">میانگین تقریبی برندهای رایجه؛ برای عدد دقیق برچسب همون محصول رو ببین. هر حبه‌قند حدود ۴ گرم حساب شده.${on('labelcalc') && inApp() ? ' <a href="#label">ماشین‌حساب برچسب</a>' : ''}</p>`, 720));

  /* ================= 25. 40 names of sugar + quiz ================= */
  const NAMES = [
    ['شکر', 'Sugar'], ['ساکارز', 'Sucrose'], ['گلوکز', 'Glucose'], ['دکستروز', 'Dextrose'], ['فروکتوز', 'Fructose'], ['مالتوز', 'Maltose'], ['لاکتوز (افزوده)', 'Lactose'], ['گالاکتوز', 'Galactose'],
    ['شربت گلوکز', 'Glucose syrup'], ['شربت ذرت', 'Corn syrup'], ['شربت ذرت با فروکتوز بالا', 'High-fructose corn syrup'], ['ایزوگلوکز', 'Isoglucose'], ['شربت گلوکز-فروکتوز', 'Glucose-fructose syrup'], ['شکر اینورت', 'Invert sugar'],
    ['شربت اینورت', 'Invert syrup'], ['شکر قهوه‌ای', 'Brown sugar'], ['شکر نیشکر', 'Cane sugar'], ['آب نیشکر تبخیرشده', 'Evaporated cane juice'], ['ملاس', 'Molasses'], ['شکر نارگیل', 'Coconut sugar'],
    ['عسل', 'Honey'], ['شیره‌ی انگور', 'Grape syrup'], ['شیره‌ی خرما', 'Date syrup'], ['شربت افرا', 'Maple syrup'], ['شربت آگاو', 'Agave syrup'], ['شربت برنج', 'Rice syrup'],
    ['عصاره‌ی مالت', 'Malt extract'], ['شربت مالت جو', 'Barley malt syrup'], ['کنسانتره‌ی آبمیوه', 'Fruit juice concentrate'], ['آب انگور تغلیظ‌شده', 'Grape juice concentrate'], ['کارامل', 'Caramel'], ['گلدن سیروپ', 'Golden syrup'],
    ['تریکل', 'Treacle'], ['شکر پودری (پودر قند)', 'Icing sugar'], ['شکر خام', 'Raw sugar'], ['شکر مسکووادو', 'Muscovado'], ['ترهالوز', 'Trehalose'], ['پودر شیر شیرین‌شده', 'Sweetened milk powder'],
    ['شیر تغلیظ‌شده‌ی شیرین', 'Sweetened condensed milk'], ['مالتودکسترین (رفتار مشابه قند)', 'Maltodextrin'],
  ];
  const NOT = ['نمک', 'روغن آفتابگردان', 'لسیتین', 'اسید سیتریک', 'صمغ زانتان', 'پودر کاکائو', 'آرد سبوس‌دار', 'ویتامین C', 'نشاسته‌ی ذرت', 'پکتین', 'جوش شیرین'];
  route('sugarnames', 'sugarnames', '۴۰ اسم قند', () => page('برچسب خوانی', '۴۰ اسم قند روی برچسب', 'تولیدکننده‌ها گاهی قند رو با چند اسم مختلف می‌نویسن تا «شکر» اول فهرست نیاد. اگه یکی از این‌ها جزو سه ماده‌ی اول فهرست بود، یعنی محصول پرقنده.',
    `<div class="card stack"><div class="p4-names">${NAMES.map(([f, e]) => `<span class="p4-name"><b>${f}</b><span dir="ltr">${e}</span></span>`).join('')}</div><p class="small">💡 هر اسمی که به <b>«ـوز»</b> (<span dir="ltr">-ose</span>) یا <b>«شربت/سیروپ»</b> ختم می‌شه، تقریباً همیشه قنده.</p></div>
    <div class="card stack p4-nq" id="p4nq" aria-live="polite"></div>`, 860),
  () => {
    let i = 0, score = 0; const box = $('#p4nq'), N = 6;
    const ask = () => {
      if (i >= N) { box.innerHTML = `<b>آزمون کوتاه: ${fa(score)} از ${fa(N)}</b><p class="small muted">${score === N ? 'عالی! دیگه قند پنهان ازت قایم نمی‌شه.' : 'یه بار دیگه فهرست رو مرور کن و دوباره امتحان کن.'}</p><button class="btn ghost" id="p4nr">دوباره</button>`; $('#p4nr').onclick = () => { i = 0; score = 0; ask(); }; return; }
      const right = A.pick(NAMES)[0], opts = [right, ...NOT.slice().sort(() => Math.random() - .5).slice(0, 3)].sort(() => Math.random() - .5);
      box.innerHTML = `<b>آزمون کوتاه ${fa(i + 1)} از ${fa(N)}: کدوم یکی قنده؟</b><div class="p4-opts">${opts.map(o => `<button class="btn ghost" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      $$('[data-o]', box).forEach(b => b.onclick = () => { const ok = b.dataset.o === right; if (ok) score++; $$('[data-o]', box).forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('primary'); }); if (!ok) b.classList.add('berry'); i++; setTimeout(ask, 900); });
    };
    ask();
  });

  /* ================= 26–28. guides: kids & family, work & university, eating out ================= */
  const guide = sections => sections.map(([icon, title, items]) => `<div class="card stack" style="gap:6px"><b>${icon} ${title}</b><ul class="p4-list">${items.map(t => `<li>${t}</li>`).join('')}</ul></div>`).join('');
  route('kids', 'kids', 'بچه‌ها و خانواده', () => page('خانواده', 'قند کمتر برای بچه‌ها، بدون دعوا', 'هدف، ممنوع کردن نیست؛ عادی کردن خوراکی‌های کم‌قنده. بچه‌ها از رفتار ما یاد می‌گیرن، نه از حرف ما.',
    `<div class="two">${guide([
      ['🎯', 'چقدر؟', ['سازمان جهانی بهداشت برای بچه‌ها هم قند آزاد رو کمتر از ۱۰٪ انرژی روزانه و ترجیحاً کمتر از ۵٪ توصیه می‌کنه.', 'برای بچه‌های زیر ۲ سال، بیشتر راهنماهای رسمی می‌گن قند افزوده اصلاً لازم نیست.', 'نوشیدنی بچه‌ها: آب و شیر ساده. آبمیوه کم و همراه غذا.']],
      ['🏆', 'جایزه دادن', ['شیرینی رو جایزه یا رشوه نکن («اگه غذاتو بخوری، بستنی می‌گیری»)؛ اینطوری شیرینی ارزشمندتر می‌شه.', 'جایزه‌ی جایگزین: برچسب، بازی با بابا یا مامان، انتخاب کتاب قصه‌ی شب.', 'شیرینی رو هم «بد» یا «ممنوع» صدا نکن؛ بگو «گاهی‌وقت‌ها».']],
      ['🎒', 'مدرسه و تغذیه', ['میان‌وعده‌ی مدرسه: میوه‌ی کامل، نون و پنیر، مغزهای خردشده (برای بچه‌های بزرگ‌تر)، خیار، کشمش کم.', 'آبمیوه‌ی پاکتی و کیک بسته‌ای رو با یه بطری آب و یک میوه عوض کن.', 'بچه رو در خرید و آماده کردن میان‌وعده‌اش شریک کن.']],
      ['🎂', 'تولد و مهمونی', ['اشکالی نداره بچه در تولد کیک بخوره؛ قبلش یک غذای سیرکننده بده که گرسنه نرسه.', 'در تولد خودتون: کیک کوچیک‌تر، میوه‌آرایی و بازی‌های بیشتر.', 'به جای سبد شیرینی، هدیه‌ی کوچیک غیرخوراکی.']],
      ['🏠', 'خونه', ['شیرینی رو از جلوی چشم بردار و ظرف میوه رو بذار وسط میز.', 'صبحانه‌ی پروتئین‌دار (تخم‌مرغ، پنیر، شیر) هوس عصر رو کم می‌کنه.', 'خودتون الگو باشید: چای بی‌قند پدر و مادر از هر نصیحتی مؤثرتره.']],
      ['🦷', 'دندون‌ها', ['دفعات خوردن شیرینی از مقدارش مهم‌تره؛ شیرینی رو همراه غذا بده نه بین وعده‌ها.', 'بعد از خوراکی شیرین، آب بنوشن و شب‌ها حتماً مسواک.', 'شیر یا آبمیوه در شیشه‌ی شیر موقع خواب، دندون‌ها رو خراب می‌کنه.']],
    ])}</div><p class="small muted">برای بچه‌ای که بیماری، حساسیت یا مشکل رشد داره، با پزشک کودک هماهنگ کن.</p>
    ${sources([['WHO: Guideline on sugars intake for adults and children', 'https://www.who.int/publications/i/item/9789241549028'], ['NHS: Sugar — top tips for families', 'https://www.nhs.uk/healthier-families/food-facts/sugar/'], ['AAP: Added sugar in kids’ diets', 'https://www.healthychildren.org/English/healthy-living/nutrition/Pages/sugar.aspx']])}`));
  route('work', 'work', 'محل کار و دانشگاه', () => page('محل کار', 'بی‌قند پشت میز کار', 'ریزه‌خواری روزانه بیشتر سر کار اتفاق میفته: شیرینی همکار، ساعت ۴ عصر، خستگی جلسه‌ها.',
    `<div class="two">${guide([
      ['🗄', 'کشوی میز', ['یک «کشوی امن» درست کن: گردو، بادام، نخودچی، خرما (۲ تا ۳ عدد)، چای کیسه‌ای و دمنوش.', 'یک بطری آب پر روی میز؛ تشنگی رو با هوس اشتباه نگیر.', 'شکلات و بیسکویت رو از کشو بیرون ببر؛ چیزی که دم دست نیست، کمتر خورده می‌شه.']],
      ['🍰', 'شیرینی همکار', ['«ممنون، الان سیرم. بذار برای بعد» کافیه. لازم نیست توضیح بدی.', 'اگه خواستی بخوری، یک تکه‌ی کوچیک، نشسته و با آرامش؛ نه سر پا و از روی عادت.', 'برای مناسبت‌های اداره، پیشنهاد میوه‌آرایی یا آجیل بده.']],
      ['🕓', 'افت ساعت ۴ عصر', ['ناهار پروتئین و سبزی کافی داشته باشه تا افت قند عصر کمتر بشه.', '۵ دقیقه راه رفتن یا بالا و پایین رفتن از پله‌ها، از یک کیک انرژی بیشتری می‌ده.', 'میان‌وعده‌ی برنامه‌ریزی‌شده (میوه + مغز) قبل از اینکه خیلی گرسنه بشی.']],
      ['☕', 'چای و قهوه', ['قند چای رو هفته‌ای نصف کن؛ بعد از چند هفته به چای بی‌قند عادت می‌کنی.', 'قهوه‌ی ۳در۱ رو با قهوه‌ی فوری ساده و کمی شیر عوض کن.', 'با چای، به جای قند یا شیرینی، یکی دو خرما یا چند تکه پسته.']],
      ['🎓', 'دانشگاه و شب امتحان', ['قبل از امتحان خواب کافی بیشتر از نوشیدنی انرژی‌زا کمک می‌کنه.', 'سر درس: آب، میوه، مغزها. شکلات تلخ (یک مربع) اگه خیلی لازم شد.', 'بوفه: ساندویچ پنیر یا تخم‌مرغ به جای کیک و آبمیوه.']],
      ['🧑‍🤝‍🧑', 'همراه پیدا کن', ['یک همکار رو با خودت همراه کن؛ با هم چالش «یک هفته بی‌نوشابه» بذارید.', on('buddy') ? 'از بخش «یار بی‌قند» زنجیره‌ی مشترک بسازید.' : 'هفته‌ای یک بار پیشرفتتون رو به هم بگید.', 'از بخش «جمله‌های تعارف» برای رد کردن مؤدبانه کمک بگیر.']],
    ])}</div>`));
  route('eatout', 'eatout', 'بیرون غذا خوردن', () => page('بیرون از خونه', 'کافه، رستوران و مهمونی', 'بیرون از خونه، قند پنهان بیشتره و کنترل کمتر. با کمی برنامه‌ریزی، لازم نیست قید بیرون رفتن رو بزنی.',
    `<div class="two">${guide([
      ['☕', 'کافه', ['قهوه یا چای رو بی‌قند یا «با شیر، بدون سیروپ» سفارش بده.', 'لاته‌ی طعم‌دار، موکا و فراپه معمولاً ۳ تا ۸ حبه‌قند دارن؛ اندازه‌ی کوچیک یا بدون سیروپ بخواه.', 'اگه کیک خواستی، با دوستت نصف کنید.']],
      ['🍔', 'فست‌فود', ['نوشابه رو با آب یا دوغ ساده عوض کن؛ همین یک تغییر حدود ۹ حبه‌قند کم می‌کنه.', 'سس‌ها (کچاپ، باربیکیو، سس شیرین تایلندی) قند دارن؛ کمتر یا جدا بخواه.', 'سالاد کنار غذا رو با سس جدا سفارش بده.']],
      ['🍽', 'رستوران ایرانی', ['کباب، جوجه و خورشت‌ها انتخاب‌های خوبی‌ان؛ مراقب نوشابه، دوغ‌های شیرین و دسر باش.', 'برنج رو کمتر بکش و سبزی و ماست بیشتر.', 'چای بعد از غذا رو بی‌قند بخور یا با یک خرما.']],
      ['💍', 'عروسی و مهمونی بزرگ', ['گرسنه نرو؛ یک وعده‌ی سبک پروتئین‌دار قبلش بخور.', 'از قبل تصمیم بگیر: «فقط یک تکه کیک، نشسته و با لذت».', 'لیوانت رو همیشه پر از آب یا دوغ نگه دار تا کمتر شربت تعارفت کنن.']],
      ['🛒', 'خرید بیرون', ['هیچ‌وقت گرسنه به سوپرمارکت نرو.', 'جلوی صندوق (جای شکلات‌ها) سریع رد شو.', 'برچسب رو بخون: قند در هر ۱۰۰ گرم بیشتر از ۲۲٫۵ گرم یعنی «زیاد».']],
      ['✈️', 'سفر', ['تو کیف همیشه یک میان‌وعده‌ی امن داشته باش: مغزها و یک میوه.', 'سوغاتی‌ها لازم نیست شیرینی باشن؛ پسته، زعفران یا صنایع‌دستی.', 'در سفر برنامه رو کامل ول نکن؛ فقط چک‌لیست شب رو بزن.']],
    ])}</div>${sources([['NHS: Food labels — high, medium and low sugar', 'https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/how-to-read-food-labels/']])}`));

  /* ================= 29–31. recipes: rating, cooked, note, share, print ================= */
  const shareUrl = (kind, id) => `${siteUrl()}#${kind}=${encodeURIComponent(id)}`;
  async function share(title, url) {
    if (navigator.share) { try { await navigator.share({ title, text: title + ' — حبه', url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    A.toast(await copyText(url) ? 'لینک کپی شد. حالا هرجا خواستی بفرستش.' : url, 'bell');
  }
  add('recipeEnd', r => {
    let out = '';
    if (on('recipenotes')) {
      const n = Q().rec[r.id] || {};
      out += `<div class="card stack p4-rnote" style="gap:8px"><b>نظر من درباره‌ی این رسپی</b>
        <div class="row"><div class="p4-stars" role="radiogroup" aria-label="امتیاز">${[1, 2, 3, 4, 5].map(i => `<button type="button" role="radio" aria-checked="${n.stars === i}" data-star="${i}" aria-label="${fa(i)} ستاره" class="${(n.stars || 0) >= i ? 'on' : ''}">★</button>`).join('')}</div>
        <button type="button" class="btn ghost" id="p4cook">👩‍🍳 پختمش!${n.cooked ? ` (${fa(n.cooked)} بار)` : ''}</button></div>
        <textarea class="input" id="p4note" rows="2" maxlength="500" placeholder="یادداشت برای خودم، مثلاً: با خرمای کمتر هم خوب شد">${esc(n.note || '')}</textarea></div>`;
    }
    const btns = [on('share') ? '<button type="button" class="btn ghost" id="p4shr">🔗 اشتراک‌گذاری</button>' : '', on('printrecipe') ? '<button type="button" class="btn ghost" id="p4prn">🖨 چاپ</button>' : ''].join('');
    return out + (btns ? `<div class="row no-print">${btns}</div>` : '');
  });
  add('recipeMount', (r, el) => {
    const q = Q(), n = () => (q.rec[r.id] = q.rec[r.id] || {});
    $$('[data-star]', el).forEach(b => b.onclick = () => { n().stars = Number(b.dataset.star); saveQ(q); $$('[data-star]', el).forEach(x => { x.classList.toggle('on', Number(x.dataset.star) <= n().stars); x.setAttribute('aria-checked', x === b); }); });
    const c = $('#p4cook', el); if (c) c.onclick = () => { n().cooked = (n().cooked || 0) + 1; n().last = A.dateKey(); saveQ(q); c.textContent = `👩‍🍳 پختمش! (${fa(n().cooked)} بار)`; A.toast('نوش جان! 🍰', null, 'happy'); };
    const t = $('#p4note', el); if (t) { let tm; t.oninput = () => { clearTimeout(tm); tm = setTimeout(() => { n().note = t.value.trim().slice(0, 500); saveQ(q); }, 600); }; }
    const s = $('#p4shr', el); if (s) s.onclick = () => share(r.title, shareUrl('r', r.id));
    const p = $('#p4prn', el); if (p) p.onclick = () => { document.body.classList.add('p4-printing'); setTimeout(() => { window.print(); document.body.classList.remove('p4-printing'); }, 50); };
  });
  add('articleEnd', a => on('share') ? `<div class="row no-print"><button type="button" class="btn ghost" data-p4sa="${esc(a.id)}">🔗 اشتراک‌گذاری این مقاله</button></div>` : '');
  add('articleMount', (a, el) => { const b = $('[data-p4sa]', el); if (b) b.onclick = () => share(a.title, shareUrl('a', a.id)); });
  // "My cooked recipes" strip on the recipes page.
  add('recipesTop', () => {
    if (!on('recipenotes')) return '';
    const rec = Q().rec, ids = Object.keys(rec).filter(k => rec[k].cooked || rec[k].stars >= 4).sort((a, b) => (rec[b].stars || 0) - (rec[a].stars || 0));
    const list = ids.map(id => A.RECIPES.find(r => r.id === id)).filter(Boolean).slice(0, 8);
    return list.length ? `<div class="card stack" style="gap:8px"><b>👩‍🍳 رسپی‌های محبوب من</b><div class="row">${list.map(r => `<button class="chip" data-p4r="${esc(r.id)}">${esc(r.title)}${rec[r.id].stars ? ' ' + '★'.repeat(rec[r.id].stars) : ''}</button>`).join('')}</div></div>` : '';
  });
  add('mount', r => { if (r === 'recipes') $$('[data-p4r]').forEach(b => b.onclick = () => A.openRecipe(b.dataset.p4r)); });
  // Shared links: #r=<recipe id> and #a=<article id>.
  function deepLink() {
    const m = location.hash.match(/^#(r|a)=(.+)$/); if (!m) return false;
    const id = decodeURIComponent(m[2]);
    history.replaceState(null, '', m[1] === 'r' ? '#recipes' : '#learn');
    setTimeout(() => { A.render(); setTimeout(() => m[1] === 'r' ? A.openRecipe(id) : A.openArticle(id), 50); }, 0);
    return true;
  }
  add('boot', () => { deepLink(); addEventListener('hashchange', deepLink); });

  /* ================= 40–41. app-icon badge + persistent storage ================= */
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function badge() {
    if (!('setAppBadge' in navigator) || !on('appbadge')) return;
    try { const due = inApp() && !A.D().cycleDone && new Date().getHours() >= 20 && !A.D().log[A.logKey()]?.done; (due ? navigator.setAppBadge(1) : navigator.clearAppBadge()).catch(() => {}); } catch (e) {}
  }
  add('boot', () => {
    badge(); setInterval(badge, 5 * 60e3);
    if (on('persist') && standalone() && navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});
  });
  add('mount', badge);

  /* ================= 46. invite a friend ================= */
  const inviteText = () => `من دارم با «حبه» قند و شیرینی رو کم می‌کنم؛ یه برنامه‌ی ۲۱ روزه‌ی قدم‌به‌قدم با متن روزانه، دکمه‌ی «هوس دارم» و رسپی‌های بی‌قند. بیا با هم شروع کنیم 🌱`;
  route('invite', 'invite', 'دعوت دوست', () => page('دعوت', 'با یه دوست، راحت‌تره', 'پژوهش‌ها نشون می‌دن تغییر عادت با همراه، ماندگارتره. لینک حبه رو برای یه دوست یا یکی از خانواده بفرست.',
    `<div class="card stack" style="gap:10px"><p class="p4-quote">${esc(inviteText())}</p><code dir="ltr" class="p4-url">${esc(siteUrl())}</code>
      <div class="row"><button class="btn primary" id="p4inv">📤 فرستادن</button><button class="btn ghost" id="p4cp">📋 کپی متن و لینک</button>
      <a class="btn ghost" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(siteUrl())}&text=${encodeURIComponent(inviteText())}">تلگرام</a>
      <a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(inviteText() + '\n' + siteUrl())}">واتساپ</a></div></div>
    ${on('buddy') && inApp() ? '<p class="small muted">وقتی دوستت ثبت‌نام کرد، از <a href="#friends">یار بی‌قند</a> زنجیره‌ی مشترک بسازید.</p>' : ''}`, 640),
  () => {
    $('#p4inv').onclick = () => share('حبه، یار روزهای بی‌قند', siteUrl());
    $('#p4cp').onclick = async () => A.toast(await copyText(inviteText() + '\n' + siteUrl()) ? 'کپی شد ✓' : 'کپی نشد؛ متن رو خودت انتخاب کن.', 'bell');
  });

  /* ================= 47. about & method ================= */
  route('about', 'about', 'درباره‌ی حبه', () => page('درباره‌ی حبه', 'حبه چیه و چرا این‌طوری کار می‌کنه؟', 'حبه یک برنامه‌ی روان‌شناختی قدم‌به‌قدم برای کم کردن قند افزوده‌ست؛ نه رژیم لاغری، نه قانون‌های سخت.',
    `<div class="stack">${[
      ['📅', '۶۳ روز، در سه دوره‌ی ۲۱ روزه', 'در یک پژوهش معروف، شکل گرفتن یک عادت تازه به‌طور میانگین حدود ۶۶ روز طول کشید (از ۱۸ تا ۲۵۴ روز). برای همین حبه سه دوره‌ی ۲۱ روزه پشت هم داره: اول کم کردن، بعد تثبیت، بعد زندگی عادی بدون وابستگی.'],
      ['🧠', 'تکنیک‌های رفتاری و شناختی', 'هر روز یک متن کوتاه با یک تکنیک: شناختن فکرهای خودکار، جایگزین کردن عادت، مهربانی با خود بعد از لغزش و…'],
      ['🗺', '«اگر… آنگاه…»', 'نوشتن نقشه‌ی مشخص برای موقعیت‌های سخت («اگر ساعت ۴ عصر هوس کردم، آنگاه یک سیب و چند گردو می‌خورم») در ده‌ها پژوهش، احتمال انجام کار درست رو بالا برده.'],
      ['🌊', 'موج‌سواری روی هوس', 'دکمه‌ی «هوس دارم» بر پایه‌ی تمرین‌های ذهن‌آگاهی ساخته شده: هوس رو می‌بینی، اسمش رو می‌ذاری و می‌ذاری مثل موج رد بشه.'],
      ['💚', 'بدون شرمندگی', 'لغزش بخشی از مسیره. پژوهش‌ها نشون می‌دن مهربانی با خود بعد از یک لغزش، از خوردن بیشتر جلوگیری می‌کنه. برای همین زنجیره‌ات با یک روز بد صفر نمی‌شه.'],
      ['🎯', 'هدف علمی', 'سازمان جهانی بهداشت توصیه می‌کنه قند آزاد کمتر از ۱۰٪ انرژی روزانه و ترجیحاً کمتر از ۵٪ (حدود ۲۵ گرم یا ۶ حبه‌قند) باشه. دفترچه‌ی قند حبه بر همین اساسه.'],
    ].map(([i, t, d]) => `<div class="card row p4-about" style="flex-wrap:nowrap;align-items:flex-start"><span class="p4-di">${i}</span><div class="stack" style="gap:4px"><b>${t}</b><p class="small">${d}</p></div></div>`).join('')}</div>
    <div class="card stack" style="gap:6px;border-color:var(--berry-soft)"><b>⚠️ حبه جای پزشک نیست</b><p class="small">اگر دیابت داری و دارو مصرف می‌کنی، باردار یا شیرده هستی، زیر ۱۸ سالی یا سابقه‌ی اختلال خوردن داری، پیش از تغییر رژیم با پزشک یا متخصص تغذیه مشورت کن.</p></div>
    ${sources([['Lally et al. 2010: How are habits formed', 'https://doi.org/10.1002/ejsp.674'], ['Gollwitzer & Sheeran 2006: Implementation intentions meta-analysis', 'https://doi.org/10.1016/S0065-2601(06)38002-1'], ['Bowen & Marlatt 2009: Surfing the urge', 'https://pubmed.ncbi.nlm.nih.gov/20025374/'], ['Adams & Leary 2007: Self-compassion and eating', 'https://doi.org/10.1521/jscp.2007.26.10.1120'], ['WHO: Guideline on sugars intake (2015)', 'https://www.who.int/publications/i/item/9789241549028']])}
    <div class="row">${A.user ? '<a class="btn primary" href="#today">برگشت به برنامه</a>' : '<a class="btn primary big" href="#signup">شروع کن</a>'}<a class="btn ghost" href="#privacy">حریم خصوصی</a></div>`, 760));

  /* ================= 48. privacy ================= */
  route('privacy', 'privacy', 'حریم خصوصی', () => {
    const online = A.STORE && A.STORE.mode !== 'local';
    return page('حریم خصوصی', 'اطلاعاتت کجا می‌ره؟', 'خلاصه: فقط چیزهایی که برای کار برنامه لازمه ذخیره می‌شه، تبلیغ و ردیاب نداریم و اطلاعاتت رو به کسی نمی‌فروشیم.',
      `<div class="stack">${[
        ['💾', 'چی ذخیره می‌شه؟', 'اسم و ایمیلت، جواب‌های پرسش‌نامه‌ی شروع، تیک‌های روزانه، یادداشت‌ها، هوس‌های ثبت‌شده و تنظیمات یادآورها.'],
        ['☁️', 'کجا؟', online ? 'در حساب کاربری‌ات روی سرور (Supabase) با قوانین دسترسی که فقط به خودت اجازه‌ی دیدن اطلاعاتت رو می‌ده. یک نسخه هم روی همین دستگاه نگه داشته می‌شه تا آفلاین هم کار کنه.' : 'در این نسخه، همه‌چیز فقط در مرورگر همین دستگاه ذخیره می‌شه. اگه حافظه‌ی مرورگر پاک بشه، اطلاعات هم پاک می‌شه؛ از «پشتیبان‌گیری» استفاده کن.'],
        ['📷', 'عکس‌ها', 'عکس‌های «دلیل‌های من» فقط روی همین دستگاه می‌مونن و جایی فرستاده نمی‌شن. عکس بشقاب هم به همین شکل.'],
        ['🔔', 'اعلان‌ها', 'اگه اعلان رو روشن کنی، یک شناسه‌ی اعلان مرورگر ذخیره می‌شه تا یادآورها برسن. با خروج از حساب پاک می‌شه.'],
        ['🤝', 'دوستان', 'در «یار بی‌قند» و «لیگ» فقط اسم مستعار و امتیاز کارهای سالم دیده می‌شه، نه لغزش‌ها یا یادداشت‌هات.'],
        ['🚫', 'چی نداریم؟', 'تبلیغ، فروش اطلاعات، ابزار ردیابی تبلیغاتی. فونت‌های سایت از Google Fonts بارگذاری می‌شن.'],
        ['🗑', 'پاک کردن', 'از «تنظیمات ← شروع دوباره» می‌تونی کل پیشرفتت رو پاک کنی. برای پاک شدن کامل حساب، به مدیر سایت پیام بده.'],
        ['⬇️', 'داده‌ها مال خودته', 'از تنظیمات می‌تونی پشتیبان یا خروجی CSV بگیری.'],
      ].map(([i, t, d]) => `<div class="card row p4-about" style="flex-wrap:nowrap;align-items:flex-start"><span class="p4-di">${i}</span><div class="stack" style="gap:4px"><b>${t}</b><p class="small">${d}</p></div></div>`).join('')}</div>`, 760);
  });

  /* ================= footer links + tools hub ================= */
  add('boot', () => {
    const f = $('.footer .wrap'); if (!f) return;
    let nav = $('.cp-foot', f); if (!nav) { f.insertAdjacentHTML('afterbegin', '<nav class="row cp-foot" aria-label="لینک‌ها"></nav>'); nav = $('.cp-foot', f); }
    const links = [['about', 'درباره‌ی حبه'], ['privacy', 'حریم خصوصی'], ['myths', 'افسانه یا واقعیت'], ['drinks', 'قند نوشیدنی‌ها'], ['fruit', 'میوه و خرما']].filter(([k]) => on(k));
    nav.insertAdjacentHTML('beforeend', links.map(([k, t]) => `<a href="#${k}">${t}</a>`).join(''));
  });
  tool('myths', '🎲', 'افسانه یا واقعیت', `${fa(MYTHS.length)} جمله‌ی رایج درباره‌ی قند؛ بازی کن و یاد بگیر`, 'myths');
  tool('drinks', '🥤', 'قند نوشیدنی‌ها', 'توی لیوانت چند حبه‌قنده؟', 'drinks');
  tool('fruit', '🍎', 'میوه و خرما', 'چند تا خرما در روز منطقیه؟', 'fruit');
  tool('season', '🍊', 'میوه‌ی فصل', 'میوه‌های هر ماه شمسی', 'season');
  tool('sugarnames', '🏷', '۴۰ اسم قند', 'قندهای پنهان روی برچسب + آزمون', 'sugarnames');
  tool('kids', '🧒', 'بچه‌ها و خانواده', 'مدرسه، تولد و جایزه بدون شیرینی', 'kids');
  tool('work', '💼', 'محل کار و دانشگاه', 'کشوی امن، شیرینی همکار، افت عصر', 'work');
  tool('eatout', '🍽', 'بیرون غذا خوردن', 'کافه، فست‌فود، رستوران، عروسی', 'eatout');
  tool('invite', '💌', 'دعوت دوست', 'با یه همراه، راحت‌تره', 'invite');
  tool('about', 'ℹ️', 'درباره‌ی حبه', 'روش علمی و منابع', 'about');
  tool('privacy', '🔒', 'حریم خصوصی', 'اطلاعاتت کجا ذخیره می‌شه', 'privacy');
});
