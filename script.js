document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form-anuncio");
const anuncios = document.getElementById("anuncios");

carregarAnuncios();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const anuncio = {
        nome: document.getElementById("nome").value,
        preco: document.getElementById("preco").value,
        cidade: document.getElementById("cidade").value,
        whatsapp: document.getElementById("whatsapp").value,
        descricao: document.getElementById("descricao").value
    };

    salvarAnuncio(anuncio);
    adicionarAnuncioNaTela(anuncio);

    form.reset();
});

function salvarAnuncio(anuncio){
    let lista = JSON.parse(localStorage.getItem("anuncios")) || [];
    lista.push(anuncio);
    localStorage.setItem("anuncios", JSON.stringify(lista));
}

function carregarAnuncios(){
    let lista = JSON.parse(localStorage.getItem("anuncios")) || [];

    lista.forEach(anuncio => {
        adicionarAnuncioNaTela(anuncio);
    });
}

function adicionarAnuncioNaTela(anuncio){

    const card = document.createElement("div");
    card.className = "produto";

    card.innerHTML = `
        <h3>${anuncio.nome}</h3>
        <p>${anuncio.descricao}</p>
        <p>📍 ${anuncio.cidade}</p>
        <p><strong>R$ ${anuncio.preco}</strong></p>
        <a href="https://wa.me/${anuncio.whatsapp}" target="_blank">
        WhatsApp
        </a>
    `;

    anuncios.appendChild(card);
}

});
