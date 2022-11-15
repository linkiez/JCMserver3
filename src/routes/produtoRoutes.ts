import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import ProdutosController from "../controllers/produtoController.js";

const router = Router();
router
  .get(
    "/produto",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "findAll"]),
    ProdutosController.findAllProdutos
  )
  .get(
    "/produto/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "findOne"]),
    ProdutosController.findOneProduto
  )
  .get(
    "/produto/nome/:nome",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "findByName"]),
    ProdutosController.findProdutoByName
  )
  .post(
    "/produto",
    // Authentication.verificaLogin,
    // Authentication.verificaAcesso(["produto", "create"]),
    ProdutosController.createProduto
  )
  .post(
    "/produto/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "restore"]),
    ProdutosController.restoreProduto
  )
  .put(
    "/produto/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "update"]),
    ProdutosController.updateProduto
  )
  .delete(
    "/produto/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["produto", "destroy"]),
    ProdutosController.destroyProduto
  );

export default router;
