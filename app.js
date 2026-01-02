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

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ========= OUTILS ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

function degatsAleatoires(min, max) {
  return min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ========= STORAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= BARRE PV ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `<div class="barre-vie">
            <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
          </div>`;
}

/* ========= CRÉER CARTE ========= */
function creerCarte(u, clicCallback) {
  const div = document.createElement("div");
  div.className = "carte-unite";
  div.innerHTML = `
    <img src="${u.image || IMAGE_DEFAUT}">
    <div class="nom-unite">${u.nom}</div>
    <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
  div.addEventListener("click", clicCallback);
  return div;
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

  if (uniteEnEdition !== null) {
    unites[uniteEnEdition] = u;
  } else {
    unites.push(u);
  }

  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function supprimerUnite() {
  if (uniteEnEdition === null) return alert("Sélectionne une unité");
  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;
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

/* ========= AFFICHAGE UNITÉS ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    const carte = creerCarte(u, () => chargerUnite(i));
    listeUnites.appendChild(carte);
  });
}

function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";

  unites.forEach((u, i) => {
    const carteAtt = creerCarte(u, () => { indexAttaquant = i; afficherCombat(); });
    const carteDef = creerCarte(u, () => { indexDefenseur = i; afficherCombat(); });

    listeAttaquants.appendChild(carteAtt);
    listeDefenseurs.appendChild(carteDef);
  });
}

/* ========= COMBAT ========= */
function afficherCombat() {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];

  zoneAttaquant.innerHTML = renderCombat(a);
  zoneDefenseur.innerHTML = renderCombat(d);
}

function renderCombat(u) {
  return `
    <img src="${u.image || IMAGE_DEFAUT}">
    <div><strong>${u.nom}</strong></div>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;
  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  let degats = 0;
  const touche = type === "cac" ? a.cac : a.dist;

  for (let i = 0; i < a.attaques; i++) {
    if (d6() >= touche && d6() < d.save) {
      const dmg = degatsAleatoires(a.degMin, a.degMax);
      d.pv -= dmg;
      degats += dmg;
    }
  }

  d.pv = Math.max(0, d.pv);
  sauvegarder();
  rafraichirTout();
  resultat.innerText = `${a.nom} inflige ${degats} dégâts à ${d.nom}`;
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  rafraichirTout();
}

/* ========= RAFRAICHIR TOUT ========= */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ========= INIT ========= */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
