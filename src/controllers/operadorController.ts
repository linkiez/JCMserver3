import { Request, Response } from "express";
import Operador from "../models/Operador";
import Pessoa from "../models/Pessoa";
import { Op } from "sequelize";

export default class OperadorController {
  static async findAllOperadors(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { operadores: Operador[]; totalRecords: Number } = {
        operadores: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        [Op.or]: [{ nome: { [Op.like]: "%" + consulta.searchValue + "%" } }],
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      let queryIncludes: any = [
        {
          model: Pessoa,
          attributes: {
            exclude: ["id_pessoa"],
            where:
              consulta.searchValue !== "undefined" ? queryWhere : undefined,
          },
        },
      ];

      resultado.operadores = await Operador.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        include: queryIncludes,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      resultado.totalRecords = await Operador.count({
        include: queryIncludes,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneOperador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const operador = await Operador.findOne({
        where: { id: Number(id) },
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(operador);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createOperador(req: Request, res: Response) {
    let operador = req.body;
    if (operador.pessoa) {
      operador.id_pessoa = operador.pessoa.id;
      delete operador.pessoa;
    }
    try {
      const operadorCreated = await Operador.create(operador);
      return res.status(201).json(operadorCreated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOperador(req: Request, res: Response) {
    const { id } = req.params;
    let operador = req.body;
    if (operador.pessoa) {
      operador.id_pessoa = operador.pessoa.id;
      delete operador.pessoa;
    }
    delete operador.id;
    try {
      await Operador.update(operador, { where: { id: Number(id) } });
      const operadorUpdated = await Operador.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(operadorUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOperador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Operador.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Operador apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllOperadorDeleted(req: Request, res: Response) {
    try {
      const operador = await Operador.scope("deleted").findAll({
        paranoid: false,
        include: [Pessoa],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(operador);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreOperador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Operador.restore({ where: { id: Number(id) } });
      const operadorUpdated = await Operador.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(operadorUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
