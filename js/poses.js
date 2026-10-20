/* Animated cartoon exercise figures. Each move has two key poses (A, B) described by
   forward kinematics: pelvis position, torso/head direction and absolute limb angles in degrees
   (screen coordinates: 0 = right, 90 = down, -90 = up, 180 = left). The figure loops A → B → A. */
(function () {
  const INK = '#5b4343'; // soft brown for the face only; everything else is painted in pastel washes
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

  /* Moves for the 21-day program. A limb may be given as a target point instead of angles:
     { to: [x, y], b: ±1 } is solved with two-bone IK (b picks which way the elbow/knee bends;
     legs default to knee-forward, arms to elbow-down). `prop` adds a chair, wall or step. */
  const HIPS = { to: 'hip' }; // hands on hips
  const PLANK_UP = { p: [110.3, 113.4], t: -26, hd: -22, a1: { to: [148, 140], b: -1 }, a2: { to: [146, 140], b: -1 }, l1: [154, 154], l2: [154, 154] };
  Object.assign(POSES, {
    'walk-brisk': { dur: 1000, A: m(STAND, { t: -86, l1: [60, 100], l2: [115, 95], a1: [120, 70], a2: [55, -20] }), B: m(STAND, { t: -86, l1: [115, 95], l2: [60, 100], a1: [55, -20], a2: [120, 70] }) },
    'warm-armcircle': { dur: 2200, A: m(STAND, { a1: [-25, -25], a2: [-35, -35] }), B: m(STAND, { a1: [-155, -155], a2: [-145, -145] }) },
    'warm-shoulderroll': { dur: 2000, A: m(STAND, { a1: [102, 96], a2: [98, 94] }), B: m(STAND, { t: -92, hd: -96, a1: [78, 86], a2: [74, 84] }) },
    'warm-hipcircle': { dur: 3000, A: m(STAND, { p: [96, 84], t: -96, a1: HIPS, a2: HIPS, l1: [86, 86], l2: [84, 84] }), B: m(STAND, { p: [104, 84], t: -84, a1: HIPS, a2: HIPS, l1: [94, 94], l2: [96, 96] }) },
    'warm-neck': { dur: 4000, A: m(STAND, { hd: -118 }), B: m(STAND, { hd: -52 }) },
    'str-chairsquat': { dur: 3600, prop: 'chair', A: m(STAND, { a1: [82, 82], a2: [86, 86] }), B: { p: [74, 110], t: -62, hd: -62, a1: [-8, -8], a2: [-2, -2], l1: { to: [101, 140] }, l2: { to: [99, 140] } } },
    'str-squat': { dur: 3200, A: m(STAND, { a1: [84, 84], a2: [88, 88] }), B: { p: [82, 106], t: -56, hd: -66, a1: [-6, -6], a2: [0, 0], l1: { to: [102, 140] }, l2: { to: [99, 140] } } },
    'str-wallpush': { dur: 3200, prop: 'wallR', A: { p: [119, 87], t: -70, hd: -64, a1: { to: [178, 58] }, a2: { to: [178, 62] }, l1: { to: [101, 140] }, l2: { to: [99, 140] } }, B: { p: [127, 91], t: -58, hd: -48, a1: { to: [178, 58] }, a2: { to: [178, 62] }, l1: { to: [101, 140] }, l2: { to: [99, 140] } } },
    'str-kneepush': { dur: 3200, A: { p: [112.8, 120.7], t: -35.6, hd: -30, a1: { to: [148, 140], b: -1 }, a2: { to: [146, 140], b: -1 }, l1: [144.4, 178], l2: [144.4, 176] }, B: { p: [117.4, 131.2], t: -12, hd: -8, a1: { to: [148, 140], b: -1 }, a2: { to: [146, 140], b: -1 }, l1: [168, 178], l2: [168, 176] } },
    'str-pushup': { dur: 3200, A: PLANK_UP, B: { p: [114.8, 126.4], t: -12, hd: -8, a1: { to: [148, 140], b: -1 }, a2: { to: [146, 140], b: -1 }, l1: [168, 168], l2: [168, 168] } },
    'str-revlunge': { dur: 3600, A: m(STAND, { a1: HIPS, a2: HIPS }), B: { p: [76, 110], t: -90, hd: -90, a1: HIPS, a2: HIPS, l1: { to: [104, 140] }, l2: [112, 172] } },
    'str-calfraise': { dur: 2400, A: m(STAND, {}), B: m(STAND, { p: [100, 80], l1: [92, 100], l2: [88, 100] }) },
    'str-wallsit': { dur: 5000, prop: 'wallL', A: { p: [72, 112], t: -90, hd: -90, a1: [96, 70], a2: [94, 72], l1: [0, 90], l2: [2, 88] }, B: { p: [72, 112], t: -90, hd: -96, a1: [94, 64], a2: [92, 66], l1: [0, 90], l2: [2, 88] } },
    'str-dip': { dur: 3400, prop: 'chair', A: { p: [86, 110], t: -98, hd: -84, a1: { to: [80, 117], b: -1 }, a2: { to: [78, 117], b: -1 }, l1: { to: [146, 140], b: -1 }, l2: { to: [144, 140], b: -1 } }, B: { p: [88, 128], t: -96, hd: -82, a1: { to: [80, 117], b: -1 }, a2: { to: [78, 117], b: -1 }, l1: { to: [146, 140], b: -1 }, l2: { to: [144, 140], b: -1 } } },
    'str-sidelunge': { dur: 3600, A: { p: [100, 88], t: -90, hd: -90, a1: [60, -60], a2: [64, -56], l1: [62, 62], l2: [118, 118] }, B: { p: [88, 108], t: -76, hd: -80, a1: [40, -70], a2: [44, -66], l1: { to: [126, 140] }, l2: { to: [42, 140] } } },
    'str-kickback': { dur: 3000, A: TABLE, B: m(TABLE, { l2: [178, -92], hd: -28 }) },
    'str-hinge': { dur: 3600, A: m(STAND, { a1: [60, -100], a2: [64, -96] }), B: { p: [88, 86], t: -18, hd: -6, a1: [100, -40], a2: [104, -36], l1: { to: [101, 140] }, l2: { to: [99, 140] } } },
    'str-stepup': { dur: 2800, prop: 'step', A: { p: [100, 90], t: -86, hd: -86, a1: [60, -10], a2: [120, 90], l1: { to: [130, 130] }, l2: { to: [96, 140] } }, B: { p: [127, 78], t: -90, hd: -90, a1: [110, 90], a2: [70, 40], l1: { to: [130, 130] }, l2: [96, 150] } },
    'core-sideplank': { dur: 4000, A: { p: [109.2, 128], t: -13, hd: -12, a1: [92, 0], a2: { to: 'hip' }, l1: [168, 168], l2: [170, 170] }, B: { p: [109.2, 124], t: -14.5, hd: -18, a1: [90, 0], a2: [-90, -90], l1: [165.5, 165.5], l2: [167, 167] } },
    'core-bicycle': { dur: 1800, A: { p: [100, 130], t: 200, hd: 205, a1: [250, 25], a2: [242, 30], l1: [-120, 0], l2: [-25, -20] }, B: { p: [100, 130], t: 204, hd: 210, a1: [244, 30], a2: [250, 25], l1: [-25, -20], l2: [-120, 0] } },
    'core-heeltap': { dur: 2600, A: { p: [100, 130], t: 180, hd: 180, a1: [8, 8], a2: [8, 8], l1: [-90, 0], l2: [-90, 0] }, B: { p: [100, 130], t: 180, hd: 180, a1: [8, 8], a2: [8, 8], l1: { to: [142, 137], b: -1 }, l2: [-90, 0] } },
    'core-mountain': { dur: 900, A: PLANK_UP, B: m(PLANK_UP, { l1: [48, 165] }) },
    'cardio-jacks': { dur: 1000, A: m(STAND, {}), B: m(STAND, { p: [100, 82], a1: [-78, -84], a2: [-102, -96], l1: [68, 68], l2: [112, 112] }) },
    'cardio-highknee': { dur: 700, A: m(STAND, { p: [100, 82], l1: [-6, 90], l2: [92, 92], a1: [130, 60], a2: [40, -70] }), B: m(STAND, { p: [100, 82], l1: [92, 92], l2: [-6, 90], a1: [40, -70], a2: [130, 60] }) },
    'cardio-skater': { dur: 1600, A: { p: [92, 104], t: -62, hd: -60, a1: [30, 30], a2: [150, 150], l1: { to: [98, 140] }, l2: [128, 152] }, B: { p: [108, 104], t: -62, hd: -60, a1: [150, 150], a2: [30, 30], l1: [128, 152], l2: { to: [114, 140] } } },
    'cardio-punch': { dur: 900, A: m(STAND, { t: -86, a1: [2, 2], a2: [60, -120], l1: [80, 86], l2: [100, 96] }), B: m(STAND, { t: -86, a1: [60, -120], a2: [2, 2], l1: [80, 86], l2: [100, 96] }) },
    'cardio-burpee': { dur: 3200, A: { p: [86, 106], t: -40, hd: -30, a1: { to: [124, 140], b: -1 }, a2: { to: [122, 140], b: -1 }, l1: { to: [101, 140] }, l2: { to: [99, 140] } }, B: PLANK_UP },
    'bal-oneleg': { dur: 4000, A: m(STAND, { a1: [20, 20], a2: [160, 160], l1: [50, 100] }), B: m(STAND, { a1: [10, 10], a2: [170, 170], l1: [-8, 88] }) },
    'bal-tandem': { dur: 2400, A: m(STAND, { a1: [30, 30], a2: [150, 150], l1: [80, 86], l2: [100, 94] }), B: m(STAND, { a1: [36, 36], a2: [144, 144], l1: [100, 94], l2: [80, 86] }) },
    'bal-sldl': { dur: 4200, A: m(STAND, { a1: [92, 92], a2: [88, 88], l2: [100, 100] }), B: { p: [94, 86], t: -6, hd: 4, a1: [88, 90], a2: [92, 92], l1: [91, 96], l2: [176, 176] } },
    'st-hamstring': { dur: 5000, A: { p: [94, 86], t: -76, hd: -76, a1: HIPS, a2: HIPS, l1: { to: [128, 140] }, l2: { to: [90, 140] } }, B: { p: [88, 90], t: -38, hd: -30, a1: { to: [112, 112] }, a2: { to: [110, 114] }, l1: { to: [128, 140] }, l2: { to: [84, 140] } } },
    'st-quad': { dur: 5000, A: m(STAND, { a2: [-4, -8], a1: { to: [87, 89], b: -1 }, l1: [100, -112] }), B: m(STAND, { hd: -94, a2: [-8, -14], a1: { to: [85, 86], b: -1 }, l1: [104, -110] }) },
    'st-chest': { dur: 5000, A: m(STAND, { a1: { to: [84, 100], b: -1 }, a2: { to: [82, 101], b: -1 } }), B: m(STAND, { t: -93, hd: -102, a1: { to: [76, 96], b: -1 }, a2: { to: [74, 97], b: -1 } }) },
    'st-figure4': { dur: 5000, A: m(SUPINE_KNEES, { l2: [-40, 90], l1: [-70, 20] }), B: m(SUPINE_KNEES, { t: 176, hd: 186, a1: { to: [112, 106] }, a2: { to: [114, 104] }, l2: [-72, 22], l1: [-96, 8] }) },
    'st-calf': { dur: 5000, prop: 'wallR', A: { p: [116, 90], t: -66, hd: -62, a1: { to: [178, 62] }, a2: { to: [178, 66] }, l1: { to: [138, 140] }, l2: { to: [78, 140] } }, B: { p: [122, 94], t: -60, hd: -54, a1: { to: [178, 62] }, a2: { to: [178, 66] }, l1: { to: [138, 140] }, l2: { to: [76, 140] } } },
  });

  // Resolve target-point limbs into angles once, so mix() stays a plain angle interpolation.
  function ik(root, to, l1, l2, b) {
    const dx = to[0] - root[0], dy = to[1] - root[1];
    const d = Math.max(Math.abs(l1 - l2) + .01, Math.min(l1 + l2 - .01, Math.hypot(dx, dy)));
    const base = Math.atan2(dy, dx), a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
    const up = base + b * a, j = [root[0] + Math.cos(up) * l1, root[1] + Math.sin(up) * l1];
    return [up * 180 / Math.PI, Math.atan2(to[1] - j[1], to[0] - j[0]) * 180 / Math.PI];
  }
  function solve(K) {
    const o = Object.assign({}, K), r = d => d * Math.PI / 180;
    const neck = [o.p[0] + Math.cos(r(o.t)) * L.torso, o.p[1] + Math.sin(r(o.t)) * L.torso];
    ['a1', 'a2', 'l1', 'l2'].forEach(k => {
      const v = o[k]; if (Array.isArray(v)) return;
      const arm = k[0] === 'a', to = v.to === 'hip' ? [o.p[0] + 9, o.p[1] - 5] : v.to;
      o[k] = ik(arm ? neck : o.p, to, arm ? L.up : L.thigh, arm ? L.fore : L.shin, v.b != null ? v.b : (arm ? 1 : -1));
    });
    return o;
  }
  Object.values(POSES).forEach(P => { P.A = solve(P.A); P.B = solve(P.B); });

  const rad = d => d * Math.PI / 180;
  const step = (pt, ang, len) => [pt[0] + Math.cos(rad(ang)) * len, pt[1] + Math.sin(rad(ang)) * len];
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAng = (a, b, t) => { let d = ((b - a + 540) % 360) - 180; return a + d * t; };

  function mix(A, B, t) {
    const o = { p: [lerp(A.p[0], B.p[0], t), lerp(A.p[1], B.p[1], t)], t: lerpAng(A.t, B.t, t), hd: lerpAng(A.hd, B.hd, t), c: lerp(A.c || 0, B.c || 0, t), belly: lerp(A.belly || 0, B.belly || 0, t) };
    for (const k of ['a1', 'a2', 'l1', 'l2']) o[k] = [lerpAng(A[k][0], B[k][0], t), lerpAng(A[k][1], B[k][1], t)];
    return o;
  }

  // Watercolor look without a per-frame SVG filter (figures re-render ~30 times a second): each stroke is a darker,
  // slightly offset wash (pooled pigment), the main wash, and a faint light streak; no hard ink outlines.
  const C = { leg: ['#b9a8e3', '#8f7cc0'], arm: ['#a9d18e', '#76a862'], body: ['#f5b3bb', '#d48791'], head: ['#c3dc9a', '#8fb069'], leaf: ['#8fbf7f', '#5f9452'] };
  const ln = (d, c, w, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${x}/>`;
  const wash = (d, w, [c, dk]) => ln(d, dk, w + 3, ' opacity=".5" transform="translate(1.3 1.8)"') + ln(d, dk, w + 2.2, ' opacity=".55"') + ln(d, c, w) + ln(d, '#fff', Math.max(1.5, w / 4), ' opacity=".28" transform="translate(-1 -1.2)"');
  const seg = (pts, w, color) => wash('M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), w, color);
  const box = (x, y, w, h, c, dk) => `<rect x="${x + 1.3}" y="${y + 1.8}" width="${w}" height="${h}" rx="4" fill="${dk}" opacity=".45"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}" stroke="${dk}" stroke-width="1.6" stroke-opacity=".55"/>`;

  const PROPS = {
    chair: wash('M46 122 V140 M78 122 V140 M44 116 V78', 3.5, ['#e9b48f', '#b98260']) + box(42, 114, 40, 7, '#f6c4a2', '#c48f6b'),
    wallR: box(181, 20, 10, 122, '#ddd0f0', '#a996c8'),
    wallL: box(49, 20, 10, 122, '#ddd0f0', '#a996c8'),
    step: box(110, 130, 50, 11, '#f6c4a2', '#c48f6b'),
  };
  function draw(P, prop) {
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
    const belly = P.belly ? (() => { const fxb = fx >= 0 ? 1 : -1; return `<ellipse cx="${(mx + fxb * (9 + P.belly * 5)).toFixed(1)}" cy="${(my + 6).toFixed(1)}" rx="${(5 + P.belly * 4).toFixed(1)}" ry="9" fill="#f6a9b6" stroke="#d48791" stroke-width="1.8" stroke-opacity=".7"/>`; })() : '';
    const hx0 = head[0].toFixed(1), hy0 = head[1].toFixed(1);
    return `<path d="M14 144 C60 139 140 139 186 144 C188 147 186 149 182 149 C130 151 70 151 18 149 C13 149 12 146 14 144z" fill="#f2cf86" opacity=".55" transform="translate(1 1.5)"/><path d="M14 143 C60 138 140 138 186 143 C188 146 186 148 182 148 C130 150 70 150 18 148 C13 148 12 145 14 143z" fill="#f8de9c"/>${prop ? PROPS[prop] || '' : ''}
      <g opacity=".5">${seg(leg2, 10, C.leg)}${seg(arm2, 8, C.arm)}</g>
      ${belly}
      ${wash(torsoD, 20, C.body)}
      ${seg(leg1, 10, C.leg)}${seg(arm1, 8, C.arm)}
      <path d="M${leafBase[0].toFixed(1)} ${leafBase[1].toFixed(1)} Q${leafCtl[0].toFixed(1)} ${leafCtl[1].toFixed(1)} ${leafTip[0].toFixed(1)} ${leafTip[1].toFixed(1)} Q${leafCtl2[0].toFixed(1)} ${leafCtl2[1].toFixed(1)} ${leafBase[0].toFixed(1)} ${leafBase[1].toFixed(1)}z" fill="${C.leaf[0]}" stroke="${C.leaf[1]}" stroke-width="1.6" stroke-opacity=".7" stroke-linejoin="round"/>
      <circle cx="${(head[0] + 1.3).toFixed(1)}" cy="${(head[1] + 1.8).toFixed(1)}" r="13.5" fill="${C.head[1]}" opacity=".5"/><circle cx="${hx0}" cy="${hy0}" r="13" fill="${C.head[0]}" stroke="${C.head[1]}" stroke-width="2" stroke-opacity=".6"/><circle cx="${(head[0] - 4).toFixed(1)}" cy="${(head[1] - 5).toFixed(1)}" r="3.4" fill="#fff" opacity=".4"/>
      <circle cx="${eye[0].toFixed(1)}" cy="${eye[1].toFixed(1)}" r="2.4" fill="${INK}"/>
      <circle cx="${blush[0].toFixed(1)}" cy="${blush[1].toFixed(1)}" r="3.2" fill="#f29aa5" opacity=".65"/>
      <circle cx="${mouthA[0].toFixed(1)}" cy="${mouthA[1].toFixed(1)}" r="1.8" fill="${INK}"/>`;
  }

  const ease = t => 0.5 - Math.cos(Math.PI * t) / 2;
  function svgFor(id, t = 0) {
    const P = POSES[id]; if (!P) return '';
    return `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" role="img">${draw(mix(P.A, P.B, t), P.prop)}</svg>`;
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
