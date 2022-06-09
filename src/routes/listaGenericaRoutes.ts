import { Router } from 'express';
import ListaGenericaController from '../controllers/listaGenericaController.js';

const router = Router();
router
    .get('/listagenerica', ListaGenericaController.findAllListaGenerica)
    .get('/listagenerica/deleted', ListaGenericaController.findAllListaGenericaDeleted)
    .get('/listagenerica/:id', ListaGenericaController.findOneListaGenerica)
    .post('/listagenerica', ListaGenericaController.createListaGenerica)
    .post('/listagenerica/restore/:id', ListaGenericaController.restoreListaGenerica)
    .put('/listagenerica/:id', ListaGenericaController.updateListaGenerica)
    .delete('/listagenerica/:id', ListaGenericaController.destroyListaGenerica);

export default router;
