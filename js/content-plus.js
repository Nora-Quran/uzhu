/* Uzhu content improvements (plugin C): try day 1 without signup, global search, FAQ, glossary + article tooltips,
   article key points / reading time / related / evidence, recipe nutrition + tags + favorites, cook mode with wake lock,
   servings scaler, recipe tag filters + search, "for your goal" card, weekly meal plan, daily takeaway.
   Data comes from js/content-data.js (window.UZHU_CONTENT). Every feature is gated by A.site.settings.features.<key> !== false. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const C = window.UZHU_CONTENT || {};
  const RM = C.recipeMeta || {}, AM = C.articleMeta || {}, DM = C.dayMeta || {};
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const page = (eyebrow, title, sub, body) => `<section class="wrap stack" style="gap:18px">
    <div class="section-head" style="margin:0"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${body}</section>`;
  // Persian/Arabic digits → Latin, and lower-case, so search matches whatever keyboard people type with.
  const norm = s => String(s || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/‌/g, ' ').toLowerCase();
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ');

  /* ---------- favorites (logged in: account data, guest: this browser) ---------- */
  const favs = () => {
    if (A.user) return (A.D().cp_fav = A.D().cp_fav || []);
    try { return JSON.parse(localStorage.getItem('uzhu_fav') || '[]'); } catch (e) { return []; }
  };
  const toggleFav = id => {
    const f = favs(), i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    if (A.user) A.save(); else try { localStorage.setItem('uzhu_fav', JSON.stringify(f)); } catch (e) {}
    return i < 0;
  };

  /* ---------- 1. try day 1 without signing up ---------- */
  add('homeHero', () => on('trial') ? `<a class="btn sun" href="#try">روز اول رو بدون ثبت‌نام امتحان کن</a>` : '');
  A.titles.try = 'امتحان روز اول';
  A.views.try = () => {
    const d = A.PROGRAM.cycles[0]?.days[0];
    if (!d) return page('امتحان', 'روز اول', '', '<div class="card">محتوا بارگذاری نشد.</div>');
    const m = DM.c1d1 || {};
    return `<section class="wrap stack" style="gap:16px;max-width:760px">
      <div class="card pop greet"><div>${A.ART.mascot('happy', { arms: 'wave' })}</div><div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">پیش‌نمایش رایگان</span><h2>این روز اول برنامه‌ی اوژوئه</h2><p class="muted">همین الان بخونش و کارهاش رو امتحان کن. اگه خوشت اومد، با ثبت‌نام بقیه‌ی ۶۳ روز، یادآورها و چک‌لیست شبانه برات باز می‌شه.</p></div></div>
      <article class="card reading stack">
        <div class="row" style="justify-content:space-between"><span class="eyebrow">متن روز ۱${m.readMin ? `، ${fa(m.readMin)} دقیقه خوندن` : ''}</span><span class="chip lav">${esc(d.technique)}</span></div>
        <h2>${esc(d.title)}</h2>${d.read.map(p => `<p>${esc(p)}</p>`).join('')}
        ${m.takeaway ? `<div class="cp-take"><b>چکیده‌ی امروز</b><p>${esc(m.takeaway)}</p></div>` : ''}
      </article>
      <div class="mission stack" style="gap:6px"><b>🎯 مأموریت امروز</b><p>${esc(d.mission)}</p></div>
      ${(d.tasks || []).length ? `<div class="card stack" style="gap:8px"><b>کارهای امروز (امتحانی، ذخیره نمی‌شه)</b>${d.tasks.map((t, i) => `<label class="check" for="tt${i}"><input type="checkbox" id="tt${i}"><span>${esc(typeof t === 'string' ? t : t.text || t.t || '')}</span></label>`).join('')}</div>` : ''}
      <div class="card stack" style="gap:6px;background:var(--lav-soft);border-color:transparent"><b>🔬 نکته‌ی علمی</b><p>${esc(d.tip)}</p></div>
      <div class="card pop stack cp-cta" style="gap:10px;text-align:center"><h3>آماده‌ای ادامه بدی؟</h3><p class="muted">ثبت‌نام رایگانه و فقط یک ایمیل لازمه.</p><div class="row" style="justify-content:center"><a class="btn primary big" href="#signup">رایگان شروع کن</a><a class="btn ghost" href="#recipes">دستورهای بی‌قند</a></div></div>
    </section>`;
  };
  A.mounts.try = () => {
    $$('#app .check input').forEach(i => i.onchange = () => { if ($$('#app .check input').every(x => x.checked)) { A.confetti(); A.toast('آفرین! روز اول رو کامل کردی. با ثبت‌نام، فردا روز دوم برات باز می‌شه.', null, 'happy'); } });
  };

  /* ---------- 2. global search ---------- */
  let index = null; const extOpen = [];
  function buildIndex() {
    const out = [];
    A.RECIPES.forEach(r => out.push({ k: 'recipe', id: r.id, icon: '🍰', title: r.title, sub: r.category, text: [r.title, r.category, r.intro, ...(r.ingredients || []), ...(r.tags || []), ...((RM[r.id] || {}).tags || [])].join(' ') }));
    A.ARTICLES.articles.forEach(a => out.push({ k: 'article', id: a.id, icon: '📖', title: a.title, sub: 'علم قند', text: [a.title, a.summary, strip(a.html)].join(' ') }));
    Object.entries(A.EX.moves || {}).forEach(([id, m]) => out.push({ k: 'move', id, icon: '🧘', title: m.name, sub: m.type, text: [m.name, m.en, m.type, m.how ? [].concat(m.how).join(' ') : ''].join(' ') }));
    (A.SWAPS || []).forEach(([cat, from, to, note]) => out.push({ k: 'swap', id: from, icon: '🔁', title: `${from} ← ${to}`, sub: 'جایگزین، ' + cat, text: [cat, from, to, note].join(' '), note }));
    (C.faq || []).forEach((f, i) => out.push({ k: 'faq', id: String(i), icon: '❓', title: f.q, sub: 'پرسش پرتکرار', text: f.q + ' ' + f.a, note: f.a }));
    (C.glossary || []).forEach(g => out.push({ k: 'term', id: g.term, icon: '🔤', title: g.term + (g.en ? ` (${g.en})` : ''), sub: 'واژه‌نامه', text: [g.term, g.en, g.def].join(' '), note: g.def }));
    [...A.tools.filter(t => !t.show || t.show()), ...[['mealplan', 'برنامه‌ی غذایی هفته'], ['faq', 'پرسش‌های پرتکرار'], ['glossary', 'واژه‌نامه']].filter(x => on(x[0])).map(([route, title]) => ({ route, title }))]
      .filter((t, i, a) => a.findIndex(x => x.route === t.route) === i).forEach(t => out.push({ k: 'tool', id: t.route, icon: t.icon || '🧰', title: t.title, sub: 'ابزار', text: t.title + ' ' + (t.desc || '') }));
    (A.searchExtra || []).forEach(f => { try { f().forEach(x => out.push({ ...x, k: 'ext', group: x.group || (x.sub === 'ابزار' ? 'ابزارها' : 'خواب'), id: String(extOpen.push(x.open) - 1) })); } catch (e) {} });
    out.forEach(o => { o.n = norm(o.text); o.nt = norm(o.title); });
    return out;
  }
  const KIND = { recipe: 'دستورها', article: 'مقاله‌ها', move: 'حرکت‌های ورزشی', swap: 'جایگزین‌ها', faq: 'پرسش‌ها', term: 'واژه‌ها', tool: 'ابزارها', ext: 'خواب' };
  function search(q) {
    const words = norm(q).split(/\s+/).filter(w => w.length > 1 || /\d/.test(w));
    if (!words.length) return [];
    index = index || buildIndex();
    return index.map(o => {
      if (!words.every(w => o.n.includes(w))) return null;
      return { o, score: words.reduce((s, w) => s + (o.nt.includes(w) ? 3 : 1), 0) };
    }).filter(Boolean).sort((a, b) => b.score - a.score).map(x => x.o);
  }
  let lastQ = '';
  A.titles.search = 'جست‌وجو';
  A.views.search = () => page('جست‌وجو', 'دنبال چی می‌گردی؟', 'دستور، مقاله، حرکت ورزشی، جایگزین، پرسش یا واژه.',
    `<input class="input cp-q" id="cpq" type="search" placeholder="مثلاً: کیک، پلی‌کیستیک، پیاده‌روی، نوشابه" value="${esc(lastQ)}" autocomplete="off">
     <div id="cpres" class="stack" style="gap:14px"></div>`);
  A.mounts.search = () => {
    index = null; extOpen.length = 0; // rebuild: admin toggles and new content apply right away
    const inp = $('#cpq'), res = $('#cpres');
    const draw = () => {
      lastQ = inp.value;
      const r = search(inp.value);
      if (!inp.value.trim()) { res.innerHTML = `<div class="row">${['کیک', 'خرما', 'انسولین', 'یوگا', 'خواب', 'نوشابه', 'شیرین‌کننده'].map(w => `<button class="chip" data-w="${w}">${w}</button>`).join('')}</div>`; }
      else if (!r.length) res.innerHTML = `<div class="card">چیزی پیدا نشد. یک کلمه‌ی کوتاه‌تر امتحان کن.</div>`;
      else {
        const g = {}; r.slice(0, 60).forEach(o => { const gk = o.k === 'ext' ? o.group : KIND[o.k]; (g[gk] = g[gk] || []).push(o); });
        res.innerHTML = Object.entries(g).map(([gk, list]) => `<div class="stack" style="gap:8px"><b>${esc(gk)} <span class="muted small">(${fa(list.length)})</span></b>
          ${list.map(o => `<button class="card cp-hit" data-k="${o.k}" data-id="${esc(o.id)}"><span class="cp-hi">${o.icon}</span><span class="stack" style="gap:2px;min-width:0"><b>${esc(o.title)}</b><span class="small muted">${esc(o.sub || '')}</span>${o.note && (o.k === 'swap' || o.k === 'term' || o.k === 'ext') ? `<span class="small">${esc(o.note)}</span>` : ''}</span></button>`).join('')}</div>`).join('');
      }
      $$('[data-w]', res).forEach(b => b.onclick = () => { inp.value = b.dataset.w; draw(); });
      $$('.cp-hit', res).forEach(b => b.onclick = () => {
        const { k, id } = b.dataset;
        if (k === 'recipe') A.openRecipe(id);
        else if (k === 'article') A.openArticle(id);
        else if (k === 'move') A.openMove(id);
        else if (k === 'faq') { faqOpen = Number(id); faqCat = 'همه'; A.go('faq'); }
        else if (k === 'term') { glossQ = id; A.go('glossary'); }
        else if (k === 'ext') extOpen[Number(id)]?.();
        else if (k === 'swap') A.go(A.user ? 'swaps' : 'search');
        else A.go(id);
      });
    };
    let t; inp.oninput = () => { clearTimeout(t); t = setTimeout(draw, 120); };
    draw(); inp.focus();
  };
  // A search button in the header on every page.
  add('mount', () => {
    const nav = $('#nav'); if (!nav || !on('search') || $('.cp-sbtn', nav)) return;
    const a = document.createElement('a'); a.href = '#search'; a.className = 'cp-sbtn'; a.setAttribute('aria-label', 'جست‌وجو'); a.textContent = '🔍';
    if ((location.hash || '').slice(1) === 'search') a.classList.add('on');
    nav.prepend(a);
  });
  // Phones hide the signed-in menu (the bottom tab bar replaces it), so keep search and sleep one tap away in the header.
  add('mount', r => {
    const w = $('.topbar .wrap'); if (!w) return;
    let q = $('.cp-quick', w); if (!q) { q = document.createElement('div'); q.className = 'cp-quick'; w.appendChild(q); }
    const items = [on('search') && ['search', '🔍', 'جست‌وجو'], on('sleep') && A.views.sleep && ['sleep', '😴', 'بخش خواب']].filter(Boolean);
    q.innerHTML = items.map(([h, i, l]) => `<a href="#${h}" aria-label="${l}" title="${l}" class="${r === h ? 'on' : ''}">${i}</a>`).join('');
  });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') && on('search')) { e.preventDefault(); A.go('search'); } });

  /* ---------- 3. FAQ ---------- */
  let faqOpen = -1, faqCat = 'همه';
  A.titles.faq = 'پرسش‌های پرتکرار';
  A.views.faq = () => {
    const list = C.faq || [];
    const cats = ['همه', ...new Set(list.map(f => f.cat).filter(Boolean))];
    return page('پرسش‌های پرتکرار', 'سؤال‌هایی که بیشتر از همه می‌پرسن', 'جواب‌ها کوتاه و بر پایه‌ی پژوهش‌های تازه‌ست. جای مشاوره‌ی پزشکی رو نمی‌گیره.',
      `<div class="filters">${cats.map(c => `<button data-fc="${esc(c)}" class="${c === faqCat ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>
       <div class="stack cp-faq" style="gap:10px">${list.map((f, i) => (faqCat === 'همه' || f.cat === faqCat) ? `<details class="card" ${i === faqOpen ? 'open' : ''} id="faq${i}"><summary><b>${esc(f.q)}</b></summary><p>${esc(f.a)}</p></details>` : '').join('') || '<div class="card">پرسشی ثبت نشده.</div>'}</div>
       <p class="small muted">جوابت رو پیدا نکردی؟ <a href="#search">جست‌وجو کن</a> یا سری به <a href="#glossary">واژه‌نامه</a> بزن.</p>`);
  };
  A.mounts.faq = () => {
    $$('[data-fc]').forEach(b => b.onclick = () => { faqCat = b.dataset.fc; faqOpen = -1; A.render(); });
    if (faqOpen >= 0) { const el = $('#faq' + faqOpen); if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 50); faqOpen = -1; }
  };

  /* ---------- 4. glossary + tooltips in articles ---------- */
  let glossQ = '';
  A.titles.glossary = 'واژه‌نامه';
  A.views.glossary = () => page('واژه‌نامه', 'واژه‌های علمی، به زبان ساده', 'هر اصطلاحی که در مقاله‌ها و برچسب خوراکی‌ها می‌بینی.',
    `<input class="input" id="glq" type="search" placeholder="جست‌وجو در واژه‌ها" value="${esc(glossQ)}"><div class="cp-gloss" id="gll"></div>`);
  A.mounts.glossary = () => {
    const draw = () => {
      const q = norm($('#glq').value);
      const list = (C.glossary || []).filter(g => !q || norm(g.term + ' ' + g.en + ' ' + g.def).includes(q));
      $('#gll').innerHTML = list.map(g => `<div class="card stack" style="gap:4px"><b>${esc(g.term)}</b>${g.en ? `<span class="small muted" dir="ltr">${esc(g.en)}</span>` : ''}<p>${esc(g.def)}</p></div>`).join('') || '<div class="card">واژه‌ای پیدا نشد.</div>';
    };
    $('#glq').oninput = draw; draw(); glossQ = '';
  };
  function addTooltips(root) {
    const terms = (C.glossary || []).filter(g => g.term && g.term.length > 2).sort((a, b) => b.term.length - a.term.length);
    if (!terms.length) return;
    const used = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('a,button,h2,h3,.cp-art-meta,.cp-keys,.refs,abbr') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      for (const g of terms) {
        if (used.has(g.term)) continue;
        const i = node.nodeValue.indexOf(g.term); if (i < 0) continue;
        used.add(g.term);
        const after = node.splitText(i); after.splitText(g.term.length);
        const ab = document.createElement('abbr'); ab.className = 'cp-term'; ab.tabIndex = 0; ab.dataset.def = g.def; ab.textContent = g.term;
        // Keep the definition bubble inside the screen on narrow phones.
        ab.onmouseenter = ab.onfocus = () => { const r = ab.getBoundingClientRect(), w = Math.min(280, innerWidth * .7), left = r.right - w; ab.style.setProperty('--tx', (left < 8 ? 8 - left : 0) + 'px'); };
        after.replaceWith(ab);
        node = ab.nextSibling; if (!node) break;
      }
    });
  }

  /* ---------- 5. article meta: reading time, evidence, key points, related ---------- */
  const EVID = { 'قوی': ['mint', 'شواهد قوی'], 'متوسط': ['sun', 'شواهد متوسط'], 'محدود': ['lav', 'شواهد محدود'] };
  const readMin = a => AM[a.id]?.readMin || Math.max(2, Math.round(strip(a.html).split(/\s+/).length / 180));
  add('articleTop', a => {
    const m = AM[a.id] || {}, ev = EVID[m.evidence];
    return `<div class="row cp-art-meta"><span class="chip">⏱ ${fa(readMin(a))} دقیقه</span>${ev ? `<span class="chip ${ev[0]}">${ev[1]}</span>` : ''}${m.reviewed ? `<span class="chip">بازبینی: ${esc(m.reviewed)}</span>` : ''}</div>
      ${m.keyPoints?.length ? `<div class="cp-keys"><b>خلاصه در ۳ نکته</b><ul>${m.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}`;
  });
  add('articleEnd', a => {
    const rel = (AM[a.id]?.related || []).map(id => A.ARTICLES.articles.find(x => x.id === id)).filter(Boolean);
    return rel.length ? `<h3>بیشتر بخون</h3><div class="cp-rel">${rel.map(r => `<button class="card" data-rel="${esc(r.id)}"><b>${esc(r.title)}</b><span class="small muted">⏱ ${fa(readMin(r))} دقیقه</span></button>`).join('')}</div>` : '';
  });
  add('articleMount', (a, el, close) => {
    $$('[data-rel]', el).forEach(b => b.onclick = () => { close(); A.openArticle(b.dataset.rel); });
    if (on('glossary')) addTooltips($('.article-body', el));
  });
  add('mount', r => {
    if (r !== 'learn' && r !== 'home') return;
    $$('[data-a]').forEach(b => { if ($('.cp-rt', b)) return; const a = A.ARTICLES.articles.find(x => x.id === b.dataset.a); if (!a) return;
      const s = document.createElement('span'); s.className = 'small muted cp-rt'; s.textContent = `⏱ ${fa(readMin(a))} دقیقه خوندن`; b.querySelector('h3')?.after(s); });
    if (r === 'learn' && !$('.cp-learn-links')) {
      const head = $('#app .section-head'); if (!head) return;
      const d = document.createElement('div'); d.className = 'row cp-learn-links';
      d.innerHTML = [on('faq') && '<a class="chip lav" href="#faq">❓ پرسش‌های پرتکرار</a>', on('glossary') && '<a class="chip mint" href="#glossary">🔤 واژه‌نامه</a>', on('mealplan') && '<a class="chip sun" href="#mealplan">🍽 برنامه‌ی غذایی هفته</a>'].filter(Boolean).join('');
      head.after(d);
    }
  });

  /* ---------- 6–8. recipes: nutrition, tags, favorites, scaler, cook mode, filters ---------- */
  const tagsOf = r => [...new Set([...(RM[r.id]?.tags || [])])];
  let rq = '', rtag = '', rfav = false;
  add('recipesTop', () => {
    const all = [...new Set(A.RECIPES.flatMap(tagsOf))];
    return `<div class="stack cp-rf" style="gap:10px">
      <input class="input" id="rq" type="search" placeholder="جست‌وجو در دستورها یا مواد: موز، خرما، کاکائو…" value="${esc(rq)}">
      <div class="row cp-tags">${on('favorites') ? `<button class="chip ${rfav ? 'berry' : ''}" id="rfav">❤️ نشون‌شده‌ها</button>` : ''}${all.map(t => `<button class="chip ${t === rtag ? 'mint' : ''}" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;
  });
  function filterRecipes() {
    const q = norm(rq).trim(), f = favs(); let n = 0;
    $$('.recipe[data-r]').forEach(card => {
      const r = A.RECIPES.find(x => x.id === card.dataset.r); if (!r) return;
      const ok = (!q || norm([r.title, r.intro, ...(r.ingredients || [])].join(' ')).includes(q)) && (!rtag || tagsOf(r).includes(rtag)) && (!rfav || f.includes(r.id));
      card.hidden = !ok; n += ok;
    });
    let em = $('.cp-empty');
    if (!n) { if (!em) { em = document.createElement('div'); em.className = 'card cp-empty'; $('.recipe-grid')?.after(em); } em.textContent = rfav ? 'هنوز دستوری رو نشون نکردی. روی ♡ هر دستور بزن.' : 'دستوری با این فیلتر پیدا نشد.'; }
    else em?.remove();
  }
  add('mount', r => {
    if (r !== 'recipes') return;
    const f = favs();
    $$('.recipe[data-r]').forEach(card => {
      const m = RM[card.dataset.r] || {}, body = $('.body', card);
      if (on('nutrition') && m.kcal && body) body.insertAdjacentHTML('beforeend', `<span class="small cp-nut-mini">🔥 ${fa(m.kcal)} کالری، 🍬 ${fa(m.sugar)} گرم قند</span>`);
      if (on('favorites')) card.insertAdjacentHTML('afterbegin', `<span class="cp-heart ${f.includes(card.dataset.r) ? 'on' : ''}" role="button" tabindex="0" aria-label="نشون کردن" data-h="${esc(card.dataset.r)}">${f.includes(card.dataset.r) ? '❤️' : '♡'}</span>`);
    });
    $$('[data-h]').forEach(h => { const fn = e => { e.stopPropagation(); e.preventDefault(); const onNow = toggleFav(h.dataset.h); h.classList.toggle('on', onNow); h.textContent = onNow ? '❤️' : '♡'; if (rfav) filterRecipes(); };
      h.onclick = fn; h.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') fn(e); }; });
    const inp = $('#rq'); if (inp) inp.oninput = () => { rq = inp.value; filterRecipes(); };
    $$('[data-tag]').forEach(b => b.onclick = () => { rtag = rtag === b.dataset.tag ? '' : b.dataset.tag; $$('[data-tag]').forEach(x => x.classList.toggle('mint', x.dataset.tag === rtag)); filterRecipes(); });
    const fb = $('#rfav'); if (fb) fb.onclick = () => { rfav = !rfav; fb.classList.toggle('berry', rfav); filterRecipes(); };
    filterRecipes();
  });

  // Servings scaler: multiplies the quantities written in Persian in each ingredient line.
  const WORDS = [['سه‌چهارم', .75], ['دوسوم', 2 / 3], ['دو‌سوم', 2 / 3], ['یک‌چهارم', .25], ['یک‌هشتم', .125], ['یک‌سوم', 1 / 3], ['نصف', .5], ['نیم', .5], ['یک', 1], ['دو', 2], ['سه', 3], ['چهار', 4], ['پنج', 5]];
  const NUM = '[0-9۰-۹]+(?:[.٫/][0-9۰-۹]+)?';
  const QTY = new RegExp(`(^|[\\s(])(${NUM}(?:\\s*و\\s*نیم)?|${WORDS.map(w => w[0]).join('|')})(?=[\\s)])`, 'g');
  const toNum = t => {
    const w = WORDS.find(x => x[0] === t); if (w) return w[1];
    const half = /و\s*نیم/.test(t) ? .5 : 0, s = norm(t.replace(/و\s*نیم/, '')).trim().replace('٫', '.');
    const v = s.includes('/') ? s.split('/').reduce((a, b) => a / b) : parseFloat(s);
    return isNaN(v) ? null : v + half;
  };
  const fmt = v => {
    const r = Math.round(v * 4) / 4, i = Math.floor(r), f = r - i;
    if (Math.abs(v - 1 / 3) < .02) return 'یک‌سوم'; if (Math.abs(v - 2 / 3) < .02) return 'دوسوم';
    if (!i && Math.abs(v - .125) < .01) return 'یک‌هشتم';
    if (!i) return f === .5 ? 'نصف' : f === .25 ? 'یک‌چهارم' : f === .75 ? 'سه‌چهارم' : fa(Math.round(v * 10) / 10);
    return f === .5 ? `${fa(i)} و نیم` : f ? fa(Math.round(v * 10) / 10).replace('.', '٫') : fa(i);
  };
  // Words that follow a number but are not an amount ("یک شب قبل"، "نیم ساعت"، "یک ذره").
  const NOT_QTY = /^(ذره|شب|روز|ساعت|دقیقه|ثانیه|بار|کم|کمی|مقدار|وقت|هفته|نفر)/;
  const scaleLine = (line, k) => k === 1 ? line : line.replace(QTY, (m, pre, t, off, all) => {
    const next = all.slice(off + m.length).trim();
    if (NOT_QTY.test(next)) return m;
    const v = toNum(t); return v == null ? m : pre + fmt(v * k);
  });
  const stepTimer = s => { const m = norm(s).match(/(\d+)\s*(?:تا\s*(\d+)\s*)?دقیقه/); return m ? Number(m[2] || m[1]) : 0; };

  add('recipeModal', r => {
    const m = RM[r.id] || {}, t = tagsOf(r), f = favs();
    return `<div class="row cp-rbar">
        ${on('cookmode') ? `<button class="btn primary" id="cook">👩‍🍳 حالت آشپزی</button>` : ''}
        ${on('favorites') ? `<button class="btn ghost" id="rfv">${f.includes(r.id) ? '❤️ نشون شده' : '♡ نشون کن'}</button>` : ''}
        <span class="cp-scale"><span class="small muted">مقدار:</span>${[.5, 1, 2, 3].map(k => `<button class="chip ${k === 1 ? 'mint' : ''}" data-k="${k}">${k === .5 ? 'نصف' : '×' + fa(k)}</button>`).join('')}</span></div>
      ${t.length ? `<div class="row">${t.map(x => `<span class="chip lav">${esc(x)}</span>`).join('')}</div>` : ''}
      ${on('nutrition') && m.kcal ? `<div class="cp-nut"><div><b class="num">${fa(m.kcal)}</b><span>کالری</span></div><div><b class="num">${fa(m.sugar)}</b><span>گرم قند کل</span></div><div><b class="num">${fa(m.protein)}</b><span>گرم پروتئین</span></div><div><b class="num">${fa(m.fiber)}</b><span>گرم فیبر</span></div><p class="small muted">هر وعده${m.servings ? ` (از ${fa(m.servings)} وعده)` : ''}، تخمینی. قندِ این دستورها از میوه و خرماست، نه قند افزوده.</p></div>` : ''}`;
  });
  add('recipeEnd', r => {
    const m = RM[r.id] || {};
    return m.pairs ? `<div class="card stack" style="gap:4px;background:var(--mint-soft);border-color:transparent"><b>🍵 کنارش چی بخوریم؟</b><p>${esc(m.pairs)}</p></div>` : '';
  });
  add('recipeMount', (r, el) => {
    const lis = $$('.ing li', el), orig = lis.map(li => li.textContent);
    $$('[data-k]', el).forEach(b => b.onclick = () => {
      const k = Number(b.dataset.k);
      $$('[data-k]', el).forEach(x => x.classList.toggle('mint', x === b));
      lis.forEach((li, i) => { li.textContent = scaleLine(orig[i], k); });
    });
    const fv = $('#rfv', el); if (fv) fv.onclick = () => { fv.textContent = toggleFav(r.id) ? '❤️ نشون شده' : '♡ نشون کن'; };
    const ck = $('#cook', el); if (ck) ck.onclick = () => cookMode(r, lis.map(li => li.textContent));
  });

  async function cookMode(r, ings) {
    let i = -1, lock = null, timer = null, left = 0;
    const steps = r.steps || [];
    try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch (e) { lock = null; }
    const ov = document.createElement('div'); ov.className = 'cp-cook'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    const stop = () => { clearInterval(timer); timer = null; };
    // The browser drops the wake lock when the tab is hidden; take it again when the cook comes back.
    const vis = async () => { if (document.visibilityState === 'visible' && ov.isConnected && 'wakeLock' in navigator) { try { lock = await navigator.wakeLock.request('screen'); } catch (e) {} } };
    const close = () => { stop(); try { lock && lock.release(); } catch (e) {} ov.remove(); document.removeEventListener('keydown', key, true); document.removeEventListener('visibilitychange', vis); };
    // Captured first so Escape closes only cook mode, not the recipe sheet under it.
    const key = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); close(); } else if (e.key === 'ArrowLeft') move(1); else if (e.key === 'ArrowRight') move(-1); };
    const move = d => { i = Math.max(-1, Math.min(steps.length, i + d)); stop(); draw(); };
    function draw() {
      const last = i >= steps.length, mins = i >= 0 && !last ? stepTimer(steps[i]) : 0;
      ov.innerHTML = `<div class="cp-cook-in">
        <div class="row" style="justify-content:space-between"><b>${esc(r.title)}</b><button class="btn ghost" id="cx">بستن ✕</button></div>
        <div class="progress"><i style="width:${Math.round(((i + 1) / (steps.length + 1)) * 100)}%"></i></div>
        <div class="cp-cook-body">${i < 0 ? `<span class="eyebrow">اول، مواد رو آماده کن</span><ul class="cp-cook-ing">${ings.map((x, n) => `<li><label class="check" for="ci${n}"><input type="checkbox" id="ci${n}"><span>${esc(x)}</span></label></li>`).join('')}</ul>`
          : last ? `<div style="max-width:200px;margin:0 auto">${A.ART.mascot('happy', { arms: 'up' })}</div><h2>نوش جان! 🎉</h2><p>یه دستور بی‌قند دیگه یاد گرفتی. عکسش رو برای یکی بفرست که دوستش داری.</p>`
          : `<span class="eyebrow">مرحله‌ی ${fa(i + 1)} از ${fa(steps.length)}</span><p class="cp-cook-step">${esc(steps[i])}</p>${mins ? `<button class="btn sun big" id="ct">⏱ تایمر ${fa(mins)} دقیقه</button><div class="cp-cook-t" id="ctv"></div>` : ''}`}</div>
        <div class="row" style="justify-content:space-between"><button class="btn ghost big" id="cp" ${i < 0 ? 'disabled' : ''}>→ قبلی</button>${last ? `<button class="btn primary big" id="cdone">تمومه</button>` : `<button class="btn primary big" id="cn">${i < 0 ? 'شروع پخت' : 'بعدی'} ←</button>`}</div>
        ${lock ? '<p class="small muted" style="text-align:center">صفحه تا آخر آشپزی خاموش نمی‌شه.</p>' : ''}</div>`;
      $('#cx', ov).onclick = close;
      $('#cp', ov).onclick = () => move(-1);
      const n = $('#cn', ov); if (n) n.onclick = () => move(1);
      const dn = $('#cdone', ov); if (dn) dn.onclick = () => { close(); A.confetti(); };
      const ct = $('#ct', ov); if (ct) ct.onclick = () => {
        stop(); left = mins * 60; const v = $('#ctv', ov);
        const show = () => { v.textContent = `${fa(Math.floor(left / 60))}:${fa(String(left % 60).padStart(2, '0'))}`; };
        const end = Date.now() + left * 1000; // wall-clock, so a backgrounded tab still ends on time
        show(); timer = setInterval(() => { left = Math.max(0, Math.round((end - Date.now()) / 1000)); if (left <= 0) { stop(); v.textContent = 'تموم شد! ⏰'; A.notify(`تایمر «${r.title}» تموم شد ⏰`, 'bell'); try { navigator.vibrate && navigator.vibrate([300, 150, 300]); } catch (e) {} } else show(); }, 1000);
      };
    }
    document.addEventListener('keydown', key, true);
    document.addEventListener('visibilitychange', vis);
    draw();
  }

  /* ---------- 9. "for your goal" card on today ---------- */
  const GOAL_NAME = { weight: 'کاهش وزن', skin: 'پوست و مو', pcos: 'تعادل هورمونی و PCOS', insulin: 'مقاومت به انسولین', energy: 'انرژی و خلق‌وخو', teeth: 'سلامت دندان', control: 'پس گرفتن کنترل' };
  add('todayMain', () => {
    if (!on('goaltips') || !C.goalTips) return '';
    const s = A.D(), goals = (s.profile?.goal || []).filter(g => C.goalTips[g]?.length);
    if (!goals.length) return '';
    const n = A.exIndex(s.cycle, s.day), g = goals[n % goals.length], list = C.goalTips[g], t = list[Math.floor(n / goals.length) % list.length];
    const art = t.article && A.ARTICLES.articles.find(a => a.id === t.article), rec = t.recipe && A.RECIPES.find(x => x.id === t.recipe);
    return `<div class="card stack cp-goal" style="gap:8px"><span class="eyebrow">مخصوص هدف تو، ${esc(GOAL_NAME[g] || '')}</span><p>${esc(t.text)}</p>
      ${art || rec ? `<div class="row">${art ? `<button class="chip lav" data-ga="${esc(art.id)}">📖 ${esc(art.title)}</button>` : ''}${rec ? `<button class="chip mint" data-gr="${esc(rec.id)}">🍰 ${esc(rec.title)}</button>` : ''}</div>` : ''}</div>`;
  });
  add('mount', r => {
    if (r !== 'today') return;
    $$('[data-ga]').forEach(b => b.onclick = () => A.openArticle(b.dataset.ga));
    $$('[data-gr]').forEach(b => b.onclick = () => A.openRecipe(b.dataset.gr));
  });

  /* bonus: reading time + takeaway on today's reading */
  add('readingEnd', () => {
    if (!on('takeaway')) return '';
    const m = DM[A.logKey()] || {};
    return m.takeaway ? `<div class="cp-take"><b>چکیده‌ی امروز${m.readMin ? `، ${fa(m.readMin)} دقیقه خوندن` : ''}</b><p>${esc(m.takeaway)}</p></div>` : '';
  });

  /* ---------- 10. weekly meal plan ---------- */
  A.titles.mealplan = 'برنامه‌ی غذایی هفته';
  const WD = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const linkRecipes = txt => {
    const byId = A.RECIPES.find(r => r.id === txt);
    if (byId) return `<button class="cp-rl" data-mr="${esc(byId.id)}">${esc(byId.title)}</button>`;
    let h = esc(txt);
    A.RECIPES.forEach(r => { const t = esc(r.title); if (h.includes(t)) h = h.replace(t, `<button class="cp-rl" data-mr="${esc(r.id)}">${t}</button>`); });
    return h;
  };
  A.views.mealplan = () => {
    const plan = C.mealPlan || [], today = WD[new Date().getDay()];
    return page('برنامه‌ی غذایی هفته', 'یک هفته بدون قند افزوده، با غذاهای آشنا', 'صبحانه، میان‌وعده و عصرونه‌ی ساده. وعده‌های اصلی‌ات رو مثل همیشه بخور، فقط نوشیدنی شیرین و دسرهای قنددار رو با این‌ها جایگزین کن.',
      `<div class="cp-plan">${plan.map(p => `<div class="card stack ${p.day === today ? 'pop cp-today' : ''}" style="gap:8px"><div class="row" style="justify-content:space-between"><h3>${esc(p.day)}</h3>${p.day === today ? '<span class="chip sun">امروز</span>' : ''}</div>
        <div class="cp-meal"><span>🌅 صبحانه</span><p>${linkRecipes(p.breakfast)}</p></div><div class="cp-meal"><span>🍎 میان‌وعده</span><p>${linkRecipes(p.snack)}</p></div><div class="cp-meal"><span>☕ عصرونه</span><p>${linkRecipes(p.evening)}</p></div>
        ${p.note ? `<p class="small muted">💡 ${esc(p.note)}</p>` : ''}</div>`).join('') || '<div class="card">برنامه‌ای ثبت نشده.</div>'}</div>
      <p class="small muted">اگر دیابت داری، باردار یا شیرده هستی یا رژیم خاصی داری، این برنامه رو با پزشک یا متخصص تغذیه‌ات هماهنگ کن.</p>`);
  };
  A.mounts.mealplan = () => $$('[data-mr]').forEach(b => b.onclick = () => A.openRecipe(b.dataset.mr));

  /* tools hub entries */
  A.tools.push(
    { route: 'search', icon: '🔍', title: 'جست‌وجو', desc: 'دستور، مقاله، حرکت، جایگزین و پرسش', show: () => on('search') },
    { route: 'mealplan', icon: '🍽', title: 'برنامه‌ی غذایی هفته', desc: 'صبحانه و میان‌وعده‌ی بی‌قند برای ۷ روز', show: () => on('mealplan') },
    { route: 'faq', icon: '❓', title: 'پرسش‌های پرتکرار', desc: 'میوه، شیرین‌کننده، لغزش، PCOS و…', show: () => on('faq') },
    { route: 'glossary', icon: '🔤', title: 'واژه‌نامه', desc: 'اصطلاح‌های علمی به زبان ساده', show: () => on('glossary') },
  );
  // Public pages (no login) get a row of links in the footer.
  add('boot', () => {
    const f = $('.footer .wrap'); if (!f || $('.cp-foot', f)) return;
    const links = [['search', 'جست‌وجو'], ['faq', 'پرسش‌های پرتکرار'], ['glossary', 'واژه‌نامه'], ['mealplan', 'برنامه‌ی غذایی'], ['try', 'امتحان روز اول', 'trial']].filter(x => on(x[2] || x[0]));
    f.insertAdjacentHTML('afterbegin', `<nav class="row cp-foot" aria-label="لینک‌ها">${links.map(x => `<a href="#${x[0]}">${x[1]}</a>`).join('')}</nav>`);
  });
});
