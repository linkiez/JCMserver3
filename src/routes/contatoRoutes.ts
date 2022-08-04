import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import ContatoController from "../controllers/contatoController.js";

const router = Router();
router
  .get(
    "/contato",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "findAll"]),
    ContatoController.findAllContatos
  )
  .get(
    "/contato/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "findAllDelete"]),
    ContatoController.findAllContatoDeleted
  )
  .get(
    "/contato/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "findAllOne"]),
    ContatoController.findOneContato
  )
  .get(
    "/contato/pessoa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "findAllContatoPessoa"]),
    ContatoController.findAllContatoPessoa
  )
  .post(
    "/contato",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "create"]),
    ContatoController.createContato
  )
  .post(
    "/contato/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "restore"]),
    ContatoController.restoreContato
  )
  .put(
    "/contato/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "update"]),
    ContatoController.updateContato
  )
  .delete(
    "/contato/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["contato", "destroy"]),
    ContatoController.destroyContato
  );

export default router;
