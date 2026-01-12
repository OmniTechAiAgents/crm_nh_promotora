// importando as variaveis de ambiente
import 'dotenv/config';

import './config/cron.js';
import express from "express";
import AuthRouters from "./routes/AuthRoutes.js";
import ConsultasRoutes from "./routes/ConsultasRoutes.js";
import db from "./config/db.js";

const app = express();
app.use(express.json());

app.use('/auth', AuthRouters);
app.use('/consultas', ConsultasRoutes);

(async () => {
  try {
    await db.sync();
    console.log("Tabelas sincronizadas com sucesso");
  } catch (err) {
    console.error("Erro ao sincronizar tabelas:", err);
  }
})();

app.listen(3000, () => {
    console.log("rodando....")
})
