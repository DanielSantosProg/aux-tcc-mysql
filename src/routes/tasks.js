const express = require("express");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const router = express.Router();

// Definição do modelo Task
const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    orientando_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    dataEntrega: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pendente", "em progresso", "concluída"),
      defaultValue: "pendente",
    },
    envio: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "Tasks",
    timestamps: false,
  }
);

// GET /api/tasks?orientando_id=
router.get("/", async (req, res, next) => {
  try {
    const { orientando_id } = req.query;
    const whereClause = {};
    if (orientando_id) {
      whereClause.orientando_id = orientando_id;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      order: [["dataEntrega", "ASC"]],
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks
router.post("/", async (req, res, next) => {
  try {
    const { orientando_id, title, description, dataEntrega } = req.body;
    const newTask = await Task.create({
      orientando_id,
      title,
      description: description || null,
      dataEntrega,
    });
    res.status(201).json({ id: newTask.id });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, dataEntrega, status } = req.body;
    console.log("Updating task:", { title, description, dataEntrega, status });
    await Task.update(
      {
        title: title || "",
        description: description || null,
        dataEntrega: dataEntrega ? new Date(dataEntrega) : null,
        status: status || "pendente",
      },
      { where: { id } }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id/file_attach
router.put("/:id/file_attach", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { link } = req.body;
    await Task.update(
      {
        envio: link,
      },
      {
        where: { id },
      }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await Task.destroy({ where: { id } });
    if (deleted === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Task não encontrada" });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE ERROR:", err); // <--- log completo
    next(err);
  }
});

module.exports = router;
