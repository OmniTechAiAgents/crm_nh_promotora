import express from "express";
import MicroservicesController from "../controllers/MicroservicesController.js";
import { AuthenticateApiKey } from "../middleware/authenticateApiKey.js";

const MicroservicesRoutes = express.Router();

MicroservicesRoutes.post("/consulta/FGTS", AuthenticateApiKey, MicroservicesController.Consultar);

export default MicroservicesRoutes;