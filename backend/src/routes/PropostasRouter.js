import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import PropostasFGTSController from "../controllers/PropostasFGTSController.js";

const PropostasRoutes = express.Router();

PropostasRoutes.post("/FGTS", AuthenticationToken, PropostasFGTSController.FazerProposta);
PropostasRoutes.get("/FGTS", AuthenticationToken, PropostasFGTSController.RecuperarPropostas);
PropostasRoutes.patch("/FGTS/cancelar", AuthenticationToken, PropostasFGTSController.CancelarProposta);
PropostasRoutes.patch("/FGTS/verificar", AuthenticationToken, PropostasFGTSController.VerificarProposta);

PropostasRoutes.get("/pesquisarBanco", AuthenticationToken, PropostasFGTSController.PesquisarBanco);

export default PropostasRoutes;