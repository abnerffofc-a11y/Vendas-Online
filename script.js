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

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
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
const storage = getStorage(app);

let userLogado = null;
let todosAnuncios = [];

/* NAVEGAÇÃO (ÚNICA - CORRETA) */
window.irPara = function (pagina) {

  const secoes = document.querySelectorAll("section");

  // 1. Esconde todas as seções
  secoes.forEach(secao => {
    secao.style.display = "none";
  });

  // 2. Mostra a seção escolhida
  const alvo = document.getElementById(pagina);
  if (alvo) {
    alvo.style.display = "block";
  }

  // 3. 🔥 SEMPRE mostrar login (NUNCA esconder)
  const login = document.getElementById("login");
  if (login) {
    login.style.display = "block";
  }

  // 4. Carregamentos específicos
  if (pagina === "anuncios") {
    carregarAnuncios();
  }

  if (pagina === "meus-anuncios") {
    carregarMeusAnuncios();
  }

  if (pagina === "favoritos") {
    carregarFavoritos();
  }
};

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("form-anuncio");
  const lista = document.getElementById("lista-anuncios");
  const listaMeus = document.getElementById("lista-meus-anuncios");

  carregarAnuncios();

document.getElementById("anuncios").style.display = "none";

const login = document.getElementById("login-section");
if (login) login.style.display = "block";

  /* LOGIN STATUS */
onAuthStateChanged(auth, (user) => {

  userLogado = user;

  status.innerText = user
    ? "Logado: " + user.email
    : "Você não está logado";

  const capa = document.getElementById("capa");
  const login = document.getElementById("login-section");
  const anuncios = document.getElementById("anuncios");
  const categorias = document.getElementById("categorias");

  if (user) {

    // 🔥 LOGADO
    if (capa) capa.style.display = "none";
    if (login) login.style.display = "none";
    if (anuncios) anuncios.style.display = "block";
    if (categorias) categorias.style.display = "block";

    carregarAnuncios();

  } else {

    // 🔥 DESLOGADO
    if (capa) capa.style.display = "block";
    if (login) login.style.display = "block";
    if (anuncios) anuncios.style.display = "none";
    if (categorias) categorias.style.display = "none";
  }
});

  /* AUTH */
  window.cadastrar = async (email, senha) => {
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert("Cadastro realizado!");
    } catch (e) {
      alert(e.message);
    }
  };

  window.entrar = async (email, senha) => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      alert("Login realizado!");
    } catch (e) {
      alert(e.message);
    }
  };

  window.sair = async () => {

  await signOut(auth);

  alert("Saiu da conta");

  // 🔥 VOLTA PARA ESTADO INICIAL
  const capa = document.getElementById("capa");
  const login = document.getElementById("login-section");
  const anuncios = document.getElementById("anuncios");

  if (capa) capa.style.display = "block";
  if (login) login.style.display = "block";
  if (anuncios) anuncios.style.display = "none";
};

  /* UPLOAD */
  async function uploadImagem(file) {
    const r = ref(storage, "anuncios/" + Date.now() + "_" + file.name);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  }

  /* CRIAR ANÚNCIO */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userLogado) return alert("Faça login");

    let foto = "";
    const file = document.getElementById("foto").files[0];

    if (file) foto = await uploadImagem(file);

    await addDoc(collection(db, "anuncios"), {
      nome: nome.value,
      categoria: categoria.value,
      preco: preco.value,
      cidade: cidade.value,
      whatsapp: whatsapp.value,
      descricao: descricao.value,
      foto,
      destaque: document.getElementById("destaque").checked,
      userId: userLogado.uid,
      userEmail: userLogado.email,
      criadoEm: Date.now()
    });

    form.reset();
    irPara("anuncios");
  });

});

