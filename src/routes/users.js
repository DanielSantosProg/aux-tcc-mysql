const express = require("express");
const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");

const router = express.Router();

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
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

// GET /api/users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "userType"],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// POST /api/users (Rota de Registro)
router.post("/", async (req, res, next) => {
  try {
    const { name, email, userType, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email já cadastrado." });
    }

    // Hashea a senha antes de salvar
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      userType,
      password: hashedPassword, // Salva a senha hasheada
    });

    res
      .status(201)
      .json({ id: newUser.id, name: newUser.name, email: newUser.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
