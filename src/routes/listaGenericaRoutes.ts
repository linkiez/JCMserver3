import { Router } from 'express';
import ListaGenericaController from '../controllers/listaGenericaController.js';

const router = Router();
router
    .get('/listaGenerica', ListaGenericaController.findAllListaGenerica)
    .get('/listaGenerica/:id', ListaGenericaController.findOneListaGenerica)
    .post('/listaGenerica', ListaGenericaController.createListaGenerica)
    .put('/listaGenerica/:id', ListaGenericaController.updateListaGenerica)
    .delete('/listaGenerica/:id', ListaGenericaController.destroyListaGenerica);

export default router;
