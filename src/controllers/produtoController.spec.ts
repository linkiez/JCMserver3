import ProdutosController from "./produtoController";
import { getMockReq, getMockRes } from "@jest-mock/express";
import sequelize from "../config/connMySql";
import { models } from "../models/index";
import httpMocks from "node-mocks-http";
import { Response as Res } from "express";

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
    const req = httpMocks.createRequest({body: produto});

    let res = { status: jest.fn(), json: jest.fn()} as any;

    const produtoCreated = await ProdutosController.createProduto(req, res);


      expect(res.json).toBeCalledWith(produto);
  });
});
