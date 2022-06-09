import { Router } from 'express';
import FileController from '../controllers/fileController.js';

const router = Router();
router
    .get('/file', FileController.findAllFiles)
    .get('/file/:id', FileController.findOneFile)
    .get('/file/deleted', FileController.findAllFileDeleted)
    .post('/file', FileController.createFile)
    .post('/file/restore/:id', FileController.restoreFile)
    .delete('/file/:id', FileController.destroyFile)

    export default router;
