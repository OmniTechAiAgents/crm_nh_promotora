import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import ConsultasFGTSController from "../controllers/ConsultasFGTSController.js";
import ConsultasCLTController from "../controllers/ConsultasCLTController.js";


const ConsultasRoutes = express.Router();

ConsultasRoutes.get("/FGTS/manual", AuthenticationToken, ConsultasFGTSController.RecuperarConsultas);
ConsultasRoutes.post("/FGTS/manual", AuthenticationToken, ConsultasFGTSController.FazerConsulta);
ConsultasRoutes.post("/CLT/manual", AuthenticationToken, ConsultasCLTController.FazerConsulta);

export default ConsultasRoutes;