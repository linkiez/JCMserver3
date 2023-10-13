import { Op } from "sequelize";
import { Request, Response } from "express";
import Contato from "../models/Contato";
import Pessoa from "../models/Pessoa";
import Pessoa_File from "../models/Pessoa_File";
import FileDb from "../models/File";
import Pessoa_Contato from "../models/Pessoa_Contato";
import sequelize from "../config/connPostgre";
import Fornecedor from "../models/Fornecedor";
import Vendedor from "../models/Vendedor";
import Operador from "../models/Operador";
import Empresa from "../models/Empresa";

export default class PessoaController {
  static async findAllPessoas(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { pessoas: Pessoa[]; totalRecords: Number } = {
        pessoas: [],
        totalRecords: 0,
      };
      let queryWhere: any = {
        [Op.or]: [
          { nome: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { cnpj_cpf: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { telefone: { [Op.like]: "%" + consulta.searchValue + "%" } },
        ],
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      let queryIncludes = [];
      if (req.query.fornecedor === "true")
        queryIncludes.push({ model: Fornecedor, required: true });
      if (req.query.operador === "true")
        queryIncludes.push({ model: Operador, required: true });
      if (req.query.vendedor === "true")
        queryIncludes.push({ model: Vendedor, required: true });

      resultado.pessoas = await Pessoa.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        include: queryIncludes,
        paranoid: req.query.deleted === "true" ? false : true,
        order: [["nome", "ASC"]],
      });
      resultado.totalRecords = await Pessoa.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        include: queryIncludes,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findOnePessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const pessoa = await Pessoa.findOne({
        where: { id: Number(id) },
        include: [
          Contato,
          FileDb,
          { model: Fornecedor, paranoid: false },
          { model: Vendedor, paranoid: false },
          { model: Operador, paranoid: false },
          {
            model: Empresa,
            include: [FileDb],
            attributes: { exclude: ["id_file"] },
            paranoid: false,
          },
        ],
      });
      return res.status(200).json(pessoa);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findPessoaByName(req: Request, res: Response) {
    const { nome } = req.params;
    try {
      const pessoa = await Pessoa.findOne({
        where: { nome: nome },
      });
      return res.status(200).json(pessoa);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createPessoa(req: Request, res: Response) {
    let pessoa = req.body;
    console.log(pessoa);
    let contatos: Array<Contato> = pessoa.contatos;
    delete pessoa.contatos;
    let files: Array<FileDb> = pessoa.files;
    delete pessoa.files;

    const transaction = await sequelize.transaction();

    try {
      let pessoaCreated = await Pessoa.create(pessoa, {
        transaction: transaction,
      });

      if (pessoa.operador) {
        let operador = pessoa.operador;
        operador.id_pessoa = pessoaCreated.id;
        await Operador.create(operador, { transaction: transaction });
      }

      if (pessoa.fornecedor) {
        let fornecedor = pessoa.fornecedor;
        fornecedor.id_pessoa = pessoaCreated.id;
        await Fornecedor.create(fornecedor, { transaction: transaction });
      }

      if (pessoa.vendedor) {
        let vendedor = pessoa.vendedor;
        vendedor.id_pessoa = pessoaCreated.id;
        await Vendedor.create(vendedor, { transaction: transaction });
      }

      if (pessoa.empresa) {
        let empresa = pessoa.empresa;
        empresa.id_pessoa = pessoaCreated.id;
        if (empresa.file) {
          let file = empresa.file;
          delete empresa.file;
          empresa.id_file = file.id;
        }
        await Empresa.create(empresa, { transaction: transaction });
      }

      let ArrayPromises: Array<any> = [];

      if (contatos) {
        contatos = contatos.filter(
          (contato: Contato) => contato.valor != undefined
        );

        let contatosCreated = contatos.map(async (contato: Contato) => {
          if (contato.tipo == "Telefone" || contato.tipo == "WhatsApp")
            contato.valor = Number(contato.valor.toString().replace(/\D/g, ""));
          if (contato.id) {
            return contato;
          } else {
            let contatoFind = await Contato.findOne({
              where: { valor: contato.valor },
            });

            if (contatoFind) {
              return contatoFind;
            } else {
              return Contato.create(contato as any, {
                transaction: transaction,
              });
            }
          }
        });

        Promise.all(contatosCreated).then(async (values) => {
          ArrayPromises.push(
            pessoaCreated.setContatos(values, { transaction: transaction })
          );
        });
      }

      if (files) {
        ArrayPromises.push(
          pessoaCreated.setFiles(
            files.map((item) => item.id),
            { transaction: transaction }
          )
        );
      }

      Promise.all(ArrayPromises).then(async () => {
        await transaction.commit();
        let pessoaCreated2 = await Pessoa.findByPk(pessoaCreated.id, {
          include: [Contato, FileDb, Fornecedor, Vendedor, Operador, Empresa],
        });

        return res.status(201).json(pessoaCreated2);
      });
    } catch (error: any) {
      await transaction.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updatePessoa(req: Request, res: Response) {
    const { id } = req.params;
    let pessoa = req.body;
    let contatos = pessoa.contatos;
    delete pessoa.contatos;
    let files = pessoa.files;
    delete pessoa.files;
    delete pessoa.id;

    console.log(pessoa);

    const transaction = await sequelize.transaction();

    try {
      await Pessoa.update(pessoa, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      if (pessoa.fornecedor) {
        if (pessoa.fornecedor.id) {
          let fornecedor = pessoa.fornecedor;
          let id_fornecedor = fornecedor.id;
          delete fornecedor.id;
          await Fornecedor.update(fornecedor, {
            where: { id: Number(id_fornecedor) },
            transaction: transaction,
          });
        } else {
          let fornecedor = pessoa.fornecedor;
          fornecedor.id_pessoa = id;
          await Fornecedor.create(fornecedor, { transaction: transaction });
        }
      }

      if (pessoa.operador && !pessoa.operador.id) {
        let operador = pessoa.operador;
        operador.id_pessoa = id;
        await Operador.create(operador, { transaction: transaction });
      }

      if (pessoa.vendedor && !pessoa.vendedor.id) {
        let vendedor = pessoa.vendedor;
        vendedor.id_pessoa = id;
        await Vendedor.create(vendedor, { transaction: transaction });
      }

      if (pessoa.empresa) {
        if (pessoa.empresa.id) {
          let empresa = pessoa.empresa;
          let id_empresa = empresa.id;
          delete empresa.id;
          if (empresa.file) {
            let file = empresa.file;
            delete empresa.file;
            empresa.id_file = file.id;
          }
          await Empresa.update(empresa, {
            where: { id: Number(id_empresa) },
            transaction: transaction,
          });
        } else {
          let empresa = pessoa.empresa;
          empresa.id_pessoa = id;
          if (empresa.file) {
            let file = empresa.file;
            delete empresa.file;
            empresa.id_file = file.id;
          }
          await Empresa.create(empresa, { transaction: transaction });
        }
      }

      contatos = contatos.filter(
        (contato: Contato) => contato.valor != undefined
      );

      let contatosCreated = contatos.map(async (contato: any) => {
        if (contato.id) {
          let contatoId = contato.id;
          delete contato.id;
          await Contato.update(contato, {
            where: { id: Number(contatoId) },
            transaction: transaction,
          });
          return Contato.findOne({ where: { id: Number(contatoId) } });
        } else {
          let contatoFind = await Contato.findOne({
            where: { valor: contato.valor },
          });

          if (contatoFind) {
            return contatoFind;
          } else {
            return Contato.create(contato, { transaction: transaction });
          }
        }
      });

      await Pessoa_Contato.destroy({
        where: { pessoaId: Number(id) },
        transaction: transaction,
      });

      Promise.all(contatosCreated).then(async (contatos) => {
        let promises: Array<any> = [];
        contatos.forEach(async (contato: Contato) => {
          promises.push(
            Pessoa_Contato.findOrCreate({
              where: { pessoaId: id, contatoId: contato.id },
              transaction: transaction,
            })
          );
        });

        files.forEach(async (file: FileDb) => {
          promises.push(
            Pessoa_File.findOrCreate({
              where: { pessoaId: id, fileId: file.id },
              transaction: transaction,
            })
          );
        });

        Promise.all(promises).then(async () => {
          await transaction.commit();
          const pessoaUpdated = await Pessoa.findOne({
            where: { id: Number(id) },
            include: [Contato, FileDb, Fornecedor, Vendedor, Operador, Empresa],
          });

          return res.status(202).json(pessoaUpdated);
        });
      });
    } catch (error: any) {
      await transaction.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyPessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Pessoa.destroy({ where: { id: Number(id) } });
      return res.status(202).json("Pessoa apagada");
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async restorePessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Pessoa.restore({ where: { id: Number(id) } });
      const pessoaUpdated = await Pessoa.findOne({ where: { id: Number(id) } });
      return res.status(202).json(pessoaUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async existeCnpjCpfPessoa(req: Request, res: Response) {
    let pessoa: Pessoa = req.body;
    let query: any = { where: { cnpj_cpf: pessoa.cnpj_cpf }, paranoid: false };
    if (pessoa.id) {
      query.where.id = { [Op.not]: pessoa.id };
    }

    try {
      let pessoaChecked: Pessoa = await Pessoa.findOne(query);
      if (pessoaChecked) {
        return res.status(200).send(false);
      } else {
        return res.status(200).send(true);
      }
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
