/* ==========================================
   MENU PRINCIPAL
========================================== */

const painel = document.getElementById("painelPrincipal");
const abrirPainel = document.getElementById("menuToggle");
const fecharPainel = document.getElementById("fecharPainel");
const overlay = document.querySelector(".painel-overlay");

function abrirMenuPrincipal(){

    painel.classList.add("ativo");

}

function fecharMenuPrincipal(){

    painel.classList.remove("ativo");

}

if(abrirPainel){

    abrirPainel.addEventListener("click", abrirMenuPrincipal);

}

if(fecharPainel){

    fecharPainel.addEventListener("click", fecharMenuPrincipal);

}

if(overlay){

    overlay.addEventListener("click", fecharMenuPrincipal);

}
