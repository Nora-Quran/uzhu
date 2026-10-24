/* Painted icons, set B: faces and moods, people, hands and body, hearts, celebration and sports. */
(function () {
  const { paint, ell, rr, hi, line, brush, dot, face, C } = UZHU_ICONS.kit;
  const INK = UZHU_ICONS.kit.INK || '#5b4343', BL = UZHU_ICONS.kit.BLUSH || '#f29aa5';
  const g = (t, s) => `<g transform="${t}">${s}</g>`;
  const eo = s => s.replace(/<path d=/g, '<path fill-rule="evenodd" d=');
  const L = (d, w = 3, c = INK) => line(d, c, w);

  /* ---------- round mood faces (bold strokes so they read at 18px) ---------- */
  const blob = (c = C.butter) => paint(ell(32, 33, 25, 24), c, { sw: 1.8 }) + hi('M15 24q3-10 14-13', 3, .6);
  const cheeks = (op = .7) => `<ellipse cx="15.5" cy="39" rx="4.6" ry="2.8" fill="${BL}" opacity="${op}"/><ellipse cx="48.5" cy="39" rx="4.6" ry="2.8" fill="${BL}" opacity="${op}"/>`;
  const E = {
    dot: dot(23, 30, 3.2) + dot(41, 30, 3.2),
    big: dot(23, 29, 3.8) + dot(41, 29, 3.8) + dot(24.3, 27.6, 1.3, '#fff') + dot(42.3, 27.6, 1.3, '#fff'),
    up: L('M17.5 31q5.5-7 11 0') + L('M35.5 31q5.5-7 11 0'),        // ∩ happy closed
    down: L('M17.5 29q5.5 5.5 11 0') + L('M35.5 29q5.5 5.5 11 0'),   // u calm / sleeping
    low: L('M18 31q5 3.5 10 0') + L('M36 31q5 3.5 10 0'),             // droopy lids
    x: L('M18.5 25.5l7.5 4.5-7.5 4.5') + L('M45.5 25.5l-7.5 4.5 7.5 4.5'),
  };
  const B = {
    worried: L('M17 23l9-4', 2.6) + L('M47 23l-9-4', 2.6),
    sad: L('M18 22l8-3.5', 2.6) + L('M46 22l-8-3.5', 2.6),
    angry: L('M17 20l10 5', 3) + L('M47 20l-10 5', 3),
    think: L('M17 22q5-4 10-1', 2.6) + L('M37 19l10 1', 2.6),
  };
  const M = {
    smile: L('M24 40q8 7.5 16 0', 3.2),
    small: L('M26 41q6 4.5 12 0', 3),
    grin: `<path d="M21 39h22q0 11-11 11t-11-11z" fill="${INK}"/><path d="M26 46.5q6-4 12 0q-2 3-6 3t-6-3z" fill="#e88a98"/>`,
    flat: L('M24.5 42.5h15', 3.2),
    slant: L('M25 45l14-4.5', 3.2),
    sad: L('M24 47q8-8 16 0', 3.2),
    frown: L('M26 46q6-5 12 0', 3),
    yawn: `<ellipse cx="32" cy="44" rx="6" ry="7" fill="${INK}"/><ellipse cx="32" cy="48" rx="3.6" ry="2.4" fill="#e88a98"/>`,
    wail: `<path d="M23 48q0-8 9-8t9 8z" fill="${INK}"/><path d="M27 48q5-3.4 10 0z" fill="#e88a98"/>`,
    zig: L('M23 44l4.5-3 4.5 3 4.5-3 4.5 3', 2.8),
    wavy: L('M23 44q3-3 6 0t6 0 6 0', 2.8),
    bite: L('M27 43q5-2 10 0', 2.6),
  };
  const F = (c, ...parts) => blob(c) + parts.join('');
  const tear = (x, y, s = 1) => g(`translate(${x} ${y}) scale(${s})`, paint('M0 -7q6 8 4.5 11a4.6 4.6 0 0 1-9 0Q-6 1 0-7z', C.sky, { sw: 1.4 }) + hi('M-1.5 2q0 2 1.6 2.6', 1.6, .8));
  const zz = L('M44 6h11l-11 12h11', 3.2, C.blue) + L('M52 23h7l-7 7.5h7', 2.6, C.blue);
  const mitt = (x, y, r = 0, c = C.peach) => g(`translate(${x} ${y}) rotate(${r})`, paint(rr(-6.5, -7, 13, 14, 6.5), c, { sw: 1.4 }));

  /* ---------- hearts ---------- */
  const HP = 'M32 55C15 44 6 34 7.5 23.5 9 14 20 9.5 27.5 15.5L32 20l4.5-4.5C44 9.5 55 14 56.5 23.5 58 34 49 44 32 55z';
  const heart = (c, o = {}) => paint(HP, c, Object.assign({ sw: 2 }, o)) + hi('M15 22q2-6 8-6.5', 3.2, o.hiop ?? .75);
  const smallHeart = (x, y, s, c) => g(`translate(${x} ${y}) scale(${s}) translate(-32 -32)`, paint(HP, c, { sw: 2.4 }));

  /* ---------- little people (round mascot-like figures) ---------- */
  const head = (x, y, r = 9, mood = 'happy', s = .62) => paint(ell(x, y, r), C.peach, { sw: 1.4 }) + face(x, y + .5, s, mood);
  const legs = (d, c = C.cocoa, w = 4.6) => brush(d, c, w);

  /* ---------- hands ---------- */
  const palm = (c = C.peach) => paint(rr(19, 30, 26, 25, 11), c, { sw: 1.6 });
  const fing = (d, w = 7.4) => brush(d, C.peach, w);
  const openHand = fing('M24.5 34V15') + fing('M31 33V10.5') + fing('M37.5 34V13') + fing('M43 37V20', 6.6) + fing('M21 44l-8.5-9', 7) + palm() +
    L('M26 47q6 3 12 0', 1.6, '#c98a6e');

  /* ---------- medals ---------- */
  const ribbon = paint('M17 3h11l8 23H25z', C.blue, { sw: 1.4 }) + paint('M47 3H36l-8 23h11z', C.rose, { sw: 1.4 });
  const medal = (c, inner) => ribbon + paint(ell(32, 41, 16.5), c, { sw: 2 }) + paint(ell(32, 41, 11), C.white, { po: .15, op: .35, sw: 1 }) + inner + hi('M21 35q2-5 6-6.5', 2.6, .7);
  const STAR = 'M32 32l2.8 5.6 6.2.9-4.5 4.4 1.1 6.2L32 46.2l-5.6 2.9 1.1-6.2-4.5-4.4 6.2-.9z';

  // gear outline with 8 teeth, plus the centre hole (drawn even-odd)
  const gear = (() => {
    let d = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, P = (r, da) => [32 + r * Math.cos(a + da), 32 + r * Math.sin(a + da)].map(v => v.toFixed(1)).join(' ');
      d += (i ? 'L' : 'M') + P(19, -.3) + 'L' + P(27, -.19) + 'L' + P(27, .19) + 'L' + P(19, .3) + 'L' + P(19, .48);
    }
    return d + 'z' + ell(32, 32, 7.5);
  })();

  // two bow loops (🎀 and the 🎁 bow)
  const bowLoops = (c, y = 0, s = 1) => g(`translate(32 ${y}) scale(${s})`, paint('M0 0C-6-9-20-14-22-5-24 3-12 7 0 0z', c, { sw: 1.6 }) + paint('M0 0C6-9 20-14 22-5 24 3 12 7 0 0z', c, { sw: 1.6 }));

  UZHU_ICONS.add({
    /* ===== moods (the 5-step scale is 😞 😕 😐 🙂 😄) ===== */
    '😞': F(C.peach, E.low, B.sad, M.sad, cheeks(.45)),
    '😕': F(C.peach, E.dot, B.worried, M.slant, cheeks(.55)),
    '😐': F(C.butter, E.dot, M.flat, cheeks(.55)),
    '🙂': F(C.butter, E.dot, M.smile, cheeks()),
    '😄': F(C.butter, E.up, M.grin, cheeks(.85)),
    '😊': F(C.butter, E.up, M.smile, cheeks(.95)),
    '😌': F(C.butter, E.down, M.small, cheeks()),
    '😴': paint(ell(29, 37, 23, 22), C.lav, { sw: 1.8 }) + hi('M13 30q3-9 12-12', 3, .6) + g('translate(-3 4)', E.down + cheeks(.75)) + `<ellipse cx="29" cy="48" rx="3.2" ry="2.6" fill="${INK}"/>` + zz,
    '🤔': F(C.butter, E.dot, B.think, M.bite, cheeks(.6)) + mitt(40, 54, -20) + brush('M36 52l-4-6', C.peach, 5),
    '😣': F(C.peach, E.x, M.zig, cheeks(.6)),
    '😫': F(C.peach, E.x, B.worried, M.wail, cheeks(.5)),
    '🤗': F(C.butter, E.up, M.smile, cheeks(.9)) + mitt(13, 50, 20) + mitt(51, 50, -20),
    '🥱': F(C.butter, E.down, M.yawn, cheeks(.6)) + tear(50, 30, .55),
    '😶': F(C.butter, E.dot, cheeks(.7)),
    '😔': F(C.peach, E.low, B.sad, M.frown, cheeks(.5)),
    '😢': F(C.peach, E.dot, B.sad, M.sad, cheeks(.5)) + tear(19, 42, .9),
    '😠': F(C.orange, E.dot, B.angry, M.sad),
    '😟': F(C.peach, E.big, B.worried, M.frown, cheeks(.5)),
    '🤢': F(C.sage, E.low, M.wavy, cheeks(.35)) + L('M22 52q10 3 20 0', 2, '#7f9b6f'),
    '🤕': F(C.butter, E.dot, M.frown, cheeks(.55)) + paint('M8 22q24-12 48 0v8q-24-11-48 0z', C.white, { dk: '#c9b2a8', sw: 1.6 }) +
      g('translate(46 21) rotate(-15)', paint(rr(-5, -2.5, 10, 5, 2), C.pink, { sw: 1 }) + paint(rr(-2.5, -5, 5, 10, 2), C.pink, { sw: 1 })),

    /* ===== hearts ===== */
    '❤': heart('#e8737a'),
    '💜': heart(C.lav),
    '💚': heart(C.leaf),
    '💛': heart(C.butter),
    '🤍': heart(C.white, { dk: '#bfa49c', sw: 2.6, po: .3 }),
    '🖤': heart('#6f4a3d', { po: .5, hiop: .35 }),
    '💗': heart(C.pink) + smallHeart(32, 34, .42, C.rose) + L('M4 12l5 4M58 10l-4 5M32 3v5', 2.6, C.rose),
    '🫀': brush('M27 16V6', C.red, 6) + brush('M35 17q2-9 10-10', '#d9a0a8', 6) + brush('M22 20q-6-4-8-11', C.sky, 5) +
      paint('M32 58C14 50 9 38 12 27 14.5 18 24 14 31 19 37 13 50 15 53 26 56 38 49 50 32 58z', '#e8737a', { sw: 2 }) +
      L('M38 24q-4 10 1 22', 2, '#b9515a') + hi('M17 30q1-6 6-8', 3, .7),

    /* ===== people ===== */
    '🧘': brush('M23 31q-9 7-13 15', C.peach, 4.6) + brush('M41 31q9 7 13 15', C.peach, 4.6) +
      paint('M21 46q0-20 11-20t11 20z', C.lav, { sw: 1.6 }) + paint(ell(32, 49, 23, 8), C.sky, { sw: 1.6 }) +
      dot(10, 46.5, 3.6, C.peach) + dot(54, 46.5, 3.6, C.peach) + head(32, 15, 10, 'calm', .7) + L('M29 32q3 2.5 6 0', 1.6, '#9b88c4'),
    '🧘‍♀': brush('M23 31q-9 7-13 15', C.peach, 4.6) + brush('M41 31q9 7 13 15', C.peach, 4.6) +
      paint('M21 46q0-20 11-20t11 20z', C.pink, { sw: 1.6 }) + paint(ell(32, 49, 23, 8), C.lav, { sw: 1.6 }) +
      dot(10, 46.5, 3.6, C.peach) + dot(54, 46.5, 3.6, C.peach) + paint(ell(32, 4.5, 4.8, 4), C.cocoa, { sw: 1 }) +
      paint('M21 15a11 11 0 0 1 22 0z', C.cocoa, { sw: 1 }) + head(32, 16, 10, 'calm', .7),
    '🚶': legs('M28 40l-7 17h-3') + legs('M35 40l6 16h4') + brush('M27 26l-6 12', C.peach, 4.2) + brush('M37 26l5 11', C.peach, 4.2) +
      paint(rr(24, 21, 15, 22, 7), C.sky, { sw: 1.6 }) + head(32, 12, 9),
    '🚶‍♀': legs('M28 44l-6 13h-3', C.peach, 4.2) + legs('M35 44l6 13h4', C.peach, 4.2) + brush('M27 26l-6 12', C.peach, 4.2) + brush('M37 26l5 11', C.peach, 4.2) +
      paint('M26 21h11l7 25H19z', C.rose, { sw: 1.6 }) + paint('M22 10q-5 6-2 13 3-3 4-8z', C.cocoa, { sw: 1 }) + paint('M23 11a9 9 0 0 1 18 0z', C.cocoa, { sw: 1 }) + head(32, 12, 9),
    '🏃': legs('M30 40l-10 6-6 9', C.cocoa, 4.6) + legs('M35 40l9 6 2 10h4') + brush('M30 26l-10 3-3 7', C.peach, 4.2) + brush('M39 25l8 6', C.peach, 4.2) +
      g('rotate(14 32 32)', paint(rr(26, 21, 15, 22, 7), C.orange, { sw: 1.6 })) + head(39, 12, 9) + L('M4 24h8M2 32h8M5 40h7', 2.6, C.sky),
    '🤸': g('rotate(-35 32 34)', brush('M32 22l-14-12', C.peach, 4.6) + brush('M32 22l14-12', C.peach, 4.6) + brush('M30 42l-12 14', C.cocoa, 4.6) + brush('M34 42l12 14', C.cocoa, 4.6) +
      paint(rr(25, 18, 14, 26, 7), C.mint, { sw: 1.6 })) + head(48, 38, 8.5) + dot(8, 14, 2.2, C.butter) + dot(54, 9, 2.2, C.rose),
    '💃': brush('M36 24l9-14', C.peach, 4.2) + brush('M28 26l-8 8', C.peach, 4.2) + legs('M29 48l-3 9', C.peach, 4) + legs('M36 48l5 8', C.peach, 4) +
      paint('M27 22h10l4 10 13 16q-20 6-42 0l15-16z', '#e8737a', { sw: 1.6 }) + L('M17 44q15 5 30 0', 2, '#c95860') +
      paint('M24 9a9 9 0 0 1 17-2q-4-1-9 1-5 2-8 1z', C.cocoa, { sw: 1 }) + head(32, 13, 8.5) + paint(ell(25, 8, 3), C.rose, { sw: 1 }),
    '🦸': paint('M23 22q-12 18-10 35h38q2-17-10-35z', '#e8737a', { sw: 1.6 }) + legs('M28 44v13', C.blue, 5) + legs('M36 44v13', C.blue, 5) +
      brush('M25 27l-6 9 6 4', C.peach, 4) + brush('M39 27l6 9-6 4', C.peach, 4) + paint(rr(24, 21, 16, 24, 7), C.sky, { sw: 1.6 }) +
      g('translate(32 32)', paint('M0-5 1.6-1.6 5-1.2 2.4 1.2 3 4.6 0 3 -3 4.6 -2.4 1.2 -5 -1.2 -1.6 -1.6z', C.butter, { sw: 1 })) + head(32, 12, 9) +
      `<path d="M23.5 10.5h17v3.6q-3 1.4-8.5-.6-5.5 2-8.5.6z" fill="${C.red}" opacity=".85"/>`,
    '🙆': brush('M24 30q-10-8-6-18 4-8 14-8', C.peach, 4.6) + brush('M40 30q10-8 6-18-4-8-14-8', C.peach, 4.6) +
      paint('M20 58q0-24 12-24t12 24z', C.mint, { sw: 1.6 }) + head(32, 22, 9.5),
    '💆‍♀': paint('M10 60q0-16 22-16t22 16z', C.lav, { sw: 1.6 }) + paint('M19 26a13 13 0 0 1 26 0v12h-26z', C.cocoa, { sw: 1 }) +
      paint(ell(32, 28, 12, 13), C.peach, { sw: 1.4 }) + face(32, 28.5, .75, 'calm') + paint('M19 16a13 12 0 0 1 26 0q-9-5-26 0z', C.cocoa, { sw: 1 }) +
      mitt(16, 30, 15, C.peach) + mitt(48, 30, -15, C.peach) + L('M8 16l-3-3M56 16l3-3', 2.4, C.butter),
    '👵': paint('M12 60q0-17 20-17t20 17z', C.lav, { sw: 1.6 }) + paint(ell(32, 7, 6, 5), C.gray, { sw: 1.2 }) + paint(ell(32, 27, 14, 15), C.gray, { sw: 1.2 }) +
      paint(ell(32, 30, 12, 12.5), C.peach, { sw: 1.4 }) + face(32, 30, .72, 'happy') +
      `<circle cx="27.7" cy="30" r="4.4" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="36.3" cy="30" r="4.4" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
    '👨‍👩‍👧': paint('M3 60q0-20 13-20t13 20z', C.sky, { sw: 1.4 }) + paint('M35 60q0-20 13-20t13 20z', C.rose, { sw: 1.4 }) + paint(ell(48, 18.5, 9.5, 8.6), C.cocoa, { sw: 1 }) +
      head(16, 28, 8.4, 'happy', .55) + head(48, 28, 8.4, 'happy', .55) + paint('M24 61q0-12 8-12t8 12z', C.butter, { sw: 1.4 }) + head(32, 42, 6.5, 'happy', .42),
    '👭': brush('M24 38q8 6 16 0', C.peach, 4) + legs('M14 50v8', C.peach, 4) + legs('M22 50v8', C.peach, 4) + legs('M42 50v8', C.peach, 4) + legs('M50 50v8', C.peach, 4) +
      paint('M13 24h10l5 27H8z', C.rose, { sw: 1.4 }) + paint('M41 24h10l5 27H36z', C.lav, { sw: 1.4 }) +
      paint(ell(18, 14, 9.5, 9), C.cocoa, { sw: 1 }) + head(18, 15, 8) + paint(ell(46, 14, 9.5, 9), C.brown, { sw: 1 }) + head(46, 15, 8),
    '👥': paint('M28 52q0-18 14-18t14 18z', C.gray, { sw: 1.4 }) + paint(ell(42, 22, 9), C.gray, { sw: 1.4 }) +
      paint('M6 58q0-20 16-20t16 20z', C.sky, { sw: 1.6 }) + paint(ell(22, 25, 10), C.sky, { sw: 1.6 }),

    /* ===== hands and body ===== */
    '✋': openHand,
    '👋': g('rotate(-18 32 40)', openHand) + L('M7 18q-4 7 0 14M50 6q7 2 10 9', 2.8, C.butter),
    '✌': fing('M28 33l-6-21') + fing('M36 33l6-21') + palm() + brush('M37 33h6', C.peach, 6.4) + brush('M22 43q8 0 14-6', '#e9a37f', 5.2) + L('M26 48q6 3 12 0', 1.6, '#c98a6e'),
    '👌': fing('M34 33V12') + fing('M40 34V14') + fing('M45 37V21', 6.6) + palm() + `<circle cx="21" cy="27" r="8" fill="none" stroke="${C.peach}" stroke-width="7"/>` +
      `<circle cx="21" cy="27" r="8" fill="none" stroke="#c98a6e" stroke-width="1.4" opacity=".6"/>`,
    '👏': g('translate(23 37) rotate(24)', paint(rr(-8, -16, 16, 31, 8), C.peach, { sw: 1.6 })) + g('translate(41 37) rotate(-24)', paint(rr(-8, -16, 16, 31, 8), C.peach, { sw: 1.6 })) +
      brush('M14 44l-6-6', C.peach, 6) + brush('M50 44l6-6', C.peach, 6) + L('M32 4v8M21 7l3.5 6M43 7l-3.5 6', 3, C.gold),
    '🤝': brush('M4 40h10', C.sky, 13) + brush('M60 40H50', C.rose, 13) +
      g('rotate(-8 30 38)', paint(rr(11, 30, 32, 15, 7.5), C.peach, { sw: 1.6 })) + paint('M24 42q-2-12 8-14l18 2q4 1 4 8v6q0 4-5 4H30q-6 0-6-6z', '#f3a882', { sw: 1.6 }) +
      L('M33 31v12M39 31v12M45 32v11', 2, '#c98a6e') + brush('M22 30q-2-7 4-9', C.peach, 5.6),
    '🙏': g('rotate(10 22 50)', paint(rr(12, 44, 18, 14, 5), C.lav, { sw: 1.4 })) + g('rotate(-10 42 50)', paint(rr(34, 44, 18, 14, 5), C.lav, { sw: 1.4 })) +
      paint('M31.5 6C24 8 18 22 16 36q-1 8 6 10l9.5 0z', C.peach, { sw: 1.8 }) + paint('M32.5 6C40 8 46 22 48 36q1 8-6 10l-9.5 0z', '#f3a882', { sw: 1.8 }) +
      L('M32 9v36', 1.8, '#c98a6e') + hi('M22 22q2-7 6-10', 2.4, .6) + L('M7 12l5 4M57 12l-5 4M6 28h6M58 28h-6', 2.6, C.butter),
    '✍': paint(rr(6, 30, 40, 28, 4), C.cream, { dk: '#c9b29a', sw: 1.8 }) + L('M12 42q4-5 8 0t8 0 8 0M12 50h18', 2.2, C.blue) +
      g('rotate(40 40 28)', paint(rr(35, 2, 10, 40, 3), C.butter, { sw: 1.6 }) + paint(rr(35, 2, 10, 7, 3), C.pink, { sw: 1.2 }) + paint('M35 41h10l-5 9z', C.sand, { sw: 1.2 }) + dot(40, 48, 1.8)),
    '👂': paint('M36 6C22 6 15 16 15 27c0 7 3 10 3 16 0 9 6 15 13 15 8 0 10-5 12-10 2-4 6-7 8-12 2-4 3-8 3-11C54 14 47 6 36 6z', C.peach, { sw: 1.8 }) +
      L('M27 29c0-7 4-12 10-12s9 5 9 10c0 5-5 7-7 10-2 3-1 6-4 7', 3, '#c98a6e') + hi('M20 22q2-7 9-10', 2.6, .7),
    '👅': paint('M14 12h36v20c0 14-8 24-18 24S14 46 14 32z', '#ef8e9c', { sw: 2 }) + L('M32 16v20', 3, '#c95f70') + hi('M20 20v10', 3, .65),
    '👀': paint(ell(20, 32, 13, 17), C.white, { dk: '#b9a29a', sw: 2.2, po: .3 }) + paint(ell(44, 32, 13, 17), C.white, { dk: '#b9a29a', sw: 2.2, po: .3 }) +
      dot(15, 34, 6.4) + dot(39, 34, 6.4) + dot(13, 31.5, 2, '#fff') + dot(37, 31.5, 2, '#fff'),
    '👣': g('rotate(-12 20 34)', paint(ell(20, 40, 8, 13), C.brown, { sw: 1.4 }) + dot(14, 23, 2.6, C.brown) + dot(19, 21, 2.8, C.brown) + dot(24.5, 22.5, 2.6, C.brown)) +
      g('rotate(12 44 28)', paint(ell(44, 32, 8, 13), C.brown, { sw: 1.4 }) + dot(38.5, 15, 2.6, C.brown) + dot(44, 13, 2.8, C.brown) + dot(49.5, 15, 2.6, C.brown)),
    '👟': paint('M6 38q2-14 12-18l8 1q4 8 14 9l14 4q6 3 5 10H6z', C.sky, { sw: 1.8 }) + paint(rr(4, 43, 57, 9, 4.5), C.white, { dk: '#a9b4c4', sw: 1.6, po: .3 }) +
      L('M24 25l6-2M27 30l6-2M31 34l5-2', 2.4, C.white) + paint(ell(12, 34, 4.5), C.rose, { sw: 1 }),
    '🩸': paint('M32 5C22 20 13 30 13 40a19 19 0 0 0 38 0C51 30 42 20 32 5z', '#e2636a', { sw: 2 }) + hi('M21 40q0 8 6 11', 3.4, .7),
    '🦴': g('rotate(-35 32 32)', paint('M14 26a7 7 0 1 1 6-9h24a7 7 0 1 1 6 9 7 7 0 1 1-6 9H20a7 7 0 1 1-6-9z', C.cream, { dk: '#c3aa8c', sw: 2 }) + hi('M22 21h18', 2.6, .8)),

    /* ===== celebration ===== */
    '🎉': paint('M6 58l13-34 21 21z', C.butter, { sw: 1.8 }) + L('M12 44l10 9M16 34l14 13', 3, C.rose) +
      brush('M34 26q4-14 16-14', C.lav, 3.4) + brush('M40 32q10-4 16 4', C.mint, 3.4) + brush('M28 20q-2-8 4-14', C.peach, 3.4) +
      dot(46, 6, 3, C.rose) + dot(57, 20, 3, C.sky) + dot(52, 47, 2.6, C.butter) + dot(20, 10, 2.6, C.leaf),
    '🎊': L('M32 2v8', 2, C.cocoa) + g('rotate(-28 30 22)', paint('M14 22a16 16 0 0 1 16-16v16z', C.rose, { sw: 1.6 })) + g('rotate(28 34 22)', paint('M50 22a16 16 0 0 0-16-16v16z', C.butter, { sw: 1.6 })) +
      brush('M24 30q-4 10 2 16t0 14', C.lav, 3) + brush('M40 30q4 10-2 16t2 12', C.mint, 3) + brush('M32 28v12', C.peach, 3) +
      dot(14, 40, 2.6, C.sky) + dot(50, 42, 2.6, C.rose) + dot(20, 54, 2.4, C.butter) + dot(46, 56, 2.4, C.leaf),
    '🎈': L('M32 47q-5 6 0 10t-2 6', 2, C.cocoa) + paint('M32 4c11 0 18 9 18 19 0 12-9 21-18 22-9-1-18-10-18-22 0-10 7-19 18-19z', C.rose, { sw: 1.8 }) +
      paint('M28 45h8l-4 5z', C.rose, { sw: 1.2 }) + face(32, 24, .8, 'happy') + hi('M20 17q2-6 7-8', 3, .75),
    '🎁': paint(rr(10, 28, 44, 29, 4), C.rose, { sw: 1.8 }) + paint(rr(7, 20, 50, 11, 3), '#f0a8b2', { sw: 1.6 }) + paint(rr(28, 20, 8, 37, 1), C.butter, { sw: 1.2 }) +
      bowLoops(C.butter, 20, .62) + paint(ell(32, 19, 3.6, 3.2), C.gold, { sw: 1 }),
    '🎀': brush('M30 34l-9 21', C.pink, 6) + brush('M34 34l9 21', C.pink, 6) + bowLoops(C.pink, 30, 1.25) + paint(rr(26.5, 24.5, 11, 11, 4), C.rose, { sw: 1.4 }) + hi('M12 22q2-6 7-6', 2.4, .75),
    '🎭': g('rotate(14 42 28)', paint('M28 10h28v16c0 12-6 20-14 20s-14-8-14-20z', C.lav, { sw: 1.6 }) + L('M34 22q3-2 6 0M45 22q3-2 6 0', 2.4) + L('M37 36q5-5 10 0', 2.4)) +
      g('rotate(-14 22 32)', paint('M8 14h28v16c0 12-6 20-14 20S8 42 8 30z', C.butter, { sw: 1.6 }) + L('M13 25q3-3 6 0M25 25q3-3 6 0', 2.4) + L('M16 34q6 6 12 0', 2.4)),
    '🎢': brush('M4 50Q12 10 22 34T42 26 60 44', C.rose, 4) + L('M10 50v8M16 30v28M28 40v18M40 28v30M52 34v24', 2.2, C.brown) + L('M3 58h58', 2.6, C.sage) +
      g('rotate(-30 15 21)', paint(rr(9, 15, 13, 9, 3), C.sky, { sw: 1.2 }) + dot(12, 26, 2) + dot(19, 26, 2)),

    /* ===== sports and goals ===== */
    '🏅': medal(C.gold, paint(STAR, C.butter, { sw: 1.2 })),
    '🥇': medal(C.gold, L('M28.5 37l4-3v15', 3.2, '#8b6418')),
    '🥈': medal('#c7ccd3', L('M27 38q1-4.5 5-4.5t5 4q0 3-4 6.5l-6 5h10.5', 3, '#65707e')),
    '🥉': medal('#d39a6a', L('M27 35.5q2-2.5 5-2.5 5 0 5 3.8T31.5 41q6 0 6 4t-5.5 4.5q-3.5 0-5.5-2.5', 3, '#7c4a2a')),
    '🏆': paint(rr(19, 50, 26, 9, 3), C.cocoa, { sw: 1.4 }) + paint('M28 38h8l2 13H26z', C.gold, { sw: 1.2 }) +
      `<path d="M17 14H9q0 14 11 15M47 14h8q0 14-11 15" fill="none" stroke="${C.gold}" stroke-width="4.4" stroke-linecap="round"/>` +
      paint('M15 7h34v13c0 12-7 20-17 20S15 32 15 20z', C.gold, { sw: 1.8 }) + face(32, 20, .8, 'happy') + hi('M20 12v10', 3, .7),
    '🎯': paint(ell(29, 35, 25), C.rose, { sw: 1.8 }) + paint(ell(29, 35, 17), C.white, { po: .2, dk: '#c9a9a0' }) + paint(ell(29, 35, 9), C.rose, { sw: 1.4 }) +
      brush('M30 34L54 10', C.cocoa, 3.4) + paint('M50 6l4 4 6-2-4-4zM54 10l4 4 2-6z', C.sky, { sw: 1 }) + dot(29.5, 34.5, 2.4, INK),
    '🏹': `<path d="M14 6q34 12 34 26T14 58" fill="none" stroke="${C.cocoa}" stroke-width="5" stroke-linecap="round"/>` + L('M14 6v52', 1.6, '#8a7a72') +
      brush('M6 32h46', C.sand, 3.2) + paint('M50 26l10 6-10 6z', C.gray, { sw: 1.2 }) + paint('M4 27l6 5-6 5h6l4-5-4-5z', C.rose, { sw: 1 }),
    '⚔': g('rotate(45 32 32)', paint(rr(28.5, 2, 7, 40, 3.5), C.gray, { sw: 1.4 }) + paint(rr(22, 42, 20, 5, 2.5), C.gold, { sw: 1 }) + paint(rr(29, 47, 6, 12, 3), C.cocoa, { sw: 1 })) +
      g('rotate(-45 32 32)', paint(rr(28.5, 2, 7, 40, 3.5), C.gray, { sw: 1.4 }) + paint(rr(22, 42, 20, 5, 2.5), C.gold, { sw: 1 }) + paint(rr(29, 47, 6, 12, 3), C.cocoa, { sw: 1 })),

    /* ===== talk and misc ===== */
    '💬': paint('M14 8h36q10 0 10 10v14q0 10-10 10H28l-12 12v-12h-2q-10 0-10-10V18q0-10 10-10z', C.sky, { sw: 1.8 }) + dot(21, 25, 3.2, C.white) + dot(32, 25, 3.2, C.white) + dot(43, 25, 3.2, C.white),
    '💭': paint(ell(10, 56, 3.4), '#efe6f8', { sw: 1.4, dk: '#a996c4' }) + paint(ell(18, 47, 5), '#efe6f8', { sw: 1.6, dk: '#a996c4' }) +
      paint('M20 38q-12 0-12-10t10-10q2-12 15-12 10 0 13 8 12 0 13 11 1 13-12 13z', '#efe6f8', { sw: 2, dk: '#a996c4' }) + hi('M18 24q2-6 8-7', 2.6, .8),
    '🕙': paint(ell(32, 34, 25), C.rose, { sw: 1.8 }) + paint(ell(32, 34, 19), C.cream, { po: .2, dk: '#c9a9a0' }) +
      L('M32 34l-10-6M32 34V20', 3.4) + dot(32, 34, 2.6) + L('M32 17v2M49 34h-2M32 51v-2M15 34h2', 2, C.rose),
    '🛟': eo(paint(ell(32, 32, 27) + ell(32, 32, 12), C.white, { dk: '#c3a8a0', sw: 1.8, po: .3 })) +
      `<circle cx="32" cy="32" r="19.5" fill="none" stroke="#e8737a" stroke-width="13" stroke-dasharray="15.3 15.3" transform="rotate(-27 32 32)" opacity=".95"/>`,
    '💍': eo(paint(ell(32, 41, 15) + ell(32, 41, 9), C.gold, { sw: 1.6 })) +
      paint('M24 14l4-7h8l4 7-8 12z', C.sky, { sw: 1.4 }) + L('M24 14h16', 1.6, '#6f93b8') + L('M8 10l4 2M56 10l-4 2M32 1v3', 2.4, C.butter),
    '⚙': eo(paint(gear, C.gray, { sw: 1.8 })) + hi('M18 26q2-6 7-9', 2.6, .6),
    '📬': L('M34 42v18', 5, C.brown) + paint('M18 12h28a10 10 0 0 1 10 10v20H28V22a10 10 0 0 0-10-10z', C.sky, { sw: 1.6 }) + paint('M8 22a10 10 0 0 1 20 0v20H8z', C.blue, { sw: 1.6 }) +
      g('rotate(-12 16 24)', paint(rr(9, 16, 16, 11, 1.5), C.cream, { dk: '#c9b29a', sw: 1.2 }) + L('M10 17l7 5 7-5', 1.4, '#c9a07a')) + L('M50 34V8', 2.6, C.cocoa) + paint('M50 7h10v8H50z', C.red, { sw: 1 }),
  });
})();
