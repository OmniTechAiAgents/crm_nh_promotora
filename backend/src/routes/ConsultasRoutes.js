import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import ConsultasController from "../controllers/ConstultasController.js";

const ConsultasRoutes = express.Router();

ConsultasRoutes.post("/manual", AuthenticationToken, ConsultasController.FazerConsulta);

export default ConsultasRoutes;