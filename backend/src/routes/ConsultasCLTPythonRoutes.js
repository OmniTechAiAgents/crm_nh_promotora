import express from "express";
import ConsultasCLTPythonController from "../controllers/ConsultasCLTPythonController.js";
import { AuthenticateApiKeyAutomacao } from "../middleware/authenticateApiKeyAutomacao.js";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";

const ConsultasCLTPythonRoutes = express.Router();

ConsultasCLTPythonRoutes.post("/", AuthenticateApiKeyAutomacao, ConsultasCLTPythonController.ArmazenarConsultas);
ConsultasCLTPythonRoutes.get("/", AuthenticationToken, ConsultasCLTPythonController.RecuperarConsultas);
ConsultasCLTPythonRoutes.patch("/atribuir", AuthenticationToken, AuthorizeRoles('admin'), ConsultasCLTPythonController.AtribuirConsultas);

export default ConsultasCLTPythonRoutes;