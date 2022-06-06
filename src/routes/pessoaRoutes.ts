import { Router } from 'express';
import PessoasController from '../controllers/pessoaController.js';

const router = Router();
router
    .get('/pessoa', PessoasController.findAllPessoas)
    .get('/pessoa/deleted/', PessoasController.findAllPessoasDeleted)
    .get('/pessoa/:id', PessoasController.findOnePessoa)
    .get('/pessoa/nome/:nome', PessoasController.findPessoaByName)
    .post('/pessoa', PessoasController.createPessoa)
    .post('/pessoa/restore/:id', PessoasController.restorePessoa)
    .put('/pessoa/:id', PessoasController.updatePessoa)
    .delete('/pessoa/:id', PessoasController.destroyPessoa);

    export default router;
