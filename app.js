/* ================== DOM ================== */
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

/* ================== ÉTAT ================== */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ================== OUTILS ================== */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ================== STORAGE ================== */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ================== BARRE PV ================== */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ================== UNITÉS ================== */
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

/* ================== AFFICHAGE ================== */
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
        ${renderBarrePV(u)}
      </div>
    `;

    listeAttaquants.innerHTML +=
      `<div onclick="indexAttaquant=${i};afficherCombat()">${carte}</div>`;
    listeDefenseurs.innerHTML +=
      `<div onclick="indexDefenseur=${i};afficherCombat()">${carte}</div>`;
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

/* ================== ANIMATION DÉ UNIQUE ================== */
const de = document.createElement("div");
de.innerHTML = "🎲";
de.style.position = "fixed";
de.style.top = "50%";
de.style.left = "50%";
de.style.transform = "translate(-50%, -50%)";
de.style.fontSize = "90px";
de.style.display = "none";
de.style.zIndex = "9999";
document.body.appendChild(de);

function lancerAnimationDe(callback) {
  de.style.display = "block";
  de.style.animation = "spin 1s linear";

  setTimeout(() => {
    de.style.display = "none";
    de.style.animation = "";
    callback();
  }, 1000);
}

/* ================== COMBAT ================== */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];

  lancerAnimationDe(() => {
    let journal = "";

    for (let i = 1; i <= a.attaques && d.pv > 0; i++) {
      const jetTouche = d6();
      const seuilTouche = type === "cac" ? a.cac : a.dist;

      if (jetTouche > seuilTouche) {
        const jetSave = d6();
        if (jetSave > d.save) {
          const deg =
            Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
          d.pv = Math.max(0, d.pv - deg);
          journal += `Attaque ${i} : touchée ✔️, sauvegarde ratée ❌ → ${deg} PV<br>`;
        } else {
          journal += `Attaque ${i} : touchée ✔️, sauvegarde réussie 🛡️<br>`;
        }
      } else {
        journal += `Attaque ${i} : manquée ❌<br>`;
      }
    }

    sauvegarder();
    rafraichirTout();
    resultat.innerHTML = journal || "Aucune attaque effectuée";
  });
}

/* ================== RESET ================== */
function resetCombat() {
  unites.forEach(u => (u.pv = u.pvMax));
  sauvegarder();
  rafraichirTout();
  resultat.innerText = "Combat réinitialisé";
}

/* ================== GLOBAL ================== */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ================== INIT ================== */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
