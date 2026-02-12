import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import ConsultasFGTSController from "../controllers/ConsultasFGTSController.js";
import ConsultasCLTController from "../controllers/ConsultasCLTController.js";
import { uploadCsv } from "../middleware/uploadCsv.js";


const ConsultasRoutes = express.Router();

// parte manual
ConsultasRoutes.get("/FGTS/manual", AuthenticationToken, ConsultasFGTSController.RecuperarConsultas);
ConsultasRoutes.post("/FGTS/manual", AuthenticationToken, ConsultasFGTSController.FazerConsulta);
ConsultasRoutes.post("/CLT/manual", AuthenticationToken, ConsultasCLTController.FazerConsulta);

// parte automatizada (consuta em lote)
ConsultasRoutes.post("/FGTS/lote", AuthenticationToken, AuthorizeRoles('admin'), uploadCsv.single("file"), ConsultasFGTSController.IniciarConsultaEmLote);

export default ConsultasRoutes;