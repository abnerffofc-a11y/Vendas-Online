document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form-anuncio");
const anuncios = document.getElementById("lista-anuncios");

carregarAnuncios();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const arquivo = document.getElementById("foto").files[0];

    const criarAnuncio = (fotoFinal) => {

        const anuncio = {
            id: Date.now(),
            nome: document.getElementById("nome").value,
            preco: document.getElementById("preco").value,
            cidade: document.getElementById("cidade").value,
            whatsapp: document.getElementById("whatsapp").value,
            descricao: document.getElementById("descricao").value,
            foto: fotoFinal || ""
        };

        salvarAnuncio(anuncio);
        adicionarAnuncioNaTela(anuncio);
        form.reset();
    };

    if (arquivo) {
        const leitor = new FileReader();

        leitor.onload = function () {
            criarAnuncio(leitor.result);
        };

        leitor.readAsDataURL(arquivo);

    } else {
        criarAnuncio("");
    }
});

function salvarAnuncio(anuncio) {
    let lista = JSON.parse(localStorage.getItem("anuncios")) || [];
    lista.push(anuncio);
    localStorage.setItem("anuncios", JSON.stringify(lista));
}

function carregarAnuncios() {
    let lista = JSON.parse(localStorage.getItem("anuncios")) || [];

    lista.forEach(anuncio => {
        adicionarAnuncioNaTela(anuncio);
    });
}

function adicionarAnuncioNaTela(anuncio) {

    const card = document.createElement("div");
    card.className = "produto";

    const numeroLimpo = (anuncio.whatsapp || "").replace(/\D/g, "");

    card.innerHTML = `
        ${anuncio.foto ? `
            <img src="${anuncio.foto}" 
            style="width:100%;max-height:250px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
        ` : ""}

        <h3>${anuncio.nome}</h3>
        <p>${anuncio.descricao || ""}</p>
        <p>📍 ${anuncio.cidade}</p>
        <p><strong>R$ ${anuncio.preco}</strong></p>

        <a href="https://wa.me/${numeroLimpo}" target="_blank">
            WhatsApp
        </a>

        <br><br>

        <button onclick="excluirAnuncio(${anuncio.id})" style="
            background:red;
            color:white;
            border:none;
            padding:5px 10px;
            border-radius:5px;
            cursor:pointer;
            margin-top:10px;
        ">
            Excluir
        </button>
    `;

    anuncios.appendChild(card);
}

window.excluirAnuncio = function (id) {
    let lista = JSON.parse(localStorage.getItem("anuncios")) || [];

    lista = lista.filter(anuncio => anuncio.id !== id);

    localStorage.setItem("anuncios", JSON.stringify(lista));

    location.reload();
};

});
