/* Uzhu sleep sounds: every layer is synthesized in the browser with Web Audio (no audio files, works offline).
   UZHU_SOUND.layers  → [{id, name, icon}]
   UZHU_SOUND.set(id, volume 0..1)   start/stop/fade a layer (0 = off)
   UZHU_SOUND.timer(minutes|0)       fade everything out over the last minute; 0 = no timer
   UZHU_SOUND.stopAll(), .state(), .onchange = fn */
(function () {
  'use strict';
  const LAYERS = [
    { id: 'rain', name: 'باران', icon: '🌧' },
    { id: 'waves', name: 'موج دریا', icon: '🌊' },
    { id: 'wind', name: 'باد ملایم', icon: '🍃' },
    { id: 'fire', name: 'شومینه', icon: '🔥' },
    { id: 'night', name: 'شب تابستون', icon: '🦗' },
    { id: 'pink', name: 'نویز صورتی', icon: '🌸' },
    { id: 'brown', name: 'نویز قهوه‌ای', icon: '🟤' },
    { id: 'lullaby', name: 'لالایی آرام', icon: '🎵' },
    { id: 'drone', name: 'آوای آرام‌بخش', icon: '🕯' },
  ];
  let ctx = null, master = null, timerId = null, endAt = 0;
  const live = {}; // id -> {gain, stop(), vol}
  const bufs = {};
  const SEC = 12; // length of each looped noise buffer

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 1;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return ctx;
  }
  // Noise buffers. Pink uses Paul Kellet's filter; brown is integrated white noise.
  function noise(kind) {
    if (bufs[kind]) return bufs[kind];
    const n = ctx.sampleRate * SEC, b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === 'white') d[i] = w * .5;
        else if (kind === 'pink') {
          b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
          b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
        } else { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
      }
      // Smooth the loop seam so it never clicks.
      const f = Math.floor(ctx.sampleRate * .05);
      for (let i = 0; i < f; i++) { const k = i / f; d[i] = d[i] * k + d[n - f + i] * (1 - k); }
      if (kind === 'drops' || kind === 'crackle') {
        d.fill(0);
        const count = kind === 'drops' ? SEC * 70 : SEC * 9;
        for (let c = 0; c < count; c++) {
          const at = Math.floor(Math.random() * (n - 4000)), amp = kind === 'drops' ? .15 + Math.random() * .35 : .3 + Math.random() * .7;
          const len = kind === 'drops' ? 200 + Math.random() * 500 : 60 + Math.random() * 300;
          for (let j = 0; j < len; j++) d[at + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (len / 5));
        }
      }
    }
    return (bufs[kind] = b);
  }
  function src(kind) { const s = ctx.createBufferSource(); s.buffer = noise(kind); s.loop = true; s.loopStart = 0; s.loopEnd = SEC - .05; s.start(0, Math.random() * (SEC - 1)); return s; }
  function filt(type, f, q) { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; return x; }
  function lfo(rate, depth, target, offset) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = rate; g.gain.value = depth; o.connect(g); g.connect(target);
    if (offset != null) target.value = offset; o.start(); return o;
  }
  const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };

  // Each builder wires its sound into `out` and returns a stop function.
  const BUILD = {
    rain(out) {
      const a = src('pink'), hp = filt('highpass', 500), lp = filt('lowpass', 7000), g1 = ctx.createGain(); g1.gain.value = .9;
      const d = src('drops'), dl = filt('bandpass', 2500, .7), g2 = ctx.createGain(); g2.gain.value = .6;
      chain(a, hp, lp, g1, out); chain(d, dl, g2, out);
      return () => { a.stop(); d.stop(); };
    },
    waves(out) {
      const a = src('brown'), lp = filt('lowpass', 700), g = ctx.createGain();
      chain(a, lp, g, out);
      const o1 = lfo(.075, .45, g.gain, .55), o2 = lfo(.075, 350, lp.frequency, 750);
      const b = src('pink'), hp = filt('bandpass', 1800, .5), g2 = ctx.createGain(); chain(b, hp, g2, out); const o3 = lfo(.075, .12, g2.gain, .12);
      return () => { a.stop(); b.stop(); o1.stop(); o2.stop(); o3.stop(); };
    },
    wind(out) {
      const a = src('white'), bp = filt('bandpass', 500, 1.2), g = ctx.createGain(); g.gain.value = .7;
      chain(a, bp, g, out);
      const o1 = lfo(.05, 260, bp.frequency, 520), o2 = lfo(.11, .25, g.gain, .6);
      return () => { a.stop(); o1.stop(); o2.stop(); };
    },
    fire(out) {
      const a = src('brown'), lp = filt('lowpass', 400), g = ctx.createGain(); g.gain.value = .8;
      const c = src('crackle'), hp = filt('highpass', 1200), g2 = ctx.createGain(); g2.gain.value = .5;
      chain(a, lp, g, out); chain(c, hp, g2, out);
      return () => { a.stop(); c.stop(); };
    },
    night(out) {
      // Crickets: a high tone gated in quick bursts, plus a soft breeze underneath.
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 4400;
      const gate = ctx.createGain(); gate.gain.value = 0; const g = ctx.createGain(); g.gain.value = .07;
      chain(o, gate, g, out); o.start();
      const l1 = lfo(28, .5, gate.gain, .5), l2 = ctx.createOscillator(), l2g = ctx.createGain(); l2.frequency.value = .9; l2g.gain.value = .07; l2.connect(l2g); l2g.connect(g.gain); l2.start();
      const b = src('pink'), lp = filt('lowpass', 900), g3 = ctx.createGain(); g3.gain.value = .25; chain(b, lp, g3, out);
      return () => { o.stop(); l1.stop(); l2.stop(); b.stop(); };
    },
    pink(out) { const a = src('pink'), g = ctx.createGain(); g.gain.value = .8; chain(a, g, out); return () => a.stop(); },
    brown(out) { const a = src('brown'), lp = filt('lowpass', 1200), g = ctx.createGain(); g.gain.value = .8; chain(a, lp, g, out); return () => a.stop(); },
    lullaby(out) {
      // A slow generative melody in a major pentatonic scale, through a soft echo.
      const notes = [220, 246.94, 277.18, 329.63, 369.99, 440, 493.88, 554.37];
      const lp = filt('lowpass', 1800), dly = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
      dly.delayTime.value = .48; fb.gain.value = .38; wet.gain.value = .45;
      lp.connect(out); lp.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(wet); wet.connect(out);
      let alive = true, last = 3, t;
      const play = () => {
        if (!alive) return;
        const step = [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)];
        last = Math.max(0, Math.min(notes.length - 1, last + step));
        const now = ctx.currentTime;
        [[notes[last], .16, 'sine'], [notes[last] / 2, .08, 'triangle']].forEach(([f, v, type]) => {
          const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
          g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(v, now + .9); g.gain.exponentialRampToValueAtTime(.0001, now + 5.5);
          o.connect(g); g.connect(lp); o.start(now); o.stop(now + 5.6);
        });
        t = setTimeout(play, 1800 + Math.random() * 2200);
      };
      play();
      return () => { alive = false; clearTimeout(t); };
    },
    drone(out) {
      // A warm, slowly breathing chord (A, E, A, C#) with gentle detune.
      const lp = filt('lowpass', 900), g = ctx.createGain(); g.gain.value = .5; lp.connect(g); g.connect(out);
      const os = [110, 164.81, 220, 277.18].flatMap(f => [-3, 3].map(det => { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = det; const og = ctx.createGain(); og.gain.value = .06; o.connect(og); og.connect(lp); o.start(); return o; }));
      const l = lfo(.1, .25, g.gain, .5), l2 = lfo(.04, 300, lp.frequency, 900);
      return () => { os.forEach(o => o.stop()); l.stop(); l2.stop(); };
    },
  };

  function set(id, vol) {
    if (!BUILD[id] || !ensure()) return false;
    vol = Math.max(0, Math.min(1, vol));
    const now = ctx.currentTime, L = live[id];
    if (vol === 0) {
      if (L) { L.gain.gain.cancelScheduledValues(now); L.gain.gain.setValueAtTime(L.gain.gain.value, now); L.gain.gain.linearRampToValueAtTime(0, now + 1.2); const s = L.stop; setTimeout(() => { try { s(); } catch (e) {} L.gain.disconnect(); }, 1400); delete live[id]; }
    } else if (L) { L.gain.gain.cancelScheduledValues(now); L.gain.gain.setValueAtTime(L.gain.gain.value, now); L.gain.gain.linearRampToValueAtTime(vol * vol, now + .3); L.vol = vol; }
    else {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(master);
      const stop = BUILD[id](g); g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol * vol, now + 2);
      live[id] = { gain: g, stop, vol };
    }
    media(); api.onchange && api.onchange();
    return true;
  }
  function stopAll() { Object.keys(live).forEach(id => set(id, 0)); timer(0); }
  function timer(min) {
    clearTimeout(timerId); timerId = null; endAt = 0;
    if (master && ctx) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(1, ctx.currentTime); }
    if (min > 0) {
      endAt = Date.now() + min * 60000;
      const fade = Math.min(60, min * 30);
      timerId = setTimeout(() => {
        if (ctx) { master.gain.setValueAtTime(1, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + fade); }
        // Already silent: stop the layers at once (a fade-out here would restart them at full volume).
        timerId = setTimeout(() => { Object.keys(live).forEach(id => { try { live[id].stop(); } catch (e) {} live[id].gain.disconnect(); delete live[id]; }); endAt = 0; timerId = null; if (ctx) master.gain.setValueAtTime(1, ctx.currentTime + .1); media(); api.onchange && api.onchange(); }, fade * 1000 + 200);
      }, min * 60000 - fade * 1000);
    }
    api.onchange && api.onchange();
  }
  function media() {
    if (!('mediaSession' in navigator)) return;
    try {
      const on = Object.keys(live);
      navigator.mediaSession.metadata = on.length ? new MediaMetadata({ title: on.map(id => LAYERS.find(l => l.id === id).name).join(' + '), artist: 'اوژو · صداهای خواب' }) : null;
      navigator.mediaSession.setActionHandler('pause', stopAll);
      navigator.mediaSession.setActionHandler('stop', stopAll);
    } catch (e) {}
  }
  const api = {
    layers: LAYERS, set, stopAll, timer,
    supported: () => !!(window.AudioContext || window.webkitAudioContext),
    state: () => ({ on: Object.fromEntries(Object.entries(live).map(([k, v]) => [k, v.vol])), endAt }),
    chime() { if (!ensure()) return; const o = ctx.createOscillator(), g = ctx.createGain(), n = ctx.currentTime; o.frequency.value = 528; g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(.12, n + .05); g.gain.exponentialRampToValueAtTime(.0001, n + 2.5); o.connect(g); g.connect(master); o.start(n); o.stop(n + 2.6); },
    onchange: null,
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && Object.keys(live).length && ctx.state !== 'running') ctx.resume().catch(() => {}); });
  window.UZHU_SOUND = api;
})();
