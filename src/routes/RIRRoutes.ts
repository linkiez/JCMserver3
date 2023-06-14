import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import RIRController from "../controllers/RIRController.js";

const router = Router();
router
  .get(
    "/rir",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "findAll"]),
    RIRController.findAllRIRs
  )
  .get(
    "/rir/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "findAllDeleted"]),
    RIRController.findAllRIRDeleted
  )
  .get(
    "/rir/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "findOne"]),
    RIRController.findOneRIR
  )
  .post(
    "/rir",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "create"]),
    RIRController.createRIR
  )
  .post(
    "/rir/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "restore"]),
    RIRController.restoreRIR
  )
  .put(
    "/rir/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "update"]),
    RIRController.updateRIR
  )
  .delete(
    "/rir/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "destroy"]),
    RIRController.destroyRIR
  )
  .get(
    "/rir/pessoa/:id_pessoa/produto/:id_produto",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["rir", "findAll"]),
    RIRController.findAllRIRsByPessoaAndProduto
  )

export default router;
