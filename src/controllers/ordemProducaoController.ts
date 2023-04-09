import sequelize from "../config/connPostgre";
import { Request, Response } from "express";
import OrdemProducao from "../models/OrdemProducao";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import OrdemProducaoItemProcesso from "../models/OrdemProducaoItemProcesso";
import Vendedor from "../models/Vendedor";
import FileDb from "../models/File";
import Orcamento from "../models/Orcamento";
import Empresa from "../models/Empresa";
import Pessoa from "../models/Pessoa";
import Produto from "../models/Produto";
import { Op } from "sequelize";
import VendaTiny from "../models/VendaTiny";

export default class OrdemProducaoController {
  static async findAllOrdemProducao(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { ordemProducao: OrdemProducao[]; totalRecords: Number } = {
        ordemProducao: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        // [Op.or]: [{ id: { [Op.like]: "%" + consulta.searchValue + "%" } }],
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };
      
      resultado.ordemProducao = await OrdemProducao.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: [
          {
            model: Vendedor,
            include: [{ model: Pessoa }],
          },
          {
            model: Orcamento,
            include: [{ model: Pessoa }],
          },
          VendaTiny
        ],
        order: [["id", "DESC"]],
      });

      resultado.totalRecords = await OrdemProducao.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllOrdemProducaoDeleted(req: Request, res: Response) {
    try {
      const orçamentos = await OrdemProducao.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(orçamentos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneOrdemProducao(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let ordemProducao = await OrdemProducao.findByPk(id, {
        include: [
          {
            model: Vendedor,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
          {
            model: Orcamento,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
          {
            model: OrdemProducaoItem,
            include: [
              FileDb,
              {
                model: OrdemProducaoItemProcesso,
                attributes: { exclude: ["id_ordem_producao_item"] },
              },
              Produto
            ],
            attributes: { exclude: ["id_ordem_producao", "id_produto"] },
          },
        ],
        attributes: { exclude: ["id_vendedor", "id_orcamento"] },
      });

      return res.status(201).json(ordemProducao);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createOrdemProducao(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      let ordemProducao = req.body;
      let ordemProducaoItens: any = ordemProducao.ordem_producao_items;
      delete ordemProducao.ordem_producao_items;

      if (ordemProducao.orcamento)
        ordemProducao.id_orcamento = ordemProducao.orcamento.id;
      if (ordemProducao.vendedor)
        ordemProducao.id_vendedor = ordemProducao.vendedor.id;

      delete ordemProducao.orcamento;
      delete ordemProducao.vendedor;

      let ordemProducaoCreated: OrdemProducao = await OrdemProducao.create(
        ordemProducao,
        { transaction: transaction }
      );

      ordemProducaoItens = ordemProducaoItens.map(
        async (ordemProducaoItem: any) => {
          let files = ordemProducaoItem.files;
          delete ordemProducaoItem.files;

          if (ordemProducaoItem.produto) {
            ordemProducaoItem.id_produto = ordemProducaoItem.produto.id;
            delete ordemProducaoItem.produto;
          }

          if (ordemProducaoItem.rir) {
            ordemProducaoItem.id_rir = ordemProducaoItem.rir.id;
            delete ordemProducaoItem.rir;
          }

          ordemProducaoItem.id_ordem_producao = ordemProducaoCreated.id;

          let OrdemProducaoItemProcessos =
            ordemProducaoItem.ordem_producao_item_processos;
          delete ordemProducaoItem.ordem_producao_item_processos;

          let ordemProducaoItemCreated = await OrdemProducaoItem.create(
            ordemProducaoItem,
            { transaction: transaction }
          );

          if (files) {
            await ordemProducaoItemCreated.setFiles(
              files.map((item: any) => item.id),
              { transaction: transaction }
            );
          }

          OrdemProducaoItemProcessos = OrdemProducaoItemProcessos.map(
            async (ordemProducaoItemProcesso: any) => {
              ordemProducaoItemProcesso.id_ordem_producao_item =
                ordemProducaoItemCreated.id;

              let OrdemProducaoItemProcessoCreated =
                await OrdemProducaoItemProcesso.create(
                  ordemProducaoItemProcesso,
                  { transaction: transaction }
                );

              return OrdemProducaoItemProcessoCreated;
            }
          );

          return ordemProducaoItemCreated;
        }
      );

      Promise.all(ordemProducaoItens).then(async () => {
        let ordemProducaoCreated2 = await OrdemProducao.findByPk(
          ordemProducaoCreated.id
        );

        await transaction.commit();

        ordemProducaoCreated2 = await OrdemProducao.findByPk(
          ordemProducaoCreated.id,
          {
            include: [
              {
                model: Vendedor,
                include: [Pessoa],
                attributes: { exclude: ["id_pessoa"] },
              },
              {
                model: Orcamento,
                include: [Pessoa],
                attributes: { exclude: ["id_pessoa"] },
              },
              {
                model: OrdemProducaoItem,
                include: [
                  FileDb,
                  {
                    model: OrdemProducaoItemProcesso,
                    attributes: { exclude: ["id_ordem_producao_item"] },
                  },
                  Produto
                ],
                attributes: { exclude: ["id_ordem_producao", "id_produto"] },
              },
            ],
            attributes: { exclude: ["id_vendedor", "id_orcamento"] },
          }
        );
        return res.status(201).json(ordemProducaoCreated2);
      });
    } catch (error: any) {
      await transaction.rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOrdemProducao(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      let ordemProducao = req.body;
      let ordemProducaoItens: any = ordemProducao.ordem_producao_items;
      delete ordemProducao.ordem_producao_items;

      if (ordemProducao.orcamento)
        ordemProducao.id_orcamento = ordemProducao.orcamento.id;
      if (ordemProducao.vendedor)
        ordemProducao.id_vendedor = ordemProducao.vendedor.id;

      delete ordemProducao.orcamento;
      delete ordemProducao.vendedor;

      await OrdemProducao.update(ordemProducao, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      await OrdemProducaoItem.destroy({
        where: { id_ordem_producao: Number(id) },
        transaction: transaction,
      });

      ordemProducaoItens = ordemProducaoItens.map(
        async (ordemProducaoItem: any) => {
          let files = ordemProducaoItem.files;
          delete ordemProducaoItem.files;

          delete ordemProducaoItem.id

          if (ordemProducaoItem.produto) {
            ordemProducaoItem.id_produto = ordemProducaoItem.produto.id;
            delete ordemProducaoItem.produto;
          }

          if (ordemProducaoItem.rir) {
            ordemProducaoItem.id_rir = ordemProducaoItem.rir.id;
            delete ordemProducaoItem.rir;
          }

          ordemProducaoItem.id_ordem_producao = id;

          let OrdemProducaoItemProcessos =
            ordemProducaoItem.ordem_producao_item_processos;
          delete ordemProducaoItem.ordem_producao_item_processos;

          let ordemProducaoItemCreated = await OrdemProducaoItem.create(
            ordemProducaoItem,
            { transaction: transaction }
          );

          if (files) {
            await ordemProducaoItemCreated.setFiles(
              files.map((item: any) => item.id),
              { transaction: transaction }
            );
          }

          OrdemProducaoItemProcessos = OrdemProducaoItemProcessos.map(
            async (ordemProducaoItemProcesso: any) => {
              ordemProducaoItemProcesso.id_ordem_producao_item =
                ordemProducaoItemCreated.id;

              delete ordemProducaoItemProcesso.id

              let OrdemProducaoItemProcessoCreated =
                await OrdemProducaoItemProcesso.create(
                  ordemProducaoItemProcesso,
                  { transaction: transaction }
                );

              return OrdemProducaoItemProcessoCreated;
            }
          );

          return ordemProducaoItemCreated;
        }
      );

      Promise.all(ordemProducaoItens).then(async () => {
        let ordemProducaoUpdated = await OrdemProducao.findByPk(id);

        await transaction.commit();

        ordemProducaoUpdated = await OrdemProducao.findByPk(id, {
          include: [
            {
              model: Vendedor,
              include: [Pessoa],
              attributes: { exclude: ["id_pessoa"] },
            },
            {
              model: Orcamento,
              include: [Pessoa],
              attributes: { exclude: ["id_pessoa"] },
            },
            {
              model: OrdemProducaoItem,
              include: [
                FileDb,
                {
                  model: OrdemProducaoItemProcesso,
                  attributes: { exclude: ["id_ordem_producao_item"] },
                },
                Produto
              ],
              attributes: { exclude: ["id_ordem_producao", "id_produto"] },
            },
          ],
          attributes: { exclude: ["id_vendedor", "id_orcamento"] },
        });
        return res.status(202).json(ordemProducaoUpdated);
      });
    } catch (error: any) {
      await transaction.rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOrdemProducao(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await OrdemProducao.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `OrdemProducao apagado` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreOrdemProducao(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await OrdemProducao.restore({ where: { id: Number(id) } });
      const orcamentoUpdated = await OrdemProducao.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(orcamentoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
