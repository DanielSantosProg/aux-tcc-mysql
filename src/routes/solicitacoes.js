const express = require("express");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const router = express.Router();

// Definição do modelo Solicitacao
const Solicitacao = sequelize.define(
  "Solicitacao",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orientando_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orientador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    temaTCC: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dataSolicitacao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pendente", "aprovada", "rejeitada"),
      defaultValue: "pendente",
      allowNull: false,
    },
  },
  {
    tableName: "Solicitacoes",
    timestamps: false,
  }
);

// GET /api/solicitacoes
router.get("/", async (req, res, next) => {
  try {
    const { orientador_email } = req.query;

    let query = `
        SELECT s.id,
        s.temaTCC,
        s.descricao,
        LOWER(s.status) AS status,
        s.dataSolicitacao,
        s.orientador_id,
        s.orientando_id,
        u.name AS orientando_nome,
        u.email AS orientando_email
    FROM Solicitacoes s
    INNER JOIN Users u ON u.id = s.orientando_id
    `;

    const replacements = [];

    if (orientador_email) {
      query +=
        " INNER JOIN Users o ON o.id = s.orientador_id WHERE o.email = ?";
      replacements.push(orientador_email);
    }

    const [results] = await sequelize.query(query, { replacements });

    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar solicitações:", err);
    next(err);
  }
});

// POST /api/solicitacoes
router.post("/", async (req, res, next) => {
  try {
    const { orientando_id, orientador_id, temaTCC, descricao } = req.body;

    // Cria a solicitação com o status padrão 'Pendente'
    const novaSolicitacao = await Solicitacao.create({
      orientando_id,
      orientador_id,
      temaTCC,
      descricao,
      // O status será definido automaticamente como 'Pendente'
    });

    res.status(201).json(novaSolicitacao);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'pendente' | 'aprovada' | 'rejeitada'

    // Atualiza o status da solicitação
    const [updated] = await Solicitacao.update({ status }, { where: { id } });

    if (updated === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Solicitação não encontrada" });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
