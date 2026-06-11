import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

/* FIREBASE */
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

let todosAnuncios = [];

/* LOGIN */
window.entrar = async () => {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  console.log("Tentando login...");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado com sucesso!");
  } catch (e) {
    console.error("ERRO LOGIN:", e);
    alert(e.message);
  }
};

window.cadastrar = async () => {

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada com sucesso!");
  } catch (e) {
    alert("Erro cadastro: " + e.message);
    console.error(e);
  }
};

window.sair = async () => {
  await signOut(auth);
  alert("Saiu da conta");
};

/* CONTROLE DE TELA (SIMPLES E ESTÁVEL) */
onAuthStateChanged(auth, (user) => {
  console.log("SCRIPT CARREGADO");

  userLogado = user;
});

  const app = document.getElementById("app");
  const login = document.getElementById("login");
  const capa = document.getElementById("capa");

  // PERFIL
  const perfil = document.getElementById("perfil-usuario");
  const emailEl = document.getElementById("user-email");
  const qtd = document.getElementById("qtd-anuncios");

  const nomePerfil = document.getElementById("nome-perfil");
  const fotoPerfil = document.getElementById("foto-perfil");
  const emailPerfil = document.getElementById("email-perfil");

  if (user) {

    // MOSTRA APP
    app.style.display = "block";
    login.style.display = "none";
    capa.style.display = "none";

    // MOSTRA PERFIL
    if (perfil) perfil.style.display = "block";
    if (emailEl) emailEl.innerText = user.email;
    if (emailPerfil) emailPerfil.innerText = user.email;

    // 🔥 BUSCAR PERFIL SALVO (SE EXISTIR)
    const snapUser = await getDocs(collection(db, "usuarios"));

    snapUser.forEach(doc => {
      if (doc.id === user.uid) {
        const data = doc.data();

        if (nomePerfil) nomePerfil.value = data.nome || "";
        if (fotoPerfil && data.foto) fotoPerfil.src = data.foto;
      }
    });

    // 🔥 CONTAR ANÚNCIOS DO USUÁRIO
    const snap = await getDocs(collection(db, "anuncios"));

    let total = 0;

    snap.forEach(doc => {
      if (doc.data().userId === user.uid) {
        total++;
      }
    });

    if (qtd) qtd.innerText = total;

  } else {

    // VOLTA TUDO
    app.style.display = "none";
    login.style.display = "block";
    capa.style.display = "block";

    // ESCONDE PERFIL
    if (perfil) perfil.style.display = "none";

    if (emailEl) emailEl.innerText = "";
    if (qtd) qtd.innerText = "0";
  }

});

/* NAVEGAÇÃO */
window.irPara = (id)=>{
document.querySelectorAll("section").forEach(s=>s.style.display="none");
document.getElementById(id).style.display="block";
};

/* CARREGAR ANÚNCIOS */
window.carregarAnuncios = async () => {

  const lista = document.getElementById("lista-anuncios");
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "anuncios"));

  todosAnuncios = [];

  snap.forEach(d => {
    todosAnuncios.push({ id: d.id, ...d.data() });
  });

  renderAnuncios(todosAnuncios);
};

window.filtrarAnuncios = function () {

  const nome = document.getElementById("buscaNome").value.toLowerCase();
  const cidade = document.getElementById("buscaCidade").value.toLowerCase();
  const categoria = document.getElementById("buscaCategoria").value;

  const min = Number(document.getElementById("precoMin").value) || 0;
  const max = Number(document.getElementById("precoMax").value) || Infinity;

  const filtrados = todosAnuncios.filter(a => {

    return (
      (!nome || a.nome.toLowerCase().includes(nome)) &&
      (!cidade || a.cidade.toLowerCase().includes(cidade)) &&
      (!categoria || a.categoria === categoria) &&
      (Number(a.preco) >= min) &&
      (Number(a.preco) <= max)
    );

  });

  renderAnuncios(filtrados);
};

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

function renderAnuncios(listaFinal) {

  const lista = document.getElementById("lista-anuncios");
  lista.innerHTML = "";

  listaFinal.forEach(a => {

    const div = document.createElement("div");
    div.className = "produto";

    const num = (a.whatsapp || "").replace(/\D/g,"");

    div.innerHTML = `
      ${a.foto ? `<img src="${a.foto}" style="width:100%">` : ""}

      <h3>${a.nome}</h3>
      <p>📍 ${a.cidade}</p>
      <p><strong>R$ ${a.preco}</strong></p>

      <a href="https://wa.me/${num}" target="_blank">
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
}
