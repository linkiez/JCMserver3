import { Express } from "express";
import produto from "./produtoRoutes.js";

export function routes(app: Express) {
  app.use(
    //Routas Aqui
    produto
  );
}
