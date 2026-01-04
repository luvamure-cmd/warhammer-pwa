const state = {
  unites: JSON.parse(localStorage.getItem("unites")) || [],
  selection: { attaquant:null, defenseur:null },
  edit:null
};

const qs = id => document.getElementById(id);

qs("toggleForm").onclick = () => {
  qs("formUnite").style.display =
    qs("formUnite").style.display === "block" ? "none" : "block";
};

qs("btnSave").onclick = () => {
  const u = {
    nom: qs("nom").value,
    pvMax: +qs("pv").value,
    pv: +qs("pv").value,
    save: +qs("save").value,
    cac: +qs("cac").value,
    dist: +qs("dist").value,
    attaques: +qs("attaques").value,
    degMin: +qs("degMin").value,
    degMax: +qs("degMax").value,
    img: null
  };

  const file = qs("photo").files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => {
      u.img = r.result;
      saveUnit(u);
    };
    r.readAsDataURL(file);
  } else saveUnit(u);
};

function saveUnit(u){
  state.edit!==null ? state.unites[state.edit]=u : state.unites.push(u);
  state.edit=null;
  persist();
  render();
}

function persist(){
  localStorage.setItem("unites", JSON.stringify(state.unites));
}

function render(){
  const list = qs("listeUnites");
  list.innerHTML="";
  const f = qs("search").value?.toLowerCase() || "";

  state.unites.forEach((u,i)=>{
    if(!u.nom.toLowerCase().includes(f)) return;

    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`
      <img src="${u.img||''}">
      <b>${u.nom}</b><br>
      ❤️ ${u.pv}/${u.pvMax}
      <button onclick="select(${i},'attaquant')">⚔️</button>
      <button onclick="select(${i},'defenseur')">🛡️</button>
      <button onclick="duplicate(${i})">📄</button>
      <button onclick="remove(${i})">🗑️</button>
    `;
    list.appendChild(d);
  });

  updateZones();
}

function select(i,type){
  state.selection[type]=i;
  updateZones();
}

function updateZones(){
  ["attaquant","defenseur"].forEach(t=>{
    const i=state.selection[t];
    qs(t).innerHTML=i===null?"—":state.unites[i].nom;
  });
}

function duplicate(i){
  const c={...state.unites[i]};
  c.nom+=" +";
  state.unites.push(c);
  persist(); render();
}

function remove(i){
  if(confirm("Supprimer cette unité ?")){
    state.unites.splice(i,1);
    persist(); render();
  }
}

function d6(){ return Math.floor(Math.random()*6)+1; }

function attaque(type){
  const a=state.unites[state.selection.attaquant];
  const d=state.unites[state.selection.defenseur];
  if(!a||!d) return;

  let log="";
  showDice();

  for(let i=1;i<=a.attaques;i++){
    const hit=d6()>=a[type];
    if(!hit){ log+=`⚔️ ❌\n`; continue; }

    const save=d6()>=d.save;
    if(save){ log+=`⚔️ ✅ 🛡️\n`; continue; }

    const dmg=d6()%(a.degMax-a.degMin+1)+a.degMin;
    d.pv=Math.max(0,d.pv-dmg);
    log+=`⚔️ ✅ 💥 -${dmg}\n`;
  }

  qs("log").textContent=log;
  persist(); render();
}

function resetCombat(){
  state.unites.forEach(u=>u.pv=u.pvMax);
  persist(); render();
}

function showDice(){
  const de=qs("de");
  de.style.display="block";
  de.style.transform="translate(-50%,-50%) rotate(720deg)";
  setTimeout(()=>de.style.display="none",600);
}

qs("search").oninput=render;
render();
