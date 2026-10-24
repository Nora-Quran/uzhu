/* Painted icons: every emoji the app renders is swapped, on screen only, for a small watercolor drawing in the mascot's style.
   Drawings live once in a hidden SVG sprite (<symbol>) and are shown with <use>, so a page with 200 icons stays light.
   API: window.UZHU_ICONS = { add({emoji: innerSvg}), has(e), html(e), scan(root), kit }.
   innerSvg is drawn on a 64×64 canvas; kit has the shared painting helpers. Text inputs, selects and the tab title keep emoji. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#5b4343', BLUSH = '#f29aa5';
  const map = new Map();          // normalized emoji -> symbol id
  const pending = new Map();      // normalized emoji -> inner svg (not yet in the sprite)
  let sprite = null, n = 0;

  const norm = e => e.replace(/️/g, '');
  // Emoji pictographs (with optional variation selector, skin tone and ZWJ sequences). Plain UI glyphs (← ✓ ✕ ▶ ★) are left alone.
  const RE = /(?:[\u{1F000}-\u{1FAFF}☀-➿⭐⭕⌚⌛⏩-⏺⤴⤵㊗㊙‼⁉ℹⓂ])(?:️|[\u{1F3FB}-\u{1F3FF}]|‍[\u{1F000}-\u{1FAFF}☀-➿]️?)*/gu;

  function shade(hex, k = .32) {
    const v = parseInt(hex.slice(1), 16), r = v >> 16, g = (v >> 8) & 255, b = v & 255;
    const m = (c, t) => Math.round(c + (t - c) * k);
    return '#' + [m(r, 120), m(g, 72), m(b, 70)].map(c => c.toString(16).padStart(2, '0')).join('');
  }
  // Painting helpers sized for a 64×64 icon (thinner rims, smaller pooling offset than the big scenes).
  const paint = (d, c, o = {}) => {
    const dk = o.dk || shade(c), dx = o.dx ?? 1, dy = o.dy ?? 1.4;
    return `<path d="${d}" fill="${dk}" opacity="${o.po ?? .38}" transform="translate(${dx} ${dy})"/><path d="${d}" fill="${c}" opacity="${o.op ?? .95}"/><path d="${d}" fill="none" stroke="${dk}" stroke-width="${o.sw ?? 1.3}" opacity=".45"/>`;
  };
  const ell = (cx, cy, rx, ry = rx) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
  const rr = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
  const hi = (d, w = 2.4, op = .6) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;
  const line = (d, c = INK, w = 2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const brush = (d, c, w = 4) => `<path d="${d}" fill="none" stroke="${shade(c)}" stroke-width="${w}" stroke-linecap="round" opacity=".4" transform="translate(.8 1.1)"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const dot = (x, y, r = 1.6, c = INK) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  // Tiny mascot-style face: dot eyes, small smile, blush. mood: happy | calm | sad | wow | sleep | flat | worried | angry
  function face(cx, cy, s = 1, mood = 'happy') {
    const L = cx - 6 * s, R = cx + 6 * s, w = 1.7 * s;
    const ln = d => line(d, INK, w);
    let eyes = dot(L, cy, 1.7 * s) + dot(R, cy, 1.7 * s);
    if (mood === 'calm' || mood === 'sleep') eyes = ln(`M${L - 2.4 * s} ${cy} q${2.4 * s} ${2 * s} ${4.8 * s} 0`) + ln(`M${R - 2.4 * s} ${cy} q${2.4 * s} ${2 * s} ${4.8 * s} 0`);
    if (mood === 'angry') eyes += ln(`M${L - 3 * s} ${cy - 4 * s} l${5 * s} ${2 * s}`) + ln(`M${R + 3 * s} ${cy - 4 * s} l${-5 * s} ${2 * s}`);
    if (mood === 'worried') eyes += ln(`M${L - 3 * s} ${cy - 3 * s} l${5 * s} ${-1.5 * s}`) + ln(`M${R + 3 * s} ${cy - 3 * s} l${-5 * s} ${-1.5 * s}`);
    const my = cy + 5 * s;
    const mouth = {
      happy: ln(`M${cx - 3.2 * s} ${my} q${3.2 * s} ${3.2 * s} ${6.4 * s} 0`),
      calm: ln(`M${cx - 2.6 * s} ${my} q${2.6 * s} ${2.2 * s} ${5.2 * s} 0`),
      sleep: `<ellipse cx="${cx}" cy="${my + .6 * s}" rx="${1.8 * s}" ry="${1.4 * s}" fill="${INK}"/>`,
      wow: `<ellipse cx="${cx}" cy="${my + .8 * s}" rx="${2.2 * s}" ry="${2.8 * s}" fill="${INK}"/>`,
      sad: ln(`M${cx - 3 * s} ${my + 2 * s} q${3 * s} ${-3 * s} ${6 * s} 0`),
      worried: ln(`M${cx - 3 * s} ${my + 2 * s} q${3 * s} ${-2.4 * s} ${6 * s} 0`),
      angry: ln(`M${cx - 3 * s} ${my + 2 * s} q${3 * s} ${-3 * s} ${6 * s} 0`),
      flat: ln(`M${cx - 3 * s} ${my + 1 * s} h${6 * s}`),
    }[mood] || '';
    const cheeks = mood === 'angry' ? '' : `<ellipse cx="${L - 2.5 * s}" cy="${cy + 3.6 * s}" rx="${2.6 * s}" ry="${1.7 * s}" fill="${BLUSH}" opacity=".7"/><ellipse cx="${R + 2.5 * s}" cy="${cy + 3.6 * s}" rx="${2.6 * s}" ry="${1.7 * s}" fill="${BLUSH}" opacity=".7"/>`;
    return cheeks + eyes + mouth;
  }
  // Palette shared by every icon file, so the set reads as one family.
  const C = { peach: '#f6b48f', butter: '#f7d77e', rose: '#ec9aa6', pink: '#f5b9c4', sage: '#a9c79a', leaf: '#86b37a', mint: '#a8d8c8', sky: '#a9cbe8', blue: '#7fa9d6', lav: '#c3b3e3', cream: '#fbf1dc', sand: '#e8cfa6', brown: '#b98762', cocoa: '#8a5a44', red: '#e57a70', orange: '#f0a35e', gray: '#c9c3c0', ink: INK, white: '#fffdf8', gold: '#e9b949', blush: BLUSH };

  // One shared watercolor filter for the sprite: gentle edge wobble plus paper grain, tuned for small sizes.
  const FILTER = `<filter id="uzi-wc" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="g"/><feColorMatrix in="g" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 .62" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>`;

  function ensureSprite() {
    if (sprite && sprite.isConnected) return sprite;
    sprite = document.createElementNS(NS, 'svg');
    sprite.setAttribute('aria-hidden', 'true');
    sprite.setAttribute('id', 'uzi-sprite');
    sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none');
    sprite.innerHTML = `<defs>${FILTER}</defs>`;
    (document.body || document.documentElement).appendChild(sprite);
    return sprite;
  }
  function flush() {
    if (!pending.size || !document.body) return;
    const s = ensureSprite();
    let html = '';
    pending.forEach((inner, key) => { html += `<symbol id="${map.get(key)}" viewBox="0 0 64 64" overflow="visible"><g filter="url(#uzi-wc)">${inner}</g></symbol>`; });
    pending.clear();
    s.insertAdjacentHTML('beforeend', html);
  }
  function add(obj) {
    for (const [e, inner] of Object.entries(obj)) {
      const k = norm(e);
      if (!map.has(k)) map.set(k, 'uzi-' + (++n));
      pending.set(k, inner);
    }
    if (document.body) { flush(); queue(document.body); }
  }
  const has = e => map.has(norm(e));
  const html = e => {
    const id = map.get(norm(e));
    return id ? `<i class="uzi" aria-hidden="true"><svg viewBox="0 0 64 64"><use href="#${id}"/></svg></i>` : e;
  };
  const icon = (e) => {
    const id = map.get(norm(e));
    const i = document.createElement('i');
    i.className = 'uzi'; i.setAttribute('aria-hidden', 'true');
    i.innerHTML = `<svg viewBox="0 0 64 64"><use href="#${id}"/></svg>`;
    return i;
  };

  // Places where an <svg> can't go or where the raw text matters.
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'OPTGROUP', 'TITLE', 'NOSCRIPT', 'CODE', 'PRE']);
  function skip(node) {
    for (let el = node.parentElement; el; el = el.parentElement) {
      if (SKIP.has(el.tagName) || el.isContentEditable || el.hasAttribute('data-noicon') || el.namespaceURI === NS) return true;
      if (el === document.body) break;
    }
    return false;
  }
  function swapText(t) {
    const s = t.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(s)) return;
    RE.lastIndex = 0;
    let last = 0, m, frag = null;
    while ((m = RE.exec(s))) {
      if (!map.has(norm(m[0]))) continue;
      frag = frag || document.createDocumentFragment();
      if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
      frag.appendChild(icon(m[0]));
      last = m.index + m[0].length;
    }
    if (!frag) return;
    // Drop the space that sat between an icon and its label only when the icon ends up first; keep normal spacing otherwise.
    if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(frag, t);
  }
  function scan(root) {
    if (!root || !map.size) return;
    if (root.nodeType === 3) { if (!skip(root)) swapText(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.tagName) || root.namespaceURI === NS) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: t => { RE.lastIndex = 0; return RE.test(t.nodeValue) && !skip(t) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    const list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(swapText);
  }

  // Batch DOM changes into one pass per frame.
  const todo = new Set();
  let raf = 0;
  function queue(node) {
    todo.add(node);
    if (!raf) raf = requestAnimationFrame(run);
  }
  function run() {
    raf = 0;
    flush();
    const nodes = [...todo]; todo.clear();
    nodes.forEach(nd => { if (nd.isConnected) scan(nd); });
  }
  function start() {
    flush();
    scan(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'characterData') queue(m.target);
        else m.addedNodes.forEach(nd => { if (nd !== sprite) queue(nd); });
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  const css = document.createElement('style');
  css.textContent = `.uzi{display:inline-block;width:1.25em;height:1.25em;vertical-align:-.25em;line-height:1;flex:none;font-style:normal}
.uzi svg{display:block;width:100%;height:100%;overflow:visible}`;
  document.head.appendChild(css);
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  window.UZHU_ICONS = { add, has, html, scan, map, kit: { paint, ell, rr, hi, line, brush, dot, face, shade, C, INK, BLUSH } };
})();
