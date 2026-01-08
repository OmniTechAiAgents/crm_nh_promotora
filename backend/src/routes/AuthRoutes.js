import express from "express";
import AuthController from "../controllers/AuthController.js";

const AuthRouters = express.Router();

AuthRouters.post("/registro", AuthController.Registro);

export default AuthRouters;