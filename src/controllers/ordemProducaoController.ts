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
import RegistroInspecaoRecebimento from "../models/RIR";
import { off } from "process";

export default class OrdemProducaoController {
  static async findAllOrdemProducao(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
        status: req.query.status ?? "",
        id_vendedor: req.query.id_vendedor,
        id_pessoa: req.query.id_pessoa,
        data_prazo: req.query.data_prazo,
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

      if (consulta.id_vendedor && consulta.id_vendedor !== "undefined") {
        queryWhere.id_vendedor = consulta.id_vendedor;
      }

      if (consulta.data_prazo && consulta.data_prazo !== "undefined") {
        if (typeof consulta.data_prazo === "string") {
          const data_prazoDate = new Date(consulta.data_prazo);
          const data_prazoString =
            data_prazoDate.getFullYear() +
            "-" +
            (data_prazoDate.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            data_prazoDate.getDate().toString().padStart(2, "0");

          queryWhere.data_prazo = sequelize.where(
            sequelize.fn("date", sequelize.col("data_prazo")),
            "=",
            data_prazoString
          );
        }
      }

      if (consulta.status !== "undefined" && consulta.status !== "") {
        queryWhere.status = consulta.status;
      }

      if (req.query.deleted === "true")
        queryWhere.deletedAt = { [Op.not]: null };

      const include = [
        {
          model: Vendedor,
          include: [{ model: Pessoa, paranoid: false }],
          paranoid: false,
        },
        {
          model: Orcamento,
          include: [
            {
              model: Pessoa,
              where: isNaN(Number(consulta.searchValue))
                ? { nome: { [Op.like]: "%" + consulta.searchValue + "%" } }
                : undefined,
              required: true,
              paranoid: false,
            },
          ],
          required: true,
          paranoid: false,
        },
        VendaTiny,
        {
          model: OrdemProducaoHistorico,
          include: [
            {
              model: Usuario,
              include: [{ model: Pessoa, paranoid: false }],
              paranoid: false,
            },
          ],
        },
      ];

      resultado.ordemProducao = await OrdemProducao.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: include,
        order: [["createdAt", "DESC"]],
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
      let ordemProducao = await findOrdemProducaoById(Number(id));

      return res.status(201).json(ordemProducao);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createOrdemProducao(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      let ordemProducao: OrdemProducao = req.body;
      let ordemProducaoItens: OrdemProducaoItem[] = [];

      if (ordemProducao.ordem_producao_items)
        ordemProducaoItens = ordemProducao.ordem_producao_items;
      if (ordemProducao.orcamento)
        ordemProducao.id_orcamento = ordemProducao.orcamento.id;
      if (ordemProducao.vendedor)
        ordemProducao.id_vendedor = ordemProducao.vendedor.id;

      delete ordemProducao.orcamento;
      delete ordemProducao.vendedor;
      delete ordemProducao.ordem_producao_items;

      let ordemProducaoCreated: OrdemProducao = await OrdemProducao.create(
        ordemProducao as any,
        { transaction: transaction }
      );

      if (ordemProducaoItens.length > 0)
        for (let ordemProducaoItem of ordemProducaoItens) {
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
            ordemProducaoItem as any,
            { transaction: transaction }
          );

          if (files) {
            await ordemProducaoItemCreated.setFiles(
              files.map((item: any) => item.id),
              { transaction: transaction }
            );
          }

          if (OrdemProducaoItemProcessos)
            for (let ordemProducaoItemProcesso of OrdemProducaoItemProcessos) {
              ordemProducaoItemProcesso.id_ordem_producao_item =
                ordemProducaoItemCreated.id;

              await OrdemProducaoItemProcesso.create(
                ordemProducaoItemProcesso as any,
                { transaction: transaction }
              );
            }
        }

      await transaction.commit();

      ordemProducaoCreated =
        (await findOrdemProducaoById(Number(ordemProducaoCreated.id))) ??
        ordemProducaoCreated;
      return res.status(201).json(ordemProducaoCreated);
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
      let ordemProducao: OrdemProducao = req.body;

      if (ordemProducao.orcamento)
        ordemProducao.id_orcamento = ordemProducao.orcamento.id;
      delete ordemProducao.orcamento;

      if (ordemProducao.vendedor)
        ordemProducao.id_vendedor = ordemProducao.vendedor.id;
      delete ordemProducao.vendedor;

      let ordemProducaoHistoricos = ordemProducao.ordem_producao_historicos;
      delete ordemProducao.ordem_producao_historicos;
      let ordemProducaoItens = ordemProducao.ordem_producao_items;
      delete ordemProducao.ordem_producao_items;

      await OrdemProducao.update(ordemProducao, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      let oldItens = await OrdemProducaoItem.findAll({
        where: { id_ordem_producao: Number(id) },
      });

      if (ordemProducaoItens) {
        for (let item of oldItens) {
          let search = ordemProducaoItens.find(
            (item: OrdemProducaoItem) => item.id == item.id
          );
          if (!search) {
            await OrdemProducaoItem.destroy({
              where: { id: item.id },
              transaction: transaction,
              force: true,
            });
          }
        }

        for (let ordemProducaoItem of ordemProducaoItens) {
          let files = ordemProducaoItem.files;
          delete ordemProducaoItem.files;

          if (ordemProducaoItem.produto) {
            ordemProducaoItem.id_produto = ordemProducaoItem.produto.id;
            delete ordemProducaoItem.produto;
          }

          if (ordemProducaoItem.registro_inspecao_recebimento) {
            ordemProducaoItem.id_rir =
              ordemProducaoItem.registro_inspecao_recebimento.id;
            delete ordemProducaoItem.registro_inspecao_recebimento;
          }

          ordemProducaoItem.id_ordem_producao = Number(id);

          let ordemProducaoItemProcessos: OrdemProducaoItemProcesso[] = [];
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
                  transaction: transaction,
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
                  { transaction: transaction }
                );
              }
            }
          }

          for (let ordemProducaoItemProcesso of ordemProducaoItemProcessos) {
            ordemProducaoItemProcesso.id_ordem_producao_item =
              ordemProducaoItem.id;

            if (ordemProducaoItemProcesso.id) {
              await OrdemProducaoItemProcesso.update(
                ordemProducaoItemProcesso,
                {
                  where: { id: ordemProducaoItemProcesso.id },
                  transaction: transaction,
                }
              );
            } else {
              ordemProducaoItemProcesso =
                await OrdemProducaoItemProcesso.create(
                  ordemProducaoItemProcesso as any,
                  { transaction: transaction }
                );
            }
          }
        }
      }

      if (ordemProducaoHistoricos) {
        let oldHistoricos = await OrdemProducaoHistorico.findAll({
          where: { id_ordem_producao: Number(id) },
        });

        for (let historico of oldHistoricos) {
          let search = ordemProducaoHistoricos.find(
            (item: OrdemProducaoHistorico) => item.id == historico.id
          );
          if (!search) {
            await OrdemProducaoHistorico.destroy({
              where: { id: historico.id },
              transaction: transaction,
            });
          }
        }

        for (let ordemProducaoHistorico of ordemProducaoHistoricos) {
          ordemProducaoHistorico.id_ordem_producao = Number(id);

          if (ordemProducaoHistorico.usuario?.id) {
            ordemProducaoHistorico.id_usuario =
              ordemProducaoHistorico.usuario.id;
            delete ordemProducaoHistorico.usuario;
          }

          if (ordemProducaoHistorico.id) {
            await OrdemProducaoHistorico.update(ordemProducaoHistorico, {
              where: { id: ordemProducaoHistorico.id },
              transaction: transaction,
            });
          } else {
            await OrdemProducaoHistorico.create(ordemProducaoHistorico as any, {
              transaction: transaction,
            });
          }
        }
      }

      await transaction.commit();

      let ordemProducaoUpdated = await findOrdemProducaoById(Number(id));
      return res.status(202).json(ordemProducaoUpdated);
    } catch (error: any) {
      transaction.rollback();
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

async function findOrdemProducaoById(
  id: number
): Promise<OrdemProducao | null> {
  return await OrdemProducao.findByPk(id, {
    include: [
      {
        model: Vendedor,
        include: [{ model: Pessoa, paranoid: false }],
        attributes: { exclude: ["id_pessoa"] },
        paranoid: false,
      },
      {
        model: Orcamento,
        include: [{ model: Pessoa, paranoid: false }, OrcamentoItem],
        attributes: { exclude: ["id_pessoa"] },
        paranoid: false,
      },
      {
        model: OrdemProducaoItem,
        include: [
          FileDb,
          {
            model: OrdemProducaoItemProcesso,
            attributes: { exclude: ["id_ordem_producao_item"] },
          },
          { model: Produto, paranoid: false },
          RegistroInspecaoRecebimento,
          {
            model: OrcamentoItem,
            include: [
              {
                model: Orcamento,
                include: [{ model: Pessoa, attributes: ["nome"] }],
                attributes: ["id"],
              },
            ],
          },
        ],
        attributes: { exclude: ["id_produto"] },
      },
      {
        model: OrdemProducaoHistorico,
        include: [
          {
            model: Usuario,
            include: [{ model: Pessoa, paranoid: false }],
            attributes: { exclude: ["id_pessoa"] },
            paranoid: false,
          },
        ],
        attributes: { exclude: ["id_ordem_producao", "id_usuario"] },
      },
    ],
    attributes: { exclude: ["id_vendedor", "id_orcamento"] },
  });
}
