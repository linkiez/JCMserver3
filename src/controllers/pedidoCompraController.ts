import sequelize from "../config/connPostgre";
import { Request, Response } from "express";
import Fornecedor from "../models/Fornecedor";
import Produto from "../models/Produto";
import PedidoCompra from "../models/PedidoCompra";
import PedidoCompraItem from "../models/PedidoCompraItem";
import Pessoa from "../models/Pessoa";
import { Op, where } from "sequelize";
import Contato from "../models/Contato";
import File from "../models/File";
import PedidoCompra_File from "../models/PedidoCompra_File";
import FileDb from "../models/File";
import RegistroInspecaoRecebimento from "../models/RIR";

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
      console.log("Resquest: ", req.body, "Erro: ", error);
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

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

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
                paranoid: false,
              },
            ],
            paranoid: false,
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllPedidoCompraIQF(req: Request, res: Response) {
    try {
      const consulta = {
        fornecedor: req.query.fornecedor,
        ano: req.query.ano ? new Date(`${req.query.ano}-01-01`) : new Date(),
      };

      let queryWhere: any = {
        data_emissao: {
          [Op.gte]: consulta.ano,
          [Op.lte]: new Date(`${consulta.ano.getFullYear()+1}-12-31`),
        },
        status: {
          [Op.and]: { [Op.not]: ["Aprovado", "Orçamento", "Cancelado"] },
        },
      };

      if (
        consulta.fornecedor !== undefined &&
        consulta.fornecedor !== "undefined" &&
        consulta.fornecedor !== ""
      ) {
        queryWhere = {
          ...queryWhere,
          id_fornecedor: consulta.fornecedor,
        };
      }

      const pedidosCompra = await PedidoCompra.findAll({
        where: queryWhere,
        include: [
          {
            model: PedidoCompraItem,
          },
        ],
        order: [["id", "DESC"]],
        attributes: {
          include: [
            [
              sequelize.literal(
                `(SELECT SUM(peso) FROM pedido_compra_item WHERE pedido_compra_item.id_pedido = pedido_compra.id AND pedido_compra_item."deletedAt" IS NULL)`
              ),
              "peso",
            ],
            [
              sequelize.literal(
                `(SELECT SUM(peso_entregue) FROM pedido_compra_item WHERE pedido_compra_item.id_pedido = pedido_compra.id AND pedido_compra_item."deletedAt" IS NULL)`
              ),
              "peso_entregue",
            ],
            [
              sequelize.literal(
                `CASE WHEN (SUM(pedido_compra_items.peso_entregue) / SUM(pedido_compra_items.peso)) * 100 > 100 THEN 100 ELSE (SUM(pedido_compra_items.peso_entregue) / SUM(pedido_compra_items.peso)) * 100 END`
              ),
              "percentual_entregue",
            ],
          ],
        },
        group: ["pedido_compra.id", "pedido_compra_items.id"],
      });

      interface Resultado {
        mes: number;
        pedidosCompra: PedidoCompra[];
        total: number;
        peso: number;
        pesoEntregue: number;
      }

      let resultados: Resultado[] = [];

      for (let i = 1; i <= 12; i++) {
        resultados.push({
          mes: i,
          pedidosCompra: [],
          total: 0,
          peso: 0,
          pesoEntregue: 0,
        });
      }

      function filterPedidosCompra(mes: number) {
        return pedidosCompra.filter((pedidoCompra: PedidoCompra) => {
          return new Date(pedidoCompra.data_emissao).getMonth() === mes;
        });
      }

      for (let resultado of resultados) {
        resultado.pedidosCompra = filterPedidosCompra(resultado.mes);

        resultado.peso = resultado.pedidosCompra.reduce(
          (total: number, pedidoCompra: PedidoCompra) => {
            return (
              total +
              pedidoCompra.pedido_compra_items.reduce(
                (total: number, pedidoCompraItem: PedidoCompraItem) => {
                  return total + pedidoCompraItem.peso;
                },
                0
              )
            );
          },
          0
        );

        resultado.pesoEntregue = resultado.pedidosCompra.reduce(
          (total: number, pedidoCompra: PedidoCompra) => {
            return (
              total +
              pedidoCompra.pedido_compra_items.reduce(
                (total: number, pedidoCompraItem: PedidoCompraItem) => {
                  return total + pedidoCompraItem.peso_entregue;
                },
                0
              )
            );
          },
          0
        );

        resultado.total = resultado.pesoEntregue / resultado.peso;
      }

      return res.status(200).json(resultados);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
            include: [
              {
                model: Pessoa,
                include: [{ model: Contato, paranoid: false }],
                paranoid: false,
              },
            ],
            paranoid: false,
          },
          {
            model: PedidoCompraItem,
            include: [
              { model: Produto, paranoid: false },
              RegistroInspecaoRecebimento,
            ],
          },
          File,
        ],
      });

      return res.status(200).json(pedidoCompra);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
        for (let item of pedidoCompraItem) {
          item.id_pedido = pedidoCompraCreated.id;

          item.id_produto = item.produto!.id;
          delete item.produto;

          await PedidoCompraItem.create(item, {
            transaction: transaction,
          });
        }
      }

      if (files) {
        await pedidoCompraCreated.setFiles(
          files.map((item) => item.id),
          { transaction: transaction }
        );
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
      console.log("Resquest: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
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

      fila.push(
        PedidoCompra.update(pedidoCompra, {
          where: { id: Number(id) },
          transaction: transaction,
        })
      );

      files.forEach(async (file: File) => {
        fila.push(
          PedidoCompra_File.findOrCreate({
            where: { pedidoCompraId: id, fileId: file.id },
            transaction: transaction,
          })
        );
      });

      if (pedidoCompraItem) {
        let pedidoCompraItemDeleted = await PedidoCompraItem.findAll({
          where: { id_pedido: Number(id) },
        });

        for (let ItemToFind of pedidoCompraItemDeleted) {
          if (
            !pedidoCompraItem.find((item: any) => item.id === ItemToFind.id)
          ) {
            fila.push(
              PedidoCompraItem.destroy({
                where: { id: ItemToFind.id },
                transaction: transaction,
              })
            );
          }
        }

        pedidoCompraItem.forEach((item: any) => {
          item.id_pedido = Number(id);
          item.id_produto = item.produto!.id;
          delete item.produto;

          if (item.id) {
            fila.push(
              PedidoCompraItem.update(item, {
                where: { id: item.id },
                transaction: transaction,
              })
            );
          } else {
            fila.push(
              PedidoCompraItem.create(item, { transaction: transaction })
            );
          }
        });
      }

      Promise.all(fila).then(async () => {
        await transaction.commit();

        pedidoCompraUpdated = await PedidoCompra.findOne({
          where: { id: Number(id) },
          include: [
            {
              model: Fornecedor,
              include: [
                {
                  model: Pessoa,
                  include: [{ model: Contato, paranoid: false }],
                  paranoid: false,
                },
              ],
              paranoid: false,
            },
            { model: PedidoCompraItem, include: [Produto] },
          ],
        });

        return res.status(202).json(pedidoCompraUpdated);
      });
    } catch (error: any) {
      transaction.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllPedidoCompraItem(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        produto: req.query.produto,
        fornecedor: req.query.fornecedor,
      };

      let resultado: {
        pedidosCompraItem: PedidoCompraItem[];
        totalRecords: Number;
      } = {
        pedidosCompraItem: [],
        totalRecords: 0,
      };

      const include = [
        {
          model: PedidoCompra,
          required: true,
          where: {
            id_fornecedor:
              consulta.fornecedor !== "undefined"
                ? consulta.fornecedor
                : undefined,
          },
        },
        {
          model: Produto,
          required: true,
          where: {
            id: consulta.produto !== "undefined" ? consulta.produto : undefined,
          },
          paranoid: false,
        },
      ];

      resultado.pedidosCompraItem = await PedidoCompraItem.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        paranoid: req.query.deleted === "true" ? false : true,
        include: include,
        order: [["id", "DESC"]],
      });

      resultado.totalRecords = await PedidoCompraItem.count({
        include: include,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async restorePedidoCompra(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await PedidoCompra.restore({ where: { id: Number(id) } });
      const pedidoCompraUpdated = await PedidoCompra.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(pedidoCompraUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
