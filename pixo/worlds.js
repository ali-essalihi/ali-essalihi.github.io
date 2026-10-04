/* Mondes 3 et 4 + bilan final. À charger APRÈS app.js */
const F = (n, ic) => ({ n, ic }), D = (n, c = []) => ({ n, ic: '📁', c });
let Z = 10;

/* ---------- Faux explorateur de fichiers ---------- */
function explorer(st, cfg) {
  const root = cfg.tree; let path = [root], sel = null, rn = null;
  const cwd = () => path[path.length - 1], a = {};
  st.innerHTML = '<div class="ex"><div class="eb"><button class="btn s" id="eb">⬅ Retour</button> <span id="ep"></span></div><div class="eg" id="eg"></div></div>';
  const eg = st.querySelector('#eg'), mclose = () => st.querySelectorAll('.menu').forEach(m => m.remove());
  const mark = d => eg.querySelectorAll('.ei').forEach(x => x.classList.toggle('sel', x === d));
  const menu = (e, it) => {
    const L = cfg.menu ? cfg.menu(it) : []; if (!L.length) return;
    const b = st.getBoundingClientRect(), m = document.createElement('div'); m.className = 'menu';
    m.style.left = (e.clientX - b.left) + 'px'; m.style.top = (e.clientY - b.top) + 'px';
    L.forEach(l => { const d = document.createElement('div'); d.textContent = l; d.onclick = ev => { ev.stopPropagation(); mclose(); cfg.act(l, it, a); }; m.appendChild(d); });
    st.appendChild(m);
  };
  a.render = () => {
    st.querySelector('#ep').textContent = '📂 ' + path.map(p => p.n).join(' › '); eg.innerHTML = '';
    cwd().c.forEach(it => {
      const d = document.createElement('div'); d._it = it; d.className = 'ei' + (sel === it ? ' sel' : '');
      d.innerHTML = `<span class="ic">${it.ic}</span>` + (rn === it ? '<input maxlength="24">' : `<span>${esc(it.n)}</span>`);
      d.onclick = e => { e.stopPropagation(); mclose(); sel = it; mark(d); };
      d.ondblclick = () => cfg.dbl && cfg.dbl(it, a);
      d.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); mclose(); sel = it; mark(d); menu(e, it); };
      if (cfg.drag && !it.c) d.onpointerdown = e => {
        if (e.button !== 0) return; let g = null; const sx = e.clientX, sy = e.clientY; d.setPointerCapture(e.pointerId);
        d.onpointermove = m => {
          if (!g && Math.hypot(m.clientX - sx, m.clientY - sy) < 6) return; const b = st.getBoundingClientRect();
          if (!g) { g = d.cloneNode(true); g.classList.add('ghost'); st.appendChild(g); }
          g.style.left = (m.clientX - b.left - 50) + 'px'; g.style.top = (m.clientY - b.top - 40) + 'px';
        };
        d.onpointerup = u => {
          d.onpointermove = d.onpointerup = null; if (!g) return; g.remove();
          const t = document.elementFromPoint(u.clientX, u.clientY), ti = t && t.closest('.ei');
          cfg.drop(it, ti ? ti._it : null, a);
        };
      };
      eg.appendChild(d);
      if (rn === it) {
        const i = d.querySelector('input'); i.value = it.n; i.onclick = e => e.stopPropagation();
        i.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Escape') { rn = null; a.cb(e.key === 'Enter' ? i.value.trim() : ''); a.render(); } };
        setTimeout(() => { i.focus(); i.select(); }, 0);
      }
    });
  };
  eg.onclick = () => { mclose(); sel = null; mark(null); };
  eg.oncontextmenu = e => { e.preventDefault(); mclose(); sel = null; mark(null); menu(e, null); };
  st.querySelector('#eb').onclick = () => { if (path.length > 1) { path.pop(); a.render(); } };
  a.cd = n => { path.push(n); a.render(); }; a.home = () => { path = [root]; a.render(); };
  a.rename = (it, cb) => { rn = it; a.cb = cb; a.render(); }; a.sel = () => sel; a.cwd = cwd;
  a.render(); return a;
}

