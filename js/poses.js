/* Animated cartoon exercise figures. Each move has two key poses (A, B) described by
   forward kinematics: pelvis position, torso/head direction and absolute limb angles in degrees
   (screen coordinates: 0 = right, 90 = down, -90 = up, 180 = left). The figure loops A → B → A. */
(function () {
  const INK = '#3b2a3a';
  const L = { torso: 40, neck: 16, up: 24, fore: 22, thigh: 28, shin: 28 };
  const STAND = { p: [100, 84], t: -90, hd: -90, a1: [95, 90], a2: [85, 90], l1: [92, 90], l2: [88, 90] };
  const TABLE = { p: [75, 108], t: -27, hd: -20, a1: [90, 90], a2: [90, 90], l1: [90, 180], l2: [90, 180] };
  const SUPINE_KNEES = { p: [105, 128], t: 174, hd: 180, a1: [10, 10], a2: [10, 10], l1: [-40, 90], l2: [-40, 90] };
  const SEATED = { p: [80, 130], t: -90, hd: -90, a1: [80, 90], a2: [100, 90], l1: [0, 0], l2: [0, 0] };
  const m = (base, o) => Object.assign({}, base, o);

  const POSES = {
    'breath-belly': { dur: 10000, A: { p: [100, 128], t: -90, hd: -90, a1: [60, 165], a2: [70, 160], l1: [8, 170], l2: [18, 160], belly: 0 }, B: { p: [100, 128], t: -90, hd: -95, a1: [60, 160], a2: [70, 155], l1: [8, 170], l2: [18, 160], belly: 1 } },
    'walk-march': { dur: 1400, A: m(STAND, { l1: [15, 95], l2: [90, 90], a1: [110, 100], a2: [60, -10] }), B: m(STAND, { l1: [90, 90], l2: [15, 95], a1: [60, -10], a2: [110, 100] }) },
    'walk-steptouch': { dur: 1800, A: m(STAND, { a1: [90, 90], a2: [90, 90] }), B: m(STAND, { p: [100, 86], l1: [70, 80], l2: [110, 100], a1: [20, -30], a2: [160, 200] }) },
    'yoga-mountain': { dur: 5000, A: STAND, B: m(STAND, { a1: [-80, -85], a2: [-100, -95], hd: -95 }) },
    'yoga-catcow': { dur: 5000, A: m(TABLE, { c: 9, hd: 70 }), B: m(TABLE, { c: -8, hd: -60 }) },
    'yoga-child': { dur: 6000, A: { p: [70, 124], t: -60, hd: -70, a1: [80, 90], a2: [100, 90], l1: [20, 180], l2: [20, 180] }, B: { p: [70, 124], t: 8, hd: 20, a1: [5, 0], a2: [3, 0], l1: [20, 180], l2: [20, 180] } },
    'yoga-downdog': { dur: 4000, A: { p: [100, 88], t: 40, hd: 45, a1: [40, 40], a2: [40, 40], l1: [105, 105], l2: [105, 105] }, B: { p: [100, 88], t: 40, hd: 45, a1: [40, 40], a2: [40, 40], l1: [95, 125], l2: [105, 105] } },
    'yoga-cobra': { dur: 5000, A: { p: [80, 132], t: -8, hd: 0, a1: [160, 0], a2: [160, 0], l1: [180, 180], l2: [180, 180] }, B: { p: [80, 132], t: -30, hd: -45, a1: [150, 30], a2: [150, 30], l1: [180, 180], l2: [180, 180] } },
    'yoga-lunge': { dur: 5000, A: { p: [95, 108], t: -90, hd: -90, a1: [60, 70], a2: [70, 80], l1: [0, 90], l2: [120, 180] }, B: { p: [95, 108], t: -90, hd: -95, a1: [-85, -90], a2: [-95, -92], l1: [0, 90], l2: [120, 180] } },
    'yoga-warrior2': { dur: 5000, A: { p: [100, 92], t: -90, hd: -90, a1: [90, 90], a2: [90, 90], l1: [58, 58], l2: [122, 122] }, B: { p: [100, 100], t: -90, hd: -80, a1: [0, 0], a2: [180, 180], l1: [20, 90], l2: [145, 145] } },
    'yoga-tree': { dur: 5000, A: m(STAND, { l1: [20, 160], l2: [90, 90], a1: [100, -30], a2: [110, -40] }), B: m(STAND, { l1: [20, 160], l2: [90, 90], a1: [-80, -90], a2: [-100, -90] }) },
    'yoga-bridge': { dur: 4000, A: SUPINE_KNEES, B: { p: [105, 110], t: 146.6, hd: 180, a1: [10, 10], a2: [10, 10], l1: [0, 90], l2: [0, 90] } },
    'yoga-forwardfold': { dur: 5000, A: m(SEATED, { a1: [-85, -90], a2: [-95, -90] }), B: m(SEATED, { t: -20, hd: -5, a1: [60, 0], a2: [55, 5] }) },
    'yoga-twist': { dur: 5000, A: { p: [100, 130], t: 180, hd: 180, a1: [180, 180], a2: [175, 175], l1: [-45, 45], l2: [-45, 45] }, B: { p: [100, 130], t: 180, hd: 160, a1: [180, 180], a2: [175, 175], l1: [-10, 20], l2: [-5, 25] } },
    'pil-pelvictilt': { dur: 3500, A: SUPINE_KNEES, B: m(SUPINE_KNEES, { p: [105, 122], t: 168, l1: [-30, 95], l2: [-30, 95] }) },
    'pil-hundred': { dur: 700, A: { p: [100, 130], t: 200, hd: 205, a1: [8, 8], a2: [8, 8], l1: [-60, 0], l2: [-60, 0] }, B: { p: [100, 130], t: 200, hd: 205, a1: [22, 22], a2: [22, 22], l1: [-60, 0], l2: [-60, 0] } },
    'pil-deadbug': { dur: 3500, A: { p: [100, 130], t: 180, hd: 180, a1: [-90, -90], a2: [-90, -90], l1: [-60, 0], l2: [-60, 0] }, B: { p: [100, 130], t: 180, hd: 180, a1: [-90, -90], a2: [-150, -150], l1: [-12, -10], l2: [-60, 0] } },
    'pil-singleleg': { dur: 2200, A: { p: [100, 130], t: 200, hd: 205, a1: [-60, 20], a2: [-50, 25], l1: [-120, 0], l2: [-20, -20] }, B: { p: [100, 130], t: 200, hd: 205, a1: [-50, 25], a2: [-60, 20], l1: [-20, -20], l2: [-120, 0] } },
    'pil-birddog': { dur: 4000, A: TABLE, B: m(TABLE, { a1: [-5, -5], l2: [175, 180], hd: -30 }) },
    'pil-sidelift': { dur: 3000, A: { p: [95, 130], t: 180, hd: 185, a1: [-60, 30], a2: [185, -60], l1: [0, 0], l2: [0, 0] }, B: { p: [95, 130], t: 180, hd: 185, a1: [-60, 30], a2: [185, -60], l1: [-25, -25], l2: [0, 0] } },
    'pil-clam': { dur: 3000, A: { p: [95, 126], t: 180, hd: 185, a1: [-60, 30], a2: [185, -60], l1: [12, 165], l2: [15, 165] }, B: { p: [95, 126], t: 180, hd: 185, a1: [-60, 30], a2: [185, -60], l1: [-15, 150], l2: [15, 165] } },
    'pil-plank': { dur: 4000, A: { p: [69.7, 112.3], t: -27.3, hd: -20, a1: [90, 90], a2: [90, 90], l1: [152.7, 152.7], l2: [152.7, 152.7] }, B: { p: [70, 111], t: -26, hd: -25, a1: [88, 90], a2: [88, 90], l1: [153.5, 153.5], l2: [153.5, 153.5] } },
    'pil-swimming': { dur: 900, A: { p: [90, 130], t: 0, hd: -15, a1: [-12, -12], a2: [4, 4], l1: [190, 190], l2: [172, 172] }, B: { p: [90, 130], t: 0, hd: -15, a1: [4, 4], a2: [-12, -12], l1: [172, 172], l2: [190, 190] } },
    'pil-rollup': { dur: 5000, A: { p: [80, 130], t: 180, hd: 180, a1: [180, 180], a2: [178, 178], l1: [0, 0], l2: [0, 0] }, B: m(SEATED, { t: -20, hd: -5, a1: [20, 15], a2: [18, 12] }) },
  };

  const rad = d => d * Math.PI / 180;
  const step = (pt, ang, len) => [pt[0] + Math.cos(rad(ang)) * len, pt[1] + Math.sin(rad(ang)) * len];
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAng = (a, b, t) => { let d = ((b - a + 540) % 360) - 180; return a + d * t; };

  function mix(A, B, t) {
    const o = { p: [lerp(A.p[0], B.p[0], t), lerp(A.p[1], B.p[1], t)], t: lerpAng(A.t, B.t, t), hd: lerpAng(A.hd, B.hd, t), c: lerp(A.c || 0, B.c || 0, t), belly: lerp(A.belly || 0, B.belly || 0, t) };
    for (const k of ['a1', 'a2', 'l1', 'l2']) o[k] = [lerpAng(A[k][0], B[k][0], t), lerpAng(A[k][1], B[k][1], t)];
    return o;
  }

  const seg = (pts, w, color) => {
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 6}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };

  function draw(P) {
    const pel = P.p, neck = step(pel, P.t, L.torso), head = step(neck, P.hd, L.neck);
    const limb = (root, a, l1, l2) => { const j = step(root, a[0], l1); return [root, j, step(j, a[1], l2)]; };
    const arm1 = limb(neck, P.a1, L.up, L.fore), arm2 = limb(neck, P.a2, L.up, L.fore);
    const leg1 = limb(pel, P.l1, L.thigh, L.shin), leg2 = limb(pel, P.l2, L.thigh, L.shin);
    // torso as a gentle curve (cat/cow use c)
    const mx = (pel[0] + neck[0]) / 2, my = (pel[1] + neck[1]) / 2;
    const ux = (neck[0] - pel[0]) / L.torso, uy = (neck[1] - pel[1]) / L.torso;
    const cx = mx + uy * (P.c || 0), cy = my - ux * (P.c || 0);
    const torsoD = `M${pel[0].toFixed(1)} ${pel[1].toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${neck[0].toFixed(1)} ${neck[1].toFixed(1)}`;
    // face direction: perpendicular to neck→head, toward the figure's front
    const hx = (head[0] - neck[0]) / L.neck, hy = (head[1] - neck[1]) / L.neck;
    const fx = -hy, fy = hx;
    const eye = [head[0] + fx * 5 + hx * 2, head[1] + fy * 5 + hy * 2];
    const blush = [head[0] + fx * 3 - hx * 4, head[1] + fy * 3 - hy * 4];
    const mouthA = [head[0] + fx * 9 - hx * 3, head[1] + fy * 9 - hy * 3];
    const leafBase = [head[0] + hx * 13, head[1] + hy * 13];
    const leafTip = [head[0] + hx * 24 + fx * 6, head[1] + hy * 24 + fy * 6];
    const leafCtl = [head[0] + hx * 16 + fx * 12, head[1] + hy * 16 + fy * 12];
    const leafCtl2 = [head[0] + hx * 26 - fx * 2, head[1] + hy * 26 - fy * 2];
    const belly = P.belly ? (() => { const fxb = fx >= 0 ? 1 : -1; return `<ellipse cx="${(mx + fxb * (9 + P.belly * 5)).toFixed(1)}" cy="${(my + 6).toFixed(1)}" rx="${(5 + P.belly * 4).toFixed(1)}" ry="9" fill="#ff9eb5" stroke="${INK}" stroke-width="3"/>`; })() : '';
    return `<rect x="10" y="140" width="180" height="8" rx="4" fill="#ffd166" stroke="${INK}" stroke-width="3"/>
      <g opacity=".55">${seg(leg2, 10, '#9b84d6')}${seg(arm2, 8, '#7fd1a8')}</g>
      ${belly}
      <path d="${torsoD}" fill="none" stroke="${INK}" stroke-width="25" stroke-linecap="round"/><path d="${torsoD}" fill="none" stroke="#ff9eb5" stroke-width="19" stroke-linecap="round"/>
      ${seg(leg1, 10, '#9b84d6')}${seg(arm1, 8, '#7fd1a8')}
      <path d="M${leafBase[0].toFixed(1)} ${leafBase[1].toFixed(1)} Q${leafCtl[0].toFixed(1)} ${leafCtl[1].toFixed(1)} ${leafTip[0].toFixed(1)} ${leafTip[1].toFixed(1)} Q${leafCtl2[0].toFixed(1)} ${leafCtl2[1].toFixed(1)} ${leafBase[0].toFixed(1)} ${leafBase[1].toFixed(1)}z" fill="#5cc28f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="${head[0].toFixed(1)}" cy="${head[1].toFixed(1)}" r="13" fill="#a8e6c4" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="${eye[0].toFixed(1)}" cy="${eye[1].toFixed(1)}" r="2.6" fill="${INK}"/>
      <circle cx="${blush[0].toFixed(1)}" cy="${blush[1].toFixed(1)}" r="3.2" fill="#ff9eb5" opacity=".9"/>
      <circle cx="${mouthA[0].toFixed(1)}" cy="${mouthA[1].toFixed(1)}" r="1.8" fill="${INK}"/>`;
  }

  const ease = t => 0.5 - Math.cos(Math.PI * t) / 2;
  function svgFor(id, t = 0) {
    const P = POSES[id]; if (!P) return '';
    return `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img">${draw(mix(P.A, P.B, t))}</svg>`;
  }

  // One animation loop for every figure on the page: elements with data-pose="<id>".
  let running = false, last = 0;
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(now) {
    const els = document.querySelectorAll('[data-pose]');
    if (!els.length) { running = false; return; }
    if (now - last < 33) { requestAnimationFrame(loop); return; } // ~30 fps is plenty for these loops
    last = now;
    const vh = innerHeight;
    els.forEach(el => {
      const P = POSES[el.dataset.pose]; if (!P) return;
      const rc = el.getBoundingClientRect();
      if ((rc.bottom < 0 || rc.top > vh || !rc.width) && el.firstChild) return; // off screen: skip
      if (still()) { if (!el.firstChild) el.innerHTML = svgFor(el.dataset.pose, 1); return; }
      const ph = (now % P.dur) / P.dur;
      const t = ease(ph < .5 ? ph * 2 : 2 - ph * 2);
      el.innerHTML = svgFor(el.dataset.pose, t);
    });
    requestAnimationFrame(loop);
  }
  function animate() { if (!running) { running = true; requestAnimationFrame(loop); } }

  window.UZHU_POSES = { ids: Object.keys(POSES), svgFor, animate, dur: id => POSES[id]?.dur || 4000 };
})();
