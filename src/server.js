const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB, sequelize } = require("./config/db");
const authRoutes = require("./routes/auth");
const solicitacoesRoutes = require("./routes/solicitacoes");
const usersRoutes = require("./routes/users");
const orientacoesRoutes = require("./routes/orientacoes");
const tasksRoutes = require("./routes/tasks");
const commentsRoutes = require("./routes/comments");
const { requireAuth } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Inicia o servidor imediatamente, na porta que a Railway fornecer
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Tenta conectar e sincronizar o banco de dados de forma assíncrona,
// sem bloquear a inicialização do servidor.
(async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log("Banco de dados sincronizado com sucesso!");
  } catch (err) {
    console.error("Erro ao sincronizar o banco de dados:", err);
  }
})();

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/orientacoes", orientacoesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/comments", commentsRoutes);

app.get("/api/secure-data", requireAuth, (req, res) => {
  res.json({ message: "Acesso autorizado", user: req.user });
});
