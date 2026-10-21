/* Uzhu night checklist "paper planner" layout (plugin): a torn cream paper sheet on a patterned table, a washi-taped
   title, ruled checklist lines, sticky-note sections, handwritten margin notes and watercolor decorations.
   The theme (season or occasion) and its drawings come from the app-wide theme module A.season (js/theme.js),
   so the night page always matches the rest of the app; the picker here changes that same app-wide setting.
   Feature keys: 'theme' (whole theme system) and 'nighttheme' (this layout). */
(window.UZHU_PLUGINS = window.UZHU_PLUGINS || []).push(function (A) {
  'use strict';
  const S = A.season; if (!S) return;
  const $ = (s, el = document) => el.querySelector(s);
  const on = k => { const f = A.site?.settings?.features; return !f || f[k] !== false; };
  const esc = A.esc || (s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const el = (tag, cls, html) => { const n = document.createElement(tag); n.className = cls; if (html != null) n.innerHTML = html; return n; };

  function clear(page) {
    const view = page.closest('.view') || page.parentElement;
    page.querySelectorAll('.nt-x').forEach(n => n.remove());
    view.classList.remove('nt-view'); delete view.dataset.nt; page.classList.remove('nt-paper');
  }
  function apply(id) {
    const page = $('.night-page'); if (!page) return;
    clear(page);
    if (!id) return;
    const view = page.closest('.view') || page.parentElement, th = S.T[id];
    view.classList.add('nt-view'); view.dataset.nt = id; page.classList.add('nt-paper');
    page.prepend(el('div', 'nt-x nt-corner nt-tr', S.decor(id, 'tr')));
    page.prepend(el('div', 'nt-x nt-corner nt-tl', S.decor(id, 'tl')));
    const form = $('#nf', page); if (!form) return;
    const sub = $('.nt-submit', form);
    const after = (ref, node) => { if (ref && ref.parentElement === form) ref.after(node); else form.insertBefore(node, sub); };
    // margin notes and gutter art sit in zero-height anchors so they line up with the section next to them
    const note = (i, side) => { const a = el('div', 'nt-x nt-anchor'); a.appendChild(el('p', `nt-note nt-n${i} nt-${side}`, `<span>${esc(th.notes[i])}</span>${S.heart(id)}`)); return a; };
    const gut = S.decor(id, 'gut'), g = (i, side) => el('div', 'nt-x nt-anchor nt-gutonly', `<div class="nt-gut nt-${side} nt-g${i}">${gut[i]}</div>`);
    form.prepend(g(0, 'l'));
    after($('.nt-tasks', form), note(0, 'r'));
    after($('.nt-move', form) || $('.nt-tasks', form), g(1, 'r'));
    after($('.nt-slip', form), g(2, 'l'));
    after($('.nt-crave', form), note(1, 'l'));
    after($('.nt-ref', form), g(3, 'r'));
    const last = note(2, 'c'); last.classList.add('nt-last');
    if (sub) sub.after(last); else form.appendChild(last);
    page.appendChild(el('div', 'nt-x nt-scene', S.decor(id, 'scene').join('')));
  }
  function picker() {
    const cur = S.choice(), auto = S.auto(), opt = k => `<option value="${k}"${cur === k ? ' selected' : ''}>${S.T[k].icon} ${S.T[k].label}</option>`;
    return `<label for="nt-pick">🎨 تم برنامه</label><select id="nt-pick" class="nt-select"><option value="auto"${cur === '' ? ' selected' : ''}>✨ خودکار (${S.T[auto].label})</option>`
      + `<optgroup label="فصل‌ها">${S.ORDER.filter(k => S.T[k].kind === 'season').map(opt).join('')}</optgroup><optgroup label="مناسبت‌ها">${S.ORDER.filter(k => S.T[k].kind === 'occ').map(opt).join('')}</optgroup>`
      + `<option value="plain"${cur === 'plain' ? ' selected' : ''}>◻️ ساده (بدون تم)</option></select>`;
  }
  function mount() {
    const page = $('.night-page'); if (!page) return;
    apply(S.current());
    const row = el('div', 'nt-pick', picker()), head = $('.nt-head', page);
    if (head) head.after(row); else page.prepend(row);
    $('#nt-pick', row).onchange = e => S.set(e.target.value);
  }
  S.onChange(id => { if ($('.night-page') && on('nighttheme')) apply(id); });
  A.H.mount = (A.H.mount || []).concat(r => { if (r === 'night' && on('theme') && on('nighttheme')) { try { mount(); } catch (e) { console.error(e); } } });
  A.nightTheme = { autoTheme: S.auto };
});
