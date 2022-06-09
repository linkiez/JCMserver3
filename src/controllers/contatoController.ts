import { Request, Response } from "express";
import Contato from "../models/Contato.js";
import { ContatoType } from "../types/index.js";

export default class ContatoController {
  static async findAllContatos(req: Request, res: Response) {
    try {
      const contatos = await Contato.findAll() as Array<ContatoType>;
      return res.status(200).json(contatos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllContatoPessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const contatos = await Contato.findAll({
        where: { id_pessoa: Number(id) },
      }) as Array<ContatoType>;
      return res.status(200).json(contatos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneContato(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const contato = await Contato.findOne({
        where: { id: Number(id) },
      }) as ContatoType;
      return res.status(200).json(contato);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createContato(req: Request, res: Response) {
    const contato: ContatoType = req.body;
    try {
      const contatoCreated = await Contato.create(contato) as ContatoType;
      return res.status(201).json(contatoCreated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateContato(req: Request, res: Response) {
    const { id } = req.params;
    const contatoUpdate: ContatoType = req.body;
    delete contatoUpdate.id;
    try {
      await Contato.update(contatoUpdate, { where: { id: Number(id) } });
      const contatoUpdated = await Contato.findOne({
        where: { id: Number(id) },
      }) as ContatoType;
      return res.status(202).json(contatoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyContato(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Contato.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Contato apagada` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
