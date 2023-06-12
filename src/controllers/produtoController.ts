import Produto from "../models/Produto";
import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import PedidoCompraItem from "../models/PedidoCompraItem";
import PedidoCompra from "../models/PedidoCompra";
import FileDb from "../models/File";
import Produto_File from "../models/Produto_File";
import sequelize from "../config/connPostgre";

export default class ProdutosController {
  static async findAllProdutos(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue || "",
      };

      let resultado: { produtos: Produto[]; totalRecords: Number } = {
        produtos: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        [Op.or]: [
          { nome: { [Op.like]: "%" + consulta.searchValue + "%" } },
          // { espessura: { [Op.like]: "%" + consulta.searchValue + "%" } },
        ],
      };
      if (!isNaN(Number((consulta.searchValue).replace(',','.'))) && consulta.searchValue !== "") {
        queryWhere[Op.or].push({
          espessura: (consulta.searchValue).replace(',','.'),
        });
      }

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      resultado.produtos = await Produto.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        order: [["nome", "ASC"]],
        include: [
          {
            model: PedidoCompraItem,
            attributes: {
              include: [
                [Sequelize.literal("(preco*(ipi+1))"), "precoComIpi"],
                // [Sequelize.fn('max', Sequelize.col('pedido_compra_item.updatedAt')), 'atualizado']
              ],
            },
            order: [["updatedAt", "DESC"]],
            limit: 1,
            separate: true,
            include: [
              {
                model: PedidoCompra,
                required: true,
                where: {
                  status: {
                    [Op.and]: [
                      { [Op.not]: "Cancelado" },
                      { [Op.not]: "Orçamento" },
                    ],
                  },
                  data_emissao: {
                    [Op.gte]: sixMonthsAgo
                  }
                },
              },
            ],
          },
        ],
      });

      resultado.totalRecords = await Produto.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneProduto(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const produto = await Produto.findOne({
        where: { id: Number(id) },
        include: [
          FileDb,
          {
            model: PedidoCompraItem,
            attributes: {
              include: [
                [Sequelize.literal("(preco*(ipi+1))"), "precoComIpi"],
                // [Sequelize.fn('max', Sequelize.col('pedido_compra_item.updatedAt')), 'atualizado']
              ],
            },
            order: [["updatedAt", "DESC"]],
            limit: 5,
            separate: true,
            include: [
              {
                model: PedidoCompra,
                required: true,
                where: {
                  status: {
                    [Op.and]: [
                      { [Op.not]: "Cancelado" },
                      { [Op.not]: "Orçamento" },
                    ],
                  },
                },
              },
            ],
          },
        ],
      });
      return res.status(200).json(produto);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findProdutoByName(req: Request, res: Response) {
    const { nome } = req.body;
    try {
      const produto = await Produto.findOne({
        where: { nome: nome },
      });
      return res.status(200).json(produto);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createProduto(req: Request, res: Response) {
    try {
      const produto = req.body;
      const transaction = await sequelize.transaction();

      let files: Array<FileDb> = produto.files;
      delete produto.files;

      let fila: Promise<any>[] = [];

      const produtoCreated = await Produto.create(produto, {
        transaction: transaction,
      });

      if (files) {
        fila.push(
          produtoCreated.setFiles(
            files.map((item) => item.id),
            { transaction: transaction }
          )
        );
      }

      Promise.all(fila).then(async () => {
        await transaction.commit();

        const produtoCreated2 = await Produto.findOne({
          where: { id: Number(produtoCreated.id) },
          include: [FileDb],
        });

        return res.status(201).json(produtoCreated2);
      });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateProduto(req: Request, res: Response) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    const produto = req.body;
    delete produto.id;

    let files: Array<FileDb> = produto.files;
    delete produto.files;

    if (files)
      files.forEach(async (file: FileDb) => {
        await Produto_File.findOrCreate({
          where: { produtoId: id, fileId: file.id },
          transaction: transaction,
        });
      });

    try {
      await Produto.update(produto, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      await transaction.commit();

      const produtoUpdated = await Produto.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(produtoUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyProduto(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Produto.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Produto apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
