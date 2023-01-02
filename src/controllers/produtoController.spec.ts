import ProdutosController from "./produtoController";
import { getMockReq, getMockRes } from "@jest-mock/express";
import sequelize from "../config/connMySql";
import { models } from "../models/index";

describe("produtoController", () => {
  beforeAll( () => {
    
    models();
    
  });

  it("#createProduto should create a produto", async () => {
    await sequelize.sync({ force: true })
    const produto = {
      nome: "Tubo",
      Categoria: "Perfil",
      espessura: "2",
      peso: "8",
    };
    const req = getMockReq({ body: produto });

     const { res } = getMockRes();

    const produtoCreated = await ProdutosController.createProduto(req, res);

      expect(produtoCreated).toEqual(produto);
  });
});
