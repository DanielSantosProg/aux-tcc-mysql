const express = require("express");
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const router = express.Router();

// Definição dos modelos
const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    subject: {
      type: DataTypes.STRING,
    },
    taskId: {
      type: DataTypes.INTEGER,
    },
    isOrientando: {
      type: DataTypes.BOOLEAN,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "Comments",
    timestamps: false,
  }
);

const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    orientando_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "Tasks",
    timestamps: false,
  }
);

// Define as associações
Comment.belongsTo(Task, { foreignKey: "taskId" });
Task.hasMany(Comment, { foreignKey: "taskId" });

// GET /api/comments?orientando_id=
router.get("/", async (req, res, next) => {
  try {
    const { orientando_id } = req.query;

    const comments = await Comment.findAll({
      attributes: [
        "id",
        "content",
        "subject",
        "taskId",
        "isOrientando",
        "createdAt",
      ],
      include: {
        model: Task,
        attributes: [],
        where: { orientando_id },
      },
      order: [["createdAt", "ASC"]],
    });

    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments
router.post("/", async (req, res, next) => {
  try {
    const { content, taskId, subject, isOrientando } = req.body;

    const newComment = await Comment.create({
      content,
      taskId,
      subject,
      isOrientando,
      createdAt: new Date(),
    });

    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
