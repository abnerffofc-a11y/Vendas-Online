import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let userLogado = null;
let todosAnuncios = [];

document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form-anuncio");
const lista = document.getElementById("lista-anuncios");
const listaMeus = document.getElementById("lista-meus-anuncios");
const status = document.getElementById("status-login");

carregarAnuncios();

/* LOGIN STATUS */
onAuthStateChanged(auth, (user) => {
    userLogado = user;
    status.innerText = user ? "Logado: " + user.email : "Você não está logado";
});

/* AUTH */window.cadastrar = async (email, senha) => {
  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Cadastro realizado com sucesso!");
  } catch (erro) {
    alert("ERRO: " + erro.message);
    console.error(erro);
  }
};

window.entrar = async (email, senha) => {
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado com sucesso!");
  } catch (erro) {
    alert("ERRO: " + erro.message);
    console.error(erro);
  }
};

window.sair = async () => {
  await signOut(auth);
  alert("Saiu da conta");
};

/* UPLOAD */
async function uploadImagem(file){
const r = ref(storage,"anuncios/"+Date.now()+"_"+file.name);
await uploadBytes(r,file);
return await getDownloadURL(r);
}

/* CRIAR ANÚNCIO */
form.addEventListener("submit", async e=>{
e.preventDefault();

if(!userLogado) return alert("Faça login");

let foto = "";
const file = document.getElementById("foto").files[0];

if(file) foto = await uploadImagem(file);

await addDoc(collection(db,"anuncios"),{
nome:nome.value,
preco:preco.value,
cidade:cidade.value,
whatsapp:whatsapp.value,
descricao:descricao.value,
foto,
userId:userLogado.uid,
userEmail:userLogado.email,
criadoEm:Date.now()
});

form.reset();
location.reload();
});

/* CARREGAR */
async function carregarAnuncios(){
const snap = await getDocs(collection(db,"anuncios"));

lista.innerHTML="";
todosAnuncios=[];

snap.forEach(d=>{
const a = {id:d.id,...d.data()};
todosAnuncios.push(a);
render(a,lista);
});
}

/* FILTRO */
window.filtrarAnuncios = function(){

const nome = (buscaNome.value||"").toLowerCase();
const cidade = (buscaCidade.value||"").toLowerCase();

lista.innerHTML="";

todosAnuncios
.filter(a =>
(!nome || a.nome.toLowerCase().includes(nome)) &&
(!cidade || a.cidade.toLowerCase().includes(cidade))
)
.forEach(a=>render(a,lista));
};

/* MEUS ANÚNCIOS */
window.carregarMeusAnuncios = async function(){

const snap = await getDocs(collection(db,"anuncios"));

listaMeus.innerHTML="";

snap.forEach(d=>{
const a = {id:d.id,...d.data()};
if(a.userId===userLogado?.uid){
render(a,listaMeus,true);
}
});
};

/* RENDER */
function render(a,container,meus=false){

const div = document.createElement("div");
div.className="produto";

const num=(a.whatsapp||"").replace(/\D/g,"");

div.innerHTML=`
${a.foto?`<img src="${a.foto}" style="width:100%;max-height:200px;object-fit:cover;border-radius:10px">`:``}
<h3>${a.nome}</h3>
<p>${a.descricao||""}</p>
<p>📍 ${a.cidade}</p>
<p><b>R$ ${a.preco}</b></p>

<a href="https://wa.me/${num}" target="_blank">WhatsApp</a>

<br><br>

${userLogado?.uid===a.userId?`
<button onclick="del('${a.id}')" style="background:red;color:#fff;padding:5px">Excluir</button>
`:``}
`;

container.appendChild(div);
}

/* DELETE */
window.del = async id=>{
await deleteDoc(doc(db,"anuncios",id));
location.reload();
};

});
