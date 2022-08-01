import { Router } from "express";
import OrdemProducaoController from "../controllers/ordemProducaoController.js";

const router = Router();
router
  .post("/ordemproducao", OrdemProducaoController.createOrdemProducao)
  .get("/ordemproducao", OrdemProducaoController.findAllOrdemProducao)
  .get("/ordemproducao/deleted", OrdemProducaoController.findAllOrdemProducaoDeleted)
  .get("/ordemproducao/:id", OrdemProducaoController.findOneOrdemProducao)
  //.put("/ordemproducao/:id", OrdemProducaoController.updateOrdemProducao)
  .post("/ordemproducao/restore/:id", OrdemProducaoController.restoreOrdemProducao)
  .delete("/ordemproducao/:id", OrdemProducaoController.destroyOrdemProducao)

export default router;
