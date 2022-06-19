import { Router } from "express";
import OrcamentoController from "../controllers/orcamentoController.js";

const router = Router();
router
  .post("/orcamento", OrcamentoController.createOrcamento)
  .get("/orcamento", OrcamentoController.findAllOrcamento)
  .get("/orcamento/deleted", OrcamentoController.findAllOrcamentosDeleted)
  .get("/orcamento/:id", OrcamentoController.findOneOrcamento)
  .put("/orcamento/:id", OrcamentoController.updateOrcamento)
  .post("/orcamento/restore/:id", OrcamentoController.restoreOrcamento)
  .delete("/orcamento/:id", OrcamentoController.destroyOrcamento)

export default router;
