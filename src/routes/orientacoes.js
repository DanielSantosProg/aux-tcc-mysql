const express = require("express");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const router = express.Router();

// Definição dos modelos
const Orientacao = sequelize.define(
  "Orientacao",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    orientador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orientando_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Orientacoes",
    timestamps: false,
  }
);

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

// Define as associações para os joins
Orientacao.belongsTo(User, { as: "orientador", foreignKey: "orientador_id" });
Orientacao.belongsTo(User, { as: "orientando", foreignKey: "orientando_id" });

// GET /api/orientacoes?orientador_id=&orientando_id=
router.get("/", async (req, res, next) => {
  try {
    const { orientador_id, orientando_id } = req.query;
    const whereClause = {};
    if (orientador_id) {
      whereClause.orientador_id = orientador_id;
    }
    if (orientando_id) {
      whereClause.orientando_id = orientando_id;
    }

    const orientacoes = await Orientacao.findAll({
      where: whereClause,
      include: [
        { model: User, as: "orientador", attributes: ["name", "email"] },
        { model: User, as: "orientando", attributes: ["name", "email"] },
      ],
    });

    // Mapeia o resultado para o formato desejado
    const formattedOrientacoes = orientacoes.map((o) => ({
      id: o.id,
      orientador_id: o.orientador_id,
      orientando_id: o.orientando_id,
      orientador_nome: o.orientador.name,
      orientando_nome: o.orientando.name,
      orientando_email: o.orientando.email,
    }));

    res.json(formattedOrientacoes);
  } catch (err) {
    next(err);
  }
});

// POST /api/orientacoes
router.post("/", async (req, res, next) => {
  try {
    const { orientador_id, orientando_id } = req.body;

    const newOrientacao = await Orientacao.create({
      orientador_id,
      orientando_id,
    });

    await User.increment(
      { qtd_orientandos: 1 },
      { where: { id: orientador_id } }
    );

    await User.increment(
      { tot_orientacoes: 1 },
      { where: { id: orientador_id } }
    );

    res.status(201).json({ id: newOrientacao.id });
  } catch (err) {
    console.error("Erro ao criar orientação:", err);
    next(err);
  }
});

module.exports = router;
