const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser'); // Para processar o corpo da requisição
const { Usuario, Assinatura } = require('./models/post'); // Importa os modelos de Usuario e Assinatura
const { conectar } = require('./models/banco'); // Importa a função de conexão com o banco

// Conectar ao MongoDB
conectar();

// Configurar middleware
app.use(express.static('./'));
app.use(bodyParser.urlencoded({ extended: true })); // Para processar dados de formulários
app.use(bodyParser.json()); // Para processar JSON

app.use(session({
    secret: 'seu_segredo_aqui', // Troque por uma chave secreta
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000 } // 5 minutos de inatividade
}));

// Middleware para verificar a expiração da sessão
app.use((req, res, next) => {
    if (req.session.usuarioLogado && req.session.cookie.expires < Date.now()) {
        req.session.sessaoExpirada = true; // Define como expirada
        req.session.usuarioLogado = false; // Usuário não está mais logado
        return res.redirect('/login');
    }
    next();
});

// Middleware para verificar login
function verificarLogin(req, res, next) {
    if (req.session.usuarioLogado) {
        next();
    } else {
        res.redirect('/');
    }
}


// Rota para manter a sessão ativa
app.get('/keep-alive', (req, res) => {
    // Apenas responde para manter a sessão ativa
    if (req.session.usuarioLogado) {
        req.session.touch(); // Atualiza a data de expiração da sessão
        return res.sendStatus(200); // Retorna um status de sucesso
    }
    return res.sendStatus(401); // Se não estiver logado, retorna não autorizado
});



const handlebars = require("express-handlebars").engine;
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROTAS
app.listen("8081", function () {
    console.log("Servidor Ativo!");
})

app.get("/", function (req, res) {
    const usuarioLogado = !!req.session.usuario; // Verifica se o usuário está logado (true ou false)
    if (req.session.usuario) {
        res.render('index', { usuario: req.session.usuario, usuarioLogado});
    } else {
        res.render('index', { usuario: null, usuarioLogado });
    }
})

app.get("/cadastro", function (req, res) {
    res.render("cadastro")
})


// Rota para cadastrar usuário
app.post("/cadastro", async (req, res) => {
    console.log("Requisição recebida para cadastro:", req.body);
    const { email, senha, nome, cpf, telefone, rua, numero, bairro, cidade, estado, cep } = req.body;

    // Verificar se já existe um usuário com o mesmo CPF antes de criar um novo
    const cpfExistente = await Usuario.findOne({ cpf });
    const emailExistente = await Usuario.findOne({ email });
    if (cpfExistente || emailExistente) {
        console.error("Usuário já cadastrado:");
        return res.status(400).send("Usuário já cadastrado."); // Retorna a mensagem de erro
    } else {

        // Criar um novo usuário se o CPF não existir
        const novoUsuario = new Usuario({
            id: `usuario${Date.now()}`, // Gera um ID único (pode ser ajustado)
            tipo: 'cliente', // Define o tipo como cliente
            nome,
            cpf,
            contato: telefone, // O campo contato é preenchido com o telefone
            email,
            senha,
            endereco: {
                rua,
                numero,
                bairro,
                cidade,
                estado,
                cep
            },
            assinatura_id: null, // Este campo pode ser preenchido mais tarde
            status_financeiro: 'inativo', // Defina como inativo por padrão
            status_plano: 'inativo' // Defina como inativo por padrão
        });

        try {
            await novoUsuario.save();
            res.status(200).send(); // Envia resposta de sucesso
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            res.status(500).send("Erro ao cadastrar usuário.");
        }
    }
});



// Rotas para login do usuário

