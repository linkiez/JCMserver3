import { Router } from 'express';
import ListaGenericaController from '../controllers/listaGenericaController.js';

const router = Router();
router
    .get('/listagenerica', ListaGenericaController.findAllListaGenerica)
    .get('/listagenerica/:id', ListaGenericaController.findOneListaGenerica)
    .post('/listagenerica', ListaGenericaController.createListaGenerica)
    .put('/listagenerica/:id', ListaGenericaController.updateListaGenerica)
    .delete('/listagenerica/:id', ListaGenericaController.destroyListaGenerica);

export default router;
