const express = require('express');
const app = express();
const path = require('path');
const { Produto, Usuario, Assinatura } = require('./models/post'); // Modelo de Produto
const { conectar } = require('./models/banco'); // Importa a função de conexão com o banco


// Middleware para processar dados JSON
app.use(express.json());
// Configurando o diretório público
app.use('/public', express.static(path.join(__dirname, 'public')));
// Middleware para processar dados enviados por formulários HTML
app.use(express.urlencoded({ extended: true }));


// Conectar ao MongoDB
conectar();


//Renderização
const handlebars = require("express-handlebars").engine;
app.engine("handlebars", handlebars({
  defaultLayout: "main",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
}));
app.set("view engine", "handlebars");
app.use(express.json());


// ROTA LISTEN
app.listen("8081", function () {
  console.log("Servidor Ativo!");
})

const session = require('express-session');

app.use(session({
    secret: 'sua-chave-secreta', // Altere para uma chave secreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));


// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
  if (req.session.autenticado) {
      return next();
  } else {
      return res.redirect('/');
  }
}



//Rotas de LOGIN e VALIDAÇÃO DA SEÇÃO DO USUÁRIO
app.get("/", function (req, res) {
  res.render("login")
})




//Rota post para Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  // Verifica se o usuário existe
  const usuario = await Usuario.findOne({ email });

  //Usuário não encontrado
  if (!usuario) {
    return res.status(401).send("Email não encontrado");
  }

  // Usuário encontrado mas senha incorreta
  if (usuario.senha !== senha) {
    return res.status(401).send("Senha incorreta");
  }

  //Login e senha encontrados
  // Verificando o tipo de usuário
  const tipo = usuario.tipo;

  if (tipo == "administrador") {
    req.session.autenticado = true; // Define a sessão como autenticada
    res.redirect('/produtos');
  } else {
    return res.status(401).send("Acesso permitido apenas para administradores do sistema");
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.redirect('/produtos'); // Redireciona para a página inicial em caso de erro
      }
      res.redirect('/'); // Redireciona para a página inicial após logout
  });
});


// Rota para exibir produtos
app.get('/produtos', verificarAutenticacao, async (req, res) => {
  try {
    const livros = await Produto.find({ tipo: 'livro' }).lean();
    const itensAdicionais = await Produto.find({ tipo: 'item_adicional' }).lean();
    const assinaturas = await Assinatura.find({});
    const kits = await Produto.find({ tipo: 'kit' }).lean();
    res.render('produtos', { livros, itensAdicionais, assinaturas, kits });
  } catch (error) {
    console.error("Erro ao carregar os produtos: ", error);
    res.status(500).send("Erro ao carregar os produtos");
  }
});

// Função para gerar o próximo ID
async function gerarNovoId(tipo) {
  // Definir o prefixo para o ID com base no tipo
  let prefixo;

  if (tipo === "livro") {
    prefixo = tipo; // ID seguirá o padrão "livro+número"
  } else if (tipo === "item_adicional") {
    prefixo = "item"; // ID seguirá o padrão "item+número"
  } else {
    throw new Error("Tipo desconhecido. Use 'livro', 'kit' ou 'item_adicional'.");
  }

  // Encontrar o último item do mesmo tipo ordenado pelo campo `id` em ordem decrescente
  const ultimoItem = await Produto.findOne({ tipo })
    .sort({ id: -1 }) // Ordena decrescente pelo campo `id`
    .exec();

  console.log('O último item é: ', ultimoItem);

  // Se não há item, iniciar com '1'
  let novoNumero = 1;
  if (ultimoItem) {
    // Extrai o número do ID, assumindo que segue o padrão 'tipo+número' ou 'item+número'
    const ultimoNumero = parseInt(ultimoItem.id.replace(prefixo, ''), 10);
    novoNumero = ultimoNumero + 1;
  }

  // Gera o novo ID
  const novoId = `${prefixo}${novoNumero}`;
  console.log('O novo ID gerado é: ', novoId);

  return novoId;
};


