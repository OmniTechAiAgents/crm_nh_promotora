import express from "express";
import ConsultasCLTPythonController from "../controllers/ConsultasCLTPythonController.js";
import { AuthenticateApiKeyAutomacao } from "../middleware/authenticateApiKeyAutomacao.js";

const ConsultasCLTPythonRoutes = express.Router();

ConsultasCLTPythonRoutes.post("/", AuthenticateApiKeyAutomacao, ConsultasCLTPythonController.ArmazenarConsultas);

export default ConsultasCLTPythonRoutes;