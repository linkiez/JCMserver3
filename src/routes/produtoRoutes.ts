import { Router } from 'express';
import ProdutosController from '../controllers/produtoController.js';

const router = Router();
router
    //.get('/produto', ProdutosController.findAllProdutos)
    //.get('/produto/id/:id', ProdutosController.findOneProduto)
    //.get('/produto/nome/:nome', ProdutosController.findProdutoByName)
    .post('/produto', ProdutosController.createProduto)
    //.put('/produto/id/:id', ProdutosController.updateProduto)
    //.delete('/produto/id/:id', ProdutosController.destroyProduto);

    export default router;
