import { Router } from "express";
import { Authentication } from "../controllers/authController";
import PedidoCompraController from "../controllers/pedidoCompraController";

const router = Router();
router
  .post(
    "/pedidocompra/import",
    Authentication.verificaLogin,
    PedidoCompraController.importPedidoCompra
  )
  .post(
    "/pedidocompra",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidocompra", "create"]),
    PedidoCompraController.createPedidoCompra
  )
  .get(
    "/pedidocompra",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidocompra", "findAll"]),
    PedidoCompraController.findAllPedidoCompra
  )
  .get(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidocompra", "findOne"]),
    PedidoCompraController.findOnePedidoCompra
  )
  .delete(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidocompra", "destroy"]),
    PedidoCompraController.destroyPedidoCompra
  )
  .put(
    "/pedidocompra/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["pedidocompra", "update"]),
    PedidoCompraController.updatePedidoCompra
  );

export default router;
