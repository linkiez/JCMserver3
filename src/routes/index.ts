import { Express } from "express";
import produto from "./produtoRoutes.js";
import pessoa from './pessoaRoutes.js';
import fornecedor from './fornecedorRoutes.js';
import contato from './contatoRoutes.js'
import listaGenerica from './listaGenericaRoutes.js'
import file from './fileRoutes.js'

export function routes(app: Express) {
  app.use(
    //Routas Aqui
    produto,
    pessoa,
    contato,
    fornecedor,
    listaGenerica,
    file
  );
}