/* ---------- Fausses fenêtres ---------- */
function mkwin(st, o) {
  const w = document.createElement('div'); w.className = 'win';
  const set = (x, y, W, Hh) => { w.style.left = x + 'px'; w.style.top = y + 'px'; w.style.width = W + 'px'; w.style.height = Hh + 'px'; };
  w.set = set; set(o.x, o.y, o.w, o.h); w.style.zIndex = ++Z;
  const B = [['min', '—', 'Réduire'], ['max', '▢', 'Agrandir'], ['close', '✕', 'Fermer']];
  w.innerHTML = `<div class="wt"><span>${o.ic} ${o.t}</span><span>${B.map(b => `<button class="wb ${b[0] === 'close' ? 'x' : ''}" data-a="${b[0]}" title="${b[2]}">${b[1]}</button>`).join('')}</span></div><div class="wc">${o.body || ''}</div>${o.rz ? '<div class="rz"></div>' : ''}`;
  st.appendChild(w); w.onpointerdown = () => w.style.zIndex = ++Z;
  const stH = o.bottom ? st.clientHeight - 52 : st.clientHeight;
  w.act = x => {
    if (o.allow && !o.allow(x, w)) return;
    if (x === 'min') w.style.display = 'none'; else if (x === 'close') w.remove();
    else if (w.sv) { set(...w.sv); w.sv = null; } else { w.sv = [w.offsetLeft, w.offsetTop, w.offsetWidth, w.offsetHeight]; set(0, 0, st.clientWidth, stH); }
  };
  w.querySelectorAll('.wb').forEach(b => { b.onpointerdown = e => e.stopPropagation(); b.onclick = () => w.act(b.dataset.a); });
  const t = w.querySelector('.wt');
  t.onpointerdown = e => {
    if (w.sv) return; t.setPointerCapture(e.pointerId); const sx = e.clientX - w.offsetLeft, sy = e.clientY - w.offsetTop;
    t.onpointermove = m => { w.style.left = Math.max(0, Math.min(st.clientWidth - 60, m.clientX - sx)) + 'px'; w.style.top = Math.max(0, Math.min(st.clientHeight - 40, m.clientY - sy)) + 'px'; };
    t.onpointerup = () => { t.onpointermove = t.onpointerup = null; o.drop && o.drop(w); };
  };
  const r = w.querySelector('.rz');
  if (r) r.onpointerdown = e => {
    e.stopPropagation(); r.setPointerCapture(e.pointerId);
    r.onpointermove = m => { const b = w.getBoundingClientRect(); w.style.width = Math.max(160, m.clientX - b.left) + 'px'; w.style.height = Math.max(110, m.clientY - b.top) + 'px'; };
    r.onpointerup = () => { r.onpointermove = r.onpointerup = null; o.resized && o.resized(w); };
  };
  return w;
}
const inZone = (w, z) => { const cx = w.offsetLeft + w.offsetWidth / 2, cy = w.offsetTop + w.offsetHeight / 2; return cx > z.offsetLeft && cx < z.offsetLeft + z.offsetWidth && cy > z.offsetTop && cy < z.offsetTop + z.offsetHeight; };
const zone = (st, x, y, w, h, t) => { const z = document.createElement('div'); z.className = 'zone'; z.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`; z.textContent = t; st.appendChild(z); return z; };
const onInput = e => e.target.tagName === 'INPUT';

/* ---------- Niveaux ---------- */
W[12] = 'Monde 3 : Fichiers et dossiers'; W[16] = 'Monde 4 : Les fenêtres';
LV.push(
{ t: 'Ouvrir des dossiers', part: '🗂️', pn: "son classeur",
  intro: "Pixo a rangé ses souvenirs dans des dossiers, comme dans une armoire. Double-clique sur un dossier pour l'ouvrir. Le bouton ⬅ Retour te ramène en arrière. Trouve les fichiers demandés !",
  build(st, h, ok, err) {
    const T = [['mariage.jpg', "Trouve la photo « mariage.jpg » et double-clique dessus."], ['facture.pdf', "Maintenant, trouve la facture « facture.pdf »."]]; let i = 0;
    const tree = D('Mes documents', [D('Photos', [F('vacances.jpg', '🖼️'), F('mariage.jpg', '🖼️')]), D('Documents', [D('Maison', [F('facture.pdf', '📄'), F('bail.pdf', '📄')]), F('cv.pdf', '📄')]), D('Musique', [F('chanson.mp3', '🎵')])]);
    explorer(st, { tree, dbl(it, a) {
      if (it.c) return a.cd(it);
      if (it.n !== T[i][0]) return err("Ce n'est pas le bon fichier. Lis bien le nom.");
      H('pop'); if (++i === T.length) return ok(); a.home(); h(T[i][1] + " (Tu es revenu au début.)");
    } });
    h(T[0][1]);
  } },
{ t: 'Créer un dossier', part: '📁', pn: "ses nouveaux dossiers",
  intro: "Pixo a besoin de nouveaux dossiers vides. Fais un clic droit dans une zone vide, choisis « Nouveau dossier », puis écris son nom au clavier et appuie sur Entrée ↵.",
  build(st, h, ok, err) {
    const T = ['Photos', 'Musique']; let i = 0, tree = D('Mes documents', []);
    const msg = () => `Crée un dossier nommé « ${T[i]} » : clic droit dans le vide, « Nouveau dossier », écris le nom, puis Entrée ↵.`;
    explorer(st, { tree, menu: it => it ? [] : ['Nouveau dossier', 'Actualiser'],
      act(l, it, a) {
        if (l !== 'Nouveau dossier') return err("Choisis « Nouveau dossier » dans le menu.");
        const nf = D(''); tree.c.push(nf);
        a.rename(nf, v => {
          if (v.toLowerCase() === T[i].toLowerCase()) { nf.n = T[i]; H('pop'); if (++i === T.length) return ok(); h(msg()); }
          else { tree.c.pop(); err(`Le nom doit être « ${T[i]} ». Recommence.`); }
        });
      } });
    h(msg());
  } },
{ t: 'Renommer un fichier', part: '🏷️', pn: "ses étiquettes",
  intro: "Les fichiers de Pixo ont des noms bizarres. Clic droit sur le fichier, puis « Renommer ». Tape le nouveau nom et valide avec Entrée ↵. Astuce : tu peux aussi cliquer sur le fichier et appuyer sur la touche F2.",
  build(st, h, ok, err) {
    const T = [['IMG_4521.jpg', 'mariage.jpg'], ['document1.pdf', 'facture.pdf']]; let i = 0;
    const tree = D('Bureau', [F('IMG_4521.jpg', '🖼️'), F('document1.pdf', '📄'), F('musique1.mp3', '🎵')]);
    const msg = () => `Renomme « ${T[i][0]} » en « ${T[i][1]} ».`;
    const go = (it, a) => {
      if (!it || it.n !== T[i][0]) return err("Ce n'est pas le bon fichier : " + msg());
      a.rename(it, v => { if (v.toLowerCase() === T[i][1]) { it.n = T[i][1]; H('pop'); if (++i === T.length) return ok(); h(msg()); } else err(`Le nouveau nom doit être « ${T[i][1]} ».`); });
    };
    const a = explorer(st, { tree, menu: it => it ? ['Ouvrir', 'Renommer', 'Supprimer'] : [], act: (l, it, a) => l === 'Renommer' ? go(it, a) : err("Choisis « Renommer » dans le menu.") });
    window.onkeydown = e => { if (onInput(e)) return; if (e.key === 'F2') { e.preventDefault(); go(a.sel(), a); } };
    h(msg());
  } },
{ t: 'Ranger et supprimer', part: '🧹', pn: "son balai magique",
  intro: "Quel désordre sur le bureau de Pixo ! Fais glisser chaque fichier sur le bon dossier : photos, documents, musique. Le brouillon est inutile : glisse-le dans la Corbeille 🗑️, ou clique dessus puis appuie sur la touche Suppr.",
  build(st, h, ok, err) {
    const M = { jpg: 'Photos', pdf: 'Documents', mp3: 'Musique', tmp: 'Corbeille' };
    const tree = D('Bureau', [D('Photos'), D('Documents'), D('Musique'), { n: 'Corbeille', ic: '🗑️', c: [] }, F('vacances.jpg', '🖼️'), F('cv.pdf', '📄'), F('chanson.mp3', '🎵'), F('mariage.jpg', '🖼️'), F('brouillon.tmp', '🧾')]);
    let left = 5;
    const gone = (it, a) => { tree.c.splice(tree.c.indexOf(it), 1); H('pop'); a.render(); if (!--left) ok(); };
    const a = explorer(st, { tree, drag: 1,
      drop(it, tg, a) {
        if (!tg || !tg.c) return err("Relâche le fichier au-dessus d'un dossier.");
        if (M[it.n.split('.').pop()] === tg.n) gone(it, a);
        else if (it.n.endsWith('.tmp')) err("Ce brouillon est inutile : mets-le dans la Corbeille 🗑️, ou clique dessus et appuie sur Suppr.");
        else err(`« ${it.n} » ne va pas dans « ${tg.n} ». Regarde l'icône du fichier.`);
      } });
    window.onkeydown = e => {
      if (onInput(e) || (e.key !== 'Delete' && e.key !== 'Backspace')) return; e.preventDefault();
      const s = a.sel(); if (!s) return err("Clique d'abord sur le fichier à supprimer.");
      s.n.endsWith('.tmp') ? gone(s, a) : err("Seul le brouillon est à supprimer. Les autres, range-les dans un dossier.");
    };
    h("Garde le bouton gauche enfoncé, glisse le fichier sur un dossier, puis relâche.");
  } },
{ t: 'Fermer, réduire, agrandir', part: '🪟', pn: "ses fenêtres",
  intro: "Les programmes s'ouvrent dans des fenêtres. En haut à droite, il y a 3 boutons : — pour réduire, ▢ pour agrandir, ✕ pour fermer. Suis les instructions pour les essayer tous !",
  build(st, h, ok, err) {
    const S = [['min', "Clique sur le bouton — pour RÉDUIRE la fenêtre."], ['tb', "La fenêtre est cachée en bas ! Clique sur son nom dans la barre du bas pour la faire revenir."], ['max', "Clique sur le bouton ▢ pour AGRANDIR la fenêtre."], ['max', "Clique encore sur ▢ pour la remettre à sa taille normale."], ['close', "Clique sur le bouton rouge ✕ pour FERMER la fenêtre."]]; let i = 0;
    const tb = document.createElement('div'); tb.className = 'tb'; st.appendChild(tb);
    const w = mkwin(st, { t: 'Ma lettre', ic: '✉️', x: 60, y: 30, w: 380, h: 240, bottom: 1, body: '<p style="font-size:22px">Chère Pixo, merci pour ton aide !</p>',
      allow(x) {
        if (x !== S[i][0]) { err("Ce n'est pas le bon bouton. " + S[i][1]); return false; }
        H('pop'); i++; if (i === S.length) { setTimeout(ok, 300); return true; }
        h(S[i][1]);
        if (S[i][0] === 'tb') {
          const b = document.createElement('button'); b.className = 'btn'; b.textContent = '✉️ Ma lettre';
          b.onclick = () => { w.style.display = ''; b.remove(); H('pop'); i++; h(S[i][1]); }; tb.appendChild(b);
        }
        return true;
      } });
    h(S[0][1]);
  } },
{ t: 'Déplacer et redimensionner', part: '📐', pn: "sa règle",
  intro: "Une fenêtre peut se déplacer et changer de taille. Pour la déplacer, appuie sur sa barre de titre (en haut) et glisse. Pour l'agrandir, tire le petit coin orange en bas à droite.",
  build(st, h, ok, err) {
    const W = st.clientWidth; let step = 0;
    const z = zone(st, Math.max(20, W - 340), 120, 300, 220, 'Dépose la fenêtre ici');
    mkwin(st, { t: 'Mes photos', ic: '🖼️', x: 20, y: 20, w: 200, h: 130, rz: 1, body: '<div style="font-size:44px">🖼️🌄🏞️</div>',
      allow() { err("Ici, on déplace ou on agrandit la fenêtre, sans utiliser ces boutons."); return false; },
      drop(w) {
        if (step) return;
        if (inZone(w, z)) { step = 1; H('pop'); z.remove(); h("Bravo ! Maintenant, agrandis la fenêtre en tirant le coin orange en bas à droite."); }
        else err("Pose la fenêtre dans le cadre vert en pointillés.");
      },
      resized(w) {
        if (!step) return err("D'abord, déplace la fenêtre dans le cadre vert.");
        if (w.offsetWidth >= 320 && w.offsetHeight >= 200) { H('pop'); ok(); } else err("Encore plus grand ! Tire le coin orange.");
      } });
    h("Appuie sur la barre de titre de la fenêtre, puis glisse-la dans le cadre vert.");
  } },
{ t: 'Mission finale : le bureau', part: '🏆', pn: "sa couronne de champion",
  intro: "Le bureau de Pixo est en désordre : des fenêtres se chevauchent et une publicité gêne. Ferme la pub, puis range les deux fenêtres côte à côte. Tu utilises tout ce que tu as appris !",
  build(st, h, ok, err) {
    const W = st.clientWidth, hw = Math.floor(W / 2) - 20; let step = 0, z;
    const M = ["Une publicité gêne ! Ferme-la avec le bouton rouge ✕.", "Glisse la fenêtre « Lettre » dans la zone de GAUCHE (par sa barre de titre).", "Glisse la fenêtre « Photos » dans la zone de DROITE."];
    const snap = (w, zz) => w.set(zz.offsetLeft + 8, zz.offsetTop + 34, hw - 16, 300);
    const mk = (t, ic, x, y, body) => mkwin(st, { t, ic, x, y, w: 300, h: 200, body,
      allow(a) { if (step === 0 && t === 'Publicité' && a === 'close') { step = 1; H('pop'); z = zone(st, 10, 10, hw, 360, 'Zone de gauche'); h(M[1]); return true; } err("Pas maintenant. " + M[step]); return false; },
      drop(w) {
        if (step === 0 || (step === 1 && t !== 'Lettre') || (step === 2 && t !== 'Photos')) return;
        if (!inZone(w, z)) return err("Dépose la fenêtre dans la zone verte.");
        snap(w, z); z.remove(); H('pop');
        if (step === 1) { step = 2; z = zone(st, W / 2 + 10, 10, hw, 360, 'Zone de droite'); h(M[2]); } else ok();
      } });
    mk('Lettre', '✉️', W * .22, 40, '<p style="font-size:22px">Chère Pixo…</p>');
    mk('Photos', '🖼️', W * .3, 80, '<div style="font-size:44px">🌄🏞️🖼️</div>');
    mk('Publicité', '📢', W * .26, 120, '<p style="font-size:24px">🎁 Gagnez un cadeau !</p>');
    h(M[0]);
  } }
);

