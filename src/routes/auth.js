const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");
require("dotenv").config();

const router = express.Router();

// Definição do modelo de usuário
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha obrigatórios" });
  }

  try {
    // Busca o usuário pelo email usando o método `findOne` do Sequelize
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Compara a senha com o hash no banco de dados
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // Cria o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no login", error: err });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password, userType } = req.body;
  if (!name || !email || !password || !userType) {
    return res.status(400).json({ message: "Dados incompletos" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    // Insere o novo usuário usando o método `create` do Sequelize
    await User.create({
      name,
      email,
      password: hash,
      userType,
    });

    res.status(201).json({ message: "Usuário criado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no registro", error: err });
  }
});

module.exports = router;
