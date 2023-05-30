import sequelize from "../config/connPostgre";
import { Request, Response } from "express";
import OrdemProducao from "../models/OrdemProducao";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import OrdemProducaoItemProcesso from "../models/OrdemProducaoItemProcesso";
import Vendedor from "../models/Vendedor";
import FileDb from "../models/File";
import Orcamento from "../models/Orcamento";
import Pessoa from "../models/Pessoa";
import Produto from "../models/Produto";
import { Op } from "sequelize";
import VendaTiny from "../models/VendaTiny";
import OrdemProducaoHistorico from "../models/OrdemProducaoHistorico";
import Usuario from "../models/Usuario";
import OrcamentoItem from "../models/OrcamentoItem";
import OrdemProducaoItem_File from "../models/OrdemProducaoItem_File";

export default class OrdemProducaoController {
  static async findAllOrdemProducao(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
        status: req.query.status,
      };

      let resultado: { ordemProducao: OrdemProducao[]; totalRecords: Number } =
        {
          ordemProducao: [],
          totalRecords: 0,
        };

      let queryWhere: any = {};

      if (consulta.searchValue) {
        if (!isNaN(Number(consulta.searchValue)))
          queryWhere.id = Number(consulta.searchValue);
      }

      if (consulta.status !== "undefined" && consulta.status !== "") {
        queryWhere.status = consulta.status;
      }

      if (req.query.deleted === "true")
        queryWhere.deletedAt = { [Op.not]: null };

      const include = [
        {
          model: Vendedor,
          include: [{ model: Pessoa }],
        },
        {
          model: Orcamento,
          include: [
            {
              model: Pessoa,
              where:
                isNaN(Number(consulta.searchValue)) ||
                consulta.searchValue !== "undefined"
                  ? { nome: { [Op.like]: "%" + consulta.searchValue + "%" } }
                  : undefined,
            },
          ],
        },
        VendaTiny,
        {
          model: OrdemProducaoHistorico,
          include: [
            {
              model: Usuario,
              include: [Pessoa],
            },
          ],
        },
      ]

