/* Uzhu illustrations in a soft watercolor style: the mascot "حبه" (a cheerful pistachio sprout) and scene art, as inline SVG.
   Every drawing carries its own watercolor filter (wobbly edges + paper grain) with a unique id, so the same art can sit
   on one page many times. API: window.UZHU_ART = { mascot(mood, opts), hero(), spots.<key>, sparkle(x, y, s, c) }. */
(function () {
  const INK = '#5b4343';
  const BLUSH = '#f29aa5';
  let N = 0;
  const uid = p => `wc-${p}-${++N}`;

  // Darker, warmer version of a pastel (for pooled pigment at the edges).
  function shade(hex, k = .32) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = (c, t) => Math.round(c + (t - c) * k);
    return '#' + [m(r, 120), m(g, 72), m(b, 70)].map(c => c.toString(16).padStart(2, '0')).join('');
  }
  // Watercolor filter: low-frequency noise pushes the edges around, high-frequency noise eats a little pigment (grain).
  const filt = (id, seed = 3, sc = 4.5, fq = .032) =>
    `<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${fq}" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="${seed + 6}" result="g"/><feColorMatrix in="g" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 .5" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>`;
  // One painted shape: a darker offset layer (pigment pooling), the main wash, and a faint darker rim.
  const paint = (d, c, o = {}) => {
    const dk = o.dk || shade(c), dx = o.dx ?? 2, dy = o.dy ?? 3;
    return `<path d="${d}" fill="${dk}" opacity="${o.po ?? .42}" transform="translate(${dx} ${dy})"/><path d="${d}" fill="${c}" opacity="${o.op ?? .93}"/><path d="${d}" fill="none" stroke="${dk}" stroke-width="${o.sw ?? 1.8}" opacity=".4"/>`;
  };
  const ell = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
  const hi = (d, w = 5, op = .55) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  const brush = (d, c, w = 8) => `<path d="${d}" fill="none" stroke="${shade(c)}" stroke-width="${w}" stroke-linecap="round" opacity=".45" transform="translate(1.5 2)"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  // Tiny face: dot eyes, small smile, blush. s = scale.
  function face(cx, cy, s = 1, mood = 'happy') {
    const L = cx - 9 * s, R = cx + 9 * s, w = 2.2 * s;
    const ln = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const eyes = mood === 'calm' ? ln(`M${L - 3.5 * s} ${cy} q${3.5 * s} ${3 * s} ${7 * s} 0`) + ln(`M${R - 3.5 * s} ${cy} q${3.5 * s} ${3 * s} ${7 * s} 0`)
      : mood === 'sleepy' ? ln(`M${L - 3.5 * s} ${cy + s} q${3.5 * s} ${2.4 * s} ${7 * s} 0`) + ln(`M${R - 3.5 * s} ${cy + s} q${3.5 * s} ${2.4 * s} ${7 * s} 0`)
        : mood === 'wow' ? `<circle cx="${L}" cy="${cy}" r="${3.6 * s}" fill="${INK}"/><circle cx="${R}" cy="${cy}" r="${3.6 * s}" fill="${INK}"/><circle cx="${L + 1.2 * s}" cy="${cy - 1.3 * s}" r="${1.2 * s}" fill="#fff"/><circle cx="${R + 1.2 * s}" cy="${cy - 1.3 * s}" r="${1.2 * s}" fill="#fff"/>`
          : mood === 'grumpy' ? `<circle cx="${L}" cy="${cy}" r="${2.4 * s}" fill="${INK}"/><circle cx="${R}" cy="${cy}" r="${2.4 * s}" fill="${INK}"/>` + ln(`M${L - 4 * s} ${cy - 5 * s} l${7 * s} ${2.5 * s}M${R + 4 * s} ${cy - 5 * s} l${-7 * s} ${2.5 * s}`)
            : `<circle cx="${L}" cy="${cy}" r="${2.5 * s}" fill="${INK}"/><circle cx="${R}" cy="${cy}" r="${2.5 * s}" fill="${INK}"/>`;
    const my = cy + 6 * s;
    const mouth = mood === 'wow' ? `<ellipse cx="${cx}" cy="${my + s}" rx="${2.6 * s}" ry="${3.2 * s}" fill="#d9707e"/>`
      : mood === 'sleepy' ? `<ellipse cx="${cx}" cy="${my + s}" rx="${1.8 * s}" ry="${2.2 * s}" fill="#d9707e" opacity=".85"/>`
        : mood === 'grumpy' ? ln(`M${cx - 4 * s} ${my + 2 * s} q${4 * s} ${-3.5 * s} ${8 * s} 0`)
          : mood === 'big' ? `<path d="M${cx - 5 * s} ${my - s} q${5 * s} ${6.5 * s} ${10 * s} 0z" fill="#d9707e" stroke="${INK}" stroke-width="${w * .8}" stroke-linejoin="round"/>`
            : ln(`M${cx - 3.6 * s} ${my} q${3.6 * s} ${3.4 * s} ${7.2 * s} 0`);
    return eyes + mouth + `<ellipse cx="${cx - 15 * s}" cy="${cy + 4.5 * s}" rx="${4.6 * s}" ry="${2.9 * s}" fill="${BLUSH}" opacity=".6"/><ellipse cx="${cx + 15 * s}" cy="${cy + 4.5 * s}" rx="${4.6 * s}" ry="${2.9 * s}" fill="${BLUSH}" opacity=".6"/>`;
  }

  const sparkle = (x, y, s = 1, c = '#f6cf72') =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C1.6 -3.4 3.4 -1.6 12 0 C3.4 1.6 1.6 3.4 0 12 C-1.6 3.4 -3.4 1.6 -12 0 C-3.4 -1.6 -1.6 -3.4 0 -12z" fill="${c}" stroke="${shade(c, .25)}" stroke-width="1.4" stroke-linejoin="round" opacity=".92"/>`;
  const heart = (x, y, s = 1, c = '#f2a7b3') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 4 C-7 -1 -9 -6 -6 -9 C-3.5 -11.5 -1 -10 0 -7.5 C1 -10 3.5 -11.5 6 -9 C9 -6 7 -1 0 4z" fill="${c}" opacity=".9"/>`;
  const leaf = (x, y, r = 0, s = 1, c = '#a9c99a') => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0 C6 -8 16 -9 22 -4 C16 4 6 5 0 0z" fill="${c}" opacity=".9"/><path d="M2 -.5 C8 -3 14 -3.6 19 -3.5" fill="none" stroke="${shade(c, .35)}" stroke-width="1" opacity=".6"/></g>`;
  // Background washes read a CSS variable so dark mode can mute them.
  const wash = (d, v, c, op = 1) => `<path d="${d}" style="fill:var(${v},${c})" opacity="${op}"/>`;

  /* ---------- mascot ---------- */
  const BODY = '#c3dc9a', BODY_DK = '#93b46c', LEAF1 = '#8fbf7f', LEAF2 = '#b2d69a';
  // Returns [painted part (goes under a watercolor filter), crisp part (face and marks)].
  function mascotParts(mood, opts) {
    const up = opts.arms === 'up', waveR = up || opts.arms === 'wave';
    const armL = up ? 'M46 118 q-20 -16 -18 -46' : 'M42 136 q-14 8 -16 26';
    const armR = waveR ? 'M154 118 q20 -16 18 -46' : 'M158 136 q14 8 16 26';
    const endL = up ? [28, 72] : [26, 162], endR = waveR ? [172, 72] : [174, 162];
    const body = 'M100 60 c42 0 66 32 66 72 c0 38 -28 60 -66 60 c-38 0 -66 -22 -66 -60 c0 -40 24 -72 66 -72z';
    const painted = `<path d="${ell(100, 198, 52, 7)}" fill="#b89f8a" opacity=".28"/>
      ${brush(armL, BODY_DK, 9)}${brush(armR, BODY_DK, 9)}
      <path d="${ell(endL[0], endL[1], 6.5)}" fill="${BODY}"/><path d="${ell(endR[0], endR[1], 6.5)}" fill="${BODY}"/>
      ${paint('M98 60 c-8 -22 -32 -32 -52 -26 c8 20 30 30 52 26z', LEAF1)}
      ${paint('M102 60 c6 -28 30 -40 52 -36 c-6 24 -28 36 -52 36z', LEAF2)}
      <path d="M96 56 c-12 -6 -24 -12 -40 -18 M106 56 c10 -10 22 -18 40 -26" fill="none" stroke="#6f9a62" stroke-width="1.6" opacity=".55"/>
      ${brush('M100 66 v-10', '#7fae6d', 5)}
      <path d="${ell(80, 192, 11, 6)}" fill="${BODY_DK}" opacity=".85"/><path d="${ell(120, 192, 11, 6)}" fill="${BODY_DK}" opacity=".85"/>
      ${paint(body, BODY, { dk: BODY_DK, dx: 4, dy: 5, po: .5, sw: 2.4 })}
      <path d="M100 98 c30 0 46 20 46 42 c0 26 -20 40 -46 40 c-26 0 -46 -14 -46 -40 c0 -22 16 -42 46 -42z" fill="#e6f0c9" opacity=".55"/>
      ${hi('M60 104 c5 -14 16 -24 30 -27', 7, .6)}${hi('M150 150 c-2 8 -6 14 -12 19', 4, .35)}`;
    const zz = mood === 'sleepy' ? `<path d="M150 34 h10 l-10 11 h10 M168 18 h7 l-7 8 h7" fill="none" stroke="#9e8cc8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>` : '';
    const wave = opts.arms === 'wave' ? `<path d="M186 58 q6 8 2 18 M192 48 q10 12 4 28" fill="none" stroke="#e6a77b" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>` : '';
    return [painted, zz + wave + face(100, 128, 1.75, mood === 'happy' ? 'big' : mood)];
  }
  // The mascot. mood: happy | calm | sleepy | wow. opts.arms: up | wave | (down). opts.extra: svg drawn on top (props).
  function mascot(mood = 'happy', opts = {}) {
    const fid = uid('m'), [p, c] = mascotParts(mood, opts);
    return `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="حبه"><defs>${filt(fid, 4, 4)}</defs><g filter="url(#${fid})">${p}</g>${c}${opts.extra || ''}</svg>`;
  }

  /* ---------- hero: Uzhu waving goodbye to a grumpy sugar cube, with fruit friends ---------- */
  function hero() {
    const f = uid('h'), f2 = uid('hm'), [mp, mc] = mascotParts('happy', { arms: 'wave' });
    return `<svg viewBox="0 0 520 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="حبه با یک حبه‌قند بداخلاق خداحافظی می‌کند"><defs>${filt(f, 7, 9, .02)}${filt(f2, 4, 4)}</defs>
      <g filter="url(#${f})">
        ${wash('M120 90 C190 20 330 18 420 70 C500 116 510 236 452 300 C392 366 230 372 140 330 C56 290 40 160 120 90z', '--wc-wash1', '#fde3d2', .95)}
        ${wash('M300 60 C360 40 440 70 460 130 C474 176 430 200 380 180 C330 160 250 92 300 60z', '--wc-wash2', '#fbecc0', .7)}
        ${wash('M70 250 C100 220 170 230 190 270 C204 300 160 320 120 312 C80 304 50 282 70 250z', '--wc-wash3', '#e8e0f3', .85)}
        <path d="M58 334 C160 312 360 310 470 330 C440 344 160 348 58 334z" fill="#d9c3ad" opacity=".45"/>
      </g>
      <g filter="url(#${f2})">
        <g transform="translate(62 150) rotate(-8)">
          ${paint('M0 70 l26 -30 h110 l-26 30z', '#f6f1f4', { dk: '#cfc3d8' })}
          ${paint('M110 70 l26 -30 v104 l-26 34z', '#ddd3ea', { dk: '#b3a5c8' })}
          ${paint('M0 70 h110 v108 h-110z', '#fbf8f6', { dk: '#d6cbdc', po: .5 })}
          <circle cx="20" cy="88" r="2.2" fill="#c9bccf"/><circle cx="90" cy="164" r="2.2" fill="#c9bccf"/><circle cx="74" cy="170" r="1.8" fill="#c9bccf"/><circle cx="24" cy="164" r="1.8" fill="#c9bccf"/>
          <path d="M118 22 q8 -6 4 -16 M132 30 q10 -4 10 -16 M140 6 q-2 -8 4 -14" fill="none" stroke="#e98d99" stroke-width="3" stroke-linecap="round" opacity=".8"/>
        </g>
        <g transform="translate(222 96) scale(1.13)">${mp}</g>
        <g transform="translate(470 282) scale(.82)">
          ${paint('M0 -40 c-26 0 -38 22 -34 44 c4 26 22 36 34 30 c12 6 30 -4 34 -30 c4 -22 -8 -44 -34 -44z', '#f39a92')}
          ${hi('M-20 -14 c2 -8 7 -14 14 -16', 4, .6)}
          ${brush('M0 -40 c-2 -8 1 -15 8 -20', '#a07a5c', 3.5)}
        </g>
        ${leaf(476, 232, -30, .95, '#9cc68b')}
        <g transform="translate(398 322) rotate(-6)">
          ${paint('M-32 -2 c10 32 54 36 68 6 c-20 10 -48 8 -68 -6z', '#f7d98a')}
          ${brush('M-32 -2 l-6 -4', '#a6855a', 3.5)}
        </g>
      </g>
      <g transform="translate(62 150) rotate(-8)">${face(55, 118, 1.8, 'grumpy')}</g>
      <g transform="translate(222 96) scale(1.13)">${mc}</g>
      <g transform="translate(470 282) scale(.82)">${face(0, 2, 1.05)}</g>
      <g transform="translate(398 322) rotate(-6)"><circle cx="-2" cy="12" r="2.4" fill="${INK}"/><circle cx="12" cy="12" r="2.4" fill="${INK}"/><path d="M2 17 q3 2.6 6 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/></g>
      ${sparkle(250, 70, 1)}${sparkle(470, 74, .8, '#f4b6c2')}${sparkle(150, 298, .7, '#b7d7a4')}${sparkle(392, 328, .6)}
      ${heart(206, 150, 1.1)}${heart(362, 60, .8, '#f6c39e')}${heart(36, 110, .7, '#c8b8e6')}
      ${leaf(64, 300, -20, 1, '#b5d3a2')}${leaf(470, 312, 200, .9, '#e8b98f')}
    </svg>`;
  }

  /* ---------- small spot illustrations used across the site ---------- */
  const spotArt = {
    water: f => `<g filter="url(#${f})">${wash(ell(60, 64, 50, 46), '--wc-spot', '#e3f1fa', .9)}
      ${paint('M32 26 h56 l-7 80 h-42z', '#eef7fc', { dk: '#9fc6de' })}
      ${paint('M35 50 h50 l-5 55 h-40z', '#9fd0ee', { dk: '#6aa7cc', dx: 1, dy: 2 })}
      ${hi('M40 34 l4 64', 4, .7)}<circle cx="70" cy="62" r="3" fill="#fff" opacity=".7"/><circle cx="62" cy="92" r="2" fill="#fff" opacity=".7"/>
      ${paint(ell(86, 30, 13), '#f7e08f', { dx: 1, dy: 1.5 })}<path d="M76 30 h20 M86 20 v20" stroke="#fff" stroke-width="1.6" opacity=".7"/></g>
      ${face(60, 74, .8)}${sparkle(104, 66, .5, '#fff')}`,
    moon: f => `<g filter="url(#${f})">${wash(ell(60, 60, 50), '--wc-spot', '#ece6f6', .9)}
      ${paint('M72 16 a44 44 0 1 0 32 66 a36 36 0 0 1 -32 -66z', '#f8de92', { dk: '#d8b064' })}
      ${hi('M40 40 c4 -8 10 -14 16 -17', 4, .55)}
      ${paint('M20 96 c2 -10 16 -12 22 -6 c4 -8 18 -8 22 2 c8 0 10 10 2 12 h-42 c-8 0 -10 -6 -4 -8z', '#fbf6f2', { dk: '#cfc2dc' })}</g>
      ${face(52, 64, .85, 'sleepy')}${sparkle(98, 26, .55, '#c7b7e3')}${sparkle(20, 26, .45)}${sparkle(104, 52, .35, '#f4b6c2')}`,
    brain: f => `<g filter="url(#${f})">${wash(ell(60, 62, 50, 46), '--wc-spot', '#fbe6ec', .9)}
      ${paint('M60 24 c-14 -10 -36 -2 -36 16 c-14 4 -16 26 -4 32 c-4 16 12 28 26 22 c6 8 22 8 28 0 c14 6 30 -6 26 -22 c12 -6 10 -28 -4 -32 c0 -18 -22 -26 -36 -16z', '#f6b8c8', { dk: '#d98ba0' })}
      <path d="M60 26 v20 M38 44 q10 4 10 14 M82 44 q-10 4 -10 14 M30 66 q8 -2 12 4 M90 66 q-8 -2 -12 4" fill="none" stroke="#e79bb0" stroke-width="2.6" stroke-linecap="round"/>
      ${hi('M34 36 c3 -6 8 -10 14 -11', 4, .55)}</g>
      ${face(60, 72, .85)}${sparkle(104, 22, .5)}${heart(16, 96, .7, '#c8b8e6')}`,
    book: f => `<g filter="url(#${f})">${wash(ell(60, 64, 50, 44), '--wc-spot', '#fdf0dc', .9)}
      ${paint('M60 32 c-14 -10 -32 -10 -44 -4 v66 c12 -6 30 -6 44 4 c14 -10 32 -10 44 -4 v-66 c-12 -6 -30 -6 -44 4z', '#e9a9a6', { dk: '#c98482' })}
      ${paint('M60 34 c-12 -8 -28 -8 -38 -3 v60 c10 -4 26 -4 38 3 c12 -7 28 -7 38 -3 v-60 c-10 -5 -26 -5 -38 3z', '#fdf6ea', { dk: '#e0cdb4', dx: 0, dy: 2, po: .5 })}
      <path d="M60 34 v62" stroke="#d9c2a5" stroke-width="2"/>
      <path d="M28 46 h24 M28 56 h24 M28 66 h18 M68 46 h24 M68 56 h24" stroke="#c5ae95" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>
      ${paint('M84 30 v26 l6 -5 l6 5 v-28', '#a9c99a', { dx: 1, dy: 1 })}</g>
      ${face(80, 76, .55)}${sparkle(106, 16, .55, '#b7d7a4')}${heart(16, 20, .7)}`,
    trophy: f => `<g filter="url(#${f})">${wash(ell(60, 60, 50, 46), '--wc-spot', '#fdf1d6', .9)}
      ${brush('M36 30 h-12 c0 16 8 24 18 24 M84 30 h12 c0 16 -8 24 -18 24', '#eac46a', 5)}
      ${paint('M34 22 h52 v20 c0 18 -12 30 -26 30 c-14 0 -26 -12 -26 -30z', '#f7d27c', { dk: '#d4a54c' })}
      ${hi('M42 30 c0 10 2 18 6 24', 4, .6)}
      ${paint('M52 72 h16 v14 h-16z', '#d7c6ec', { dk: '#a996c8' })}${paint('M40 86 h40 v14 h-40z', '#c7b7e3', { dk: '#a28fc4' })}</g>
      ${face(60, 42, .75)}${sparkle(104, 16, .6)}${sparkle(14, 70, .5, '#f4b6c2')}`,
    bell: f => `<g filter="url(#${f})">${wash(ell(60, 62, 50, 46), '--wc-spot', '#efe8f8', .9)}
      ${paint('M60 18 c-22 0 -32 18 -32 38 v18 l-10 14 h84 l-10 -14 v-18 c0 -20 -10 -38 -32 -38z', '#cdbde8', { dk: '#a28fc4' })}
      ${hi('M40 40 c2 -8 6 -14 12 -17', 4, .55)}
      ${paint(ell(60, 96, 9), '#f7d27c', { dx: 1, dy: 1.5 })}
      <path d="M12 42 q-6 14 0 28 M108 42 q6 14 0 28" fill="none" stroke="#e6a77b" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>
      ${face(60, 58, .8)}`,
  };
  // Getters: every read draws a fresh copy with its own filter id.
  const spots = {};
  Object.keys(spotArt).forEach(k => Object.defineProperty(spots, k, {
    enumerable: true,
    get() { const f = uid('s' + k); return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><defs>${filt(f, k.length + 2, 3.5)}</defs>${spotArt[k](f)}</svg>`; },
  }));

  window.UZHU_ART = { mascot, hero, spots, sparkle };
})();
