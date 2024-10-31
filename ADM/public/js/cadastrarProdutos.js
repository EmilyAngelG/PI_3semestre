document.addEventListener('DOMContentLoaded', function () {
    // Obtém o botão de fechamento do modal de adicionar livro
    const btnCloseAdicaoLivro = document.getElementById('btn-closeAdicaoLivro');
    const btnCloseAdicaoItem = document.getElementById('btn-closeAdicaoItem');

    //Obtém o botão que aciona o modal de adição principal
    const btnAdicionarPrincipal = document.getElementById('btnAdicionarPrincipal');

    // Evento para fechar o modal de adicionar livro e o modal principal
    btnCloseAdicaoLivro.addEventListener('click', function () {
        console.log("Fechando o modal");
        const modalPrincipal = bootstrap.Modal.getInstance(document.getElementById('popupAdicionar'));
        if (modalPrincipal) {
            modalPrincipal.hide();
        }
    });

    // Evento para fechar o modal de adicionar livro e o modal principal
    btnCloseAdicaoItem.addEventListener('click', function () {
        console.log("Fechando o modal");
        const modalPrincipal = bootstrap.Modal.getInstance(document.getElementById('popupAdicionar'));
        if (modalPrincipal) {
            modalPrincipal.hide();
        }
    });

    // Evento para abrir o modal principal
    btnAdicionarPrincipal.addEventListener('click', function () {
        console.log("Abrindo o modal")
        popupAdicionar.show(); // Usa o método do Bootstrap para mostrar o modal
    });

    document.getElementById("formAdicionarLivro").addEventListener("submit", async function (event) {
        event.preventDefault(); // Impede o envio inicial para permitir validações

        let valid = true;

        // Obtém os valores dos campos
        const titulo = document.getElementById("tituloLivroNovo").value.trim();
        const autor = document.getElementById("autorLivroNovo").value.trim();
        const genero = document.getElementById("generoLivroNovo").value.trim();
        const quantidade = document.getElementById("quantidadeLivroNovo").value;

        //Retirando qualquer mensagem de erro anterior
        document.getElementById('tituloLivroNovoErro').style.display = 'none';
        document.getElementById('autorLivroNovoErro').style.display = 'none';
        document.getElementById('generoLivroNovoErro').style.display = 'none';
        document.getElementById('quantidadeLivroNovoErro').style.display = 'none';

        // Verificação de campos nulos
        if (!titulo) {
            document.getElementById('tituloLivroNovoErro').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('tituloLivroNovoErro').style.display = 'none';
        }

        if (!autor) {
            document.getElementById('autorLivroNovoErro').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('autorLivroNovoErro').style.display = 'none';
        }

        if (!genero) {
            document.getElementById('generoLivroNovoErro').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('generoLivroNovoErro').style.display = 'none';
        }

        // Verificação da quantidade
        if (parseInt(quantidade) < 0 || !quantidade) {
            document.getElementById('quantidadeLivroNovoErro').style.display = 'block';
            valid = false; // Marca que o campo não é válido
        } else {
            document.getElementById('quantidadeLivroNovoErro').style.display = 'none';
        }


        // Solicitando a lista de livros existentes via requisição ao backend
        try {
            const response = await fetch("/livros", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar lista de livros.");

            const livrosExistentes = await response.json();

            // Verifica se a combinação de título e autor já existe
            const livroDuplicado = livrosExistentes.some(
                livro => livro.titulo === titulo && livro.autor === autor
            );

            if (livroDuplicado) {
                alert("Esse livro já está cadastrado.");
                valid = false;
            }
        } catch (error) {
            console.error("Erro na requisição ao backend:", error);
            alert("Não foi possível verificar a duplicação. Tente novamente.");
            valid = false;
        }

        // Envia o formulário se todas as validações passarem
        if (valid) {
            this.submit();
        }
    });



    //Cadastrando itens adicionais
    document.getElementById("formCadastrarItemAdicional").addEventListener("submit", async function (event) {
        event.preventDefault(); // Impede o envio inicial para permitir validações

        let valid = true;

        // Obtém os valores dos campos
        const nome = document.getElementById("nomeItemNovo").value.trim();
        const livroReferencia = document.getElementById("livroReferenciaItemNovo").value.trim();
        const quantidade = document.getElementById("quantidadeItemNovo").value;

        //Retirando qualquer mensagem de erro anterior
        document.getElementById('nomeItemNovoErro').style.display = 'none';
        document.getElementById('livroReferenciaItemNovoErro').style.display = 'none';
        document.getElementById('quantidadeItemNovoErro').style.display = 'none';

        // Verificação de campos nulos
        if (!nome) {
            document.getElementById('nomeItemNovoErro').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('nomeItemNovoErro').style.display = 'none';
        }

        if (!livroReferencia) {
            document.getElementById('livroReferenciaItemNovoErro').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('livroReferenciaItemNovoErro').style.display = 'none';
        }

        // Verificação da quantidade
        if (parseInt(quantidade) < 0 || !quantidade) {
            document.getElementById('quantidadeItemNovoErro').style.display = 'block';
            valid = false; // Marca que o campo não é válido
        } else {
            document.getElementById('quantidadeItemNovoErro').style.display = 'none';
        }


        // Solicitando a lista de itens existentes via requisição ao backend
        try {
            const response = await fetch("/itensAdicionais", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("Erro ao buscar lista de livros.");

            const itensExistentes = await response.json();

            // Verifica se a combinação de título e autor já existe
            const itemDuplicado = itensExistentes.some(
                item => item.nome === nome && item.titulo_referencia === livroReferencia
            );

            if (itemDuplicado) {
                alert("Esse item já está cadastrado.");
                valid = false;
            }
        } catch (error) {
            console.error("Erro na requisição ao backend:", error);
            alert("Não foi possível verificar a duplicação. Tente novamente.");
            valid = false;
        }

        // Envia o formulário se todas as validações passarem
        if (valid) {
            this.submit();
        }
    });






});