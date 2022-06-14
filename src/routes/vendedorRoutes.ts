import { Router } from 'express';
import VendedorController from '../controllers/vendedorController.js';

const router = Router();
router
    .get('/vendedor', VendedorController.findAllVendedors)
    .get('/vendedor/deleted', VendedorController.findAllVendedorDeleted)
    .get('/vendedor/:id', VendedorController.findOneVendedor)
    .post('/vendedor', VendedorController.createVendedor)
    .post('/vendedor/restore/:id', VendedorController.restoreVendedor)
    .put('/vendedor/:id', VendedorController.updateVendedor)
    .delete('/vendedor/:id', VendedorController.destroyVendedor);

    export default router;
