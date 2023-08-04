import { Request, Response } from "express";
import { Op } from "sequelize";
import Fornecedor from "../models/Fornecedor";
import Pessoa from "../models/Pessoa";

export default class FornecedorController {
  static async findAllFornecedors(req: Request, res: Response) {
    let consulta: any = {
      pageCount: Number(req.query.pageCount) || 10,
      page: Number(req.query.page) || 0,
      searchValue: req.query.searchValue,
    };

    try {
      let resultado: { fornecedores: Fornecedor[]; totalRecords: Number } = {
        fornecedores: [],
        totalRecords: 0,
      };
      let queryWhere: any = {
        [Op.or]: [
          { nome: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { cnpj_cpf: { [Op.like]: "%" + consulta.searchValue + "%" } },
          { telefone: { [Op.like]: "%" + consulta.searchValue + "%" } },
        ],
      };

      resultado.fornecedores = await Fornecedor.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        include: [{ model: Pessoa, required: true, where: queryWhere, order: [['nome', 'ASC']], paranoid: false }],
        attributes: { exclude: ["id_pessoa"] },
      });

      resultado.totalRecords = await Fornecedor.count({
        include: [{ model: Pessoa, required: true, where: queryWhere, paranoid: false }],
        attributes: { exclude: ["id_pessoa"] },
      });
      
      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findOneFornecedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const fornecedor = await Fornecedor.findOne({
        where: { id: Number(id) },
        include: [{model:Pessoa, paranoid: false}],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(fornecedor);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async createFornecedor(req: Request, res: Response) {
    let fornecedor = req.body;
    if (fornecedor.pessoa) {
      fornecedor.id_pessoa = fornecedor.pessoa.id;
      delete fornecedor.pessoa;
    }
    try {
      const fornecedorCreated = await Fornecedor.create(fornecedor);
      return res.status(201).json(fornecedorCreated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async updateFornecedor(req: Request, res: Response) {
    const { id } = req.params;
    let fornecedor = req.body;
    if (fornecedor.pessoa) {
      fornecedor.id_pessoa = fornecedor.pessoa.id;
      delete fornecedor.pessoa;
    }
    delete fornecedor.id;
    try {
      await Fornecedor.update(fornecedor, { where: { id: Number(id) } });
      const fornecedorUpdated = await Fornecedor.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(fornecedorUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async destroyFornecedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Fornecedor.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Fornecedor apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllFornecedorDeleted(req: Request, res: Response) {
    try {
      const fornecedor = await Fornecedor.scope("deleted").findAll({
        paranoid: false,
        include: [{model:Pessoa, paranoid: false}],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(fornecedor);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async restoreFornecedor(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Fornecedor.restore({ where: { id: Number(id) } });
      const fornecedorUpdated = await Fornecedor.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(fornecedorUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }
}
