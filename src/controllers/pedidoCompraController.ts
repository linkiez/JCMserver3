import sequelize from "../config/connMySql.js";
import { Request, Response } from "express";
import Fornecedor from "../models/Fornecedor.js";
import Produto from "../models/Produto.js";
import PedidoCompra from "../models/PedidoCompra.js";
import PedidoCompraItem from "../models/PedidoCompraItem.js";
import Pessoa from "../models/Pessoa.js";
import { Op, where } from "sequelize";
import Contato from "../models/Contato.js";
import File from "../models/File.js";
import PedidoCompra_File from "../models/PedidoCompra_File.js";
import FileDb from "../models/File.js";


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
          if (produto) {
            item.id_produto = produto.id;
          }
          delete item.produto;
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
        nome: { [Op.like]: "%" + consulta.searchValue + "%" },
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      console.log(consulta.searchValue);

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
                model: Pessoa,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
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
        include: [
          {
            model: Fornecedor,
            include: [{ model: Pessoa, include: [Contato] }],
          },
          { model: PedidoCompraItem, include: [Produto] },
          File
        ],
      });

      return res.status(200).json(pedidoCompra);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createPedidoCompra(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    

    try {
      let pedidoCompra = req.body;

      let files: Array<FileDb> = pedidoCompra.files;
      delete pedidoCompra.files;

      if (pedidoCompra.fornecedor) {
        pedidoCompra.id_fornecedor = pedidoCompra.fornecedor.id;
        delete pedidoCompra.fornecedor;
      }

      let pedidoCompraItem = pedidoCompra.pedido_compra_items;
      delete pedidoCompra.pedido_compra_items;

      pedidoCompra.data_emissao = new Date();

      let pedidoCompraCreated = await PedidoCompra.create(pedidoCompra, {
        transaction: transaction,
      });

      if (pedidoCompraItem) {
        pedidoCompraItem.map(async (item: any) => {
          item.id_pedido = pedidoCompraCreated.id;

          item.id_produto = item.produto!.id;
          delete item.produto;

          let itemCreated = await PedidoCompraItem.create(item, {
            transaction: transaction,
          });
          return itemCreated;
        });
      }

      if (files) {
          await pedidoCompraCreated.setFiles(
            files.map((item) => item.id),
            { transaction: transaction }
          )
      }

      await transaction.commit();

      const pedidoCompraCreated2 = await PedidoCompra.findOne({
        where: { id: Number(pedidoCompraCreated.id) },
        include: [
          {
            model: Fornecedor,
            include: [{ model: Pessoa, include: [Contato] }],
          },
          { model: PedidoCompraItem, include: [Produto] },
        ],
      });

      return res.status(201).json(pedidoCompraCreated2);
    } catch (error: any) {
      await transaction.rollback();
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

    const transaction = await sequelize.transaction();

    try {
      let pedidoCompra = req.body;

      let pedidoCompraItem = pedidoCompra.pedido_compra_items;
      delete pedidoCompra.pedido_compra_items;

      if (pedidoCompra.fornecedor) {
        pedidoCompra.id_fornecedor = pedidoCompra.fornecedor.id;
        delete pedidoCompra.fornecedor;
      }

      let files: Array<File> = pedidoCompra.files;
      delete pedidoCompra.files;

      let fila: Promise<any>[] = [];

      fila.push(PedidoCompra.update(pedidoCompra, {
        where: { id: Number(id) },transaction: transaction
      })) 

      fila.push(PedidoCompraItem.destroy({
        where: { id_pedido: Number(id) },
        transaction: transaction,
      }))
      
      files.forEach(async (file: File) => {
        fila.push(
          PedidoCompra_File.findOrCreate({
            where: { pedidoCompraId: id, fileId: file.id },
            transaction: transaction,
          })
        );
      });

      if (pedidoCompraItem) {
        pedidoCompraItem.forEach((item: any) => {
          item.id_pedido = Number(id);
          item.id_produto = item.produto!.id;
          delete item.produto;
          delete item.id;

          fila.push(PedidoCompraItem.create(item, { transaction: transaction })) ;
        });
      }

      Promise.all(fila).then(async ()=> {
        await transaction.commit();
      
        pedidoCompraUpdated = await PedidoCompra.findOne({
          where: { id: Number(id) },
          include: [
            {
              model: Fornecedor,
              include: [{ model: Pessoa, include: [Contato] }],
            },
            { model: PedidoCompraItem, include: [Produto] },
          ],
        });
  
        return res.status(202).json(pedidoCompraUpdated);
      
      })

    } catch (error: any) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
