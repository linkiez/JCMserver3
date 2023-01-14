import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import OrcamentoController from "../controllers/orcamentoController.js";

const router = Router();
router
  .post(
    "/orcamento",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "create"]),
    OrcamentoController.createOrcamento
  )
  .get(
    "/orcamento",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "findAll"]),
    OrcamentoController.findAllOrcamento
  )
  .get(
    "/orcamento/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "findAllDeleted"]),
    OrcamentoController.findAllOrcamentosDeleted
  )
  .get(
    "/orcamento/:id",
    // Authentication.verificaLogin,
    // Authentication.verificaAcesso(["orcamento", "findOne"]),
    OrcamentoController.findOneOrcamento
  )
  .put(
    "/orcamento/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "update"]),
    OrcamentoController.updateOrcamento
  )
  .post(
    "/orcamento/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "restore"]),
    OrcamentoController.restoreOrcamento
  )
  .delete(
    "/orcamento/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["orcamento", "destroy"]),
    OrcamentoController.destroyOrcamento
  );

export default router;
