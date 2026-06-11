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
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBMRk9KMLlRTvczALZFz4-PNJiU1zd3ARM",
  authDomain: "my-a-b995c.firebaseapp.com",
  projectId: "my-a-b995c",
  storageBucket: "my-a-b995c.firebasestorage.app",
  messagingSenderId: "143424113510",
  appId: "1:143424113510:web:68e912516830d48f0cd6a7"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userLogado = null;
let todosAnuncios = [];

/* ================= LOGIN ================= */

window.entrar = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    alert("Login realizado!");
  } catch (e) {
    alert(e.message);
  }
};

window.cadastrar = async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada!");
  } catch (e) {
    alert(e.message);
  }
};

window.sair = async () => {
  await signOut(auth);
};

/* ================= AUTH STATE ================= */

onAuthStateChanged(auth, (user) => {
  userLogado = user;

  const appEl = document.getElementById("app");
  const login = document.getElementById("login");
  const capa = document.getElementById("capa");
  const perfil = document.getElementById("perfil-usuario");

  if (user) {
    appEl.style.display = "block";
    login.style.display = "none";
    capa.style.display = "none";
    if (perfil) perfil.style.display = "block";

    irPara("anuncios");

    carregarAnuncios();
  } else {
    appEl.style.display = "none";
    login.style.display = "block";
    capa.style.display = "block";
    if (perfil) perfil.style.display = "none";
  }
});

/* ================= NAVEGAÇÃO ================= */
window.irPara = (id) => {

  const app = document.getElementById("app");

  // esconde só dentro do app
  app.querySelectorAll("section").forEach(secao => {
    secao.style.display = "none";
  });

  // mostra a seção escolhida
  const alvo = document.getElementById(id);
  if (alvo) {
    alvo.style.display = "block";
  }
};

/* ================= ANÚNCIOS ================= */

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

function renderAnuncios(listaFinal) {
  const lista = document.getElementById("lista-anuncios");
  lista.innerHTML = "";

  listaFinal.forEach(a => {

    const div = document.createElement("div");
    div.className = "produto";

    const num = (a.whatsapp || "").replace(/\D/g, "");

    div.innerHTML = `
      ${a.foto ? `<img src="${a.foto}" style="width:100%">` : ""}

      <h3>${a.nome}</h3>
      <p>📍 ${a.cidade}</p>
      <p><strong>R$ ${a.preco}</strong></p>

      <a href="https://wa.me/${num}" target="_blank">
        📱 WhatsApp
      </a>

      <br><br>

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

/* ================= FILTRO ================= */

window.filtrarAnuncios = function () {

  const nome = (document.getElementById("buscaNome").value || "").toLowerCase();
  const cidade = (document.getElementById("buscaCidade").value || "").toLowerCase();
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

/* ================= CRIAR ANÚNCIO ================= */

document.getElementById("form-anuncio").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!userLogado) return alert("Faça login");

  await addDoc(collection(db, "anuncios"), {
    nome: document.getElementById("nome").value,
    preco: document.getElementById("preco").value,
    cidade: document.getElementById("cidade").value,
    whatsapp: document.getElementById("whatsapp").value,
    descricao: document.getElementById("descricao").value,
    userId: userLogado.uid
  });

  e.target.reset();
  carregarAnuncios();
});

/* ================= FAVORITOS ================= */

window.favoritar = async (id) => {
  await addDoc(collection(db, "favoritos"), {
    userId: userLogado.uid,
    anuncioId: id
  });

  alert("Favoritado!");
};

/* ================= EXCLUIR ================= */

window.excluir = async (id) => {
  await deleteDoc(doc(db, "anuncios", id));
  carregarAnuncios();
};

/* ================= EDITAR ================= */

window.editar = async (id, n, p, c, w, d) => {

  const nn = prompt("Nome", n);
  const np = prompt("Preço", p);
  const nc = prompt("Cidade", c);
  const nw = prompt("WhatsApp", w);
  const nd = prompt("Descrição", d);

  await updateDoc(doc(db, "anuncios", id), {
    nome: nn,
    preco: np,
    cidade: nc,
    whatsapp: nw,
    descricao: nd
  });

  carregarAnuncios();
};
