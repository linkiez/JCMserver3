import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import VendedorController from "../controllers/vendedorController.js";

const router = Router();
router
  .get(
    "/vendedor",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "findAll"]),
    VendedorController.findAllVendedors
  )
  .get(
    "/vendedor/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "findAllDeleted"]),
    VendedorController.findAllVendedorDeleted
  )
  .get(
    "/vendedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "findOne"]),
    VendedorController.findOneVendedor
  )
  .post(
    "/vendedor",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "create"]),
    VendedorController.createVendedor
  )
  .post(
    "/vendedor/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "restore"]),
    VendedorController.restoreVendedor
  )
  .put(
    "/vendedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "update"]),
    VendedorController.updateVendedor
  )
  .delete(
    "/vendedor/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["vendedor", "destroy"]),
    VendedorController.destroyVendedor
  );

export default router;
