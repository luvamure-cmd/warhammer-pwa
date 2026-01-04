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
  deAnim.style.display = "block";
  deAnim.classList.remove("roll");
  void deAnim.offsetWidth;
  deAnim.classList.add("roll");

  if (navigator.vibrate) navigator.vibrate(80);

  const audio = new Audio(
    "https://freesound.org/data/previews/256/256113_3263906-lq.mp3"
  );
  audio.volume = 0.4;
  audio.play();

  setTimeout(() => (deAnim.style.display = "none"), 800);
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
  if (!nom.value || !pv.value) {
    alert("Nom et PV requis");
    return;
  }

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

  if (uniteEnEdition !== null) {
    unites[uniteEnEdition] = u;
  } else {
    unites.push(u);
  }

  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function supprimerUnite(i) {
  if (!confirm(`Supprimer "${unites[i].nom}" ?`)) return;
  unites.splice(i, 1);
  sauvegarder();
  rafraichirTout();
}

function dupliquerUnite(i) {
  const base = unites[i];
  let n = 1;
  let nomUnique = `${base.nom} ${n}`;
  while (unites.some(u => u.nom === nomUnique)) n++;
  unites.push({ ...base, nom: `${base.nom} ${n}` });
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

/* ========= AFFICHAGES ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
        ${renderBarrePV(u)}
        <button onclick="event.stopPropagation(); dupliquerUnite(${i})">📄 Dupliquer</button>
        <button onclick="event.stopPropagation(); supprimerUnite(${i})">🗑️ Supprimer</button>
      </div>
    `;
  });
}

function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";
  unites.forEach((u, i) => {
    const carte = `
      <div class="carte-unite">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        ${renderBarrePV(u)}
      </div>`;
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
  return `<img src="${u.image}"><strong>${u.nom}</strong>${renderBarrePV(u)}`;
}

/* ========= ATTAQUE ========= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  lancerAnimationDe();

  let log = "";

  for (let i = 1; i <= a.attaques; i++) {
    const jetTouche = d6();
    if (jetTouche < a[type]) {
      log += `⚔️ ${i} ❌ (${jetTouche})\n`;
      continue;
    }

    const jetSave = d6();
    if (jetSave >= d.save) {
      log += `⚔️ ${i} 🎯${jetTouche} 🛡️${jetSave} ✅\n`;
      continue;
    }

    const deg =
      Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
    d.pv = Math.max(0, d.pv - deg);
    log += `⚔️ ${i} 🎯${jetTouche} 💥 -${deg}❤️\n`;
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
try {
  const data = localStorage.getItem("unitesWarhammer");
  if (data) unites = JSON.parse(data);
} catch (e) {
  console.error("Erreur chargement storage", e);
  unites = [];
}
rafraichirTout();