//Rota post para Login
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    // Verifica se o usuário existe
    const usuario = await Usuario.findOne({ email });

    //Usuário não encontrado
    if (!usuario) {
        return res.status(401).send("Email não encontrado.");
    }

    // Usuário encontrado mas senha incorreta
    if (usuario.senha !== senha) {
        return res.status(401).send("Senha incorreta.");
    }

    // Login bem-sucedido
    req.session.usuarioLogado = true; // Marca a sessão como logada

    // Buscando assinatura do usuário
    const assinatura = await Assinatura.findOne({ id: usuario.assinatura_id });

    if (assinatura) {
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo,
            contato: usuario.contato,
            email: usuario.email,
            senha: usuario.senha,
            endereco: usuario.endereco,
            statusFinanceiro: usuario.status_financeiro,
            statusPlano: usuario.status_plano,
            dadosAssinatura: {
                genero: assinatura.genero,
                tipo_kit: assinatura.tipo_kit,
                qtd_adicionais: assinatura.qtd_adicionais,
                preco_assinatura: assinatura.preco_assinatura,
                status_assinatura: assinatura.status_assinatura
            }
        };
    } else {
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            cpf: usuario.cpf,
            telefone: usuario.telefone,
            tipo: usuario.tipo,
            contato: usuario.contato,
            email: usuario.email,
            senha: usuario.senha,
            endereco: usuario.endereco,
            statusFinanceiro: usuario.status_financeiro,
            statusPlano: usuario.status_plano,
            dadosAssinatura: null // Ou qualquer valor padrão caso não tenha assinatura
        };
    }

    res.redirect('/paginaUsuario');
});


// Rota get para Login
app.get('/login', (req, res) => {
    if (req.session.sessaoExpirada) {
        res.render('login', { mensagem: 'Sua sessão expirou. Faça login novamente.' });
        req.session.sessaoExpirada = false; // Reseta o status da sessão expirada
    } else {
        res.render('login'); // Renderiza a página de login se não estiver expirado
    }
});

// Rota para a página do usuário (com proteção de login)
app.get('/paginaUsuario', (req, res) => {
    if (req.session.sessaoExpirada) {
        // Se a sessão expirou, redireciona para a página index com mensagem
        req.session.sessaoExpirada = false; // Reseta o status da sessão expirada
        console.error('Sua sessão expirou. Faça login novamente.' );
        return res.render('index', { usuario: null });
    }
    if (!req.session.usuario) {
        // Se não existe sessão, redireciona para a página index com mensagem
        console.error('Faça login para acessar a página do usuário.' );
        return res.render('index', { usuario: null });
    } else {
        // Se a sessão não expirou, renderiza a página do usuário
        console.error('Login realizado com sucesso' );
        return res.render('paginaUsuario', { usuario: req.session.usuario });
    }
});




app.post('/atualizarUsuario', (req, res) => {
    // Exibe os dados enviados pelo formulário no console
    console.log('Dados recebidos:', req.body);

    // Pega os dados atualizados do corpo da requisição (formulário)
    const { email, senha, nome, cpf, contato, rua, numero, bairro, cidade, estado, cep } = req.body;

    // Cria o objeto endereço completo
    const endereco = {
        rua: req.body['endereco.rua'],
        numero: req.body['endereco.numero'],
        bairro: req.body['endereco.bairro'],
        cidade: req.body['endereco.cidade'],
        estado: req.body['endereco.estado'],
        cep: req.body['endereco.cep']
    };
      

    // Atualiza no banco de dados
    Usuario.updateOne(
        { id: req.session.usuario.id }, // Pega o ID do usuário na sessão
        {
            email,
            senha,
            nome,
            cpf,
            contato,
            endereco, // Atualiza o endereço completo
        }
    )
    .then((result) => {
        // Exibe o resultado da operação de atualização
        console.log('ID do usuário na sessão:', req.session.usuario.id);
        console.log('Resultado da atualização:', result);
    
        // Atualiza os dados da sessão do usuário com os novos dados
        req.session.usuario = {
            ...req.session.usuario,
            email,
            senha,
            nome,
            cpf,
            contato,
            endereco,
        };
        res.redirect('/paginaUsuario');
    })
    .catch(err => {
        console.error(err);
        res.status(500).send('Erro ao atualizar os dados do usuário.');
    });
});

app.post('/excluirUsuario', (req, res) => {
    const usuarioId = req.body.usuarioId;

    // Exclui o usuário do banco de dados
    Usuario.deleteOne({ id: usuarioId })
    .then(() => {
        req.session.destroy(); // Destroi a sessão do usuário após a exclusão
        res.status(200).send('Usuário excluído com sucesso.');
    })
    .catch(err => {
        console.error('Erro ao excluir o usuário:', err);
        res.status(500).send('Erro ao excluir o usuário.');
    });
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); // Redireciona para a página inicial em caso de erro
        }
        res.redirect('/'); // Redireciona para a página inicial após logout
    });
});