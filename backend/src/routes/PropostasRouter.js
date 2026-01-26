import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import PropostasFGTSController from "../controllers/PropostasFGTSController.js";

const PropostasRoutes = express.Router();

PropostasRoutes.post("/FGTS", AuthenticationToken, PropostasFGTSController.FazerProposta);
PropostasRoutes.patch("/FGTS", AuthenticationToken, PropostasFGTSController.CancelarProposta);

export default PropostasRoutes;