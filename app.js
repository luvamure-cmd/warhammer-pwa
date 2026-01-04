/* ========= DOM ========= */
const nom = document.getElementById("nom");
const pv = document.getElementById("pv");
const image = document.getElementById("image");
const save = document.getElementById("save");
const cac = document.getElementById("cac");
const dist = document.getElementById("dist");
const attaquesUnite = document.getElementById("attaquesUnite");
const degMin = document.getElementById("degMin");
const degMax = document.getElementById("degMax");

const listeUnites = document.getElementById("listeUnites");
const listeAttaquants = document.getElementById("listeAttaquants");
const listeDefenseurs = document.getElementById("listeDefenseurs");

const zoneAttaquant = document.getElementById("zoneAttaquant");
const zoneDefenseur = document.getElementById("zoneDefenseur");

const resultat = document.getElementById("resultat");
const deAnim = document.getElementById("de-animation");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ========= OUTILS ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ========= STORAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= ANIMATION DÉ ========= */
function lancerAnimationDe() {
  if (!deAnim) return;
  deAnim.classList.remove("active");
  void deAnim.offsetWidth; // reset
  deAnim.classList.add("active");

  if (navigator.vibrate) navigator.vibrate(80);

  const audio = new Audio(
    "https://freesound.org/data/previews/256/256113_3263906-lq.mp3"
  );
  audio.volume = 0.4;
  audio.play();
}

/* ========= BARRE PV ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";
  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ========= UNITÉS ========= */
function ajouterUnite() {
  if (!nom.value || !pv.value) return alert("Nom et PV requis");

  const u = {
    nom: nom.value,
    image: image.value || IMAGE_DEFAUT,
    pvMax: +pv.value,
    pv: +pv.value,
    attaques: +attaquesUnite.value || 1,
    save: +save.value || 4,
    cac: +cac.value || 4,
    dist: +dist.value || 4,
    degMin: +degMin.value || 1,
    degMax: +degMax.value || 1
  };

  uniteEnEdition !== null ? (unites[uniteEnEdition] = u) : unites.push(u);

  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function supprimerUnite(i) {
  if (!confirm(`Supprimer l'unité "${unites[i].nom}" ?`)) return;
  unites.splice(i, 1);
  sauvegarder();
  rafraichirTout();
}

function chargerUnite(i) {
  const u = unites[i];
  uniteEnEdition = i;

  nom.value = u.nom;
  image.value = u.image;
  pv.value = u.pvMax;
  attaquesUnite.value = u.attaques;
  save.value = u.save;
  cac.value = u.cac;
  dist.value = u.dist;
  degMin.value = u.degMin;
  degMax.value = u.degMax;
}

/* ========= DUPLICATION ========= */
function dupliquerUnite(i) {
  const base = unites[i];
  let n = 1;
  let nouveauNom = `${base.nom} ${n}`;

  while (unites.some(u => u.nom === nouveauNom)) {
    n++;
    nouveauNom = `${base.nom} ${n}`;
  }

  unites.push({ ...base, nom: nouveauNom });
  sauvegarder();
  rafraichirTout();
}

/* ========= AFFICHAGE UNITÉS ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    const carte = document.createElement("div");
    carte.className = "carte-unite";
    carte.innerHTML = `
      <img src="${u.image}">
      <div class="nom-unite">${u.nom}</div>
      <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
      ${renderBarrePV(u)}
    `;

    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "🗑️ Supprimer";
    btnSupprimer.onclick = e => {
      e.stopPropagation();
      supprimerUnite(i);
    };

    const btnDupliquer = document.createElement("button");
    btnDupliquer.textContent = "📄 Dupliquer";
    btnDupliquer.onclick = e => {
      e.stopPropagation();
      dupliquerUnite(i);
    };

    carte.appendChild(btnDupliquer);
    carte.appendChild(btnSupprimer);

    carte.onclick = () => chargerUnite(i);

    listeUnites.appendChild(carte);
  });
}

/* ========= COMBAT ========= */
function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";

  unites.forEach((u, i) => {
    const carte = `
      <div class="carte-unite">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
        ${renderBarrePV(u)}
      </div>
    `;
    listeAttaquants.innerHTML += `<div onclick="indexAttaquant=${i}; afficherCombat()">${carte}</div>`;
    listeDefenseurs.innerHTML += `<div onclick="indexDefenseur=${i}; afficherCombat()">${carte}</div>`;
  });
}

function afficherCombat() {
  if (indexAttaquant === null || indexDefenseur === null) return;
  zoneAttaquant.innerHTML = renderCombat(unites[indexAttaquant]);
  zoneDefenseur.innerHTML = renderCombat(unites[indexDefenseur]);
}

function renderCombat(u) {
  return `
    <img src="${u.image}">
    <strong>${u.nom}</strong>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

/* ========= ATTAQUE ========= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  lancerAnimationDe();

  let log = "";
  const ⚔️ = "⚔️";
  const 🎯 = "🎯";
  const ❌ = "❌";
  const 🛡️ = "🛡️";
  const 💥 = "💥";
  const ❤️ = "❤️";

  for (let i = 1; i <= a.attaques; i++) {
    const jetTouche = d6();
    const touche = jetTouche >= a[type];

    log += `${⚔️} ${i} → ${🎯}${jetTouche} `;

    if (!touche) {
      log += `${❌}\n`;
      continue;
    }

    const jetSave = d6();
    const sauvegarde = jetSave >= d.save;

    log += `${🛡️}${jetSave} `;

    if (sauvegarde) {
      log += `✅\n`;
      continue;
    }

    const degats =
      Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;

    d.pv = Math.max(0, d.pv - degats);

    log += `${💥} -${degats}${❤️}\n`;
  }

  resultat.innerText = log;
  sauvegarder();
  rafraichirTout();
}

/* ========= RESET ========= */
function resetCombat() {
  unites.forEach(u => (u.pv = u.pvMax));
  sauvegarder();
  rafraichirTout();
}

/* ========= GLOBAL ========= */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ========= INIT ========= */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
