document.addEventListener('DOMContentLoaded', function () {

    // Função para preencher e abrir o modal de edição de Livros
    document.querySelectorAll('.linha-produto-livros').forEach(function (row) {
        row.addEventListener('dblclick', function () {
            const livroId = row.getAttribute('produto-id');
            const titulo = row.cells[0].innerText;
            const genero = row.cells[1].innerText;
            const autor = row.cells[2].innerText;
            const quantidade = row.cells[3].innerText;

            document.getElementById('tituloLivro').value = titulo;
            document.getElementById('autorLivro').value = autor;
            document.getElementById('generoLivro').value = genero;
            document.getElementById('quantidadeLivro').value = quantidade;

            //Retirando qualquer mensagem de erro anterior
            document.getElementById('tituloErro').style.display = 'none';
            document.getElementById('autorErro').style.display = 'none';
            document.getElementById('generoErro').style.display = 'none';
            document.getElementById('quantidadeErro').style.display = 'none';

            const modalLivros = new bootstrap.Modal(document.getElementById('popupEdicaoLivros'));
            modalLivros.show();



            // Adicionar um evento de submit para o botão de atualizar
            const btnAtualizar = document.getElementById('btnAtualizarLivro');
            btnAtualizar.onclick = function (event) {
                // Definir a rota com o ID para o formulário
                const formEdicaoLivros = document.getElementById('form-editar-livros');
                formEdicaoLivros.action = `/atualizar-livro/${livroId}`;

                // Flag para verificar se os campos são válidos
                let valid = true;

                // Obter os valores dos campos
                const titulo = document.getElementById('tituloLivro').value;
                const autor = document.getElementById('autorLivro').value;
                const genero = document.getElementById('generoLivro').value;
                const quantidade = document.getElementById('quantidadeLivro').value;

                // Verificação de campos nulos
                if (!titulo) {
                    document.getElementById('tituloErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('tituloErro').style.display = 'none';
                }

                if (!autor) {
                    document.getElementById('autorErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('autorErro').style.display = 'none';
                }

                if (!genero) {
                    document.getElementById('generoErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('generoErro').style.display = 'none';
                }

                // Verificação da quantidade
                if (parseInt(quantidade) < 0 || document.getElementById('quantidadeLivro').value == "") {
                    document.getElementById('quantidadeErro').style.display = 'block';
                    valid = false; // Marca que o campo não é válido
                } else {
                    document.getElementById('quantidadeErro').style.display = 'none';
                }

                // Se algum campo não for válido, impede o envio do formulário
                if (!valid) {
                    event.preventDefault();
                }
            };

            
        });
    });


    // Função para preencher e abrir o modal de edição de Itens Adicionais
    document.querySelectorAll('.linha-produto-itens').forEach(function (row) {
        row.addEventListener('dblclick', function () {
            const itemId = row.getAttribute('produto-id');
            const nome = row.cells[0].innerText;
            const referencia = row.cells[1].innerText;
            const quantidade = row.cells[2].innerText;

            document.getElementById('nomeItem').value = nome;
            document.getElementById('referenciaItem').value = referencia;
            document.getElementById('quantidadeItem').value = quantidade;

            //Retirando qualquer mensagem de erro anterior
            document.getElementById('nomeErro').style.display = 'none';
            document.getElementById('referenciaErro').style.display = 'none';
            document.getElementById('quantidadeItemErro').style.display = 'none';

            const modalItens = new bootstrap.Modal(document.getElementById('popupEdicaoItens'));
            modalItens.show();

            // Definir a rota com o ID para o formulário
            const formEdicaoItens = document.getElementById('form-editar-itens');
            formEdicaoItens.action = `/atualizar-item/${itemId}`;

            // Adicionar um evento de submit para o botão de atualizar
            const btnAtualizar = document.getElementById('btnAtualizarItem');
            btnAtualizar.onclick = function (event) {

                // Flag para verificar se os campos são válidos
                let valid = true;

                // Obter os valores dos campos
                const nome = document.getElementById('nomeItem').value;
                const referencia = document.getElementById('referenciaItem').value;
                const quantidade = document.getElementById('quantidadeItem').value;

                // Verificação de campos nulos
                if (!nome) {
                    document.getElementById('nomeErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('nomeErro').style.display = 'none';
                }

                if (!referencia) {
                    document.getElementById('referenciaErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('referenciaErro').style.display = 'none';
                }

                // Verificação da quantidade
                if (parseInt(quantidade) < 0 || document.getElementById('quantidadeItem').value == "") {
                    console.log("Quantidade invalida")
                    document.getElementById('quantidadeItemErro').style.display = 'block';
                    valid = false;
                } else {
                    document.getElementById('quantidadeItemErro').style.display = 'none';
                }

                // Se algum campo não for válido, impede o envio do formulário
                if (!valid) {
                    event.preventDefault();
                }
            };

            
        });
    });





    // Função para preencher e abrir o modal de edição de Kits
    //Antes de preencher o modal com os itens que compõe o kit temos uma função para ordena-los em ordem alfabética
    function organizarOpcoesSelect(selectElement, selecionados) {
        // Obter opções e classificá-las
        const options = Array.from(selectElement.options);

        // Dividir em selecionados e não selecionados
        let selecionadosOptions = options.filter(option => selecionados.includes(option.value));
        const naoSelecionadosOptions = options.filter(option => !selecionados.includes(option.value));

        // Colocar o primeiro item da lista selecionadosOptions no início
        if (selecionadosOptions.length > 0) {
            const [primeiroSelecionado, ...restantesSelecionados] = selecionadosOptions;
            selecionadosOptions = [primeiroSelecionado, ...restantesSelecionados];
        }

        // Ordenar os não selecionados em ordem alfabética
        naoSelecionadosOptions.sort((a, b) => a.text.localeCompare(b.text));

        // Reorganizar o elemento select com os selecionados primeiro
        selectElement.innerHTML = ""; // Limpa as opções atuais
        [...selecionadosOptions, ...naoSelecionadosOptions].forEach(option => {
            selectElement.appendChild(option); // Adiciona na nova ordem
        });
    }


    //Agora vamos ao modal
    document.querySelectorAll('.linha-produto-kits').forEach(function (row) {
        row.addEventListener('dblclick', async function () {
            const kitId = row.getAttribute('produto-id');
            const mes = row.cells[0].innerText;
            const genero = row.cells[1].innerText;
            const quantidade = row.cells[2].innerText;

            document.getElementById('mesReferenciaKit').value = mes;
            document.getElementById('generoKit').value = genero;
            document.getElementById('quantidadeKit').value = quantidade;

            //Retirando qualquer mensagem de erro anterior
            document.getElementById('qtdKitErro').style.display = 'none';

            // Limpar as seleções anteriores
            const livrosSelecionados = document.getElementById('livrosSelecionados');
            const itensAdicionaisSelecionados = document.getElementById('itensAdicionaisSelecionados');
            const itensAdicionaisSelecionados2 = document.getElementById('itensAdicionaisSelecionados2');
            const mensagemItensAdicionais = document.getElementById('mensagemItensAdicionais');

            Array.from(livrosSelecionados.options).forEach(option => option.selected = false);
            Array.from(itensAdicionaisSelecionados.options).forEach(option => option.selected = false);
            Array.from(itensAdicionaisSelecionados2.options).forEach(option => option.selected = false);

            // Fetch the kit details (livros e itens adicionais)
            try {
                const response = await fetch(`/kit/${kitId}`);
                const kitData = await response.json();

                document.getElementById('assinaturaKit').value = kitData.assinaturaKit.genero + " " + kitData.assinaturaKit.tipo_kit;

                // Inicializa os arrays para os IDs selecionados
                let primeiroItemSelecionado = [];
                let segundoItemSelecionado = [];

                // Mapear IDs dos livros e itens adicionais do kit
                const livrosIdsSelecionados = kitData.livros.map(livro => String(livro.id));
                
                const itensIdsSelecionados = kitData.itensAdicionais.map(item => String(item.id));
                // Verifica se o array não está vazio
                if (itensIdsSelecionados.length > 0) {
                    primeiroItemSelecionado = itensIdsSelecionados.slice(0, 1); // Pega o primeiro ID
                }

                if (itensIdsSelecionados.length > 1) {
                    segundoItemSelecionado = itensIdsSelecionados.slice(1, 2); // Pega o segundo ID
                }

                if (kitData.assinaturaKit.qtd_adicionais === 0) {
                    // Ocultar as listas de seleção
                    itensAdicionaisSelecionados.style.display = 'none';
                    itensAdicionaisSelecionados2.style.display = 'none';
                    // Mostrar a mensagem
                    mensagemItensAdicionais.style.display = 'block';

                } else {
                    // Ocultar as listas de seleção
                    itensAdicionaisSelecionados.style.display = 'block';
                    itensAdicionaisSelecionados2.style.display = 'block';
                    // Mostrar a mensagem
                    mensagemItensAdicionais.style.display = 'none';

                }
                // Selecionar livros
                kitData.livros.forEach(livro => {
                    const livroOption = Array.from(livrosSelecionados.options).find(option => option.value === livro.id);
                    if (livroOption) {
                        livroOption.selected = true;
                    }
                });
                organizarOpcoesSelect(livrosSelecionados, livrosIdsSelecionados);

                //Selecionar itens adicionais
                var i = 1;
                kitData.itensAdicionais.forEach(item => {
                    if (i === 1) {
                        const itemOption = Array.from(itensAdicionaisSelecionados.options).find(option => option.value === item.id);
                        console.log("Encontrado o item: ", item.nome + " i vale: ", i)
                        if (itemOption) {
                            itemOption.selected = true;
                        }
                        organizarOpcoesSelect(itensAdicionaisSelecionados, primeiroItemSelecionado);
                    } else if (i === 2) {
                        const itemOption2 = Array.from(itensAdicionaisSelecionados2.options).find(option => option.value === item.id);
                        console.log("Encontrado o item: ", item.nome + " i vale: ", i)
                        if (itemOption2) {
                            itemOption2.selected = true;
                        }
                        organizarOpcoesSelect(itensAdicionaisSelecionados2, segundoItemSelecionado);
                        i -= 2;
                    }
                    i++;
                });
                console.log("No fim i vale: ", i)



                // Mostrar o modal
                const modalKits = new bootstrap.Modal(document.getElementById('popupEdicaoKits'));
                modalKits.show();

            } catch (error) {
                console.error("Erro ao buscar dados do kit: ", error);
            }

            // Definir a rota com o ID para o formulário
            const formEdicaoKits = document.getElementById('form-editar-kits');
            formEdicaoKits.action = `/atualizar-kit/${kitId}`;

            // Adicionar um evento de submit para o botão de atualizar
            const btnAtualizar = document.getElementById('btnAtualizarKit');
            btnAtualizar.onclick = function (event) {
                // Impede o envio padrão do formulário
                event.preventDefault();

                // Flag para verificar se os campos são válidos
                let validacao = true;

                // Validar os campos
                if (document.getElementById('quantidadeKit').value < 0 || document.getElementById('quantidadeKit').value == "") {
                    document.getElementById('qtdKitErro').style.display = 'block';
                    validacao = false;
                } else {
                    document.getElementById('qtdKitErro').style.display = 'none';
                }

                if (validacao) {
                    // Se tudo estiver correto, enviar o formulário
                    formEdicaoKits.submit();
                }
            };
        });
    });

});