import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import ConsultasFGTSController from "../controllers/ConsultasFGTSController.js";

const ConsultasRoutes = express.Router();

ConsultasRoutes.post("/FGTS/manual", AuthenticationToken, ConsultasFGTSController.FazerConsulta);

export default ConsultasRoutes;