/* Uzhu illustrations: the mascot "یوژو" (a cheerful pistachio sprout) and scene art, as inline SVG. */
(function () {
  const INK = '#3b2a3a';

  function face(mood, cx, cy) {
    const eyes = {
      happy: `<path d="M${cx - 22} ${cy - 4} q8 -10 16 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M${cx + 6} ${cy - 4} q8 -10 16 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
      calm: `<path d="M${cx - 22} ${cy - 6} q8 6 16 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M${cx + 6} ${cy - 6} q8 6 16 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
      sleepy: `<path d="M${cx - 22} ${cy - 4} h16" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M${cx + 6} ${cy - 4} h16" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
      wow: `<circle cx="${cx - 14}" cy="${cy - 6}" r="7" fill="${INK}"/><circle cx="${cx + 14}" cy="${cy - 6}" r="7" fill="${INK}"/><circle cx="${cx - 11}" cy="${cy - 9}" r="2.4" fill="#fff"/><circle cx="${cx + 17}" cy="${cy - 9}" r="2.4" fill="#fff"/>`,
    }[mood] || '';
    const mouth = {
      happy: `<path d="M${cx - 12} ${cy + 10} q12 14 24 0" fill="#e2557a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
      calm: `<path d="M${cx - 9} ${cy + 12} q9 7 18 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
      sleepy: `<ellipse cx="${cx}" cy="${cy + 14}" rx="5" ry="6" fill="${INK}"/>`,
      wow: `<ellipse cx="${cx}" cy="${cy + 14}" rx="8" ry="9" fill="#e2557a" stroke="${INK}" stroke-width="4"/>`,
    }[mood] || '';
    return eyes + mouth +
      `<ellipse cx="${cx - 30}" cy="${cy + 8}" rx="9" ry="6" fill="#ff9eb5" opacity=".8"/><ellipse cx="${cx + 30}" cy="${cy + 8}" rx="9" ry="6" fill="#ff9eb5" opacity=".8"/>`;
  }

  // The mascot body. mood: happy | calm | sleepy | wow. extra: svg drawn on top (props).
  function mascot(mood = 'happy', opts = {}) {
    const arms = opts.arms === 'up'
      ? `<path d="M58 118 q-26 -18 -22 -48" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M142 118 q26 -18 22 -48" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><circle cx="36" cy="68" r="9" fill="#7fd1a8" stroke="${INK}" stroke-width="4"/><circle cx="164" cy="68" r="9" fill="#7fd1a8" stroke="${INK}" stroke-width="4"/>`
      : opts.arms === 'wave'
        ? `<path d="M58 130 q-22 6 -26 26" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M142 118 q26 -18 22 -48" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><circle cx="164" cy="68" r="9" fill="#7fd1a8" stroke="${INK}" stroke-width="4"/>`
        : `<path d="M58 130 q-22 6 -26 26" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M142 130 q22 6 26 26" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="یوژو">
      <ellipse cx="100" cy="198" rx="54" ry="8" fill="${INK}" opacity=".12"/>
      ${arms}
      <path d="M100 52 c-10 -22 -34 -30 -50 -24 c8 18 28 28 50 24z" fill="#5cc28f" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M100 52 c8 -26 30 -38 50 -34 c-6 22 -26 34 -50 34z" fill="#8fd9b6" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M100 52 v14" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M100 64 c46 0 66 34 66 70 c0 38 -30 58 -66 58 c-36 0 -66 -20 -66 -58 c0 -36 20 -70 66 -70z" fill="#a8e6c4" stroke="${INK}" stroke-width="5"/>
      <path d="M62 100 c6 -14 18 -22 30 -24" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>
      <path d="M78 190 v10 M122 190 v10" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      ${face(mood, 100, 126)}
      ${opts.extra || ''}
    </svg>`;
  }

  const sparkle = (x, y, s = 1, c = '#ffd166') =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C2 -3 3 -2 12 0 C3 2 2 3 0 12 C-2 3 -3 2 -12 0 C-3 -2 -2 -3 0 -12z" fill="${c}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;

  // Hero scene: mascot waving goodbye to a grumpy sugar cube, with fruit friends.
  function hero() {
    return `<svg viewBox="0 0 520 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="یوژو با یک حبه‌قند بداخلاق خداحافظی می‌کند">
      <circle cx="270" cy="200" r="160" fill="var(--blob, #e7f6ee)"/>
      <path d="M60 330 q210 -40 420 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".25"/>
      <g transform="translate(60 150) rotate(-8)">
        <rect x="0" y="40" width="110" height="110" rx="16" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <path d="M0 70 l26 -30 h110 l-26 30z" fill="#f4f0f7" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M110 70 l26 -30 v104 l-26 34z" fill="#e6dff0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="22" cy="92" r="3" fill="${INK}" opacity=".25"/><circle cx="84" cy="128" r="3" fill="${INK}" opacity=".25"/><circle cx="60" cy="140" r="2.5" fill="${INK}" opacity=".25"/>
        <path d="M26 92 l16 6 M84 92 l-16 6" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="36" cy="104" r="5" fill="${INK}"/><circle cx="74" cy="104" r="5" fill="${INK}"/>
        <path d="M40 130 q15 -10 30 0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M118 30 q8 -14 0 -26 M132 36 q12 -10 8 -24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
        <text x="40" y="20" font-size="26" font-family="sans-serif" fill="${INK}" opacity=".6">💢</text>
      </g>
      <g transform="translate(230 70) scale(1.25)">${mascot('happy', { arms: 'wave' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      <g transform="translate(430 250)">
        <path d="M0 -40 c-26 0 -38 22 -34 44 c4 26 22 36 34 30 c12 6 30 -4 34 -30 c4 -22 -8 -44 -34 -44z" fill="#ff7a7a" stroke="${INK}" stroke-width="4.5"/>
        <path d="M0 -40 c-2 -10 2 -18 10 -22" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
        <path d="M6 -52 c10 -8 22 -6 26 0 c-8 8 -18 8 -26 0z" fill="#5cc28f" stroke="${INK}" stroke-width="3.5"/>
        <circle cx="-10" cy="-2" r="4" fill="${INK}"/><circle cx="12" cy="-2" r="4" fill="${INK}"/>
        <path d="M-6 10 q7 7 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <g transform="translate(470 150) rotate(20)">
        <path d="M-30 0 c10 30 50 34 64 6 c-18 10 -46 8 -64 -6z" fill="#ffd166" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
        <circle cx="0" cy="12" r="3" fill="${INK}"/><circle cx="16" cy="12" r="3" fill="${INK}"/>
      </g>
      ${sparkle(200, 70, 1)}${sparkle(470, 70, .8, '#ff9eb5')}${sparkle(150, 300, .7, '#8fd9b6')}${sparkle(390, 330, .6)}
    </svg>`;
  }

  // Small spot illustrations used across the site.
  const spots = {
    water: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M30 24 h60 l-8 82 h-44z" fill="#d9f1ff" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M34 50 h52 l-5 56 h-42z" fill="#7cc8f2"/><path d="M30 24 h60 l-8 82 h-44z" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="50" cy="76" r="3.5" fill="${INK}"/><circle cx="70" cy="76" r="3.5" fill="${INK}"/><path d="M53 86 q7 6 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>${sparkle(98, 26, .6, '#fff')}</svg>`,
    moon: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M74 14 a46 46 0 1 0 32 66 a38 38 0 0 1 -32 -66z" fill="#ffe08a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M40 62 h10 M62 70 h10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M48 82 q8 5 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>${sparkle(100, 28, .6)}${sparkle(20, 24, .45, '#c3b1e1')}</svg>`,
    brain: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 22 c-14 -10 -36 -2 -36 16 c-14 4 -16 26 -4 32 c-4 16 12 28 26 22 c6 8 22 8 28 0 c14 6 30 -6 26 -22 c12 -6 10 -28 -4 -32 c0 -18 -22 -26 -36 -16z" fill="#ffc2d4" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M60 24 v66 M38 46 q10 4 10 14 M82 46 q-10 4 -10 14" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><circle cx="46" cy="70" r="3.5" fill="${INK}"/><circle cx="74" cy="70" r="3.5" fill="${INK}"/></svg>`,
    book: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 30 c-14 -10 -32 -10 -44 -4 v66 c12 -6 30 -6 44 4 c14 -10 32 -10 44 -4 v-66 c-12 -6 -30 -6 -44 4z" fill="#fff3d6" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M60 30 v66" stroke="${INK}" stroke-width="4"/><path d="M26 44 h24 M26 56 h24 M70 44 h24 M70 56 h18" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".45"/>${sparkle(100, 18, .55, '#8fd9b6')}</svg>`,
    trophy: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M34 20 h52 v22 c0 18 -12 30 -26 30 c-14 0 -26 -12 -26 -30z" fill="#ffd166" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M34 28 h-14 c0 16 8 24 18 24 M86 28 h14 c0 16 -8 24 -18 24" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M52 72 h16 v14 h-16z M40 86 h40 v14 h-40z" fill="#c3b1e1" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><path d="M50 40 q10 8 20 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>${sparkle(104, 16, .6)}${sparkle(14, 70, .5, '#ff9eb5')}</svg>`,
    bell: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 18 c-22 0 -32 18 -32 38 v18 l-10 14 h84 l-10 -14 v-18 c0 -20 -10 -38 -32 -38z" fill="#c3b1e1" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="60" cy="96" r="9" fill="#ffd166" stroke="${INK}" stroke-width="4"/><circle cx="50" cy="56" r="3.5" fill="${INK}"/><circle cx="70" cy="56" r="3.5" fill="${INK}"/><path d="M53 66 q7 6 14 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M14 40 q-6 14 0 28 M106 40 q6 14 0 28" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity=".5"/></svg>`,
  };

  window.UZHU_ART = { mascot, hero, spots, sparkle };
})();
