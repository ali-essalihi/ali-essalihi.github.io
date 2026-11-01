/* data.js — the character table. Adding a card = adding ONE object to CHARS.
   Fields: cat, char, name, steps, plus optional: note, quiet, copy.
   steps: presses done one after another; each press is a list of keys held together.
   "shift" is resolved by app.js to the left or right Shift key (like a real typist).
   quiet: do not print the name on the small card. copy:false hides « Copier ». */
window.FR_DATA = (function () {
  'use strict';
  const LETTERS = 'azertyuiopqsdfghjklmwxcvbn'.split('');   // AZERTY order
  const NOTE_AZERTY = 'Sur un clavier AZERTY, A, Z, Q, W et M ne sont pas au même endroit que sur un clavier anglais.';
  const DEAD = '^';
  const c = (cat, char, name, steps, extra) => Object.assign({ cat, char, name, steps }, extra);

  const CATS = [
    { id: 'low',   title: 'Les lettres minuscules', intro: NOTE_AZERTY },
    { id: 'up',    title: 'Les lettres majuscules', intro: 'Garde Maj enfoncée, puis appuie sur la lettre.' },
    { id: 'acc',   title: 'Sans combinaison : lettres accentuées', intro: 'Une seule touche suffit.' },
    { id: 'sym',   title: 'Sans combinaison : signes', intro: 'Une seule touche suffit.' },
    { id: 'shift', title: 'Avec Maj', intro: 'Garde Maj enfoncée, puis appuie sur la touche. Les chiffres se tapent toujours avec Maj.' },
    { id: 'altgr', title: 'Avec Alt Gr', intro: 'Alt Gr est la touche à droite de la barre Espace. Garde-la enfoncée, puis appuie sur la touche.' },
    { id: 'dead',  title: 'Accents circonflexe et tréma', intro: "Touche morte : rien ne s'affiche avant la lettre. Appuie d'abord sur l'accent, puis sur la lettre." },
    { id: 'util',  title: 'Les touches utiles' }
  ];

  const CHARS = [
    // Lowercase and uppercase letters
    ...LETTERS.map((l) => c('low', l, 'lettre ' + l, [[l]], { quiet: true })),
    ...LETTERS.map((l) => c('up', l.toUpperCase(), 'majuscule ' + l.toUpperCase(), [['shift', l]], { quiet: true })),
    // One key: accented letters
    c('acc', 'é', 'e accent aigu', [['2']], ),
    c('acc', 'è', 'e accent grave', [['7']], ),
    c('acc', 'ç', 'c cédille', [['9']], ),
    c('acc', 'à', 'a accent grave', [['0']], ),
    c('acc', 'ù', 'u accent grave', [['percent-ugrave']], ),
    // One key: signs
    c('sym', ',', 'virgule', [['question-comma']]),
    c('sym', ';', 'point-virgule', [['dot-semicolon']]),
    c('sym', ':', 'deux-points', [['slash-colon']]),
    c('sym', '!', "point d'exclamation", [['section-exclamation']]),
    c('sym', "'", 'apostrophe', [['4']], ),
    c('sym', '"', 'guillemets droits', [['3']]),
    c('sym', '(', 'parenthèse ouvrante', [['5']]),
    c('sym', ')', 'parenthèse fermante', [['degree']]),
    c('sym', '-', "trait d'union", [['6']], ),
    c('sym', '_', 'tiret bas', [['8']]),
    c('sym', '&', 'et commercial', [['1']]),
    c('sym', '*', 'astérisque', [['mu-asterisk']]),
    c('sym', '=', 'égal', [['plus']]),
    c('sym', '<', 'inférieur à', [['less-greater']]),
    c('sym', '$', 'dollar', [['pound-dollar']]),
    c('sym', '²', 'au carré', [['sup2']], ),
    // With Shift: digits first, then signs
    ...'1234567890'.split('').map((d) => c('shift', d, 'chiffre ' + d, [['shift', d]], { quiet: true })),
    c('shift', '?', "point d'interrogation", [['shift', 'question-comma']]),
    c('shift', '.', 'point', [['shift', 'dot-semicolon']]),
    c('shift', '/', 'barre oblique', [['shift', 'slash-colon']]),
    c('shift', '+', 'plus', [['shift', 'plus']]),
    c('shift', '%', 'pour cent', [['shift', 'percent-ugrave']]),
    c('shift', '°', 'degré', [['shift', 'degree']], ),
    c('shift', '>', 'supérieur à', [['shift', 'less-greater']]),
    c('shift', '£', 'livre sterling', [['shift', 'pound-dollar']]),
    c('shift', 'µ', 'micro', [['shift', 'mu-asterisk']]),
    c('shift', '§', 'paragraphe', [['shift', 'section-exclamation']]),
    // With Alt Gr
    c('altgr', '@', 'arobase', [['altgr', '0']], ),
    c('altgr', '€', 'euro', [['altgr', 'e']]),
    c('altgr', '#', 'dièse', [['altgr', '3']]),
    c('altgr', '{', 'accolade ouvrante', [['altgr', '4']]),
    c('altgr', '}', 'accolade fermante', [['altgr', 'plus']]),
    c('altgr', '[', 'crochet ouvrant', [['altgr', '5']]),
    c('altgr', ']', 'crochet fermant', [['altgr', 'degree']]),
    c('altgr', '|', 'barre verticale', [['altgr', '6']]),
    c('altgr', '\\', 'barre oblique inverse', [['altgr', '8']]),
    c('altgr', '~', 'tilde', [['altgr', '2']]),
    c('altgr', '`', 'accent grave seul', [['altgr', '7']]),
    c('altgr', DEAD, 'accent circonflexe seul', [['altgr', '9']]),
    // Dead keys: circumflex and diaeresis
    ...[['â', 'a'], ['ê', 'e'], ['î', 'i'], ['ô', 'o'], ['û', 'u']]
      .map(([ch, k]) => c('dead', ch, k + ' circonflexe', [['diaeresis-circumflex'], [k]])),
    ...[['ë', 'e'], ['ï', 'i'], ['ü', 'u'], ['ÿ', 'y']]
      .map(([ch, k]) => c('dead', ch, k + ' tréma', [['shift', 'diaeresis-circumflex'], [k]])),
    // Useful keys
    c('util', '␣', 'Espace', [['space']], { copy: false }),
    c('util', '↵', 'Entrée', [['enter']], { copy: false }),
    c('util', '⌫', 'Effacer', [['backspace']], { copy: false }),
    c('util', '⇧', 'Maj', [['shift']], { copy: false, note: 'Il y a une touche Maj de chaque côté du clavier.' }),
    c('util', '⇪', 'Verr Maj', [['capslock']], { copy: false, note: "Appuie une fois pour écrire tout en majuscules, rappuie pour l'éteindre." }),
    c('util', '⇥', 'Tabulation', [['tab']], { copy: false })
  ];

  return { CATS, CHARS };
})();
