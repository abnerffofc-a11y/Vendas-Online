import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
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
  apiKey: "SUA_CHAVE",
  authDomain: "SEU_DOMINIO",
  projectId: "SEU_PROJETO"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userLogado = null;

/* UI */
function mostrar(id){ document.getElementById(id).style.display="block"; }
function esconder(id){ document.getElementById(id).style.display="none"; }

/* LOGIN STATE */
onAuthStateChanged(auth,(user)=>{

userLogado = user;

if(user){
  esconder("capa");
  esconder("login-section");
  mostrar("anuncios");
}else{
  mostrar("capa");
  mostrar("login-section");
  esconder("anuncios");
}
});

/* AUTH */
window.cadastrar = (e,s)=>createUserWithEmailAndPassword(auth,e,s);
window.entrar = (e,s)=>signInWithEmailAndPassword(auth,e,s);
window.sair = ()=>signOut(auth);

/* ANUNCIOS */
window.carregarAnuncios = async () => {

const lista = document.getElementById("lista-anuncios");
lista.innerHTML="";

const snap = await getDocs(collection(db,"anuncios"));

snap.forEach(d=>{
const a = {id:d.id,...d.data()};

const num = (a.whatsapp||"").replace(/\D/g,"");
const w = num.startsWith("55")?num:"55"+num;

const div = document.createElement("div");
div.className="produto";

div.innerHTML=`
<h3>${a.nome}</h3>
<p>${a.cidade}</p>
<p>R$ ${a.preco}</p>

<a target="_blank"
href="https://wa.me/${w}?text=${encodeURIComponent('Olá vi seu anúncio no A&A Marketplace')}"
class="btn-whatsapp">
WhatsApp
</a>

<br><br>

<button onclick="favoritar('${a.id}')">❤️ Favoritar</button>

${userLogado?.uid===a.userId?`
<br><br>
<button onclick="editar('${a.id}','${a.nome}','${a.preco}','${a.cidade}','${a.whatsapp}','${a.descricao||""}')">✏️ Editar</button>
<button onclick="excluir('${a.id}')">🗑 Excluir</button>
`:``}
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
window.favoritar = async (id) => {

if(!userLogado) return alert("Faça login");

await addDoc(collection(db,"favoritos"),{
userId:userLogado.uid,
anuncioId:id
});

alert("Favoritado!");
};

/* EXCLUIR */
window.excluir = async (id) => {
await deleteDoc(doc(db,"anuncios",id));
carregarAnuncios();
};

/* EDITAR */
window.editar = async (id,n,p,c,w,d)=>{

const novoNome = prompt("Nome",n);
const novoPreco = prompt("Preço",p);
const novaCidade = prompt("Cidade",c);
const novoW = prompt("WhatsApp",w);
const novaDesc = prompt("Descrição",d);

await updateDoc(doc(db,"anuncios",id),{
nome:novoNome,
preco:novoPreco,
cidade:novaCidade,
whatsapp:novoW,
descricao:novaDesc
});

carregarAnuncios();
};
