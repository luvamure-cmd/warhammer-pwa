let unites = [];

/* ---------- UTILITAIRES ---------- */
function d6() {
  return Math.floor(Math.random()*6)+1;
}

function degatsAleatoires(min, max) {
  if (min === max) return min;
  return Math.floor(Math.random()*(max-min+1))+min;
}

/* ---------- SAUVEGARDE LOCALE ---------- */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

function charger() {
  let data = localStorage.getItem("unitesWarhammer");
  if (data) {
    unites = JSON.parse(data);
    mettreAJourSelects();
    afficher("Unités chargées");
  }
}

/* ---------- UNITÉS ---------- */
function ajouterUnite() {
  let unite = {
    nom: nom.value,
    pvMax: parseInt(pv.value),
    pv: parseInt(pv.value),
    save: parseInt(save.value),
    cac: parseInt(cac.value),
    dist: parseInt(dist.value),
    degMin: parseInt(degMin.value),
    degMax: parseInt(degMax.value)
  };
  unites.push(unite);
  sauvegarder();
  mettreAJourSelects();
  afficher("Unité ajoutée : " + unite.nom);
  if (uniteEnEdition !== null) {
  unites[uniteEnEdition] = unite;
  uniteEnEdition = null;
} else {
  unites.push(unite);
}

function mettreAJourSelects() {
  attaquant.innerHTML = "";
  defenseur.innerHTML = "";
  unites.forEach((u, i) => {
    attaquant.innerHTML += `<option value="${i}">${u.nom}</option>`;
    defenseur.innerHTML += `<option value="${i}">${u.nom}</option>`;
  });
}

function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div>${u.nom}</div>
      </div>
    `;
  });
}

let uniteEnEdition = null;

function chargerUnite(index) {
  let u = unites[index];
  uniteEnEdition = index;

  nom.value = u.nom;
  image.value = u.image;
  pv.value = u.pvMax;
  save.value = u.save;
  cac.value = u.precisionCAC;
  dist.value = u.precisionDist;
  degMin.value = u.degMin;
  degMax.value = u.degMax;
}


/* ---------- COMBAT ---------- */
function attaquer(type) {
  let a = unites[attaquant.value];
  let d = unites[defenseur.value];
  if (!a || !d || d.pv <= 0) return;

  let nb = parseInt(attaques.value);
  let touche = type === "cac" ? a.cac : a.dist;
  let pertes = 0;

  for (let i=0;i<nb;i++) {
    if (d6() >= touche) {
      if (d6() < d.save) {
        let deg = degatsAleatoires(a.degMin, a.degMax);
        d.pv -= deg;
        pertes += deg;
      }
    }
  }

  if (d.pv < 0) d.pv = 0;
  sauvegarder();
  afficher(`${a.nom} inflige ${pertes} dégâts à ${d.nom} — PV restants : ${d.pv}`);
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  afficher("Combat réinitialisé");
}

/* ---------- UI ---------- */
function afficher(txt) {
  resultat.innerText = txt;
}

/* ---------- AU CHARGEMENT ---------- */
charger();


