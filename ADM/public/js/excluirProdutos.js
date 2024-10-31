document.addEventListener('DOMContentLoaded', function () {

    const btnExcluirLivro = document.getElementById('btnExcluirLivro');
    if (btnExcluirLivro) {
        console.log("Encontrado");
    } else {
        console.log("Não encontrado");
    }
    btnExcluirLivro.onclick = function (event) {
        const tituloLivro = document.getElementById('tituloLivro').value;
        const autorLivro = document.getElementById('autorLivro').value;
        const formEdicaoLivros = document.getElementById('form-editar-livros');
        formEdicaoLivros.action = `/excluir-livro?tituloLivro=${tituloLivro}&autorLivro=${autorLivro}`;
    }

    const btnExcluirItem = document.getElementById('btnExcluirItem');
    btnExcluirItem.onclick = function (event) {
        console.log('Aqui estamos')
        const nomeItem = document.getElementById('nomeItem').value;
        const referenciaItem = document.getElementById('referenciaItem').value;
        const formEdicaoItem = document.getElementById('form-editar-itens');
        formEdicaoItem.action = `/excluir-item?nomeItem=${nomeItem}&referenciaItem=${referenciaItem}`;
    }

    const btnExcluirKit = document.getElementById('btnExcluirKit');
    btnExcluirKit.onclick = function (event) {
        // Definir a rota com o ID para o formulário
        const mesReferencia = document.getElementById('mesReferenciaKit').value;
        const assinaturaKit = document.getElementById('assinaturaKit').value;
        const formEdicaoKit = document.getElementById('form-editar-kits');
        formEdicaoKit.action = `/excluir-kit?mesReferencia=${mesReferencia}&assinaturaKit=${assinaturaKit}`;
    }
});