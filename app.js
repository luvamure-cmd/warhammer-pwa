/* ================= DOM ================= */
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

/* ================= ÉTAT ================= */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ================= UTILITAIRES ================= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ================= STORAGE ================= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ================= BARRE PV ================= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ================= UNITÉS ================= */
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

function supprimerUnite() {
  if (uniteEnEdition === null) return;
  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function copierUnite(index) {
  const original = unites[index];
  const baseNom = original.nom.replace(/\s*\(\d+\)$/, "");

  let maxNumero = 1;
  unites.forEach(u => {
    const match = u.nom.match(new RegExp(`^${baseNom}\\s*\\((\\d+)\\)$`));
    if (match) maxNumero = Math.max(maxNumero, parseInt(match[1], 10));
  });

  const copie = {
    ...original,
    nom: `${baseNom} (${maxNumero + 1})`,
    pv: original.pvMax
  };

  unites.push(copie);
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

/* ================= AFFICHAGES ================= */
function renderCarte(u, i, onClick) {
  return `
    <div class="carte-unite" onclick="${onClick}">
      <img src="${u.image}">
      <div class="nom-unite">${u.nom}</div>
      <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
      ${renderBarrePV(u)}
    </div>
  `;
}

function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div>
        ${renderCarte(u, i, `chargerUnite(${i})`)}
        <button onclick="copierUnite(${i})">Dupliquer</button>
      </div>
    `;
  });
}

function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";

  unites.forEach((u, i) => {
    listeAttaquants.innerHTML += renderCarte(u, i, `indexAttaquant=${i};afficherCombat()`);
    listeDefenseurs.innerHTML += renderCarte(u, i, `indexDefenseur=${i};afficherCombat()`);
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
    <div><strong>${u.nom}</strong></div>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

/* ================= COMBAT ================= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  let journal = "";
  let totalDegats = 0;

  // vibration + son
  if (navigator.vibrate) navigator.vibrate(100);
  new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_5c6e3e36fa.mp3").play();

  for (let i = 1; i <= a.attaques; i++) {
    const jetTouche = d6();
    if (jetTouche > (type === "cac" ? a.cac : a.dist)) {
      const jetSave = d6();
      if (jetSave <= d.save) {
        const dmg = Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
        d.pv -= dmg;
        totalDegats += dmg;
        journal += `Attaque ${i} : touchée, sauvegarde ratée → ${dmg} dégâts<br>`;
      } else {
        journal += `Attaque ${i} : touchée, sauvegarde réussie<br>`;
      }
    } else {
      journal += `Attaque ${i} : ratée<br>`;
    }
  }

  d.pv = Math.max(0, d.pv);
  resultat.innerHTML = `${a.nom} inflige ${totalDegats} dégâts à ${d.nom}`;
  resultatCombat.innerHTML = journal;

  sauvegarder();
  rafraichirTout();
}

function resetCombat() {
  unites.forEach(u => (u.pv = u.pvMax));
  sauvegarder();
  rafraichirTout();
}

/* ================= GLOBAL ================= */
function rafraichirTout() {
  afficherUnites();
  afficherChoixCombat();
  afficherCombat();
}

/* ================= INIT ================= */
const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();
