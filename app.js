/* ===================== DOM ===================== */
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

/* ===================== ÉTAT ===================== */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;
let animationEnCours = false;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ===================== OUTILS ===================== */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ===================== STORAGE ===================== */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ===================== BARRE PV ===================== */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ===================== UNITÉS ===================== */
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

/* ===================== AFFICHAGE UNITÉS ===================== */
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

/* ===================== CHOIX COMBAT ===================== */
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

/* ===================== AFFICHAGE COMBAT ===================== */
function afficherCombat() {
  if (indexAttaquant === null || indexDefenseur === null) return;

  zoneAttaquant.innerHTML = renderCombat(unites[indexAttaquant]);
  zoneDefenseur.innerHTML = renderCombat(unites[indexDefenseur]);
}

function renderCombat(u) {
  return `
    <img src="${u.image}">
    <div><strong>${u.nom}</strong></div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

/* ===================== DÉ ANIMÉ ===================== */
const de = document.createElement("div");
de.textContent = "🎲";
Object.assign(de.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "90px",
  display: "none",
  zIndex: 9999,
  pointerEvents: "none"
});
document.body.appendChild(de);

function lancerAnimationDe() {
  return new Promise(resolve => {
    de.style.display = "block";
    de.style.animation = "spin 1s linear";

    setTimeout(() => {
      de.style.display = "none";
      de.style.animation = "";
      resolve();
    }, 1000);
  });
}

/* ===================== COMBAT ===================== */
async function attaquer(type) {
  if (animationEnCours) return;
  if (indexAttaquant === null || indexDefenseur === null) return;

  animationEnCours = true;

  await lancerAnimationDe(); // 🎲 UNE SEULE FOIS

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];

  let log = "";

  for (let i = 1; i <= a.attaques && d.pv > 0; i++) {
    const jetTouche = d6();
    const seuilTouche = type === "cac" ? a.cac : a.dist;

    if (jetTouche > seuilTouche) {
      const jetSave = d6();
      if (jetSave > d.save) {
        const deg =
          Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
        d.pv = Math.max(0, d.pv - deg);
        log += `Attaque ${i} : touchée ✔️, sauvegarde ratée ❌ → ${deg} PV<br>`;
      } else {
        log += `Attaque ${i} : touchée ✔️, sauvegarde réussie 🛡️<br>`;
      }
    } else {
      log += `Attaque ${i} : manquée ❌<br>`;
    }
  }

  sauvegarder();
  rafraichirTout();
  resultat.innerHTML = log || "Aucune attaque";
  animationEnCours = false;
}

/* ===================== RESET ===================== */
function resetCombat() {
  unites.forEach(u => (u.pv = u.pvMax));
  sauvegarder();
  rafraichirTout();
  resultat.innerText = "Combat réinitialisé";
}

/* ===================== GLOBAL ===================== */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ===================== INIT ===================== */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
