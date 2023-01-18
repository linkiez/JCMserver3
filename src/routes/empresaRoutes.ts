import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import EmpresaController from "../controllers/empresaController.js";
const router = Router();
router
  .get(
    "/empresa",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "findAll"]),
    EmpresaController.findAllEmpresas
  )
  .get(
    "/empresa/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "findAllDeleted"]),
    EmpresaController.findAllEmpresaDeleted
  )
  .get(
    "/empresa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "findOne"]),
    EmpresaController.findOneEmpresa
  )
  .post(
    "/empresa",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "create"]),
    EmpresaController.createEmpresa
  )
  .post(
    "/empresa/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "restore"]),
    EmpresaController.restoreEmpresa
  )
  .put(
    "/empresa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "update"]),
    EmpresaController.updateEmpresa
  )
  .delete(
    "/empresa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["empresa", "destroy"]),
    EmpresaController.destroyEmpresa
  );

export default router;
