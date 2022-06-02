import Produto from "../models/Produto.js";
import { ProdutoType } from "../types/index.js";
import { Request, Response } from "express";

export default class ProdutosController {
  static async findAllProdutos(req: Request, res: Response) {
    try {
      const produtos = await Produto.findAll();
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
    const produto: ProdutoType = req.body;
    try {
      console.log(Object.keys(produto));
      const produtoCreated = await Produto.create(produto);
      return res.status(201).json(produtoCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateProduto(req: Request, res: Response) {
    const { id } = req.params;
    const produtoUpdate: ProdutoType = req.body;
    try{
        await Produto.update(produtoUpdate, {where:{ id: Number(id) }});
        const produtoUpdated = await Produto.findOne({where:{ id: Number(id) }});
        return res.status(202).json(produtoUpdated);
    }catch(error:any){
        console.log(error);
        return res.status(500).json(error.message);
    }
}

static async destroyProduto(req: Request, res: Response) {
    const { id } = req.params;
    try{
        await Produto.destroy({where:{ id: Number(id) }});
        return res.status(202).json({message: `Produto apagado`});
    }catch(error:any){
        console.log(error);
        return res.status(500).json(error.message);
    }
}

}
