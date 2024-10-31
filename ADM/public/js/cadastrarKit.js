document.addEventListener('DOMContentLoaded', function () {
    // Obtém o botão de fechamento do modal de adicionar livro
    const btnCloseAdicaoKit = document.getElementById('btn-closeAdicaoKit');

    //Obtém o botão que aciona o modal de adição principal
    const btnAdicionarPrincipal = document.getElementById('btnAdicionarPrincipal');

    // Evento para fechar o modal de adicionar livro e o modal principal
    btnCloseAdicaoKit.addEventListener('click', function () {
        console.log("Fechando o modal")
        const modalPrincipal = bootstrap.Modal.getInstance(document.getElementById('popupAdicionar'));
        if (modalPrincipal) {
            modalPrincipal.hide();
        }
    });

    // Evento para abrir o modal principal
    btnAdicionarPrincipal.addEventListener('click', function () {
        console.log("Abrindo o modal")
        console.log("Fechando o modal");
        const modalPrincipal = bootstrap.Modal.getInstance(document.getElementById('popupAdicionar'));
        if (modalPrincipal) {
            modalPrincipal.hide();
        }
    });

    //Cadastrando um kit novo
    //Aqui temos três eventos pois em cada um deles o campo da assinatura selecionada deve ser verificado para 
    //liberar os itens adicionais ou bloquea-los

    // Função para ajustar itens adicionais conforme o tipo de assinatura selecionada
    function ajustarItensAdicionais(assinaturaSelecionadaElement) {
        console.log("Ajustando os itens adicionais");
        let possuiItens = false;
        const textoSelecionado = assinaturaSelecionadaElement.options[assinaturaSelecionadaElement.selectedIndex].text; // Captura o texto da opção selecionada
        console.log("O option do select da assinatura tem o seguinte texto: ", textoSelecionado);

        // Separando o texto para pegar o genero e tipo_kit
        const [generoAssinatura, tipo_kit] = textoSelecionado.split(" "); // Ajuste conforme o texto do select
        console.log("Após separar o gênero do tipo de kit, o gênero é: " + generoAssinatura + " e o tipo_kit é: " + tipo_kit);

        // Seleciona os campos de itens adicionais
        const itensAdicionais1 = document.getElementById("itensAdicionaisSelecionadosKitNovo");
        const itensAdicionais2 = document.getElementById("itensAdicionaisSelecionadosKitNovo2");
        const mensagemItensAdicionais = document.getElementById("mensagemItensAdicionaisKitNovo");

        // Ajusta conforme o tipo de kit
        if (tipo_kit === "Básico") {
            console.log("Esse kit é básico, então desabilitaremos os itens adicionais");
            itensAdicionais1.disabled = true;
            itensAdicionais2.disabled = true;
            itensAdicionais1.style.display = "none";
            itensAdicionais2.style.display = "none";
            mensagemItensAdicionais.style.display = "block";
            possuiItens = false;
        } else if (tipo_kit === "Premium") {
            console.log("Esse kit é premium, então habilitaremos os dois itens adicionais");
            itensAdicionais1.disabled = false;
            itensAdicionais2.disabled = false;
            itensAdicionais1.style.display = "block";
            itensAdicionais2.style.display = "block";
            mensagemItensAdicionais.style.display = "none";
            possuiItens = true;
        }
        return possuiItens;
    }

    //Quando o modal abrir
    // Evento para quando o modal abrir
    const modal = document.getElementById("criarKitModal");

    modal.addEventListener("shown.bs.modal", function () {
        console.log("O modal abriu");
        const assinaturaSelecionadaElement = document.getElementById("assinaturaKitNovo");
        ajustarItensAdicionais(assinaturaSelecionadaElement);
    });

    //Quando o campo da assinatura for alterado
    // Evento para o campo assinatura que escuta alterações e chama a função de ajuste
    document.getElementById("assinaturaKitNovo").addEventListener("change", function () {
        ajustarItensAdicionais(this);
    });

    //Quando o usuário acionar o submit do formulário
    document.getElementById("form-cadastrar-kit").addEventListener("submit", async function (event) {
        console.log("Entrando no cadastro do kit");
        event.preventDefault();

        let valid = true;
        let validCampos = true;

        // Obtém os valores dos campos
        const mesReferencia = document.getElementById("mesReferenciaKitNovo").value.trim();
        const genero = document.getElementById("generoKitNovo").value.trim();
        const quantidade = document.getElementById("quantidadeKitNovo").value;
        const assinaturaSelecionadaElement = document.getElementById("assinaturaKitNovo");
        const assinaturaSelecionada = assinaturaSelecionadaElement.value;

        //Limpando qualquer erro anterior
        document.getElementById('mesReferenciaKitNovoErro').style.display = 'none';
        document.getElementById('generoKitNovoErro').style.display = 'none';
        document.getElementById('quantidadeKitNovoErro').style.display = 'none';

        // Chama a função de ajuste ao abrir o modal
        let possuiItens = ajustarItensAdicionais(document.getElementById("assinaturaKitNovo"));
        //const itensAdicionais1 = document.getElementById("itensAdicionaisSelecionadosKitNovo");
        //const itensAdicionais2 = document.getElementById("itensAdicionaisSelecionadosKitNovo2");
        //const mensagemItensAdicionais = document.getElementById("mensagemItensAdicionaisKitNovo");

        console.log("Obtivemos mesReferencia: " + mesReferencia + " genero: " + genero +
            " quantidade: " + quantidade + " e assinaturaSelecionada: " + assinaturaSelecionada);

        // Verificação de campos nulos e exibição de mensagens de erro
        if (!mesReferencia) {
            document.getElementById('mesReferenciaKitNovoErro').style.display = 'block';
            validCampos = false;
            valid = false;
        }
        if (!genero) {
            document.getElementById('generoKitNovoErro').style.display = 'block';
            validCampos = false;
            valid = false;
        }
        if (parseInt(quantidade) < 0 || !quantidade) {
            document.getElementById('quantidadeKitNovoErro').style.display = 'block';
            validCampos = false;
            valid = false;
        }


        // Conferência de kits do mesmo mês e assinatura via requisição backend
        try {
            const response = await fetch(`/kits?mesReferencia=${mesReferencia}&assinatura=${assinaturaSelecionada}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            //Se não houver nenhum kit do mesmo mes e assinatura ainda ele pode prosseguir
            if (response.status === 204) {
                console.log("Nenhum kit encontrado para esse mês e assinatura. Pode-se proceder com a verificação do livro.");
                valid = true; // Pode prosseguir com a verificação do livro

                // Conferência para verificar se o livro selecionado já está em outro kit de mês diferente
                const livroSelecionado = document.getElementById("livrosSelecionadosKitNovo").value;
                console.log("Enviando o livro para conferencia: " + livroSelecionado)
                try {
                    const response = await fetch(`/kits/verificar-livro?livroId=${livroSelecionado}&mesReferencia=${mesReferencia}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.status === 204) {
                        console.log("Esse livro não está em nenhum outro kit. Pode-se proceder com o cadastro do kit.");
                        valid = true; // Pode prosseguir com a verificação do livro
                        if(!validCampos){
                            console.log("Ainda falta preencher todos os campos corretamente.");
                            valid = false
                        }
                    } else if (response.ok) {
                        const kitMesAnterior = await response.json();
                        console.log("O que foi recebido no back pela rota /kits foi: " + JSON.stringify(kitMesAnterior, null, 2));
                        console.log("Esse livro já está cadastrado em um kit de mes anterior e não pode estar em outro kit de outro mes");
                        alert("Esse livro já está cadastrado em um kit de mes anterior e não pode estar em outro kit de outro mes.");
                        valid = false;
                    } else {
                        throw new Error("Erro ao buscar kits existentes."); // Lidar com outros erros
                    }
                } catch (error) {
                    console.error("Erro na verificação de livro em kits de outros meses:", error);
                    alert("Erro ao verificar duplicação de livros.");
                    valid = false;
                }
            } else if (response.ok) {
                const kitsExistentes = await response.json();
                console.log("O que foi recebido no back pela rota /kits foi: " + JSON.stringify(kitsExistentes, null, 2));
                console.log("Existe um kit já cadastrado nesse mes e com essa assinatura e caimos no else if do alerta");
                alert("Já existe um kit cadastrado para esse mês com essa assinatura.");
                valid = false;
            } else {
                throw new Error("Erro ao buscar kits existentes."); // Lidar com outros erros
            }
        } catch (error) {
            console.error("Erro na requisição ao backend:", error);
            alert("Erro na 1° ETAPA ao verificar se já existe um kit com esse mes e essa assinatura.");
            valid = false;
        }

        // Envia o formulário se todas as validações passarem
        if (valid) {
            document.getElementById("possuiItens").value = possuiItens;
            this.submit();
        }
    });
});