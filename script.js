import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged
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

/* UI CONTROL */
function mostrar(el){ el.classList.remove("hide"); }
function esconder(el){ el.classList.add("hide"); }

window.irPara = (pagina) => {

document.querySelectorAll("section").forEach(s => s.classList.add("hide"));

document.getElementById(pagina).classList.remove("hide");
};

/* AUTH */
window.cadastrar = (e,s) => createUserWithEmailAndPassword(auth,e,s);
window.entrar = (e,s) => signInWithEmailAndPassword(auth,e,s);
window.sair = () => signOut(auth);

/* LOGIN STATE */
onAuthStateChanged(auth,(user)=>{

userLogado = user;

const capa = document.getElementById("capa");
const login = document.getElementById("login-section");
const anuncios = document.getElementById("anuncios");

if(user){
esconder(capa);
esconder(login);
mostrar(anuncios);
carregarAnuncios();
}else{
mostrar(capa);
mostrar(login);
esconder(anuncios);
}
});

/* ANUNCIOS */
window.carregarAnuncios = async () => {

const snap = await getDocs(collection(db,"anuncios"));
const lista = document.getElementById("lista-anuncios");
lista.innerHTML="";

snap.forEach(d=>{
const a = d.data();

const num = (a.whatsapp||"").replace(/\D/g,"");
const w = num.startsWith("55")?num:"55"+num;

const div = document.createElement("div");
div.className="produto";

div.innerHTML=`
<h3>${a.nome}</h3>
<p>${a.cidade}</p>
<p>R$ ${a.preco}</p>

<a class="btn-whatsapp"
href="https://wa.me/${w}?text=${encodeURIComponent('Olá vi seu anúncio no A&A Marketplace')}"
target="_blank">
WhatsApp
</a>
`;

lista.appendChild(div);
});
};

/* CRIAR */
document.getElementById("form-anuncio").addEventListener("submit",async(e)=>{
e.preventDefault();

if(!userLogado) return alert("Login necessário");

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
