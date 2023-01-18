import { TinyERP } from "./../services/tinyERP";
import { Request, Response } from "express";
import sequelize from "../config/connPostgre";
import Orcamento from "../models/Orcamento";
import OrcamentoItem from "../models/OrcamentoItem";
import FileDb from "../models/File";
import Contato from "../models/Contato";
import Pessoa from "../models/Pessoa";
import Vendedor from "../models/Vendedor";
import Produto from "../models/Produto";
import { Op } from "sequelize";

export default class OrcamentoController {
  static async findAllOrcamento(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { orcamento: Orcamento[]; totalRecords: Number } = {
        orcamento: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        // [Op.or]: [{ id: { [Op.like]: "%" + consulta.searchValue + "%" } }],
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      resultado.orcamento = await Orcamento.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
        include: [
          {
            model: Vendedor,
            include: [{ model: Pessoa }],
          },
          Pessoa,
          Contato,
        ],
        order: [["id", "DESC"]],
      });

      resultado.totalRecords = await Orcamento.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllOrcamentosDeleted(req: Request, res: Response) {
    try {
      const orçamentos = await Orcamento.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(orçamentos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let orcamento = await Orcamento.findByPk(id, {
        include: [
          {
            model: OrcamentoItem,
            include: [FileDb, Produto],
            attributes: { exclude: ["id_orcamento", "id_produto"] },
          },
          Contato,
          Pessoa,
          {
            model: Vendedor,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
        ],
        attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
      });
      return res.status(200).json(orcamento);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createOrcamento(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> =
        orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato.id) {
        orcamento.id_contato = orcamento.contato.id;
      } else {
        if (orcamento.contato.nome && orcamento.contato.valor) {
          let contato = await Contato.create(orcamento.contato, {
            transaction: transaction,
          });
          orcamento.id_contato = contato.id;
        }
      }
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;
      delete orcamento.produto;

      if (!orcamento.id)
        orcamento.id = ((await Orcamento.max("id")) as number) + 1;

      let orcamentoCreated: Orcamento = await Orcamento.create(orcamento, {
        transaction: transaction,
      });

      orcamentoItens = orcamentoItens.map(async (orcamentoItem: any) => {
        let files = orcamentoItem.files;
        delete orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
          delete orcamentoItem.produto;
        } else {
          throw new Error("Produto não encontrado");
        }

        orcamentoItem.id_orcamento = orcamentoCreated.id;

        delete orcamentoItem.id;

        let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem, {
          transaction: transaction,
        });

        if (files) {
          await orcamentoItemCreated.setFiles(
            files.map((item: any) => item.id),
            { transaction: transaction }
          );
        }

        return orcamentoItemCreated;
      });

      Promise.all(orcamentoItens).then(async () => {
        await transaction.commit();

        let orcamentoCreated2 = await Orcamento.findByPk(orcamentoCreated!.id, {
          include: [
            {
              model: OrcamentoItem,
              include: [FileDb, Produto],
              attributes: { exclude: ["id_orcamento", "id_produto"] },
            },
            Contato,
            Pessoa,
            {
              model: Vendedor,
              include: [Pessoa],
              attributes: { exclude: ["id_pessoa"] },
            },
          ],
          attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
        });

        return res.status(201).json(orcamentoCreated2);
      });
    } catch (error: any) {
      await transaction.rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOrcamento(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> =
        orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato.id) {
        orcamento.id_contato = orcamento.contato.id;
      } else {
        if (orcamento.contato.nome && orcamento.contato.valor) {
          let contato = await Contato.create(orcamento.contato, {
            transaction: transaction,
          });
          orcamento.id_contato = contato.id;
        }
      }
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;
      delete orcamento.id;

      await Orcamento.update(orcamento, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      await OrcamentoItem.destroy({
        where: { id_orcamento: Number(id) },
        transaction: transaction,
      });

      orcamentoItens = orcamentoItens.map(async (orcamentoItem: any) => {
        let files = orcamentoItem.files;
        delete orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
          delete orcamentoItem.produto;
        } else {
          throw new Error("Produto não encontrado");
        }

        delete orcamentoItem.id;

        orcamentoItem.id_orcamento = id;

        let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem, {
          transaction: transaction,
        });

        if (files) {
          await orcamentoItemCreated.setFiles(
            files.map((item: any) => item.id),
            { transaction: transaction }
          );
        }

        return orcamentoItemCreated;
      });

      Promise.all(orcamentoItens).then(async (orcamentoItem) => {
        await transaction.commit();

        let orcamentoUpdated = await Orcamento.findByPk(id, {
          include: [
            {
              model: OrcamentoItem,
              include: [FileDb, Produto],
              attributes: { exclude: ["id_orcamento", "id_produto"] },
            },
            Contato,
            Pessoa,
            {
              model: Vendedor,
              include: [Pessoa],
              attributes: { exclude: ["id_pessoa"] },
            },
          ],
          attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
        });

        return res.status(201).json(orcamentoUpdated);
      });
    } catch (error: any) {
      await transaction.rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Orcamento apagado` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.restore({ where: { id: Number(id) } });
      const orcamentoUpdated = await Orcamento.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(orcamentoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async aprovarOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const transaction = await sequelize.transaction();

      await Orcamento.update(
        { status: "Aprovado", aprovado: true },
        { where: { id: Number(id) }, transaction: transaction }
      );

      let orcamento = await Orcamento.findByPk(id, {
        include: [
          Contato,
          Pessoa,
          {
            model: Vendedor,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
        ],
        attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
      });

      if (!orcamento) throw new Error("Orçamento não encontrado");
      if (!orcamento.pessoa) throw new Error("Pessoa não encontrada");
      if (!orcamento.pessoa.cnpj_cpf)
        throw new Error("CNPJ/CPF não encontrado");

      if (!orcamento?.pessoa?.id_tinyerp && orcamento?.pessoa?.cnpj_cpf) {
        const verificaPessoa = await TinyERP.getPessoaPorCNPJ_CPF(
          orcamento?.pessoa.cnpj_cpf!
        );
        // console.log(verificaPessoa);
        // console.log(verificaPessoa.retorno.erros[0].erro)
        if (verificaPessoa.retorno.status === "OK") {
          await Pessoa.update(
            { id_tinyerp: verificaPessoa.retorno.contatos[0].contato.id },
            { where: { id: orcamento?.pessoa.id }, transaction: transaction }
          );

          orcamento = await Orcamento.findByPk(id, {
            include: [
              Contato,
              Pessoa,
              {
                model: Vendedor,
                include: [Pessoa],
                attributes: { exclude: ["id_pessoa"] },
              },
            ],
            attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
          });
        } else if (
          verificaPessoa.retorno.erros[0].erro ==
          "A consulta não retornou registros"
        ) {
          const response = await TinyERP.createPessoa(orcamento.pessoa);

          if (response.retorno.status === "Erro")
            throw new Error(response.retorno.erros[0].erro);
          if (response.retorno.status === "OK") {
            await Pessoa.update(
              { id_tinyerp: response.retorno.registros[0].registro.id },
              { where: { id: orcamento?.pessoa.id }, transaction: transaction }
            );
          }

          orcamento = await Orcamento.findByPk(id, {
            include: [
              Contato,
              Pessoa,
              {
                model: Vendedor,
                include: [Pessoa],
                attributes: { exclude: ["id_pessoa"] },
              },
            ],
            attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
          });
        } else {
          throw new Error(verificaPessoa.retorno.erros[0].erro);
        }
      }

      

      transaction.commit();
      return res.status(200).json(orcamento);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
