import express from "express";
import { AuthenticationToken } from "../middleware/authenticate.js";
import { AuthorizeRoles } from "../middleware/authorizedRoles.js";
import UsuariosController from "../controllers/UsuariosController.js";

const UsuariosRoutes = express.Router();

UsuariosRoutes.get("/", AuthenticationToken, AuthorizeRoles("admin"), UsuariosController.Buscar);
UsuariosRoutes.put("/:usuarioId", AuthenticationToken, AuthorizeRoles("admin"), UsuariosController.Atualizar);
UsuariosRoutes.delete("/:usuarioId", AuthenticationToken, AuthorizeRoles("admin"), UsuariosController.Deletar);
UsuariosRoutes.patch("/:usuarioId/mudarSenha", AuthenticationToken, AuthorizeRoles("admin"), UsuariosController.MudarSenha);

export default UsuariosRoutes;