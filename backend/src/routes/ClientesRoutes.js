import express from 'express';
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import ClientesController from '../controllers/ClientesController.js';

const ClientesRoutes = express.Router();

ClientesRoutes.get('/', AuthenticationToken, ClientesController.ProcurarClientePorCpf);
ClientesRoutes.post('/', AuthenticationToken, ClientesController.RegistrarNovoCliente);

export default ClientesRoutes;