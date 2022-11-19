import sequelize from "../config/connMySql.js";
import { Request, Response } from "express";
import Fornecedor from "../models/Fornecedor.js";
import Produto from "../models/Produto.js";
import PedidoCompra from "../models/PedidoCompra.js";
import PedidoCompraItem from "../models/PedidoCompraItem.js";
import Pessoa from "../models/Pessoa.js";
import { Op, where } from "sequelize";

export default class PedidoCompraController {
  static async importPedidoCompra(req: Request, res: Response) {
    let pedidoCompra = req.body;

    try {
      let itens = pedidoCompra.itens;
      delete pedidoCompra.itens;

      let pessoa = await Pessoa.findOne({
        where: { nome: pedidoCompra.Fornecedor },
        include: [Fornecedor],
      });
      delete pedidoCompra.Fornecedor;
      pedidoCompra.id_fornecedor = pessoa!.fornecedor.id;

      let pedidoCompraCreated = await PedidoCompra.create(pedidoCompra);

      if (itens) {
        itens.forEach(async (item: any) => {
          let produto = await Produto.findOne({
            where: { nome: item.produto },
          });
          delete item.produto;
          item.id_produto = produto!.id;
          item.id_pedido = pedidoCompraCreated.id;

          let itemCreated = await PedidoCompraItem.create(item);
          return itemCreated;
        });
      }

      const pedidoCompraCreated2 = await PedidoCompra.findOne({
        where: { id: pedidoCompraCreated.id },
        include: [Fornecedor, PedidoCompraItem],
      });

      return res.status(201).json(pedidoCompraCreated2);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllPedidoCompra(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { pedidosCompra: PedidoCompra[]; totalRecords: Number } = {
        pedidosCompra: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        [Op.or]: [{ pedido: { [Op.like]: "%" + consulta.searchValue + "%" } }],
      };

      let queryWherePessoa = {
        nome: {[Op.like]: "%" + consulta.searchValue + "%",}
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      console.log(consulta.searchValue)

      resultado.pedidosCompra = await PedidoCompra.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: [
          {
            model: Fornecedor,
            include: [
              {
                model: Pessoa
              },
            ],
          },
        ],
        order: [['id', 'DESC']]
      });

      resultado.totalRecords = await PedidoCompra.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOnePedidoCompra(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let pedidoCompra = await PedidoCompra.findOne({
        where: { id: Number(id) },
        include: [Fornecedor, { model: PedidoCompraItem, include: [Produto] }],
      });

      let pedidoCompraItem = await PedidoCompraItem.findAll({
        where: { id_pedido: Number(id) },
      });

      let total = 0;

      pedidoCompraItem.forEach((pedidoItem) => {
        total =
          total +
          Number(pedidoItem.peso) *
            Number(pedidoItem.preco) *
            (1 + Number(pedidoItem.ipi));
      });

      pedidoCompra!.total = total;

      return res.status(200).json(pedidoCompra);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createPedidoCompra(req: Request, res: Response) {
    const t = await sequelize.transaction();

    try {
      let pedidoCompra = req.body;

      if (pedidoCompra.Fornecedor) {
        pedidoCompra.id_fornecedor = pedidoCompra.Fornecedor.id;
        delete pedidoCompra.Fornecedor;
      }

      let pedidoCompraItem = pedidoCompra.PedidoCompraItem;
      delete pedidoCompra.PedidoCompraItem;

      pedidoCompra.data_emissao = new Date();

      let pedidoCompraCreated = await PedidoCompra.create(pedidoCompra);

      if (pedidoCompraItem) {
        pedidoCompraItem.map(async (item: any) => {
          item.id_pedido = pedidoCompraCreated.id;

          item.id_produto = item.Produto!.id;
          delete item.Produto;

          let itemCreated = await PedidoCompraItem.create(item);
          return itemCreated;
        });
      }

      await t.commit();

      const pedidoCompraCreated2 = await PedidoCompra.findOne({
        where: { id: pedidoCompraCreated.id },
        include: [Fornecedor, { model: PedidoCompraItem, include: [Produto] }],
      });

      return res.status(201).json(pedidoCompraCreated2);
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyPedidoCompra(req: Request, res: Response) {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
      await PedidoCompraItem.destroy({
        where: { id_pedido: Number(id) },
      });
      await PedidoCompra.destroy({ where: { id: Number(id) } });

      await t.commit();

      return res.status(202).json({ message: `Pedido de compra apagado` });
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updatePedidoCompra(req: Request, res: Response) {
    let pedidoCompraUpdated;

    const { id } = req.params;

    const t = await sequelize.transaction();

    try {
      let pedidoCompra = req.body;

      let pedidoCompraItem = pedidoCompra.PedidoCompraItem;
      delete pedidoCompra.PedidoCompraItem;

      if (pedidoCompra.Fornecedor) {
        pedidoCompra.id_fornecedor = pedidoCompra.Fornecedor.id;
        delete pedidoCompra.Fornecedor;
      }

      await PedidoCompra.update(pedidoCompra, {
        where: { id: Number(id) },
      });

      await PedidoCompraItem.destroy({
        where: { id_pedido: Number(id) },
      });
      if (pedidoCompraItem) {
        pedidoCompraItem.forEach(async (item: any) => {
          item.id_pedido = Number(id);
          item.id_produto = item.Produto!.id;
          delete item.Produto;
          delete item.id;

          await PedidoCompraItem.create(item);
        });
      }

      await t.commit();

      pedidoCompraUpdated = await PedidoCompra.findOne({
        where: { id: id },
        include: [Fornecedor, { model: PedidoCompraItem, include: [Produto] }],
      });

      return res.status(202).json(pedidoCompraUpdated);
    } catch (error: any) {
      await t.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
