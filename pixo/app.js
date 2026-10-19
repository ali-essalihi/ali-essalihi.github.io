/* Pixo et l'Aventure Numérique : Monde 1 (souris) et Monde 2 (clavier) */
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const AV = ['🦊', '🐼', '🐸', '🦁', '🐙', '🐯'];
const app = $('#app');
const W = { 0: 'Monde 1 : La Souris', 14: 'Monde 2 : Le Clavier' };

/* ---------- Stockage (localStorage) ---------- */
let S;
try { S = JSON.parse(localStorage.getItem('pixo')); } catch (e) {}
if (!S || S.v !== 1) S = { v: 1, groups: {}, cur: null };
const save = () => { try { localStorage.setItem('pixo', JSON.stringify(S)); } catch (e) {} };
const G = () => S.groups[S.cur];
const nextMember = (g, li) => g.members.find(m => !(g.prog[li] && g.prog[li][m.n]));
const done = (g, li) => !nextMember(g, li);
const unlocked = (g, li) => li === 0 || done(g, li - 1);
const star = (g, li, m) => (g.prog[li] && g.prog[li][m.n]) || 0;
const mStars = (g, m) => LV.reduce((t, _, i) => t + star(g, i, m), 0);
const gStars = g => g.members.reduce((t, m) => t + mStars(g, m), 0);

const put = (st, t, x, y, c = '') => {
  const e = document.createElement('span');
  e.className = 'obj ' + c; e.textContent = t; e.style.left = x + '%'; e.style.top = y + '%'; st.appendChild(e); return e;
};
const rnd = (a, b) => a + Math.random() * (b - a);

/* ---------- Niveaux de souris ---------- */
function shrink(mode, Sz) {
  return (st, h, ok, err) => {
    let i = 0; const t = document.createElement('div'); t.className = 'tgt'; st.appendChild(t);
    const show = () => {
      const s = Sz[i], w = st.clientWidth, hh = st.clientHeight;
      t.style.width = t.style.height = s + 'px';
      t.style.left = rnd(s / 2 + 10, w - s / 2 - 10) + 'px'; t.style.top = rnd(s / 2 + 10, hh - s / 2 - 10) + 'px';
      h(`Cible ${i + 1} sur ${Sz.length} : elle devient de plus en plus petite !`);
    };
    const hit = () => { if (++i === Sz.length) { t.remove(); ok(); } else show(); };
    if (mode === 'hover') t.onmouseenter = hit;
    else { t.onclick = e => { e.stopPropagation(); hit(); }; st.onclick = () => err("Raté ! Clique au centre de la cible."); }
    show();
  };
}

