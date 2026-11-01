/* app.js — builds the cards from data.js and drives the keyboard dialog. */
(function () {
  'use strict';

  const { CATS, CHARS } = window.FR_DATA;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const MODS = new Set(['shift', 'altgr', 'capslock', 'alt']);

  // Text printed on the keycap chips (what the key shows when pressed alone).
  const LABEL = {
    sup2: '²', degree: ')', plus: '=', 'diaeresis-circumflex': '^', 'pound-dollar': '$',
    'percent-ugrave': 'ù', 'mu-asterisk': '*', 'less-greater': '<', 'question-comma': ',',
    'dot-semicolon': ';', 'slash-colon': ':', 'section-exclamation': '!',
    shift: 'Maj', capslock: 'Verr Maj', altgr: 'Alt Gr', alt: 'Alt', space: 'Espace',
    enter: 'Entrée', backspace: 'Retour arrière', tab: 'Tab'
  };
  const label = (id) => LABEL[id] || id;
  // Names used in sentences: letters, digits and words stay bare, punctuation gets « la touche ».
  const spoken = (id) => {
    const l = label(id);
    return /^[a-z0-9éèçàù]$/i.test(l) || l.length > 1 ? l : 'la touche «' + l + '»';
  };

  const $ = (id) => document.getElementById(id);

  /* ---------- tiny DOM helper ---------- */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- reading the SVG ---------- */
  const svg = document.getElementById('kbd');
  const SVG_WIDTH = svg.viewBox.baseVal.width;

  // The key face is the 2nd shape (rect or polygon/path) directly inside the key group.
  function faceOf(g) {
    return [...g.children].filter((c) => /^(rect|polygon|path)$/.test(c.localName))[1];
  }
  // Geometry of a face in the group's own coordinates (+ group translation for the centre).
  function faceInfo(g) {
    const f = faceOf(g);
    const t = (g.getAttribute('transform') || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
    const tx = t ? parseFloat(t[1]) : 0;
    let minX, maxX, minY;
    if (f.localName === 'rect') {
      minX = +f.getAttribute('x'); maxX = minX + +f.getAttribute('width'); minY = +f.getAttribute('y');
    } else if (f.hasAttribute('points')) {
      const pts = f.getAttribute('points').trim().split(/\s+/).map((p) => p.split(',').map(Number));
      minX = Math.min(...pts.map((p) => p[0])); maxX = Math.max(...pts.map((p) => p[0]));
      minY = Math.min(...pts.map((p) => p[1]));
    } else {
      const b = f.getBBox(); minX = b.x; maxX = b.x + b.width; minY = b.y;
    }
    return { face: f, maxX, minY, cx: tx + (minX + maxX) / 2 };
  }
  const keyGroup = (id) => document.getElementById('key-' + id);

  // Real typists press the Shift on the opposite side of the main key.
  function shiftFor(mainId) {
    if (!mainId) return ['shift-left', 'shift-right'];           // « Maj » alone: show both
    const g = keyGroup(mainId);
    return [g && faceInfo(g).cx < SVG_WIDTH / 2 ? 'shift-right' : 'shift-left'];
  }

  /* ---------- turning the steps of a card into presses ---------- */
  // Returns { presses:[{keys:[logical ids], ids:[svg ids], n}], badges: Map(svgId -> [numbers]) }
  function resolve(card) {
    const presses = [];
    const badges = new Map();
    let n = 0;
    card.steps.forEach((step) => {
      const main = step.find((k) => !MODS.has(k));
      step.forEach((k) => {
        n += card.noBadge ? 0 : 1;
        const ids = k === 'shift' ? shiftFor(main) : [k];
        presses.push({ key: k, ids, n });
        ids.forEach((id) => {
          if (!badges.has(id)) badges.set(id, []);
          if (n) badges.get(id).push(n);
        });
      });
    });
    return { presses, badges };
  }

  /* ---------- French sentence ---------- */
  function sentence(card) {
    if (card.say) return card.say;
    if (card.typed) return 'Garde ' + spoken(card.steps[0][0]) + ' enfoncée.';   // Alt codes: the pill gives the digits
    const seen = new Set();
    const multi = card.steps.length > 1;
    const parts = card.steps.map((step) => {
      const phrase = (k) => {
        const again = seen.has(k);
        seen.add(k);
        return (again ? 'appuie de nouveau sur ' : 'appuie sur ') + spoken(k);
      };
      if (step.length === 1) return phrase(step[0]);
      const hold = 'garde ' + spoken(step[0]) + ' enfoncée';
      step.forEach((k) => seen.add(k));
      return hold + (multi ? ' et ' : ', puis ') + 'appuie sur ' + spoken(step[1]);
    });
    let s = parts.join(', puis ');
    s = s.charAt(0).toUpperCase() + s.slice(1) + '.';
    if (card.steps.length === 1 && card.steps[0].length === 1 && card.steps[0][0] === 'shift') {
      s = 'Appuie sur Maj (une touche de chaque côté du clavier).';
    }
    return s;
  }

  /* ---------- keycap chips shown in the dialog ---------- */
  const keycap = (text) => el('kbd', 'key', text);
  function renderKeys(card) {
    const box = $('dlg-keys');
    box.replaceChildren();
    card.steps.forEach((step, i) => {
      if (i) box.appendChild(el('span', 'then', 'puis'));
      step.forEach((k, j) => {
        if (j) box.appendChild(el('span', 'plus', '+'));
        box.appendChild(keycap(label(k)));
      });
      if (card.typed && i === card.steps.length - 1) {
        box.appendChild(el('span', 'plus', '+'));
        box.appendChild(keycap(card.typed));
      }
    });
  }

  /* ---------- page generation ---------- */
  function buildCard(card, index) {
    const btn = el('button', 'kc');
    btn.type = 'button';
    btn.dataset.i = index;
    btn.setAttribute('aria-label', 'Voir comment taper ' + card.char + ' (' + card.name + ') sur le clavier');
    btn.appendChild(el('span', 'ch' + (card.char.length > 2 ? ' long' : ''), card.char));
    if (card.cat === 'util') btn.appendChild(el('span', 'nm', card.name));
    return btn;
  }

  function buildPage() {
    const root = document.getElementById('sections');
    CATS.forEach((cat) => {
      const sec = el('section');
      sec.id = 'cat-' + cat.id;
      sec.setAttribute('aria-labelledby', 'h-' + cat.id);
      const h = el('h2', null, cat.title);
      h.id = 'h-' + cat.id;
      sec.appendChild(h);
      if (cat.intro) sec.appendChild(el('p', 'intro', cat.intro));
      const grid = el('div', 'grid');
      CHARS.forEach((c, i) => { if (c.cat === cat.id) grid.appendChild(buildCard(c, i)); });
      sec.appendChild(grid);
      root.appendChild(sec);
    });
  }

  /* ---------- highlighting on the keyboard ---------- */
  function addGlowFilter() {
    const defs = document.createElementNS(SVG_NS, 'defs');
    defs.innerHTML = '<filter id="hl-glow" x="-40%" y="-40%" width="180%" height="180%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/>' +
      '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    svg.insertBefore(defs, svg.firstChild);
  }

  function clearHighlight() {
    svg.querySelectorAll('.hl-node').forEach((n) => n.remove());
    svg.querySelectorAll('.hl').forEach((g) => g.classList.remove('hl'));
  }

  function makeBadge(text, info) {
    const w = Math.max(26, 12 + text.length * 9), h = 26;
    const cx = info.maxX - w / 2 + 6, cy = info.minY + 5;
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'hl-node badge');
    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', cx - w / 2); r.setAttribute('y', cy - h / 2);
    r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('rx', h / 2);
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', cx); t.setAttribute('y', cy + 6);
    t.textContent = text;
    g.append(r, t);
    return g;
  }

  function highlight(badges, withBadges) {
    clearHighlight();
    badges.forEach((nums, id) => {
      const g = keyGroup(id);
      if (!g) return;
      const info = faceInfo(g);
      const clone = info.face.cloneNode(false);
      clone.removeAttribute('id');
      clone.removeAttribute('filter');
      clone.setAttribute('class', 'hl-node hl-face');
      clone.setAttribute('filter', 'url(#hl-glow)');
      info.face.after(clone);            // right after the face: labels stay on top
      g.classList.add('hl');
      if (withBadges && nums.length) g.appendChild(makeBadge(nums.join(' · '), info));
    });
  }

  /* ---------- dialog ---------- */
  const dlg = document.getElementById('dlg');
  let current = null;   // card shown in the dialog

  function openDialog(card) {
    current = card;
    const { badges } = resolve(card);
    renderKeys(card);
    const cp = $('dlg-copy');
    cp.hidden = card.copy === false;
    cp.textContent = 'Copier';
    const say = sentence(card);
    $('dlg-char').textContent = card.char;
    $('dlg-name').textContent = card.cat === 'util' ? card.name : '';   // names only for the useful keys
    $('dlg-say').textContent = say;
    const pill = $('dlg-pill');
    pill.hidden = !card.typed;
    if (card.typed) pill.textContent = 'puis tape ' + card.typed + ' sur le pavé numérique (à droite du clavier)';
    const note = $('dlg-note');
    note.hidden = !card.note;
    note.textContent = card.note || '';
    svg.setAttribute('aria-label', 'Clavier AZERTY. ' + say);
    if (!dlg.open) dlg.showModal();
    highlight(badges, !card.noBadge);   // after showModal so the SVG is rendered
  }

  dlg.addEventListener('close', clearHighlight);
  $('dlg-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => {            // click on the dark backdrop closes
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
  });

  /* ---------- copy ---------- */
  async function copyText(text) {
    try {
      if (navigator.clipboard) { await navigator.clipboard.writeText(text); return true; }
    } catch (e) { /* fall through (e.g. file://) */ }
    const prev = document.activeElement;
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (prev && prev.focus) prev.focus();
    return ok;
  }

  /* ---------- events ---------- */
  $('sections').addEventListener('click', (e) => {
    const btn = e.target.closest('button.kc');
    if (btn) openDialog(CHARS[+btn.dataset.i]);
  });
  $('dlg-copy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const ok = await copyText(current.char);
    btn.textContent = ok ? 'Copié ✓' : 'Échec';
    $('live').textContent = ok ? 'Caractère copié : ' + current.char : 'La copie a échoué.';
    setTimeout(() => { btn.textContent = 'Copier'; }, 1500);
  });

  /* ---------- start ---------- */
  addGlowFilter();
  buildPage();
})();
