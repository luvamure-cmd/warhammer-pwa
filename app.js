/* ========= DOM ========= */
const nom = document.getElementById("nom");
const pv = document.getElementById("pv");
const image = document.getElementById("image");
const save = document.getElementById("save");
const cac = document.getElementById("cac");
const dist = document.getElementById("dist");
const degMin = document.getElementById("degMin");
const degMax = document.getElementById("degMax");
const attaquesUnite = document.getElementById("attaquesUnite");

const attaquant = document.getElementById("attaquant");
const defenseur = document.getElementById("defenseur");

const zoneAttaquant = document.getElementById("zoneAttaquant");
const zoneDefenseur = document.getElementById("zoneDefenseur");
const listeUnites = document.getElementById("listeUnites");
const resultat = document.getElementById("resultat");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;

/* ========= OUTILS ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ========= STORAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= BARRE PV ========= */
function barrePV(u) {
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

  uniteEnEdition !== null
    ? (unites[uniteEnEdition] = u)
    : unites.push(u);

  uniteEnEdition = null;
  sauvegarder();
  afficherUnites();
  majSelects();
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

/* ========= LISTE ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
        ${barrePV(u)}
      </div>
    `;
  });
}

/* ========= COMBAT ========= */
function majSelects() {
  attaquant.innerHTML = defenseur.innerHTML = "";
  unites.forEach((u, i) => {
    attaquant.innerHTML += `<option value="${i}">${u.nom}</option>`;
    defenseur.innerHTML += `<option value="${i}">${u.nom}</option>`;
  });
  afficherCombat();
}

function afficherCombat() {
  const a = unites[attaquant.value];
  const d = unites[defenseur.value];
  if (!a || !d) return;

  zoneAttaquant.innerHTML = renderCombat(a);
  zoneDefenseur.innerHTML = renderCombat(d);
}

function renderCombat(u) {
  return `
    <img src="${u.image}">
    <div><strong>${u.nom}</strong></div>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${barrePV(u)}
  `;
}

function attaquer(type) {
  const a = unites[attaquant.value];
  const d = unites[defenseur.value];
  if (!a || !d || d.pv <= 0) return;

  let degats = 0;
  const touche = type === "cac" ? a.cac : a.dist;

  for (let i = 0; i < a.attaques; i++) {
    if (d6() >= touche && d6() < d.save) {
      const dgt = Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
      d.pv -= dgt;
      degats += dgt;
    }
  }

  d.pv = Math.max(0, d.pv);
  sauvegarder();
  afficherUnites();
  afficherCombat();
  resultat.innerText = `${a.nom} inflige ${degats} dégâts à ${d.nom}`;
}

/* ========= INIT ========= */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
majSelects();
afficherUnites();
