import { Router } from "express";
import { Authentication } from "../controllers/authController.js";
import FileController from "../controllers/fileController.js";

const router = Router();
router
  .get(
    "/file",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "findAll"]),
    FileController.findAllFiles
  )
  .get(
    "/file/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "findOne"]),
    FileController.findOneFile
  )
  .get("/file/url/:id", Authentication.verificaLogin, FileController.getUrlFile)
  .get(
    "/file/deleted",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "findAllDeleted"]),
    FileController.findAllFileDeleted
  )
  .post(
    "/file",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "create"]),
    FileController.createFile
  )
  .post(
    "/file/restore/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "restore"]),
    FileController.restoreFile
  )
  .delete(
    "/file/:id",
    Authentication.verificaLogin,
    Authentication.verificaAcesso(["file", "destroy"]),
    FileController.destroyFile
  );

export default router;
