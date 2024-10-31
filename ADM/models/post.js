const mongoose = require('mongoose');

// Definição do esquema para Usuários
const usuarioSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    tipo: { type: String, enum: ['cliente', 'administrador'], required: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    contato: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    endereco: {
        rua: { type: String, required: true },
        numero: { type: String, required: true },
        bairro: { type: String, required: true },
        cidade: { type: String, required: true },
        estado: { type: String, required: true },
        cep: { type: String, required: true }
    },
    assinatura_id: { type: String, ref: 'Assinatura' }, // Referência à assinatura
    status_financeiro: { type: String, required: true },
    status_plano: { type: String, enum: ['ativo', 'inativo'], required: true }
});

// Definição do esquema para Produtos
const produtoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    tipo: { type: String, required: true },
    titulo: { type: String },
    autor: { type: String },
    genero: { type: String },
    quantidade_estoque: { type: Number, required: true },
    nome: { type: String }, // Para itens adicionais
    titulo_referencia: { type: String }, // Para itens adicionais
    mes_referencia: { type: String }, // Para kits
    itens: [{
        produto_id: { type: String, ref: 'Produto' }, // Referência ao produto
        quantidade: { type: Number, required: false }
    }],
    assinatura_referencia: { type: mongoose.Schema.Types.ObjectId, ref: 'Assinatura' }
});

// Definição do esquema para Assinaturas
const assinaturaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    genero: { type: String, required: true },
    tipo_kit: { type: String, enum: ['Básico', 'Premium'], required: true },
    qtd_adicionais: { type: Number, required: true },
    preco_assinatura: { type: Number, required: true },
    status_assinatura: { type: String, required: true }
});

// Definição do esquema para Pedidos
const pedidoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    cliente_id: { type: String, ref: 'Usuario', required: true }, // Referência ao cliente
    assinatura_id: { type: String, ref: 'Assinatura' }, // Referência à assinatura
    produtos: [{
        produto_id: { type: String, ref: 'Produto' }, // Referência ao produto
        quantidade: { type: Number, required: true }
    }],
    mes_referencia: { type: String, required: true },
    total: { type: Number, required: true },
    metodo_pagamento: { type: String, required: true },
    status_pagamento: { type: String, required: true },
    status_pedido: { type: String, required: true }
});

// Definição do esquema para Entregas
const entregaSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    pedido: { type: String, ref: 'Pedido', required: true }, // Referência ao pedido
    data_envio: { type: Date, required: true },
    data_entrega: { type: Date, required: true },
    status: { type: String, required: true }
});

// Modelos
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Produto = mongoose.model('Produto', produtoSchema);
const Assinatura = mongoose.model('Assinatura', assinaturaSchema);
const Pedido = mongoose.model('Pedido', pedidoSchema);
const Entrega = mongoose.model('Entrega', entregaSchema);

// Exportação dos modelos
module.exports = {
    Usuario,
    Produto,
    Assinatura,
    Pedido,
    Entrega
};