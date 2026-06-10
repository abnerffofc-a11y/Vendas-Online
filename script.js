import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
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
  apiKey: "AIzaSyBMRk9KMLlRTvczALZFz4-PNJiU1zd3ARM",
  authDomain: "my-a-b995c.firebaseapp.com",
  projectId: "my-a-b995c",
  storageBucket: "my-a-b995c.firebasestorage.app",
  messagingSenderId: "143424113510",
  appId: "1:143424113510:web:68e912516830d48f0cd6a7"
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
const listaFavoritos = document.getElementById("lista-favoritos");
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
categoria:categoria.value,
preco:preco.value,
cidade:cidade.value,
whatsapp:whatsapp.value,
descricao:descricao.value,
foto,

destaque: document.getElementById("destaque").checked,
  
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

lista.innerHTML = "";
todosAnuncios = [];

snap.forEach(d => {
    const a = {
        id: d.id,
        ...d.data()
    };

    todosAnuncios.push(a);
});

/* ⭐ Destaques primeiro */
todosAnuncios.sort((a,b) => {

    if(a.destaque && !b.destaque) return -1;

    if(!a.destaque && b.destaque) return 1;

    return b.criadoEm - a.criadoEm;

});

/* Renderizar */
todosAnuncios.forEach(a => {
    render(a, lista);
});

}

/* FILTRO */
window.filtrarAnuncios = function(){

const nome = (buscaNome.value || "").toLowerCase();
const cidade = (buscaCidade.value || "").toLowerCase();
const categoria = (buscaCategoria.value || "");

const precoMin = Number(precoMin.value) || 0;
const precoMax = Number(precoMax.value) || Infinity;

lista.innerHTML = "";

todosAnuncios
.filter(a =>

(!nome ||
a.nome.toLowerCase().includes(nome))

&&

(!cidade ||
a.cidade.toLowerCase().includes(cidade))

&&

(!categoria ||
a.categoria === categoria)

&&

(Number(a.preco) >= precoMin)

&&

(Number(a.preco) <= precoMax)

)
.forEach(a => render(a, lista));

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

${a.destaque ? `
<div class="badge-destaque">
⭐ ANÚNCIO EM DESTAQUE
</div>
` : ""}

<h3>${a.nome}</h3>

<p>📂 ${a.categoria || "Sem categoria"}</p>

<p>${a.descricao || ""}</p>

<p>📍 ${a.cidade}</p>

<p class="preco">
R$ ${a.preco}
</p>

<a
href="https://wa.me/${num}"
target="_blank"
class="btn-whatsapp">
📱 Chamar no WhatsApp
</a>

<br><br>

<button
class="btn-favorito"
onclick="favoritar('${a.id}')">
❤️ Favoritar
</button>

<br><br>

${userLogado?.uid===a.userId?`

<button
class="btn-editar"
onclick="editarAnuncio(
'${a.id}',
'${a.nome}',
'${a.preco}',
'${a.cidade}',
'${a.whatsapp}',
'${a.descricao || ""}'
)">
✏️ Editar
</button>

<button
class="btn-excluir"
onclick="del('${a.id}')">
🗑 Excluir
</button>

`:``}
`;

container.appendChild(div);
}

/* DELETE */
window.carregarFavoritos = async function(){

if(!userLogado){
alert("Faça login");
return;
}

listaFavoritos.innerHTML = "";

const favoritosRef = collection(db,"favoritos");

const q = query(
favoritosRef,
where("userId","==",userLogado.uid)
);

const favoritos = await getDocs(q);

const ids = [];

favoritos.forEach(f=>{
ids.push(f.data().anuncioId);
});

const anuncios = await getDocs(
collection(db,"anuncios")
);

anuncios.forEach(docItem=>{

const anuncio = {
id: docItem.id,
...docItem.data()
};

if(ids.includes(anuncio.id)){
render(anuncio, listaFavoritos);
}

});

};
  
window.del = async id=>{
await deleteDoc(doc(db,"anuncios",id));
location.reload();
};

  window.editarAnuncio = async (
id,
nomeAtual,
precoAtual,
cidadeAtual,
whatsappAtual,
descricaoAtual
) => {

const novoNome =
prompt("Nome do produto:", nomeAtual);

if(!novoNome) return;

const novoPreco =
prompt("Preço:", precoAtual);

const novaCidade =
prompt("Cidade:", cidadeAtual);

const novoWhatsapp =
prompt("WhatsApp:", whatsappAtual);

const novaDescricao =
prompt("Descrição:", descricaoAtual);

await updateDoc(
doc(db,"anuncios",id),
{
nome: novoNome,
preco: novoPreco,
cidade: novaCidade,
whatsapp: novoWhatsapp,
descricao: novaDescricao
}
);

alert("Anúncio atualizado!");

location.reload();

};
  
});
