import express from "express";
import AuthController from "../controllers/AuthController.js";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";

const AuthRouters = express.Router();

AuthRouters.post("/registro", AuthenticationToken, AuthorizeRoles(['admin']), AuthController.Registro);

AuthRouters.post("/login" , AuthController.Login);

export default AuthRouters;