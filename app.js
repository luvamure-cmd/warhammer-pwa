/* ========= RÉFÉRENCES DOM ========= */
const nom = document.getElementById("nom");
const pv = document.getElementById("pv");
const image = document.getElementById("image");
const save = document.getElementById("save");
const cac = document.getElementById("cac");
const dist = document.getElementById("dist");
const degMin = document.getElementById("degMin");
const degMax = document.getElementById("degMax");
const attaquesUnite = document.getElementById("attaquesUnite");

const attaquantSelect = document.getElementById("attaquant");
const defenseurSelect = document.getElementById("defenseur");

const zoneAttaquant = document.getElementById("zoneAttaquant");
const zoneDefenseur = document.getElementById("zoneDefenseur");

const listeUnites = document.getElementById("listeUnites");
const resultat = document.getElementById("resultat");
const resultatCombat = document.getElementById("resultatCombat");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;

/* ========= UTILITAIRES ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

function degatsAleatoires(min, max) {
  return min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ========= STOCKAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= BARRE DE VIE ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ========= SELECTS ========= */
function mettreAJourSelects() {
  attaquantSelect.innerHTML = "";
  defenseurSelect.innerHTML = "";

  unites.forEach((u, i) => {
    attaquantSelect.innerHTML += `<option value="${i}">${u.nom}</option>`;
    defenseurSelect.innerHTML += `<option value="${i}">${u.nom}</option>`;
  });
}

/* ========= CHARGEMENT ========= */
function charger() {
  const data = localStorage.getItem("unitesWarhammer");
  if (!data) return;

  unites = JSON.parse(data);
  mettreAJourSelects();
  afficherUnites();
  afficherCombat();
}

/* ========= UNITÉS ========= */
function ajouterUnite() {
  if (!nom.value || !pv.value) return alert("Nom et PV requis");

  const u = {
    nom: nom.value,
    image: image.value,
    pvMax: parseInt(pv.value),
    pv: parseInt(pv.value),
    attaques: parseInt(attaquesUnite.value) || 1,
    save: parseInt(save.value) || 4,
    cac: parseInt(cac.value) || 4,
    dist: parseInt(dist.value) || 4,
    degMin: parseInt(degMin.value) || 1,
    degMax: parseInt(degMax.value) || 1
  };

  if (uniteEnEdition !== null) {
    unites[uniteEnEdition] = u;
    uniteEnEdition = null;
  } else {
    unites.push(u);
  }

  sauvegarder();
  mettreAJourSelects();
  afficherUnites();
  afficherCombat();
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

function supprimerUnite() {
  if (uniteEnEdition === null) return;

  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;

  sauvegarder();
  mettreAJourSelects();
  afficherUnites();
  afficherCombat();
}

/* ========= AFFICHAGE UNITÉS ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
        ${renderBarrePV(u)}
      </div>
    `;
  });
}

/* ========= COMBAT ========= */
function afficherCombat() {
  const a = unites[attaquantSelect.value];
  const d = unites[defenseurSelect.value];
  if (!a || !d) return;

  zoneAttaquant.innerHTML = renderCombatUnite(a);
  zoneDefenseur.innerHTML = renderCombatUnite(d);
}

function renderCombatUnite(u) {
  return `
    <img src="${u.image}">
    <div><strong>${u.nom}</strong></div>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

function attaquer(type) {
  const a = unites[attaquantSelect.value];
  const d = unites[defenseurSelect.value];
  if (!a || !d || d.pv <= 0) return;

  let pertes = 0;
  const touche = type === "cac" ? a.cac : a.dist;

  for (let i = 0; i < a.attaques; i++) {
    if (d6() >= touche && d6() < d.save) {
      const deg = degatsAleatoires(a.degMin, a.degMax);
      d.pv -= deg;
      pertes += deg;
    }
  }

  d.pv = Math.max(0, d.pv);
  sauvegarder();
  afficherUnites();
  afficherCombat();

  resultat.innerText = `${a.nom} inflige ${pertes} dégâts à ${d.nom}`;
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  afficherUnites();
  afficherCombat();
}

/* ========= INIT ========= */
charger();
