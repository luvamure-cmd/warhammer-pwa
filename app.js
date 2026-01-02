let unites = [];
let uniteEnEdition = null;

/* ---------- UTILITAIRES ---------- */
function d6() {
  return Math.floor(Math.random() * 6) + 1;
}

function degatsAleatoires(min, max) {
  return min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------- SAUVEGARDE ---------- */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

function charger() {
  const data = localStorage.getItem("unitesWarhammer");
  if (data) unites = JSON.parse(data);
  rafraichirUI();
}

/* ---------- UI GLOBALE ---------- */
function rafraichirUI() {
  mettreAJourSelects();
  afficherUnites();
  afficherCombat();
}

/* ---------- UNITÉS ---------- */
function ajouterUnite() {
  const unite = {
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
    afficher("Unité modifiée");
  } else {
    unites.push(unite);
    afficher("Unité ajoutée");
  }

  sauvegarder();
  rafraichirUI();
}

function supprimerUnite() {
  if (uniteEnEdition === null) return alert("Sélectionne une unité");

  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;

  sauvegarder();
  rafraichirUI();
  afficher("Unité supprimée");
}

/* ---------- LISTE UNITÉS ---------- */
function afficherUnites() {
  listeUnites.innerHTML = "";

  unites.forEach((u, i) => {
    const pct = Math.max(0, (u.pv / u.pvMax) * 100);
    const color = pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

    listeUnites.innerHTML += `
      <div class="carte-unite" onclick="chargerUnite(${i})">
        <img src="${u.image}">
        <div>${u.nom}</div>
        <div>${u.pv} / ${u.pvMax} PV</div>
        <div class="barre-vie">
          <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>
    `;
  });
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

/* ---------- COMBAT ---------- */
function attaquer(type) {
  const a = unites[attaquant.value];
  const d = unites[defenseur.value];
  if (!a || !d || d.pv <= 0) return;

  let pertes = 0;
  const nb = parseInt(attaques.value);
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
  rafraichirUI();

  afficher(`${a.nom} inflige ${pertes} dégâts à ${d.nom}`);
}

function resetCombat() {
  unites.forEach(u => u.pv = u.pvMax);
  sauvegarder();
  rafraichirUI();
  afficher("Combat réinitialisé");
}

/* ---------- AFFICHAGE COMBAT ---------- */
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

/* ---------- TEXTE ---------- */
function afficher(txt) {
  resultat.innerText = txt;
  resultatCombat.innerText = txt;
}

/* ---------- INIT ---------- */
charger();