//Rota que entrega a lista de livros quando solicitada
app.get("/livros", async (req, res) => {
  try {
    const livros = await Produto.find({ tipo: 'livro' });
    res.json(livros);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar livros" });
  }
});

// Rota para cadastrar os novos produtos
app.post('/cadastrar-livro', async (req, res) => {
  const { tituloLivroNovo, autorLivroNovo, generoLivroNovo, quantidadeLivroNovo } = req.body;
  console.log("Livro recebido para cadastro: " + tituloLivroNovo, autorLivroNovo, generoLivroNovo, quantidadeLivroNovo);
  // Gera o próximo ID
  const id = await gerarNovoId("livro");
  console.log(id)

  const novoLivro = new Produto({
    id: id,
    tipo: 'livro',
    titulo: tituloLivroNovo,
    genero: generoLivroNovo,
    autor: autorLivroNovo,
    quantidade_estoque: quantidadeLivroNovo
  });

  try {
    await novoLivro.save();
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao adicionar livro: ", error);
    res.status(500).send("Erro ao adicionar livro");
  }
});


//Rota que entrega a lista de livros quando solicitada
app.get("/itensAdicionais", async (req, res) => {
  try {
    const itensAdicionais = await Produto.find({ tipo: 'item_adicional' });
    res.json(itensAdicionais);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar livros" });
  }
});

//Rota que cadastra novos itens adicionais
app.post('/cadastrar-item-adicional', async (req, res) => {
  const { nomeItemNovo, livroReferenciaItemNovo, quantidadeItemNovo } = req.body;

  // Gera o próximo ID
  const id = await gerarNovoId("item_adicional");
  console.log(id)

  //Gerar um novo produto do tipo item
  const novoItem = new Produto({
    id: id,
    tipo: 'item_adicional',
    nome: nomeItemNovo,
    titulo_referencia: livroReferenciaItemNovo,
    quantidade_estoque: quantidadeItemNovo
  });

  try {
    await novoItem.save();
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao adicionar item adicional: ", error);
    res.status(500).send("Erro ao adicionar item adicional");
  }
});



