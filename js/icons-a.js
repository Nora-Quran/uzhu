/* Painted icons, set A: food, drink, plants, nature, weather and animals (watercolor, 64×64 canvas). */
(function () {
  const { paint, ell, rr, hi, line, brush, dot, face, shade, C } = UZHU_ICONS.kit;
  const g = (t, s) => `<g transform="${t}">${s}</g>`;
  const rot = (a, x, y, s) => g(`rotate(${a} ${x} ${y})`, s);
  // A leaf from (x,y) pointing at angle a (degrees), length l, half-width w.
  const leaf = (x, y, a, l, w, c, vein = true) => g(`translate(${x} ${y}) rotate(${a})`,
    paint(`M0 0C${l * .3} ${-w} ${l * .7} ${-w} ${l} 0C${l * .7} ${w} ${l * .3} ${w} 0 0z`, c) + (vein ? `<path d="M1 0H${l * .8}" stroke="${shade(c, .45)}" stroke-width="1.1" opacity=".55" fill="none"/>` : ''));
  const starD = (cx, cy, R, r = R * .5) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); }
    return d + 'z';
  };
  const spk = (cx, cy, s) => `M${cx} ${cy - s}C${cx + s * .14} ${cy - s * .28} ${cx + s * .28} ${cy - s * .14} ${cx + s} ${cy}C${cx + s * .28} ${cy + s * .14} ${cx + s * .14} ${cy + s * .28} ${cx} ${cy + s}C${cx - s * .14} ${cy + s * .28} ${cx - s * .28} ${cy + s * .14} ${cx - s} ${cy}C${cx - s * .28} ${cy - s * .14} ${cx - s * .14} ${cy - s * .28} ${cx} ${cy - s}z`;
  const CLOUD = 'M16 50C7 50 5 39 12 36C11 26 23 21 29 27C33 17 50 18 50 31C58 31 61 43 53 48C51 50 49 50 47 50Z';
  const cloud = (t, c = C.white, dk = '#9fb3c8') => g(t, paint(CLOUD, c, { dk, sw: 1.8, po: .45 }) + hi('M14 38c1-4 5-6 9-5', 2.2, .7));
  const steam = (xs, y0 = 20) => xs.map(x => `<path d="M${x} ${y0}c-4-4 4-7 0-12" fill="none" stroke="#c6b8b4" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>`).join('');
  const rays = (cx, cy, r1, r2, n, c, w = 3.4, off = 0) => {
    let s = '';
    for (let i = 0; i < n; i++) { const a = off + i * 2 * Math.PI / n, x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a), x2 = cx + r2 * Math.cos(a), y2 = cy + r2 * Math.sin(a); s += brush(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, c, w); }
    return s;
  };
  const petals = (cx, cy, n, d, rx, ry, c, off = 0) => { let s = ''; for (let i = 0; i < n; i++) s += rot(off + i * 360 / n, cx, cy, paint(ell(cx, cy - d, rx, ry), c)); return s; };
  const APPLE = 'M32 19C24 11 8 14 8 33C8 49 20 59 32 55C44 59 56 49 56 33C56 14 40 11 32 19z';
  const apple = c => paint(APPLE, c, { sw: 1.8 }) + brush('M32 19C32 13 34 9 37 6', C.cocoa, 3) + leaf(35, 13, -25, 15, 5, C.leaf) + hi('M15 28c1-5 4-8 8-9', 2.6, .7) + face(32, 37, .9);
  const PEACH = '#f2c6a6';
  const bowl = (c, top) => (top || '') + paint('M7 34H57C57 48 46 57 32 57C18 57 7 48 7 34z', c, { sw: 1.8 }) + hi('M14 40c2 6 6 10 11 12', 2.2, .55);
  const scene = (bg, inner) => paint(rr(5, 9, 54, 46, 12), bg, { sw: 1.6, po: .3 }) + inner;
  const cheeks = (y, l = 16, r = 48) => `<ellipse cx="${l}" cy="${y}" rx="3.6" ry="2.4" fill="${C.blush}" opacity=".75"/><ellipse cx="${r}" cy="${y}" rx="3.6" ry="2.4" fill="${C.blush}" opacity=".75"/>`;

  UZHU_ICONS.add({
    /* ---------- sky and weather ---------- */
    '🌙': paint('M41 6A27 27 0 1 0 59 45A22 22 0 0 1 41 6z', C.butter, { dk: '#c99b45', sw: 2.2, po: .5 }) + hi('M14 26c2-7 7-12 13-15', 2.6, .7) + face(23, 36, .85, 'sleep') + paint(spk(52, 15, 6), C.gold),
    '☀': rays(32, 32, 20, 28, 8, C.orange, 4, Math.PI / 8) + paint(ell(32, 32, 16), C.butter, { dk: '#d49a3c', sw: 2.2, po: .5 }) + hi('M21 25c2-4 5-6 9-7', 2.4, .7) + face(32, 32, .9),
    '🌤': rays(24, 24, 15, 21, 7, C.orange, 3.2, -.3) + paint(ell(24, 24, 12), C.butter, { dk: '#d49a3c' }) + face(23, 22, .55) + cloud('translate(18 18) scale(.75)'),
    '☁': cloud('translate(0 -4)') + face(32, 38, .8, 'calm'),
    '🌧': cloud('translate(2 -12) scale(.95)') + [16, 28, 40, 50].map((x, i) => brush(`M${x} ${48 + (i % 2) * 3}l-3 8`, C.blue, 3.2)).join('') + face(30, 26, .65, 'calm'),
    '❄': [0, 60, 120].map(a => rot(a, 32, 32, brush('M32 6V58', C.sky, 4) + line('M26 12l6 6 6-6M26 52l6-6 6 6', C.blue, 2.6))).join('') + paint(ell(32, 32, 5), C.white, { dk: C.blue }),
    '🌬': cloud('translate(-6 -2) scale(.72)', C.white) + face(16, 30, .55, 'wow') + brush('M34 26H52c5 0 5-7 0-7', C.sky, 3.4) + brush('M36 36H56', C.sky, 3.4) + brush('M32 46H48c5 0 5 7 0 7', C.sky, 3.4),
    '🌈': brush('M8 50A24 24 0 0 1 56 50', C.red, 5) + brush('M13 50A19 19 0 0 1 51 50', C.orange, 5) + brush('M18 50A14 14 0 0 1 46 50', C.butter, 5) + brush('M23 50A9 9 0 0 1 41 50', C.sage, 5) + cloud('translate(-4 24) scale(.42)') + cloud('translate(38 24) scale(.42)'),
    '☂': paint('M6 34C6 18 18 8 32 8C46 8 58 18 58 34C54 30 48 30 45 34C42 30 36 30 32 34C28 30 22 30 19 34C16 30 10 30 6 34z', C.rose, { sw: 1.8 }) + line('M32 9C26 16 24 26 25 33M32 9C38 16 40 26 39 33', shade(C.rose, .4), 1.4) + brush('M32 34V52C32 58 24 58 24 52', C.cocoa, 3.4) + hi('M13 24c3-6 8-10 13-12', 2.4, .6),
    '🌟': rays(32, 33, 23, 29, 8, C.gold, 2.6) + paint(starD(32, 33, 21, 10), C.butter, { dk: '#c99b45', sw: 2, po: .5 }) + face(32, 34, .62),
    '⭐': paint(starD(32, 33, 26, 12), C.gold, { dk: '#b9822e', sw: 2.2, po: .5 }) + hi('M22 26l7-1', 2.4, .7),
    '✨': paint(spk(26, 36, 20), C.butter, { dk: '#c99b45', sw: 1.8 }) + paint(spk(48, 15, 9), C.gold) + paint(spk(50, 48, 6), C.pink),
    '🌅': scene(C.pink, paint('M17 42A15 15 0 0 1 47 42z', C.butter, { dk: '#d49a3c' }) + rays(32, 42, 18, 23, 5, C.orange, 2.8, Math.PI * 1.1) + paint('M5 42H59V44A11 11 0 0 1 48 55H16A11 11 0 0 1 5 44z', C.sky, { po: .3 }) + hi('M20 47h10M34 50h12', 2, .8)),
    '🌇': scene(C.peach, paint(ell(34, 34, 11), C.butter) + paint('M9 55V36H19V28H28V55zM34 55V40H42V32H52V55z', C.lav, { dk: '#7d6aa8' }) + '<path d="M12 40h3M12 46h3M22 34h3M22 42h3M37 44h3M45 37h3M45 44h3" stroke="#fde6a8" stroke-width="2.4" stroke-linecap="round"/>'),
    '🌆': scene(C.lav, paint(ell(46, 22, 5), C.butter) + paint('M8 55V30H18V22H26V55zM30 55V36H38V28H48V36H56V55z', C.blue, { dk: '#4d6d99' }) + '<path d="M11 34h3M11 41h3M11 48h3M20 27h3M20 35h3M33 41h3M40 33h3M40 41h3M50 41h3M50 48h3" stroke="#fde6a8" stroke-width="2.4" stroke-linecap="round"/>'),
    '🌉': scene('#8a9bd0', paint('M40 13a8 8 0 1 0 8 11 6 6 0 0 1-8-11z', C.butter) + brush('M5 30C18 44 46 44 59 30', C.rose, 2.6) + paint('M15 22H20V55H15zM44 22H49V55H44z', C.rose, { dk: '#a95968' }) + brush('M5 44H59', C.rose, 3.4) + '<path d="M24 38v6M32 40v4M40 38v6" stroke="#f3b4be" stroke-width="1.8"/>' + hi('M10 51h8M30 52h10', 1.8, .6)),
    '🌊': paint('M4 56C8 32 26 16 44 20C56 23 59 36 50 41C45 44 39 40 42 34C32 32 28 44 34 56z', C.blue, { dk: '#4d78ab', sw: 2 }) + brush('M40 21C51 21 58 31 52 38', C.white, 2.6) + paint('M4 50C14 46 22 54 32 50S50 46 60 50V58H4z', C.sky, { po: .3 }) + face(22, 40, .6),
    '💧': paint('M32 5C40 19 51 29 51 41A19 19 0 0 1 13 41C13 29 24 19 32 5z', C.sky, { dk: '#5f8fbd', sw: 2, po: .5 }) + hi('M20 36c0-5 3-10 6-13', 2.6, .75) + face(32, 42, .85),
    '🔥': paint('M32 5C36 17 51 23 51 40A19 19 0 0 1 13 40C13 30 19 24 24 17C26 25 29 27 32 27C30 19 30 11 32 5z', C.orange, { dk: '#c7663a', sw: 2, po: .5 }) + paint('M32 29C37 37 43 40 43 47A11 11 0 0 1 21 47C21 40 28 36 32 29z', C.butter) + face(32, 46, .6),

    /* ---------- plants ---------- */
    '🌱': paint(ell(32, 54, 17, 6), C.brown, { po: .3 }) + brush('M32 53V33', C.leaf, 3.6) + paint('M32 36C24 37 13 31 11 20C22 17 31 24 32 36z', C.leaf) + paint('M32 32C34 21 43 13 55 13C55 26 45 33 32 32z', C.sage) + hi('M17 22c3 2 6 4 9 8', 1.8, .6),
    '🌿': brush('M16 59C24 44 34 28 50 7', C.leaf, 3.2) + leaf(22, 49, 200, 15, 6, C.sage) + leaf(24, 46, -30, 16, 6, C.leaf) + leaf(30, 36, 205, 15, 6, C.leaf) + leaf(34, 32, -45, 15, 6, C.sage) + leaf(40, 22, 215, 14, 5.5, C.sage) + leaf(43, 18, -60, 14, 5.5, C.leaf),
    '🍃': leaf(8, 40, -35, 34, 11, C.sage) + leaf(26, 56, -55, 28, 9, C.leaf) + line('M40 12c6-2 10 0 14 4M46 24c4 0 8 2 10 6', C.mint, 2.4),
    '🍂': rot(-20, 32, 32, paint('M14 46C10 30 22 12 44 10C48 30 36 48 14 46z', C.orange, { sw: 1.8 }) + line('M14 46C24 36 34 24 42 13', shade(C.orange, .45), 1.6)) + rot(30, 36, 46, paint('M26 56C24 44 32 34 46 34C48 46 40 56 26 56z', C.brown)),
    '🍁': paint('M32 4L37 16L44 12L42 26L54 20L50 30L60 32L48 40L52 46L38 44L34 50H30L26 44L12 46L16 40L4 32L14 30L10 20L22 26L20 12L27 16Z', C.red, { dk: '#a8483f', sw: 1.8 }) + brush('M32 30V60', '#a8483f', 2.6) + hi('M24 24l5 6', 1.8, .5),
    '🌸': petals(32, 32, 5, 13, 9, 12, C.pink) + paint(ell(32, 32, 8), C.butter) + face(32, 31, .45),
    '🌼': petals(32, 32, 8, 15, 6, 10, C.butter) + paint(ell(32, 32, 9), C.orange) + face(32, 31, .5),
    '🌷': brush('M32 34V60', C.leaf, 3.4) + leaf(31, 58, -120, 22, 6, C.sage, false) + leaf(33, 58, -60, 22, 6, C.leaf, false) + paint('M16 14L22 22L27 8L32 18L37 8L42 22L48 14C50 30 44 40 32 40C20 40 14 30 16 14z', C.rose, { sw: 1.8 }) + face(32, 28, .55),
    '💐': [[20, 18, C.pink], [33, 12, C.butter], [45, 19, C.rose], [27, 28, C.lav], [40, 29, C.peach]].map(([x, y, c]) => petals(x, y, 5, 4.2, 3.6, 4.4, c) + dot(x, y, 2, C.gold)).join('') + leaf(20, 34, 200, 12, 4, C.leaf) + leaf(44, 34, -20, 12, 4, C.leaf) + paint('M14 34H50L36 60H28z', C.sand, { sw: 1.8 }) + brush('M24 44H40', C.rose, 3),
    '🌳': paint(rr(28, 38, 9, 21, 3), C.brown) + paint('M32 6C44 6 52 14 52 22C58 26 58 38 50 42C46 48 18 48 14 42C6 38 6 26 12 22C12 14 20 6 32 6z', C.leaf, { dk: '#5f8f56', sw: 2 }) + hi('M18 22c2-6 7-10 13-11', 2.6, .5) + face(32, 28, .7),
    '🌴': paint(ell(32, 58, 22, 4), C.sand, { po: .3 }) + brush('M30 57C34 44 34 30 30 18', C.brown, 5) + leaf(30, 18, 160, 24, 6, C.leaf) + leaf(30, 18, 200, 22, 6, C.sage) + leaf(30, 18, -20, 24, 6, C.leaf) + leaf(30, 18, 20, 22, 6, C.sage) + leaf(30, 18, -90, 14, 5, C.leaf) + dot(28, 22, 3.2, C.cocoa) + dot(34, 22, 3.2, C.cocoa),
    '🪴': leaf(32, 34, -150, 20, 7, C.sage) + leaf(32, 34, -30, 20, 7, C.leaf) + leaf(32, 34, -90, 22, 7, C.leaf) + paint('M14 34H50L45 58H19z', C.orange, { dk: '#b9693d', sw: 1.8 }) + paint(rr(12, 32, 40, 7, 3), C.peach) + face(32, 46, .7),
    '🌾': brush('M24 60C24 42 26 26 32 10', C.sand, 2.6) + brush('M38 60C38 44 40 30 46 16', C.sand, 2.6) + [[30, 14], [28, 22], [27, 30], [26, 38]].map(([x, y]) => leaf(x, y, -130, 9, 3.4, C.gold, false) + leaf(x + 1, y, -40, 9, 3.4, C.gold, false)).join('') + [[44, 20], [42, 28], [41, 36]].map(([x, y]) => leaf(x, y, -130, 8, 3, C.butter, false) + leaf(x + 1, y, -40, 8, 3, C.butter, false)).join(''),
    '🥬': paint('M26 58C23 44 24 34 28 24H36C40 34 41 44 38 58z', C.mint, { dk: '#78a998' }) + paint('M28 44C14 44 5 30 11 14C20 10 28 16 30 26z', C.leaf) + paint('M36 44C50 44 59 30 53 14C44 10 36 16 34 26z', C.leaf) + paint('M32 32C24 26 24 10 32 4C40 10 40 26 32 32z', C.sage) + line('M32 34V56M28 40l-8-10M36 40l8-10', '#e8f4ee', 1.8),

    /* ---------- fruit and nuts ---------- */
    '🍎': apple(C.red),
    '🍏': apple(C.leaf),
    '🍊': paint(ell(32, 36, 22), C.orange, { dk: '#c7663a', sw: 1.8 }) + leaf(33, 15, -30, 16, 5, C.leaf) + dot(32, 15, 2, C.cocoa) + hi('M16 30c1-5 4-8 8-10', 2.6, .6) + face(32, 38, .9),
    '🍋': rot(-20, 32, 32, paint('M5 32C8 21 20 14 32 14C44 14 56 21 59 32C56 43 44 50 32 50C20 50 8 43 5 32z', C.butter, { dk: '#c99b45', sw: 1.8 }) + hi('M16 25c4-4 9-6 14-6', 2.4, .6)) + leaf(46, 14, -30, 13, 4, C.leaf) + face(32, 33, .8),
    '🍇': brush('M32 14C32 8 35 5 39 4', C.cocoa, 3) + leaf(34, 10, -15, 15, 5, C.leaf) + [[22, 22], [32, 21], [42, 22], [27, 32], [37, 32], [22, 42], [32, 42], [42, 42], [32, 52]].map(([x, y]) => paint(ell(x, y, 6.5), C.lav, { dk: '#7d6aa8' }) + hi(`M${x - 3} ${y - 2}l2-2`, 1.6, .7)).join('') + face(32, 33, .5),
    '🍓': paint('M32 18C44 14 55 20 53 32C51 44 41 53 32 58C23 53 13 44 11 32C9 20 20 14 32 18z', C.red, { dk: '#a8483f', sw: 1.8 }) + '<g fill="#ffe6a6">' + [[20, 26], [44, 26], [18, 36], [46, 36], [26, 46], [38, 46], [32, 52]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="1.8"/>`).join('') + '</g>' + paint('M20 18L26 12L32 16L38 10L42 18L36 20L32 22L26 20z', C.leaf) + face(32, 33, .8),
    '🍉': paint('M5 24A27 27 0 0 0 59 24z', C.leaf, { dk: '#5f8f56', sw: 1.8 }) + paint('M10 24A22 22 0 0 0 54 24z', C.red, { dk: '#c85d5a' }) + brush('M10 24H54', C.white, 2) + '<g fill="#5b4343">' + [[20, 31], [44, 31], [26, 40], [38, 40]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2"/>`).join('') + '</g>' + face(32, 31, .55),
    '🌰': paint('M32 8C46 8 57 22 55 37C53 50 43 57 32 57C21 57 11 50 9 37C7 22 18 8 32 8z', C.cocoa, { dk: '#5e3a2a', sw: 2 }) + paint('M10 42C18 50 46 50 54 42C52 52 44 57 32 57C20 57 12 52 10 42z', C.sand) + dot(32, 9, 2.4, '#5e3a2a') + hi('M17 22c3-6 8-10 14-11', 2.6, .5) + dot(25, 30, 1.9, '#fff') + dot(39, 30, 1.9, '#fff') + `<path d="M28 35q4 3 8 0" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>` + cheeks(34, 20, 44),
    '🥜': rot(-25, 32, 32, paint('M32 6C42 6 46 14 44 22C42 28 40 30 42 36C46 44 44 58 32 58C20 58 18 44 22 36C24 30 22 28 20 22C18 14 22 6 32 6z', C.sand, { dk: '#a88458', sw: 1.8 }) + line('M26 14l4 4M34 14l4 4M26 44l4 4M34 44l4 4M28 24h8M28 50h8', '#c9a676', 1.4)) + face(32, 32, .7),

    /* ---------- sweets and bakes ---------- */
    '🍬': paint('M20 32L6 21L9 32L6 43z', C.pink) + paint('M44 32L58 21L55 32L58 43z', C.pink) + paint(ell(32, 32, 14, 11), C.rose, { sw: 1.8 }) + line('M24 23l-4 16M33 21l-5 22M42 24l-4 16', '#fff', 2.2) + hi('M23 26c2-2 4-3 6-3', 1.8, .6),
    '🍫': paint(rr(14, 6, 36, 50, 5), C.cocoa, { dk: '#5e3a2a', sw: 2 }) + line('M14 18H50M14 30H50M32 6V30', '#6b4434', 2) + hi('M18 10h8M36 10h8M18 22h8M36 22h8', 1.8, .4) + paint('M12 34L20 30L28 35L36 30L44 35L52 31V58H12z', C.rose) + face(32, 44, .7),
    '🍰': paint(rr(8, 30, 48, 24, 5), C.sand, { dk: '#b9906a', sw: 1.8 }) + brush('M10 41H54', C.cream, 3.4) + brush('M10 41H54', C.pink, 1.4) + paint('M8 34C8 26 56 26 56 34C52 38 48 32 44 36C40 32 36 38 32 34C28 38 24 32 20 36C16 32 12 38 8 34z', C.white, { dk: '#c9b8a8' }) + paint('M32 12C38 12 41 17 39 22C37 26 34 28 32 28C30 28 27 26 25 22C23 17 26 12 32 12z', C.red) + leaf(32, 13, -70, 7, 3, C.leaf, false) + face(32, 47, .6),
    '🎂': paint(ell(32, 56, 26, 5), C.sand, { po: .3 }) + paint(rr(10, 32, 44, 22, 5), C.pink, { sw: 1.8 }) + paint('M10 36C10 30 54 30 54 36V38C50 42 48 36 44 40C40 36 36 42 32 38C28 42 24 36 20 40C16 36 14 42 10 38z', C.white, { dk: '#c9b8a8' }) + [20, 32, 44].map(x => brush(`M${x} 30V18`, x === 32 ? C.sky : C.lav, 3.4) + paint(`M${x} 6C${x + 4} 11 ${x + 4} 15 ${x} 15C${x - 4} 15 ${x - 4} 11 ${x} 6z`, C.butter, { dk: C.orange })).join('') + face(32, 46, .65),
    '🧁': paint('M14 36H50L44 58H20z', C.sky, { dk: '#5f8fbd', sw: 1.8 }) + line('M24 38l2 18M32 38v18M40 38l-2 18', '#e6f1fa', 1.6) + paint('M10 38C7 28 16 22 22 22C22 12 42 12 42 22C48 22 57 28 54 38z', C.pink, { sw: 1.8 }) + hi('M17 30c2-3 5-5 9-5', 2.2, .6) + paint(ell(32, 11, 5), C.red) + face(32, 46, .6),
    '🍪': paint(ell(32, 32, 25), C.sand, { dk: '#a88458', sw: 2 }) + [[20, 20], [42, 18], [46, 40], [20, 42], [34, 50]].map(([x, y]) => paint(ell(x, y, 3.4, 2.8), C.cocoa, { sw: 0 })).join('') + face(32, 32, .85),
    '🍯': paint('M14 26C8 38 12 57 32 57C52 57 56 38 50 26z', C.gold, { dk: '#a8742c', sw: 1.8 }) + paint(rr(14, 16, 36, 12, 4), C.brown) + paint('M14 26H50C50 32 46 30 44 34C42 30 38 30 36 36C34 30 30 30 28 33C26 30 20 30 18 32C16 30 14 30 14 26z', C.butter) + brush('M40 8L34 20', C.cocoa, 2.6) + face(32, 44, .8),
    '🥖': rot(-38, 32, 32, paint(rr(2, 22, 60, 20, 10), C.sand, { dk: '#a8742c', sw: 2 }) + line('M14 27l6 10M26 27l6 10M38 27l6 10M50 27l5 8', '#a8742c', 2) + hi('M8 27h48', 2, .4)),

    /* ---------- dishes and meals ---------- */
    '🍽': brush('M8 10V54', C.gray, 3.4) + line('M4 10V20Q8 26 12 20V10', shade(C.gray, .4), 2.2) + paint(ell(32, 34, 18), C.white, { dk: '#a8a1a6', sw: 1.8 }) + paint(ell(32, 34, 11), C.cream, { dk: '#c9bdb0' }) + paint('M54 8C60 14 60 26 56 32V54H52V8z', C.gray) + face(32, 34, .6),
    '🍳': brush('M46 46L60 59', C.cocoa, 6) + paint(ell(28, 34, 24, 22), '#8d8a96', { dk: '#55525e', sw: 2 }) + paint('M18 24C24 16 38 20 40 28C46 34 42 46 32 46C22 50 12 42 14 34C12 30 14 26 18 24z', C.white, { dk: '#c9bdb0' }) + paint(ell(28, 33, 7), C.butter, { dk: C.orange }) + face(28, 33, .45),
    '🍲': steam([24, 32, 40], 22) + paint(rr(4, 30, 8, 6, 3), C.red) + paint(rr(52, 30, 8, 6, 3), C.red) + paint('M10 30H54V42C54 52 46 57 32 57C18 57 10 52 10 42z', C.red, { dk: '#a8483f', sw: 1.8 }) + paint(ell(32, 30, 22, 5), C.orange) + dot(24, 30, 2.4, C.leaf) + dot(36, 29, 2.4, C.butter) + dot(42, 31, 2, C.leaf) + face(32, 44, .7),
    '🥗': bowl(C.sky, leaf(10, 34, -40, 20, 7, C.leaf) + leaf(54, 34, 220, 20, 7, C.sage) + leaf(22, 34, -80, 20, 7, C.sage) + leaf(42, 34, -100, 18, 6, C.leaf) + paint(ell(32, 26, 6), C.red) + paint(ell(46, 30, 4.4), C.butter)) + face(32, 45, .65),
    '🥣': brush('M40 32L56 8', C.gray, 3.6) + paint(ell(57, 7, 4, 3), C.gray) + bowl(C.lav, paint(ell(32, 34, 25, 6), C.sand) + dot(22, 33, 2, C.red) + dot(36, 32, 2, C.lav) + dot(28, 36, 1.6, C.leaf)) + face(32, 45, .65),
    '🍚': bowl(C.rose, paint('M10 35C10 16 54 16 54 35z', C.white, { dk: '#bcae9f', sw: 1.8 }) + line('M20 26h3M30 22h3M40 26h3M26 31h3M36 31h3', '#dcd2c6', 1.6)) + '<path d="M16 44h4M30 48h4M44 44h4" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>' + face(32, 28, .55),
    '🍛': paint(ell(32, 40, 28, 15), C.white, { dk: '#a8a1a6', sw: 1.8 }) + paint('M10 40C10 30 30 28 32 36C30 46 14 48 10 40z', C.cream, { dk: '#bcae9f' }) + paint('M32 34C38 28 54 30 54 40C52 48 36 48 32 42z', C.orange, { dk: '#b9693d' }) + dot(42, 38, 2.4, C.leaf) + dot(48, 41, 2, C.butter) + face(20, 38, .5),
    '🥚': paint('M32 5C44 5 52 25 52 38C52 50 44 59 32 59C20 59 12 50 12 38C12 25 20 5 32 5z', C.cream, { dk: '#b9906a', sw: 2, po: .45 }) + hi('M20 26c2-7 5-12 9-14', 2.6, .8) + face(32, 40, .85),
    '🧂': paint(rr(16, 22, 32, 36, 9), C.white, { dk: '#a8a1a6', sw: 1.8 }) + paint('M18 24C18 12 46 12 46 24z', C.gray, { dk: '#8d8a96' }) + dot(28, 16, 1.4) + dot(36, 16, 1.4) + dot(32, 19, 1.4) + dot(10, 10, 1.4, '#c9c3c0') + dot(54, 8, 1.4, '#c9c3c0') + dot(50, 14, 1.2, '#c9c3c0') + face(32, 40, .75),
    '🫙': paint(rr(18, 6, 28, 9, 3), C.brown) + paint(rr(14, 14, 36, 44, 10), C.mint, { dk: '#6e9e90', sw: 1.8, op: .75 }) + paint(rr(18, 34, 28, 20, 7), C.butter, { op: .85 }) + hi('M20 22v16', 3, .7) + face(32, 42, .7),

    /* ---------- drinks ---------- */
    '☕': steam([24, 32, 40], 18) + paint(ell(30, 57, 22, 4), C.sand, { po: .3 }) + brush('M46 33C57 33 57 46 45 46', C.rose, 4) + paint('M13 27H47V40C47 50 40 56 30 56C20 56 13 50 13 40z', C.rose, { sw: 1.8 }) + paint(ell(30, 27, 17, 4), C.cocoa) + face(30, 41, .75),
    '🍵': steam([26, 38], 18) + paint('M10 27H54C54 45 45 55 32 55C19 55 10 45 10 27z', C.mint, { dk: '#6e9e90', sw: 1.8 }) + paint(ell(32, 27, 22, 5), C.leaf) + hi('M16 34c1 6 4 10 8 13', 2.2, .6) + face(32, 40, .75),
    '🫖': steam([30, 38], 12) + brush('M14 34C4 30 4 22 8 20', C.sage, 4) + brush('M48 30C58 30 58 44 48 46', C.sage, 4) + paint('M14 30C14 20 50 20 50 30V40C50 52 42 56 32 56C22 56 14 52 14 40z', C.sky, { dk: '#5f8fbd', sw: 1.8 }) + paint(rr(24, 18, 16, 6, 3), C.sky) + paint(ell(32, 16, 3), C.butter) + face(32, 40, .75),
    '🥛': paint('M17 7H47L43 57H21z', C.sky, { dk: '#5f8fbd', op: .35, sw: 1.8 }) + paint('M18 22H46L43 56H21z', C.white, { dk: '#a8a1a6' }) + hi('M22 12l3 40', 2.6, .8) + face(32, 38, .75),
    '🥤': brush('M36 22L42 6H52', C.red, 3) + paint('M17 22H47L43 57H21z', C.pink, { sw: 1.8 }) + paint(rr(14, 17, 36, 7, 3), C.white, { dk: '#a8a1a6' }) + line('M22 32H42M23 44H41', '#fff', 2) + face(32, 39, .7),
    '🧃': brush('M38 14V4H46', C.sky, 3) + paint(rr(16, 12, 32, 46, 5), C.orange, { dk: '#b9693d', sw: 1.8 }) + paint(ell(32, 40, 10, 9), C.butter) + leaf(34, 31, -60, 8, 3, C.leaf, false) + face(32, 41, .6),
    '🧊': paint('M10 22L32 12L54 22V44L32 56L10 44z', C.sky, { dk: '#5f8fbd', sw: 1.8, op: .85 }) + paint('M10 22L32 12L54 22L32 32z', '#d9ecf8', { dk: '#7fa9d6' }) + line('M32 32V56', '#7fa9d6', 1.4) + hi('M14 28v12', 2.6, .8) + face(32, 42, .6),

    '🧀': paint('M6 52V36L50 12L58 24V52Z', C.butter, { dk: '#c99b45', sw: 2 }) + paint('M6 36L50 12L58 24L14 40z', '#fbe7a6', { dk: '#c99b45' }) + paint(ell(46, 36, 4.4, 3.6), C.gold, { sw: 0 }) + paint(ell(16, 47, 3, 2.6), C.gold, { sw: 0 }) + paint(ell(52, 47, 2.4), C.gold, { sw: 0 }) + face(30, 44, .6),
    '🔊': paint(rr(6, 24, 12, 16, 3), C.lav, { dk: '#7d6aa8' }) + paint('M16 25L32 12V52L16 39z', C.lav, { dk: '#7d6aa8', sw: 1.8 }) + brush('M39 25C43 29 43 35 39 39', C.sky, 3.4) + brush('M45 19C52 26 52 38 45 45', C.sky, 3.4) + brush('M51 13C61 23 61 41 51 51', C.sky, 3.4),

    /* ---------- utensils ---------- */
    '🥄': rot(35, 32, 32, paint(ell(32, 14, 9, 12), C.gray, { dk: '#8d8a96', sw: 1.8 }) + brush('M32 26V60', '#a8a1a6', 4.4) + hi('M28 10c1-3 3-4 5-4', 2, .8)),

    /* ---------- body, mind, people ---------- */
    '💪': paint('M5 58V45C9 31 29 26 35 36C38 32 40 26 40 20C36 18 36 8 46 6C54 4 59 12 57 20C56 30 59 44 57 50C55 56 50 58 44 58Z', C.peach, { dk: '#c27c58', sw: 2 }) + line('M20 40c4-2 10-1 13 2', '#c27c58', 1.6) + line('M44 12c3 0 6 1 8 4', '#c27c58', 1.4) + hi('M12 44c3-5 8-8 13-8', 2.6, .6),
    '🧠': paint('M32 13C26 7 14 9 12 19C4 21 4 35 10 39C10 49 22 54 30 50H34C42 54 54 49 54 39C60 35 60 21 52 19C50 9 38 7 32 13z', C.pink, { dk: '#c97488', sw: 2 }) + line('M32 13V26M20 16q-2 6 4 8M44 16q2 6-4 8M10 30q6-2 8 3M54 30q-6-2-8 3M16 44q4-4 8 0M48 44q-4-4-8 0', '#c97488', 2.2) + face(32, 36, .65),
    '😋': paint(ell(32, 32, 26), C.butter, { dk: '#c99b45', sw: 2, po: .45 }) + line('M17 27q4-5 8 0M39 27q4-5 8 0', C.ink, 2.2) + line('M22 38q10 9 20 0', C.ink, 2.2) + paint('M34 41C35 48 43 48 43 41z', C.rose, { sw: 1 }) + cheeks(36, 15, 49) + hi('M14 20c3-5 7-8 12-9', 2.6, .5),
    '🤲': paint(spk(32, 12, 7), C.butter) + paint('M4 28C4 22 10 22 12 26L16 34C24 34 30 38 32 42C34 38 40 34 48 34L52 26C54 22 60 22 60 28C60 44 48 57 32 57C16 57 4 44 4 28z', C.peach, { dk: '#c27c58', sw: 2 }) + line('M32 42V56M14 40c2 4 5 7 9 9M50 40c-2 4-5 7-9 9', '#c27c58', 1.6),
    '👩‍🍳': paint('M16 54C16 46 24 42 32 42C40 42 48 46 48 54V60H16z', C.white, { dk: '#a8a1a6' }) + paint('M14 40C12 26 20 18 32 18C44 18 52 26 50 40C48 34 46 32 44 30H20C18 32 16 34 14 40z', C.cocoa) + paint(ell(32, 36, 15, 14), PEACH, { dk: '#c27c58', sw: 1.8 }) + paint('M18 22C12 20 12 8 20 8C22 2 42 2 44 8C52 8 52 20 46 22z', C.white, { dk: '#a8a1a6', sw: 1.8 }) + paint(rr(18, 19, 28, 7, 3), C.cream, { dk: '#a8a1a6' }) + face(32, 37, .75),

    /* ---------- animals ---------- */
    '🐷': paint('M14 20L12 6L26 14zM50 20L52 6L38 14z', C.rose) + paint(ell(32, 35, 23, 20), C.pink, { dk: '#c97488', sw: 2 }) + paint(ell(32, 42, 9, 6.5), C.rose) + dot(29, 42, 1.6, '#a95968') + dot(35, 42, 1.6, '#a95968') + dot(22, 31, 2) + dot(42, 31, 2) + cheeks(40),
    '🐻': paint(ell(15, 16, 8), C.brown) + paint(ell(49, 16, 8), C.brown) + dot(15, 16, 3.6, C.sand) + dot(49, 16, 3.6, C.sand) + paint(ell(32, 35, 24, 21), C.brown, { dk: '#7d553a', sw: 2 }) + paint(ell(32, 43, 10, 8), C.sand) + paint(ell(32, 39, 4, 3), C.cocoa, { sw: 0 }) + line('M29 46q3 2 6 0', C.ink, 1.8) + dot(22, 31, 2.2) + dot(42, 31, 2.2) + cheeks(40, 15, 49),
    '🐈': brush('M46 52C58 50 60 36 52 32', C.orange, 4.4) + paint(ell(34, 46, 16, 13), C.orange, { dk: '#b9693d', sw: 1.8 }) + paint('M14 22L14 6L24 14zM42 22L42 6L32 14z', C.orange) + paint(ell(28, 24, 15, 13), C.orange, { dk: '#b9693d', sw: 1.8 }) + line('M24 12l-2 6M34 12l-2 6M18 50v6M28 52v5', '#b9693d', 1.8) + face(28, 25, .65) + line('M12 28h-6M44 28h6', '#b9693d', 1.2),
    '🦩': brush('M30 44L30 60M30 52L36 56', C.rose, 2.4) + brush('M40 34C46 24 44 14 38 10C32 6 26 12 30 16', C.pink, 4.4) + paint('M14 38C16 28 30 26 42 32C46 38 40 46 30 46C22 46 14 44 14 38z', C.pink, { dk: '#c97488', sw: 1.8 }) + paint('M20 38C24 32 32 32 36 36C30 40 24 40 20 38z', C.rose) + paint(ell(30, 14, 5), C.pink) + paint('M26 16L20 20L26 21z', C.ink) + dot(31, 13, 1.4),
    '🦋': paint('M30 30C24 12 8 8 6 18C4 28 18 34 30 32z', C.lav, { dk: '#7d6aa8', sw: 1.8 }) + paint('M34 30C40 12 56 8 58 18C60 28 46 34 34 32z', C.lav, { dk: '#7d6aa8', sw: 1.8 }) + paint('M30 34C20 36 12 46 18 52C24 56 30 46 30 36z', C.pink) + paint('M34 34C44 36 52 46 46 52C40 56 34 46 34 36z', C.pink) + dot(16, 20, 3, C.butter) + dot(48, 20, 3, C.butter) + paint(rr(29, 20, 6, 30, 3), C.cocoa) + line('M31 20C29 14 26 10 22 8M33 20C35 14 38 10 42 8', C.ink, 1.6),
    '🦗': brush('M20 40L10 54M42 40L52 54', C.leaf, 2.4) + brush('M40 34L54 22L58 44', C.sage, 3.4) + paint('M8 38C8 30 24 26 42 30C52 32 52 40 42 42C26 46 8 44 8 38z', C.leaf, { dk: '#5f8f56', sw: 1.8 }) + paint(ell(48, 34, 7, 6), C.leaf) + line('M52 30C56 20 58 14 60 8M50 29C50 20 48 12 46 6', C.ink, 1.4) + dot(50, 33, 1.6) + hi('M14 34c6-2 14-3 22-2', 2, .5),
    '🦉': paint('M10 14L18 22L14 28zM54 14L46 22L50 28z', C.brown) + paint('M32 12C48 12 54 26 54 38C54 52 44 58 32 58C20 58 10 52 10 38C10 26 16 12 32 12z', C.brown, { dk: '#7d553a', sw: 2 }) + paint('M20 40C20 50 26 56 32 56C38 56 44 50 44 40C40 36 24 36 20 40z', C.sand) + paint(ell(23, 28, 8), C.cream) + paint(ell(41, 28, 8), C.cream) + dot(23, 28, 3.4) + dot(41, 28, 3.4) + dot(24.4, 26.6, 1.1, '#fff') + dot(42.4, 26.6, 1.1, '#fff') + paint('M29 34L35 34L32 40z', C.orange) + line('M26 46l2 2M32 46l2 2M38 46l-2 2', '#a88458', 1.4),
    '🕊': paint('M8 36C16 28 30 30 38 33C44 25 52 23 58 25C54 29 50 35 46 39C40 47 26 49 18 45L6 48L12 41z', C.white, { dk: '#9fb3c8', sw: 2 }) + paint('M26 33C22 21 28 10 42 7C41 18 39 27 34 33z', C.white, { dk: '#9fb3c8', sw: 1.8 }) + paint('M58 25L63 26L58 28z', C.orange) + dot(53, 26, 1.5) + brush('M60 30C56 36 52 40 46 42', C.leaf, 1.8) + leaf(56, 33, 120, 7, 2.6, C.leaf, false) + leaf(52, 37, 120, 7, 2.6, C.sage, false),
    '🪁': brush('M32 46C26 52 36 54 30 60', C.gray, 1.8) + paint('M32 4L54 24L32 46L10 24z', C.rose, { sw: 1.8 }) + paint('M32 4L54 24L32 24z', C.butter) + paint('M32 24L32 46L10 24z', C.sky) + line('M32 4V46M10 24H54', shade(C.rose, .4), 1.4) + paint('M26 52L30 54L26 56z', C.leaf) + paint('M34 56L30 58L34 60z', C.lav),
  });
})();