const LV = [
{ t: 'Bouger la souris', part: '👀', pn: 'les yeux',
  intro: "Pixo ne voit plus rien ! Pour retrouver ses yeux, déplace la souris sans cliquer et touche les étoiles qui brillent, une par une.",
  build(st, h, ok) {
    const P = [[12,70],[30,25],[50,70],[70,25],[88,70]]; let c = 0;
    const E = P.map(p => put(st, '⭐', p[0], p[1]));
    const r = () => E.forEach((e, i) => e.className = 'obj ' + (i === c ? 'lit' : ''));
    E.forEach((e, i) => e.onmouseenter = () => { if (i !== c) return; e.classList.add('gone'); c++; c < 5 ? r() : ok(); });
    r(); h("Pas besoin de cliquer : passe simplement le pointeur sur l'étoile qui brille.");
  } },
{ t: 'Viser sans cliquer', part: '🎯', pn: 'sa vue précise',
  intro: "Pixo doit viser juste. Touche la cible avec le pointeur, sans cliquer. Attention : à chaque fois, elle devient plus petite !",
  build(st, h, ok, err) { shrink('hover', [150, 120, 95, 75, 60, 48, 38])(st, h, ok, err); h("Déplace doucement la souris jusqu'à la cible."); } },
{ t: 'Cliquer', part: '🔊', pn: 'sa voix',
  intro: "Pixo a perdu sa voix. Chaque bulle qui éclate lui rend un son. Clique une fois, avec le bouton gauche, sur la bulle qui brille.",
  build(st, h, ok, err) {
    const P = [[15,30],[40,68],[70,30],[85,70],[25,78],[55,25]]; let c = 0;
    const E = P.map(p => put(st, '🫧', p[0], p[1]));
    const r = () => E.forEach((e, i) => e.className = 'obj ' + (i === c ? 'lit' : ''));
    E.forEach((e, i) => e.onclick = ev => { ev.stopPropagation(); if (i !== c) return err("Clique sur la bulle qui brille."); e.classList.add('gone'); c++; c < 6 ? r() : ok(); });
    r(); h("Un seul clic, avec le bouton gauche de la souris.");
  } },
{ t: 'Cliquer sur une petite cible', part: '🔭', pn: 'sa visée',
  intro: "Maintenant, il faut cliquer ! Clique au centre de chaque cible. Elle rétrécit à chaque réussite : prends ton temps.",
  build(st, h, ok, err) { shrink('click', [130, 105, 85, 68, 54, 44, 36])(st, h, ok, err); h("Place le pointeur sur la cible, puis fais un clic gauche."); } },
{ t: 'Double-clic', part: '🦾', pn: 'les bras',
  intro: "Les bras de Pixo sont enfermés dans des coffres. Pour ouvrir un coffre, fais deux clics très rapides au même endroit : c'est le double-clic.",
  build(st, h, ok, err) {
    let n = 0;
    [[20,50],[50,50],[80,50]].forEach(p => {
      const e = put(st, '🧰', p[0], p[1], 'lit'); let t, open = false;
      e.onclick = () => { if (open) return; clearTimeout(t); t = setTimeout(() => err("Un seul clic ne suffit pas : fais deux clics rapides !"), 700); };
      e.ondblclick = () => { if (open) return; clearTimeout(t); open = true; e.textContent = '🦾'; e.className = 'obj'; if (++n === 3) ok(); };
    });
    h("Deux clics, vite vite, sans bouger la souris.");
  } },
{ t: 'Clic droit', part: '🦿', pn: 'les jambes',
  intro: "Des colis contiennent les jambes de Pixo. Fais un clic droit (bouton de droite) sur un colis : un menu apparaît. Choisis « Ouvrir ».",
  build(st, h, ok, err) {
    let n = 0, menu; const close = () => { if (menu) menu.remove(); menu = null; };
    st.onclick = close;
    [[20,50],[50,50],[80,50]].forEach(p => {
      const e = put(st, '📦', p[0], p[1], 'lit'); let opened = false;
      e.onclick = ev => { ev.stopPropagation(); close(); h("Ça, c'est le clic gauche. Essaie avec le bouton de DROITE."); };
      e.oncontextmenu = ev => {
        ev.preventDefault(); ev.stopPropagation(); close(); if (opened) return;
        const b = st.getBoundingClientRect(); menu = document.createElement('div'); menu.className = 'menu';
        menu.style.left = (ev.clientX - b.left) + 'px'; menu.style.top = (ev.clientY - b.top) + 'px';
        ['Copier', 'Ouvrir', 'Supprimer'].forEach(l => {
          const d = document.createElement('div'); d.textContent = l;
          d.onclick = e2 => { e2.stopPropagation(); close(); if (l !== 'Ouvrir') return err("Choisis « Ouvrir » dans le menu."); opened = true; e.textContent = '🦿'; e.className = 'obj'; if (++n === 3) ok(); };
          menu.appendChild(d);
        });
        st.appendChild(menu);
      };
    });
    h("Bouton de droite sur un colis, puis clic gauche sur « Ouvrir ».");
  } },
{ t: 'Attraper une cible qui bouge', part: '⚽', pn: 'ses réflexes',
  intro: "La balle de Pixo se promène partout ! Suis-la avec la souris et clique dessus. Elle va un peu plus vite à chaque fois.",
  build(st, h, ok, err) {
    const V = [0.5, 0.7, 0.9, 1.1, 1.3]; let x = 120, y = 100, vx = 2, vy = 1.5, n = 0;
    const t = put(st, '⚽', 0, 0), id = setInterval(() => {
      if (!document.body.contains(t)) return clearInterval(id);
      x += vx * V[n]; y += vy * V[n];
      if (x < 40 || x > st.clientWidth - 40) vx = -vx; if (y < 40 || y > st.clientHeight - 40) vy = -vy;
      t.style.left = x + 'px'; t.style.top = y + 'px';
    }, 16);
    t.onclick = e => { e.stopPropagation(); if (++n === V.length) { clearInterval(id); ok(); } else h(`Touché ! Encore ${V.length - n}.`); };
    st.onclick = () => err("Raté ! Suis la balle avec le pointeur avant de cliquer.");
    h("Clique sur la balle quand le pointeur est dessus.");
  } },
{ t: 'Glisser-déposer', part: '🤖', pn: 'la tête',
  intro: "Il faut remonter Pixo ! Appuie sur une pièce, garde le bouton enfoncé, déplace la souris, puis relâche au-dessus du bon emplacement.",
  build: sorter([['🤖', 't'], ['🦾', 'b'], ['🦿', 'j']], [['t', 'Tête'], ['b', 'Bras'], ['j', 'Jambes']], "Garde le bouton gauche enfoncé pendant que tu déplaces la pièce.") },
{ t: 'Trier dans les paniers', part: '🧺', pn: 'son panier',
  intro: "Pixo range ses affaires. Glisse chaque objet dans le bon panier : les fruits, les animaux ou les outils.",
  build: sorter([['🍎', 'f'], ['🍌', 'f'], ['🐱', 'a'], ['🐶', 'a'], ['🔧', 'o'], ['🔨', 'o']], [['f', 'Fruits'], ['a', 'Animaux'], ['o', 'Outils']], "Glisse chaque objet jusqu'au bon panier, puis relâche le bouton.") },
{ t: 'Suivre le chemin', part: '🗺️', pn: 'sa carte',
  intro: "Pixo veut rentrer chez lui ! Appuie sur le robot, garde le bouton enfoncé et suis la route jusqu'au drapeau. Si tu sors de la route, tu recommences.",
  build: road(90) },
{ t: 'Pairs et impairs', part: '🧮', pn: 'son boulier',
  intro: "Pixo apprend à compter. Un nombre pair finit par 0, 2, 4, 6 ou 8. Les autres sont impairs. Glisse chaque nombre dans le bon panier.",
  build: sorter([['2', 'p'], ['7', 'i'], ['4', 'p'], ['9', 'i'], ['6', 'p'], ['1', 'i']], [['p', 'Pairs'], ['i', 'Impairs']], "Pairs : 0, 2, 4, 6, 8. Impairs : 1, 3, 5, 7, 9.") },
{ t: 'Le chemin étroit', part: '🧭', pn: 'sa boussole',
  intro: "Cette fois, la route est beaucoup plus étroite. Avance doucement et reste bien au milieu !",
  build: road(56) },
{ t: 'La molette', part: '🔋', pn: 'la batterie',
  intro: "La batterie de Pixo est cachée tout en bas de la page. Tourne la molette de la souris vers toi pour faire défiler, puis clique sur la batterie.",
  build(st, h, ok) {
    st.innerHTML = '<div class="sc"><p>Pixo a caché sa batterie tout en bas…</p><p>Continue de faire défiler ⬇️</p><p>Encore un peu ⬇️⬇️</p><p>Tu y es presque ⬇️⬇️⬇️</p><p>Plus qu\'un petit effort ⬇️</p><p><button class="btn" id="bat">🔋 Prendre la batterie</button></p></div>';
    $('#bat').onclick = ok;
    h("Molette vers toi = descendre. Sur un ordinateur portable : glisse deux doigts sur le pad tactile.");
  } },
{ t: 'Mission finale : la souris', part: '🏅', pn: 'sa médaille de la souris', tol: 2,
  intro: "Dernier défi de la souris ! Pixo te donne 6 petites missions qui utilisent tout ce que tu as appris : viser, cliquer, double-cliquer, clic droit, glisser et faire défiler.",
  build(st, h, ok, err) {
    const B = t => LV.find(l => l.t === t).build;
    const ph = [shrink('hover', [110, 80, 55]), shrink('click', [100, 75, 50]), B('Double-clic'), B('Clic droit'), B('Glisser-déposer'), B('La molette')];
    let i = 0;
    const run = () => { st.innerHTML = ''; st.onclick = null; ph[i](st, t => h(`Mission ${i + 1} sur ${ph.length} : ${t}`), () => { ++i === ph.length ? ok() : run(); }, err); };
    run();
  } },
/* ===== Monde 2 : Le Clavier (progressif : les accents et @ arrivent à la fin) ===== */
{ t: 'Découvrir le clavier', part: '🔤', pn: 'son alphabet',
  intro: "Le cerveau de Pixo est vide ! Chaque touche que tu appuies lui rend une lettre. Regarde la touche jaune à l'écran, puis appuie sur la même touche de ton vrai clavier.",
  build(st, h, ok, err) {
    const R = ['azertyuiop', 'qsdfghjklm', 'wxcvbn'], T = ['a', 'm', 'o', 's', 'e', 't', 'p', 'b']; let c = 0;
    st.innerHTML = '<div class="tw"><div>' + R.map(r => '<div class="kr">' + [...r].map(k => `<div class="k" data-k="${k}">${k.toUpperCase()}</div>`).join('') + '</div>').join('') + '</div></div>';
    const r = () => st.querySelectorAll('.k').forEach(k => k.classList.toggle('hot', k.dataset.k === T[c]));
    window.onkeydown = e => {
      if (e.key.length !== 1) return; e.preventDefault();
      if (e.key.toLowerCase() === T[c]) { ++c === T.length ? ok() : r(); } else err("Cherche la touche jaune : « " + T[c].toUpperCase() + " ».");
    };
    r(); h("Les lettres sont rangées en 3 lignes. Trouve la touche jaune sur ton clavier.");
  } },
K('Les doigts sur la rangée du milieu', '✋', 'ses doigts', "Pose tes index sur les touches F et J (elles ont un petit repère). Tape les lettres de la rangée du milieu.",
  [{ s: 'fj fj', n: "Index gauche sur F, index droit sur J." }, { s: 'dk dk', n: "Majeurs sur D et K." }, { s: 'sl sl', n: "Annulaires sur S et L." }, { s: 'gh gh fdsq', n: "Les index vont aussi sur G et H." }]),
K('La rangée du haut', '💡', 'ses idées', "Tape des mots avec les lettres de la rangée du haut (A Z E R T Y U I O P).",
  [{ s: 'tour', n: "Rangée du haut seulement." }, { s: 'porte', n: "Un mot facile." }, { s: 'route', n: "Garde les doigts sur les touches." }, { s: 'poire', n: "Dernier mot !" }]),
K('La rangée du bas', '🔧', 'sa mémoire', "Les lettres du bas sont les plus difficiles à trouver. Prends ton temps !",
  [{ s: 'vb vb', n: "V et B sont sous les index." }, { s: 'cn cn', n: "C et N sont à côté." }, { s: 'xw xw', n: "X et W sont à gauche." }, { s: 'vn bn cv xw', n: "Un mélange de la rangée du bas." }]),
K('Mes premiers mots', '📖', 'ses mots', "Pixo veut apprendre à parler. Tape les mots affichés, lettre par lettre. La lettre soulignée est la prochaine.",
  [{ s: 'pixo', n: "Le nom de notre robot." }, { s: 'robot', n: "Un mot avec la lettre B." }, { s: 'merci', n: "Un mot poli." }, { s: 'salut', n: "Pour dire bonjour." }, { s: 'jardin', n: "Un mot plus long." }, { s: 'maison', n: "Dernier mot !" }]),
K("La barre d'espace", '💬', 'ses phrases', "Pour séparer les mots, utilise la grande touche en bas du clavier : la barre d'espace. Appuie dessus avec ton pouce.",
  [{ s: 'je suis pixo', n: "Un espace entre chaque mot." }, { s: 'nous sommes amis', n: "Pouce sur la barre d'espace." }, { s: 'un robot gentil', n: "Continue !" }, { s: 'tout va bien', n: "Dernière phrase." }]),
K('Les majuscules', '🔠', 'ses majuscules', "Une majuscule s'écrit avec la touche Maj ⇧ (flèche vers le haut). Maintiens-la avec un petit doigt, puis appuie sur la lettre.",
  [{ s: 'Pixo', n: "Maintiens Maj ⇧ et tape P, puis relâche." }, { s: 'Sara', n: "Maj ⇧ puis S." }, { s: 'Omar et Sara', n: "Deux majuscules dans la phrase." }, { s: 'Bonjour Pixo', n: "Une majuscule à chaque mot important." }]),
K('Écrire en MAJUSCULES : Verr Maj', '🔒', 'sa touche magique', "Pour écrire plusieurs lettres en majuscules, on peut utiliser Verr Maj 🔒 (à gauche, au-dessus de Maj ⇧). Une fois activée, elle reste enfoncée : toutes les lettres sortent en MAJUSCULES.",
  [{ s: 'PIXO', n: "Appuie une fois sur Verr Maj 🔒, puis tape les lettres." }, { s: 'BONJOUR A TOUS', n: "Garde Verr Maj activée : plus besoin de Maj ⇧ pour chaque lettre." }, { s: 'SORTIE DE SECOURS', n: "Idéal pour écrire un titre ou un panneau." }, { s: 'merci pixo', n: "Appuie encore une fois sur Verr Maj pour l'éteindre : on revient aux minuscules." }], true),
{ t: 'Effacer et Entrée', part: '🧽', pn: 'sa gomme',
  intro: "Pixo s'est trompé : il y a des lettres en trop ! Appuie sur Retour arrière ⌫ pour les effacer, puis sur Entrée ↵ pour valider.",
  build(st, h, ok, err) {
    const T = [['Bonjourr', 'Bonjour'], ['Mercii', 'Merci'], ['Pixooo', 'Pixo']]; let p = 0, b = T[0][0];
    st.innerHTML = '<div class="tw"><div><div id="tl" class="tl"></div><div id="tn"></div></div></div>';
    const r = () => { $('#tl').textContent = b + '|'; $('#tn').textContent = b === T[p][1] ? "Parfait ! Appuie sur Entrée ↵" : "Il y a des lettres en trop. Appuie sur Retour arrière ⌫."; };
    window.onkeydown = e => {
      if (e.key === 'Backspace') { e.preventDefault(); b = b.slice(0, -1); if (b.length < T[p][1].length) { b = T[p][0]; err("Tu as effacé trop de lettres. On recommence ce mot."); } r(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (b === T[p][1]) { ++p === 3 ? ok() : (b = T[p][0], r()); } else err("Efface d'abord les lettres en trop avec ⌫."); }
      else if (e.key.length === 1) { e.preventDefault(); err("Ici, utilise seulement ⌫ et Entrée ↵."); }
    };
    r(); h("Retour arrière ⌫ est en haut à droite des lettres. Entrée ↵ est juste en dessous.");
  } },
K('La virgule, le point et le ?', '✏️', 'sa ponctuation', "La virgule est à droite de la lettre N. Pour le point et le point d'interrogation, il faut maintenir Maj ⇧.",
  [{ s: 'Salut, Pixo', n: "La virgule : touche à droite de N, sans Maj." }, { s: 'Merci. Au revoir', n: "Le point : Maj ⇧ + la touche ; (à droite de la virgule)." }, { s: 'Ca va bien ?', n: "Le ? : Maj ⇧ + la touche virgule." }]),
K('Les chiffres', '🔢', 'ses chiffres', "Sur ce clavier, les chiffres demandent Maj ⇧ maintenue, avec la touche du chiffre en haut du clavier.",
  [{ s: '123', n: "Maintiens Maj ⇧ pendant que tu tapes chaque chiffre." }, { s: '2468', n: "Les chiffres pairs." }, { s: '0612345678', n: "Comme un numéro de téléphone." }]),
K('Ma première lettre accentuée : é', '🎓', 'son é', "Les accents sont très utiles en français ! Le é a sa propre touche : c'est la touche du chiffre 2 (appuie sans Maj).",
  [{ s: 'été', n: "é : touche du chiffre 2, sans Maj." }, { s: 'thé', n: "Un é à la fin." }, { s: 'café', n: "Encore un é." }, { s: 'idée', n: "Dernier mot !" }]),
K('Les accents è et ù', '🧩', 'ses accents graves', "Le è est sur la touche du chiffre 7. Le ù est à droite de la lettre M. Appuie sur ces touches sans Maj.",
  [{ s: 'père', n: "è : touche du chiffre 7." }, { s: 'mère', n: "Encore un è." }, { s: 'où', n: "ù : touche à droite de M." }, { s: 'très', n: "Dernier mot !" }]),
K('Les accents à et ç', '🎨', 'ses couleurs', "Le à est sur la touche du chiffre 0. Le ç est sur la touche du chiffre 9. Appuie sans Maj.",
  [{ s: 'à demain', n: "à : touche du chiffre 0." }, { s: 'ça va', n: "ç : touche du chiffre 9." }, { s: 'leçon', n: "ç au milieu d'un mot." }, { s: 'voilà', n: "Dernier mot !" }]),
K("L'arobase @", '📧', 'sa boîte e-mail', "Dernier défi : écrire une adresse e-mail ! Le @ s'écrit avec la touche Alt Gr (à droite de la barre d'espace) et la touche du chiffre 0 (la touche du à).",
  [{ s: 'sara@pixo.ma', n: "@ : maintiens Alt Gr et appuie sur la touche du 0. Le point : Maj ⇧ + ; ." }, { s: 'omar@robot.fr', n: "Même chose. Tu y es presque !" }]),
E('Recopier un petit texte', '📝', 'son carnet', "Tu sais presque tout faire ! Recopie ce petit texte. Les lettres justes deviennent vertes, les fautes deviennent rouges : efface-les avec ⌫ ou clique dessus avec la souris pour corriger.",
  "Bonjour, je m'appelle Pixo.\nJe suis un robot.\nJ'aime les enfants.", "Entrée ↵ passe à la ligne. L'apostrophe ' est sur la touche du chiffre 4 (sans Maj). Tu peux aussi utiliser les flèches ← → du clavier."),
E('Un message pour un ami', '💌', 'sa lettre', "Écris un message à un ami, avec des accents, des majuscules et des signes de ponctuation. Corrige tes fautes avec ⌫ ou avec un clic de souris.",
  "Salut Omar !\nComment ça va ? Moi, je vais très bien.\nA demain, Pixo.", "Le ! est la dernière touche de la rangée du bas (sans Maj). Le ? : Maj ⇧ + la touche virgule. ç : touche du 9. è : touche du 7."),
E('Ma fiche de contact', '🏆', 'son badge de clavier', "Dernier défi du clavier ! Recopie cette fiche avec tout ce que tu as appris : accents, chiffres, @ et signes spéciaux.",
  "Nom : Pixo\nTéléphone : 0612345678\nE-mail : pixo@robot.fr\nPrix (promo) : 5 euros !", "Le : est une touche sans Maj. ( est la touche du 5 et ) est à droite du 0, sans Maj. Chiffres : Maj ⇧. @ : Alt Gr + touche du 0.")
];

/* Saisie guidée : taper des phrases lettre par lettre (sensible aux majuscules) */
function typer(P, caps) {
  return (st, h, ok, err) => {
    let p = 0, i = 0;
    st.innerHTML = '<div class="tw"><div><div id="tl" class="tl"></div><div id="tn"></div>' + (caps ? '<div id="cl" class="cl">🔓 Appuie sur Verr Maj pour voir ce qui se passe</div>' : '') + '</div></div>';
    const cl = e => {
      const c = $('#cl'); if (!c || !e.getModifierState) return; const on = e.getModifierState('CapsLock');
      c.textContent = on ? '🔒 Verr Maj : ACTIVÉE (lettres en MAJUSCULES)' : '🔓 Verr Maj : éteinte (lettres en minuscules)'; c.className = 'cl' + (on ? ' on' : '');
    };
    const r = () => {
      $('#tl').innerHTML = [...P[p].s].map((c, j) => `<span class="${j < i ? 'okc' : j === i ? 'cur' : ''}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
      $('#tn').textContent = P[p].n || ''; h(`Exercice ${p + 1} sur ${P.length} : tape la lettre soulignée.`);
    };
    window.onkeyup = cl;
    window.onkeydown = e => {
      cl(e); if (e.key.length !== 1) return;
      const ag = (e.getModifierState && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey);
      if ((e.ctrlKey || e.metaKey) && !ag) return;
      e.preventDefault(); const t = P[p].s[i];
      if (e.key === t) { if (++i === P[p].s.length) { i = 0; if (++p === P.length) return ok(); } r(); }
      else if (t.toLowerCase() !== t.toUpperCase() && e.key.toLowerCase() === t.toLowerCase())
        err(t === t.toUpperCase() ? "Il faut une MAJUSCULE : active Verr Maj 🔒 (ou maintiens Maj ⇧)." : "Il faut une minuscule : éteins Verr Maj 🔒.");
      else err("Pas la bonne touche. Cherche : " + (t === ' ' ? "la barre d'espace" : "« " + t + " »"));
    };
    r();
  };
}
function K(t, part, pn, intro, P, caps) { return { t, part, pn, intro, build: typer(P, caps) }; }
function E(t, part, pn, intro, T, tip) { return { t, part, pn, intro, tol: 3, build: editor(T, tip) }; }

/* Petit éditeur : lettres justes en vert, fautes en rouge, correction au clavier ou à la souris */
function editor(T, tip) {
  return (st, h, ok, err) => {
    let b = '', pos = 0;
    st.style.height = 'auto'; st.style.minHeight = '380px'; st.style.overflow = 'visible';
    st.innerHTML = '<div class="mod"><b>Texte à recopier :</b><pre id="md"></pre></div><div class="ed" id="ed"></div><div id="tn" class="tipn"></div>';
    $('#md').textContent = T; $('#tn').textContent = tip;
    const ed = $('#ed');
    const r = () => {
      ed.innerHTML = [...b].map((c, i) => (i === pos ? '<i class="car"></i>' : '') + `<span data-i="${i}" class="${c === T[i] ? 'g' : 'r'}">${c === '\n' ? '↵\n' : c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('') + (pos >= b.length ? '<i class="car"></i>' : '');
    };
    ed.onclick = e => {
      const s = e.target.closest('span[data-i]');
      if (s) { const i = +s.dataset.i, q = s.getBoundingClientRect(); pos = e.clientX > q.left + q.width / 2 ? i + 1 : i; } else pos = b.length;
      r();
    };
    const ins = c => { if (c !== T[pos]) err("Ce caractère n'est pas le bon : il est en rouge."); b = b.slice(0, pos) + c + b.slice(pos); pos++; };
    window.onkeydown = e => {
      const ag = (e.getModifierState && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey);
      if ((e.ctrlKey || e.metaKey) && !ag) return;
      const k = e.key;
      if (k === 'Backspace') { if (pos > 0) { b = b.slice(0, pos - 1) + b.slice(pos); pos--; } }
      else if (k === 'Delete') b = b.slice(0, pos) + b.slice(pos + 1);
      else if (k === 'ArrowLeft') pos = Math.max(0, pos - 1);
      else if (k === 'ArrowRight') pos = Math.min(b.length, pos + 1);
      else if (k === 'Enter') ins('\n');
      else if (k.length === 1) ins(k);
      else return;
      e.preventDefault(); r(); if (b === T) { window.onkeydown = null; ok(); }
    };
    r(); h("Les caractères rouges sont faux : efface-les avec ⌫, ou clique dessus avec la souris pour placer le curseur.");
  };
}

/* Glisser des objets dans les bons paniers */
function sorter(I, Sl, tip) {
  return (st, h, ok, err) => {
    const W = st.clientWidth, Hh = st.clientHeight, y0 = Hh * .74; let left = I.length;
    const sl = Sl.map((s, i) => {
      const el = document.createElement('div'); el.className = 'slot'; el.style.width = '150px'; el.style.height = '140px'; el.textContent = s[1];
      const x = W * (i + 1) / (Sl.length + 1); el.style.left = x + 'px'; el.style.top = y0 + 'px'; st.appendChild(el); return { k: s[0], x, n: 0 };
    });
    [...I].sort(() => Math.random() - .5).forEach((it, i) => {
      const e = put(st, it[0], 0, 0), ox = W * (i + 1) / (I.length + 1), oy = Hh * .2;
      e.style.left = ox + 'px'; e.style.top = oy + 'px'; e.style.cursor = 'grab'; e.style.touchAction = 'none';
      e.onpointerdown = ev => { if (e.dataset.ok) return; e.setPointerCapture(ev.pointerId); e.dataset.d = 1; e.style.zIndex = 5; };
      e.onpointermove = ev => { if (!e.dataset.d) return; const b = st.getBoundingClientRect(); e.style.left = (ev.clientX - b.left) + 'px'; e.style.top = (ev.clientY - b.top) + 'px'; };
      e.onpointerup = ev => {
        if (!e.dataset.d) return; delete e.dataset.d; e.style.zIndex = '';
        const b = st.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
        const s = sl.find(q => Math.abs(x - q.x) < 80 && Math.abs(y - y0) < 75);
        if (s && s.k === it[1]) { e.style.left = (s.x - 45 + s.n++ * 45) + 'px'; e.style.top = (y0 - 5) + 'px'; e.style.fontSize = '38px'; e.dataset.ok = 1; if (!--left) ok(); }
        else { e.style.left = ox + 'px'; e.style.top = oy + 'px'; err(s ? "Ce n'est pas le bon endroit. Regarde bien le nom écrit !" : "Relâche l'objet au-dessus d'un panier."); }
      };
    });
    h(tip);
  };
}

/* Glisser le robot le long d'une route sans en sortir */
function road(wd) {
  return (st, h, ok, err) => {
    const W = st.clientWidth, M = 8;
    const P = [[70, 60], [W - 70, 60], [W - 70, 190], [70, 190], [70, 320], [W - 70, 320]], R = [];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], c = P[i + 1], r = { x: Math.min(a[0], c[0]) - wd / 2, y: Math.min(a[1], c[1]) - wd / 2, w: Math.abs(a[0] - c[0]) + wd, h: Math.abs(a[1] - c[1]) + wd };
      R.push(r); const d = document.createElement('div'); d.className = 'road';
      d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; st.appendChild(d);
    }
    const f = put(st, '🏁', 0, 0); f.style.left = P[5][0] + 'px'; f.style.top = P[5][1] + 'px'; f.style.cursor = 'default';
    const e = put(st, '🤖', 0, 0); e.style.cursor = 'grab'; e.style.touchAction = 'none'; e.style.zIndex = 3;
    const back = () => { e.style.left = P[0][0] + 'px'; e.style.top = P[0][1] + 'px'; delete e.dataset.d; };
    back();
    e.onpointerdown = ev => { e.setPointerCapture(ev.pointerId); e.dataset.d = 1; };
    e.onpointermove = ev => {
      if (!e.dataset.d) return; const b = st.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top;
      if (!R.some(r => x >= r.x - M && x <= r.x + r.w + M && y >= r.y - M && y <= r.y + r.h + M)) { back(); return err("Tu es sorti de la route ! Recommence depuis le départ."); }
      e.style.left = x + 'px'; e.style.top = y + 'px';
      if (Math.hypot(x - P[5][0], y - P[5][1]) < 40) { delete e.dataset.d; ok(); }
    };
    e.onpointerup = () => { if (e.dataset.d) { back(); err("Ne relâche pas le bouton avant le drapeau !"); } };
    h("Appuie sur le robot, garde le bouton enfoncé et suis la route bleue jusqu'au drapeau 🏁.");
  };
}

/* ---------- Écrans ---------- */
const view = html => { window.onkeydown = window.onkeyup = null; app.innerHTML = html; };

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
  const all = LV.every((_, i) => done(g, i)), max = LV.length * 3;
  view(`<div class="card"><h1>Groupe « ${esc(S.cur)} »</h1>
  <div class="gs">⭐ Étoiles du groupe : <b>${gStars(g)}</b> sur ${max * g.members.length}</div>
  <div>${g.members.map(m => `<span class="chip">${m.av} ${esc(m.n)} : ⭐ ${mStars(g, m)} / ${max}</span>`).join('')}</div>
  <p>Pièces retrouvées de Pixo :</p>
  <div class="robot">${LV.map((l, i) => '<span>' + (done(g, i) ? l.part : '❔') + '</span>').join('')}</div>
  ${all ? '<h2>Bravo ! Pixo a retrouvé toutes ses pièces et tous ses pouvoirs !</h2><button class="btn" id="bil">🏆 Voir le bilan et les badges</button>' : ''}</div>
  <div class="levels">${LV.map((l, i) => {
    const k = g.members.filter(m => star(g, i, m)).length, ok = unlocked(g, i);
    return (W[i] ? '<h2 style="grid-column:1/-1">' + W[i] + '</h2>' : '') + `<div class="card lv ${done(g, i) ? 'ok' : ''} ${ok ? '' : 'lock'}" data-l="${i}" tabindex="0">
    <div class="big">${ok ? (done(g, i) ? '✅' : '🎮') : '🔒'}</div><h3>Niveau ${i + 1}</h3><div>${l.t}</div>
    <small>${done(g, i) ? '🔁 Cliquer pour rejouer' : k + '/' + g.members.length + ' membres ont réussi'}</small></div>`;
  }).join('')}</div>`);
  if ($('#bil')) $('#bil').onclick = bilan;
  app.querySelectorAll('[data-l]').forEach(c => {
    const go = () => { const i = +c.dataset.l; if (unlocked(g, i)) play(i); };
    c.onclick = go; c.onkeydown = e => e.key === 'Enter' && go();
  });
}

