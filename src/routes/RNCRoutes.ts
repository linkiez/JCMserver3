import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import RNCController from "../controllers/RNCController";

const router = Router();

router
  .get("/rnc", Authentication.verificaLogin, RNCController.findAllRNC)
  .get("/rnc/:id", Authentication.verificaLogin, RNCController.findOneRNC)
  .post("/rnc", Authentication.verificaLogin, RNCController.createRNC)
  .put("/rnc/:id", Authentication.verificaLogin, RNCController.updateRNC)
  .delete("/rnc/:id", Authentication.verificaLogin, RNCController.deleteRNC);

  export default router;
