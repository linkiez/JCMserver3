import { Router } from "express";
import OrdemProducaoController from "../controllers/ordemProducaoController.js";
import { Authentication } from "../controllers/authController.js";

const router = Router();
router
  .post(
    "/ordemproducao",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "create"]),
    OrdemProducaoController.createOrdemProducao
  )
  .get(
    "/ordemproducao",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "findAll"]),
    OrdemProducaoController.findAllOrdemProducao
  )
  .get(
    "/ordemproducao/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "findAllDeleted"]),
    OrdemProducaoController.findAllOrdemProducaoDeleted
  )
  .get(
    "/ordemproducao/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "findOne"]),
    OrdemProducaoController.findOneOrdemProducao
  )
  .put(
    "/ordemproducao/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "update"]),
    OrdemProducaoController.updateOrdemProducao
  )
  .post(
    "/ordemproducao/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "restore"]),
    OrdemProducaoController.restoreOrdemProducao
  )
  .delete(
    "/ordemproducao/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["ordemProducao", "destroy"]),
    OrdemProducaoController.destroyOrdemProducao
  );

export default router;
