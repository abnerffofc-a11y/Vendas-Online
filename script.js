import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_AUTH",
  projectId: "SEU_PROJECT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userLogado = null;

/* LOGIN */
window.cadastrar = (e,s)=>createUserWithEmailAndPassword(auth,e,s);
window.entrar = (e,s)=>signInWithEmailAndPassword(auth,e,s);
window.sair = ()=>signOut(auth);

/* CONTROLE DE TELA (SIMPLES E ESTÁVEL) */
onAuthStateChanged(auth,(user)=>{

userLogado = user;

if(user){
document.getElementById("capa").style.display="none";
document.getElementById("login-section").style.display="none";
document.getElementById("anuncios").style.display="block";
}else{
document.getElementById("capa").style.display="block";
document.getElementById("login-section").style.display="block";
document.getElementById("anuncios").style.display="none";
}
});

/* NAVEGAÇÃO */
window.irPara = (id)=>{
document.querySelectorAll("section").forEach(s=>s.style.display="none");
document.getElementById(id).style.display="block";
};

/* CARREGAR ANÚNCIOS */
window.carregarAnuncios = async ()=>{

const lista = document.getElementById("lista-anuncios");
lista.innerHTML="";

const snap = await getDocs(collection(db,"anuncios"));

window.filtrarAnuncios = function () {

  const nome = (document.getElementById("buscaNome").value || "").toLowerCase();
  const cidade = (document.getElementById("buscaCidade").value || "").toLowerCase();
  const categoria = document.getElementById("buscaCategoria").value;

  const min = Number(document.getElementById("precoMin").value) || 0;
  const max = Number(document.getElementById("precoMax").value) || Infinity;

  const lista = document.getElementById("lista-anuncios");
  lista.innerHTML = "";

  todosAnuncios
    .filter(a => {

      return (
        (!nome || a.nome.toLowerCase().includes(nome)) &&
        (!cidade || a.cidade.toLowerCase().includes(cidade)) &&
        (!categoria || a.categoria === categoria) &&
        (Number(a.preco) >= min) &&
        (Number(a.preco) <= max)
      );

    })
    .forEach(a => {

      // REUTILIZA SEU CARD ATUAL
      const div = document.createElement("div");
      div.className = "produto";

      const num = (a.whatsapp || "").replace(/\D/g,"");

      div.innerHTML = `
        <h3>${a.nome}</h3>
        <p>📍 ${a.cidade}</p>
        <p><strong>R$ ${a.preco}</strong></p>

        <a class="btn-whatsapp"
           href="https://wa.me/${num}"
           target="_blank">
           📱 WhatsApp
        </a>

        <button onclick="favoritar('${a.id}')">❤️ Favoritar</button>

        ${userLogado?.uid === a.userId ? `
          <button onclick="editar('${a.id}','${a.nome}','${a.preco}','${a.cidade}','${a.whatsapp}','${a.descricao || ""}')">
            ✏️ Editar
          </button>

          <button onclick="excluir('${a.id}')">
            🗑 Excluir
          </button>
        ` : ""}
      `;

      lista.appendChild(div);
    });
}; 

snap.forEach(d=>{
const a = {id:d.id,...d.data()};

const num = (a.whatsapp||"").replace(/\D/g,"");

const div = document.createElement("div");
div.className="produto";

div.innerHTML = `
  ${a.foto ? `<img src="${a.foto}">` : ""}

  ${a.destaque ? `<span class="badge">⭐ Destaque</span>` : ""}

  <h3>${a.nome}</h3>

  <p>📍 ${a.cidade}</p>

  <p><strong>R$ ${a.preco}</strong></p>

  <p>${a.descricao || ""}</p>

  <a class="btn-whatsapp"
     href="https://wa.me/${num}?text=${encodeURIComponent('Olá vi seu anúncio no marketplace')}"
     target="_blank">
     📱 WhatsApp
  </a>

  <br><br>

  <button onclick="favoritar('${a.id}')">
    ❤️ Favoritar
  </button>

  ${userLogado?.uid === a.userId ? `
    <br><br>

    <button onclick="editar('${a.id}','${a.nome}','${a.preco}','${a.cidade}','${a.whatsapp}','${a.descricao || ""}')">
      ✏️ Editar
    </button>

    <button onclick="excluir('${a.id}')">
      🗑 Excluir
    </button>
  ` : ""}
`;

lista.appendChild(div);
});
};

/* CRIAR */
document.getElementById("form-anuncio").addEventListener("submit",async(e)=>{
e.preventDefault();

if(!userLogado) return alert("Faça login");

await addDoc(collection(db,"anuncios"),{
nome:nome.value,
preco:preco.value,
cidade:cidade.value,
whatsapp:whatsapp.value,
descricao:descricao.value,
userId:userLogado.uid
});

e.target.reset();
carregarAnuncios();
});

/* FAVORITOS */
window.favoritar = async (id)=>{
await addDoc(collection(db,"favoritos"),{
userId:userLogado.uid,
anuncioId:id
});
alert("Favoritado!");
};

/* EXCLUIR */
window.excluir = async (id)=>{
await deleteDoc(doc(db,"anuncios",id));
carregarAnuncios();
};

/* EDITAR */
window.editar = async (id,n,p,c,w,d)=>{

const nn = prompt("Nome",n);
const np = prompt("Preço",p);
const nc = prompt("Cidade",c);
const nw = prompt("WhatsApp",w);
const nd = prompt("Descrição",d);

await updateDoc(doc(db,"anuncios",id),{
nome:nn,
preco:np,
cidade:nc,
whatsapp:nw,
descricao:nd
});

carregarAnuncios();
};