// Rota para verificar se já existe um kit com o mesmo mês e assinatura
app.get('/kits', async (req, res) => {
  console.log("Rota: app.get(/kits) chamada");
  const { mesReferencia, assinatura } = req.query;
  console.log("Mes de referencia recebido: " + mesReferencia);
  console.log("Assinatura recebida: " + assinatura);

  try {
    const assinaturaSelecionada = await Assinatura.findOne({ id: assinatura });
    console.log("Assinatura encontrada no banco: " + assinaturaSelecionada);
    console.log("O id dela é: " + assinaturaSelecionada._id);
    const kitExistente = await Produto.findOne({ tipo: 'kit', mes_referencia: mesReferencia, assinatura_referencia: assinaturaSelecionada._id });
    console.log("Kit encontrado no banco: " + kitExistente);

    if (kitExistente) {
      // Retorna uma resposta indicando que o kit já existe
      console.log("Portanto, já  existe um kit com essa assinatura nesse mes de referencia e a resposta foi negativa");
      res.status(200).json(kitExistente); // Retorna a lista de kits existentes      
    } else {
      console.log("Ainda não existe um kit para esse mês com essa mesma assinatura então a resposta é positiva para o cadastro")
      res.sendStatus(204); // Retorna 204 No Content se não houver kits
    }
  } catch (error) {
    console.error("Erro ao verificar kit:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para verificar o livro selecionado já existe em kits de meses diferentes
app.get('/kits/verificar-livro', async (req, res) => {
  console.log("Rota: app.get('/kits/verificar-livro') chamada");
  const { livroId, mesReferencia } = req.query; // Obtendo o livro e o mês de referência da query string
  console.log("Id do livro recebido: " + livroId + " Mes de referencia recebido: " + mesReferencia);

  try {
    // Encontra kits que contêm o livro selecionado, mas com meses diferentes
    const kitMesAnterior = await Produto.findOne({
      tipo: "kit",
      "itens.produto_id": livroId,
      mes_referencia: { $ne: mesReferencia }
    });
    console.log("Depois de buscar um kit com o mesmo livro foi encontrado: " + kitMesAnterior);

    if (kitMesAnterior) {
      // Retorna uma resposta indicando que o livro já está em um kit de outro mês
      console.log("Portanto, já existe um kit de outro mes com esse livro e a resposta é negativa");
      res.status(200).json(kitMesAnterior); // Retorna o kit que já contem esse mesmo livro 
    } else {
      console.log("Ainda não existe um kit com esse livro então a resposta é positiva e ele pode ser cadastrado")
      res.sendStatus(204); // Retorna 204 No Content se não houver kits
    }
  } catch (error) {
    console.error("Erro ao verificar livros em kits:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});



//Rota que cadastra novos kits
app.post('/criar-kit', async (req, res) => {
  // Gera o próximo ID
  const { mesReferenciaKitNovo, generoKitNovo, assinaturaKitNovo, livrosSelecionadosKitNovo,
    itensAdicionaisSelecionadosKitNovo, itensAdicionaisSelecionadosKitNovo2, quantidadeKitNovo, possuiItens } = req.body;

  const _idAssinatura = await Assinatura.findOne({ id: assinaturaKitNovo });

  // Inicia o array de itens do kit, convertendo os valores para string
  const itens = [
    { produto_id: String(livrosSelecionadosKitNovo) }
  ];

  if (possuiItens === 'true') {
    itens.push({ produto_id: String(itensAdicionaisSelecionadosKitNovo) });
    itens.push({ produto_id: String(itensAdicionaisSelecionadosKitNovo2) });
  }
const novoKit = new Produto({
    id: `kit${mesReferenciaKitNovo}`,
    tipo: 'kit',
    genero: generoKitNovo,
    mes_referencia: mesReferenciaKitNovo,
    itens: itens, // Passa o array de itens completo
    quantidade_estoque: quantidadeKitNovo,
    assinatura_referencia: _idAssinatura._id
  });

  try {
    await novoKit.save();
    res.redirect('/produtos');
  } catch (error) {
    res.status(500).send("Erro ao criar kit");
  }
});


//Rotas para editar/atualizar os produtos existentes
app.post('/atualizar-livro/:id', async (req, res) => {
  const productId = req.params.id;
  const { tituloLivro, autorLivro, generoLivro, quantidadeLivro } = req.body;
  try {
    await Produto.findByIdAndUpdate(productId, {
      titulo: tituloLivro,
      autor: autorLivro,
      genero: generoLivro,
      quantidade_estoque: quantidadeLivro
    });
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao atualizar livro: ", error);
    res.status(500).send("Erro ao atualizar livro");
  }
});

app.post('/atualizar-item/:id', async (req, res) => {
  const productId = req.params.id;
  const { nomeItem, referenciaItem, quantidadeItem } = req.body;

  try {
    await Produto.findByIdAndUpdate(productId, {
      nome: nomeItem,
      titulo_referencia: referenciaItem,
      quantidade_estoque: quantidadeItem
    });
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao atualizar item adicional: ", error);
    res.status(500).send("Erro ao atualizar item adicional");
  }
});

// Rota para obter os detalhes de um kit pelo ID
app.get('/kit/:id', async (req, res) => {
  try {
    const kitId = req.params.id;

    // Busca o kit pelo ID
    const kit = await Produto.findOne({ _id: kitId });
    const assinaturaKit = await Assinatura.findOne({ _id: kit.assinatura_referencia });

    if (!kit) {
      return res.status(404).json({ message: 'Kit não encontrado' });
    }

    // Busca detalhes dos livros e itens adicionais usando os ids referenciados
    // Extrair todos os IDs de produto referenciados no kit
    const produtoIds = kit.itens.map(item => item.produto_id);

    // Buscar detalhes dos produtos usando os IDs extraídos
    const composicao = await Produto.find({ id: { $in: produtoIds } });

    // Separar os produtos em dois arrays: livros e itens adicionais
    const livros = composicao.filter(item => item.tipo === 'livro');
    const itensAdicionais = composicao.filter(item => item.tipo === 'item_adicional');
    console.log("Buscando detalhes dos livros e itens adicionais enviando esses itens adicionais: ", itensAdicionais)

    // Enviar o kit e a composição separada no JSON de resposta
    res.json({ kit, livros, itensAdicionais, assinaturaKit });
  } catch (error) {
    console.error('Erro ao buscar o kit:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


app.post('/atualizar-kit/:id', async (req, res) => {
  const { quantidadeKit, livrosSelecionados, itensAdicionaisSelecionados, itensAdicionaisSelecionados2 } = req.body;
  const kitId = req.params.id;
  console.log("/atualizar-kit/:id");

  try {
    // Crie o array de itens a partir dos livros e itens adicionais, garantindo o formato correto
    const itensAtualizados = [
      ...livrosSelecionados.map(livro => ({
        produto_id: livro, // Aqui, "id" deve ser a propriedade que contém o ID do produto
      })),
      ...itensAdicionaisSelecionados.map(item => ({
        produto_id: item, // Aqui, "id" deve ser a propriedade que contém o ID do item adicional
      })),
      ...itensAdicionaisSelecionados2.map(item => ({
        produto_id: item, // Aqui, "id" deve ser a propriedade que contém o ID do item adicional 2
      }))
    ];

    // Atualize o kit no banco de dados
    const resultado = await Produto.findByIdAndUpdate(
      kitId,
      {
        quantidade_estoque: quantidadeKit,
        itens: itensAtualizados // Atualizando o array de itens
      },
      { new: true } // Retorna o documento atualizado
    );

    if (!resultado) {
      return res.status(404).send('Kit não encontrado');
    }

    // Redirecionar ou enviar uma resposta de sucesso
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao atualizar kit: ", error);
    res.status(500).send('Erro ao atualizar kit');
  }
});


//Rotas para excluir os produtos (a mesma para todos os produtos pois utiliza o id)
app.post('/excluir-livro', async (req, res) => {
  const { tituloLivro, autorLivro } = req.query;
  console.log("Rota de exclusão do livro chamada com os parametros tituloLivro: "+tituloLivro+" e autorLivro: "+autorLivro)
  
  try {
    const livroEncontrado = await Produto.findOne({titulo: tituloLivro, autor: autorLivro});
    console.log('Foi encontrado esse livro para exclusão: '+livroEncontrado);
    await Produto.findByIdAndDelete(livroEncontrado._id);
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao excluir produto: ", error);
    res.status(500).send("Erro ao excluir produto");
  }
});

app.post('/excluir-item', async (req, res) => {
  console.log("Foi")
  const { nomeItem, referenciaItem} = req.query;

  try {
    const itemEncontrado = await Produto.findOne({nome: nomeItem, titulo_referencia: referenciaItem});
    await Produto.findByIdAndDelete(itemEncontrado._id);
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao excluir produto: ", error);
    res.status(500).send("Erro ao excluir produto");
  }
});

//Rotas para excluir os produtos (a mesma para todos os produtos pois utiliza o id)
app.post('/excluir-kit', async (req, res) => {
  const { mesReferencia, assinaturaKit } = req.query;
  // Separar assinaturaKit em genero e tipo
  const [genero, tipo] = assinaturaKit.split(" ");
  
  try {
    const assinaturaEncontrada = await Assinatura.findOne({genero: genero, tipo_kit: tipo});
    const kitEncontrado = await Produto.findOne({id: 'kit'+mesReferencia, assinatura_referencia: assinaturaEncontrada._id});
    console.log("Depois de buscar encontramos o kit: "+kitEncontrado+" E a assinatura: "+assinaturaEncontrada);
    await Produto.findByIdAndDelete(kitEncontrado._id);
    res.redirect('/produtos');
  } catch (error) {
    console.error("Erro ao excluir produto: ", error);
    res.status(500).send("Erro ao excluir produto");
  }
});
