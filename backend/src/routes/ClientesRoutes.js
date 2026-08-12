import express from "express";
import ClientesController from "../controllers/ClientesController.js";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import { SincronizarLemitRateLimit } from "../middleware/sincronizarLemitRateLimit.js";

const ClientesRoutes = express.Router();

ClientesRoutes.post("/", AuthenticationToken, ClientesController.CriarClienteDB);

ClientesRoutes.get("/", AuthenticationToken, ClientesController.BuscarClientePorCpf);

ClientesRoutes.post("/lemit", AuthenticationToken, ClientesController.BuscarClienteDBeConsultarLemit);

ClientesRoutes.patch("/:cpf/sincronizar-lemit", AuthenticationToken, SincronizarLemitRateLimit, ClientesController.AtualizarClienteDBViaLemit);

export default ClientesRoutes;