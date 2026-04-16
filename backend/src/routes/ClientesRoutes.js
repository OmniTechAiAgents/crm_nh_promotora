import express from "express";
import ClientesController from "../controllers/ClientesController.js";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";

const ClientesRoutes = express.Router();

ClientesRoutes.post("/", AuthenticationToken, ClientesController.CriarClienteDB);

ClientesRoutes.get("/", AuthenticationToken, ClientesController.BuscarClientePorCpf);

ClientesRoutes.post("/novavida", AuthenticationToken, ClientesController.BuscarClienteDBeConsultarNovaVida);

ClientesRoutes.patch("/:cpf/sincronizar-novavida", AuthenticationToken, AuthorizeRoles('admin'), ClientesController.AtualizarClienteDBViaNovaVida);

export default ClientesRoutes;