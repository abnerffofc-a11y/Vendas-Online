import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* 🔥 COLE AQUI SUA CONFIG DO FIREBASE */
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

document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form-anuncio");
const container = document.getElementById("lista-anuncios");

carregarAnuncios();

/* =========================
   CRIAR ANÚNCIO
========================= */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const file = document.getElementById("foto").files[0];

    const criar = async (fotoFinal) => {

        const anuncio = {
            nome: document.getElementById("nome").value,
            preco: document.getElementById("preco").value,
            cidade: document.getElementById("cidade").value,
            whatsapp: document.getElementById("whatsapp").value,
            descricao: document.getElementById("descricao").value,
            foto: fotoFinal || "",
            criadoEm: Date.now()
        };

        await salvarAnuncio(anuncio);

        form.reset();
        location.reload();
    };

    if (file) {
        const reader = new FileReader();

        reader.onload = function () {
            criar(reader.result);
        };

        reader.readAsDataURL(file);
    } else {
        criar("");
    }
});

/* =========================
   SALVAR NO FIREBASE
========================= */
async function salvarAnuncio(anuncio) {
    await addDoc(collection(db, "anuncios"), anuncio);
}

/* =========================
   CARREGAR ANÚNCIOS
========================= */
async function carregarAnuncios() {
    const querySnapshot = await getDocs(collection(db, "anuncios"));

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

        <a href="https://wa.me/${numero}" target="_blank">
            WhatsApp
        </a>

        <br><br>

        <button onclick="excluirAnuncio('${anuncio.id}')" style="
            background:red;
            color:white;
            border:none;
            padding:5px 10px;
            border-radius:5px;
            cursor:pointer;
        ">
            Excluir
        </button>
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
