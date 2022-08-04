import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import OperadorController from "../controllers/operadorController.js";

const router = Router();
router
  .get(
    "/operador",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "findAll"]),
    OperadorController.findAllOperadors
  )
  .get(
    "/operador/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "findAllDeleted"]),
    OperadorController.findAllOperadorDeleted
  )
  .get(
    "/operador/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "findOne"]),
    OperadorController.findOneOperador
  )
  .post(
    "/operador",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "create"]),
    OperadorController.createOperador
  )
  .post(
    "/operador/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "restore"]),
    OperadorController.restoreOperador
  )
  .put(
    "/operador/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "update"]),
    OperadorController.updateOperador
  )
  .delete(
    "/operador/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["operador", "destroy"]),
    OperadorController.destroyOperador
  );

export default router;
