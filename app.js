/* ========= DOM ========= */
const toggleUnites = document.getElementById("toggleUnites");
const formUnites = document.getElementById("formUnites");

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

/* ========= UTILITAIRES ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ========= STORAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= BARRE PV ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";
  return `<div class="barre-vie"><div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div></div>`;
}

/* ========= FORMULAIRE UNITÉ ========= */
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

  uniteEnEdition !== null
    ? (unites[uniteEnEdition] = u)
    : unites.push(u);

  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function supprimerUnite() {
  if (uniteEnEdition === null) return;
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

    const clickAtt = () => {
      indexAttaquant = i;
      afficherCombat();
    };
    const clickDef = () => {
      indexDefenseur = i;
      afficherCombat();
    };

    const divAtt = document.createElement("div");
    divAtt.innerHTML = carte;
    divAtt.onclick = clickAtt;
    listeAttaquants.appendChild(divAtt);

    const divDef = document.createElement("div");
    divDef.innerHTML = carte;
    divDef.onclick = clickDef;
    listeDefenseurs.appendChild(divDef);
  });
}

/* ========= COMBAT ========= */
function afficherCombat() {
  if (indexAttaquant === null || indexDefenseur === null) return;

  zoneAttaquant.innerHTML = renderCombat(unites[indexAttaquant]);
  zoneDefenseur.innerHTML = renderCombat(unites[indexDefenseur]);
}

function renderCombat(u) {
  return `
    <img src="${u.image}">
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

  let journal = "";
  const nbAttaques = a.attaques;

  for (let i = 1; i <= nbAttaques; i++) {
    const jetTouche = d6();
    const touche = type === "cac" ? a.cac : a.dist;
    if (jetTouche > touche) {
      // touche réussie, jet de sauvegarde
      const jetSave = d6();
      if (jetSave > d.save) {
        const deg = Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
        d.pv -= deg;
        d.pv = Math.max(0, d.pv);
        journal += `Attaque ${i} : Touchée, sauvegarde ratée ! ${d.nom} perd ${deg} PV<br>`;
      } else {
        journal += `Attaque ${i} : Touchée, sauvegarde réussie ! ${d.nom} ne perd pas de PV<br>`;
      }
    } else {
      journal += `Attaque ${i} : Manquée<br>`;
    }
  }

  sauvegarder();
  rafraichirTout();
  resultat.innerHTML = journal;
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  rafraichirTout();
  resultat.innerHTML = "Combat réinitialisé";
}

/* ========= GLOBAL ========= */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ========= FORMULAIRE RÉTRACTABLE ========= */
if (toggleUnites && formUnites) {
  // init ouvert
  formUnites.style.display = "block";
  toggleUnites.addEventListener("click", toggleFormUnites);
  toggleUnites.addEventListener("touchstart", (e) => {
    e.preventDefault();
    toggleFormUnites();
  });
}

function toggleFormUnites() {
  if (formUnites.style.display === "none") {
    formUnites.style.display = "block";
    toggleUnites.textContent = "➕ Ajouter / Modifier une unité ▼";
  } else {
    formUnites.style.display = "none";
    toggleUnites.textContent = "➕ Ajouter / Modifier une unité ►";
  }
}

/* ========= INIT ========= */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