function play(li) {
  const g = G(), m = nextMember(g, li);
  if (m) return ready(li, m);
  view(`<div class="card"><h2>Niveau ${li + 1} : ${LV[li].t}</h2><p>Tout le monde a réussi ce niveau. Qui veut le rejouer pour gagner plus d'étoiles ?</p>
  ${g.members.map((x, i) => `<button class="btn" data-m="${i}">${x.av} ${esc(x.n)} ${'⭐'.repeat(star(g, li, x))}</button>`).join('')}
  <p><button class="btn s" id="bk">⬅ Retour à la carte</button></p></div>`);
  app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => ready(li, g.members[+b.dataset.m]));
  $('#bk').onclick = map;
}

function ready(li, m) {
  const L = LV[li];
  view(`<div class="card"><h2>${m.av} C'est le tour de ${esc(m.n)} !</h2>
  <h3>Niveau ${li + 1} : ${L.t}</h3><p>${L.intro}</p><button class="btn" id="go">▶️ Je suis prêt(e)</button></div>`);
  $('#go').onclick = () => start(li, m);
}

function start(li, m) {
  const L = LV[li]; let errs = 0;
  view(`<div class="card"><h2>${m.av} ${esc(m.n)} : ${L.t}</h2><div class="hint" id="h"></div><div class="stage" id="st"></div></div>`);
  const st = $('#st'), h = t => $('#h').textContent = t;
  const err = t => { errs++; h('💡 ' + t); };
  const ok = () => {
    const tol = L.tol || 1, stars = errs <= tol ? 3 : errs <= tol * 3 ? 2 : 1, g = G(), prev = star(g, li, m);
    (g.prog[li] = g.prog[li] || {})[m.n] = Math.max(prev, stars); save();
    try { confetti({ particleCount: 140, spread: 80, origin: { y: .6 } }); } catch (e) {}
    const more = nextMember(g, li);
    view(`<div class="card" style="text-align:center"><h1>Bravo ${esc(m.n)} !</h1>
    <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    ${prev && stars <= prev ? '<p>Ton meilleur score est gardé : ' + '⭐'.repeat(prev) + '</p>' : ''}
    <p>Pixo récupère ${L.pn} ${L.part}</p>
    <button class="btn" id="nx">${more ? 'Au suivant : ' + more.av + ' ' + esc(more.n) : 'Voir la carte'}</button>
    <button class="btn s" id="rp">🔁 Rejouer</button></div>`);
    $('#nx').onclick = () => more ? ready(li, more) : map();
    $('#rp').onclick = () => ready(li, m);
  };
  L.build(st, h, ok, err);
}

