/* Uzhu night checklist "paper planner" themes (plugin): seasonal and occasion themes for the night page.
   A torn cream paper sheet on a patterned table, a washi-taped title, ruled checklist lines, sticky-note sections,
   handwritten margin notes and inline watercolor SVG decorations. The theme is picked from today's Jalali date
   (and Ramadan from the Umm al-Qura calendar) unless the person picks one; that choice lives in
   localStorage 'uzhu:nightTheme' on this device. Feature key: 'nighttheme'. */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const KEY = 'uzhu:nightTheme';
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
  };
  // compose elements into one SVG with its own uniquely named watercolor filter
  const frame = (vb, parts, cls = '') => {
    const id = 'wc-nt-' + (++uid);
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
  };
  const ORDER = ['autumn', 'winter', 'spring', 'summer', 'nowruz', 'yalda', 'ramadan', 'suri', 'sizdah'];
  const HEARTC = { autumn: C.rose, winter: C.dusty, spring: C.rose, summer: C.peach, nowruz: C.red, yalda: C.berry, ramadan: C.gold, suri: C.orange, sizdah: C.rose };

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
  const chosen = () => { try { const v = localStorage.getItem(KEY); return T[v] ? v : 'auto'; } catch (e) { return 'auto'; } };
  const remember = v => { try { if (v === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, v); } catch (e) {} };

  /* ---------------- handwriting font, only the glyphs we use ---------------- */
  function loadFont() {
    if (document.getElementById('nt-font')) return;
    const txt = new Set(('چک‌لیست آخر شب دیوان حافظ' + autumnBooks.join('') + ORDER.map(k => T[k].notes.join('')).join('') + '۰۱۲۳۴۵۶۷۸۹،!').replace(/\s/g, ''));
    const l = document.createElement('link'); l.id = 'nt-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Gulzar&display=swap&text=' + encodeURIComponent([...txt].join('') + ' ');
    document.head.appendChild(l);
  }

  /* ---------------- decorate the page ---------------- */
  const el = (tag, cls, html) => { const n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; };
  function apply(id) {
    const page = $('.night-page'); if (!page) return;
    const view = page.closest('.view') || page.parentElement, th = T[id];
    page.querySelectorAll('.nt-x').forEach(n => n.remove());
    view.classList.add('nt-view'); view.dataset.nt = id; page.classList.add('nt-paper');
    page.prepend(el('div', 'nt-x nt-corner nt-tr', th.tr()));
    page.prepend(el('div', 'nt-x nt-corner nt-tl', th.tl()));
    const form = $('#nf', page); if (!form) return;
    const sub = $('.nt-submit', form);
    const after = (ref, node) => { if (ref && ref.parentElement === form) ref.after(node); else form.insertBefore(node, sub); };
    // margin notes and gutter art sit in zero-height anchors so they line up with the section next to them
    const heart = () => frame('-4 -4 108 108', [[E.heart(HEARTC[id]), 0, 0]], 'nt-heart');
    const note = (i, side) => { const a = el('div', 'nt-x nt-anchor'); a.appendChild(el('p', `nt-note nt-n${i} nt-${side}`, `<span>${esc(th.notes[i])}</span>${heart()}`)); return a; };
    const gut = th.gut(), g = (i, side) => el('div', 'nt-x nt-anchor nt-gutonly', `<div class="nt-gut nt-${side} nt-g${i}">${gut[i]}</div>`);
    form.prepend(g(0, 'l'));
    after($('.nt-tasks', form), note(0, 'r'));
    after($('.nt-move', form) || $('.nt-tasks', form), g(1, 'r'));
    after($('.nt-slip', form), g(2, 'l'));
    after($('.nt-crave', form), note(1, 'l'));
    after($('.nt-ref', form), g(3, 'r'));
    const last = note(2, 'c'); last.classList.add('nt-last');
    if (sub) sub.after(last); else form.appendChild(last);
    page.appendChild(el('div', 'nt-x nt-scene', th.scene().join('')));
  }
  function picker(cur) {
    const auto = autoTheme(), opt = k => `<option value="${k}"${cur === k ? ' selected' : ''}>${T[k].icon} ${T[k].label}</option>`;
    return `<label for="nt-pick">🎨 تم دفترچه</label><select id="nt-pick" class="nt-select"><option value="auto"${cur === 'auto' ? ' selected' : ''}>✨ خودکار (${T[auto].label})</option>`
      + `<optgroup label="فصل‌ها">${ORDER.filter(k => T[k].kind === 'season').map(opt).join('')}</optgroup><optgroup label="مناسبت‌ها">${ORDER.filter(k => T[k].kind === 'occ').map(opt).join('')}</optgroup></select>`;
  }
  function mount() {
    const page = $('.night-page'); if (!page) return;
    loadFont();
    const cur = chosen();
    apply(cur === 'auto' ? autoTheme() : cur);
    const row = el('div', 'nt-pick', picker(cur)), head = $('.nt-head', page);
    if (head) head.after(row); else page.prepend(row);
    $('#nt-pick', row).onchange = e => { const v = e.target.value; remember(v); apply(v === 'auto' ? autoTheme() : v); };
  }
  A.H.mount = (A.H.mount || []).concat(r => { if (r === 'night' && on('nighttheme')) { try { mount(); } catch (e) { console.error(e); } } });
  A.nightTheme = { autoTheme };
});
