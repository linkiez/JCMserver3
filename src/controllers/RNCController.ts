import { Request, Response } from "express";
import RNC from "../models/RNC";
import { Op, QueryTypes } from "sequelize";
import OrdemProducao from "../models/OrdemProducao";
import Usuario from "../models/Usuario";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import Pessoa from "../models/Pessoa";
import Orcamento from "../models/Orcamento";
import Vendedor from "../models/Vendedor";
import { RNCItem } from "../models/RNCItem";
import Produto from "../models/Produto";
import OrcamentoItem from "../models/OrcamentoItem";
import OrdemProducaoItemProcesso from "../models/OrdemProducaoItemProcesso";

export default class RNCController {
  static async findAllRNC(req: Request, res: Response) {
    try {
      const consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue || "",
      };

      let resultados: { rncs: RNC[]; totalRecords: number } = {
        rncs: [],
        totalRecords: 0,
      };

      let where: any = {};

      if (consulta.searchValue !== "undefined" && consulta.searchValue !== "") {
        where = {
          [Op.or]: [{ id: consulta.searchValue }],
        };
      }

      const include = [
        {
          model: RNCItem,
          include: [
            Produto,
            {
              model: OrdemProducaoItem,
              include: [
                {
                  model: OrcamentoItem,
                  include: [{ model: Orcamento, include: [Pessoa] }],
                },
                OrdemProducaoItemProcesso,
              ],
            },
          ],
        },
        {
          model: Usuario,
          as: "responsavel_analise",
          include: [Pessoa],
          attributes: { exclude: ["senha", "acesso"] },
        },
      ];

      resultados.rncs = await RNC.findAll({
        include,
        limit: consulta.pageCount,
        offset: consulta.page * consulta.pageCount,
        where,
        order: [["id", "DESC"]],
      });

      resultados.totalRecords = await RNC.count({
        include,
        where,
      });
      return res.status(200).json(resultados);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const rnc = await RNC.findByPk(id, {
        include: [
          {
            model: RNCItem,
            include: [
              Produto,
              {
                model: OrdemProducaoItem,
                include: [
                  {
                    model: OrcamentoItem,
                    include: [{ model: Orcamento, include: [Pessoa] }],
                  },
                  OrdemProducaoItemProcesso,
                ],
              },
            ],
          },
          {
            model: Usuario,
            as: "responsavel_analise",
            include: [Pessoa],
            attributes: { exclude: ["senha", "acesso"] },
          },
        ],
      });
      return res.status(200).json(rnc);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(error.message);
    }
  }

  static async createRNC(req: Request, res: Response) {
    const transaction = await RNC.sequelize?.transaction();
    try {
      let rnc = req.body;
      let rnc_items = rnc.rnc_items;

      if (!rnc.id)
        rnc.id = ((await RNC.max("id", { paranoid: false })) as number) + 1;

      rnc.responsavel_analise_id = rnc.responsavel_analise.id;

      rnc = await RNC.create(rnc, { transaction });

      for (let rnc_item of rnc_items) {
        rnc_item.id_rnc = rnc.id;
        rnc_item.id_ordem_producao_item = rnc_item.ordem_producao_item.id;
        rnc_item.id_produto = rnc_item.produto.id;

        await RNCItem.create(rnc_item, { transaction });
      }

      transaction?.commit();

      rnc = await RNC.findByPk(rnc.id, {
        include: [
          {
            model: RNCItem,
            include: [
              Produto,
              {
                model: OrdemProducaoItem,
                include: [
                  {
                    model: OrcamentoItem,
                    include: [{ model: Orcamento, include: [Pessoa] }],
                  },
                  OrdemProducaoItemProcesso
                ],
              },
            ],
          },
          { model: Usuario, as: "responsavel_analise", include: [Pessoa] },
        ],
      });

      return res.status(201).json(rnc);
    } catch (error: any) {
      transaction?.rollback();
      console.error(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateRNC(req: Request, res: Response) {
    const transaction = await RNC.sequelize?.transaction();
    try {
      const id = req.params.id;
      let rnc = req.body;
      let rnc_items = rnc.rnc_items;

      rnc.responsavel_analise_id = rnc.responsavel_analise.id;

      await RNC.update(req.body, {
        where: { id: id },
        transaction,
      });

      const rnc_items_old = await RNCItem.findAll({
        where: { id_rnc: id },
        transaction,
      });

      for (let rnc_item_old of rnc_items_old) {
        if (!rnc_items.find((rnc_item: any) => rnc_item.id === rnc_item_old.id))
          await RNCItem.destroy({
            where: { id: rnc_item_old.id },
            transaction,
          });
      }

      for (let rnc_item of rnc_items) {
        if (!rnc_item.id) {
          rnc_item.id_rnc = rnc.id;
          rnc_item.id_ordem_producao_item = rnc_item.ordem_producao_item.id;
          rnc_item.id_produto = rnc_item.produto.id;

          await RNCItem.create(rnc_item, { transaction });
        } else {
          await RNCItem.update(rnc_item, {
            where: { id: rnc_item.id },
            transaction,
          });
        }
      }

      transaction?.commit();

      rnc = await RNC.findByPk(id, {
        include: [
          {
            model: RNCItem,
            include: [
              Produto,
              {
                model: OrdemProducaoItem,
                include: [
                  {
                    model: OrcamentoItem,
                    include: [{ model: Orcamento, include: [Pessoa] }],
                  },
                  OrdemProducaoItemProcesso
                ],
              },
            ],
          },
          { model: Usuario, as: "responsavel_analise", include: [Pessoa] },
        ],
      });

      return res.status(200).json(rnc);
    } catch (error: any) {
      transaction?.rollback();
      console.error(error);
      return res.status(500).json(error.message);
    }
  }

  static async deleteRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await RNC.destroy({ where: { id: id } });
      return res.status(204).json("RNC deletado com sucesso!");
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await RNC.restore({ where: { id: id } });
      return res.status(204).json("RNC restaurado com sucesso!");
    } catch (error: any) {
      console.error(error);
      return res.status(500).json(error.message);
    }
  }
}
