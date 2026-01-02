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
const resultatCombat = document.getElementById("resultatCombat");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;

/* ========= UTIL ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;
const degatsAleatoires = (min, max) =>
  min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;

const sauvegarder = () =>
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));

/* ========= CHARGEMENT ========= */
function charger() {
  const data = localStorage.getItem("unitesWarhammer");
  if (!data) return;

  unites = JSON.parse(data).map(u => ({
    nom: u.nom || "Unité",
    image: u.image || "",
    pvMax: Number(u.pvMax) || 10,
    pv: Number(u.pv ?? u.pvMax) || 10,
    attaques: Number(u.attaques) || 1,
    save: Number(u.save) || 4,
    cac: Number(u.cac) || 4,
    dist: Number(u.dist) || 4,
    degMin: Number(u.degMin) || 1,
    degMax: Number(u.degMax) || 1
  }));

  rafraichirTout();
}

/* ========= UI ========= */
function afficher(txt) {
  resultat.textContent = txt;
  resultatCombat.textContent = txt;
}

/* ========= UNITÉS ========= */
function ajouterUnite() {
  if (!nom.value || !pv.value) return alert("Nom et PV requis");

  const u = {
    nom: nom.value,
    image: image.value,
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
    uniteEnEdition = null;
    afficher("Unité modifiée");
  } else {
    unites.push(u);
    afficher("Unité ajoutée");
  }

  sauvegarder();
  rafraichirTout();
}

function supprimerUnite() {
  if (uniteEnEdition === null) return alert("Aucune unité sélectionnée");

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

/* ========= AFFICHAGES ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <strong>${u.nom}</strong> (${u.pv}/${u.pvMax})
      </div>`;
  });
}

function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";

  unites.forEach((u, i) => {
    const carte = `
      <div class="carte-unite">
        <strong>${u.nom}</strong>
        <div>${u.pv}/${u.pvMax} PV</div>
      </div>`;

    listeAttaquants.innerHTML += `<div onclick="indexAttaquant=${i};afficherCombat()">${carte}</div>`;
    listeDefenseurs.innerHTML += `<div onclick="indexDefenseur=${i};afficherCombat()">${carte}</div>`;
  });
}

function afficherCombat() {
  zoneAttaquant.innerHTML = indexAttaquant !== null
    ? renderCombatUnite(unites[indexAttaquant])
    : "";

  zoneDefenseur.innerHTML = indexDefenseur !== null
    ? renderCombatUnite(unites[indexDefenseur])
    : "";
}

function renderCombatUnite(u) {
  return `
    <strong>${u.nom}</strong>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv}/${u.pvMax} PV</div>`;
}

/* ========= COMBAT ========= */
function attaquer(type) {
  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (!a || !d || d.pv <= 0) return;

  let pertes = 0;
  for (let i = 0; i < a.attaques; i++) {
    if (d6() >= (type === "cac" ? a.cac : a.dist) && d6() < d.save) {
      const deg = degatsAleatoires(a.degMin, a.degMax);
      d.pv -= deg;
      pertes += deg;
    }
  }

  d.pv = Math.max(0, d.pv);
  sauvegarder();
  rafraichirTout();
  afficher(`${a.nom} inflige ${pertes} dégâts à ${d.nom}`);
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  rafraichirTout();
  afficher("Combat réinitialisé");
}

/* ========= GLOBAL ========= */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ========= INIT ========= */
charger();
