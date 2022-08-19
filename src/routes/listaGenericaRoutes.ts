import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import ListaGenericaController from "../controllers/listaGenericaController.js";

const router = Router();
router
  .get(
    "/listagenerica",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "findAll"]),
    ListaGenericaController.findAllListaGenerica
  )
  .get(
    "/listagenerica/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "findAllDeleted"]),
    ListaGenericaController.findAllListaGenericaDeleted
  )
  .get(
    "/listagenerica/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "findOne"]),
    ListaGenericaController.findOneListaGenerica
  )

  .get(
    "/listagenerica/nome/:nome",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "findOne"]),
    ListaGenericaController.findByNameListaGenerica
  )

  .post(
    "/listagenerica",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "create"]),
    ListaGenericaController.createListaGenerica
  )
  .post(
    "/listagenerica/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "restore"]),
    ListaGenericaController.restoreListaGenerica
  )
  .put(
    "/listagenerica/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "update"]),
    ListaGenericaController.updateListaGenerica
  )
  .delete(
    "/listagenerica/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["listaGenerica", "destroy"]),
    ListaGenericaController.destroyListaGenerica
  );

export default router;