      resultado.ordemProducao = await OrdemProducao.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: include,
        order: [["id", "DESC"]],
      });

      resultado.totalRecords = await OrdemProducao.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: include,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
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
            include: [Pessoa, OrcamentoItem],
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
              Produto,
            ],
            attributes: { exclude: ["id_ordem_producao", "id_produto"] },
          },
          {
            model: OrdemProducaoHistorico,
            include: [
              {
                model: Usuario,
                include: [Pessoa],
                attributes: { exclude: ["id_pessoa"] },
              },
            ],
            attributes: { exclude: ["id_ordem_producao", "id_usuario"] },
          },
        ],
        attributes: { exclude: ["id_vendedor", "id_orcamento"] },
      });

      return res.status(201).json(ordemProducao);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
                  Produto,
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOrdemProducao(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      let ordemProducao = req.body;

      if (ordemProducao.orcamento)
        ordemProducao.id_orcamento = ordemProducao.orcamento.id;
      if (ordemProducao.vendedor)
        ordemProducao.id_vendedor = ordemProducao.vendedor.id;

      let ordemProducaoHistoricos = ordemProducao.ordem_producao_historicos;
      delete ordemProducao.ordem_producao_historicos;
      let ordemProducaoItens = ordemProducao.ordem_producao_items;
      delete ordemProducao.ordem_producao_items;

      let updatePromises: Promise<any>[] = [];

      delete ordemProducao.orcamento;
      delete ordemProducao.vendedor;

      await OrdemProducao.update(ordemProducao, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      let oldItens = await OrdemProducaoItem.findAll({
        where: { id_ordem_producao: Number(id) },
      });

      if (ordemProducaoItens) updatePromises = updatePromises.concat(
        oldItens.map(async (item) => {
          let search = ordemProducaoItens.find(
            (item: OrdemProducaoItem) => item.id == item.id
          );
          if (!search) {
            await OrdemProducaoItem.destroy({
              where: { id: item.id },
              transaction: transaction,
            });
          }
        })
      );

      if (ordemProducaoItens) updatePromises = updatePromises.concat(
        ordemProducaoItens.map(async (ordemProducaoItem: OrdemProducaoItem) => {
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

          ordemProducaoItem.id_ordem_producao = Number(id);

          let ordemProducaoItemProcessos:
            | OrdemProducaoItemProcesso[]
            | Promise<any>[] = [];
          if (ordemProducaoItem.ordem_producao_item_processos) {
            ordemProducaoItemProcessos =
              ordemProducaoItem.ordem_producao_item_processos;
            delete ordemProducaoItem.ordem_producao_item_processos;
          }

          if (ordemProducaoItem.id) {
            await OrdemProducaoItem.update(ordemProducaoItem, {
              where: { id: ordemProducaoItem.id },
              transaction: transaction,
            });
          } else {
            ordemProducaoItem = await OrdemProducaoItem.create(
              ordemProducaoItem as any,
              { transaction: transaction }
            );
          }

          if (files) {
            const oldFiles = await OrdemProducaoItem_File.findAll({
              where: { ordemProducaoItemId: ordemProducaoItem.id },
            });

            for (let oldFile of oldFiles) {
              let search = files.find((file: any) => file.id == oldFile.fileId);
              if (!search) {
                await OrdemProducaoItem_File.destroy({
                  where: { id: oldFile.fileId },
                  // transaction: transaction,
                });
              }
            }

            for (let file of files) {
              let search = oldFiles.find(
                (oldFile: any) => oldFile.fileId == file.id
              );
              if (!search) {
                await OrdemProducaoItem_File.create(
                  {
                    ordemProducaoItemId: ordemProducaoItem.id,
                    fileId: file.id,
                  },
                  // { transaction: transaction }
                );
              }
            }
          }

          ordemProducaoItemProcessos = ordemProducaoItemProcessos.map(
            async (ordemProducaoItemProcesso: any) => {
              ordemProducaoItemProcesso.id_ordem_producao_item =
                ordemProducaoItem.id;

              if (ordemProducaoItemProcesso.id) {
                await OrdemProducaoItemProcesso.update(
                  ordemProducaoItemProcesso,
                  {
                    where: { id: ordemProducaoItemProcesso.id },
                    // transaction: transaction,
                  }
                );
              } else {
                ordemProducaoItemProcesso =
                  await OrdemProducaoItemProcesso.create(
                    ordemProducaoItemProcesso,
                    // { transaction: transaction }
                  );
                return ordemProducaoItemProcesso;
              }
            }
          );
          return ordemProducaoItem;
        })
      );

      let oldHistoricos = await OrdemProducaoHistorico.findAll({
        where: { id_ordem_producao: Number(id) },
      });

      updatePromises = updatePromises.concat(
        oldHistoricos.map(async (historico) => {
          let search = ordemProducaoHistoricos.find(
            (item: OrdemProducaoHistorico) => item.id == historico.id
          );
          if (!search) {
            await OrdemProducaoHistorico.destroy({
              where: { id: historico.id },
              transaction: transaction,
            });
          }
        })
      );

      updatePromises = updatePromises.concat(
        ordemProducaoHistoricos.map(async (ordemProducaoHistorico: any) => {
          ordemProducaoHistorico.id_ordem_producao = Number(id);
          ordemProducaoHistorico.id_usuario = ordemProducaoHistorico.usuario.id;
          delete ordemProducaoHistorico.usuario;
          if (ordemProducaoHistorico.id) {
            await OrdemProducaoHistorico.update(ordemProducaoHistorico, {
              where: { id: ordemProducaoHistorico.id },
              transaction: transaction,
            });
          } else {
            await OrdemProducaoHistorico.create(ordemProducaoHistorico, {
              transaction: transaction,
            });
          }
        })
      );

      Promise.all(updatePromises).then(async () => {
        await transaction.commit();

        let ordemProducaoUpdated = await OrdemProducao.findByPk(id, {
          include: [
            {
              model: OrdemProducaoHistorico,
              include: [
                {
                  model: Usuario,
                  include: [Pessoa],
                  attributes: { exclude: ["id_pessoa"] },
                },
              ],
              attributes: { exclude: ["id_ordem_producao", "id_usuario"] },
            },
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
                Produto,
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOrdemProducao(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await OrdemProducao.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `OrdemProducao apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
