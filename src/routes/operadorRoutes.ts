import { Router } from 'express';
import OperadorController from '../controllers/operadorController.js';

const router = Router();
router
    .get('/operador', OperadorController.findAllOperadors)
    .get('/operador/deleted', OperadorController.findAllOperadorDeleted)
    .get('/operador/:id', OperadorController.findOneOperador)
    .post('/operador', OperadorController.createOperador)
    .post('/operador/restore/:id', OperadorController.restoreOperador)
    .put('/operador/:id', OperadorController.updateOperador)
    .delete('/operador/:id', OperadorController.destroyOperador);

    export default router;
