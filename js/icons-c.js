/* Painted icons, set C: objects, tools, time, places and symbols, in the mascot's watercolor style. */
(function () {
  const { paint, ell, rr, hi, line, brush, dot, face, C } = UZHU_ICONS.kit;
  const g = (t, s) => `<g transform="${t}">${s}</g>`;
  const ln = (d, c, w = 2.4) => line(d, c, w);
  // Filled triangle arrowhead pointing along angle a (degrees) with its tip at (x, y).
  const head = (x, y, a, c, s = 9) => {
    const r = a * Math.PI / 180, b = (s * .9);
    const bx = x - Math.cos(r) * s * 1.1, by = y - Math.sin(r) * s * 1.1;
    const px = -Math.sin(r) * b, py = Math.cos(r) * b;
    const f = v => v.toFixed(1);
    return paint(`M${f(x)} ${f(y)}L${f(bx + px)} ${f(by + py)}L${f(bx - px)} ${f(by - py)}Z`, c, { sw: 1 });
  };
  const poly = (pts) => 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z';
  const octagon = (cx, cy, r) => poly([...Array(8)].map((_, k) => { const a = (22.5 + 45 * k) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }));
  const spiral = (() => {
    let d = '';
    for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 4.2, r = 3 + i * .36; d += (i ? 'L' : 'M') + (32 + r * Math.cos(t)).toFixed(1) + ' ' + (32 + r * Math.sin(t)).toFixed(1); }
    return d;
  })();

  // Shared parts
  const envelope = (c) => paint(rr(6, 14, 52, 38, 6), c) + ln('M9 18L32 36L55 18', '#b07c6a', 2.6) + hi('M12 47h12', 2, .5);
  const mag = (flip) => {
    const s = brush('M39 39L55 55', C.cocoa, 9) + paint(ell(26, 26, 18), C.sky, { op: .7 }) + brush(ell(26, 26, 17), C.orange, 5.5) + hi('M16 22a11 11 0 0 1 8 -8', 3, .85);
    return flip ? g('translate(64 0) scale(-1 1)', s) : s;
  };
  const house = (garden) => (garden ? paint('M2 52Q32 44 62 52V60H2Z', C.sage) + paint(ell(53, 40, 8, 10), C.leaf) + brush('M53 48V56', C.cocoa, 3) : '') +
    paint(rr(garden ? 9 : 13, 28, garden ? 34 : 38, garden ? 26 : 28, 3), C.butter) +
    paint(garden ? 'M3 33L26 10L49 33Z' : 'M6 32L32 8L58 32Z', C.red) +
    paint(rr(garden ? 22 : 27, garden ? 38 : 40, 10, garden ? 16 : 16, 4), C.brown) +
    (garden ? '' : paint(rr(39, 34, 8, 8, 2), C.sky)) + hi(garden ? 'M10 30L24 16' : 'M14 28L30 13', 2.4, .55);
  const phoneBody = (x) => paint(rr(x, 5, 26, 54, 7), C.cocoa) + paint(rr(x + 3.5, 11, 19, 38, 3), C.sky, { po: .2 }) + dot(x + 13, 54, 2, C.cream) + face(x + 13, 27, .7, 'happy');
  const note = (x, y) => paint(ell(x, y, 6.5, 5), C.lav, { po: .5 }) + brush(`M${x + 5.5} ${y - 1}V${y - 30}`, '#9d8ac9', 3.4);
  const letterBadge = (c, inner) => paint(rr(5, 9, 54, 46, 10), c) + inner;
  const chart = (d, c, tipX, tipY, ang) => paint(rr(6, 6, 52, 52, 9), C.cream) + ln('M14 14V50H52', '#b9a58c', 2.6) + brush(d, c, 5) + head(tipX, tipY, ang, c, 7);
  const statusDot = c => paint(ell(32, 32, 24), c) + hi('M18 26a15 15 0 0 1 10 -10', 4, .7);

  UZHU_ICONS.add({
    '📖': paint('M3 19V56H61V19Z', C.rose) +
      paint('M32 17C24 12 14 12 6 15V51C14 48 24 48 32 53Z', C.cream) + paint('M32 17C40 12 50 12 58 15V51C50 48 40 48 32 53Z', C.cream) +
      ln('M12 24C18 22 22 22 27 24M12 32C18 30 22 30 27 32M37 24C42 22 46 22 52 24M37 32C42 30 46 30 52 32', '#c9ae8a', 2.2) + ln('M32 18V52', '#c9ae8a', 1.8),
    '💡': brush('M10 18L5 15M54 18L59 15M8 34H3M56 34H61', C.gold, 3) +
      paint('M32 5a19 19 0 0 1 12 34q-3 3 -3 7h-18q0 -4 -3 -7A19 19 0 0 1 32 5z', C.butter) + paint(rr(22, 45, 20, 13, 4), C.gray) +
      ln('M23 51H41', '#9b918c', 2) + face(32, 23, .85, 'happy') + hi('M19 18a14 14 0 0 1 8 -8', 3, .8),
    '⏱': paint(rr(27, 4, 10, 8, 3), C.rose) + brush('M50 16L54 12', C.gray, 4) + paint(ell(32, 37, 22), C.sky) + paint(ell(32, 37, 16), C.white, { po: .15 }) +
      ln('M32 37V26M32 37L39 41', C.ink, 3) + dot(32, 37, 2.6, C.red) + hi('M17 30a16 16 0 0 1 7 -9', 2.6, .7),
    '📝': paint(rr(8, 6, 40, 52, 5), C.cream) + ln('M15 18H40M15 26H40M15 34H32M15 42H28', '#c9ae8a', 2.4) +
      g('rotate(40 46 38)', paint(rr(41, 14, 10, 34, 3), C.butter) + paint('M41 48H51L46 60Z', C.sand) + paint(rr(41, 9, 10, 7, 3), C.pink) + dot(46, 58, 1.6)),
    '✉': envelope(C.cream),
    '📊': paint(rr(6, 6, 52, 52, 10), C.cream) + paint(rr(13, 32, 10, 18, 3), C.sky) + paint(rr(27, 20, 10, 30, 3), C.rose) + paint(rr(41, 26, 10, 24, 3), C.sage) + ln('M11 51H53', '#b9a58c', 2.4),
    '⏰': paint(ell(14, 14, 9), C.butter) + paint(ell(50, 14, 9), C.butter) + brush('M16 56L12 60M48 56L52 60', C.cocoa, 3.6) +
      paint(ell(32, 36, 22), C.red) + paint(ell(32, 36, 16), C.white, { po: .15 }) + ln('M32 36V25M32 36L40 36', C.ink, 3) + dot(32, 36, 2.2) + hi('M16 27a18 18 0 0 1 8 -9', 2.6, .7),
    '⚡': paint('M38 3L11 36H29L23 61L53 25H35Z', C.butter, { dk: '#c99a2a' }) + hi('M33 11L19 31', 2.6, .75),
    '📜': paint(rr(14, 10, 36, 44, 3), C.cream) + paint(rr(8, 5, 48, 11, 5.5), C.sand) + paint(rr(8, 48, 48, 11, 5.5), C.sand) +
      ln('M20 24H44M20 31H44M20 38H36', '#c9ae8a', 2.4) + hi('M12 9H40', 2, .6),
    '🔁': brush('M12 36V30a9 9 0 0 1 9 -9H44', C.blue, 6) + head(56, 21, 0, C.blue, 9) + brush('M52 28V34a9 9 0 0 1 -9 9H20', C.blue, 6) + head(8, 43, 180, C.blue, 9),
    '🔄': brush('M47 16A20 20 0 0 0 13 26', C.blue, 6) + head(51, 26, 70, C.blue, 9) + brush('M17 48A20 20 0 0 0 51 38', C.blue, 6) + head(13, 38, 250, C.blue, 9),
    '🔀': brush('M6 44H18C30 44 32 20 44 20H48', C.blue, 5.5) + head(59, 20, 0, C.blue, 9) + brush('M6 20H18C30 20 32 44 44 44H48', C.sky, 5.5) + head(59, 44, 0, C.sky, 9),
    '➡': paint('M6 25H34V12L60 32L34 52V39H6Z', C.blue) + hi('M10 29H32', 2.6, .6),
    '🛋': paint(rr(12, 14, 40, 26, 9), C.sage) + paint(rr(6, 32, 52, 16, 6), C.sage, { dk: '#6f9466' }) + paint(rr(3, 26, 12, 22, 6), C.leaf) + paint(rr(49, 26, 12, 22, 6), C.leaf) +
      brush('M12 50V56M52 50V56', C.cocoa, 4) + paint(ell(24, 30, 7, 5), C.pink),
    '🔒': brush('M20 30V21a12 12 0 0 1 24 0V30', C.gray, 6) + paint(rr(11, 28, 42, 30, 8), C.gold) + dot(32, 40, 3.4) + brush('M32 41V49', C.ink, 3) + hi('M16 33H26', 2.6, .7),
    '📋': paint(rr(9, 9, 46, 51, 7), C.brown) + paint(rr(15, 16, 34, 38, 3), C.cream) + paint(rr(23, 4, 18, 11, 4), C.gray) +
      ln('M20 26l3 3 5 -6M32 27H43M20 37l3 3 5 -6M32 38H43M20 47H43', '#a07e6a', 2.2),
    '📅': paint(rr(7, 10, 50, 48, 8), C.cream) + paint('M7 24V18a8 8 0 0 1 8 -8h34a8 8 0 0 1 8 8V24Z', C.red) +
      brush('M21 5V14M43 5V14', C.ink, 3.4) + [18, 29, 40].map(x => [32, 42].map(y => dot(x + 3, y, 2.6, '#c9ae8a')).join('')).join('') + paint(ell(46, 46, 4), C.rose),
    '🔍': mag(false),
    '🔎': mag(true),
    '✅': paint(rr(6, 6, 52, 52, 14), C.leaf) + line('M18 33L28 43L46 22', C.white, 7) + hi('M12 18a8 8 0 0 1 6 -6', 2.4, .5),
    '🛒': ln('M4 12H13L21 42H50', C.ink, 3.2) + paint('M15 18H58L51 38H20Z', C.sky) + paint(ell(29, 15, 7), C.red) + paint(ell(42, 14, 6), C.butter) + brush('M29 8L31 5', C.leaf, 2.6) +
      paint(ell(24, 51, 5), C.cocoa) + paint(ell(47, 51, 5), C.cocoa),
    '🎧': brush('M12 38V32a20 20 0 0 1 40 0V38', C.lav, 6) + paint(rr(5, 32, 15, 23, 7), C.rose) + paint(rr(44, 32, 15, 23, 7), C.rose) + hi('M9 38V46M48 38V46', 2.2, .6),
    '🛠': brush('M18 18L50 52', C.brown, 6) + brush('M14 52L44 22', C.gray, 6.5) + brush('M52 9A9 9 0 1 0 55 22', C.gray, 6) +
      paint('M6 18L18 6L29 17L17 29Z', '#9e8f88') + hi('M10 18L18 10', 2, .6),
    '🎨': paint('M32 6C14 6 4 18 4 32C4 48 18 58 32 58C38 58 41 54 38 49C36 45 38 41 44 41H50C57 41 60 37 60 30C60 16 48 6 32 6Z', C.sand) +
      paint(ell(18, 26, 5), C.red) + paint(ell(29, 16, 5), C.butter) + paint(ell(43, 18, 5), C.blue) + paint(ell(16, 41, 5), C.leaf) + paint(ell(28, 47, 4), C.lav) + dot(46, 30, 3.6, '#c4a47c'),
    '🏠': house(false),
    '🏡': house(true),
    '🔬': paint(rr(8, 52, 46, 8, 4), C.gray) + brush('M38 50C52 44 52 26 40 18', C.cocoa, 5) + brush('M16 42H44', C.gray, 4.5) +
      g('rotate(-28 30 24)', paint(rr(24, 6, 12, 32, 4), C.sky) + paint(rr(22, 2, 16, 7, 3), C.blue)) + paint(ell(30, 47, 5, 3), C.mint),
    '🧭': paint(ell(32, 32, 27), C.gold) + paint(ell(32, 32, 20), C.cream, { po: .2 }) + paint('M32 13L38 32H26Z', C.red) + paint('M26 32H38L32 51Z', C.gray) + dot(32, 32, 2.6) + hi('M13 22a21 21 0 0 1 9 -9', 2.6, .7),
    '🛡': paint('M32 4L56 12V30C56 46 44 56 32 60C20 56 8 46 8 30V12Z', C.blue) + paint('M32 12L48 17V30C48 41 41 48 32 51C23 48 16 41 16 30V17Z', C.sky, { po: .2 }) +
      paint('M32 25c-3 -5 -10 -3 -10 2c0 5 6 9 10 12c4 -3 10 -7 10 -12c0 -5 -7 -7 -10 -2z', C.white, { po: .2 }),
    '💌': envelope(C.pink) + paint('M32 33c-3 -6 -12 -4 -12 2c0 6 7 10 12 14c5 -4 12 -8 12 -14c0 -6 -9 -8 -12 -2z', C.red),
    '🟢': statusDot(C.leaf),
    '🟡': statusDot(C.gold),
    '🔴': statusDot(C.red),
    '🟤': statusDot(C.brown),
    '🛏': paint(rr(4, 14, 11, 44, 4), C.brown) + paint(rr(8, 34, 52, 14, 4), C.cream) + paint('M28 30H58a2 2 0 0 1 2 2V46H28Z', C.lav) + paint(ell(20, 30, 8, 5), C.white) +
      brush('M56 50V57', C.cocoa, 4),
    '⏳': paint(rr(11, 4, 42, 7, 3.5), C.brown) + paint(rr(11, 53, 42, 7, 3.5), C.brown) +
      paint('M17 11H47C47 24 36 28 36 32C36 36 47 40 47 53H17C17 40 28 36 28 32C28 28 17 24 17 11Z', C.sky, { op: .5, po: .15 }) +
      paint('M22 17H42C41 24 34 27 32 29C30 27 23 24 22 17Z', C.butter) + paint('M20 52Q32 38 44 52Z', C.butter) + ln('M32 30V44', C.gold, 1.8),
    '📔': paint(rr(12, 5, 42, 54, 6), C.rose) + paint(rr(12, 5, 9, 54, 4), '#c97683') + paint(rr(27, 15, 21, 11, 3), C.cream) +
      paint(ell(37, 41, 6), C.butter) + [0, 72, 144, 216, 288].map(a => dot(37 + 9 * Math.cos(a * Math.PI / 180), 41 + 9 * Math.sin(a * Math.PI / 180), 2.4, C.pink)).join(''),
    '🩺': brush('M16 6V22a10 10 0 0 0 20 0V6', C.gray, 4) + dot(16, 6, 3, C.ink) + dot(36, 6, 3, C.ink) +
      brush('M26 32V42C26 56 48 56 48 42V36', C.blue, 4) + paint(ell(48, 29, 8), C.gray) + paint(ell(48, 29, 4), C.sky),
    '🧰': brush('M22 22V15H42V22', C.gray, 5) + paint(rr(5, 21, 54, 35, 7), C.red) + paint(rr(5, 21, 54, 12, 6), '#d9665c') +
      paint(rr(26, 29, 12, 9, 2.5), C.gold) + hi('M10 26H22', 2.6, .65) + brush('M5 33H59', '#b9554c', 1.6),
    '❓': brush('M21 21a11 11 0 1 1 16 10c-4 2 -5 5 -5 9', C.red, 8) + paint(ell(32, 53, 5.5), C.red),
    '🔤': letterBadge(C.sky, ln(ell(15, 34, 5, 5.5) + 'M20 28.5V39.5M27 21V39.5' + ell(32, 34, 5, 5.5) + 'M50 30a6 6 0 1 0 0 8', C.ink, 3)),
    '🔠': letterBadge(C.lav, ln('M11 43L19 21L27 43M14 36H24M33 21V43H40a5.5 5.5 0 0 0 0 -11H33M33 32H39a5.5 5.5 0 0 0 0 -11H33', C.ink, 3.2) + ln('M55 24a7 7 0 1 0 0 15', C.ink, 3.2)),
    '🔢': letterBadge(C.mint, ln('M11 25L17 21V43M25 26a6 6 0 1 1 10 5L25 43H37M43 22H53L46 30a6 6 0 1 1 -4 11', C.ink, 3.2)),
    '🔗': g('rotate(-40 32 32)', brush(rr(4, 24, 30, 16, 8), C.gray, 6) + brush(rr(30, 24, 30, 16, 8), C.blue, 6)),
    '🌀': brush(spiral, C.blue, 5),
    '📏': g('rotate(-35 32 32)', paint(rr(2, 21, 60, 22, 3), C.butter) + ln('M10 21V30M18 21V27M26 21V30M34 21V27M42 21V30M50 21V27', C.cocoa, 2)),
    '📱': phoneBody(19),
    '📲': phoneBody(33) + brush('M3 32H20', C.red, 5) + head(30, 32, 0, C.red, 8),
    '📵': phoneBody(19) + brush(ell(32, 32, 26), C.red, 5) + brush('M14 14L50 50', C.red, 5),
    '🕯': paint(rr(21, 26, 22, 33, 5), C.pink) + paint('M21 30a5 5 0 0 1 5 -4h12a5 5 0 0 1 5 4v4q-3 4 -5 0q-3 6 -6 0q-3 4 -6 0q-3 5 -5 0z', C.cream) +
      ln('M32 26V20', C.ink, 2) + paint('M32 4C39 12 39 19 32 21C25 19 25 12 32 4Z', C.orange) + paint('M32 11C35 15 35 18 32 19C29 18 29 15 32 11Z', C.butter, { po: 0 }) + face(32, 42, .75, 'calm'),
    '🎒': brush('M24 14V9a8 8 0 0 1 16 0V14', C.cocoa, 4) + paint(rr(11, 13, 42, 46, 14), C.orange) + paint(rr(18, 36, 28, 17, 6), '#e48f4b') +
      brush('M26 42H38', C.butter, 3) + hi('M17 24V32', 2.6, .6),
    '➕': paint('M26 7H38V26H57V38H38V57H26V38H7V26H26Z', C.leaf) + hi('M30 11V24', 2.2, .55),
    '📞': paint('M14 8C9 10 5 15 7 23C11 39 25 53 41 57C49 59 54 55 56 50L46 40L38 45C31 41 23 33 19 26L24 18Z', C.red) + hi('M11 16C10 20 12 25 14 29', 2.4, .6),
    '📍': ln('M32 34V60', '#8c8380', 3.2) + paint(ell(32, 21, 15), C.red) + hi('M24 16a8 8 0 0 1 6 -5', 3, .8),
    '📌': g('rotate(32 32 32)', ln('M32 44V62', '#8c8380', 3) + paint(ell(32, 41, 14, 5), C.red) + paint(rr(26, 18, 12, 22, 4), C.red) + paint(ell(32, 16, 11, 5), C.red) + hi('M29 22V34', 2.2, .7)),
    '🖼': paint(rr(5, 9, 54, 46, 5), C.gold) + paint(rr(12, 16, 40, 32, 2), C.sky, { po: .2 }) + paint('M12 48V40L24 28L36 40L42 34L52 44V48Z', C.sage) + paint(ell(42, 24, 4), C.butter),
    '🚦': paint(rr(19, 3, 26, 58, 9), '#8f8682') + paint(ell(32, 15, 6.5), C.red) + paint(ell(32, 32, 6.5), C.gold) + paint(ell(32, 49, 6.5), C.leaf),
    '🧮': brush(rr(7, 8, 50, 48, 4), C.brown, 4.5) + ln('M9 20H55M9 32H55M9 44H55', '#a07e6a', 1.8) +
      [[C.red, 20, [14, 20, 26]], [C.butter, 32, [14, 20, 44]], [C.sky, 44, [14, 38, 44, 50]]].map(([c, y, xs]) => xs.map(x => paint(ell(x, y, 3.6, 4.2), c, { sw: 1 })).join('')).join(''),
    '📷': paint(rr(20, 11, 15, 9, 3), C.gray) + paint(rr(5, 17, 54, 38, 8), C.gray, { dk: '#8c8380' }) + paint(ell(32, 36, 13), C.cocoa) + paint(ell(32, 36, 8), C.sky) +
      hi('M28 32a5 5 0 0 1 4 -3', 2.2, .8) + paint(ell(50, 25, 3), C.butter),
    '📚': paint(rr(6, 14, 13, 44, 3), C.rose) + paint(rr(20, 8, 13, 50, 3), C.sky) + g('rotate(14 46 58)', paint(rr(37, 12, 13, 46, 3), C.sage)) +
      ln('M8 22H17M8 50H17M22 16H31M22 50H31', C.white, 2) + paint(ell(32, 59, 28, 2), C.sand, { po: 0 }),
    '🔔': paint('M32 7C20 7 15 17 15 30V40L9 48H55L49 40V30C49 17 44 7 32 7Z', C.gold) + paint(ell(32, 53, 5.5), C.orange) + dot(32, 6, 3, C.cocoa) +
      face(32, 30, .85, 'happy') + hi('M20 24a12 12 0 0 1 6 -10', 2.6, .7),
    '🖨': paint(rr(16, 6, 32, 20, 2), C.white) + paint(rr(5, 22, 54, 24, 7), C.gray, { dk: '#8c8380' }) + paint(rr(15, 38, 34, 22, 2), C.white) +
      ln('M21 46H43M21 52H37', '#c9ae8a', 2.2) + dot(50, 30, 2.6, C.leaf),
    '🪥': g('rotate(-40 32 32)', paint(rr(4, 28, 40, 9, 4.5), C.sky) + paint(rr(40, 27, 20, 11, 4), C.blue) + paint(rr(42, 15, 16, 12, 2), C.white) + ln('M46 17V25M50 17V25M54 17V25', C.sky, 1.6)),
    '🏷': paint('M7 31L29 9H55V35L33 57Z', C.sand) + paint(ell(46, 18, 4), C.white, { po: .2 }) + brush('M48 16C56 8 60 6 62 4', C.ink, 1.8) + hi('M14 31L30 15', 2.2, .55),
    '🗺': paint('M5 14L22 8L42 14L59 8V50L42 56L22 50L5 56Z', C.cream) + ln('M22 8V50M42 14V56', '#c9ae8a', 1.8) +
      paint('M9 22C14 18 19 22 18 28C16 34 10 32 9 28Z', C.sage) + paint('M44 34C50 30 56 34 54 40C52 46 46 44 44 40Z', C.sage) +
      ln('M15 42C24 44 28 30 36 30', C.red, 2.2) + brush('M47 20L53 26M53 20L47 26', C.red, 3),
    '📉': chart('M15 18L27 30L35 26L48 42', C.red, 52, 46, 50),
    '📈': chart('M15 44L27 32L35 36L48 20', C.leaf, 52, 16, -50),
    '✏': g('rotate(-45 32 32)', paint(rr(15, 26, 33, 12, 2), C.butter) + paint('M48 26L60 32L48 38Z', C.sand) + dot(58.5, 32, 2) + paint(rr(5, 26, 10, 12, 4), C.pink) + paint(rr(13, 26, 4, 12, 1), C.gray, { po: 0 })),
    '🪫': paint(rr(5, 16, 49, 32, 7), C.white) + paint(rr(54, 25, 6, 14, 2.5), C.gray) + paint(rr(10, 21, 9, 22, 3), C.red) + face(36, 29, .8, 'sad'),
    '💼': brush('M24 19V13H40V19', C.cocoa, 4.5) + paint(rr(5, 18, 54, 38, 7), C.brown) + brush('M5 33H59', '#946a4e', 2) + paint(rr(27, 29, 10, 9, 2.5), C.gold) + hi('M11 24H22', 2.4, .5),
    '🧪': g('rotate(28 32 32)', paint('M25 5H39V47a7 7 0 0 1 -14 0Z', C.white, { op: .6, po: .15 }) + paint('M25 28H39V47a7 7 0 0 1 -14 0Z', C.mint, { dk: '#5fa58f' }) +
      paint(rr(22, 2, 20, 6, 3), C.gray) + dot(30, 38, 2, C.white) + dot(34, 44, 1.6, C.white)),
    '🪑': paint(rr(17, 5, 30, 28, 7), C.brown) + paint(rr(13, 32, 38, 9, 3), C.sand) + brush('M17 42V59M47 42V59', C.cocoa, 4.5) + hi('M22 11V24', 2.4, .5),
    '🧱': [[6, 10, 24], [32, 10, 26], [6, 25, 13], [21, 25, 24], [47, 25, 11], [6, 40, 24], [32, 40, 26]].map(([x, y, w], i) => paint(rr(x, y, w, 13, 2.5), i % 2 ? C.red : C.orange, { sw: 1 })).join(''),
    '🗑': paint(rr(9, 11, 46, 7, 3.5), C.gray, { dk: '#8c8380' }) + brush('M26 11V7H38V11', '#8c8380', 3) + paint('M13 19H51L47 58H17Z', C.gray) + ln('M24 26L26 51M32 26V51M40 26L38 51', '#8c8380', 2.2),
    '⚠': paint('M28 8a5 5 0 0 1 8 0L59 49a5 5 0 0 1 -4 7H9a5 5 0 0 1 -4 -7Z', C.gold, { dk: '#c08d1f' }) + brush('M32 23V38', C.ink, 5.5) + dot(32, 47, 3.4),
    '💊': g('rotate(-40 32 32)', paint(rr(6, 21, 52, 22, 11), C.white) + paint('M32 21H17a11 11 0 0 0 0 22H32Z', C.rose) + hi('M14 27H26', 2.2, .7)),
    '🚩': brush('M15 5V60', C.cocoa, 4) + paint('M17 7L55 18L17 31Z', C.red) + hi('M21 12L34 16', 2, .55),
    '💾': paint('M6 12a6 6 0 0 1 6 -6H48L58 16V52a6 6 0 0 1 -6 6H12a6 6 0 0 1 -6 -6Z', C.blue) + paint(rr(17, 6, 26, 16, 2), C.gray) + paint(rr(34, 9, 5, 10, 1), C.cocoa, { po: 0 }) + paint(rr(14, 33, 36, 21, 3), C.white),
    '💰': paint('M22 21C9 30 6 52 20 57H44C58 52 55 30 42 21Z', C.sand) + paint('M24 8Q32 13 40 8L37 19H27Z', C.sand) + brush('M24 20H40', C.cocoa, 3.4) +
      paint(ell(46, 52, 8), C.gold) + face(31, 37, .9, 'happy'),
    '❌': brush('M14 14L50 50M50 14L14 50', C.red, 10),
    '🛑': paint(octagon(32, 32, 28), C.red) + paint(rr(15, 27, 34, 10, 4), C.white, { po: .2 }),
    '🎶': note(18, 50) + note(44, 42) + brush('M23.5 20L49.5 12', '#9d8ac9', 6),
    '🎵': note(25, 50) + brush('M30.5 20C40 22 44 28 42 36', '#9d8ac9', 4),
    '📦': paint('M7 20L32 10L57 20L32 30Z', C.sand) + paint('M7 20L32 30V59L7 48Z', C.sand, { dk: '#ad8a5c' }) + paint('M57 20L32 30V59L57 48Z', C.brown) +
      ln('M19 15L44 25V34', '#9b7a54', 3),
    '🕵': paint(ell(32, 41, 19, 18), C.peach) + face(32, 41, 1, 'flat') + paint(ell(32, 25, 25, 5), C.cocoa) + paint('M17 25C17 12 22 8 32 8C42 8 47 12 47 25Z', C.cocoa) +
      brush('M17 21H47', C.butter, 2.6),
    '🔦': g('rotate(-30 32 32)', paint('M44 22L62 12V52L44 42Z', C.butter, { op: .45, po: 0 }) + paint(rr(6, 26, 28, 12, 4), C.blue) + paint('M32 22H44V42H32Z', C.sky) + dot(18, 32, 2.4, C.butter)),
    '🗳': paint(rr(20, 6, 24, 30, 2), C.white) + ln('M26 20l4 4 8 -9', C.leaf, 3) + paint(rr(6, 30, 52, 28, 5), C.sky) + paint(rr(14, 30, 36, 4, 2), C.cocoa, { po: 0 }),
    '🧳': brush('M25 15V9H39V15', C.cocoa, 4) + paint(rr(12, 14, 40, 40, 8), C.orange) + ln('M22 20V48M42 20V48', '#c97a36', 3) + paint(ell(20, 58, 3.6), C.cocoa) + paint(ell(44, 58, 3.6), C.cocoa) + hi('M17 22V32', 2.2, .55),
    '🧼': paint(rr(6, 26, 46, 28, 11), C.pink) + face(29, 38, .9, 'happy') + paint(ell(50, 18, 7), C.white, { dk: '#86a9c9' }) + paint(ell(38, 12, 4.5), C.white, { dk: '#86a9c9' }) + paint(ell(57, 32, 3.6), C.white, { dk: '#86a9c9' }),
    '🧩': paint('M8 20H22a7 7 0 1 1 13 0H50V33a7 7 0 1 1 0 13V58H8V46a7 7 0 1 0 0 -13Z', C.leaf) + hi('M14 26V34', 2.4, .55),
    '⏲': paint(rr(28, 6, 8, 8, 3), C.cocoa) + paint(ell(32, 37, 22), C.orange) + paint(ell(32, 37, 16), C.white, { po: .15 }) +
      ln('M32 24V27M45 37H42M32 50V47M19 37H22', '#c9ae8a', 2.4) + ln('M32 37L40 29', C.ink, 3) + dot(32, 37, 2.6),
    '🚀': g('rotate(45 32 32)', paint('M32 3C44 13 46 30 42 46H22C18 30 20 13 32 3Z', C.white) + paint('M22 34L12 48L22 46Z', C.red) + paint('M42 34L52 48L42 46Z', C.red) +
      paint(ell(32, 22, 6), C.sky) + paint('M25 47H39L32 62Z', C.orange) + paint('M28 47H36L32 56Z', C.butter, { po: 0 })),
    '🆘': paint(rr(3, 12, 58, 40, 11), C.red, { dk: '#b84a42' }) + line('M19 25.5C17 23 10 23 10 27.5C10 32 19 30.5 19 35.5C19 40.5 11 40.5 9 37.5', C.white, 3.8) +
      line(ell(32, 31.8, 5.2, 7.6), C.white, 3.8) + line('M55 25.5C53 23 46 23 46 27.5C46 32 55 30.5 55 35.5C55 40.5 47 40.5 45 37.5', C.white, 3.8),
  });
})();
