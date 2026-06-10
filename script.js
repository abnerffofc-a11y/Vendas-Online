import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

/* FIRESTORE */
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* AUTH */
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/* STORAGE */
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

/* 🔥 CONFIG FIREBASE */
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

/* =========================
   ELEMENTOS
========================= */
document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form-anuncio");
const container = document.getElementById("lista-anuncios");
const statusLogin = document.getElementById("status-login");

carregarAnuncios();

/* =========================
   LOGIN STATE
========================= */
onAuthStateChanged(auth, (user) => {
    userLogado = user;

    if (user) {
        statusLogin.innerText = "Logado como: " + user.email;
    } else {
        statusLogin.innerText = "Você não está logado";
    }
});

/* =========================
   AUTH FUNCTIONS
========================= */
window.cadastrar = function (email, senha) {
    createUserWithEmailAndPassword(auth, email, senha)
        .then(() => alert("Conta criada!"))
        .catch((e) => alert(e.message));
};

window.entrar = function (email, senha) {
    signInWithEmailAndPassword(auth, email, senha)
        .then(() => alert("Login realizado!"))
        .catch((e) => alert(e.message));
};

window.sair = function () {
    signOut(auth);
};

/* =========================
   UPLOAD IMAGEM STORAGE
========================= */
async function uploadImagem(file) {
    const imageRef = ref(storage, "anuncios/" + Date.now() + "_" + file.name);

    await uploadBytes(imageRef, file);

    const url = await getDownloadURL(imageRef);

    return url;
}

/* =========================
   CRIAR ANÚNCIO
========================= */
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!userLogado) {
        alert("Você precisa estar logado para anunciar!");
        return;
    }

    const file = document.getElementById("foto").files[0];

    let fotoURL = "";

    if (file) {
        fotoURL = await uploadImagem(file);
    }

    const anuncio = {
        nome: document.getElementById("nome").value,
        preco: document.getElementById("preco").value,
        cidade: document.getElementById("cidade").value,
        whatsapp: document.getElementById("whatsapp").value,
        descricao: document.getElementById("descricao").value,
        foto: fotoURL,
        criadoEm: Date.now(),
        userId: userLogado.uid,
        userEmail: userLogado.email
    };

    await addDoc(collection(db, "anuncios"), anuncio);

    form.reset();
    location.reload();
});

/* =========================
   CARREGAR ANÚNCIOS
========================= */
async function carregarAnuncios() {
    const querySnapshot = await getDocs(collection(db, "anuncios"));

    container.innerHTML = "";

    querySnapshot.forEach((docItem) => {
        adicionarNaTela({
            id: docItem.id,
            ...docItem.data()
        });
    });
}

/* =========================
   MOSTRAR NA TELA
========================= */
function adicionarNaTela(anuncio) {

    const card = document.createElement("div");
    card.className = "produto";

    const numero = (anuncio.whatsapp || "").replace(/\D/g, "");

    card.innerHTML = `
        ${anuncio.foto ? `
            <img src="${anuncio.foto}" 
            style="width:100%;max-height:250px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
        ` : ""}

        <h3>${anuncio.nome}</h3>
        <p>${anuncio.descricao || ""}</p>
        <p>📍 ${anuncio.cidade}</p>
        <p><strong>R$ ${anuncio.preco}</strong></p>

        <small>👤 ${anuncio.userEmail || "Anônimo"}</small>

        <br><br>

        <a href="https://wa.me/${numero}" target="_blank">
            WhatsApp
        </a>

        <br><br>

        ${
            userLogado && userLogado.uid === anuncio.userId
            ? `<button onclick="excluirAnuncio('${anuncio.id}')" style="
                background:red;
                color:white;
                border:none;
                padding:5px 10px;
                border-radius:5px;
                cursor:pointer;
            ">
                Excluir
            </button>`
            : ""
        }
    `;

    container.appendChild(card);
}

/* =========================
   EXCLUIR ANÚNCIO
========================= */
window.excluirAnuncio = async function (id) {
    await deleteDoc(doc(db, "anuncios", id));
    location.reload();
};

});
