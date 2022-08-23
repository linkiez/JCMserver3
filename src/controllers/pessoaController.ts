import { Request, Response } from "express";
import Contato from "../models/Contato.js";
import Pessoa from "../models/Pessoa.js";
import Pessoa_File from "../models/Pessoa_File.js";
import FileDb from "../models/File.js";
import Pessoa_Contato from "../models/Pessoa_Contato.js";
import sequelize from "../config/connMySql.js";
import Fornecedor from "../models/Fornecedor.js";
import Vendedor from "../models/Vendedor.js";
import Operador from "../models/Operador.js";

export default class PessoaController {
  static async findAllPessoas(req: Request, res: Response) {
    try {
      const pessoas = await Pessoa.findAll();
      return res.status(200).json(pessoas);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllPessoasDeleted(req: Request, res: Response) {
    try {
      const pessoas = await Pessoa.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(pessoas);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOnePessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const pessoa = await Pessoa.findOne({
        where: { id: Number(id) },
        include: [Contato, FileDb, Fornecedor, Vendedor, Operador],
      });
      return res.status(200).json(pessoa);
    } catch (error: any) {
      console.log(error);
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
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createPessoa(req: Request, res: Response) {
    let pessoa = req.body;
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

      let ArrayPromises: Array<any> = [];

      if (contatos) {
        let contatosCreated = contatos.map(async (contato: any) => {
          if (contato.id) {
            return contato;
          } else {
            return Contato.findOrCreate({
              where: { valor: contato.valor },
              transaction: transaction,
            });
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
          include: [Contato, FileDb, Fornecedor, Vendedor, Operador],
        });

        return res.status(201).json(pessoaCreated2);
      });
    } catch (error: any) {
      await transaction.rollback();
      console.log(error);
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

      contatos = contatos.filter((contato: Contato)=> contato.valor!=undefined)

      console.log(contatos);

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

      Promise.all(contatosCreated).then(async (contatos) => {
        let promises: Array<any> = [];
        contatos.forEach(async (item: Contato) => {
          promises.push(
            Pessoa_Contato.findOrCreate({
              where: { pessoaId: id, contatoId: item.id },
              transaction: transaction,
            })
          );
        });

        files.forEach(async (item: FileDb) => {
          promises.push(
            Pessoa_File.findOrCreate({
              where: { pessoaId: id, fileId: item.id },
              transaction: transaction,
            })
          );
        });

        Promise.all(promises).then(async () => {
          await transaction.commit();
          const pessoaUpdated = await Pessoa.findOne({
            where: { id: Number(id) },
            include: [Contato, FileDb, Fornecedor, Vendedor, Operador],
          });

          return res.status(202).json(pessoaUpdated);
        });
      });
    } catch (error: any) {
      await transaction.rollback();
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyPessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Pessoa.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Pessoa apagada` });
    } catch (error: any) {
      console.log(error);
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
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
