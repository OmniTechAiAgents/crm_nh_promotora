import express from "express";
import MicroservicesController from "../controllers/MicroservicesController.js";
import { AuthenticateApiKey } from "../middleware/authenticateApiKey.js";


const MicroservicesRoutes = express.Router();

MicroservicesRoutes.post("/consulta/FGTS", AuthenticateApiKey, MicroservicesController.Consultar);

MicroservicesRoutes.get("/clientes", AuthenticateApiKey, MicroservicesController.ProcurarClientePorCpf);
MicroservicesRoutes.post("/clientes", AuthenticateApiKey, MicroservicesController.RegistrarNovoCliente);

MicroservicesRoutes.patch("/consultas_lote", AuthenticateApiKey, MicroservicesController.EditarRegistroDeConsulta);

export default MicroservicesRoutes;