import { Produto } from "../models/index.js";
import { ProdutoType } from "../types";
import { Request, Response, NextFunction } from "express";

export default class ProdutosController {
  static async createProduto(req: Request, res: Response) {
    const produto = req.body;
    try {
      console.log(Object.keys(produto));
      const produtoCreated = await Produto.create(produto);
      return res.status(201).json(produtoCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
