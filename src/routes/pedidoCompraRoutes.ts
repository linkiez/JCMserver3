import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import PedidoCompraController from "../controllers/pedidoCompraController.js";

const router = Router();
router
  .post(
    "/pedidocompra/import",
    //Authentication.verificaLogin,
    PedidoCompraController.importPedidoCompra
  )
  .post(
    "/pedidocompra",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "create"]),
    PedidoCompraController.createPedidoCompra
  )
  .get(
    "/pedidocompra",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "findAll"]),
    PedidoCompraController.findAllPedidoCompra
  )
  .get(
    "/pedidocompra/item",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "findAll"]),
    PedidoCompraController.findAllPedidoCompraItem
  )
  .get(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "findOne"]),
    PedidoCompraController.findOnePedidoCompra
  )
  .delete(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "destroy"]),
    PedidoCompraController.destroyPedidoCompra
  )
  .put(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidoCompra", "update"]),
    PedidoCompraController.updatePedidoCompra
  );

export default router;
