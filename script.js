document.addEventListener("DOMContentLoaded", () => {

const form = document.querySelector("#anunciar form");
const anuncios = document.querySelector("#anuncios");

form.addEventListener("submit", function(e) {
e.preventDefault();

```
const nome = form.querySelector('input[type="text"]').value;
const preco = form.querySelector('input[type="number"]').value;
const cidade = form.querySelectorAll('input[type="text"]')[1].value;
const whatsapp = form.querySelector('input[type="tel"]').value;
const descricao = form.querySelector('textarea').value;

const novoAnuncio = document.createElement("div");
novoAnuncio.classList.add("produto");

novoAnuncio.innerHTML = `
    <h3>${nome}</h3>
    <p>${descricao}</p>
    <p>📍 ${cidade}</p>
    <p><strong>R$ ${preco}</strong></p>
    <a href="https://wa.me/${whatsapp}" target="_blank">
    WhatsApp
    </a>
`;

anuncios.appendChild(novoAnuncio);

form.reset();

alert("Anúncio publicado com sucesso!");
```

});

});
                      
