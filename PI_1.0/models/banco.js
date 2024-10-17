const mongoose = require('mongoose');

// Configurações da conexão
const mongoURI = 'mongodb://127.0.0.1:27017/PI3'; // Altere 'nome_do_seu_banco' para o nome do seu banco de dados

// Função para conectar ao MongoDB
const conectar = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
    }
};

// Exporta a função de conexão e o objeto mongoose
module.exports = {
    conectar,
    mongoose
};
