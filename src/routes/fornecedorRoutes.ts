import { Router } from 'express';
import FornecedorController from '../controllers/fornecedorController.js';

const router = Router();
router
    .get('/fornecedor', FornecedorController.findAllFornecedors)
    .get('/fornecedor/deleted', FornecedorController.findAllFornecedorDeleted)
    .get('/fornecedor/:id', FornecedorController.findOneFornecedor)
    .post('/fornecedor', FornecedorController.createFornecedor)
    .post('/fornecedor/restore/:id', FornecedorController.restoreFornecedor)
    .put('/fornecedor/:id', FornecedorController.updateFornecedor)
    .delete('/fornecedor/:id', FornecedorController.destroyFornecedor);

    export default router;
