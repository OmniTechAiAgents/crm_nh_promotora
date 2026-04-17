import express from "express";
import ConsultasCLTPythonController from "../controllers/ConsultasCLTPythonController.js";
import { AuthenticateApiKeyAutomacao } from "../middleware/authenticateApiKeyAutomacao.js";
import { AuthenticationToken } from "../middleware/authenticate.js";

const ConsultasCLTPythonRoutes = express.Router();

ConsultasCLTPythonRoutes.post("/", AuthenticateApiKeyAutomacao, ConsultasCLTPythonController.ArmazenarConsultas);
ConsultasCLTPythonRoutes.get("/", AuthenticationToken, ConsultasCLTPythonController.RecuperarConsultas);

export default ConsultasCLTPythonRoutes;