/* CARREGAR */
async function carregarAnuncios() {

  const snap = await getDocs(collection(db, "anuncios"));

  todosAnuncios = [];

  snap.forEach(d => {
    todosAnuncios.push({ id: d.id, ...d.data() });
  });

  todosAnuncios.sort((a, b) =>
    (b.destaque - a.destaque) || (b.criadoEm - a.criadoEm)
  );

  const lista = document.getElementById("lista-anuncios");
  lista.innerHTML = "";

  todosAnuncios.forEach(a => render(a, lista));
}

/* FAVORITOS */
window.carregarFavoritos = async function () {

  const listaFavoritos = document.getElementById("lista-favoritos");

  listaFavoritos.innerHTML = "";

  if (!userLogado) return alert("Faça login");

  const q = query(
    collection(db, "favoritos"),
    where("userId", "==", userLogado.uid)
  );

  const favs = await getDocs(q);

  const ids = [];

  favs.forEach(f => ids.push(f.data().anuncioId));

  const anuncios = await getDocs(collection(db, "anuncios"));

  anuncios.forEach(d => {
    const a = { id: d.id, ...d.data() };
    if (ids.includes(a.id)) render(a, listaFavoritos);
  });
};

/* MEUS ANÚNCIOS */
window.carregarMeusAnuncios = async function () {

  const listaMeus = document.getElementById("lista-meus-anuncios");

  listaMeus.innerHTML = "";

  const snap = await getDocs(collection(db, "anuncios"));

  snap.forEach(d => {
    const a = { id: d.id, ...d.data() };
    if (a.userId === userLogado?.uid) {
      render(a, listaMeus, true);
    }
  });
};

/* DELETE */
window.del = async (id) => {
  await deleteDoc(doc(db, "anuncios", id));
  irPara("anuncios");
};

/* EDITAR */
window.editarAnuncio = async (id, nomeAtual, precoAtual, cidadeAtual, whatsappAtual, descricaoAtual) => {

  const novoNome = prompt("Nome:", nomeAtual);
  if (novoNome === null) return;

  const novoPreco = prompt("Preço:", precoAtual);
  if (novoPreco === null) return;

  const novaCidade = prompt("Cidade:", cidadeAtual);
  if (novaCidade === null) return;

  const novoWhatsapp = prompt("WhatsApp:", whatsappAtual);
  if (novoWhatsapp === null) return;

  const novaDescricao = prompt("Descrição:", descricaoAtual);

  try {
    await updateDoc(doc(db, "anuncios", id), {
      nome: novoNome,
      preco: novoPreco,
      cidade: novaCidade,
      whatsapp: novoWhatsapp,
      descricao: novaDescricao
    });

    alert("Anúncio atualizado com sucesso!");
    irPara("meus-anuncios");

  } catch (e) {
    alert("Erro ao editar: " + e.message);
    console.error(e);
  }
};

/* RENDER */
function render(a, container) {

  const div = document.createElement("div");
  div.className = "produto";

  // 🔥 LIMPA E NORMALIZA O WHATSAPP
  const num = (a.whatsapp || "").replace(/\D/g, "");
  const whatsappFinal = num.startsWith("55") ? num : "55" + num;

  div.innerHTML = `
    <h3>${a.nome}</h3>
    <p>${a.cidade}</p>
    <p>R$ ${a.preco}</p>

    <a 
      href="https://wa.me/${whatsappFinal}?text=${encodeURIComponent('Olá! Vi seu anúncio no A&A Marketplace e tenho interesse 😊')}"
      target="_blank"
      class="btn-whatsapp">
      📱 Chamar no WhatsApp
    </a>

    <br><br>

    <button onclick="editarAnuncio(
      '${a.id}',
      '${a.nome || ""}',
      '${a.preco || ""}',
      '${a.cidade || ""}',
      '${a.whatsapp || ""}',
      '${a.descricao || ""}'
    )">✏️ Editar</button>

    <button onclick="del('${a.id}')">🗑 Excluir</button>
  `;

  container.appendChild(div);
}
