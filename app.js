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
const titreFormulaire = document.querySelector(".box h3");

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

/* ========= BARRE PV ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";
  return `<div class="barre-vie"><div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div></div>`;
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

function supprimerUnite() {
  if (uniteEnEdition === null) return;
  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

function copierUnite(i) {
  const original = unites[i];
  const copie = { ...original };

  // Nom unique avec numéro incrémenté
  let num = 1;
  let baseNom = original.nom.replace(/\d+$/, "").trim();
  let nouveauNom = `${baseNom} ${num}`;
  while (unites.find(u => u.nom === nouveauNom)) {
    num++;
    nouveauNom = `${baseNom} ${num}`;
  }
  copie.nom = nouveauNom;

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

/* ========= AFFICHAGES ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
        ${renderBarrePV(u)}
        <button style="margin-top:5px;width:90%;" onclick="copierUnite(${i})">Dupliquer</button>
        <button style="margin-top:5px;width:90%;background:#a33;" onclick="chargerUnite(${i})">Modifier</button>
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
    listeAttaquants.innerHTML += `<div onclick="indexAttaquant=${i};afficherCombat()">${carte}</div>`;
    listeDefenseurs.innerHTML += `<div onclick="indexDefenseur=${i};afficherCombat()">${carte}</div>`;
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

/* ========= COMBAT ========= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  // Son et vibration
  if (navigator.vibrate) navigator.vibrate(150);
  const audio = new Audio("https://www.soundjay.com/button/sounds/button-16.mp3");
  audio.play();

  // Animation dé unique
  const diceImg = document.createElement("img");
  diceImg.src = "https://upload.wikimedia.org/wikipedia/commons/1/1b/Dice-6.png"; // image de dé
  diceImg.style.width = "80px";
  diceImg.style.display = "block";
  diceImg.style.margin = "10px auto";
  zoneAttaquant.appendChild(diceImg);

  // Animation rotation
  diceImg.style.transition = "transform 0.8s";
  diceImg.style.transform = "rotate(720deg)";
  setTimeout(() => {
    zoneAttaquant.removeChild(diceImg);

    // Lancer les attaques
    let journal = "";
    for (let i = 0; i < a.attaques; i++) {
      const toucheRoll = d6();
      const touche = toucheRoll > a[type]; // touche si dé > caractéristique
      const saveRoll = touche ? d6() : null;
      const blesse = touche && saveRoll > d.save;
      let degats = 0;
      if (blesse) {
        degats = Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
        d.pv -= degats;
        d.pv = Math.max(0, d.pv);
      }
      journal += `Attaque ${i + 1} : `;
      journal += touche ? "Touchée" : "Ratée";
      if (touche) {
        journal += `, jet de sauvegarde ${saveRoll > d.save ? "raté" : "réussi"}`;
        if (blesse) journal += ` : ${d.nom} perd ${degats} PV`;
      }
      journal += "\n";
    }

    resultat.innerText = journal;
    sauvegarder();
    rafraichirTout();
  }, 800);
}

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

/* ========= COLLAPSABLE FORMULAIRE ========= */
titreFormulaire.style.cursor = "pointer";
let collapsed = false;
titreFormulaire.addEventListener("click", () => {
  const box = titreFormulaire.parentElement;
  collapsed = !collapsed;
  box.style.height = collapsed ? "40px" : "auto";
  box.style.overflow = collapsed ? "hidden" : "visible";
});