/* ---------- Bilan final : étoiles et badges ---------- */
const WR = [[0, 14, '🖱️', 'Roi de la souris'], [14, LV.length, '⌨️', 'As du clavier']];
const rank = p => p >= .9 ? ['🏆', "Maître de l'ordinateur"] : p >= .7 ? ['🥇', 'Expert'] : p >= .5 ? ['🥈', 'Explorateur'] : ['🥉', 'Débutant courageux'];
function bilan() {
  const g = G(), mx = LV.length * 3, tot = gStars(g);
  const cards = g.members.map(m => {
    const t = mStars(g, m), r = rank(t / mx);
    const bs = WR.filter(w => { let s = 0; for (let i = w[0]; i < w[1]; i++) s += star(g, i, m); return s >= (w[1] - w[0]) * 3 * .8; })
      .map(w => `<span class="chip on">${w[2]} ${w[3]}</span>`).join('') || "<small>Rejoue des niveaux pour gagner des badges !</small>";
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

/* ---------- Barre du haut ---------- */
$('#bHome').onclick = home;
$('#bHelp').onclick = () => alert("Aide\n\n• Lis la consigne, puis clique sur « Je suis prêt(e) ».\n• Chaque membre du groupe joue à son tour.\n• Quand tout le monde a réussi, le niveau suivant s'ouvre.\n• Tu peux rejouer un niveau terminé pour gagner plus d'étoiles.\n• Tu peux te tromper : essaie encore !");
S.cur && S.groups[S.cur] ? map() : home();
