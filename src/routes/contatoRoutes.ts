import { Router } from 'express';
import ContatoController from '../controllers/contatoController.js';

const router = Router();
router
    .get('/contato', ContatoController.findAllContatos)
    .get('/contato/:id', ContatoController.findOneContato)
    .post('/contato', ContatoController.createContato)
    .put('/contato/:id', ContatoController.updateContato)
    .delete('/contato/:id', ContatoController.destroyContato);

    export default router;
