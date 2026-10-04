/* Pixo et l'Aventure Numérique - Monde 1 : La Souris */
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const AV = ['🦊','🐼','🐸','🦁','🐙','🐯'];
const app = $('#app');
let snd = true;
const W = { 0: 'Monde 1 : La Souris', 6: 'Monde 2 : Le Clavier' };

/* ---------- Stockage (localStorage, versionné) ---------- */
let S;
try { S = JSON.parse(localStorage.getItem('pixo')); } catch (e) {}
if (!S || S.v !== 1) S = { v: 1, groups: {}, cur: null };
const save = () => { try { localStorage.setItem('pixo', JSON.stringify(S)); } catch (e) {} };
const G = () => S.groups[S.cur];
const nextMember = (g, li) => g.members.find(m => !(g.prog[li] && g.prog[li][m.n]));
const done = (g, li) => !nextMember(g, li);
const unlocked = (g, li) => li === 0 || done(g, li - 1);

const SND = {};
const H = n => { try { if (!snd || !window.Howl) return; (SND[n] = SND[n] || new Howl({ src: ['assets/audio/' + n + '.mp3'], html5: true, volume: .6 })).play(); } catch (e) {} };
const say = t => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; speechSynthesis.speak(u); } catch (e) {} };
const put = (st, t, x, y, c = '') => {
  const e = document.createElement('span');
  e.className = 'obj ' + c; e.textContent = t;
  e.style.left = x + '%'; e.style.top = y + '%'; st.appendChild(e); return e;
};

