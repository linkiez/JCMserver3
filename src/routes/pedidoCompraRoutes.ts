import { Router } from "express";
import PedidoCompraController from "../controllers/pedidoCompraController";

const router = Router();
router
  .post("/pedidocompra/import", PedidoCompraController.importPedidoCompra)
  .post("/pedidocompra", PedidoCompraController.createPedidoCompra)
  .get("/pedidocompra", PedidoCompraController.findAllPedidoCompra)
  .get("/pedidocompra/:id", PedidoCompraController.findOnePedidoCompra)
  .delete("/pedidocompra/:id", PedidoCompraController.destroyPedidoCompra)
  .put("/pedidocompra/:id", PedidoCompraController.updatePedidoCompra);

export default router;
