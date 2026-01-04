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

const toggleForm = document.getElementById("toggleForm");
const formUnite = document.getElementById("formUnite");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;
let indexAttaquant = null;
let indexDefenseur = null;
const IMAGE_DEFAUT = "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

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
  // ouvrir le formulaire si fermé
  formUnite.classList.add("active");
}

/* ========= DUPLICATION ========= */
function dupliquerUnite(i) {
  const u = {...unites[i]};
  let compteur = 1;
  let nomUnique = u.nom;
  while (unites.some(x => x.nom === nomUnique)) {
    compteur++;
    nomUnique = `${u.nom} ${compteur}`;
  }
  u.nom = nomUnique;
  unites.push(u);
  sauvegarder();
  rafraichirTout();
}

/* ========= AFFICHAGES ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";
  unites.forEach((u, i) => {
    const carte = document.createElement("div");
    carte.className = "carte-unite";
    carte.innerHTML = `
      <img src="${u.image}">
      <div class="nom-unite">${u.nom}</div>
      <div class="pv-texte">${u.pv} / ${u.pvMax} PV</div>
      ${renderBarrePV(u)}
    `;
    // Modifier
    const btnModifier = document.createElement("button");
    btnModifier.textContent = "✏️ Modifier";
    btnModifier.onclick = (e) => { e.stopPropagation(); chargerUnite(i); };
    carte.appendChild(btnModifier);
    // Dupliquer
    const btnDupliquer = document.createElement("button");
    btnDupliquer.textContent = "📄 Dupliquer";
    btnDupliquer.onclick = (e) => { e.stopPropagation(); dupliquerUnite(i); };
    carte.appendChild(btnDupliquer);
    // clic sur carte pour sélectionner
    carte.onclick = () => chargerUnite(i);
    listeUnites.appendChild(carte);
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
  return `
    <img src="${u.image}">
    <div><strong>${u.nom}</strong></div>
    <div>Attaques : ${u.attaques}</div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    ${renderBarrePV(u)}
  `;
}

/* ========= COMBAT AVEC EMOJIS ========= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  let journal = "";
  const ⚔️ = "⚔️";
  const ✅ = "✅";
  const ❌ = "❌";
  const 🛡️ = "🛡️";
  const 💥 = "💥";

  for (let i = 1; i <= a.attaques; i++) {
    const jetTouche = d6();
    const touche = jetTouche >= a[type];

    let degats = 0;
    let saveTexte = "-";

    if (touche) {
      const jetSave = d6();
      const sauvegarde = jetSave >= d.save;

      saveTexte = sauvegarde ? 🛡️ : 💥;

      if (!sauvegarde) {
        degats =
          Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
        d.pv = Math.max(0, d.pv - degats);
      }

      journal += `${⚔️} ${i} | 🎯 ${jetTouche} ≥ ${a[type]} ${touche ? ✅ : ❌} | `
              + `🛡️ ${jetSave} ≥ ${d.save} ${saveTexte} | ❤️ -${degats}\n`;
    } else {
      journal += `${⚔️} ${i} | 🎯 ${jetTouche} ≥ ${a[type]} ❌ | ❤️ -0\n`;
    }
  }

  resultat.innerText = journal;
  sauvegarder();
  rafraichirTout();

  if (navigator.vibrate) navigator.vibrate(200);
  new Audio("https://freesound.org/data/previews/341/341695_62476-lq.mp3").play();
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
toggleForm.addEventListener("click", () => {
  formUnite.classList.toggle("active");
});

const data = localStorage.getItem("unitesWarhammer");
if (data) unites = JSON.parse(data);
rafraichirTout();