/* ---------- Niveaux : chacun redonne une pièce à Pixo ---------- */
const LV = [
{ t: 'Bouger la souris', part: '👀', pn: 'les yeux',
  intro: "Pixo ne voit plus rien ! Pour retrouver ses yeux, déplace la souris sans cliquer et touche les étoiles qui brillent, une par une.",
  build(st, h, ok) {
    const P = [[12,70],[30,25],[50,70],[70,25],[88,70]]; let c = 0;
    const E = P.map(p => put(st, '⭐', p[0], p[1]));
    const r = () => E.forEach((e, i) => e.className = 'obj ' + (i === c ? 'lit' : ''));
    E.forEach((e, i) => e.onmouseenter = () => {
      if (i !== c) return; H('pop'); e.classList.add('gone'); c++; c < 5 ? r() : ok();
    });
    r(); h("Pas besoin de cliquer : passe simplement le pointeur sur l'étoile qui brille.");
  } },
{ t: 'Cliquer', part: '🔊', pn: 'la voix',
  intro: "Pixo a perdu sa voix. Chaque bulle qui éclate lui rend un son. Clique une fois, avec le bouton gauche, sur la bulle qui brille.",
  build(st, h, ok, err) {
    const P = [[15,30],[40,68],[70,30],[85,70],[25,78],[55,25]]; let c = 0;
    const E = P.map(p => put(st, '🫧', p[0], p[1]));
    const r = () => E.forEach((e, i) => e.className = 'obj ' + (i === c ? 'lit' : ''));
    E.forEach((e, i) => e.onclick = ev => {
      ev.stopPropagation();
      if (i !== c) return err("Clique sur la bulle qui brille.");
      H('pop'); e.classList.add('gone'); c++; c < 6 ? r() : ok();
    });
    r(); h("Un seul clic, bouton gauche (celui de gauche sur la souris).");
  } },
{ t: 'Double-clic', part: '🦾', pn: 'les bras',
  intro: "Les bras de Pixo sont enfermés dans des coffres. Pour ouvrir un coffre, fais deux clics très rapides au même endroit : c'est le double-clic.",
  build(st, h, ok, err) {
    let n = 0;
    [[20,50],[50,50],[80,50]].forEach(p => {
      const e = put(st, '🧰', p[0], p[1], 'lit'); let t, open = false;
      e.onclick = () => { if (open) return; clearTimeout(t); t = setTimeout(() => err("Un seul clic ne suffit pas : fais deux clics rapides !"), 700); };
      e.ondblclick = () => { if (open) return; clearTimeout(t); open = true; H('pop'); e.textContent = '🦾'; e.className = 'obj'; if (++n === 3) ok(); };
    });
    h("Deux clics, vite vite, sans bouger la souris.");
  } },
{ t: 'Clic droit', part: '🦿', pn: 'les jambes',
  intro: "Des colis contiennent les jambes de Pixo. Fais un clic droit (bouton de droite) sur un colis : un menu apparaît. Choisis « Ouvrir ».",
  build(st, h, ok, err) {
    let n = 0, menu;
    const close = () => { if (menu) menu.remove(); menu = null; };
    st.onclick = close;
    [[20,50],[50,50],[80,50]].forEach(p => {
      const e = put(st, '📦', p[0], p[1], 'lit'); let opened = false;
      e.onclick = ev => { ev.stopPropagation(); close(); h("Ça, c'est le clic gauche. Essaie avec le bouton de DROITE."); };
      e.oncontextmenu = ev => {
        ev.preventDefault(); ev.stopPropagation(); close(); if (opened) return;
        const b = st.getBoundingClientRect();
        menu = document.createElement('div'); menu.className = 'menu';
        menu.style.left = (ev.clientX - b.left) + 'px'; menu.style.top = (ev.clientY - b.top) + 'px';
        ['Copier', 'Ouvrir', 'Supprimer'].forEach(l => {
          const d = document.createElement('div'); d.textContent = l;
          d.onclick = e2 => {
            e2.stopPropagation(); close();
            if (l !== 'Ouvrir') return err("Choisis « Ouvrir » dans le menu.");
            opened = true; H('pop'); e.textContent = '🦿'; e.className = 'obj'; if (++n === 3) ok();
          };
          menu.appendChild(d);
        });
        st.appendChild(menu);
      };
    });
    h("Bouton de droite sur un colis, puis clic gauche sur « Ouvrir ».");
  } },
{ t: 'Glisser-déposer', part: '🤖', pn: 'la tête',
  intro: "Il faut remonter Pixo ! Appuie sur une pièce, garde le bouton enfoncé, déplace la souris, puis relâche au-dessus du bon emplacement.",
  build(st, h, ok, err) {
    const W = st.clientWidth, Hh = st.clientHeight; let n = 0;
    const parts = [['🤖','Tête'], ['🦾','Bras'], ['🦿','Jambes']];
    const sx = [0.2, 0.5, 0.8].sort(() => Math.random() - .5);
    parts.forEach((p, i) => {
      const s = document.createElement('div'); s.className = 'slot'; s.textContent = p[1];
      s.style.left = sx[i] * W + 'px'; s.style.top = Hh * .75 + 'px'; st.appendChild(s); p.push(s);
    });
    parts.forEach((p, i) => {
      const e = put(st, p[0], 0, 0), ox = (0.2 + i * 0.3) * W, oy = Hh * .22;
      e.style.left = ox + 'px'; e.style.top = oy + 'px'; e.style.cursor = 'grab'; e.style.touchAction = 'none';
      e.onpointerdown = ev => {
        if (e.dataset.ok) return; e.setPointerCapture(ev.pointerId); e.dataset.d = 1; e.style.zIndex = 5;
        e.style.cursor = 'grabbing';
      };
      e.onpointermove = ev => {
        if (!e.dataset.d) return; const b = st.getBoundingClientRect();
        e.style.left = (ev.clientX - b.left) + 'px'; e.style.top = (ev.clientY - b.top) + 'px';
      };
      e.onpointerup = ev => {
        if (!e.dataset.d) return; delete e.dataset.d; e.style.zIndex = ''; e.style.cursor = 'grab';
        const b = st.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
        const hit = parts.find(q => Math.abs(x - parseFloat(q[2].style.left)) < 65 && Math.abs(y - parseFloat(q[2].style.top)) < 65);
        if (hit && hit === p) {
          e.style.left = p[2].style.left; e.style.top = p[2].style.top; e.dataset.ok = 1; H('pop'); if (++n === 3) ok();
        } else { e.style.left = ox + 'px'; e.style.top = oy + 'px'; err(hit ? "Ce n'est pas le bon emplacement. Regarde le nom écrit !" : "Relâche la pièce au-dessus d'un emplacement."); }
      };
    });
    h("Garde le bouton gauche enfoncé pendant que tu déplaces la pièce.");
  } },
{ t: 'La molette', part: '🔋', pn: 'la batterie',
  intro: "La batterie de Pixo est cachée tout en bas de la page. Tourne la molette de la souris vers toi pour faire défiler, puis clique sur la batterie.",
  build(st, h, ok) {
    st.innerHTML = '<div class="sc"><p>Pixo a caché sa batterie tout en bas…</p><p>Continue de faire défiler ⬇️</p><p>Encore un peu ⬇️⬇️</p><p>Tu y es presque ⬇️⬇️⬇️</p><p>Plus qu\'un petit effort ⬇️</p><p><button class="btn" id="bat">🔋 Prendre la batterie</button></p></div>';
    $('#bat').onclick = () => { H('pop'); ok(); };
    h("Molette vers toi = descendre. Sur un ordinateur portable : glisse deux doigts sur le pad tactile.");
  } },

/* ===== Monde 2 : Le Clavier ===== */
{ t: 'Découvrir le clavier', part: '🔤', pn: "son alphabet",
  intro: "Maintenant, le cerveau de Pixo est vide ! Chaque touche que tu appuies lui rend une lettre. Regarde la touche jaune à l'écran, puis appuie sur la même touche de ton vrai clavier.",
  build(st, h, ok, err) {
    const R = ['azertyuiop', 'qsdfghjklm', 'wxcvbn'], T = ['a', 'm', 'o', 's', 'e', 't']; let c = 0;
    st.innerHTML = '<div class="tw"><div>' + R.map(r => '<div class="kr">' + [...r].map(k => `<div class="k" data-k="${k}">${k.toUpperCase()}</div>`).join('') + '</div>').join('') + '</div></div>';
    const r = () => st.querySelectorAll('.k').forEach(k => k.classList.toggle('hot', k.dataset.k === T[c]));
    window.onkeydown = e => {
      if (e.key.length !== 1) return; e.preventDefault();
      if (e.key.toLowerCase() === T[c]) { H('pop'); ++c === T.length ? ok() : r(); }
      else err("Cherche la touche jaune : « " + T[c].toUpperCase() + " ».");
    };
    r(); h("Les lettres sont rangées en 3 lignes. Trouve la touche jaune sur ton clavier.");
  } },
{ t: 'Taper des mots', part: '📖', pn: "ses premiers mots",
  intro: "Pixo veut apprendre à parler. Tape les mots affichés, lettre par lettre. La lettre soulignée est la prochaine à taper.",
  build: typer([{ s: 'pixo', n: "Le nom de notre robot." }, { s: 'bonjour', n: "Un mot pour dire bonjour." }, { s: 'merci pixo', n: "Pour faire un espace, appuie sur la grande barre en bas du clavier." }]) },
{ t: 'Majuscules et accents', part: '🔠', pn: "ses majuscules",
  intro: "Pixo doit écrire correctement en français : avec des majuscules et des accents. Pour une majuscule, maintiens la touche Maj ⇧ (flèche vers le haut) et appuie sur la lettre.",
  build: typer([
    { s: 'Bonjour Pixo', n: "Maintiens Maj ⇧ avec un doigt et tape B, puis P avec l'autre main." },
    { s: 'Un café, un thé', n: "é est sur la touche du chiffre 2, sans Maj. La virgule est à droite de la touche N." },
    { s: 'Meknès, Maroc', n: "è est sur la touche du chiffre 7, sans Maj." }]) },
{ t: 'Effacer et Entrée', part: '🧽', pn: "sa gomme",
  intro: "Pixo s'est trompé : il y a des lettres en trop ! Appuie sur Retour arrière ⌫ pour les effacer, puis sur Entrée ↵ pour valider.",
  build(st, h, ok, err) {
    const T = [['Bonjourr', 'Bonjour'], ['Mercii', 'Merci'], ['Pixooo', 'Pixo']]; let p = 0, b = T[0][0];
    st.innerHTML = '<div class="tw"><div><div id="tl" class="tl"></div><div id="tn"></div></div></div>';
    const r = () => { $('#tl').textContent = b + '|'; $('#tn').textContent = b === T[p][1] ? "Parfait ! Appuie sur Entrée ↵" : "Il y a des lettres en trop. Appuie sur Retour arrière ⌫."; };
    window.onkeydown = e => {
      if (e.key === 'Backspace') { e.preventDefault(); b = b.slice(0, -1); H('pop'); if (b.length < T[p][1].length) { b = T[p][0]; err("Tu as effacé trop de lettres. On recommence ce mot."); } r(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (b === T[p][1]) { H('pop'); ++p === 3 ? ok() : (b = T[p][0], r()); } else err("Efface d'abord les lettres en trop avec ⌫."); }
      else if (e.key.length === 1) { e.preventDefault(); err("Ici, utilise seulement ⌫ et Entrée ↵."); }
    };
    r(); h("Retour arrière ⌫ est en haut à droite des lettres. Entrée ↵ est juste en dessous.");
  } },
{ t: 'Chiffres et symboles', part: '📞', pn: "son carnet d'adresses",
  intro: "Pixo veut noter un numéro de téléphone et une adresse e-mail. Sur ce clavier, les chiffres s'écrivent avec Maj ⇧ maintenue.",
  build: typer([
    { s: '0612345678', n: "Maintiens Maj ⇧ et appuie sur la touche du chiffre, en haut du clavier." },
    { s: 'sara@pixo.ma', n: "@ : maintiens Alt Gr (à droite de la barre d'espace) et appuie sur la touche du chiffre 0. Le point : Maj ⇧ + la touche ; ." }]) },
{ t: 'Les raccourcis', part: '⚡', pn: "son super-pouvoir",
  intro: "Dernier pouvoir : les raccourcis ! Ils font gagner beaucoup de temps. Maintiens la touche Ctrl en bas à gauche, et appuie sur la lettre demandée.",
  build(st, h, ok, err) {
    const S = [['c', 'Ctrl + C', 'copier'], ['v', 'Ctrl + V', 'coller'], ['z', 'Ctrl + Z', 'annuler']]; let i = 0;
    st.innerHTML = '<div class="tw"><div><div class="tl">🤖 Je suis Pixo</div><div class="tl" id="cp" style="min-height:70px"></div><div id="tn"></div></div></div>';
    const r = () => { $('#tn').innerHTML = `Maintiens <b>Ctrl</b> et appuie sur <b>${S[i][0].toUpperCase()}</b> pour ${S[i][2]}`; h(`Raccourci ${i + 1} sur 3 : ${S[i][1]}`); };
    window.onkeydown = e => {
      if (e.key.length !== 1) return; e.preventDefault();
      if (!(e.ctrlKey || e.metaKey)) return err("N'oublie pas de maintenir Ctrl enfoncée en même temps.");
      if (e.key.toLowerCase() !== S[i][0]) return err("Ce n'est pas le bon raccourci. Cherche : " + S[i][1]);
      H('pop'); if (i === 1) $('#cp').textContent = '🤖 Je suis Pixo'; if (i === 2) $('#cp').textContent = '';
      ++i === 3 ? ok() : r();
    };
    r();
  } }
];

/* Saisie guidée : taper des phrases lettre par lettre (sensible aux majuscules) */
function typer(P) {
  return (st, h, ok, err) => {
    let p = 0, i = 0;
    st.innerHTML = '<div class="tw"><div><div id="tl" class="tl"></div><div id="tn"></div></div></div>';
    const r = () => {
      $('#tl').innerHTML = [...P[p].s].map((c, j) => `<span class="${j < i ? 'okc' : j === i ? 'cur' : ''}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
      $('#tn').textContent = P[p].n || ''; h(`Mot ${p + 1} sur ${P.length} : tape la lettre soulignée.`);
    };
    window.onkeydown = e => {
      if (e.ctrlKey || e.metaKey || e.key.length !== 1) return; e.preventDefault();
      if (e.key === P[p].s[i]) {
        H('pop'); if (++i === P[p].s.length) { i = 0; if (++p === P.length) return ok(); } r();
      } else err("Pas la bonne touche. Cherche : « " + P[p].s[i] + " »");
    };
    r();
  };
}

/* ---------- Écrans ---------- */
const view = html => { window.onkeydown = null; app.innerHTML = html; try { speechSynthesis.cancel(); } catch (e) {} };

function home() {
  const names = Object.keys(S.groups);
  view(`<div class="card"><h1>Bienvenue ! 👋</h1>
  <p>Pixo est un petit robot qui a perdu ses pièces. Aide-le à se réparer en apprenant à utiliser l'ordinateur, en équipe !</p>
  <button class="btn" id="nw">➕ Créer un groupe</button></div>` +
  (names.length ? `<div class="card"><h2>Reprendre un groupe</h2>${names.map(n => `<button class="btn s" data-g="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''));
  $('#nw').onclick = setup;
  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { S.cur = b.dataset.g; save(); map(); });
}

function setup() {
  view(`<div class="card"><h2>Nouveau groupe</h2>
  <label>Nom du groupe<input id="gn" maxlength="20" placeholder="Ex : Les Étoiles"></label>
  <h3>Les membres (2 à 6)</h3><div id="ms"></div>
  <button class="btn s" id="add">➕ Ajouter un membre</button>
  <p class="hint" id="msg"></p><button class="btn" id="go">🚀 Commencer l'aventure</button></div>`);
  const ms = $('#ms'), add = () => {
    const i = ms.children.length; if (i >= 6) return;
    ms.insertAdjacentHTML('beforeend', `<label>${AV[i]} Prénom ${i + 1}<input maxlength="15"></label>`);
  };
  add(); add(); $('#add').onclick = add;
  $('#go').onclick = () => {
    const gn = $('#gn').value.trim(), ns = [...ms.querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean);
    if (!gn) return $('#msg').textContent = "Écris le nom du groupe.";
    if (ns.length < 2) return $('#msg').textContent = "Il faut au moins 2 membres.";
    if (new Set(ns.map(n => n.toLowerCase())).size < ns.length) return $('#msg').textContent = "Deux membres ont le même prénom.";
    if (S.groups[gn]) return $('#msg').textContent = "Ce nom de groupe existe déjà.";
    S.groups[gn] = { members: ns.map((n, i) => ({ n, av: AV[i] })), prog: {} }; S.cur = gn; save(); map();
  };
}

function map() {
  const g = G(); if (!g) return home();
  const all = LV.every((_, i) => done(g, i));
  view(`<div class="card"><h1>Groupe « ${esc(S.cur)} »</h1>
  <div>${g.members.map(m => `<span class="chip">${m.av} ${esc(m.n)}</span>`).join('')}</div>
  <p>Pièces retrouvées de Pixo :</p>
  <div class="robot">${LV.map((l, i) => '<span>' + (done(g, i) ? l.part : '❔') + '</span>').join('')}</div>
  ${all ? '<h2>🎓 Bravo ! Pixo a retrouvé toutes ses pièces et tous ses pouvoirs !</h2><button class="btn" id="bil">🏆 Voir le bilan et les badges</button>' : ''}</div>
  <div class="levels">${LV.map((l, i) => {
    const k = g.members.filter(m => g.prog[i] && g.prog[i][m.n]).length, ok = unlocked(g, i);
    return (W[i] ? '<h2 style="grid-column:1/-1">' + W[i] + '</h2>' : '') + `<div class="card lv ${done(g, i) ? 'ok' : ''} ${ok ? '' : 'lock'}" data-l="${i}" tabindex="0">
    <div class="big">${ok ? (done(g, i) ? '✅' : '🎮') : '🔒'}</div><h3>Niveau ${i + 1}</h3><div>${l.t}</div>
    <small>${k}/${g.members.length} membres ont réussi</small></div>`;
  }).join('')}</div>`);
  if ($('#bil')) $('#bil').onclick = bilan;
  app.querySelectorAll('[data-l]').forEach(c => {
    const go = () => { const i = +c.dataset.l; unlocked(g, i) ? play(i) : H('no'); };
    c.onclick = go; c.onkeydown = e => e.key === 'Enter' && go();
  });
}

function play(li) {
  const g = G(), m = nextMember(g, li), L = LV[li];
  if (!m) return map();
  view(`<div class="card"><h2>${m.av} C'est le tour de ${esc(m.n)} !</h2>
  <h3>Niveau ${li + 1} : ${L.t}</h3><p>${L.intro}</p>
  <button class="btn s" id="rd">🔊 Écouter</button> <button class="btn" id="go">▶️ Je suis prêt(e)</button></div>`);
  $('#rd').onclick = () => say(L.intro);
  $('#go').onclick = () => start(li, m);
}

function start(li, m) {
  const L = LV[li]; let errs = 0;
  view(`<div class="card"><h2>${m.av} ${esc(m.n)} : ${L.t}</h2><div class="hint" id="h"></div><div class="stage" id="st"></div></div>`);
  const st = $('#st'), h = t => $('#h').textContent = t;
  const err = t => { errs++; H('no'); h('💡 ' + t); };
  const ok = () => {
    const stars = errs <= 1 ? 3 : errs <= 3 ? 2 : 1, g = G();
    (g.prog[li] = g.prog[li] || {})[m.n] = stars; save(); H('win');
    try { confetti({ particleCount: 140, spread: 80, origin: { y: .6 } }); } catch (e) {}
    const more = nextMember(g, li);
    view(`<div class="card" style="text-align:center"><h1>Bravo ${esc(m.n)} !</h1>
    <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <p>Pixo récupère ${L.pn} ${L.part}</p>
    <button class="btn" id="nx">${more ? 'Au suivant : ' + more.av + ' ' + esc(more.n) : 'Voir la carte'}</button></div>`);
    $('#nx').onclick = () => play(li);
  };
  L.build(st, h, ok, err);
}

/* ---------- Barre du haut ---------- */
$('#bHome').onclick = home;
$('#bHelp').onclick = () => alert("Aide\n\n• Lis la consigne, puis clique sur « Je suis prêt(e) ».\n• Chaque membre du groupe joue à son tour.\n• Quand tout le monde a réussi, le niveau suivant s'ouvre.\n• Tu peux te tromper : essaie encore !");
$('#bSnd').onclick = e => { snd = !snd; e.target.textContent = snd ? '🔊 Son' : '🔇 Son'; };
