/* ========= DOM ========= */
const nom = document.getElementById("nom");
const pv = document.getElementById("pv");
const image = document.getElementById("image"); // optionnel si présent
const photoUnite = document.getElementById("photoUnite");
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
let imageTemporaire = null;

const IMAGE_DEFAUT =
  "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";

/* ========= OUTILS ========= */
const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ========= STORAGE ========= */
function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

/* ========= PHOTO UNITÉ ========= */
if (photoUnite) {
  photoUnite.addEventListener("change", () => {
    const file = photoUnite.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.onload = () => {
        const MAX = 256;
        let w = img.width;
        let h = img.height;

        if (w > h && w > MAX) {
          h = h * (MAX / w);
          w = MAX;
        } else if (h > MAX) {
          w = w * (MAX / h);
          h = MAX;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        imageTemporaire = canvas.toDataURL("image/jpeg", 0.6);
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}


/* ========= BARRE PV ========= */
function renderBarrePV(u) {
  const pct = Math.max(0, (u.pv / u.pvMax) * 100);
  const color =
    pct > 50 ? "#3fa93f" : pct > 25 ? "#e0b000" : "#c0392b";

  return `
    <div class="barre-vie">
      <div class="barre-vie-interne" style="width:${pct}%;background:${color}"></div>
    </div>
  `;
}

/* ========= AJOUT / MODIF UNITÉ ========= */
function ajouterUnite() {
  if (!nom.value || !pv.value) {
    alert("Nom et PV requis");
    return;
  }

  const u = {
    nom: nom.value,
    image: imageTemporaire || image?.value || IMAGE_DEFAUT,
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
  imageTemporaire = null;
  if (photoUnite) photoUnite.value = "";

  sauvegarder();
  rafraichirTout();
}

/* ========= SUPPRESSION ========= */
function supprimerUnite() {
  if (uniteEnEdition === null) return;
  unites.splice(uniteEnEdition, 1);
  uniteEnEdition = null;
  sauvegarder();
  rafraichirTout();
}

/* ========= CHARGER UNITÉ ========= */
function chargerUnite(i) {
  const u = unites[i];
  uniteEnEdition = i;

  nom.value = u.nom;
  pv.value = u.pvMax;
  attaquesUnite.value = u.attaques;
  save.value = u.save;
  cac.value = u.cac;
  dist.value = u.dist;
  degMin.value = u.degMin;
  degMax.value = u.degMax;

  // Ouvre le formulaire si replié
  if (formUnite.style.maxHeight === "0px" || !formUnite.style.maxHeight) {
    formUnite.style.maxHeight = formUnite.scrollHeight + "px";
  }
}

/* ========= DUPLICATION ========= */
function dupliquerUnite(i) {
  const original = unites[i];
  const copie = JSON.parse(JSON.stringify(original));

  let n = 2;
  let baseNom = original.nom.replace(/\s\d+$/, "");
  copie.nom = `${baseNom} ${n}`;

  while (unites.some(u => u.nom === copie.nom)) {
    n++;
    copie.nom = `${baseNom} ${n}`;
  }

  unites.push(copie);
  sauvegarder();
  rafraichirTout();
}

/* ========= AFFICHAGE UNITÉS ========= */
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

    /* ==== BOUTON DUPLIQUER ==== */
    const btnDupliquer = document.createElement("button");
    btnDupliquer.textContent = "📄 Dupliquer";
    btnDupliquer.onclick = (e) => {
      e.stopPropagation();
      dupliquerUnite(i);
    };

    /* ==== BOUTON SUPPRIMER ==== */
    const btnSupprimer = document.createElement("button");
    btnSupprimer.textContent = "🗑 Supprimer";
    btnSupprimer.style.background = "#a33";

    btnSupprimer.onclick = (e) => {
      e.stopPropagation();
      const ok = confirm(`Supprimer définitivement l'unité "${u.nom}" ?`);
      if (!ok) return;

      unites.splice(i, 1);
      uniteEnEdition = null;
      sauvegarder();
      rafraichirTout();
    };

    /* ==== CLIC SUR CARTE = MODIFIER ==== */
    carte.onclick = () => {
      chargerUnite(i);

      // ouvrir automatiquement le formulaire
      const form = document.getElementById("formUnite");
      form.style.maxHeight = form.scrollHeight + "px";
    };

    carte.appendChild(btnDupliquer);
    carte.appendChild(btnSupprimer);

    listeUnites.appendChild(carte);
  });
}


/* ========= CHOIX COMBAT ========= */
function afficherChoixCombat() {
  listeAttaquants.innerHTML = "";
  listeDefenseurs.innerHTML = "";

  unites.forEach((u, i) => {
    const html = `
      <div class="carte-unite">
        <img src="${u.image}">
        <div class="nom-unite">${u.nom}</div>
        ${renderBarrePV(u)}
      </div>
    `;

    listeAttaquants.innerHTML += `<div onclick="indexAttaquant=${i};afficherCombat()">${html}</div>`;
    listeDefenseurs.innerHTML += `<div onclick="indexDefenseur=${i};afficherCombat()">${html}</div>`;
  });
}

/* ========= COMBAT ========= */
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

/* ========= ATTAQUE ========= */
function attaquer(type) {
  if (indexAttaquant === null || indexDefenseur === null) return;

  const a = unites[indexAttaquant];
  const d = unites[indexDefenseur];
  if (d.pv <= 0) return;

  let log = "";

  for (let i = 1; i <= a.attaques; i++) {
    const jetTouche = d6();
    if (jetTouche < a[type]) {
      log += `⚔️ ${i} ❌\n`;
      continue;
    }

    const jetSave = d6();
    if (jetSave >= d.save) {
      log += `⚔️ ${i} ✅ 🛡️\n`;
      continue;
    }

    const dmg = Math.floor(Math.random() * (a.degMax - a.degMin + 1)) + a.degMin;
    d.pv = Math.max(0, d.pv - dmg);
    log += `⚔️ ${i} ✅ 💥 -${dmg}❤️\n`;
  }

  resultat.innerText = log;
  sauvegarder();
  rafraichirTout();

  if (navigator.vibrate) navigator.vibrate(200);
}

/* ========= RESET ========= */
function resetCombat() {
  unites.forEach(u => (u.pv = u.pvMax));
  sauvegarder();
  rafraichirTout();
}

/* ========= COLLAPSIBLE ========= */
if (toggleForm && formUnite) {
  toggleForm.onclick = () => {
    if (!formUnite.style.maxHeight || formUnite.style.maxHeight === "0px") {
      formUnite.style.maxHeight = formUnite.scrollHeight + "px";
    } else {
      formUnite.style.maxHeight = "0px";
    }
  };
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


