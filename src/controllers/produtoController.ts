import Produto from "../models/Produto.js";
import { Request, Response } from "express";
import { Op } from "sequelize";

export default class ProdutosController {
  static async findAllProdutos(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { produtos: Produto[]; totalRecords: Number } = {
        produtos: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        [Op.or]: [
          { nome: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { espessura: { [Op.like]: "%" + consulta.searchValue + "%" } },
        ]
      };
      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      resultado.produtos = await Produto.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted==='true'?false:true
      });

      resultado.totalRecords = await Produto.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted==='true'?false:true
      });

     
      return res.status(200).json(resultado);
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
