/* App theme (plugin "theme"): seasonal and occasion themes for the whole app, plus the plain pastel background.
   A.season is the shared module: the watercolor kit (inline SVG with its own filter per drawing), 9 themes
   (4 seasons + Nowruz, Yalda, Ramadan, Chaharshanbe-Suri, Sizdah-Bedar), the auto pick by Jalali date, and
   decor(theme, slot) which returns cached SVG strings. The choice lives in localStorage 'uzhu:season'
   ('' = automatic, a theme id, or 'plain'). Sets body[data-season] (themed) or body[data-pal] (plain pastel);
   colors are in css/theme.css, the night page layout in js/night-theme.js + css/night-theme.css.
   Feature key: 'theme' (off = the original plain white look). */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const add = (name, fn) => { A.H[name] = (A.H[name] || []).concat(fn); };
  const esc = A.esc || (s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

  /* ---------------- watercolor kit ---------------- */
  let uid = 0;
  const FACE = '#5a3f3f';
  // pigment layer + darker pooled edge (the displacement filter makes both wobble like wet paint)
  const W = (tag, a, c, o = .6, sw = 1.6) => `<${tag} ${a} fill="${c}" fill-opacity="${o}"/><${tag} ${a} fill="none" stroke="${c}" stroke-opacity="${Math.min(.9, o + .15)}" stroke-width="${sw}"/>`;
  const G = (tag, a, c, o = .3) => `<${tag} ${a} fill="${c}" fill-opacity="${o}"/>`;
  const HL = (tag, a, o = .4) => `<${tag} ${a} fill="#fff" fill-opacity="${o}"/>`;
  const ln = (d, c, w = 1.6, o = .75) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="${o}"/>`;
  const face = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-5" cy="0" r="1.7" fill="${FACE}"/><circle cx="5" cy="0" r="1.7" fill="${FACE}"/><path d="M-2.6 3.3 Q0 5.8 2.6 3.3" fill="none" stroke="${FACE}" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="-9" cy="3.6" rx="2.8" ry="1.6" fill="#f08a9a" opacity=".6"/><ellipse cx="9" cy="3.6" rx="2.8" ry="1.6" fill="#f08a9a" opacity=".6"/></g>`;
  const HEART = 'M50 34 C50 22 34 16 28 30 C23 42 40 54 50 66 C60 54 77 42 72 30 C66 16 50 22 50 34Z';
  const MAPLE = 'M50 8 L57 27 L67 20 L64 38 L81 30 L77 43 L93 45 L80 55 L86 63 L66 62 L68 75 L54 66 L51 88 L49 88 L46 66 L32 75 L34 62 L14 63 L20 55 L7 45 L23 43 L19 30 L36 38 L33 20 L43 27Z';
  const STAR = 'M50 10 L61 38 L91 39 L67 57 L76 87 L50 70 L24 87 L33 57 L9 39 L39 38Z';
  const C = { peach: '#f4a582', butter: '#f3cd6b', rose: '#e79aa6', dusty: '#d8848f', sage: '#93bb85', sageD: '#5f9157', sky: '#8fc0e6', skyD: '#5b93c4', cream: '#f6e6c8', terra: '#d9774f', rust: '#bf4f2b', mustard: '#e0a23a', brown: '#8a5a3c', brownD: '#6b4430', berry: '#c8384a', plum: '#8e5aa0', navy: '#3a4f86', gold: '#e2b043', orange: '#ee8a35', green: '#6fae55', lav: '#b39ddf', white: '#f4f7fb', red: '#d9473f' };

  // each element returns [painted part (gets the watercolor filter), crisp overlay (faces, labels)], drawn in a 100×100 box
  const E = {
    maple: (c = C.terra, v = C.rust) => [W('path', `d="${MAPLE}"`, c, .58) + G('path', `d="${MAPLE}" transform="translate(50 50) scale(.55) translate(-50 -46)"`, v, .3) + ['M50 66 L50 16', 'M50 64 L84 47', 'M50 64 L16 47', 'M50 66 L70 66', 'M50 66 L30 66'].map(d => ln(d, v, 1.1, .5)).join('') + ln('M50 66 Q52 82 46 97', C.brown, 2.2, .7), ''],
    leaf: (c = C.sage, v = C.sageD) => [W('path', 'd="M50 8 C78 28 78 70 50 92 C22 70 22 28 50 8Z"', c, .55) + G('path', 'd="M50 8 C78 28 78 70 50 92 C60 60 60 36 50 8Z"', v, .25) + ln('M50 14 L50 98', v, 1.4, .6) + ln('M50 40 L64 30 M50 56 L66 46 M50 40 L36 30 M50 56 L34 46', v, 1, .45), ''],
    berries: () => [ln('M10 92 Q40 60 88 18', C.brown, 2.4, .7) + ln('M44 58 Q54 56 62 64 M30 74 Q26 62 32 52 M64 38 Q76 42 80 54', C.brown, 1.6, .6) + [[62, 66, 9], [74, 60, 8], [68, 76, 7.5], [32, 50, 8.5], [24, 40, 7], [82, 56, 7], [86, 46, 6]].map(([x, y, r]) => W('circle', `cx="${x}" cy="${y}" r="${r}"`, C.berry, .7) + HL('circle', `cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 3.2}"`)).join(''), ''],
    bow: (c = C.dusty) => [W('path', 'd="M50 46 C30 16 4 24 12 42 C18 58 38 54 50 46Z"', c, .6) + W('path', 'd="M50 46 C70 16 96 24 88 42 C82 58 62 54 50 46Z"', c, .6) + W('path', 'd="M47 50 L32 92 L41 86 L48 96 L52 52Z"', c, .55) + W('path', 'd="M53 50 L66 90 L58 86 L52 96 L48 52Z"', c, .5) + W('circle', 'cx="50" cy="47" r="7"', c, .8) + G('path', 'd="M14 40 C22 30 34 34 44 44 C34 40 24 40 14 40Z"', '#fff', .3), ''],
    heart: (c = C.rose) => [W('path', `d="${HEART}"`, c, .65) + HL('ellipse', 'cx="36" cy="32" rx="5" ry="3.5" transform="rotate(-30 36 32)"'), ''],
    pumpkin: () => [
      W('ellipse', 'cx="30" cy="64" rx="22" ry="25"', C.orange, .6) + W('ellipse', 'cx="70" cy="64" rx="22" ry="25"', C.orange, .6) + W('ellipse', 'cx="50" cy="64" rx="20" ry="28"', C.orange, .62)
      + G('ellipse', 'cx="50" cy="80" rx="38" ry="12"', C.rust, .25) + ln('M38 42 Q34 64 40 88 M62 42 Q66 64 60 88', C.rust, 1.2, .45)
      + W('path', 'd="M47 38 Q45 24 52 17 L57 21 Q52 28 54 38Z"', C.brown, .75) + W('path', 'd="M55 26 C64 16 76 20 78 26 C70 30 62 30 55 26Z"', C.sage, .6)
      + W('path', 'd="M10 50 Q50 66 90 50 L92 59 Q50 77 8 59Z"', C.rose, .7) + ln('M20 56 L19 64 M32 60 L31 68 M44 62 L44 70 M56 62 L56 70 M68 60 L69 68 M80 56 L81 64', '#fff', 1.3, .55)
      + W('path', 'd="M70 60 L80 92 L69 94 L63 63Z"', C.rose, .65) + ln('M70 94 L69 99 M74 93 L74 98 M78 92 L79 97', C.dusty, 1.2, .7),
      face(48, 77, .9)],
    cup: (body = '#f2d7bd', top = C.brown, mark = 'heart', mallow = false) => [
      W('ellipse', 'cx="50" cy="90" rx="42" ry="8"', C.cream, .8) + G('ellipse', 'cx="50" cy="92" rx="30" ry="4"', C.brown, .15)
      + ln('M80 50 Q99 48 96 64 Q93 78 78 76', body === '#f2d7bd' ? C.terra : C.dusty, 5, .55)
      + W('path', 'd="M18 40 L82 40 L77 82 Q50 92 23 82Z"', body, .85) + G('path', 'd="M60 41 L82 40 L77 82 Q68 86 60 87Z"', C.terra, .18)
      + W('ellipse', 'cx="50" cy="40" rx="32" ry="6"', top, .7)
      + (mallow ? [[38, 37], [50, 35], [60, 38]].map(([x, y]) => W('rect', `x="${x - 5}" y="${y - 5}" width="10" height="9" rx="2.5"`, '#fff', .9)).join('') : '')
      + (mark === 'heart' ? `<g transform="translate(37 52) scale(.28)">${W('path', `d="${HEART}"`, C.berry, .7)}</g>` : '')
      + ln('M40 30 Q34 22 40 15 Q46 8 40 2 M56 30 Q50 22 56 15 Q62 8 56 2', '#b8a89a', 1.8, .45),
      mark === 'face' ? face(50, 62, .9) : ''],
    books: (labels, cols = [C.sage, C.dusty, C.mustard, C.terra]) => {
      const rows = [[8, 76, 84, 18, -1.2], [14, 58, 74, 18, 1.4], [6, 40, 82, 18, -1.6], [16, 22, 70, 18, 1]];
      return [rows.map(([x, y, w, h, r], i) => `<g transform="rotate(${r} 50 ${y + 9})">${W('rect', `x="${x}" y="${y}" width="${w}" height="${h}" rx="3"`, cols[i], .62)}${G('rect', `x="${x}" y="${y + h - 5}" width="${w}" height="5" rx="2"`, '#000', .08)}${W('rect', `x="${x + w - 7}" y="${y + 2}" width="5" height="${h - 4}" rx="1"`, '#fff8ea', .9, .6)}</g>`).join(''),
        rows.map(([x, y, w, h, r], i) => labels[i] ? `<text x="${x + (w - 6) / 2}" y="${y + 13}" transform="rotate(${r} 50 ${y + 9})" text-anchor="middle" direction="rtl" class="nt-svgt" font-size="9" fill="#4a3530">${esc(labels[i])}</text>` : '').join('')];
    },
    book: (c = C.berry, label = 'دیوان حافظ') => [W('rect', 'x="14" y="22" width="72" height="60" rx="4" transform="rotate(-4 50 52)"', c, .7) + G('rect', 'x="14" y="70" width="72" height="12" rx="3" transform="rotate(-4 50 52)"', '#000', .12) + `<rect x="22" y="30" width="56" height="44" rx="3" transform="rotate(-4 50 52)" fill="none" stroke="${C.gold}" stroke-width="2" stroke-opacity=".8"/>` + W('rect', 'x="14" y="80" width="72" height="6" rx="2" transform="rotate(-4 50 52)"', '#fff4dc', .9, .6) + W('path', 'd="M60 82 L62 98 L66 93 L70 97 L68 81Z"', C.gold, .7),
      `<text x="50" y="58" transform="rotate(-4 50 52)" text-anchor="middle" direction="rtl" class="nt-svgt" font-size="11" fill="#fff6e6">${esc(label)}</text>`],
    snowflake: (c = C.skyD) => [[0, 60, 120].map(a => `<g transform="rotate(${a} 50 50)">${ln('M50 10 L50 90', c, 3.4, .5)}${ln('M50 22 L42 14 M50 22 L58 14 M50 78 L42 86 M50 78 L58 86 M50 36 L40 30 M50 36 L60 30 M50 64 L40 70 M50 64 L60 70', c, 2.4, .45)}</g>`).join('') + W('circle', 'cx="50" cy="50" r="5"', c, .5), ''],
    pine: () => [ln('M6 20 Q50 34 96 70', C.brown, 3, .65) + Array.from({ length: 13 }, (_, i) => { const t = i / 12, x = 10 + t * 82, y = 21 + t * 46 + t * t * 4; return ln(`M${x} ${y} l${-6 + (i % 2) * 2} -16 M${x} ${y} l8 -14 M${x} ${y} l-10 10 M${x} ${y} l6 14`, i % 2 ? C.sageD : C.green, 2.4, .55); }).join('') + [[30, 40], [62, 56]].map(([x, y]) => W('circle', `cx="${x}" cy="${y}" r="5"`, C.berry, .7)).join(''), ''],
    snowman: () => [W('circle', 'cx="50" cy="70" r="26"', C.white, .95) + G('path', 'd="M70 54 A26 26 0 0 1 50 96 A30 30 0 0 0 70 54Z"', C.sky, .45) + W('circle', 'cx="50" cy="34" r="19"', C.white, .95) + G('path', 'd="M64 22 A19 19 0 0 1 50 53 A22 22 0 0 0 64 22Z"', C.sky, .45)
      + W('path', 'd="M30 48 Q50 58 70 48 L71 55 Q50 65 29 55Z"', C.red, .7) + W('path', 'd="M60 54 L66 74 L58 75 L55 57Z"', C.red, .65) + W('path', 'd="M32 18 Q50 0 68 18 Q50 22 32 18Z"', C.navy, .6) + W('circle', 'cx="50" cy="6" r="5"', C.white, .9)
      + [[50, 66], [50, 78]].map(([x, y]) => W('circle', `cx="${x}" cy="${y}" r="2.5"`, C.brownD, .7)).join('') + ln('M27 64 L10 54 M73 64 L90 52', C.brown, 2.2, .7) + W('path', 'd="M50 37 L60 40 L50 41Z"', C.orange, .9), face(50, 32, .85)],
    mittens: () => {
      const m = (tx, c, r) => `<g transform="translate(${tx} 0) rotate(${r} 25 60)">${W('path', 'd="M12 76 L12 40 Q12 22 28 22 Q42 22 42 40 L42 76Z"', c, .65)}${W('path', 'd="M12 46 Q2 44 3 54 Q4 62 13 62Z"', c, .6)}${W('rect', 'x="9" y="72" width="36" height="14" rx="4"', '#f8efe2', .95)}${ln('M14 76 L14 84 M20 76 L20 84 M26 76 L26 84 M32 76 L32 84 M38 76 L38 84', c, 1.2, .5)}${ln('M18 44 L36 44 M18 54 L36 54', '#fff', 1.6, .5)}</g>`;
      return [m(4, C.dusty, -10) + m(48, C.skyD, 10) + ln('M30 86 Q48 98 70 86', C.brown, 1.4, .5), ''];
    },
    hat: (c = C.dusty) => [W('path', 'd="M18 70 Q16 26 50 24 Q84 26 82 70Z"', c, .62) + G('path', 'd="M60 26 Q82 32 82 70 L66 70 Q68 40 60 26Z"', '#000', .08) + W('rect', 'x="12" y="66" width="76" height="18" rx="7"', '#f6efe6', .95) + ln('M30 34 L30 66 M42 28 L42 66 M58 28 L58 66 M70 34 L70 66', '#fff', 1.4, .45) + W('circle', 'cx="50" cy="18" r="10"', '#f6efe6', .95), ''],
    blossom: (c = C.rose) => [[0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} 50 50)">${W('ellipse', 'cx="50" cy="28" rx="15" ry="20"', c, .5)}</g>`).join('') + G('circle', 'cx="50" cy="50" r="18"', C.dusty, .25) + W('circle', 'cx="50" cy="50" r="7"', C.butter, .9) + [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} 50 50)">${ln('M50 42 L50 30', C.dusty, 1, .5)}</g>`).join(''), ''],
    branch: (c = C.rose) => [ln('M4 90 Q40 70 60 40 Q72 22 96 12 M40 66 Q56 66 66 78 M60 40 Q50 26 54 10', C.brownD, 2.6, .65)
      + [[60, 40, .36], [40, 66, .3], [66, 78, .26], [54, 12, .26], [90, 14, .24]].map(([x, y, s]) => `<g transform="translate(${x - 50 * s} ${y - 50 * s}) scale(${s})">${E.blossom(c)[0]}</g>`).join('')
      + [[22, 80], [78, 22], [48, 52]].map(([x, y]) => W('ellipse', `cx="${x}" cy="${y}" rx="4" ry="5.5"`, C.dusty, .6)).join(''), ''],
    tulips: () => {
      const t = (x, c, h, r) => `<g transform="rotate(${r} ${x} 96)">${ln(`M${x} 96 Q${x + 2} ${96 - h / 2} ${x} ${100 - h}`, C.sageD, 2.4, .7)}${W('path', `d="M${x - 10} ${88 - h} Q${x - 13} ${70 - h} ${x - 6} ${66 - h} L${x} ${74 - h} L${x + 6} ${66 - h} Q${x + 13} ${70 - h} ${x + 10} ${88 - h} Q${x} ${96 - h} ${x - 10} ${88 - h}Z"`, c, .65)}${G('path', `d="M${x} ${74 - h} L${x + 6} ${66 - h} Q${x + 13} ${70 - h} ${x + 10} ${88 - h} Q${x + 4} ${93 - h} ${x} ${92 - h}Z"`, '#000', .08)}</g>`;
      return [W('path', 'd="M30 96 Q20 70 26 52 Q34 72 40 96Z"', C.sage, .6) + W('path', 'd="M70 96 Q82 72 76 54 Q66 74 60 96Z"', C.sage, .6) + t(36, C.rose, 52, -8) + t(52, C.peach, 64, 0) + t(66, C.lav, 48, 9) + W('path', 'd="M24 86 L76 86 L70 100 L30 100Z"', C.terra, .6), ''];
    },
    butterfly: (c1 = C.rose, c2 = C.lav) => [W('ellipse', 'cx="34" cy="38" rx="20" ry="16" transform="rotate(-30 34 38)"', c1, .55) + W('ellipse', 'cx="66" cy="38" rx="20" ry="16" transform="rotate(30 66 38)"', c1, .55) + W('ellipse', 'cx="38" cy="64" rx="13" ry="11" transform="rotate(25 38 64)"', c2, .55) + W('ellipse', 'cx="62" cy="64" rx="13" ry="11" transform="rotate(-25 62 64)"', c2, .55) + [[30, 36], [70, 36]].map(([x, y]) => G('circle', `cx="${x}" cy="${y}" r="5"`, '#fff', .45)).join('') + W('ellipse', 'cx="50" cy="52" rx="3.5" ry="20"', C.brownD, .7) + ln('M49 33 Q42 20 38 18 M51 33 Q58 20 62 18', C.brownD, 1.2, .7), ''],
    can: () => [W('path', 'd="M22 44 L70 44 L66 90 L26 90Z"', C.sky, .6) + G('path', 'd="M52 44 L70 44 L66 90 L52 90Z"', C.skyD, .25) + ln('M68 52 L94 32', C.skyD, 5, .55) + W('ellipse', 'cx="95" cy="31" rx="5" ry="3" transform="rotate(-40 95 31)"', C.skyD, .6) + ln('M30 44 Q46 18 62 44', C.skyD, 4, .5) + `<g transform="translate(34 56) scale(.24)">${W('path', `d="${HEART}"`, C.rose, .7)}</g>` + [[98, 44], [92, 52], [100, 56]].map(([x, y]) => W('ellipse', `cx="${x - 4}" cy="${y}" rx="2" ry="3"`, C.sky, .7)).join(''), ''],
    sun: () => [Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 50 50)">${ln('M50 8 L50 20', C.peach, 4, .5)}</g>`).join('') + W('circle', 'cx="50" cy="50" r="26"', C.butter, .7) + G('path', 'd="M70 34 A26 26 0 0 1 40 74 A28 28 0 0 0 70 34Z"', C.orange, .3), face(50, 52, 1.1)],
    lemon: () => [W('circle', 'cx="50" cy="50" r="36"', C.butter, .7) + W('circle', 'cx="50" cy="50" r="30"', '#fbe9a6', .8, 1) + Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45} 50 50)">${ln('M50 50 L50 22', '#fff', 2.2, .7)}</g>`).join('') + W('circle', 'cx="50" cy="50" r="3"', '#fff', .8), ''],
    watermelon: (f = true) => [W('path', 'd="M6 36 A44 44 0 0 0 94 36Z"', C.sageD, .7) + W('path', 'd="M12 36 A38 38 0 0 0 88 36Z"', '#f4f1d8', .9) + W('path', 'd="M16 36 A34 34 0 0 0 84 36Z"', '#e9566a', .7) + G('path', 'd="M60 36 L84 36 A34 34 0 0 1 60 68Z"', C.berry, .25) + [[34, 50], [46, 56], [58, 54], [70, 46], [28, 42], [52, 44]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.6" fill="${FACE}" fill-opacity=".75"/>`).join(''), f ? face(50, 46, .8) : ''],
    glass: () => [W('path', 'd="M26 18 L74 18 L68 92 L32 92Z"', '#d7ecf7', .45) + W('path', 'd="M29 40 L71 40 L68 90 L32 90Z"', C.butter, .55) + [[40, 56], [56, 70], [46, 80]].map(([x, y]) => W('rect', `x="${x}" y="${y}" width="9" height="9" rx="2" transform="rotate(20 ${x} ${y})"`, '#fff', .6, 1)).join('') + ln('M58 92 L66 26 L80 4', C.rose, 3.4, .7) + `<g transform="translate(14 6) scale(.32)">${E.lemon()[0]}</g>`, ''],
    sunflower: () => [ln('M50 60 Q46 82 50 100', C.sageD, 3, .7) + W('path', 'd="M49 84 Q30 76 26 86 Q38 94 49 88Z"', C.sage, .6) + Array.from({ length: 14 }, (_, i) => `<g transform="rotate(${i * 25.7} 50 40)">${W('ellipse', 'cx="50" cy="16" rx="6" ry="13"', C.mustard, .55, 1.2)}</g>`).join('') + W('circle', 'cx="50" cy="40" r="14"', C.brown, .75), face(50, 41, .75)],
    shell: () => [W('path', 'd="M50 88 L14 46 Q24 14 50 12 Q76 14 86 46Z"', C.peach, .55) + [-30, -15, 0, 15, 30].map(a => `<g transform="rotate(${a} 50 88)">${ln('M50 84 L50 18', C.terra, 1.4, .45)}</g>`).join('') + W('path', 'd="M42 86 L58 86 L54 96 L46 96Z"', C.peach, .7), ''],
    sabzeh: (knot = false) => [W('ellipse', 'cx="50" cy="86" rx="44" ry="10"', C.sky, .5) + G('ellipse', 'cx="50" cy="84" rx="34" ry="6"', '#fff', .4)
      + Array.from({ length: 22 }, (_, i) => { const x = 14 + i * 3.3, h = 46 + ((i * 37) % 17); const tip = knot ? `Q${x + (50 - x) * .4} ${84 - h * .8} ${50 + (x - 50) * .25} ${84 - h}` : `Q${x - 2} ${84 - h * .6} ${x + (i % 3 - 1) * 3} ${84 - h}`; return ln(`M${x} 84 ${tip}`, i % 3 ? C.green : C.sageD, 2.2, .6); }).join('')
      + W('path', 'd="M16 66 Q50 76 84 66 L85 72 Q50 82 15 72Z"', C.red, .7) + (knot ? W('circle', 'cx="50" cy="34" r="4"', C.sageD, .7) : `<g transform="translate(36 56) scale(.3)">${E.bow(C.red)[0]}</g>`), ''],
    eggs: () => {
      const egg = (x, y, c, p, r) => `<g transform="rotate(${r} ${x} ${y})">${W('ellipse', `cx="${x}" cy="${y}" rx="15" ry="20"`, c, .6)}${p}${HL('ellipse', `cx="${x - 5}" cy="${y - 8}" rx="3" ry="5"`)}</g>`;
      return [egg(30, 70, C.sky, ln('M16 66 L22 60 L28 66 L34 60 L40 66 L45 61', '#fff', 2, .8), -12) + egg(70, 70, C.rose, [64, 72, 68, 76].map((x, i) => `<circle cx="${x}" cy="${[62, 64, 76, 74][i]}" r="2.6" fill="#fff" fill-opacity=".8"/>`).join(''), 12) + egg(50, 54, C.butter, ln('M36 50 Q50 58 64 50 M36 60 Q50 68 64 60', C.terra, 2, .6), 0) + W('ellipse', 'cx="50" cy="92" rx="40" ry="6"', C.sage, .4), ''];
    },
    fishbowl: () => [W('path', 'd="M30 22 Q4 40 10 66 Q18 94 50 94 Q82 94 90 66 Q96 40 70 22Z"', '#cfe8f6', .5) + W('path', 'd="M14 54 Q50 46 86 54 Q86 90 50 92 Q14 90 14 54Z"', C.sky, .45) + W('ellipse', 'cx="50" cy="22" rx="21" ry="5"', '#e3f2fa', .7)
      + W('path', 'd="M34 66 Q46 54 60 64 Q46 76 34 66Z"', C.orange, .8) + W('path', 'd="M58 64 L70 56 L68 66 L70 74Z"', C.orange, .7) + ln('M20 86 Q24 76 22 70 M78 86 Q74 78 78 70', C.sageD, 2.4, .6) + [[64, 46, 2.5], [58, 38, 2], [66, 32, 1.6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="1.2" stroke-opacity=".9"/>`).join(''),
      `<circle cx="40" cy="64" r="1.6" fill="${FACE}"/><path d="M37 68 Q39 69.5 41 68" fill="none" stroke="${FACE}" stroke-width=".9" stroke-linecap="round"/>`],
    hyacinth: () => [W('path', 'd="M44 98 Q30 70 34 50 Q42 74 50 98Z"', C.sage, .6) + W('path', 'd="M56 98 Q72 72 66 52 Q58 76 50 98Z"', C.sage, .6) + ln('M50 98 L50 30', C.sageD, 3, .6) + Array.from({ length: 22 }, (_, i) => { const row = Math.floor(i / 3), x = 50 + ((i % 3) - 1) * (10 - row * .5) + (row % 2 ? 4 : 0), y = 74 - row * 7.5; return W('circle', `cx="${x}" cy="${y}" r="${6 - row * .25}"`, row % 2 ? C.lav : C.plum, .5, 1); }).join(''), ''],
    pomegranate: () => [W('circle', 'cx="50" cy="56" r="34"', C.berry, .68) + G('path', 'd="M72 30 A34 34 0 0 1 40 89 A38 38 0 0 0 72 30Z"', '#7a1626', .3) + W('path', 'd="M40 26 L42 14 L46 20 L50 10 L54 20 L58 14 L60 26Z"', C.berry, .8) + HL('ellipse', 'cx="36" cy="44" rx="6" ry="9" transform="rotate(25 36 44)"', .35) + W('path', 'd="M60 18 C74 4 88 10 90 18 C78 24 68 24 60 18Z"', C.sageD, .6), face(50, 62, .95)],
    pomopen: () => [W('path', 'd="M10 54 A40 40 0 0 0 90 54Z"', C.berry, .7) + W('path', 'd="M16 54 A34 34 0 0 0 84 54Z"', '#f7e6cf', .9) + Array.from({ length: 26 }, (_, i) => { const a = Math.PI * (i % 9 + .5) / 9, r = 10 + Math.floor(i / 9) * 8; return `<ellipse cx="${(50 + Math.cos(a) * r).toFixed(1)}" cy="${(54 + Math.sin(a) * r).toFixed(1)}" rx="3.2" ry="4" fill="${C.berry}" fill-opacity=".85"/>`; }).join('') + W('ellipse', 'cx="50" cy="54" rx="40" ry="5"', '#f7e6cf', .9, 1), ''],
    candle: () => [G('circle', 'cx="50" cy="26" r="24"', C.butter, .28) + G('circle', 'cx="50" cy="26" r="14"', C.butter, .35) + W('path', 'd="M50 8 Q60 22 50 34 Q40 22 50 8Z"', C.orange, .75) + W('path', 'd="M50 16 Q55 25 50 32 Q45 25 50 16Z"', C.butter, .95) + ln('M50 34 L50 40', FACE, 1.6, .8)
      + W('rect', 'x="36" y="40" width="28" height="48" rx="3"', '#f6e1d6', .95) + G('rect', 'x="52" y="40" width="12" height="48" rx="2"', C.dusty, .25) + W('path', 'd="M36 44 Q40 52 44 44 Q48 56 52 44"', '#f6e1d6', 1) + W('ellipse', 'cx="50" cy="90" rx="26" ry="6"', C.gold, .6), face(50, 66, .75)],
    crescent: () => [W('path', 'd="M62 10 A40 40 0 1 0 90 72 A32 32 0 1 1 62 10Z"', C.butter, .72) + G('path', 'd="M30 78 A40 40 0 0 0 90 72 A34 34 0 0 1 30 78Z"', C.orange, .3), face(36, 56, .9)],
    lantern: () => [ln('M50 0 L50 12', C.brownD, 1.6, .7) + W('path', 'd="M38 12 L62 12 L66 22 L34 22Z"', C.gold, .75) + G('path', 'd="M30 22 L70 22 L76 60 L64 86 L36 86 L24 60Z"', C.butter, .55) + G('ellipse', 'cx="50" cy="56" rx="16" ry="22"', '#fff6c8', .7) + `<path d="M30 22 L70 22 L76 60 L64 86 L36 86 L24 60Z M50 22 L50 86 M24 60 L76 60" fill="none" stroke="${C.gold}" stroke-width="2.6" stroke-opacity=".85" stroke-linejoin="round"/>` + W('path', 'd="M36 86 L64 86 L58 96 L42 96Z"', C.gold, .75) + W('path', 'd="M50 46 Q56 54 50 62 Q44 54 50 46Z"', C.orange, .8), ''],
    star: (c = C.gold) => [W('path', `d="${STAR}"`, c, .65) + HL('ellipse', 'cx="44" cy="40" rx="4" ry="6"', .35), ''],
    sparkle: (c = C.gold) => [W('path', 'd="M50 6 Q54 46 94 50 Q54 54 50 94 Q46 54 6 50 Q46 46 50 6Z"', c, .65), ''],
    dates: () => [W('path', 'd="M8 56 Q50 64 92 56 Q86 92 50 94 Q14 92 8 56Z"', C.skyD, .55) + ln('M16 70 Q50 78 84 70', '#fff', 1.6, .5) + [[30, 50, -20], [46, 46, 10], [62, 50, -10], [76, 52, 25], [54, 56, 0], [38, 56, 15]].map(([x, y, r]) => W('ellipse', `cx="${x}" cy="${y}" rx="9" ry="6" transform="rotate(${r} ${x} ${y})"`, '#7a3f22', .75) + HL('ellipse', `cx="${x - 3}" cy="${y - 2}" rx="3" ry="1.5" transform="rotate(${r} ${x} ${y})"`, .3)).join(''), ''],
    tea: () => [W('ellipse', 'cx="50" cy="90" rx="34" ry="7"', C.gold, .55) + W('path', 'd="M32 22 L68 22 Q64 40 60 52 Q66 70 62 86 L38 86 Q34 70 40 52 Q36 40 32 22Z"', '#f3e7d8', .45) + W('path', 'd="M34 34 L66 34 Q63 44 60 52 Q66 70 62 85 L38 85 Q34 70 40 52 Q37 44 34 34Z"', '#b9542a', .7) + HL('path', 'd="M40 38 Q38 50 44 56 Q40 46 44 38Z"', .45) + ln('M44 16 Q40 10 44 4 M56 16 Q52 10 56 4', '#b8a89a', 1.6, .45), ''],
    fire: () => [ln('M14 92 L86 72 M14 72 L86 92', C.brownD, 8, .6) + W('path', 'd="M50 4 Q74 30 72 56 Q70 82 50 84 Q30 82 28 56 Q28 38 40 24 Q40 40 48 44 Q44 22 50 4Z"', C.orange, .7) + W('path', 'd="M50 34 Q64 52 62 66 Q58 80 50 80 Q40 80 38 66 Q38 54 50 34Z"', C.butter, .85) + G('path', 'd="M60 20 Q76 44 70 66 L60 74Z"', C.red, .3), face(50, 66, .8)],
    ajil: () => [W('path', 'd="M6 50 Q50 58 94 50 Q88 90 50 92 Q12 90 6 50Z"', C.terra, .55) + ln('M14 62 L22 70 L30 62 L38 70 L46 62 L54 70 L62 62 L70 70 L78 62 L86 70', '#fff', 1.6, .55)
      + [[26, 46, '#c99a63'], [40, 42, '#e9d4a7'], [56, 44, '#9cbf6a'], [70, 46, '#c99a63'], [48, 50, '#7a3f22'], [34, 52, '#e9d4a7'], [64, 52, '#d9b07a']].map(([x, y, c], i) => W('ellipse', `cx="${x}" cy="${y}" rx="${i % 2 ? 6 : 7}" ry="${i % 2 ? 4.5 : 5}" transform="rotate(${i * 25} ${x} ${y})"`, c, .85, 1)).join(''), ''],
    spoon: () => [W('path', 'd="M10 46 Q50 54 90 46 Q86 86 50 88 Q14 86 10 46Z"', '#b8c4d4', .6) + G('path', 'd="M60 50 L90 46 Q86 86 60 87Z"', '#5c6a80', .2) + W('ellipse', 'cx="50" cy="46" rx="40" ry="6"', '#d6dee8', .8) + ln('M62 40 L94 6', '#8c97a6', 4, .7) + W('ellipse', 'cx="58" cy="44" rx="8" ry="5" transform="rotate(-45 58 44)"', '#a8b4c4', .8), face(50, 66, .8)],
    kite: () => [W('path', 'd="M50 4 L84 38 L50 78 L16 38Z"', C.rose, .55) + G('path', 'd="M50 4 L84 38 L50 38Z M50 38 L16 38 L50 78Z"', C.lav, .45) + ln('M50 4 L50 78 M16 38 L84 38', '#fff', 1.4, .7) + ln('M50 78 Q40 88 52 94 Q62 98 54 100', C.brownD, 1.4, .6) + [[46, 86], [56, 96]].map(([x, y]) => `<g transform="translate(${x - 6} ${y - 4}) scale(.12)">${E.bow(C.sky)[0]}</g>`).join(''), face(50, 40, .8)],
    cloud: () => [W('path', 'd="M20 70 Q4 70 6 56 Q8 42 24 44 Q26 24 46 26 Q60 14 74 30 Q94 30 92 50 Q98 70 78 70Z"', C.white, .95) + G('path', 'd="M20 70 Q50 64 78 70 Q90 66 92 56 Q86 72 20 70Z"', C.sky, .5), face(50, 52, .9)],
    /* space */
    planet: (c = C.peach, ring = C.gold, f = false) => [`<g transform="rotate(-16 50 50)">${ln('M6 52 A44 12 0 0 1 94 52', ring, 3, .75)}</g>` + W('circle', 'cx="50" cy="50" r="29"', c, .62) + G('path', 'd="M68 27 A29 29 0 0 1 36 76 A31 31 0 0 0 68 27Z"', '#000', .08)
      + G('ellipse', 'cx="40" cy="58" rx="9" ry="4"', '#fff', .35) + G('ellipse', 'cx="62" cy="40" rx="6" ry="3"', '#fff', .3) + [[34, 36, 2], [44, 30, 1.4], [60, 64, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".7"/>`).join('')
      + `<g transform="rotate(-16 50 50)">${ln('M6 52 A44 12 0 0 0 94 52', ring, 3, .85)}</g>`, f ? face(50, 52, .9) : ''],
    rocket: () => [W('path', 'd="M40 74 Q50 104 60 74 Q50 84 40 74Z"', C.peach, .7) + W('path', 'd="M44 74 Q50 94 56 74Z"', C.butter, .9)
      + W('path', 'd="M33 50 Q16 60 15 84 Q25 73 35 71Z"', C.terra, .7) + W('path', 'd="M67 50 Q84 60 85 84 Q75 73 65 71Z"', C.terra, .7)
      + W('path', 'd="M50 4 C67 18 70 42 67 72 L33 72 C30 42 33 18 50 4Z"', '#fbefd7', .95) + G('path', 'd="M33 46 L67 46 L67 72 L33 72Z"', C.rose, .35) + G('path', 'd="M56 10 C66 22 70 42 67 72 L58 72 C60 46 60 26 56 10Z"', C.terra, .14)
      + W('path', 'd="M50 4 C57 10 61 17 63 24 L37 24 C39 17 43 10 50 4Z"', C.terra, .78) + W('rect', 'x="32" y="68" width="36" height="7" rx="3"', C.terra, .8) + W('circle', 'cx="50" cy="40" r="10"', C.terra, .75) + W('circle', 'cx="50" cy="40" r="6.8"', C.sky, .75) + HL('circle', 'cx="47" cy="37" r="2.2"', .7),
      ''],
    moon: (c = '#e6ded0') => [W('circle', 'cx="50" cy="50" r="34"', c, .85) + G('path', 'd="M74 26 A34 34 0 0 1 36 81 A37 37 0 0 0 74 26Z"', '#8f8577', .2) + [[34, 34, 6], [66, 62, 7], [40, 70, 4], [70, 36, 3.5]].map(([x, y, r]) => W('circle', `cx="${x}" cy="${y}" r="${r}"`, '#b4aa9a', .45, 1)).join(''), face(52, 50, .95)],
    astro: () => [W('path', 'd="M24 98 Q22 70 50 68 Q78 70 76 98Z"', '#f2ede4', .95) + G('path', 'd="M58 70 Q76 74 76 98 L60 98Z"', C.sky, .3) + W('rect', 'x="40" y="78" width="20" height="12" rx="3"', '#dfe8ee', .9) + `<g transform="translate(43 79) scale(.14)">${W('path', `d="${STAR}"`, C.gold, .8)}</g>`
      + W('circle', 'cx="33" cy="26" r="8"', '#b98058', .75) + W('circle', 'cx="67" cy="26" r="8"', '#b98058', .75) + G('circle', 'cx="33" cy="26" r="4"', C.rose, .6) + G('circle', 'cx="67" cy="26" r="4"', C.rose, .6)
      + W('ellipse', 'cx="50" cy="46" rx="22" ry="20"', '#c48e63', .8) + W('ellipse', 'cx="50" cy="54" rx="9.5" ry="7"', '#f3dfc7', .95)
      + W('circle', 'cx="50" cy="44" r="33"', '#d6ecf8', .22, 2.4) + ln('M28 26 Q36 16 48 14', '#fff', 3, .7) + W('ellipse', 'cx="50" cy="74" rx="24" ry="5"', '#e3dccf', .95),
      face(50, 46, .95) + `<ellipse cx="50" cy="51.5" rx="2.6" ry="1.8" fill="${FACE}"/>`],
    comet: (c = C.gold) => [ln('M14 86 Q34 70 56 48 M24 92 Q42 78 60 58 M8 74 Q28 62 50 42', c, 2.2, .5) + `<g transform="translate(48 8) scale(.46)">${W('path', `d="${STAR}"`, c, .7)}</g>`, ''],
    /* animals */
    bear: (c = '#c08a60', bow = '') => [W('ellipse', 'cx="50" cy="74" rx="27" ry="22"', c, .78) + W('ellipse', 'cx="50" cy="78" rx="14" ry="12"', '#f3dfc7', .9)
      + W('ellipse', 'cx="32" cy="92" rx="10" ry="7"', c, .8) + W('ellipse', 'cx="68" cy="92" rx="10" ry="7"', c, .8) + G('ellipse', 'cx="32" cy="92" rx="5" ry="3.6"', '#f3dfc7', .9) + G('ellipse', 'cx="68" cy="92" rx="5" ry="3.6"', '#f3dfc7', .9)
      + W('circle', 'cx="30" cy="22" r="9"', c, .8) + W('circle', 'cx="70" cy="22" r="9"', c, .8) + G('circle', 'cx="30" cy="22" r="4.5"', C.rose, .55) + G('circle', 'cx="70" cy="22" r="4.5"', C.rose, .55)
      + W('circle', 'cx="50" cy="40" r="23"', c, .82) + W('ellipse', 'cx="50" cy="49" rx="10" ry="7.5"', '#f3dfc7', .95) + G('path', 'd="M66 24 A23 23 0 0 1 52 63 A25 25 0 0 0 66 24Z"', '#000', .07)
      + (bow ? `<g transform="translate(62 6) scale(.34) rotate(18 50 50)">${E.bow(bow)[0]}</g>` : ''),
      face(50, 41, .95) + `<ellipse cx="50" cy="46.5" rx="2.8" ry="2" fill="${FACE}"/>`],
    bearFace: (c = '#c08a60') => [W('circle', 'cx="24" cy="30" r="12"', c, .8) + W('circle', 'cx="76" cy="30" r="12"', c, .8) + G('circle', 'cx="24" cy="30" r="6"', C.rose, .55) + G('circle', 'cx="76" cy="30" r="6"', C.rose, .55)
      + W('ellipse', 'cx="50" cy="56" rx="33" ry="29"', c, .82) + W('ellipse', 'cx="50" cy="67" rx="13" ry="10"', '#f3dfc7', .95), face(50, 56, 1.25) + `<ellipse cx="50" cy="63" rx="3.4" ry="2.5" fill="${FACE}"/>`],
    bunny: (c = '#e8e2ea') => [W('ellipse', 'cx="40" cy="20" rx="7" ry="18" transform="rotate(-10 40 20)"', c, .9) + W('ellipse', 'cx="60" cy="20" rx="7" ry="18" transform="rotate(10 60 20)"', c, .9) + G('ellipse', 'cx="40" cy="22" rx="3" ry="12" transform="rotate(-10 40 22)"', C.rose, .5) + G('ellipse', 'cx="60" cy="22" rx="3" ry="12" transform="rotate(10 60 22)"', C.rose, .5)
      + W('ellipse', 'cx="50" cy="76" rx="24" ry="21"', c, .9) + W('circle', 'cx="74" cy="88" r="7"', '#fff', .95) + W('ellipse', 'cx="50" cy="80" rx="12" ry="11"', '#fbf6f2', .9)
      + W('circle', 'cx="50" cy="48" r="19"', c, .92) + G('path', 'd="M62 34 A19 19 0 0 1 52 67 A21 21 0 0 0 62 34Z"', '#8a7a90', .14) + W('ellipse', 'cx="36" cy="94" rx="8" ry="5"', c, .9) + W('ellipse', 'cx="62" cy="95" rx="8" ry="5"', c, .9),
      face(50, 49, .85) + `<ellipse cx="50" cy="53" rx="2" ry="1.5" fill="${C.dusty}"/>`],
    mouse: (c = '#bab2ab') => [ln('M74 82 Q94 84 92 66 Q90 54 98 50', '#a8968a', 2, .7) + W('ellipse', 'cx="56" cy="72" rx="24" ry="18"', c, .8) + W('ellipse', 'cx="62" cy="76" rx="12" ry="9"', '#8f6a50', .45)
      + W('circle', 'cx="24" cy="34" r="11"', c, .85) + W('circle', 'cx="48" cy="32" r="11"', c, .85) + G('circle', 'cx="24" cy="34" r="6"', C.rose, .6) + G('circle', 'cx="48" cy="32" r="6"', C.rose, .6)
      + W('ellipse', 'cx="36" cy="52" rx="19" ry="16"', c, .88) + W('ellipse', 'cx="44" cy="90" rx="7" ry="4.5"', c, .85) + W('ellipse', 'cx="66" cy="90" rx="7" ry="4.5"', c, .85),
      face(34, 52, .78) + `<circle cx="18" cy="56" r="2.4" fill="${C.dusty}"/>`],
    mushroom: () => [W('path', 'd="M40 56 Q35 80 37 96 L63 96 Q65 80 60 56Z"', '#f3e6cc', .95) + G('path', 'd="M52 56 L60 56 Q65 80 63 96 L54 96Z"', C.brown, .14) + W('path', 'd="M45 96 L45 84 Q50 77 55 84 L55 96Z"', C.brown, .7)
      + W('path', 'd="M6 56 Q8 14 50 12 Q92 14 94 56 Q50 64 6 56Z"', '#a9c49a', .75) + G('path', 'd="M60 14 Q92 18 94 56 Q80 60 66 60 Q72 34 60 14Z"', C.sageD, .25)
      + [[22, 40, 6, 4], [32, 24, 4.5, 3.4], [72, 26, 5, 3.6], [82, 44, 5, 3.6], [62, 48, 3.4, 2.6], [20, 52, 3, 2.2]].map(([x, y, rx, ry]) => W('ellipse', `cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"`, '#fffaf0', .95, 1)).join('')
      + W('path', 'd="M41 48 L41 38 Q50 27 59 38 L59 48Z"', '#fbf1d6', .95) + ln('M41 48 L41 38 Q50 27 59 38 L59 48Z M50 30 L50 48 M41 40 L59 40', C.brown, 1.4, .7)
      + ln('M12 59 ' + Array.from({ length: 13 }, (_, i) => `L${15 + i * 6} ${i % 2 ? 59 : 65}`).join(' '), C.terra, 1.2, .7)
      + ln('M22 96 Q18 86 22 78 M22 88 Q14 84 12 78 M22 86 Q28 82 30 76 M78 96 Q82 86 78 78 M78 88 Q86 84 88 80', C.sageD, 1.6, .6), ''],
    sprig: (c = C.mustard, c2 = C.sage) => [ln('M50 98 Q46 60 54 8', C.brownD, 1.6, .55) + Array.from({ length: 7 }, (_, i) => { const y = 86 - i * 11, x = 50 + (i * .6), s = i % 2 ? 1 : -1; return W('ellipse', `cx="${x + s * 9}" cy="${y}" rx="8" ry="3.6" transform="rotate(${s * -28} ${x + s * 9} ${y})"`, i % 3 ? c : c2, .6, 1); }).join(''), ''],
    gyp: () => [ln('M50 98 Q48 70 50 40 M50 70 Q36 56 28 34 M50 62 Q62 48 72 28 M50 48 Q42 32 44 14 M50 48 Q58 30 60 10 M28 34 Q20 24 18 14 M72 28 Q82 22 86 12', C.sageD, 1.3, .55)
      + [[18, 14], [24, 10], [28, 34], [22, 28], [44, 14], [40, 8], [48, 10], [60, 10], [56, 6], [66, 14], [72, 28], [78, 22], [86, 12], [82, 8], [34, 40], [64, 34], [50, 40], [30, 18], [70, 18]].map(([x, y], i) => W('circle', `cx="${x}" cy="${y}" r="${2.6 + (i % 3) * .7}"`, i % 4 ? '#fffaf2' : C.rose, .95, .8)).join(''), ''],
    tulip: (c = C.rose) => [ln('M50 98 Q52 70 50 42', C.sageD, 2.4, .7) + W('path', 'd="M50 96 Q30 84 30 62 Q44 72 50 92Z"', C.sage, .6) + W('path', 'd="M51 90 Q68 76 72 60 Q58 66 52 84Z"', C.sage, .55)
      + W('path', 'd="M36 22 Q34 40 42 46 Q50 50 58 46 Q66 40 64 22 L57 30 L50 18 L43 30Z"', c, .7) + G('path', 'd="M50 18 L57 30 L64 22 Q66 40 58 46 Q54 48 50 48Z"', '#000', .07), ''],
    doily: (c = '#fff6ee') => {
      const N = 18, pts = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2, b = (i + .5) / N * Math.PI * 2, r = 40, R = 47; return `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)} Q${(50 + Math.cos(b) * R).toFixed(1)} ${(50 + Math.sin(b) * R).toFixed(1)} ${(50 + Math.cos(a + Math.PI * 2 / N) * r).toFixed(1)} ${(50 + Math.sin(a + Math.PI * 2 / N) * r).toFixed(1)}`; }).join(' ') + 'Z';
      return [W('path', `d="${pts}"`, c, .95, 1.2) + Array.from({ length: N }, (_, i) => { const a = (i + .5) / N * Math.PI * 2; return `<circle cx="${(50 + Math.cos(a) * 40).toFixed(1)}" cy="${(50 + Math.sin(a) * 40).toFixed(1)}" r="1.8" fill="${C.dusty}" fill-opacity=".35"/>`; }).join('')
        + `<circle cx="50" cy="50" r="30" fill="none" stroke="${C.dusty}" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="2 3"/>` + `<g transform="translate(30 30) scale(.4)">${W('path', `d="${HEART}"`, C.rose, .7)}</g>`, ''];
    },
    ribbon: (c = C.rose) => [W('path', 'd="M4 40 Q20 30 36 42 Q50 52 64 42 Q80 30 96 40 L96 50 Q80 40 64 52 Q50 62 36 52 Q20 40 4 50Z"', c, .55) + `<g transform="translate(30 22) scale(.4)">${E.bow(c)[0]}</g>`, ''],
  };
  // compose elements into one SVG with its own uniquely named watercolor filter
  const frame = (vb, parts, cls = '') => {
    const id = 'wc-ss-' + (++uid);
    const inner = parts.map(([el, x, y, s = 1, r = 0]) => { const [p, o] = el; const t = `translate(${x} ${y}) rotate(${r} ${50 * s} ${50 * s}) scale(${s})`; return [`<g transform="${t}">${p}</g>`, o ? `<g transform="${t}">${o}</g>` : '']; });
    return `<svg class="nt-art ${cls}" viewBox="${vb}" aria-hidden="true" focusable="false"><defs><filter id="${id}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".032" numOctaves="2" seed="${uid % 9 + 1}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="w"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${uid % 7 + 3}" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .38  0 0 0 0 .26  0 0 0 0 .2  0 0 0 -.8 .44" result="gc"/><feComposite in="gc" in2="w" operator="in" result="gm"/><feMerge><feMergeNode in="w"/><feMergeNode in="gm"/></feMerge></filter></defs><g filter="url(#${id})">${inner.map(a => a[0]).join('')}</g>${inner.map(a => a[1]).join('')}</svg>`;
  };
  const one = el => frame('-6 -6 112 112', [[el, 0, 0]]);

  /* ---------------- themes ---------------- */
  const autumnBooks = ['روزای دنج', 'ذهن روشن', 'دل شاد', 'حال پاییزی'];
  const T = {
    autumn: { label: 'پاییز', icon: '🍁', kind: 'season', notes: ['قدم‌های کوچیک، تغییرهای بزرگ', 'چیزای خوب وقت می‌برن', 'تو از پسش برمیای'],
      tl: () => frame('0 0 160 140', [[E.maple(C.terra, C.rust), 26, 4, .9, -18], [E.maple(C.mustard, C.terra), 76, 30, .62, 22], [E.leaf(C.sage), 6, 60, .55, -60], [E.bow(C.dusty), 50, 66, .5, -8]]),
      tr: () => frame('0 0 160 140', [[E.berries(), 50, 0, 1, 0], [E.maple(C.rust, '#8f3518'), 0, 40, .62, 30], [E.leaf(C.mustard, C.terra), 110, 70, .45, 50]]),
      gut: () => [one(E.maple(C.mustard, C.terra)), one(E.heart(C.rose)), one(E.leaf(C.terra, C.rust)), one(E.berries())],
      scene: () => [one(E.books(autumnBooks)), one(E.cup()), one(E.pumpkin())] },
    winter: { label: 'زمستون', icon: '❄️', kind: 'season', notes: ['آروم آروم، گرم و دنج', 'هر تیک، یه شعله‌ی کوچیک', 'تو از پسش برمیای'],
      tl: () => frame('0 0 160 140', [[E.pine(), 0, 10, 1.2, -10], [E.snowflake(), 100, 70, .4, 0]]),
      tr: () => frame('0 0 160 140', [[E.snowflake(C.skyD), 40, 6, .62, 10], [E.snowflake(C.lav), 6, 70, .36, 0], [E.snowflake(C.sky), 110, 80, .3, 20]]),
      gut: () => [one(E.snowflake(C.sky)), one(E.hat(C.skyD)), one(E.snowflake(C.lav)), one(E.heart(C.dusty))],
      scene: () => [one(E.mittens()), one(E.cup('#f1e6f3', '#7a4a32', 'face', true)), one(E.snowman())] },
    spring: { label: 'بهار', icon: '🌸', kind: 'season', notes: ['داری جوونه می‌زنی', 'هر روز یه کم بهتر', 'با خودت مهربون باش'],
      tl: () => frame('0 0 160 140', [[E.branch(C.rose), 0, 0, 1.35, 0]]),
      tr: () => frame('0 0 160 140', [[E.butterfly(), 50, 10, .7, 12], [E.blossom(C.lav), 10, 70, .4, 0], [E.blossom(C.rose), 116, 84, .32, 30]]),
      gut: () => [one(E.blossom(C.rose)), one(E.butterfly(C.peach, C.butter)), one(E.leaf(C.sage)), one(E.heart(C.rose))],
      scene: () => [one(E.can()), one(E.cup('#e5f1df', '#d9a441', 'face')), one(E.tulips())] },
    summer: { label: 'تابستون', icon: '☀️', kind: 'season', notes: ['سبک و شاد، مثل نسیم', 'آب یادت نره', 'امروزت درخشید'],
      tl: () => frame('0 0 160 140', [[E.sun(), 10, 4, 1.1, 0]]),
      tr: () => frame('0 0 160 140', [[E.lemon(), 70, 10, .62, 0], [E.lemon(), 30, 64, .42, 20], [E.leaf(C.sage), 6, 6, .5, -40]]),
      gut: () => [one(E.shell()), one(E.lemon()), one(E.heart(C.peach)), one(E.sunflower())],
      scene: () => [one(E.sunflower()), one(E.glass()), one(E.watermelon())] },
    nowruz: { label: 'نوروز', icon: '🌱', kind: 'occ', notes: ['سال نو، عادت نو', 'نوروزت پیروز', 'سالت شیرین، اونم بی‌قند!'],
      tl: () => frame('0 0 160 140', [[E.hyacinth(), 20, 0, 1.2, -8], [E.blossom(C.rose), 0, 80, .4, 0]]),
      tr: () => frame('0 0 160 140', [[E.branch(C.rose), 30, 0, 1.2, 0]]),
      gut: () => [one(E.eggs()), one(E.blossom(C.rose)), one(E.heart(C.red)), one(E.leaf(C.green, C.sageD))],
      scene: () => [one(E.eggs()), one(E.fishbowl()), one(E.sabzeh())] },
    yalda: { label: 'شب یلدا', icon: '🍉', kind: 'occ', notes: ['بلندترین شب، روشن‌ترین دل', 'یلدات مبارک', 'بعد از هر شب بلند، صبح میاد'],
      tl: () => frame('0 0 160 140', [[E.pomegranate(), 20, 4, 1, -6], [E.leaf(C.sageD, '#3d6b37'), 0, 60, .5, -50]]),
      tr: () => frame('0 0 160 140', [[E.candle(), 40, 0, 1.15, 0]]),
      gut: () => [one(E.pomopen()), one(E.heart(C.berry)), one(E.star(C.gold)), one(E.leaf(C.sageD, '#3d6b37'))],
      scene: () => [one(E.book(C.berry, 'دیوان حافظ')), one(E.watermelon()), one(E.pomopen())] },
    ramadan: { label: 'ماه رمضون', icon: '🌙', kind: 'occ', notes: ['افطار سبک، سحر سالم', 'ماه آرامش و مهربونی', 'قدم به قدم، با هم'],
      tl: () => frame('0 0 160 140', [[E.crescent(), 16, 4, 1.05, -8], [E.star(), 112, 20, .3, 10], [E.sparkle(), 120, 80, .22, 0]]),
      tr: () => frame('0 0 160 140', [[E.lantern(), 50, 0, 1.2, 0], [E.star(), 10, 50, .26, 0]]),
      gut: () => [one(E.star()), one(E.lantern()), one(E.sparkle()), one(E.heart(C.lav))],
      scene: () => [one(E.dates()), one(E.tea()), one(E.lantern())] },
    suri: { label: 'چهارشنبه‌سوری', icon: '🔥', kind: 'occ', notes: ['زردی من از تو، سرخی تو از من', 'شاد باش ولی با احتیاط', 'غم‌ها بسوزه، امید بمونه'],
      tl: () => frame('0 0 160 140', [[E.sparkle(C.orange), 20, 10, .7, 0], [E.sparkle(C.gold), 90, 40, .4, 20], [E.star(C.gold), 40, 90, .3, 0]]),
      tr: () => frame('0 0 160 140', [[E.fire(), 40, 8, 1.05, 0]]),
      gut: () => [one(E.sparkle(C.gold)), one(E.heart(C.orange)), one(E.sparkle(C.orange)), one(E.star(C.gold))],
      scene: () => [one(E.spoon()), one(E.fire()), one(E.ajil())] },
    sizdah: { label: 'سیزده‌بدر', icon: '🪁', kind: 'occ', notes: ['یه روز توی طبیعت', 'سبزه گره بزن، آرزو کن', 'نحسی رو بنداز تو آب!'],
      tl: () => frame('0 0 160 140', [[E.kite(), 30, 0, 1.15, -12]]),
      tr: () => frame('0 0 160 140', [[E.cloud(), 30, 10, 1, 0], [E.sun(), 0, 0, .45, 0]]),
      gut: () => [one(E.butterfly()), one(E.blossom(C.butter)), one(E.heart(C.rose)), one(E.leaf(C.green, C.sageD))],
      scene: () => [one(E.tulips()), one(E.cup('#e5f1df', C.sage, 'heart')), one(E.sabzeh(true))] },
    // picture themes: only picked by hand (kind 'style'), never by the calendar
    space: { label: 'فضایی', icon: '🚀', kind: 'style', notes: ['یه قدم کوچیک، یه پرش بزرگ', 'تا ماه و برگشت، بی‌قند!', 'تو یه ستاره‌ای'],
      tl: () => frame('0 0 160 140', [[E.planet(C.peach, C.gold, true), 14, 8, .95, 0], [E.star(C.gold), 112, 6, .26, 12], [E.sparkle(C.gold), 6, 92, .24, 0], [E.star('#8fb8b0'), 104, 96, .22, -10]]),
      tr: () => frame('0 0 160 140', [[E.rocket(), 50, 0, 1.05, -28], [E.moon(), 4, 70, .44, 0], [E.sparkle(C.gold), 128, 96, .2, 0]]),
      gut: () => [one(E.planet('#9fc4bb', C.gold)), one(E.star(C.gold)), one(E.moon()), one(E.comet())],
      scene: () => [one(E.astro()), one(E.rocket()), one(E.planet(C.butter, C.rose, true))] },
    animals: { label: 'حیوونا', icon: '🐻', kind: 'style', notes: ['آروم و پیوسته، مثل خرس کوچولو', 'دوستات هواتو دارن', 'یه روز خوب دیگه، با هم'],
      tl: () => frame('0 0 160 140', [[E.mushroom(), 18, 0, 1.05, -4], [E.sprig(C.mustard, C.sage), 0, 50, .6, -16], [E.mouse(), 96, 84, .46, 0]]),
      tr: () => frame('0 0 160 140', [[E.bunny(), 52, 18, .9, 4], [E.tulip(C.rose), 10, 40, .62, -10], [E.sprig(C.sage, C.mustard), 128, 60, .5, 14]]),
      gut: () => [one(E.bearFace()), one(E.tulip(C.rose)), one(E.mouse()), one(E.heart(C.rose))],
      scene: () => [one(E.mouse()), one(E.mushroom()), one(E.bear())] },
    bow: { label: 'پاپیونی', icon: '🎀', kind: 'style', notes: ['با خودت مهربون باش', 'امروز یه هدیه‌ست', 'کوچولو ولی محکم'],
      tl: () => frame('0 0 160 140', [[E.bow(C.rose), 18, 6, .95, -10], [E.heart(C.dusty), 104, 74, .34, 14], [E.bow('#e8b9a5'), 4, 84, .4, 12]]),
      tr: () => frame('0 0 160 140', [[E.gyp(), 40, 0, 1.1, 8], [E.bow(C.dusty), 4, 66, .5, -14], [E.heart(C.rose), 120, 90, .26, 0]]),
      gut: () => [one(E.bow(C.rose)), one(E.heart(C.rose)), one(E.doily()), one(E.bow('#c9a27a'))],
      scene: () => [one(E.bear('#c9956c', C.rose)), one(E.cup('#f8dde3', C.dusty, 'heart')), one(E.doily())] },
  };
  const ORDER = ['autumn', 'winter', 'spring', 'summer', 'nowruz', 'yalda', 'ramadan', 'suri', 'sizdah', 'space', 'animals', 'bow'];
  const HEARTC = { autumn: C.rose, winter: C.dusty, spring: C.rose, summer: C.peach, nowruz: C.red, yalda: C.berry, ramadan: C.gold, suri: C.orange, sizdah: C.rose, space: C.peach, animals: C.rose, bow: C.rose };

  /* ---------------- auto pick by date ---------------- */
  const jp = d => { const o = {}; new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d).forEach(p => { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); }); return o; };
  const hijriMonth = d => { for (const ca of ['islamic-umalqura', 'islamic']) { try { const m = new Intl.DateTimeFormat(`en-US-u-ca-${ca}-nu-latn`, { month: 'numeric' }).formatToParts(d).find(p => p.type === 'month'); if (m) return parseInt(m.value, 10); } catch (e) {} } return 0; };
  // the program day ends at 4 a.m., like the checklist itself
  function autoTheme(now = new Date(Date.now() - 4 * 3600e3)) {
    try {
      const j = jp(now), m = j.month, d = j.day, plus = n => jp(new Date(now.getTime() + n * 864e5));
      if (now.getDay() === 2 && plus(1).month === 12 && plus(8).month === 1) return 'suri'; // Tuesday night before the year's last Wednesday
      if (m === 1 && d === 13) return 'sizdah';
      if (m === 1 && d <= 12) return 'nowruz';
      if ((m === 9 && d >= 27) || (m === 10 && d === 1)) return 'yalda';
      if (hijriMonth(now) === 9) return 'ramadan';
      if (m === 12 && d >= 25) return 'nowruz';
      return ['spring', 'summer', 'autumn', 'winter'][Math.floor((m - 1) / 3)] || 'autumn';
    } catch (e) { return 'autumn'; }
  }

  /* ---------------- choice ---------------- */
  const KEY = 'uzhu:season', BGKEY = 'uzhu:bg';
  const ls = {
    get: k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
    set: (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} },
  };
  // a theme picked on the night page before the app-wide theme existed becomes the app theme
  if (!ls.get(KEY) && T[ls.get('uzhu:nightTheme')]) ls.set(KEY, ls.get('uzhu:nightTheme'));
  ls.set('uzhu:nightTheme', '');
  const choice = () => { const v = ls.get(KEY); return T[v] || v === 'plain' ? v : ''; };
  // the theme actually shown: a theme id, or '' for the plain look
  // the admin's site-wide default (Settings → ظاهر سایت) applies when the visitor hasn't picked a theme
  const siteDefault = () => { const d = A.site?.settings?.brand?.theme; return T[d] || d === 'plain' ? d : ''; };
  const current = () => { if (!on('theme')) return ''; const v = choice() || siteDefault(); return v === 'plain' ? '' : v || autoTheme(); };

  /* ---------------- cached drawings ---------------- */
  // Every SVG string has its own filter id, so one string is used at most once per page.
  const ICON = { autumn: () => E.maple(), winter: () => E.snowflake(), spring: () => E.blossom(), summer: () => E.sun(), nowruz: () => E.sabzeh(), yalda: () => E.pomegranate(), ramadan: () => E.crescent(), suri: () => E.fire(), sizdah: () => E.kite(), space: () => E.planet(C.peach, C.gold, true), animals: () => E.bearFace(), bow: () => E.bow(C.rose) };
  const cache = new Map();
  function decor(id, slot) {
    const th = T[id]; if (!th) return slot === 'pool' ? [] : '';
    const k = id + ':' + slot;
    if (!cache.has(k)) {
      cache.set(k, slot === 'tl' ? th.tl() : slot === 'tr' ? th.tr() : slot === 'icon' ? one(ICON[id]())
        : slot === 'heart' ? frame('-4 -4 108 108', [[E.heart(HEARTC[id]), 0, 0]], 'nt-heart')
        : slot === 'pool' ? th.scene().concat(th.gut()) : slot === 'gut' ? th.gut() : slot === 'scene' ? th.scene()
        : slot === 'row' ? row(id) : slot === 'top' ? topArt(id) : '');
    }
    return cache.get(k);
  }

  /* ---------------- handwriting font (Gulzar), only Persian letters, digits and a few signs ---------------- */
  function loadFont() {
    if (document.getElementById('nt-font')) return;
    const txt = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیيكئآأؤءۀة‌۰۱۲۳۴۵۶۷۸۹،؛؟!.«»:()-' + autumnBooks.join('') + 'دیوان حافظ';
    const l = document.createElement('link'); l.id = 'nt-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Gulzar&display=swap&text=' + encodeURIComponent([...new Set(txt.replace(/\s/g, ''))].join('') + ' ');
    document.head.appendChild(l);
  }

  /* ---------------- whole-app look ---------------- */
  const PALS = [
    ['peach', 'هلویی', '#f9c9ad', '#fbe4bb'], ['mint', 'نعنایی', '#b4e4cf', '#d8eec6'], ['lilac', 'یاسی', '#dcc2ec', '#f0d2e2'],
    ['sky', 'آسمونی', '#bcd9f2', '#dcd6f2'], ['cream', 'کرم', '#efdcbf', '#f6ebdc'], ['pink', 'صورتی', '#f5bccb', '#f9dccf'],
  ];
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
  let route = (location.hash || '#').slice(1) || 'home';

  function apply(r) {
    if (r) route = r;
    const b = document.body; if (!b) return;
    const id = current();
    b.dataset.route = String(route).split(/[/?]/)[0];
    if (!on('theme')) { delete b.dataset.pal; delete b.dataset.topic; delete b.dataset.season; return; }
    const t = topicOf(route);
    b.dataset.topic = t;
    if (id) { b.dataset.season = id; delete b.dataset.pal; loadFont(); }
    else { delete b.dataset.season; const p = ls.get(BGKEY); b.dataset.pal = PALS.some(x => x[0] === p) ? p : AUTO[t]; }
    paintArt(id);
  }
  // the theme's background art (CSS variables holding SVG data URIs) and the little row in the phone top bar
  let painted = null;
  function paintArt(id) {
    const b = document.body; if (painted === id) return; painted = id;
    const vars = { '--ss-bgl': ['bg', .6], '--ss-bgd': ['bg', .3], '--ss-shl': ['sheet', .3], '--ss-shd': ['sheet', .18], '--ss-garl': ['gar', .95], '--ss-gard': ['gar', .7] };
    Object.entries(vars).forEach(([k, [a, op]]) => { if (id) b.style.setProperty(k, art(id, a, op)); else b.style.removeProperty(k); });
    document.querySelectorAll('.topbar .ss-top').forEach(n => n.remove());
    const bar = $('.topbar .wrap');
    if (id && bar) { const n = el('div', 'ss-top', decor(id, 'top')); n.setAttribute('aria-hidden', 'true'); bar.appendChild(n); }
  }

  /* ---------------- extra theme art: garland, scattered background, peeking animals, stickers, card frames ---------------- */
  // g: garland elements, f: pennant colors, pk: peeking animals, st: corner stickers, bg: scattered background elements
  const X = {
    autumn: { g: () => [E.maple(C.terra, C.rust), E.leaf(C.mustard, C.terra), E.berries()], f: [C.terra, C.mustard, C.rose], pk: ['bear'], st: ['leaf', 'heart', 'sparkle', 'bow'], bg: () => [E.maple(C.mustard, C.terra), E.leaf(C.sage), E.heart(C.rose), E.maple(C.terra, C.rust), E.berries(), E.leaf(C.terra, C.rust)] },
    winter: { g: () => [E.snowflake(C.skyD), E.hat(C.dusty), E.snowflake(C.lav)], f: [C.sky, C.lav, C.dusty], pk: ['polar'], st: ['star', 'heart', 'sparkle'], bg: () => [E.snowflake(C.sky), E.snowflake(C.lav), E.hat(C.skyD), E.heart(C.dusty), E.snowflake(C.skyD), E.mittens()] },
    spring: { g: () => [E.blossom(C.rose), E.butterfly(), E.blossom(C.lav)], f: [C.rose, C.sage, C.butter], pk: ['bunny'], st: ['flower', 'tulip', 'heart', 'sparkle'], bg: () => [E.blossom(C.rose), E.butterfly(C.peach, C.butter), E.leaf(C.sage), E.blossom(C.lav), E.tulip(C.rose), E.butterfly()] },
    summer: { g: () => [E.lemon(), E.sun(), E.watermelon(false)], f: [C.sky, C.butter, C.peach], pk: ['bear'], st: ['star', 'heart', 'sparkle', 'flower'], bg: () => [E.lemon(), E.shell(), E.sunflower(), E.heart(C.peach), E.watermelon(false), E.lemon()] },
    nowruz: { g: () => [E.blossom(C.rose), E.eggs(), E.leaf(C.green, C.sageD)], f: [C.red, C.green, C.butter], pk: ['bunny'], st: ['flower', 'heart', 'leaf', 'sparkle'], bg: () => [E.blossom(C.rose), E.hyacinth(), E.leaf(C.green, C.sageD), E.heart(C.red), E.eggs(), E.blossom(C.lav)] },
    yalda: { g: () => [E.pomegranate(), E.star(C.gold), E.leaf(C.sageD, '#3d6b37')], f: [C.berry, C.gold, C.sageD], pk: ['bear'], st: ['heart', 'star', 'sparkle'], bg: () => [E.pomopen(), E.star(C.gold), E.pomegranate(), E.heart(C.berry), E.candle(), E.leaf(C.sageD, '#3d6b37')] },
    ramadan: { g: () => [E.lantern(), E.star(C.gold), E.crescent()], f: [C.gold, C.navy, C.lav], pk: ['bear'], st: ['star', 'sparkle', 'heart'], bg: () => [E.star(C.gold), E.lantern(), E.sparkle(C.gold), E.crescent(), E.star(C.lav), E.sparkle(C.lav)] },
    suri: { g: () => [E.sparkle(C.orange), E.star(C.gold), E.fire()], f: [C.orange, C.gold, C.red], pk: ['bear'], st: ['star', 'sparkle', 'heart'], bg: () => [E.sparkle(C.orange), E.star(C.gold), E.fire(), E.heart(C.orange), E.sparkle(C.gold), E.star(C.orange)] },
    sizdah: { g: () => [E.kite(), E.blossom(C.butter), E.butterfly()], f: [C.sky, C.green, C.rose], pk: ['bunny'], st: ['flower', 'heart', 'leaf', 'sparkle'], bg: () => [E.kite(), E.cloud(), E.butterfly(), E.blossom(C.butter), E.leaf(C.green, C.sageD), E.blossom(C.rose)] },
    space: { g: () => [E.star(C.gold), E.planet('#9fc4bb', C.gold), E.moon()], f: [C.peach, '#9fc4bb', C.butter], pk: ['astro'], st: ['star', 'planet', 'sparkle', 'heart'], bg: () => [E.planet('#9fc4bb', C.gold), E.star('#8fb8b0'), E.planet(C.peach, C.rose), E.comet(), E.star(C.terra), E.moon()] },
    animals: { g: () => [E.bearFace(), E.tulip(C.rose), E.bunny()], f: [C.sky, C.rose, C.butter], pk: ['bear', 'bunny', 'mouse'], st: ['bearface', 'tulip', 'heart', 'sparkle'], bg: () => [E.bearFace('#f1e9df'), E.tulip(C.rose), E.bearFace(), E.tulip(C.peach), E.sprig(C.mustard, C.sage), E.bunny()] },
    bow: { g: () => [E.bow(C.rose), E.heart(C.rose), E.bow('#c9a27a')], f: [C.rose, '#f2c4ca', '#e3c6aa'], pk: ['bowbear'], st: ['bow', 'heart', 'sparkle', 'tulip'], bg: () => [E.bow(C.rose), E.heart(C.dusty), E.bow('#d4ad92'), E.heart(C.rose), E.bow(C.dusty), E.gyp()] },
  };
  const place = (e, x, y, s = 1, r = 0) => { const t = `translate(${x} ${y}) rotate(${r} ${50 * s} ${50 * s}) scale(${s})`; return [`<g transform="${t}">${e[0]}</g>`, e[1] ? `<g transform="${t}">${e[1]}</g>` : '']; };
  // a standalone SVG document (for CSS backgrounds) with the same watercolor filter
  const doc = (w, h, parts, raw = '', op = 1) => {
    const ps = parts.map(p => place(...p));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><filter id="f" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".032" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="w"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="6" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .38  0 0 0 0 .26  0 0 0 0 .2  0 0 0 -.8 .44" result="gc"/><feComposite in="gc" in2="w" operator="in" result="gm"/><feMerge><feMergeNode in="w"/><feMergeNode in="gm"/></feMerge></filter></defs><g opacity="${op}"><g filter="url(#f)">${raw}${ps.map(a => a[0]).join('')}</g>${ps.map(a => a[1]).join('')}</g></svg>`;
  };
  const uri = s => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
  const ART = {
    // bunting with a theme element hanging from each dip of the string
    gar: (id, op) => {
      const x = X[id], els = x.g(); let raw = ''; const parts = [];
      for (let k = 0; k < 3; k++) {
        const x0 = k * 120; raw += ln(`M${x0} 8 Q${x0 + 60} 32 ${x0 + 120} 8`, C.brownD, 1.4, .6);
        [.2, .8].forEach((t, j) => { const fx = x0 + 120 * t, fy = 8 + 48 * t * (1 - t); raw += W('path', `d="M${fx - 8} ${fy - 1} L${fx + 8} ${fy + 1} L${fx + 1} ${fy + 19}Z"`, x.f[(k * 2 + j) % x.f.length], .66, 1) + `<circle cx="${fx}" cy="${fy + 6}" r="1.4" fill="#fff" fill-opacity=".8"/>`; });
        raw += ln(`M${x0 + 60} 20 L${x0 + 60} 25`, C.brownD, 1.2, .55);
        parts.push([els[k], x0 + 44, 23, .32, k % 2 ? 8 : -8]);
      }
      return doc(360, 58, parts, raw, op);
    },
    // the patterned table: a few bigger elements scattered over a large tile
    bg: (id, op) => { const b = X[id].bg(); const at = [[24, 30, .5, -14], [300, 70, .4, 12], [150, 236, .46, -6], [352, 306, .38, 18], [40, 392, .42, 8], [232, 452, .32, -10]]; return doc(440, 520, at.map((p, i) => [b[i % b.length], ...p]).concat([[E.sparkle(C.gold), 210, 120, .12], [E.sparkle(C.gold), 120, 470, .1], [E.sparkle(C.gold), 410, 210, .1]]), '', op); },
    // the paper sheet: tiny, very faint elements that show between the cards
    sheet: (id, op) => { const b = X[id].bg(); return doc(380, 460, [[b[1], 30, 60, .22, -12], [b[2], 280, 210, .2, 10], [b[4 % b.length], 120, 380, .2, -4], [E.sparkle(C.gold), 330, 40, .1], [E.heart(HEARTC[id]), 200, 120, .09, 8], [E.sparkle(C.gold), 40, 260, .08]], '', op); },
  };
  const artCache = new Map();
  const art = (id, k, op) => { const key = id + k + op; if (!artCache.has(key)) artCache.set(key, uri(ART[k](id, op))); return artCache.get(key); };
  // small rows of elements: inside the top of the first sheet, and in the phone top bar
  function row(id) { const g = X[id].g(); return frame('0 0 262 42', [[g[0], 0, 5, .32, -8], [E.sparkle(C.gold), 40, 13, .15], [g[1], 64, 3, .34, 6], [E.heart(HEARTC[id]), 113, 6, .3, -4], [g[2], 162, 3, .34, -6], [E.sparkle(C.gold), 208, 13, .15], [g[0], 228, 5, .32, 10]], 'ss-rowart'); }
  function topArt(id) { const g = X[id].g(); return frame('0 0 120 40', [[g[1], 0, 4, .32, -8], [E.sparkle(C.gold), 38, 14, .13], [g[0], 52, 2, .36, 4], [E.sparkle(C.gold), 92, 6, .12], [E.heart(HEARTC[id]), 96, 20, .2, 10]]); }

  // peeking animals: crisp little drawings (no ids, so one string can be used many times)
  const PKC = { bear: ['#c79a72', '#f3dfc7'], polar: ['#f7f2ea', '#fffaf4'], bunny: ['#ece5ee', '#fff8fb'], mouse: ['#bfb6ae', '#efe6de'] };
  function peek(kind) {
    const base = kind === 'astro' || kind === 'bowbear' ? 'bear' : kind, [c, m] = PKC[base], s = 'stroke="#7a5a48" stroke-opacity=".42" stroke-width="1.2"';
    const ears = base === 'bunny' ? `<ellipse cx="23" cy="4" rx="5" ry="12" transform="rotate(-12 23 4)" fill="${c}" ${s}/><ellipse cx="37" cy="4" rx="5" ry="12" transform="rotate(12 37 4)" fill="${c}" ${s}/><ellipse cx="23" cy="5" rx="2.2" ry="8" transform="rotate(-12 23 5)" fill="#f4b9c8"/><ellipse cx="37" cy="5" rx="2.2" ry="8" transform="rotate(12 37 5)" fill="#f4b9c8"/>`
      : base === 'mouse' ? `<circle cx="15" cy="13" r="9" fill="${c}" ${s}/><circle cx="45" cy="13" r="9" fill="${c}" ${s}/><circle cx="15" cy="13" r="5" fill="#f4b9c8"/><circle cx="45" cy="13" r="5" fill="#f4b9c8"/>`
      : `<circle cx="17" cy="13" r="7" fill="${c}" ${s}/><circle cx="43" cy="13" r="7" fill="${c}" ${s}/><circle cx="17" cy="13" r="3.4" fill="#f2b8b0"/><circle cx="43" cy="13" r="3.4" fill="#f2b8b0"/>`;
    const nose = base === 'bear' || base === 'polar' ? `<ellipse cx="30" cy="31" rx="6.5" ry="4.8" fill="${m}"/><ellipse cx="30" cy="29.6" rx="2.1" ry="1.5" fill="${FACE}"/><path d="M28.2 32.4 Q30 34 31.8 32.4" fill="none" stroke="${FACE}" stroke-width="1" stroke-linecap="round"/>`
      : `<ellipse cx="30" cy="30.5" rx="1.8" ry="1.3" fill="${C.dusty}"/><path d="M28 32.6 Q30 34.4 32 32.6" fill="none" stroke="${FACE}" stroke-width="1" stroke-linecap="round"/>`;
    const bow = kind === 'bowbear' ? `<g transform="translate(37 1) rotate(16)"><path d="M8 7 C3 0 -3 2 -1 7 C0 11 5 10 8 7Z M8 7 C13 0 19 2 17 7 C16 11 11 10 8 7Z" style="fill:var(--nt-tape)" stroke="#a3405b" stroke-opacity=".35" stroke-width=".8"/><circle cx="8" cy="7" r="2.2" style="fill:var(--nt-accent)"/></g>` : '';
    const helmet = kind === 'astro' ? `<circle cx="30" cy="24" r="21" fill="#dff0fb" fill-opacity=".28" stroke="#8fb9d9" stroke-width="1.8"/><path d="M15 16 Q20 7 30 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-opacity=".9"/>` : '';
    return `<svg viewBox="0 -10 60 56" aria-hidden="true" focusable="false">${ears}<ellipse cx="30" cy="25" rx="17" ry="15" fill="${c}" ${s}/>${bow}<circle cx="23.5" cy="24" r="1.8" fill="${FACE}"/><circle cx="36.5" cy="24" r="1.8" fill="${FACE}"/><ellipse cx="19" cy="29.5" rx="3" ry="1.8" fill="#f08a9a" opacity=".55"/><ellipse cx="41" cy="29.5" rx="3" ry="1.8" fill="#f08a9a" opacity=".55"/>${nose}${helmet}<ellipse cx="15" cy="41" rx="6.5" ry="4.6" fill="${c}" ${s}/><ellipse cx="45" cy="41" rx="6.5" ry="4.6" fill="${c}" ${s}/><path d="M13 40 L13 43 M17 40 L17 43 M43 40 L43 43 M47 40 L47 43" stroke="#7a5a48" stroke-opacity=".4" stroke-width=".9" stroke-linecap="round"/></svg>`;
  }
  // die-cut corner stickers, tinted with the theme colors (style fills follow light/dark automatically)
  const ST = {
    heart: [['path', `d="${HEART}"`, 'var(--nt-tape)']],
    sparkle: [['path', 'd="M50 8 Q54 46 92 50 Q54 54 50 92 Q46 54 8 50 Q46 46 50 8Z"', '#efc25a']],
    star: [['path', `d="${STAR}"`, 'var(--nt-accent2)']],
    leaf: [['path', 'd="M50 6 C80 28 78 70 50 94 C22 70 20 28 50 6Z"', 'var(--nt-accent)'], ['path', 'd="M50 14 L50 92"', 'none']],
    flower: [0, 72, 144, 216, 288].map(a => ['ellipse', `cx="50" cy="28" rx="15" ry="20" transform="rotate(${a} 50 50)"`, 'var(--nt-tape)']).concat([['circle', 'cx="50" cy="50" r="11"', '#f3cd6b']]),
    tulip: [['path', 'd="M47 56 L53 56 L54 96 L46 96Z"', '#93bb85'], ['path', 'd="M50 92 Q26 84 28 62 Q44 70 50 88Z"', '#93bb85'], ['path', 'd="M30 14 Q26 40 38 50 Q50 58 62 50 Q74 40 70 14 L60 26 L50 10 L40 26Z"', 'var(--nt-tape)']],
    bow: [['path', 'd="M50 46 C30 14 4 22 12 42 C18 58 38 54 50 46Z M50 46 C70 14 96 22 88 42 C82 58 62 54 50 46Z"', 'var(--nt-tape)'], ['path', 'd="M46 50 L32 90 L41 84 L48 94 L52 52Z M54 50 L66 88 L58 84 L52 94 L48 52Z"', 'var(--nt-tape)'], ['circle', 'cx="50" cy="47" r="8"', 'var(--nt-accent)']],
    planet: [['ellipse', 'cx="50" cy="52" rx="46" ry="13" transform="rotate(-16 50 52)"', '#efc25a'], ['circle', 'cx="50" cy="50" r="28"', 'var(--nt-accent)'], ['ellipse', 'cx="50" cy="52" rx="40" ry="7" transform="rotate(-16 50 52)"', 'var(--ss-polar)']],
    bearface: [['circle', 'cx="24" cy="30" r="13"', '#c79a72'], ['circle', 'cx="76" cy="30" r="13"', '#c79a72'], ['ellipse', 'cx="50" cy="56" rx="34" ry="29"', '#c79a72'], ['ellipse', 'cx="50" cy="66" rx="13" ry="10"', '#f3dfc7']],
  };
  function sticker(k) {
    const p = ST[k] || ST.heart, sh = (t, a, f, x = '') => `<${t} ${a} style="fill:${f}"${x}/>`;
    const extra = k === 'bearface' ? `<circle cx="38" cy="52" r="3.4" fill="${FACE}"/><circle cx="62" cy="52" r="3.4" fill="${FACE}"/><ellipse cx="50" cy="62" rx="4.4" ry="3.2" fill="${FACE}"/><ellipse cx="29" cy="62" rx="5" ry="3" fill="#f08a9a" opacity=".6"/><ellipse cx="71" cy="62" rx="5" ry="3" fill="#f08a9a" opacity=".6"/>`
      : k === 'heart' || k === 'star' || k === 'planet' ? `<ellipse cx="38" cy="36" rx="5" ry="3.5" transform="rotate(-30 38 36)" fill="#fff" fill-opacity=".5"/>` : k === 'leaf' ? '<path d="M50 16 L50 90" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>' : '';
    return `<svg viewBox="-10 -10 120 120" aria-hidden="true" focusable="false"><g style="stroke:var(--ss-polar);stroke-width:16;stroke-linejoin:round">${p.map(([t, a]) => sh(t, a, 'var(--ss-polar)')).join('')}</g>${p.filter(x => x[2] !== 'none').map(([t, a, f]) => sh(t, a, f)).join('')}${extra}</svg>`;
  }
  const CLIP = {
    binder: '<svg viewBox="0 0 40 38" aria-hidden="true" focusable="false"><path d="M13 19 Q10 3 20 2 Q30 3 27 19" fill="none" stroke="#9c7a35" stroke-width="2.2" stroke-linecap="round"/><path d="M15 19 Q14 8 20 7.5 Q26 8 25 19" fill="none" stroke="#c9a24f" stroke-width="1.4" stroke-linecap="round"/><rect x="4" y="17" width="32" height="19" rx="2.5" fill="#d8b25a"/><rect x="6" y="19" width="28" height="4.5" rx="2" fill="#f4dc95" opacity=".85"/><rect x="4" y="31" width="32" height="5" rx="2" fill="#b38b3c" opacity=".55"/></svg>',
    board: '<svg viewBox="0 0 96 38" aria-hidden="true" focusable="false"><path d="M34 15 L37 3 Q48 -1 59 3 L62 15Z" fill="#d1a94f"/><circle cx="48" cy="7.5" r="2.8" style="fill:var(--nt-paper)"/><rect x="6" y="13" width="84" height="22" rx="5" fill="#ddb862"/><rect x="9" y="15.5" width="78" height="5" rx="2.5" fill="#f6e1a0" opacity=".85"/><rect x="6" y="30" width="84" height="5" rx="2.5" fill="#b08638" opacity=".5"/><circle cx="14" cy="24" r="2.2" fill="#b08638" opacity=".7"/><circle cx="82" cy="24" r="2.2" fill="#b08638" opacity=".7"/></svg>',
  };
  const EDGE = {
    lace: '<svg class="ss-fx ss-lace" aria-hidden="true" focusable="false"><rect class="a" width="100%" height="100%" rx="12"/><rect class="b" width="100%" height="100%" rx="12"/><rect class="c" width="100%" height="100%" rx="12"/></svg>',
    scal: '<svg class="ss-fx ss-scal" aria-hidden="true" focusable="false"><rect class="a" width="100%" height="100%" rx="10"/><rect class="b" width="100%" height="100%" rx="10"/></svg>',
    wob: '<svg class="ss-fx ss-wob" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M7 8 C260 3 520 9 760 4 C860 3 930 7 993 6 C997 260 992 520 996 760 C997 880 994 950 994 993 C740 997 480 991 240 996 C140 997 60 994 6 994 C3 740 8 480 4 240 C3 140 6 60 7 8Z"/><path class="w2" d="M5 4 C300 7 600 2 996 5 M995 3 C999 300 993 640 998 996 M997 997 C640 993 300 999 3 996 M2 998 C6 640 1 300 5 3"/></svg>',
  };
  const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const mix = h => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); return (h ^ (h >>> 16)) >>> 0; };
  const el = (tag, cls, html) => { const n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const FX = (cls, html) => el('div', 'ss-fx ' + cls, html);

  // is there room above a card (in its parent) for an animal to peek over it without covering anything?
  function roomAbove(node, x0, x1, top, depth = 0) {
    const par = node.parentElement;
    let prev = node.previousElementSibling, seen = 0;
    for (; prev && seen < 14; prev = prev.previousElementSibling) {
      if (prev.classList.contains('ss-x') || prev.classList.contains('ss-fx') || !prev.offsetHeight || getComputedStyle(prev).position === 'absolute') continue;
      const outer = prev.getBoundingClientRect();
      if (outer.top >= top - 2) continue; // beside the card (same grid row), not above it
      seen++;
      const rg = document.createRange(); rg.selectNodeContents(prev);
      const pr = rg.getBoundingClientRect(), box = pr.width || pr.height ? pr : outer;
      if (box.bottom > top - 48 && box.left < x1 + 6 && box.right > x0 - 6) return false;
      if (outer.bottom < top - 60) return true;
    }
    if (seen) return true;
    if (!par || par.matches('#app > .view > .wrap')) return true;
    if (depth > 3 || Math.abs(par.getBoundingClientRect().top - top) > 6 || getComputedStyle(par).overflow !== 'visible') return false;
    return roomAbove(par, x0, x1, top, depth + 1);
  }
  const OWN = '.feature,.cycle-card,.greet,.reading,.mission,.growth-card,.band,.sb-polaroid,.ss-set';
  const NOEDGE = OWN + ',.tip-card,.pop,.recipe,.tool,.ifthen-card,.rem-list,.done-card';
  const EDGES = ['ss-e-lace', 'ss-e-stk', 'ss-e-wob', 'ss-e-scal'];
  function unframe(c) { c.querySelectorAll(':scope > .ss-fx').forEach(x => x.remove()); c.classList.remove('ss-rel', ...EDGES); delete c.dataset.ssf; }
  // washi tape, clips, a peeking animal, lace/sticker/scalloped/hand-drawn edges and corner stickers, picked per card
  function frameCards(view, id) {
    const r = document.body.dataset.route || 'home', x = X[id], sheet = view.querySelector(':scope > .wrap');
    const cards = [...view.querySelectorAll('.card')].filter(c => !c.parentElement.closest('.card,.modal') && !c.matches('.stat-row,.saved-card,.nt-sec'));
    let peeks = view.querySelectorAll('.ss-fx.ss-pk').length;
    cards.slice(0, 60).forEach((c, n) => {
      const [fid, cnt] = (c.dataset.ssf || '').split(':');
      if (fid === id && (cnt === '0' || c.querySelector(':scope > .ss-fx'))) return;
      unframe(c);
      if (!c.offsetWidth) return;
      let cs = getComputedStyle(c), clipped = cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none');
      for (let a = c.parentElement; a && a !== sheet && a !== view && !clipped; a = a.parentElement) { const s = getComputedStyle(a); if (s.overflowX !== 'visible' || s.overflowY !== 'visible') clipped = true; }
      if (clipped) { c.dataset.ssf = id + ':0'; return; }
      const h = mix(hash(r + ':' + n + ':' + id)), w = c.offsetWidth, adds = [];
      if (cs.position === 'static') c.classList.add('ss-rel');
      // the top: tape, a clip or a peeking animal
      const pt = parseFloat(cs.paddingTop) || 0;
      if (!c.matches(OWN) && pt >= 13) {
        let t = h % 9;
        if (pt < 18 && t >= 4) t = 3;
        if (t === 6) {
          const cr = c.getBoundingClientRect();
          if (peeks < 3 && w > 200 && (!sheet || cr.top - sheet.getBoundingClientRect().top > 160) && roomAbove(c, cr.left + 14, cr.left + 74, cr.top)) { peeks++; adds.push(FX('ss-pk', peek(x.pk[(h >>> 9) % x.pk.length]))); } else t = 3;
        }
        if (t === 7 && w < 300) t = 4;
        if (t === 2) adds.push(FX('ss-tp g l'));
        if (t === 3) adds.push(FX('ss-tp s c'));
        if (t === 4) adds.push(FX('ss-clip', CLIP.binder));
        if (t === 5) adds.push(FX('ss-tp g l'), FX('ss-tp p c'));
        if (t === 7) adds.push(FX('ss-clip ss-board', CLIP.board));
        if (t === 8) adds.push(FX('ss-tp p c'));
      }
      // the edge
      const e = (h >>> 4) % 10;
      if (e < 4 && !c.matches(NOEDGE) && w > 160) { c.classList.add(EDGES[e]); if (e === 0) adds.push(el('div', '', EDGE.lace).firstChild); if (e === 2) adds.push(el('div', '', EDGE.wob).firstChild); if (e === 3) adds.push(el('div', '', EDGE.scal).firstChild); }
      // a corner sticker
      if ((h >>> 8) % 10 < 4 && w > 140) adds.push(FX('ss-st ' + ((h >>> 12) % 2 ? 'l' : 'r'), sticker(x.st[(h >>> 13) % x.st.length])));
      adds.forEach(a => { a.setAttribute('aria-hidden', 'true'); c.appendChild(a); });
      c.dataset.ssf = id + ':' + adds.length;
    });
  }

  // layout can still move after the frames are placed (fonts, images): an animal that lost its room becomes tape
  function checkPeeks() {
    document.querySelectorAll('#app .ss-fx.ss-pk').forEach(k => {
      const c = k.parentElement, cr = c.getBoundingClientRect();
      if (c.offsetWidth && roomAbove(c, cr.left + 14, cr.left + 74, cr.top)) return;
      const t = FX('ss-tp s c'); t.setAttribute('aria-hidden', 'true'); k.replaceWith(t);
    });
  }
  let pkT = [];
  const laterPeeks = () => { pkT.forEach(clearTimeout); pkT = [400, 1200, 3000].map(ms => setTimeout(() => { try { checkPeeks(); } catch (e) { console.error(e); } }, ms)); };
  window.addEventListener('resize', laterPeeks);

  // a corner cluster on each side of the first sheet, a garland and an animal over its top edge, a small row of
  // elements inside its top, and a row (with a handwritten note) at the end of the last sheet
  function decorate() {
    document.querySelectorAll('#app .ss-x').forEach(n => n.remove());
    document.querySelectorAll('#app [data-ssf]').forEach(unframe);
    const id = current(), view = $('#app > .view');
    if (!id || !view || view.classList.contains('nt-view') || (view.querySelector('.night-page') && on('nighttheme'))) return;
    const sheets = [...view.children].filter(n => n.classList.contains('wrap'));
    if (!sheets.length) return;
    const r = document.body.dataset.route || 'home', h = hash(r), th = T[id], x = X[id];
    const first = sheets[0], last = sheets[sheets.length - 1];
    first.prepend(el('div', 'ss-x ss-toprow', decor(id, 'row')));
    first.prepend(el('div', 'ss-x ss-peektop' + (h % 2 ? ' alt' : ''), peek(x.pk[h % x.pk.length])));
    first.prepend(el('div', 'ss-x ss-corner ss-tr', decor(id, 'tr')));
    first.prepend(el('div', 'ss-x ss-corner ss-tl', decor(id, 'tl')));
    first.prepend(el('div', 'ss-x ss-garland'));
    const pool = decor(id, 'pool'), n = pool.length, s = (h >>> 3) % n;
    const pick = [pool[s], pool[(s + 3) % n], pool[(s + 5) % n]];
    const note = th.notes[(h >>> 5) % th.notes.length];
    last.appendChild(el('div', 'ss-x ss-scene',
      `<div class="ss-it">${pick[0]}</div><p class="ss-note sb-hand"><span>${esc(note)}</span>${decor(id, 'heart')}</p><div class="ss-it ss-mid">${pick[1]}</div><div class="ss-it">${pick[2]}</div>`));
    document.querySelectorAll('#app .ss-x').forEach(n => n.setAttribute('aria-hidden', 'true'));
    frameCards(view, id);
    laterPeeks();
  }
  // cards drawn after the page mounted (lists that fill in, tabs) get their frames a moment later
  let mo, moT;
  function watch() {
    const app = $('#app'); if (mo || !app || !window.MutationObserver) return;
    const ours = n => n.nodeType === 1 && n.classList && (n.classList.contains('ss-fx') || n.classList.contains('ss-x'));
    mo = new MutationObserver(ms => {
      if (ms.every(m => [...m.addedNodes, ...m.removedNodes].every(ours))) return;
      clearTimeout(moT);
      moT = setTimeout(() => { try { const id = current(), view = $('#app > .view'); if (id && view && !view.classList.contains('nt-view') && view.querySelector(':scope > .wrap > .ss-x')) frameCards(view, id); } catch (e) { console.error(e); } }, 160);
    });
    mo.observe(app, { childList: true, subtree: true });
  }

  apply();
  add('mount', r => { apply(r); try { decorate(); watch(); } catch (e) { console.error(e); } });

  /* ---------------- settings ---------------- */
  function settingsCard() {
    if (!on('theme')) return '';
    const v = choice(), auto = autoTheme();
    const tile = (k, label, art, sub = '') => `<button type="button" class="ss-opt" role="radio" aria-checked="${v === k}" data-season-pick="${k}"><span class="ss-ico">${art}</span><span class="ss-lbl">${label}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
    const pal = ls.get(BGKEY);
    const opt = (k, label, bg) => `<button type="button" class="th-opt" role="radio" aria-checked="${pal === k}" data-thbg="${k}"><span class="th-dot" style="background:${bg}"></span><span>${label}</span></button>`;
    return `<div class="card stack ss-set" style="gap:10px"><b>🎨 تم برنامه</b>
      <p class="small muted">کل برنامه، حتی چک‌لیست شب، با نقاشی‌های آبرنگی همون فصل یا مناسبت تزئین می‌شه. حالت خودکار خودش با تقویم عوض می‌شه.</p>
      <div class="ss-grid" role="radiogroup" aria-label="تم برنامه">
        ${tile('', 'خودکار', one(ICON[T[siteDefault()] ? siteDefault() : auto]()), siteDefault() === 'plain' ? 'پیش‌فرض سایت: ساده' : T[siteDefault()] ? `پیش‌فرض سایت: ${T[siteDefault()].label}` : `بر اساس فصل و مناسبت، الان ${T[auto].label}`)}
        ${ORDER.filter(k => T[k].kind !== 'style').map(k => tile(k, T[k].label, decor(k, 'icon'))).join('')}
        ${tile('plain', 'ساده', '<span class="ss-plain"></span>', 'بدون تم')}
        <b class="small ss-gh">طرح‌ها <small class="muted">همیشگی، با فصل عوض نمی‌شن</small></b>
        ${ORDER.filter(k => T[k].kind === 'style').map(k => tile(k, T[k].label, decor(k, 'icon'))).join('')}
      </div>
      <div class="stack ss-pal" style="gap:8px"${v === 'plain' ? '' : ' hidden'}><b class="small">رنگ پس‌زمینه‌ی حالت ساده</b>
        <div class="th-sw" role="radiogroup" aria-label="رنگ پس‌زمینه">
          ${opt('', 'خودکار، با هر بخش', 'conic-gradient(#fcdcc8 0 60deg, #fbe6ae 0 120deg, #d6e8cc 0 180deg, #d3e7f7 0 240deg, #ded5f3 0 300deg, #f6d6d8 0)')}
          ${PALS.map(([k, label, a, c]) => opt(k, label, `radial-gradient(circle at 35% 30%, ${c}, ${a} 70%)`)).join('')}
        </div></div></div>`;
  }
  add('settings', settingsCard);
  // the night page's own theme menu (js/night-theme.js) lists seasons and occasions; add the picture themes to it
  add('mount', r => {
    if (r !== 'night') return;
    setTimeout(() => {
      const sel = document.getElementById('nt-pick'); if (!sel || sel.querySelector('[data-ss-style]')) return;
      const g = document.createElement('optgroup'); g.label = 'طرح‌ها'; g.dataset.ssStyle = '1';
      ORDER.filter(k => T[k].kind === 'style').forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = `${T[k].icon} ${T[k].label}`; o.selected = choice() === k; g.appendChild(o); });
      const plain = sel.querySelector('option[value="plain"]'); sel.insertBefore(g, plain);
      if (T[choice()]?.kind === 'style') sel.value = choice();
    }, 0);
  });
  add('mount', r => {
    if (r !== 'settings') return;
    document.querySelectorAll('[data-season-pick]').forEach(b => b.onclick = () => {
      set(b.dataset.seasonPick);
      document.querySelectorAll('[data-season-pick]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      const p = $('.ss-pal'); if (p) p.hidden = b.dataset.seasonPick !== 'plain';
    });
    document.querySelectorAll('[data-thbg]').forEach(b => b.onclick = () => {
      ls.set(BGKEY, b.dataset.thbg); apply();
      document.querySelectorAll('[data-thbg]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    });
  });

  const listeners = [];
  function set(v) {
    ls.set(KEY, v === 'auto' ? '' : v);
    apply();
    try { decorate(); } catch (e) { console.error(e); }
    listeners.forEach(f => { try { f(current()); } catch (e) { console.error(e); } });
  }

  A.season = {
    ORDER, T, E, C, frame, one, decor, heart: id => frame('-4 -4 108 108', [[E.heart(HEARTC[id]), 0, 0]], 'nt-heart'), loadFont, set, choice, current, auto: autoTheme,
    onChange: f => listeners.push(f), apply: () => apply(),
  };
});
