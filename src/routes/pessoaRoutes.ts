import { Router } from 'express';
import PessoasController from '../controllers/pessoaController.js';

const router = Router();
router
    .get('/pessoa', PessoasController.findAllPessoas)
    .get('/pessoa/:id', PessoasController.findOnePessoa)
    .get('/pessoa/nome/:nome', PessoasController.findPessoaByName)
    .post('/pessoa', PessoasController.createPessoa)
    .put('/pessoa/:id', PessoasController.updatePessoa)
    .delete('/pessoa/:id', PessoasController.destroyPessoa);

    export default router;
