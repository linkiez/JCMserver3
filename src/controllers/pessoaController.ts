import { Request, Response } from "express";
import Contato from "../models/Contato.js";
import Pessoa from "../models/Pessoa.js";
import Pessoa_File from "../models/Pessoa_File.js";
import FileDb from "../models/File.js";
import Pessoa_Contato from "../models/Pessoa_Contato.js";
import sequelize from "../config/connection.js";
import Fornecedor from "../models/Fornecedor.js";
import Vendedor from "../models/Vendedor.js";

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
        include: [Contato, FileDb, Fornecedor, Vendedor],
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

    const transaction = sequelize.transaction();

    try {
      let pessoaCreated = await Pessoa.create(pessoa);

      let contatosCreated = contatos.map(async (contato: any) => {
        if (contato.id) {
          return contato;
        } else {
          return Contato.create(contato);
        }
      });

      Promise.all(contatosCreated).then(async (values) => {
        Promise.all([
          pessoaCreated.setContatos(values),
          pessoaCreated.setFiles(files.map((item) => item.id)),
        ]).then(async (item) => {
          let pessoaCreated2 = await Pessoa.findByPk(pessoaCreated.id, {
            include: [Contato, FileDb, Fornecedor, Vendedor],
          });
          (await transaction).commit();
          return res.status(201).json(pessoaCreated2);
        });
      });
    } catch (error: any) {
      (await transaction).rollback()
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

    const transaction = sequelize.transaction();

    try {
      await Pessoa.update(pessoa, { where: { id: Number(id) } });

      let contatosCreated = contatos.map(async (contato: any) => {
        if (contato.id) {
          let contatoId = contato.id;
          delete contato.id;
          await Contato.update(contato, { where: { id: Number(contatoId) } });
          return Contato.findOne({ where: { id: Number(contatoId) } });
        } else {
          return Contato.create(contato);
        }
      });

      Promise.all(contatosCreated).then(async (contatos) => {
        let promises: Array<any> = [];
        contatos.forEach(async (item: Contato) => {
          promises.push(
            Pessoa_Contato.findOrCreate({
              where: { pessoaId: id, contatoId: item.id },
            })
          );
        });

        files.forEach(async (item: FileDb) => {
          promises.push(
            Pessoa_File.findOrCreate({
              where: { pessoaId: id, fileId: item.id },
            })
          );
        });

        Promise.all(promises).then(async (listaDePromisse) => {
          (await transaction).commit();
          const pessoaUpdated = await Pessoa.findOne({
            where: { id: Number(id) },
            include: [Contato, FileDb, Fornecedor, Vendedor],
          });

          return res.status(202).json(pessoaUpdated);
        });
      });
    } catch (error: any) {
      (await transaction).rollback()
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
