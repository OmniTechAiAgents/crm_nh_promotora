import express from "express";
import AuthRouters from "./routes/AuthRoutes.js";
import db from "./config/db.js";

import './models/Usuario.js';

const app = express();
app.use(express.json());

app.use('/auth', AuthRouters);

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
