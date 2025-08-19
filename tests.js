// Importa o Sequelize e o dotenv para carregar as variáveis de ambiente
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Configuração do Sequelize usando as variáveis de ambiente
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log, // Opcional: para ver o SQL gerado no console
  }
);

// --- Definição do Modelo de Usuário (Users) ---
// Define o modelo 'Users' para mapear para a tabela 'Users' no banco de dados.
// É importante que o modelo corresponda exatamente à sua estrutura de tabela.
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userType: {
      type: DataTypes.ENUM("admin", "orientador", "orientando"),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Users", // Especifica o nome da tabela no banco
    timestamps: false, // Desabilita timestamps automáticos (createdAt, updatedAt)
  }
);

// --- Função para Testar a Conexão e Inserir um Usuário ---
async function testConnectionAndInsertUser() {
  try {
    // 1. Testa a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    // 2. Sincroniza o modelo com o banco de dados
    // O { alter: true } tenta ajustar a tabela existente sem perder dados,
    // garantindo que o modelo e a tabela estejam alinhados.
    // Você pode remover essa opção se a tabela já estiver perfeita.
    await User.sync({ alter: true });
    console.log("✅ Modelo de Usuário sincronizado com a tabela Users.");

    // 3. Insere um novo usuário na tabela
    // Substitua os dados de exemplo pelos que você deseja inserir
    const newUser = await User.create({
      name: "Maria de Teste",
      email: "maria.teste@example.com",
      userType: "orientando", // Substitua por 'admin', 'orientador' ou 'orientando'
      password: "senha_segura_123",
    });

    console.log(
      `🎉 Novo usuário inserido com sucesso: ${newUser.name} (ID: ${newUser.id})`
    );
  } catch (error) {
    console.error(
      "❌ Não foi possível se conectar ao banco de dados ou inserir o usuário:",
      error
    );
  } finally {
    // 4. Fecha a conexão para liberar recursos
    await sequelize.close();
    console.log("Conexão fechada.");
  }
}

// Executa a função
testConnectionAndInsertUser();
