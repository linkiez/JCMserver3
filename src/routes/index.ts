import { Express } from "express";
import produto from "./produtoRoutes";
import pessoa from './pessoaRoutes';
import fornecedor from './fornecedorRoutes';
import contato from './contatoRoutes'
import listaGenerica from './listaGenericaRoutes'
import file from './fileRoutes'
import usuario from './usuarioRoutes'
import vendedor from './vendedorRoutes'
import orcamento from './orcamentoRoutes'
import operador from './operadorRoutes'
import rir from './RIRRoutes'
import auth from './authRoutes'
import ordemProducao from './ordemProducaoRoutes'
import pedidoCompra from './pedidoCompraRoutes';

export function routes(app: Express) {

  app.use(
    //Routas Aqui
    produto,
    pessoa,
    contato,
    fornecedor,
    listaGenerica,
    file,
    usuario,
    vendedor,
    orcamento,
    operador,
    rir,
    auth,
    ordemProducao,
    pedidoCompra
  );
}
