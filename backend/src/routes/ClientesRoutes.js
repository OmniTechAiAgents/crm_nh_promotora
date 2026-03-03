import express from "express";
import ClientesController from "../controllers/ClientesController.js";
import { AuthenticationToken } from "../middleware/authenticate.js";

const ClientesRoutes = express.Router();

ClientesRoutes.post("/", AuthenticationToken, ClientesController.CriarClienteDB);

ClientesRoutes.get("/", AuthenticationToken, ClientesController.BuscarClientePorCpf);

export default ClientesRoutes;