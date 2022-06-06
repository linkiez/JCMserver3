import { Router } from 'express';
import ProdutosController from '../controllers/produtoController.js';

const router = Router();
router
    .get('/produto', ProdutosController.findAllProdutos)
    .get('/produto/deleted', ProdutosController.findAllProdutoDeleted)
    .get('/produto/:id', ProdutosController.findOneProduto)
    .get('/produto/nome/:nome', ProdutosController.findProdutoByName)
    .post('/produto', ProdutosController.createProduto)
    .post('/produto/restore/:id', ProdutosController.restoreProduto)
    .put('/produto/:id', ProdutosController.updateProduto)
    .delete('/produto/:id', ProdutosController.destroyProduto);

    export default router;
