import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import ConsultasCLTPythonController from "../controllers/ConsultasCLTPythonController.js";

const ConsultasCLTPythonRoutes = express.Router();

ConsultasCLTPythonRoutes.post("/", AuthenticationToken, ConsultasCLTPythonController.ArmazenarConsultas);

export default ConsultasCLTPythonRoutes;