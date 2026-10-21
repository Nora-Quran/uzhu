/* Uzhu breakfast section (plugin, route #breakfast, public): why breakfast matters for quitting added sugar (honest,
   with references), a filterable gallery of 35 sugar-free breakfasts with watercolor art, an "anti-craving plate"
   builder, a 7-day plan, common mistakes and low-appetite tips. Entry points: tools hub, search, recipes page, Today
   (mornings). Admin feature key: 'breakfast'. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fa = A.fa, esc = A.esc;
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const hasRecipe = id => !!id && (A.RECIPES || []).some(r => r.id === id);

  /* ---------- watercolor kit (shared shape generators, 160×120 canvas) ---------- */
  const C = { peach: '#f6c3a5', butter: '#f8e2a0', rose: '#eaa9b4', sage: '#a8c99a', sky: '#a8d0e8', cream: '#fbf0da', lav: '#cdbdec', mint: '#bfe3cf' };
  const L = '#6b4f4f';
  let uid = 0;
  const BLOB = 'M80 6C122 4 152 30 151 62C150 96 120 116 78 115C38 114 8 94 9 60C10 28 40 8 80 6Z';
  const r1 = n => Math.round(n * 10) / 10;
  const E = (x, y, rx, ry, c, o) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${c}"${o != null ? ` opacity="${o}"` : ''}/>`;
  // pigment pooling: a base layer, a darker pool toward the lower edge and a soft highlight
  const P = (x, y, rx, ry, c) => E(x, y, rx, ry, c, .92) + E(x + rx * .08, y + ry * .16, rx * .84, ry * .78, c, .5) + E(x - rx * .3, y - ry * .38, rx * .34, ry * .24, '#fff', .3);
  function wc(bg, inner, crisp = '', cls = '') {
    const id = 'wc-bf-' + (++uid);
    return `<svg class="bf-svg ${cls}" viewBox="0 0 160 120" aria-hidden="true" focusable="false"><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="${uid % 9 + 1}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="${id}g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .35 0 0 0 0 .3 0 0 0 .5 0"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs><g filter="url(#${id})"><path d="${BLOB}" fill="${bg}" opacity=".8"/><path d="${BLOB}" fill="${bg}" opacity=".45" transform="translate(9 9) scale(.89)"/>${inner}</g><path d="${BLOB}" filter="url(#${id}g)" opacity=".2" style="mix-blend-mode:multiply"/>${crisp}</svg>`;
  }
  const face = (x, y, s = 1) => `<g transform="translate(${r1(x)} ${r1(y)}) scale(${s})"><circle cx="-4.5" cy="0" r="1.5" fill="${L}"/><circle cx="4.5" cy="0" r="1.5" fill="${L}"/><path d="M-2.4 2.6Q0 4.8 2.4 2.6" stroke="${L}" stroke-width="1.2" fill="none" stroke-linecap="round"/><ellipse cx="-7.5" cy="3.2" rx="2.4" ry="1.4" fill="#f19aa6" opacity=".6"/><ellipse cx="7.5" cy="3.2" rx="2.4" ry="1.4" fill="#f19aa6" opacity=".6"/></g>`;
  const steam = (x, y) => `<path d="M${x - 4} ${y}q-3-5 0-9t0-9M${x + 4} ${y - 2}q-3-5 0-9" stroke="${L}" stroke-width="1.2" fill="none" opacity=".3" stroke-linecap="round"/>`;
  const heart = (x, y, c = '#ec8fa0') => `<path transform="translate(${x} ${y}) scale(.5)" d="M0 4C-6-4-14 2-8 8L0 15L8 8C14 2 6-4 0 4Z" fill="${c}" opacity=".85"/>`;
  const plate = (x = 80, y = 76, rx = 60, ry = 27) => E(x, y + 4, rx, ry, L, .08) + E(x, y, rx, ry, '#fffaf2') + E(x, y, rx * .78, ry * .72, C.sky, .22);
  const bowl = (x, y, w, col, fill) => `<path d="M${x - w} ${y}Q${x - w} ${y + w * .95} ${x} ${y + w * .95}Q${x + w} ${y + w * .95} ${x + w} ${y}Z" fill="${col}"/><path d="M${x - w * .9} ${y + w * .2}Q${x - w * .6} ${y + w * .85} ${x} ${y + w * .9}Q${x + w * .7} ${y + w * .85} ${x + w * .92} ${y + w * .3}" fill="${col}" opacity=".5"/>` + E(x, y, w, w * .3, fill) + E(x + 2, y + 1.5, w * .8, w * .2, fill, .5);
  const egg = (x, y, s = 1) => `<path d="M${x - 13 * s} ${y}C${x - 14 * s} ${y - 10 * s} ${x - 2 * s} ${y - 13 * s} ${x + 6 * s} ${y - 10 * s}C${x + 15 * s} ${y - 7 * s} ${x + 14 * s} ${y + 7 * s} ${x + 4 * s} ${y + 10 * s}C${x - 5 * s} ${y + 13 * s} ${x - 12 * s} ${y + 8 * s} ${x - 13 * s} ${y}Z" fill="#fffdf6"/>` + E(x + 2, y + 3, 10 * s, 6 * s, '#efe4d2', .55) + P(x - 1, y - 1, 5.5 * s, 5 * s, '#f4bd45');
  const eggHalf = (x, y, s = 1) => E(x, y, 11 * s, 8 * s, '#fffdf6') + E(x + 1, y + 2, 9 * s, 5 * s, '#efe4d2', .5) + P(x, y, 5 * s, 4.4 * s, '#f6c24a');
  const eggWhole = (x, y) => P(x, y, 8, 10.5, '#fbf4e6') + E(x + 2, y + 3, 5, 6, '#e9dcc6', .5);
  const sangak = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * .45}" fill="#e6bd86"/><rect x="${x + 3}" y="${y + h * .35}" width="${w - 5}" height="${h * .6}" rx="${h * .3}" fill="#d9a46a" opacity=".5"/>` + [.2, .45, .7].map(fx => [.3, .65].map(fy => E(x + w * fx + fy * 6, y + h * fy, 2.2, 1.6, '#a8774a', .55)).join('')).join('');
  const toast = (x, y, s = 1, top = '#f3d8a6') => `<path d="M${x - 16 * s} ${y + 14 * s}V${y - 6 * s}Q${x - 18 * s} ${y - 18 * s} ${x} ${y - 18 * s}Q${x + 18 * s} ${y - 18 * s} ${x + 16 * s} ${y - 6 * s}V${y + 14 * s}Z" fill="#cf965a"/><path d="M${x - 12 * s} ${y + 11 * s}V${y - 5 * s}Q${x - 13 * s} ${y - 14 * s} ${x} ${y - 14 * s}Q${x + 13 * s} ${y - 14 * s} ${x + 12 * s} ${y - 5 * s}V${y + 11 * s}Z" fill="${top}"/>`;
  const cheese = (x, y, w = 20, h = 13) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fffbea"/><rect x="${x + 2}" y="${y + h * .45}" width="${w - 3}" height="${h * .5}" rx="2" fill="#efe3bf" opacity=".6"/>` + E(x + w * .3, y + h * .35, 1.4, 1.1, '#e3d3a6');
  const walnut = (x, y) => E(x, y, 4.8, 3.6, '#b9875b') + E(x + 1, y + 1, 3.2, 2.2, '#8f6243', .6);
  const almond = (x, y, r = 0) => `<ellipse transform="rotate(${r} ${x} ${y})" cx="${x}" cy="${y}" rx="5" ry="2.8" fill="#c99467"/>`;
  const leaf = (x, y, r, c = '#86b874', s = 1) => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0Q7-7 15 0Q7 7 0 0Z" fill="${c}" opacity=".9"/>`;
  const herbs = (x, y, c) => leaf(x, y, -30, c) + leaf(x + 3, y + 2, 20, '#9dca86') + leaf(x - 2, y + 4, 160, c) + leaf(x + 1, y - 1, -100, '#7aa968', .8);
  const tomato = (x, y, r = 7) => P(x, y, r, r, '#ec8b7c') + E(x, y, r * .6, r * .6, '#f7b7a8', .7) + E(x - r * .25, y, 1, 1.4, '#fde2c8') + E(x + r * .25, y, 1, 1.4, '#fde2c8');
  const cucumber = (x, y, r = 6) => E(x, y, r, r, '#94c182') + E(x, y, r * .76, r * .76, '#e5f1cd') + E(x, y, r * .25, r * .25, '#cfe3b0');
  const cup = (x, y, col, liq) => `<path d="M${x + 12} ${y - 4}q9 0 8 7t-9 6" stroke="${col}" stroke-width="3.2" fill="none"/><path d="M${x - 13} ${y - 10}h26v12q0 12-13 12q-13 0-13-12z" fill="${col}"/>` + E(x + 2, y + 6, 9, 6, col, .5) + E(x, y - 10, 13, 3.2, liq);
  const glass = (x, y, liq, h = 30) => `<path d="M${x - 10} ${y - h / 2}L${x + 10} ${y - h / 2}L${x + 8} ${y + h / 2}L${x - 8} ${y + h / 2}Z" fill="#e8f3f6" opacity=".9"/><path d="M${x - 9} ${y - h / 4}L${x + 9} ${y - h / 4}L${x + 7.6} ${y + h / 2 - 1}L${x - 7.6} ${y + h / 2 - 1}Z" fill="${liq}"/>` + E(x + 2, y + h / 4, 5, h / 5, liq, .5);
  const berries = (pts, c = '#d96a86') => pts.map(([x, y]) => E(x, y, 3.8, 3.6, c) + E(x - 1, y - 1.2, 1.2, .9, '#fff', .45)).join('');
  const banana = (pts) => pts.map(([x, y]) => E(x, y, 5, 4.6, '#fbeec0') + E(x, y, 1.8, 1.6, '#e3c97c', .7)).join('');
  const dots = (pts, c, r = 2) => pts.map(([x, y]) => E(x, y, r, r * .8, c)).join('');
  const scatter = (x, y, w, h, n, seed = 1) => { const out = []; for (let i = 0; i < n; i++) { const a = (i * 137.5 + seed * 29) % 360 * Math.PI / 180, d = Math.sqrt((i + .5) / n); out.push([r1(x + Math.cos(a) * d * w), r1(y + Math.sin(a) * d * h)]); } return out; };
  const pan = (x, y, r = 38) => `<rect x="${x + r - 4}" y="${y - 4}" width="34" height="8" rx="4" fill="#9c8a80" transform="rotate(-18 ${x + r} ${y})"/>` + E(x, y + 3, r, r * .62, L, .1) + E(x, y, r, r * .62, '#b9a99f') + E(x, y, r * .86, r * .52, '#d9cbc1');
  const pancakes = (x, y) => [12, 6, 0].map(d => E(x, y + d, 26, 8, '#d99a5c') + E(x, y + d - 2, 25, 6.5, '#ecbd80')).join('');
  const jar = (x, y, layers) => `<rect x="${x - 15}" y="${y - 22}" width="30" height="8" rx="3" fill="#c9b8ea"/><rect x="${x - 14}" y="${y - 16}" width="28" height="40" rx="7" fill="#eef6f8" opacity=".9"/>` + layers.map(([c, top, h]) => `<rect x="${x - 12}" y="${y + top}" width="24" height="${h}" rx="5" fill="${c}"/>`).join('');
  const wrap = (x, y, r = -14, inside = '#f4c94f') => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 26}" y="${y - 9}" width="52" height="18" rx="9" fill="#ecd2a2"/><rect x="${x - 24}" y="${y - 1}" width="48" height="9" rx="5" fill="#ddb67c" opacity=".5"/>` + E(x + 25, y, 4, 8, inside) + E(x + 26, y - 3, 2.6, 3.5, '#86b874') + `</g>`;
  const muffin = (x, y, top = '#f4cf63') => `<path d="M${x - 11} ${y}L${x - 8} ${y + 14}H${x + 8}L${x + 11} ${y}Z" fill="#e7b5c0"/>` + P(x, y - 2, 13, 9, top) + dots([[x - 5, y - 3], [x + 4, y - 5]], '#7fae6a', 1.8) + E(x + 1, y + 1, 1.8, 1.5, '#e9806f');
  const avocado = (x, y, s = 1) => E(x, y, 13 * s, 16 * s, '#6f9a52') + E(x, y + 1, 10.5 * s, 13.5 * s, '#cfe39a') + P(x, y + 4 * s, 5 * s, 5.5 * s, '#a7754b');
  const apple = (x, y, c = '#ec8b7c') => P(x, y, 10, 9.5, c) + `<path d="M${x} ${y - 9}q1-5 3-6" stroke="#8f6243" stroke-width="1.6" fill="none"/>` + leaf(x + 2, y - 12, -20, '#86b874', .6);
  const orange = (x, y, r = 9) => P(x, y, r, r, '#f6a85a') + E(x, y, r * .7, r * .7, '#fbd09a', .6);
  const date = (x, y, r = 0) => `<ellipse transform="rotate(${r} ${x} ${y})" cx="${x}" cy="${y}" rx="7" ry="3.8" fill="#8a5240"/><ellipse transform="rotate(${r} ${x} ${y})" cx="${x - 1}" cy="${y - 1}" rx="4" ry="1.4" fill="#b87a5c" opacity=".6"/>`;
  const cinnamon = (x, y) => `<path d="M${x - 14} ${y}q7-4 14 0t14 0" stroke="#b47a4e" stroke-width="2" fill="none" opacity=".8"/><path d="M${x - 9} ${y + 5}q5-3 10 0t9 0" stroke="#b47a4e" stroke-width="1.6" fill="none" opacity=".6"/>`;
  const lemon = (x, y) => `<path d="M${x - 9} ${y}a9 9 0 0 0 18 0z" fill="#f7dc6f"/><path d="M${x - 6} ${y}a6 6 0 0 0 12 0z" fill="#fbeeb0"/>`;
  const straw = (x, y) => `<path d="M${x + 3} ${y - 14}l7-14" stroke="#ec8fa0" stroke-width="3" stroke-linecap="round"/>`;

  /* ---------- the breakfasts ---------- */
  const CATS = [['all', 'همه'], ['iran', 'ایرانی سنتی'], ['fast', 'سریع (۵ دقیقه)'], ['protein', 'پروتئینی'], ['veg', 'گیاهی'], ['go', 'برای بیرون و محل کار'], ['weekend', 'آخر هفته'], ['kids', 'برای بچه‌ها'], ['sweet', 'شیرین ولی بی‌قند افزوده']];
  const CAT = Object.fromEntries(CATS);
  const B = [
    { id: 'sangak', n: 'نون سنگک، پنیر، گردو و سبزی', c: 'iran fast veg', t: 5, in: 'یه تیکه نون سنگک (ترجیحاً سبوس‌دار)، پنیر، ۳–۴ تا گردو، سبزی خوردن، گوجه و خیار', why: 'پنیر و گردو پروتئین و چربی خوب دارن، سبزی و نون سبوس‌دار فیبر. همون صبحانه‌ی مامان‌بزرگ‌ها، فقط با چای بی‌قند.', p: 14, f: 6,
      a: () => wc(C.butter, plate() + sangak(26, 56, 62, 26) + cheese(94, 58, 24, 15) + walnut(124, 70) + walnut(132, 63) + herbs(92, 84) + tomato(112, 88) + cucumber(127, 87), face(106, 66, .65)) },
    { id: 'omelette', n: 'املت گوجه‌فرنگی', c: 'iran protein weekend', t: 15, in: '۲ تا تخم‌مرغ، ۲ تا گوجه، کمی پیاز (اختیاری)، روغن زیتون، با نون سنگک و سبزی', why: 'تخم‌مرغ حدود ۱۲ گرم پروتئین می‌ده و گوجه هم فیبر و آب. سیرکننده و گرم، مخصوص صبح‌های سرد.', p: 15, f: 4,
      a: () => wc(C.peach, pan(74, 64) + P(74, 64, 28, 17, '#f5c64e') + [[64, 58], [82, 60], [70, 70], [88, 70], [76, 52]].map(([x, y]) => P(x, y, 5, 4, '#e2604f')).join('') + leaf(60, 68, 30, '#7aa968', .5), face(74, 64, .8)) },
    { id: 'nimroo', n: 'نیمرو با نون سبوس‌دار و خیار', c: 'iran protein', t: 8, in: '۲ تا تخم‌مرغ نیمرو با یه قاشق روغن، نون سبوس‌دار، خیار و گوجه، کمی فلفل سیاه', why: 'یه صبحانه‌ی پروتئینی ساده که قند خون رو آروم نگه می‌داره و تا ظهر سیرت می‌کنه.', p: 14, f: 4,
      a: () => wc(C.sky, plate() + egg(62, 72) + egg(94, 70, .95) + cucumber(118, 86) + cucumber(126, 79, 5) + tomato(46, 88, 6), face(61, 71, .5) + face(93, 69, .5)) },
    { id: 'adasi', n: 'عدسی با گلپر و آبلیمو', c: 'iran veg weekend', t: 40, in: 'عدس، پیاز، کمی آرد یا سیب‌زمینی برای غلظت، گلپر، نمک، آبلیمو، با نون سنگک. می‌شه از شب قبل پخت.', why: 'عدس هم پروتئین داره هم کلی فیبر؛ یکی از بهترین صبحانه‌ها برای قند خون آروم و سیری طولانی.', p: 12, f: 9,
      a: () => wc(C.peach, bowl(78, 56, 38, '#e9a7b0', '#c8834f') + dots(scatter(78, 56, 28, 8, 16), '#a86a3f', 1.8) + lemon(112, 58), face(78, 80, .9) + steam(78, 40)) },
    { id: 'haleem', n: 'حلیم بی‌شکر با دارچین', c: 'iran protein weekend', t: 15, in: 'حلیم گندم و گوشت، به‌جای شکر یه عالمه دارچین و کمی کره یا روغن زیتون', why: 'حلیم خودش پروتئین و فیبر گندم داره؛ مشکل فقط شکریه که روش می‌ریزن. دارچین طعم شیرین‌نما بهش می‌ده. (اگه بیرون می‌خری بگو شکر نریزن.)', p: 16, f: 4,
      a: () => wc(C.butter, bowl(78, 56, 38, '#a8d0e8', '#ecd6b2') + cinnamon(78, 54) + dots([[66, 60], [92, 58]], '#d9a46a', 1.6), face(78, 80, .9) + steam(78, 40)) },
    { id: 'kalejoosh', n: 'کله‌جوش', c: 'iran veg weekend', t: 25, in: 'کشک، پیاز داغ، نعناع داغ، گردو، زردچوبه، با نون خشک یا سنگک (بدون شکر)', why: 'کشک پر از پروتئینه و گردو چربی خوب داره. یه صبحانه‌ی گرم و اصیل که هیچ قندی لازم نداره.', p: 13, f: 3,
      a: () => wc(C.sage, bowl(78, 56, 38, '#f6c3a5', '#efe4cf') + dots(scatter(78, 55, 26, 7, 10, 3), '#b07a45', 1.8) + dots(scatter(78, 56, 24, 7, 7, 7), '#5f9a55', 1.4) + walnut(92, 54) + walnut(64, 57), face(78, 80, .9) + steam(78, 40)) },
    { id: 'khagineh', n: 'خاگینه‌ی شور (بدون شکر)', c: 'iran protein', t: 15, in: '۲–۳ تا تخم‌مرغ، کمی آرد، زردچوبه، نمک و پیازچه یا شوید؛ به‌جای شیره و شکر، با سبزی و نون', why: 'خاگینه رو معمولاً با شکر یا شیره می‌خورن؛ نسخه‌ی شورش همون‌قدر خوشمزه‌ست و فقط پروتئین می‌ده، بدون قند.', p: 15, f: 2,
      a: () => wc(C.peach, plate() + P(76, 72, 34, 18, '#f3c24f') + dots(scatter(76, 71, 24, 11, 8, 5), '#cf8a3e', 2.3) + herbs(112, 82) + dots(scatter(76, 70, 20, 8, 6, 9), '#7aa968', 1.4), face(76, 70, .8)) },
    { id: 'kuku', n: 'کوکو سبزی با ماست', c: 'iran veg go', t: 5, in: 'کوکو سبزی از شب قبل، یه کاسه ماست، نون سنگک (برای لقمه‌ی محل کار هم عالیه)', why: 'تخم‌مرغ و سبزی یعنی پروتئین و فیبر با هم. سرد هم خوشمزه‌ست و صبح فقط باید برداری.', p: 13, f: 4,
      a: () => wc(C.mint, plate() + [[52, 72, -8], [80, 68, 4], [66, 88, 14]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><rect x="${x - 15}" y="${y - 9}" width="30" height="18" rx="5" fill="#5f8f45"/><rect x="${x - 13}" y="${y - 7}" width="26" height="12" rx="4" fill="#7fae5c" opacity=".7"/></g>`).join('') + bowl(116, 74, 15, '#cdbdec', '#fffdf6'), face(80, 68, .6)) },
    { id: 'lubia', n: 'لوبیا گرم', c: 'iran veg weekend', t: 10, in: 'لوبیا چیتی پخته (از شب قبل یا کنسرو بی‌شکر)، گلپر، نمک، آبلیمو یا آب‌نارنج', why: 'لوبیا یکی از پرفیبرترین صبحانه‌هاست و پروتئین گیاهی هم داره؛ قند خون رو خیلی آروم بالا می‌بره.', p: 11, f: 10,
      a: () => wc(C.butter, bowl(78, 56, 38, '#bfe3cf', '#c96e55') + scatter(78, 56, 28, 8, 14, 2).map(([x, y], i) => `<ellipse transform="rotate(${i * 40} ${x} ${y})" cx="${x}" cy="${y}" rx="3.2" ry="2" fill="#9c4f3c"/>`).join('') + dots([[70, 52], [86, 58]], '#c8b27a', 1.2), face(78, 80, .9) + steam(78, 40)) },
    { id: 'shirberenj', n: 'شیر برنج بی‌شکر با دارچین و یکی دو تا خرما', c: 'iran sweet kids', t: 30, in: 'برنج، شیر، دارچین، کمی گلاب، به‌جای شکر ۱–۲ تا خرمای خردشده؛ کنارش چند تا گردو', why: 'شیرینیش از خرما میاد، نه شکر. شیر پروتئین داره؛ چون برنج نشاسته‌ایه، با گردو بخورش تا دیرتر گرسنه شی.', p: 9, f: 2, r: 'ferni',
      a: () => wc(C.rose, bowl(74, 58, 36, '#a8d0e8', '#fbf4e2') + heart(70, 50, '#c48a5c') + date(112, 86, -20) + date(122, 78, 10) + walnut(36, 86), face(74, 80, .85)) },
    { id: 'boiled', n: 'تخم‌مرغ آب‌پز، نون سنگک و گوجه', c: 'iran protein go', t: 10, in: '۲ تا تخم‌مرغ آب‌پز (می‌شه چند تا رو از قبل پخت)، نون سنگک، گوجه، کمی نمک و فلفل', why: 'ساده‌ترین صبحانه‌ی پروتئینی دنیا. اگه از شب قبل آب‌پز کنی، صبح ۲ دقیقه کار داره.', p: 14, f: 4,
      a: () => wc(C.cream, plate() + sangak(22, 60, 46, 20) + eggHalf(84, 66) + eggHalf(108, 70) + eggHalf(94, 86) + tomato(124, 86, 6.5), face(84, 66, .45) + face(108, 70, .45)) },
    { id: 'pbtoast', n: 'نون تست سبوس‌دار، کره‌ی بادوم‌زمینی و موز', c: 'fast sweet kids veg', t: 3, in: '۱–۲ برش نون سبوس‌دار، یه قاشق کره‌ی بادوم‌زمینی بی‌شکر (برچسب رو بخون!)، چند حلقه موز، دارچین', why: 'شیرینی از موزه و کره‌ی بادوم‌زمینی پروتئین و چربی خوب داره که جذب قند موز رو کند می‌کنه.', p: 11, f: 5,
      a: () => wc(C.butter, toast(70, 66, 1.6, '#b97b4c') + banana([[58, 58], [74, 52], [82, 66], [64, 74], [78, 80]]) + glass(124, 66, '#fffaf2', 34), face(70, 66, .8)) },
    { id: 'oatmeal', n: 'اوتمیل دارچینی با موز و گردو', c: 'sweet veg kids', t: 10, in: 'نصف لیوان جو دوسر پرک، شیر یا آب، نصف موز رسیده، دارچین، گردو', why: 'جو دوسر بتاگلوکان داره، یه فیبر محلول که هضم رو کند می‌کنه. با گردو و شیر پروتئینش هم بالاتر می‌ره.', p: 12, f: 6, r: 'oatmeal',
      a: () => wc(C.peach, bowl(78, 56, 38, '#cdbdec', '#ead5ab') + dots(scatter(78, 56, 26, 7, 12, 4), '#d7b984', 2) + banana([[64, 54], [76, 58], [88, 53]]) + walnut(98, 58) + walnut(58, 59), face(78, 80, .9) + steam(78, 40)) },
    { id: 'yogurt', n: 'ماست یونانی با توت و گردو', c: 'sweet protein fast veg', t: 3, in: 'یه کاسه ماست یونانی یا ماست چکیده‌ی ساده، یه مشت توت‌فرنگی یا شاه‌توت، گردو، دارچین یا دونه‌ی چیا', why: 'ماست یونانی تا دو برابر ماست معمولی پروتئین داره. توت شیرینیش رو می‌ده، نه شکر. (ماست میوه‌ای آماده معمولاً شکر داره.)', p: 17, f: 5, r: 'yogurt-fruit',
      a: () => wc(C.rose, bowl(78, 58, 38, '#a8d0e8', '#fffdf6') + berries([[64, 55], [74, 52], [86, 56], [70, 61]], '#e2607c') + berries([[94, 53], [82, 61]], '#7d5aa6') + walnut(98, 60), face(78, 82, .9)) },
    { id: 'pancake', n: 'پنکیک موز و تخم‌مرغ', c: 'sweet kids weekend protein', t: 15, in: '۱ موز رسیده، ۲ تا تخم‌مرغ، ۲ قاشق جو دوسر آسیاب‌شده، دارچین؛ روش ماست و توت', why: 'فقط با موز شیرین شده و تخم‌مرغ پروتئینش رو تأمین می‌کنه. بچه‌ها عاشقشن.', p: 14, f: 4, r: 'banana-pancake',
      a: () => wc(C.butter, plate(80, 82, 52, 22) + pancakes(80, 64) + berries([[72, 60], [86, 59]], '#e2607c') + banana([[80, 56]]), face(80, 72, .7)) },
    { id: 'chia', n: 'پودینگ چیا (شب قبل آماده کن)', c: 'sweet go veg', t: 5, in: '۳ قاشق دونه‌ی چیا، یه لیوان شیر، دارچین یا وانیل؛ صبح روش توت‌فرنگی و گردو', why: 'دونه‌ی چیا خیلی پرفیبره و توی شیر ژله‌ای می‌شه؛ آروم هضم می‌شه و تا ظهر سیرت نگه می‌داره.', p: 10, f: 10, r: 'chia-pudding',
      a: () => wc(C.lav, jar(80, 62, [['#ece6dc', 0, 22], ['#e9607c', -8, 9]]) + dots(scatter(80, 74, 9, 7, 12, 6), '#6b6470', 1) + berries([[74, 57], [86, 58]], '#d9435e'), face(80, 76, .7)) },
    { id: 'overnight', n: 'اوتمیل شبانه توی شیشه', c: 'go sweet fast', t: 5, in: 'جو دوسر، ماست و شیر نصف‌نصف، سیب رنده‌شده، دارچین، یه قاشق دونه‌ی چیا؛ شب بریز توی شیشه و بذار یخچال', why: 'صبح هیچ کاری نداره، فقط شیشه رو برمی‌داری. ماست پروتئین می‌ده و جو و سیب فیبر.', p: 13, f: 7,
      a: () => wc(C.sage, jar(80, 62, [['#e7d1a6', 10, 13], ['#fffaf2', -2, 12], ['#f2a39a', -10, 8]]) + leaf(110, 82, -40, '#86b874') + apple(112, 92, '#f2a39a'), face(80, 66, .7)) },
    { id: 'muffins', n: 'مافین تخم‌مرغ و سبزیجات', c: 'go protein kids', t: 25, in: 'تخم‌مرغ، فلفل دلمه‌ای، اسفناج، پیازچه، کمی پنیر؛ توی قالب مافین ۲۰ دقیقه فر. برای ۴–۵ روز بسه.', why: 'یه بار درست کن، کل هفته صبحانه‌ی آماده داری. هر دونه‌اش حدود ۶–۷ گرم پروتئین داره.', p: 14, f: 2,
      a: () => wc(C.peach, plate(80, 86, 56, 20) + muffin(56, 70) + muffin(80, 64, '#f6d873') + muffin(104, 70), face(80, 64, .6)) },
    { id: 'smoothie', n: 'اسموتی پروتئینی سبز', c: 'fast go sweet', t: 5, in: 'یه لیوان شیر یا ماست، یه مشت اسفناج، نصف موز یا یه سیب، یه قاشق کره‌ی بادوم‌زمینی یا چیا', why: 'برای صبح‌هایی که اشتها نداری عالیه. چون میوه با ماست و چربی خوب قاطیه، مثل آبمیوه یهو قند خون رو بالا نمی‌بره.', p: 13, f: 5, r: 'green-smoothie',
      a: () => wc(C.mint, glass(78, 66, '#a9cf7e', 52) + straw(78, 40) + banana([[110, 84]]) + leaf(42, 84, -30, '#6f9a52') + leaf(46, 88, 30, '#86b874'), face(78, 74, .7)) },
    { id: 'avotoast', n: 'نون تست با آووکادو و تخم‌مرغ', c: 'protein weekend', t: 10, in: 'نون سبوس‌دار تست‌شده، نصف آووکادوی له‌شده، یه تخم‌مرغ نیمرو یا آب‌پز، نمک، فلفل، آبلیمو', why: 'آووکادو هم فیبر داره هم چربی خوب، تخم‌مرغ هم پروتئین. ترکیبی که دیر هضم می‌شه و هوس رو عقب می‌ندازه.', p: 13, f: 8,
      a: () => wc(C.sage, toast(68, 66, 1.6, '#bcd98c') + dots(scatter(68, 62, 14, 10, 8, 8), '#8fb35e', 1.6) + egg(70, 62, .8) + avocado(122, 74, .8), face(69, 61, .5)) },
    { id: 'loqme', n: 'لقمه‌ی نون و پنیر و گردو', c: 'iran go kids fast', t: 5, in: 'نون لواش یا سنگک سبوس‌دار، پنیر، گردو، سبزی یا خیار؛ لوله کن و بپیچ توی کاغذ', why: 'همون لقمه‌ی مدرسه‌ای خودمون! پروتئین و چربی خوب داره و توی کیف هم جا می‌شه.', p: 12, f: 4,
      a: () => wc(C.butter, wrap(74, 56, -12, '#fffbea') + wrap(84, 82, 8, '#fffbea') + walnut(124, 66) + walnut(130, 74), face(70, 58, .6)) },
    { id: 'besan', n: 'املت آرد نخودچی (گیاهی)', c: 'veg protein', t: 15, in: 'آرد نخودچی، آب، زردچوبه، نمک، پیازچه و گوجه‌ی خردشده؛ مثل املت توی تابه سرخش کن', why: 'برای گیاه‌خوارها و کسایی که تخم‌مرغ نمی‌خورن: پروتئین و فیبر حبوبات، بدون تخم‌مرغ.', p: 11, f: 5,
      a: () => wc(C.butter, pan(74, 64) + P(74, 64, 28, 17, '#f0b85a') + dots(scatter(74, 64, 20, 11, 9, 11), '#7aa968', 1.8) + dots(scatter(74, 64, 18, 10, 4, 3), '#e2604f', 2), face(74, 64, .8)) },
    { id: 'hummus', n: 'نون سبوس‌دار با حمص و گوجه', c: 'veg go', t: 5, in: 'نون سبوس‌دار، ۳–۴ قاشق حمص (نخود له‌شده با ارده)، گوجه و خیار، کمی پاپریکا', why: 'نخود و ارده پروتئین و فیبر گیاهی دارن؛ یه صبحانه‌ی سیرکننده که توی ظرف هم راحت جابه‌جا می‌شه.', p: 10, f: 7,
      a: () => wc(C.peach, toast(66, 66, 1.6, '#e8cf9c') + dots(scatter(66, 62, 10, 8, 5, 2), '#d9653b', 1) + tomato(60, 66, 6) + cucumber(76, 70, 5.5) + bowl(120, 70, 14, '#bfe3cf', '#e8cf9c'), face(66, 56, .6)) },
    { id: 'shakshuka', n: 'شکشوکا (تخم‌مرغ توی سس گوجه)', c: 'protein weekend', t: 25, in: 'گوجه و فلفل دلمه‌ای و پیاز تفت‌داده، زیره و پاپریکا، ۲–۳ تا تخم‌مرغ که توی سس می‌پزه', why: 'کلی سبزی پخته با تخم‌مرغ؛ پروتئین و فیبر و یه عالمه رنگ. صبحانه‌ی دورهمی جمعه.', p: 16, f: 5,
      a: () => wc(C.rose, pan(74, 64) + P(74, 64, 30, 18, '#d9594a') + egg(64, 62, .7) + egg(86, 66, .7) + dots([[74, 52], [58, 72], [92, 56]], '#5f9a55', 1.6), face(64, 61, .45) + face(86, 65, .45)) },
    { id: 'eggwrap', n: 'رپ تخم‌مرغ و سبزی', c: 'go protein', t: 10, in: 'نون لواش سبوس‌دار، تخم‌مرغ همزده یا املت نازک، اسفناج یا کاهو، گوجه، کمی پنیر', why: 'یه صبحانه‌ی کامل که توی ماشین و اتوبوس هم می‌شه خورد. پروتئین تخم‌مرغ با فیبر سبزی.', p: 15, f: 4,
      a: () => wc(C.sky, wrap(74, 60, -16) + wrap(90, 84, 6) + tomato(126, 70, 6), face(68, 62, .6)) },
    { id: 'milktoast', n: 'شیر، نون تست و سیب', c: 'kids fast', t: 4, in: 'یه لیوان شیر ساده (نه شیرکاکائو)، نون تست سبوس‌دار با پنیر یا کره‌ی بادوم‌زمینی، یه سیب', why: 'جایگزین ساده‌ی شیرکاکائو و کیک برای مدرسه: شیر پروتئین داره و سیب فیبر.', p: 13, f: 6,
      a: () => wc(C.sky, glass(54, 64, '#fffaf2', 44) + toast(96, 62, 1.1) + cheese(88, 58, 16, 10) + apple(116, 90), face(96, 70, .55)) },
    { id: 'smiley', n: 'ساندویچ خندون', c: 'kids fast', t: 5, in: 'نون تست سبوس‌دار، یه برش پنیر، دو تا حلقه خیار برای چشم، یه تیکه گوجه برای لبخند', why: 'برای بچه‌هایی که صبحانه نمی‌خورن: بازی با غذا کمک می‌کنه. پنیر پروتئین داره و سبزی فیبر.', p: 9, f: 4,
      a: () => wc(C.butter, toast(80, 66, 2, '#fff6dc') + cucumber(68, 56, 6) + cucumber(92, 56, 6) + `<path d="M66 72q14 14 28 0" stroke="#e2604f" stroke-width="5" fill="none" stroke-linecap="round"/>`, `<circle cx="68" cy="56" r="1.8" fill="${L}"/><circle cx="92" cy="56" r="1.8" fill="${L}"/>` + E(58, 68, 4, 2.4, '#f19aa6', .6) + E(102, 68, 4, 2.4, '#f19aa6', .6)) },
    { id: 'bakedapple', n: 'سیب پخته با دارچین و ماست', c: 'sweet veg weekend', t: 20, in: 'سیب نصف‌شده با دارچین توی فر یا ماهیتابه، ماست یونانی، گردو یا بادوم', why: 'سیب پخته خودش شیرین و عطریه، بدون یک ذره شکر. ماست و گردو پروتئین و سیری رو اضافه می‌کنن.', p: 14, f: 5,
      a: () => wc(C.peach, plate() + bowl(98, 66, 18, '#cdbdec', '#fffdf6') + P(56, 74, 16, 12, '#e98a72') + E(56, 72, 9, 6, '#f6d3a0') + almond(106, 64, 20) + almond(92, 64, -20), face(56, 76, .6)) },
    { id: 'pocket', n: 'صبحانه‌ی جیبی: تخم‌مرغ، بادوم و پرتقال', c: 'go fast protein', t: 2, in: '۲ تا تخم‌مرغ آب‌پز از قبل، یه مشت بادوم یا گردو، یه پرتقال یا سیب', why: 'وقتی هیچ وقت نداری: همه رو بنداز توی کیف. پروتئین، چربی خوب و فیبر بدون آشپزی.', p: 16, f: 5,
      a: () => wc(C.cream, eggWhole(56, 62) + eggWhole(74, 66) + orange(108, 64, 12) + almond(56, 88, 20) + almond(68, 90, -10) + almond(80, 87, 30) + leaf(110, 50, -60, '#86b874', .7), face(56, 62, .55) + face(108, 66, .7)) },
    { id: 'mushroom', n: 'املت قارچ و اسفناج و پنیر', c: 'protein weekend', t: 15, in: 'قارچ و اسفناج تفت‌داده، ۲–۳ تا تخم‌مرغ، کمی پنیر رنده‌شده، فلفل سیاه', why: 'پروتئین بالا و کلی سبزی؛ یه صبحانه‌ی جمعه که تا ناهار هیچ هوسی سراغت نمیاد.', p: 18, f: 3,
      a: () => wc(C.mint, pan(74, 64) + P(74, 64, 28, 17, '#f5c64e') + [[64, 60], [84, 58], [76, 70]].map(([x, y]) => E(x, y, 6, 4, '#d6bfa6') + E(x, y + 3, 2, 3, '#efe2d0')).join('') + leaf(60, 70, 20, '#4f8a43', .7) + leaf(88, 70, -20, '#4f8a43', .7), face(74, 64, .7)) },
    { id: 'ardeh', n: 'ارده و دو تا خرما با نون سنگک', c: 'iran sweet veg', t: 3, in: '۱ قاشق غذاخوری ارده، ۱–۲ تا خرما (نه بیشتر!)، نون سنگک سبوس‌دار؛ کنارش یه لیوان شیر یا ماست', why: 'صبحانه‌ی سنتی که قند افزوده نداره: ارده پروتئین و چربی خوب داره و خرما میوه‌ی کامله. فقط حواست به اندازه‌اش باشه.', p: 10, f: 5,
      a: () => wc(C.butter, plate() + sangak(24, 60, 48, 20) + bowl(98, 64, 16, '#a8d0e8', '#d9b07c') + date(102, 88, -10) + date(118, 82, 20), face(98, 80, .5)) },
    { id: 'mirza', n: 'میرزاقاسمی با نون', c: 'iran veg weekend', t: 35, in: 'بادمجون کبابی، گوجه، سیر، تخم‌مرغ، کمی روغن؛ با نون و سبزی. صبحانه‌ی آخر هفته‌ی گیلانی!', why: 'بادمجون و گوجه پر از فیبرن و تخم‌مرغ پروتئینش رو می‌ده. شور و خوش‌عطر، بدون قند.', p: 10, f: 7,
      a: () => wc(C.peach, plate() + P(74, 72, 32, 16, '#c9774f') + dots(scatter(74, 72, 22, 9, 8, 13), '#f2c45a', 2.2) + dots(scatter(74, 72, 20, 8, 5, 4), '#a2523b', 1.6) + herbs(110, 80), face(74, 70, .7)) },
    { id: 'kukusib', n: 'کوکو سیب‌زمینی کوچولو با ماست', c: 'iran kids', t: 25, in: 'سیب‌زمینی پخته و رنده‌شده، تخم‌مرغ، زردچوبه، پیاز؛ قرص‌های کوچیک با کمی روغن؛ کنارش ماست و خیار', why: 'بچه‌ها با دست می‌خورنش. تخم‌مرغ پروتئین داره؛ با ماست و سبزی بشقاب کامل‌تر می‌شه.', p: 11, f: 3,
      a: () => wc(C.butter, plate() + [[52, 70], [74, 64], [62, 88], [86, 82]].map(([x, y]) => P(x, y, 11, 8, '#e7a752')).join('') + bowl(116, 72, 13, '#cdbdec', '#fffdf6') + cucumber(118, 92, 5), face(74, 64, .5)) },
    { id: 'cereal', n: 'جو پرک با شیر و توت (به‌جای کورن‌فلکس)', c: 'fast kids sweet', t: 3, in: 'جو دوسر پرک ساده یا موسلی بی‌شکر، شیر، چند تا توت یا تیکه‌های سیب، گردو', why: 'کورن‌فلکس‌های رنگی پر از شکرن. جو پرک ساده همون حس رو داره ولی فیبرش خیلی بیشتره و قند افزوده نداره.', p: 11, f: 5,
      a: () => wc(C.sky, bowl(78, 56, 38, '#f6c3a5', '#fffaf2') + scatter(78, 55, 28, 8, 14, 5).map(([x, y], i) => `<ellipse transform="rotate(${i * 50} ${x} ${y})" cx="${x}" cy="${y}" rx="3.4" ry="2.2" fill="#dcbc84"/>`).join('') + berries([[68, 54], [90, 56]], '#e2607c') + berries([[80, 52]], '#7d5aa6'), face(78, 80, .9)) },
    { id: 'potegg', n: 'سیب‌زمینی و تخم‌مرغ آب‌پز', c: 'iran kids protein', t: 20, in: 'سیب‌زمینی آب‌پز، تخم‌مرغ آب‌پز، کمی نمک و فلفل، گوجه و خیار؛ برای لقمه هم خوبه', why: 'همون صبحانه‌ی خونگی قدیمی. تخم‌مرغ پروتئین می‌ده؛ اگه سیب‌زمینی رو با پوست بپزی فیبرش بیشتر می‌شه.', p: 13, f: 4,
      a: () => wc(C.cream, plate() + P(54, 70, 13, 10, '#d9b27a') + P(62, 88, 11, 8, '#d9b27a') + eggHalf(88, 66) + eggHalf(100, 84) + tomato(124, 74, 6), face(54, 70, .5) + face(88, 66, .45)) },
    { id: 'tea', n: 'نون و پنیر و چای دارچینی بی‌قند', c: 'iran fast veg', t: 5, in: 'نون سنگک، پنیر، خیار و گوجه، یه استکان چای کم‌رنگ با یه تیکه دارچین یا هل؛ به‌جای قند پهلو', why: 'همون صبحانه‌ی همیشگی، فقط قند پهلو رو حذف کردی. دارچین و هل عطر شیرین‌نما می‌دن و کم‌کم ذائقه‌ات عادت می‌کنه.', p: 10, f: 4, r: 'cinnamon-tea',
      a: () => wc(C.rose, cup(110, 62, '#cdbdec', '#c9774f') + sangak(22, 66, 52, 22) + cheese(48, 50, 22, 14) + cucumber(84, 92, 5.5), face(110, 72, .7) + steam(110, 46)) },
  ];
  const byId = id => B.find(b => b.id === id);

  /* ---------- pieces ---------- */
  const tagRow = b => `<div class="row bf-tags">${b.c.split(' ').map(k => `<span class="chip ${k === 'sweet' ? 'berry' : k === 'protein' ? 'lav' : k === 'veg' ? 'mint' : k === 'iran' ? 'sun' : ''}">${CAT[k]}</span>`).join('')}</div>`;
  const recipeBtn = b => hasRecipe(b.r) ? `<button class="btn ghost bf-rec" data-rec="${esc(b.r)}">رسپی‌اش رو ببین ←</button>` : '';
  const meta = b => `<div class="row bf-meta"><span class="chip">⏱ ${fa(b.t)} دقیقه</span><span class="chip lav">${fa(b.p)} گرم پروتئین</span><span class="chip mint">${fa(b.f)} گرم فیبر</span></div>`;
  const card = b => `<article class="card bf-card" data-bf="${b.id}"><div class="bf-art">${b.a()}</div>
    <div class="stack" style="gap:8px"><h3>${esc(b.n)}</h3>${meta(b)}
      <p class="small"><b>توش چی هست:</b> ${esc(b.in)}</p><p class="small muted"><b>چرا خوبه:</b> ${esc(b.why)}</p>
      ${tagRow(b)}${recipeBtn(b)}</div></article>`;
  const bindRecipes = (el, close) => $$('[data-rec]', el).forEach(x => x.onclick = () => { if (close) close(); A.openRecipe(x.dataset.rec); });
  function openBf(id) {
    const b = byId(id); if (!b) return;
    A.modal(`<div class="stack bf-modal"><span class="eyebrow">صبحانه‌ی بی‌قند</span><div class="bf-art big">${b.a()}</div><h2>${esc(b.n)}</h2>${meta(b)}
      <p><b>توش چی هست:</b> ${esc(b.in)}</p><p class="muted"><b>چرا خوبه:</b> ${esc(b.why)}</p>${tagRow(b)}
      <div class="row">${recipeBtn(b)}${location.hash === '#breakfast' ? '' : '<a class="btn ghost" href="#breakfast" data-close>همه‌ی صبحانه‌ها ←</a>'}</div>
      <p class="small muted">عددهای پروتئین و فیبر تقریبی‌ان و به اندازه‌ی سهمت بستگی دارن.</p></div>`,
      (el, close) => { bindRecipes(el, close); $$('[data-close]', el).forEach(x => x.addEventListener('click', close)); });
  }
  A.openBreakfast = openBf;

  /* ---------- why it matters ---------- */
  const WHY = [
    ['📉', 'قند خون آروم‌تر', 'صبحانه‌ای که پروتئین و فیبر داره (تخم‌مرغ، ماست، پنیر، حبوبات، نون سبوس‌دار) قند خون رو آروم بالا می‌بره. ولی نون سفید و مربا و چای شیرین یه اوج تند می‌سازه که چند ساعت بعد با افت قند تموم می‌شه؛ همون موقع که ساعت ۱۱ دلت کیک می‌خواد.'],
    ['🍫', 'هوس کمتر تا آخر روز', 'توی چند تا آزمایش، صبحانه‌ی پرپروتئین (حدود ۳۰–۳۵ گرم) نسبت به صبحانه‌ی معمولی یا نخوردن صبحانه، هوس شیرینی و تنقلات عصر و شب رو کمتر کرد. یعنی هوس شب، گاهی از صبح شروع می‌شه.'],
    ['🔁', 'اثر وعده‌ی دوم', 'چیزی که صبح می‌خوری روی قند خونِ بعد از ناهار هم اثر داره. به این می‌گن «اثر وعده‌ی دوم». صبحانه‌ی پرفیبر و پروتئینی، می‌تونه واکنش قند خون به ناهار رو هم آروم‌تر کنه. توی آدم‌هایی که دیابت نوع ۲ دارن هم دیده شده که حذف صبحانه، قند خونِ بعد از ناهار و شام رو بالاتر می‌بره.'],
    ['😌', 'سیری و انرژی', 'پروتئین سیرکننده‌ترین بخش غذاست. یه صبحانه‌ی کامل یعنی کمتر به خوراکی‌های دم دست فکر می‌کنی و انرژیت یکنواخت‌تره، نه اون حالت سرخوشی و بعد خواب‌آلودگی که بعد از یه صبحانه‌ی شیرین میاد.'],
    ['🙂', 'حال و حوصله', 'خیلی‌ها با یه صبحانه‌ی خوب صبحشون آروم‌تر و کم‌حوصلگی‌شون کمتره، ولی شواهد علمی درباره‌ی خلق‌وخو هنوز قطعی نیست. پس به حس خودت گوش کن.'],
  ];
  const TRUTH = `<div class="card bf-truth stack" style="gap:8px"><b>🔬 راستش رو بخوای، علم چی می‌گه؟</b>
    <p>«صبحانه مهم‌ترین وعده‌ی روزه» یه شعار معروفه، ولی تحقیقات تصویر دقیق‌تری می‌دن:</p>
    <ul>
      <li><b>صبحانه و وزن:</b> یه مرور بزرگ در BMJ (۲۰۱۹) نشون داد خوردن صبحانه به خودی خود به لاغری کمک نمی‌کنه؛ اونایی که صبحانه می‌خوردن حتی کمی کالری بیشتری گرفته بودن. پس صبحانه «جادوی لاغری» نیست.</li>
      <li><b>نخوردن صبحانه هم لزوماً بد نیست:</b> برای بعضی‌ها پنجره‌ی غذایی محدود (مثلاً اولین وعده ساعت ۱۰ یا ۱۱) خوب جواب می‌ده. ولی شواهد نشون می‌ده پنجره‌ی زودتر (صبحانه بخوری، شام زود) برای قند خون بهتر از پنجره‌ی دیرتره.</li>
      <li><b>چیزی که بیشتر از همه مهمه، اینه که چی می‌خوری:</b> یه صبحانه‌ی شیرین ممکنه از نخوردن صبحانه هم بدتر باشه، چون روزت رو با یه اوج و افت قند شروع می‌کنه. اگه صبحانه می‌خوری، پروتئین و فیبر رو اول بذار.</li>
      <li><b>دیابت یا داروی قند داری؟</b> حذف صبحانه یا تغییر بزرگ برنامه‌ی غذایی رو حتماً با پزشکت هماهنگ کن.</li>
    </ul></div>`;
  const TRAPS = [
    ['☕', 'چای شیرین با قند پهلو', 'هر حبه قند حدود ۴–۵ گرم شکره؛ ۳ استکان با ۲ تا قند یعنی نصف سهم قند افزوده‌ی کل روز.', 'چای کم‌رنگ با دارچین یا هل؛ اگه سخته، هر هفته یه حبه کمتر کن.'],
    ['🍯', 'مربا و عسل زیاد', 'مربا نصفش شکره و عسل هم از نظر سازمان جهانی بهداشت «قند آزاد» حساب می‌شه، با اینکه طبیعیه.', 'میوه‌ی تازه، یکی دو تا خرما یا یه قاشق کوچیک عسل نهایتاً، کنار پنیر و گردو.'],
    ['🥣', 'کورن‌فلکس شیرین', 'خیلی از سریال‌های صبحانه، مخصوصاً رنگی‌ها و شکلاتی‌ها، تا یک‌سوم وزنشون شکره.', 'جو پرک ساده یا موسلی بی‌شکر با شیر و توت.'],
    ['🧃', 'آبمیوه‌ی پاکتی', 'حتی «صددرصد طبیعی»اش هم قند آزاده؛ فیبر میوه رو نداره و قند خون رو سریع بالا می‌بره.', 'خود میوه رو بخور، یا اسموتی با ماست و سبزی.'],
    ['🧁', 'کیک و کلوچه', 'کیک یزدی و کلوچه و کیک‌های بسته‌بندی پر از شکر و آرد سفیدن و تقریباً پروتئین ندارن.', 'نون تست سبوس‌دار با کره‌ی بادوم‌زمینی و موز، یا پنکیک موز.'],
    ['🥛', 'شیرکاکائو', 'یه پاکت شیرکاکائو ممکنه ۴–۶ حبه قند داشته باشه.', 'شیر ساده با کمی پودر کاکائوی تلخ و دارچین، یا شیر و یه خرما.'],
    ['🥖', 'نون شیرمال و نون‌های شیرین', 'شیرمال و نون‌های شیرین‌شده شکر دارن و با مربا یه صبحانه‌ی کاملاً قندی می‌سازن.', 'نون سنگک یا بربری سبوس‌دار با پنیر و سبزی.'],
  ];
  const REFS = [
    'Leidy HJ, Ortinau LC, Douglas SM, Hoertel HA. Beneficial effects of a higher-protein breakfast on the appetitive, hormonal, and neural signals controlling energy intake regulation in overweight/obese, "breakfast-skipping," late-adolescent girls. Am J Clin Nutr. 2013;97(4):677–688.',
    'Hoertel HA, Will MJ, Leidy HJ. A randomized crossover, pilot study examining the effects of a normal protein vs. high protein breakfast on food cravings and reward signals in overweight/obese "breakfast skipping", late-adolescent girls. Nutr J. 2014;13:80.',
    'Jakubowicz D, Wainstein J, Ahrén B, et al. Fasting until noon triggers increased postprandial hyperglycemia and impaired insulin response after lunch and dinner in individuals with type 2 diabetes: a randomized clinical trial. Diabetes Care. 2015;38(10):1820–1826.',
    'Jenkins DJ, Wolever TM, Taylor RH, et al. Slow release dietary carbohydrate improves second meal tolerance. Am J Clin Nutr. 1982;35(6):1339–1346.',
    'Park YM, Heden TD, Liu Y, et al. A high-protein breakfast induces greater insulin and glucose-dependent insulinotropic peptide responses to a subsequent lunch meal in individuals with type 2 diabetes. J Nutr. 2015;145(3):452–458.',
    'Chang CR, Francois ME, Little JP. Restricting carbohydrates at breakfast is sufficient to reduce 24-hour exposure to postprandial hyperglycemia and improve glycemic variability. Am J Clin Nutr. 2019;109(5):1302–1309.',
    'Shukla AP, Iliescu RG, Thomas CE, Aronne LJ. Food order has a significant impact on postprandial glucose and insulin levels. Diabetes Care. 2015;38(7):e98–e99.',
    'Sievert K, Hussain SM, Page MJ, et al. Effect of breakfast on weight and energy intake: systematic review and meta-analysis of randomised controlled trials. BMJ. 2019;364:l42.',
    'Dhurandhar EJ, Dawson J, Alcorn A, et al. The effectiveness of breakfast recommendations on weight loss: a randomized controlled trial. Am J Clin Nutr. 2014;100(2):507–513.',
    'Betts JA, Richardson JD, Chowdhury EA, et al. The causal role of breakfast in energy balance and health: a randomized controlled trial in lean adults. Am J Clin Nutr. 2014;100(2):539–547.',
    'Lowe DA, Wu N, Rohdin-Bibby L, et al. Effects of time-restricted eating on weight loss and other metabolic parameters in women and men with overweight and obesity: the TREAT randomized clinical trial. JAMA Intern Med. 2020;180(11):1491–1499.',
    'Sutton EF, Beyl R, Early KS, et al. Early time-restricted feeding improves insulin sensitivity, blood pressure, and oxidative stress even without weight loss in men with prediabetes. Cell Metab. 2018;27(6):1212–1221.',
    'Leidy HJ, Clifton PM, Astrup A, et al. The role of protein in weight loss and maintenance. Am J Clin Nutr. 2015;101(6):1320S–1329S.',
    'World Health Organization. Guideline: sugars intake for adults and children. Geneva: WHO; 2015.',
  ];

  /* ---------- anti-craving plate builder ---------- */
  // option: [id, label, protein g, fiber g, draw(x, y), trap?]
  const GROUPS = [
    { k: 'p', t: 'یه پروتئین', need: true, o: [
      ['egg', 'تخم‌مرغ (۲ تا)', 12, 0, (x, y) => egg(x - 4, y - 2, .7) + egg(x + 8, y + 6, .6)],
      ['cheese', 'پنیر (یه قوطی کبریت)', 7, 0, (x, y) => cheese(x - 12, y - 8, 24, 15)],
      ['yog', 'ماست یونانی', 15, 0, (x, y) => bowl(x, y - 4, 14, '#cdbdec', '#fffdf6')],
      ['adas', 'عدسی یا لوبیا', 12, 8, (x, y) => bowl(x, y - 4, 14, '#f6c3a5', '#c8834f') + dots(scatter(x, y - 4, 9, 3, 6, 2), '#a86a3f', 1.3)],
      ['hummus', 'حمص', 5, 3, (x, y) => bowl(x, y - 4, 13, '#bfe3cf', '#e8cf9c')],
      ['milk', 'یه لیوان شیر', 8, 0, (x, y) => glass(x, y - 6, '#fffaf2', 26)],
    ] },
    { k: 'g', t: 'یه فیبر یا غله‌ی کامل', need: true, o: [
      ['sangak', 'نون سنگک', 5, 3, (x, y) => sangak(x - 20, y - 9, 40, 18)],
      ['whole', 'نون سبوس‌دار یا جو', 7, 5, (x, y) => toast(x, y, .8)],
      ['oats', 'جو دوسر', 5, 4, (x, y) => bowl(x, y - 4, 14, '#a8d0e8', '#ead5ab') + dots(scatter(x, y - 4, 9, 3, 5, 1), '#d7b984', 1.4)],
      ['chia', 'دونه‌ی چیا', 4, 7, (x, y) => bowl(x, y - 4, 12, '#cdbdec', '#ece6dc') + dots(scatter(x, y - 4, 8, 3, 7, 4), '#6b6470', .9)],
      ['white', 'نون سفید یا باگت', 5, 1, (x, y) => `<rect x="${x - 20}" y="${y - 7}" width="40" height="14" rx="7" fill="#efd3a0"/>`, 1],
      ['flakes', 'کورن‌فلکس شیرین', 2, 1, (x, y) => bowl(x, y - 4, 14, '#f6c3a5', '#f4d26a') + dots(scatter(x, y - 4, 9, 3, 6, 3), '#e98a5a', 1.6), 1],
    ] },
    { k: 'v', t: 'یه میوه یا سبزی', need: true, o: [
      ['tc', 'گوجه و خیار', 1, 2, (x, y) => tomato(x - 6, y, 6) + cucumber(x + 7, y + 2, 5.5)],
      ['herbs', 'سبزی خوردن', 1, 2, (x, y) => herbs(x - 6, y)],
      ['berry', 'توت‌فرنگی یا شاه‌توت', 1, 3, (x, y) => berries([[x - 6, y], [x + 3, y - 3], [x + 4, y + 5]], '#e2607c')],
      ['apple', 'یه سیب', 0, 4, (x, y) => apple(x, y + 2)],
      ['banana', 'نصف موز', 1, 2, (x, y) => banana([[x - 6, y], [x + 4, y - 2], [x + 2, y + 7]])],
      ['spin', 'اسفناج یا سبزی پخته', 2, 2, (x, y) => leaf(x - 8, y, -10, '#4f8a43') + leaf(x - 2, y + 4, 30, '#6f9a52')],
      ['juice', 'آبمیوه‌ی پاکتی', 0, 0, (x, y) => glass(x, y - 4, '#f6a85a', 24), 1],
    ] },
    { k: 'f', t: 'چربی خوب (اختیاری)', o: [
      ['none', 'هیچی', 0, 0, () => ''],
      ['walnut', 'چند تا گردو', 2, 1, (x, y) => walnut(x - 4, y) + walnut(x + 5, y + 3) + walnut(x, y - 4)],
      ['almond', 'یه مشت بادوم', 3, 2, (x, y) => almond(x - 4, y, 20) + almond(x + 5, y + 2, -15) + almond(x, y - 4, 60)],
      ['avo', 'نصف آووکادو', 2, 5, (x, y) => avocado(x, y, .6)],
      ['olive', 'زیتون یا روغن زیتون', 0, 1, (x, y) => E(x - 4, y, 4, 3, '#7c8f3e') + E(x + 4, y + 3, 4, 3, '#93a64e') + E(x + 1, y - 4, 4, 3, '#6b7d34')],
      ['ardeh', 'یه قاشق ارده', 3, 1, (x, y) => bowl(x, y - 4, 10, '#a8d0e8', '#d9b07c')],
    ] },
  ];
  const SLOT = { p: [56, 70], g: [102, 64], v: [100, 92], f: [60, 94] };
  const pick = { p: 'egg', g: 'sangak', v: 'tc', f: 'walnut' };
  const optOf = (g, id) => GROUPS.find(x => x.k === g).o.find(o => o[0] === id);
  const TRAP_MSG = { flakes: 'کورن‌فلکس شیرین پر از شکره؛ جو پرک ساده یا نون سبوس‌دار رو امتحان کن.', juice: 'آبمیوه قند آزاده و فیبر نداره؛ خود میوه خیلی بهتره.', white: 'نون سفید فیبر کمی داره و قند خون رو تندتر بالا می‌بره؛ سنگک یا نون سبوس‌دار بهتره.' };
  function plateView() {
    let p = 0, f = 0, inner = plate(80, 78, 64, 32);
    const bad = [];
    GROUPS.forEach(g => { const o = optOf(g.k, pick[g.k]); p += o[2]; f += o[3]; if (o[5]) bad.push(o[0]); inner += o[4](...SLOT[g.k]); });
    const good = !bad.length && p >= 12 && f >= 5;
    const crisp = good ? face(80, 46, 1) + heart(124, 34) + heart(30, 38, '#f4bd45') : '';
    let msg;
    if (bad.length) msg = bad.map(k => TRAP_MSG[k]).join(' ');
    else if (p < 12) msg = 'خوبه، ولی پروتئینش کمه. یه تخم‌مرغ یا یه کاسه ماست اضافه کن تا هوس ساعت ۱۱ سراغت نیاد.';
    else if (f < 5) msg = 'پروتئینش خوبه! فقط یه کم فیبر بیشتر بذار؛ مثلاً سبزی، توت یا نون سبوس‌دار.';
    else if (p >= 18) msg = 'آفرین، این یه بشقاب ضدهوس واقعیه! پروتئین بالا و فیبر خوب یعنی قند خون آروم و سیری تا ظهر. 🎉';
    else msg = 'بشقاب خیلی خوبیه! پروتئین، فیبر و رنگ داره. اگه خواستی یه کم پروتئین بیشتر کن تا دیرتر گرسنه شی.';
    const bar = (v, max, cls) => `<span class="bf-bar"><i class="${cls}" style="width:${Math.min(100, v / max * 100)}%"></i></span>`;
    return `<div class="bf-plate">${wc(C.cream, inner, crisp, 'plate')}</div>
      <div class="stack" style="gap:8px;min-width:0">
        <div class="bf-meter"><span class="small">حدود ${fa(p)} گرم پروتئین</span>${bar(p, 25, 'p')}</div>
        <div class="bf-meter"><span class="small">حدود ${fa(f)} گرم فیبر</span>${bar(f, 12, 'f')}</div>
        <p class="bf-verdict ${good ? 'ok' : bad.length ? 'bad' : ''}">${msg}</p>
        <p class="small muted">هدف خوب: حدود ۲۰ گرم پروتئین و ۵ تا ۱۰ گرم فیبر. عددها تقریبی‌ان.</p></div>`;
  }
  const builder = () => `<div class="bf-builder">
    <div class="stack" style="gap:12px;min-width:0">${GROUPS.map(g => `<div class="stack" style="gap:6px"><b class="small">${g.t}</b><div class="row bf-opts" role="radiogroup" aria-label="${esc(g.t)}">${g.o.map(o => `<button type="button" role="radio" aria-checked="${pick[g.k] === o[0]}" class="${pick[g.k] === o[0] ? 'on' : ''}${o[5] ? ' trap' : ''}" data-g="${g.k}" data-o="${o[0]}">${esc(o[1])}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="card bf-result" id="bfres" aria-live="polite">${plateView()}</div></div>`;

  /* ---------- 7-day plan, mistakes, low-appetite tips ---------- */
  const WEEK = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  const PLAN = [['sangak', 'شروع هفته با کلاسیک خودمون، با چای بی‌قند'], ['overnight', 'شب قبلش توی شیشه بریز، صبح فقط بردار'], ['nimroo', 'گرم و پروتئینی، ۸ دقیقه کار'], ['yogurt', 'سبک و شیرین، بدون یک ذره شکر'], ['eggwrap', 'یه رپ برای توی راه، وسط هفته‌ی شلوغ'], ['avotoast', 'آخر هفته نزدیکه؛ یه کم فانتزی‌تر'], ['adasi', 'جمعه، صبحانه‌ی گرم و دورهمی']];
  const todayIdx = () => (new Date().getDay() + 1) % 7;
  const planView = () => { const ti = todayIdx(); return `<div class="bf-week">${PLAN.map(([id, note], i) => { const b = byId(id); return `<button type="button" class="card bf-day${i === ti ? ' today' : ''}" data-open="${id}"><span class="bf-dn">${WEEK[i]}${i === ti ? '، امروز' : ''}</span><div class="bf-art sm">${b.a()}</div><b>${esc(b.n)}</b><span class="small muted">${esc(note)}</span></button>`; }).join('')}</div>`; };
  const MISTAKES = [
    'صبحانه‌ای که فقط کربوهیدراته: نون و مربا، یا نون و کره و چای شیرین. پروتئین رو جا ننداز.',
    'گول خوراکی‌های «سالم‌نما» رو نخور: گرانولا، ماست میوه‌ای، بیسکویت رژیمی و آبمیوه معمولاً شکر دارن. برچسب رو بخون.',
    'حذف صبحانه و بعد ساعت ۱۱ کیک و قهوه‌ی شیرین. اگه صبحانه نمی‌خوری، اولین وعده‌ات حتماً پروتئینی باشه.',
    'قهوه یا چای شیرین به‌جای صبحانه. یه لاته‌ی شیرین‌شده خودش یه دسره.',
    'عسل و خرما رو «بی‌حساب» خوردن چون طبیعی‌ان. یکی دو تا خرما یا یه قاشق کوچیک عسل نهایتاً.',
    'خیلی کم خوردن و بعد گرسنگی شدید ظهر. یه صبحانه‌ی کامل، ناهار رو هم آروم‌تر می‌کنه.',
  ];
  const APPETITE = [
    ['💧', 'اول یه لیوان آب', 'بیدار که شدی یه لیوان آب بخور و ۲۰–۳۰ دقیقه بعد سراغ غذا برو.'],
    ['🥄', 'کوچیک شروع کن', 'لازم نیست یه بشقاب کامل باشه: یه تخم‌مرغ آب‌پز یا چند قاشق ماست هم شروع خوبیه.'],
    ['🥤', 'نوشیدنی‌اش کن', 'یه اسموتی با ماست یا یه لیوان شیر، برای وقتی که جویدن سخته.'],
    ['🎒', 'با خودت ببر', 'صبحانه‌ی جیبی یا یه لقمه بذار توی کیفت و ساعت ۹ یا ۱۰ بخورش.'],
    ['🌙', 'شام رو یه کم زودتر بخور', 'شام سنگین و دیروقت معمولاً یعنی صبح اشتها نداری.'],
    ['🚶', 'یه کم تکون بخور', 'چند دقیقه پیاده‌روی یا کش و قوس صبحگاهی اشتها رو بیدار می‌کنه.'],
    ['🕙', 'اگه واقعاً گرسنه نیستی، اشکالی نداره', 'به بدنت گوش کن؛ فقط اولین وعده‌ات رو پروتئینی و بی‌قند انتخاب کن، نه شیرینی دم دست.'],
  ];

  /* ---------- route ---------- */
  let cat = 'all', focus = '';
  const off = () => `<section class="wrap"><div class="card">این بخش فعلاً در دسترس نیست. <a href="#today">برگشت</a></div></section>`;
  const heroArt = () => wc(C.butter, plate(70, 80, 56, 24) + sangak(24, 62, 50, 22) + cheese(78, 62, 22, 14) + walnut(106, 74) + walnut(112, 68) + herbs(80, 86) + egg(52, 86, .6) + cup(126, 64, '#cdbdec', '#e9b07a') + P(40, 28, 13, 13, '#f7c95a'), face(126, 74, .7) + face(40, 29, .7) + steam(126, 48) + heart(140, 22));
  A.titles.breakfast = 'صبحانه';
  A.views.breakfast = () => {
    if (!on('breakfast')) return off();
    return `<section class="wrap stack bf" style="gap:26px">
      <div class="bf-hero card"><div class="bf-hero-art">${heroArt()}</div><div class="stack" style="gap:8px;min-width:0"><span class="eyebrow">صبحانه</span><h2>صبحانه‌ی بی‌قند، شروع آروم یه روز بی‌هوس</h2><p class="muted">چرا صبحانه برای ترک قند مهمه، ${fa(B.length)} تا ایده‌ی جورواجور (از نون و پنیر و گردو تا پنکیک موز)، یه بشقاب‌ساز ضدهوس و برنامه‌ی یه هفته.</p>
        <nav class="row bf-jump" aria-label="بخش‌های صفحه"><a class="chip sun" href="#bf-why">چرا مهمه؟</a><a class="chip mint" href="#bf-ideas">ایده‌ها</a><a class="chip lav" href="#bf-build">بشقاب ضدهوس</a><a class="chip berry" href="#bf-plan">برنامه‌ی هفته</a><a class="chip" href="#bf-tips">اشتها ندارم</a></nav></div></div>

      <div class="stack" id="bf-why" style="gap:12px"><div class="section-head" style="margin:0"><span class="eyebrow">چرا صبحانه مهمه؟</span><h2>صبحانه‌ی خوب، هوس شیرینی رو از صبح مهار می‌کنه</h2></div>
        <div class="bf-why">${WHY.map(([i, t, x]) => `<div class="card bf-wcard"><span class="bf-wi" aria-hidden="true">${i}</span><b>${t}</b><p class="small">${x}</p></div>`).join('')}</div>
        ${TRUTH}
        <h3>تله‌های قندی صبحانه‌ی ایرانی</h3>
        <div class="bf-traps">${TRAPS.map(([i, t, x, s]) => `<div class="card bf-trap"><b>${i} ${t}</b><p class="small muted">${x}</p><p class="small bf-swap"><b>به‌جاش:</b> ${s}</p></div>`).join('')}</div>
        <details class="card bf-refs"><summary><b>منابع</b> <span class="small muted">(${fa(REFS.length)} پژوهش و راهنما)</span></summary><ol class="refs" dir="ltr">${REFS.map(r => `<li>${esc(r)}</li>`).join('')}</ol></details></div>

      <div class="stack" id="bf-ideas" style="gap:12px"><div class="section-head" style="margin:0"><span class="eyebrow">ایده‌های صبحانه</span><h2>${fa(B.length)} تا صبحانه‌ی جورواجور، بدون قند افزوده</h2><p class="muted">یه دسته رو انتخاب کن. اونایی که رسپی کاملشون توی سایت هست، دکمه‌ی «رسپی‌اش رو ببین» دارن.</p></div>
        <div class="filters bf-filters" role="tablist">${CATS.map(([k, t]) => `<button role="tab" aria-selected="${k === cat}" data-cat="${k}" class="${k === cat ? 'on' : ''}">${t}</button>`).join('')}</div>
        <div class="bf-grid" id="bfgrid"></div></div>

      <div class="stack" id="bf-build" style="gap:12px"><div class="section-head" style="margin:0"><span class="eyebrow">بشقاب صبحانه‌ی ضدهوس</span><h2>بشقابت رو خودت بچین</h2><p class="muted">یه پروتئین، یه فیبر یا غله‌ی کامل، یه میوه یا سبزی و اگه خواستی یه چربی خوب. ببین بشقابت چی می‌گه!</p></div>${builder()}</div>

      <div class="stack" id="bf-plan" style="gap:12px"><div class="section-head" style="margin:0"><span class="eyebrow">برنامه‌ی ۷ روزه</span><h2>یه هفته صبحانه، هر روز یه چیز تازه</h2><p class="muted">روی هر روز بزن تا جزئیاتش رو ببینی.</p></div>${planView()}</div>

      <div class="bf-two" id="bf-tips">
        <div class="card stack" style="gap:8px"><h3>اشتباه‌های رایج</h3><ul class="bf-list">${MISTAKES.map(m => `<li>${m}</li>`).join('')}</ul></div>
        <div class="card stack" style="gap:8px"><h3>اگه صبح اشتها ندارم چی؟</h3><ul class="bf-list tips">${APPETITE.map(([i, t, x]) => `<li><span aria-hidden="true">${i}</span><span><b>${t}:</b> ${x}</span></li>`).join('')}</ul></div>
      </div>
      <p class="small muted">این مطالب جای مشاوره‌ی پزشکی رو نمی‌گیره. اگه دیابت داری و دارو مصرف می‌کنی، باردار یا شیرده هستی، یا سابقه‌ی اختلال خوردن داری، قبل از تغییر برنامه‌ی غذایی با پزشکت مشورت کن.</p>
    </section>`;
  };
  function drawGrid() {
    const g = $('#bfgrid'); if (!g) return;
    g.innerHTML = B.filter(b => cat === 'all' || b.c.split(' ').includes(cat)).map(card).join('');
    bindRecipes(g);
  }
  function bindBuilder() {
    $$('.bf-opts button').forEach(b => b.onclick = () => {
      const g = b.dataset.g; pick[g] = b.dataset.o;
      $$(`.bf-opts button[data-g="${g}"]`).forEach(x => { const sel = x.dataset.o === pick[g]; x.classList.toggle('on', sel); x.setAttribute('aria-checked', sel); });
      $('#bfres').innerHTML = plateView();
    });
  }
  A.mounts.breakfast = () => {
    if (!on('breakfast')) return;
    drawGrid(); bindBuilder();
    $$('.bf-filters button').forEach(b => b.onclick = () => { cat = b.dataset.cat; $$('.bf-filters button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); drawGrid(); });
    $$('[data-open]').forEach(b => b.onclick = () => openBf(b.dataset.open));
    $$('.bf-jump a').forEach(a => a.onclick = e => { e.preventDefault(); const t = document.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    if (focus) { const id = focus; focus = ''; setTimeout(() => { const t = document.getElementById(id); if (t) t.scrollIntoView({ block: 'start' }); }, 30); }
  };

  /* ---------- entry points ---------- */
  A.tools.push({ route: 'breakfast', icon: '🍳', title: 'صبحانه', desc: `چرا مهمه، ${fa(B.length)} ایده‌ی بی‌قند و بشقاب ضدهوس`, show: () => on('breakfast') });
  add('recipesTop', () => on('breakfast') ? `<a class="card row bf-inline" href="#breakfast"><span class="tool-i" aria-hidden="true">🍳</span><span style="min-width:0;flex:1"><b>صبحانه‌ی بی‌قند</b><br><span class="small muted">${fa(B.length)} ایده‌ی صبحانه، از نون و پنیر و گردو تا پنکیک موز، با بشقاب‌ساز ضدهوس</span></span><span aria-hidden="true">←</span></a>` : '');
  add('todayAside', () => {
    const h = new Date().getHours();
    if (!on('breakfast') || h < 5 || h >= 12) return '';
    const i = todayIdx(), [id, note] = PLAN[i], b = byId(id);
    return `<a class="card bf-today" href="#breakfast"><div class="bf-art sm">${b.a()}</div><span class="stack" style="gap:2px;min-width:0"><span class="small muted">🍳 صبحانه‌ی امروز، ${WEEK[i]}</span><b>${esc(b.n)}</b><span class="small muted">${esc(note)}</span></span></a>`;
  });
  add('mount', r => { if (r === 'today') { const t = $('.bf-today'); if (t) t.addEventListener('click', () => { focus = 'bf-plan'; }); } });
  const goTo = id => () => { focus = id; A.go('breakfast'); };
  (A.searchExtra = A.searchExtra || []).push(() => !on('breakfast') ? [] : [
    { icon: '🍳', title: 'صبحانه‌ی بی‌قند', sub: 'صبحانه', group: 'صبحانه', text: 'صبحانه چرا مهمه قند خون هوس اثر وعده دوم ناشتا نخوردن صبحانه پنجره غذایی ایده صبحانه', open: () => A.go('breakfast') },
    { icon: '🍽', title: 'بشقاب صبحانه‌ی ضدهوس', sub: 'صبحانه', group: 'صبحانه', text: 'بشقاب ساز صبحانه پروتئین فیبر ضدهوس', open: goTo('bf-build') },
    { icon: '📅', title: 'برنامه‌ی ۷ روزه‌ی صبحانه', sub: 'صبحانه', group: 'صبحانه', text: 'برنامه هفته صبحانه هر روز', open: goTo('bf-plan') },
    { icon: '😶', title: 'اگه صبح اشتها ندارم', sub: 'صبحانه', group: 'صبحانه', text: 'اشتها ندارم صبح گرسنه نیستم صبحانه نمی‌تونم بخورم', open: goTo('bf-tips') },
    ...TRAPS.map(([i, t, x, s]) => ({ icon: i, title: t, sub: 'تله‌ی قندی صبحانه', group: 'صبحانه', text: `${t} ${x} ${s} صبحانه`, note: 'به‌جاش: ' + s, open: goTo('bf-why') })),
    ...B.map(b => ({ icon: '🍳', title: b.n, sub: 'صبحانه، ' + fa(b.t) + ' دقیقه', group: 'صبحانه', text: `${b.n} ${b.in} ${b.why} صبحانه`, open: () => openBf(b.id) })),
  ]);
});
