import { Request, Response } from "express";
import Contato from "../models/Contato.js";
import Pessoa from "../models/Pessoa.js";
import { ContatoType, PessoaType } from "../types/index.js";

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
        include: [Contato],
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
    const pessoa: PessoaType = req.body;
    let contatos = pessoa.contato;
    delete pessoa.contato;

    try {
      let pessoaCreated = (await Pessoa.create(pessoa)) as PessoaType;

      if (contatos) {
        contatos.forEach(async (contato) => {
          let contatoCreatedOrUpdated: Array<ContatoType> = [];
          if (contato.id) {
            contato.id_pessoa = pessoaCreated.id;
            let id_contato = contato.id;
            delete contato.id;
            await Contato.update(contato, {
              where: { id: Number(id_contato) },
            });
            contatoCreatedOrUpdated.push(contato);
          } else {
            contatoCreatedOrUpdated.push(
              (await Contato.create(contato)) as ContatoType
            );
          }
          pessoaCreated.contato = contatoCreatedOrUpdated;
        });
      }

      return res.status(201).json(pessoaCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updatePessoa(req: Request, res: Response) {
    const { id } = req.params;
    const pessoaUpdate: PessoaType = req.body;
    let contatos = pessoaUpdate.contato;
    delete pessoaUpdate.contato;
    delete pessoaUpdate.id;
    try {
      await Pessoa.update(pessoaUpdate, { where: { id: Number(id) } });

      if (contatos) {
        contatos.forEach(async (contato) => {
          if (contato.id && contato.id_pessoa != Number(id)) {
            let id_contato = contato.id;
            delete contato.id;
            await Contato.update(contato, {
              where: { id: Number(id_contato) },
            });
          } else {
            contato.id_pessoa = Number(id);
            await Contato.create(contato);
          }
        });
      }

      const pessoaUpdated = await Pessoa.findOne({
        where: { id: Number(id) },
        include: [Contato],
      });

      return res.status(202).json(pessoaUpdated);
    } catch (error: any) {
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
