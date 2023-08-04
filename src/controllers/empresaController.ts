import { Request, Response } from "express";
import Empresa from "../models/Empresa";
import Pessoa from "../models/Pessoa";
import { Op } from "sequelize";
import File from "../models/File";

export default class EmpresaController {
  static async findAllEmpresas(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue,
      };

      let resultado: { empresas: Empresa[]; totalRecords: Number } = {
        empresas: [],
        totalRecords: 0,
      };

      let queryWhere: any = {
        nome: { [Op.like]: "%" + consulta.searchValue + "%" },
      };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      resultado.empresas = await Empresa.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        include: [
          {
            model: Pessoa,
            where:
              consulta.searchValue !== "undefined" ? queryWhere : undefined,
            paranoid: false,
          },
          File,
        ],
        paranoid: req.query.deleted === "true" ? false : true,
        attributes: { exclude: ["id_pessoa", "id_file", "token_tiny"] },
      });
      resultado.totalRecords = await Empresa.count({
        include: [
          {
            model: Pessoa,
            where:
              consulta.searchValue !== "undefined" ? queryWhere : undefined,
            paranoid: false,
          },
        ],
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneEmpresa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const empresa = await Empresa.findOne({
        where: { id: Number(id) },
        include: [{ model: Pessoa, paranoid: false }, File],
        attributes: { exclude: ["id_pessoa", "id_file"] },
      });
      return res.status(200).json(empresa);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createEmpresa(req: Request, res: Response) {
    let empresa = req.body;
    if (empresa.pessoa) {
      empresa.id_pessoa = empresa.pessoa.id;
      delete empresa.pessoa;
    }
    try {
      const empresaCreated = await Empresa.create(empresa);
      return res.status(201).json(empresaCreated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateEmpresa(req: Request, res: Response) {
    const { id } = req.params;
    let empresa = req.body;
    if (empresa.pessoa) {
      empresa.id_pessoa = empresa.pessoa.id;
      delete empresa.pessoa;
    }
    delete empresa.id;
    try {
      await Empresa.update(empresa, { where: { id: Number(id) } });
      const empresaUpdated = await Empresa.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(empresaUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyEmpresa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Empresa.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Empresa apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllEmpresaDeleted(req: Request, res: Response) {
    try {
      const empresa = await Empresa.scope("deleted").findAll({
        paranoid: false,
        include: [{model:Pessoa, paranoid: false}],
        attributes: { exclude: ["id_pessoa"] },
      });
      return res.status(200).json(empresa);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreEmpresa(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Empresa.restore({ where: { id: Number(id) } });
      const empresaUpdated = await Empresa.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(empresaUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
