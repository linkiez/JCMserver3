import sequelize from "../config/connMySql";
import { Request, Response } from "express";
import OrdemProducao from "../models/OrdemProducao";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import OrdemProducaoItemProcesso from "../models/OrdemProducaoItemProcesso";
import Vendedor from "../models/Vendedor";
import FileDb from "../models/File";

export default class OrdemProducaoController {
  static async findAllOrdemProducao(req: Request, res: Response) {
    try {
      let orcamento = await OrdemProducao.findAll();
      return res.status(200).json(orcamento);
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
          Vendedor,
          {
            model: OrdemProducaoItem,
            include: [
              FileDb,
              {
                model: OrdemProducaoItemProcesso,
                attributes: { exclude: ["id_ordem_producao_item"] },
              },
            ],
            attributes: { exclude: ["id_ordem_producao"] },
          },
        ],
        attributes: { exclude: ["id_vendedor"] },
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
              Vendedor,
              {
                model: OrdemProducaoItem,
                include: [
                  FileDb,
                  {
                    model: OrdemProducaoItemProcesso,
                    attributes: { exclude: ["id_ordem_producao_item"] },
                  },
                ],
                attributes: { exclude: ["id_ordem_producao"] },
              },
            ],
            attributes: { exclude: ["id_vendedor"] },
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
        let ordemProducaoUpdated = await OrdemProducao.findByPk(
          id
        );

        await transaction.commit();

        ordemProducaoUpdated = await OrdemProducao.findByPk(
          id,
          {
            include: [
              Vendedor,
              {
                model: OrdemProducaoItem,
                include: [
                  FileDb,
                  {
                    model: OrdemProducaoItemProcesso,
                    attributes: { exclude: ["id_ordem_producao_item"] },
                  },
                ],
                attributes: { exclude: ["id_ordem_producao"] },
              },
            ],
            attributes: { exclude: ["id_vendedor"] },
          }
        );
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
