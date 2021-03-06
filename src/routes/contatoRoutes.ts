import { Router } from 'express';
import ContatoController from '../controllers/contatoController.js';

const router = Router();
router
    .get('/contato', ContatoController.findAllContatos)
    .get('/contato/deleted', ContatoController.findAllContatoDeleted)
    .get('/contato/:id', ContatoController.findOneContato)
    .get('/contato/pessoa/:id', ContatoController.findAllContatoPessoa)
    .post('/contato', ContatoController.createContato)
    .post('/contato/restore/:id', ContatoController.restoreContato)
    .put('/contato/:id', ContatoController.updateContato)
    .delete('/contato/:id', ContatoController.destroyContato);

    export default router;
