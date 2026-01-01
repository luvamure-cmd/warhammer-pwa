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
}

function mettreAJourSelects() {
  attaquant.innerHTML = "";
  defenseur.innerHTML = "";
  unites.forEach((u, i) => {
    attaquant.innerHTML += `<option value="${i}">${u.nom}</option>`;
    defenseur.innerHTML += `<option value="${i}">${u.nom}</option>`;
  });
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
