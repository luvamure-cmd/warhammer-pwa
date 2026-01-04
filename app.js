const $ = id => document.getElementById(id);

const IMAGE_DEFAUT = "https://stores.warhammer.com/wp-content/uploads/2020/11/4jtAGbPWOxDXUHN2.png";
let unites = JSON.parse(localStorage.getItem("unitesWarhammer")) || [];
let editIndex = null;
let atk = null, def = null;

const d6 = () => Math.floor(Math.random()*6)+1;

function sauvegarder() {
  localStorage.setItem("unitesWarhammer", JSON.stringify(unites));
}

function barrePV(u) {
  const p = Math.max(0,u.pv/u.pvMax*100);
  return `<div class="barre-vie"><div class="barre-vie-interne" style="width:${p}%;background:${p>50?'#3fa93f':p>25?'#e0b000':'#c0392b'}"></div></div>`;
}

function ajouterUnite() {
  const u = {
    nom:nom.value,
    faction:faction.value,
    type:type.value,
    pvMax:+pv.value,
    pv:+pv.value,
    image:image.value||IMAGE_DEFAUT,
    attaques:+attaquesUnite.value,
    cac:+cac.value,
    dist:+dist.value,
    save:+save.value,
    degMin:+degMin.value,
    degMax:+degMax.value
  };
  editIndex!==null ? unites[editIndex]=u : unites.push(u);
  editIndex=null;
  sauvegarder(); render();
}

function render() {
  renderUnites();
  renderCombatList();
}

function renderUnites() {
  listeUnites.innerHTML="";
  filtrer().forEach((u,i)=>{
    listeUnites.innerHTML+=`
    <div class="carte-unite">
      <img src="${u.image}">
      <b>${u.nom}</b>
      ${barrePV(u)}
      <button onclick="dupliquer(${i})">📄</button>
      <button onclick="supprimer(${i})">🗑️</button>
    </div>`;
  });
}

function dupliquer(i){
  const base=unites[i];
  let n=1, nom=base.nom;
  while(unites.some(u=>u.nom===nom)) nom=`${base.nom} ${++n}`;
  unites.push({...base,nom});
  sauvegarder(); render();
}

function supprimer(i){
  if(confirm("Supprimer cette unité ?")){
    unites.splice(i,1);
    sauvegarder(); render();
  }
}

function filtrer(){
  const s=searchInput.value.toLowerCase();
  return unites.filter(u=>
    (!s||u.nom.toLowerCase().includes(s)) &&
    (!filterFaction.value||u.faction.includes(filterFaction.value)) &&
    (!filterType.value||u.type.includes(filterType.value))
  );
}

function renderCombatList(){
  listeAttaquants.innerHTML="";
  listeDefenseurs.innerHTML="";
  filtrer().forEach((u,i)=>{
    const card=`<div class="carte-unite"><img src="${u.image}"><b>${u.nom}</b></div>`;
    listeAttaquants.innerHTML+=`<div onclick="atk=${i};affCombat()">${card}</div>`;
    listeDefenseurs.innerHTML+=`<div onclick="def=${i};affCombat()">${card}</div>`;
  });
}

function affCombat(){
  if(atk==null||def==null)return;
  zoneAttaquant.innerHTML=`<img src="${unites[atk].image}"><b>${unites[atk].nom}</b>`;
  zoneDefenseur.innerHTML=`<img src="${unites[def].image}"><b>${unites[def].nom}</b>`;
}

function attaquer(type){
  if(atk==null||def==null)return;
  const a=unites[atk], d=unites[def];
  let log="";
  de-animation.style.display="block";
  setTimeout(()=>de-animation.style.display="none",600);

  for(let i=1;i<=a.attaques;i++){
    const t=d6(), s=d6(), dmg=d6()>=a.degMin?d6():0;
    const hit=t>=a[type], save=s>=d.save;
    if(hit&&!save)d.pv=Math.max(0,d.pv-dmg);
    log+=`⚔️ ${hit?"✅":"❌"} 🛡️ ${save?"✅":"❌"} 💥 ${hit&&!save?dmg:0}\n`;
  }
  resultat.textContent=log;
  sauvegarder(); render();
}

function resetCombat(){
  unites.forEach(u=>u.pv=u.pvMax);
  sauvegarder(); render();
}

toggleForm.onclick=()=>{
  const c=formUnite;
  c.style.maxHeight=c.style.maxHeight?null:c.scrollHeight+"px";
};

searchInput.oninput=render;
filterFaction.oninput=render;
filterType.oninput=render;

render();
