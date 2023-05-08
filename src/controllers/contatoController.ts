import { Request, Response } from "express";
import Contato from "../models/Contato";
import { Op } from "sequelize";

export default class ContatoController {
  static async findAllContatos(req: Request, res: Response) {
    try {
      let consulta: any = {
      pageCount: Number(req.query.pageCount) || 10,
      page: Number(req.query.page) || 0,
      searchValue: req.query.searchValue,
    };
      let resultado: { contatos: Contato[]; totalRecords: Number } = {
        contatos: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        [Op.or]: [
          { nome: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { valor: { [Op.like]: "%" + consulta.searchValue + "%" } }
        ],
      };

      if(req.query.deleted==='true') queryWhere = {...queryWhere, deletedAt: {[Op.not]: null}}

      resultado.contatos = await Contato.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted==='true'?false:true
      });

      resultado.totalRecords = await Contato.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        paranoid: req.query.deleted==='true'?false:true
      });
      
      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllContatoPessoa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const contatos = await Contato.findAll({
        where: { id_pessoa: Number(id) },
      }) as Array<Contato>;
      return res.status(200).json(contatos);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findOneContato(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const contato = await Contato.findOne({
        where: { id: Number(id) },
      });
      return res.status(200).json(contato);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async createContato(req: Request, res: Response) {
    const contato = req.body;
    try {
      const contatoCreated = await Contato.create(contato) ;
      return res.status(201).json(contatoCreated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async updateContato(req: Request, res: Response) {
    const { id } = req.params;
    const contatoUpdate = req.body;
    delete contatoUpdate.id;
    try {
      await Contato.update(contatoUpdate, { where: { id: Number(id) } });
      const contatoUpdated = await Contato.findOne({
        where: { id: Number(id) },
      }) ;
      return res.status(202).json(contatoUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async destroyContato(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Contato.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Contato apagada` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllContatoDeleted(req: Request, res: Response) {
    try {
      const contato = await Contato.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(contato);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async restoreContato(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Contato.restore({ where: { id: Number(id) } });
      const contatoUpdated = await Contato.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(contatoUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }
}
