const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM("orientador", "orientando"),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qtd_orientandos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_orientandos: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    tot_orientacoes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    formacao: {
      type: DataTypes.TEXT,
    },
    area_atuacao: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

async function hashPlaintextPasswords() {
  try {
    await sequelize.authenticate();
    console.log("Conectado ao banco de dados com sucesso!");

    const users = await User.findAll();

    for (const user of users) {
      if (!user.password.startsWith("$2")) {
        console.log(`Hash da senha do usuário '${user.email}'...`);

        const hashedPassword = await bcrypt.hash(user.password, 10);

        user.password = hashedPassword;
        await user.save();

        console.log(`Senha do usuário '${user.email}' atualizada.`);
      } else {
        console.log(
          `Senha do usuário '${user.email}' já está hasheada. Pulando.`
        );
      }
    }

    console.log(
      "\nProcesso de hash de senhas concluído para todos os usuários."
    );
  } catch (err) {
    console.error("Erro durante o processo de hash de senhas:", err);
  } finally {
    await sequelize.close();
    console.log("Conexão com o banco de dados fechada.");
  }
}

hashPlaintextPasswords();
