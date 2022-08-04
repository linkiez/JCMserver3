import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import PessoasController from "../controllers/pessoaController.js";

const router = Router();
router
  .get(
    "/pessoa",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "findAll"]),
    PessoasController.findAllPessoas
  )
  .get(
    "/pessoa/deleted/",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "findAllDeleted"]),
    PessoasController.findAllPessoasDeleted
  )
  .get(
    "/pessoa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "findOne"]),
    PessoasController.findOnePessoa
  )
  .get(
    "/pessoa/nome/:nome",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "findByName"]),
    PessoasController.findPessoaByName
  )
  .post(
    "/pessoa",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "create"]),
    PessoasController.createPessoa
  )
  .post(
    "/pessoa/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "restore"]),
    PessoasController.restorePessoa
  )
  .put(
    "/pessoa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "update"]),
    PessoasController.updatePessoa
  )
  .delete(
    "/pessoa/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pessoa", "destroy"]),
    PessoasController.destroyPessoa
  );

export default router;
