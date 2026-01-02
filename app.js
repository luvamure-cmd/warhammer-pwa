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
    afficherUnites();
  }
}

/* ---------- UNITÉS ---------- */

function ajouterUnite() {
  let unite = {
    nom: nom.value,
    image: image.value,
    pvMax: parseInt(pv.value),
    pv: parseInt(pv.value),
    save: parseInt(save.value),
    cac: parseInt(cac.value),
    dist: parseInt(dist.value),
    degMin: parseInt(degMin.value),
    degMax: parseInt(degMax.value)
  };

  if (uniteEnEdition !== null) {
    unites[uniteEnEdition] = unite;
    uniteEnEdition = null;
    afficher("Unité modifiée : " + unite.nom);
  } else {
    unites.push(unite);
    afficher("Unité ajoutée : " + unite.nom);
  }

  sauvegarder();
  mettreAJourSelects();
  afficherUnites();
}


function mettreAJourSelects() {
  attaquant.innerHTML = "";
  defenseur.innerHTML = "";
  unites.forEach((u, i) => {
    attaquant.innerHTML += `<option value="${i}">${u.nom}</option>`;
    defenseur.innerHTML += `<option value="${i}">${u.nom}</option>`;
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
  cac.value = u.cac;
  dist.value = u.dist;
  degMin.value = u.degMin;
  degMax.value = u.degMax;
}

/* ---------- AFFICHAGE UNITÉS ---------- */
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
  afficherCombat();
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

function afficherCombat() {
  let a = unites[attaquant.value];
  let d = unites[defenseur.value];

  if (!a || !d) return;

  zoneAttaquant.innerHTML = `
    <img src="${a.image}">
    <div><strong>${a.nom}</strong></div>
    <div>PV : ${a.pv} / ${a.pvMax}</div>
  `;

  zoneDefenseur.innerHTML = `
    <img src="${d.image}">
    <div><strong>${d.nom}</strong></div>
    <div>PV : ${d.pv} / ${d.pvMax}</div>
  `;
}

function supprimerUnite() {
  if (uniteEnEdition === null) {
    alert("Sélectionne une unité à supprimer");
    return;
  }

  if (!confirm("Supprimer cette unité ?")) return;

  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;

  sauvegarder();
  mettreAJourSelects();
  afficherUnites();
  afficher("Unité supprimée");

  // vider le formulaire
  nom.value = "";
  image.value = "";
  pv.value = "";
  save.value = "";
  cac.value = "";
  dist.value = "";
  degMin.value = "";
  degMax.value = "";
}


/* ---------- UI ---------- */
function afficher(txt) {
  resultat.innerText = txt;
  resultatCombat.innerText = txt;
}


/* ---------- AU CHARGEMENT ---------- */
charger();









