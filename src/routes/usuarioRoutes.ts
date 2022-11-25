import { Router } from "express";
import UsuarioController from "../controllers/usuarioController.js";
import { Authentication } from "../controllers/authController.js";

const router = Router();
router
  .get(
    "/usuario",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["usuario", "findAll"]),
    UsuarioController.findAllUsuarios
  )
  .get(
    "/usuario/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["usuario", "findAllDeleted"]),
    UsuarioController.findAllUsuarioDeleted
  )
  .get(
    "/usuario/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["usuario", "findOne"]),
    UsuarioController.findOneUsuario
  )
  .post(
    "/usuario",
    // Authentication.verificaLogin,
    // Authentication.verificaAcesso(["usuario", "create"]),
    UsuarioController.createUsuario
  )
  .post(
    "/usuario/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["usuario", "restore"]),
    UsuarioController.restoreUsuario
  )
  .put(
    "/usuario/:id",
    // Authentication.verificaLogin,
    // Authentication.verificaAcesso(["usuario", "update"]),
    UsuarioController.updateUsuario
  )
  .delete(
    "/usuario/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["usuario", "destroy"]),
    UsuarioController.destroyUsuario
  );

export default router;
