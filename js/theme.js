/* Pastel watercolor background (plugin "theme"): the page tint follows the current section, or a palette the person
   picks in Settings. Choice lives in localStorage 'uzhu:bg' ('' = automatic), so it works for guests too.
   Sets body[data-topic] (section) and body[data-pal] (palette actually shown); colors are in css/theme.css. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const KEY = 'uzhu:bg';
  // Palettes the person can choose; [name, label, swatch colors].
  const PALS = [
    ['peach', 'هلویی', '#f9c9ad', '#fbe4bb'],
    ['mint', 'نعنایی', '#b4e4cf', '#d8eec6'],
    ['lilac', 'یاسی', '#dcc2ec', '#f0d2e2'],
    ['sky', 'آسمانی', '#bcd9f2', '#dcd6f2'],
    ['cream', 'کرم', '#efdcbf', '#f6ebdc'],
    ['pink', 'صورتی', '#f5bccb', '#f9dccf'],
  ];
  // Section -> topic. Topic -> palette in automatic mode.
  const TOPIC = {
    today: ['home', 'today', 'try', 'onboard', 'signup', 'login', 'journey', 'calendar', 'badges', 'more', 'friends', 'team', 'league', 'challenges', 'score', 'assess'],
    recipes: ['recipes', 'mealplan', 'swaps', 'shop', 'plate', 'label', 'slow', 'occasions', 'phrases'],
    learn: ['learn', 'faq', 'glossary', 'search', 'paths', 'quiz', 'body', 'reintro', 'risk', 'sugar', 'report', 'coach'],
    move: ['move', 'builder', 'lazy', 'body2'],
    sleep: ['sleep', 'sleepsounds', 'sleepdiary', 'sleepplan', 'sleepcheck'],
    night: ['night', 'letter', 'mindful', 'slip'],
  };
  const AUTO = { today: 'peach', recipes: 'butter', learn: 'sky', move: 'sage', sleep: 'lavender', night: 'rose', other: 'cream' };
  const topicOf = r => {
    r = String(r || '').split(/[/?]/)[0];
    for (const [t, list] of Object.entries(TOPIC)) if (list.includes(r)) return t;
    if (/^sleep/.test(r)) return 'sleep';
    if (/^move|^ex|walk|yoga/.test(r)) return 'move';
    if (/^recipe|food|meal/.test(r)) return 'recipes';
    return 'other';
  };
  const get = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  const set = v => { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} };
  let cur = (location.hash || '#').slice(1) || 'home';

  function apply(r) {
    if (r) cur = r;
    const b = document.body; if (!b) return;
    if (!on('theme')) { delete b.dataset.pal; delete b.dataset.topic; return; }
    const t = topicOf(cur), pick = get();
    b.dataset.topic = t;
    b.dataset.pal = PALS.some(p => p[0] === pick) ? pick : AUTO[t];
  }
  apply();
  add('mount', r => apply(r));

  add('settings', () => {
    if (!on('theme')) return '';
    const v = get();
    const opt = (k, label, bg) => `<button type="button" class="th-opt" role="radio" aria-checked="${v === k}" data-thbg="${k}"><span class="th-dot" style="background:${bg}"></span><span>${label}</span></button>`;
    return `<div class="card stack" style="gap:10px"><b>🎨 رنگ پس‌زمینه</b>
      <p class="small muted">پس‌زمینه یه کاغذ آبرنگی ملایمه. می‌تونی بذاری خودش با هر بخش عوض شه، یا یه رنگی که دوست داری رو انتخاب کنی.</p>
      <div class="th-sw" role="radiogroup" aria-label="رنگ پس‌زمینه">
        ${opt('', 'خودکار، بر اساس بخش', 'conic-gradient(#fcdcc8 0 60deg, #fbe6ae 0 120deg, #d6e8cc 0 180deg, #d3e7f7 0 240deg, #ded5f3 0 300deg, #f6d6d8 0)')}
        ${PALS.map(([k, label, a, c]) => opt(k, label, `radial-gradient(circle at 35% 30%, ${c}, ${a} 70%)`)).join('')}
      </div></div>`;
  });
  add('mount', r => {
    if (r !== 'settings') return;
    document.querySelectorAll('[data-thbg]').forEach(b => b.onclick = () => {
      set(b.dataset.thbg); apply();
      document.querySelectorAll('[data-thbg]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    });
  });
});
