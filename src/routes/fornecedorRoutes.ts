import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import FornecedorController from "../controllers/fornecedorController.js";

const router = Router();
router
  .get(
    "/fornecedor",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "findAll"]),
    FornecedorController.findAllFornecedors
  )
  .get(
    "/fornecedor/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "findAllDeleted"]),
    FornecedorController.findAllFornecedorDeleted
  )
  .get(
    "/fornecedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "findOne"]),
    FornecedorController.findOneFornecedor
  )
  .post(
    "/fornecedor", 
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "create"]),
    FornecedorController.createFornecedor
  )
  .post(
    "/fornecedor/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "restore"]),
    FornecedorController.restoreFornecedor
  )
  .put(
    "/fornecedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "update"]),
    FornecedorController.updateFornecedor
  )
  .delete(
    "/fornecedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["fornecedor", "destroy"]),
    FornecedorController.destroyFornecedor
  );

export default router;