/* ---------- Bilan final : badges et score ---------- */
const WR = [[0, 6, '🖱️', 'Roi de la souris'], [6, 12, '⌨️', 'As du clavier'], [12, 16, '🗂️', 'Maître des fichiers'], [16, 19, '🪟', 'Champion des fenêtres']];
const rank = p => p >= .9 ? ['🏆', "Maître de l'ordinateur"] : p >= .7 ? ['🥇', 'Expert'] : p >= .5 ? ['🥈', 'Explorateur'] : ['🥉', 'Débutant courageux'];
function bilan() {
  const g = G(), mx = LV.length * 3; let tot = 0;
  const cards = g.members.map(m => {
    const s = LV.map((_, i) => (g.prog[i] && g.prog[i][m.n]) || 0), t = s.reduce((x, y) => x + y, 0); tot += t;
    const r = rank(t / mx), bs = WR.filter(w => s.slice(w[0], w[1]).reduce((x, y) => x + y, 0) >= (w[1] - w[0]) * 3 * .8).map(w => `<span class="chip on">${w[2]} ${w[3]}</span>`).join('') || "<small>Rejoue des niveaux pour gagner des badges !</small>";
    return `<div class="card" style="text-align:center"><h2>${m.av} ${esc(m.n)}</h2><div class="stars">${r[0]}</div><h3>${r[1]}</h3><p>⭐ ${t} sur ${mx} étoiles</p><div>${bs}</div></div>`;
  }).join('');
  const gp = tot / (mx * g.members.length), r = rank(gp);
  view(`<div class="card" style="text-align:center;border-color:var(--y)"><h1>🎓 Diplôme du groupe « ${esc(S.cur)} »</h1>
  <div class="stars">${r[0]}</div><h2>${r[1]}</h2><p>Score du groupe : ⭐ ${tot} sur ${mx * g.members.length} étoiles (${Math.round(gp * 100)} %)</p>
  <div><span class="chip on">🤝 Esprit d'équipe</span><span class="chip on">🤖 Pixo est sauvé</span></div></div>
  <div class="levels">${cards}</div>
  <button class="btn" id="pr">🖨️ Imprimer le diplôme</button> <button class="btn s" id="bk">⬅ Retour à la carte</button>`);
  $('#pr').onclick = () => window.print(); $('#bk').onclick = map;
  try { confetti({ particleCount: 220, spread: 100, origin: { y: .5 } }); } catch (e) {}
}
S.cur && S.groups[S.cur] ? map() : home();
