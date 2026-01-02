/* ========= RÉFÉRENCES DOM ========= */
const nom = document.getElementById("nom");
const pv = document.getElementById("pv");
const image = document.getElementById("image");
const save = document.getElementById("save");
const cac = document.getElementById("cac");
const dist = document.getElementById("dist");
const degMin = document.getElementById("degMin");
const degMax = document.getElementById("degMax");

const attaquant = document.getElementById("attaquant");
const defenseur = document.getElementById("defenseur");
const attaques = document.getElementById("attaques");

const zoneAttaquant = document.getElementById("zoneAttaquant");
const zoneDefenseur = document.getElementById("zoneDefenseur");

const listeUnites = document.getElementById("listeUnites");
const resultat = document.getElementById("resultat");
const resultatCombat = document.getElementById("resultatCombat");

/* ========= ÉTAT ========= */
let unites = [];
let uniteEnEdition = null;

/* ========= UTILITAIRES ========= */
function d6() {
  return Math.floor(Math.random() * 6) + 1;
}

function degatsAleatoires(min, max) {
  return min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ========= STOCKAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= SELECTS ========= */
function mettreAJourSelects() {
  const selA = attaquant.value;
  const selD = defenseur.value;

  attaquant.innerHTML = "";
  defenseur.innerHTML = "";

  unites.forEach((u, i) => {
    const optA = document.createElement("option");
    optA.value = i;
    optA.textContent = u.nom;
    attaquant.appendChild(optA);

    const optD = document.createElement("option");
    optD.value = i;
    optD.textContent = u.nom;
    defenseur.appendChild(optD);
  });

  if (selA !== "" && unites[selA]) attaquant.value = selA;
  if (selD !== "" && unites[selD]) defenseur.value = selD;
}

/* ========= CHARGEMENT ========= */
function charger() {
  const data = localStorage.getItem("unitesWarhammer");
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    unites = parsed.map(u => ({
      nom: u.nom || "Unité",
      image: u.image || "",
      pvMax: Number(u.pvMax) || 10,
      pv: (u.pv !== undefined && u.pv !== null)
        ? Number(u.pv)
        : (Number(u.pvMax) || 10),
      save: Number(u.save) || 4,
      cac: Number(u.cac) || 4,
      dist: Number(u.dist) || 4,
      degMin: Number(u.degMin) || 1,
      degMax: Number(u.degMax) || 1
    }));
  } catch {
    localStorage.removeItem("unitesWarhammer");
  }

  if (typeof mettreAJourSelects === "function") mettreAJourSelects();
  afficherUnites();
}

/* ========= UI ========= */
function afficher(txt) {
  resultat.innerText = txt;
  resultatCombat.innerText = txt;
}

function rafraichirCombatEtListe() {
  afficherUnites();
  afficherCombat();
}

/* ========= UNITÉS ========= */
function ajouterUnite() {
  if (!nom.value || !pv.value) {
    alert("Nom et PV obligatoires");
    return;
  }

  const unite = {
    nom: nom.value,
    image: image.value,
    pvMax: parseInt(pv.value),
    pv: parseInt(pv.value),
    save: parseInt(save.value) || 4,
    cac: parseInt(cac.value) || 4,
    dist: parseInt(dist.value) || 4,
    degMin: parseInt(degMin.value) || 1,
    degMax: parseInt(degMax.value) || 1
  };

  if (uniteEnEdition !== null) {
    unites[uniteEnEdition] = unite;
    uniteEnEdition = null;
    afficher("Unité modifiée");
  } else {
    unites.push(unite);
    afficher("Unité ajoutée");
  }

  sauvegarder();
  if (typeof mettreAJourSelects === "function") mettreAJourSelects();
  rafraichirCombatEtListe();
}

function supprimerUnite() {
  if (uniteEnEdition === null) {
    alert("Sélectionne une unité");
    return;
  }

  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;

  sauvegarder();
  if (typeof mettreAJourSelects === "function") mettreAJourSelects();
  rafraichirCombatEtListe();
  afficher("Unité supprimée");
}

function chargerUnite(i) {
  const u = unites[i];
  uniteEnEdition = i;

  nom.value = u.nom;
  image.value = u.image;
  pv.value = u.pvMax;
  save.value = u.save;
  cac.value = u.cac;
  dist.value = u.dist;
  degMin.value = u.degMin;
  degMax.value = u.degMax;
}

/* ========= LISTE UNITÉS ========= */
function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    const pct = Math.max(0, (u.pv / u.pvMax) * 100);
    const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div><strong>${u.nom}</strong></div>
        <div>${u.pv} / ${u.pvMax} PV</div>
        <div class="barre-vie">
          <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  });
}

/* ========= COMBAT ========= */
function attaquer(type) {
  const a = unites[attaquant.value];
  const d = unites[defenseur.value];
  if (!a || !d || d.pv <= 0) return;

  let pertes = 0;
  const nb = parseInt(attaques.value) || 1;
  const touche = type === "cac" ? a.cac : a.dist;

  for (let i = 0; i < nb; i++) {
    if (d6() >= touche && d6() < d.save) {
      const deg = degatsAleatoires(a.degMin, a.degMax);
      d.pv -= deg;
      pertes += deg;
    }
  }

  d.pv = Math.max(0, d.pv);
  sauvegarder();
  rafraichirCombatEtListe();

  afficher(`${a.nom} inflige ${pertes} dégâts à ${d.nom}`);
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  rafraichirCombatEtListe();
  afficher("Combat réinitialisé");
}

/* ========= AFFICHAGE COMBAT ========= */
function afficherCombat() {
  const a = unites[attaquant.value];
  const d = unites[defenseur.value];
  if (!a || !d) return;

  zoneAttaquant.innerHTML = renderCombatUnite(a);
  zoneDefenseur.innerHTML = renderCombatUnite(d);
}

function renderCombatUnite(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <img src="${u.image}">
    <div><strong>${u.nom}</strong></div>
    <div>${u.pv} / ${u.pvMax} PV</div>
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ========= INIT ========= */
charger();
