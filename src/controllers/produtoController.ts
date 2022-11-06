import Produto from "../models/Produto.js";
import { Request, Response } from "express";

export default class ProdutosController {
  static async findAllProdutos(req: Request, res: Response) {
    try {
      const produtos = (await Produto.findAll()) as Array<Produto>;
      return res.status(200).json(produtos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneProduto(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const produto = await Produto.findOne({
        where: { id: Number(id) },
      });
      return res.status(200).json(produto);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findProdutoByName(req: Request, res: Response) {
    const { nome } = req.params;
    try {
      const produto = await Produto.findOne({
        where: { nome: nome },
      });
      return res.status(200).json(produto);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createProduto(req: Request, res: Response) {
    const produto = req.body;
    try {
      const produtoCreated = await Produto.create(produto);
      return res.status(201).json(produtoCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateProduto(req: Request, res: Response) {
    const { id } = req.params;
    const produtoUpdate = req.body;
    delete produtoUpdate.id;
    try {
      await Produto.update(produtoUpdate, { where: { id: Number(id) } });
      const produtoUpdated = await Produto.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(produtoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyProduto(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Produto.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Produto apagado` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllProdutoDeleted(req: Request, res: Response) {
    try {
      const produtos = (await Produto.scope("deleted").findAll({
        paranoid: false,
      })) as Array<Produto>;
      return res.status(200).json(produtos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreProduto(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Produto.restore({ where: { id: Number(id) } });
      const produtoUpdated = await Produto.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(produtoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
