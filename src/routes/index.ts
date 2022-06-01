import { Express } from "express";
import produto from "./produtoRoutes.js";
import pessoa from './pessoaRoutes.js'

export function routes(app: Express) {
  app.use(
    //Routas Aqui
    produto,
    pessoa
  );
}
