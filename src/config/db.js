// Importa o Sequelize e o dotenv
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Cria uma nova instância do Sequelize, garantindo que o nome do banco seja lido corretamente
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
    logging: console.log,
    dialectOptions: {
      ssl: process.env.MYSQL_ENCRYPT === "true",
    },
  }
);

// Função para testar a conexão com o banco de dados
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com o banco de dados MySQL estabelecida com sucesso!");
  } catch (error) {
    console.error("Não foi possível se conectar ao banco de dados:", error);
  }
};

module.exports = { sequelize, connectDB };
