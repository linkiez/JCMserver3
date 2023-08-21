import { Request, Response } from "express";
import RNC from "../models/RNC";
import { Op } from "sequelize";
import OrdemProducao from "../models/OrdemProducao";
import Usuario from "../models/Usuario";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import Pessoa from "../models/Pessoa";
import Orcamento from "../models/Orcamento";
import Vendedor from "../models/Vendedor";

export default class RNCController {
  static async findAllRNC(req: Request, res: Response) {
    try {
      const consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue || "",
      };

      let resultados: { rncs: RNC[]; totalRecords: number } = {
        rncs: [],
        totalRecords: 0,
      };

      let where: any = {};

      if (consulta.searchValue !== "undefined" && consulta.searchValue !== "") {
        where = {
          [Op.or]: [{ id: consulta.searchValue }],
        };
      }

      const include = [
        {
          model: OrdemProducaoItem,
          include: [
            {
              model: OrdemProducao,
              include: [
                { model: Orcamento, include: [Pessoa] },
                { model: Vendedor, include: [Pessoa] },
              ],
            },
          ],
        },
        { model: Usuario, include: [Pessoa] },
      ];

      resultados.rncs = await RNC.findAll({
        include,
        limit: consulta.pageCount,
        offset: consulta.page * consulta.pageCount,
        where,
      });

      resultados.totalRecords = await RNC.count({
        include,
        where,
      });
      return res.status(200).json(resultados);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async findOneRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const rnc = await RNC.findByPk(id, {
        include: [],
      });
      return res.status(200).json(rnc);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async createRNC(req: Request, res: Response) {
    try {
      const rnc = await RNC.create(req.body);
      return res.status(201).json(rnc);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async updateRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const [number, rnc] = await RNC.update(req.body, {
        where: { id: id },
        returning: true,
      });
      return res.status(200).json(rnc);
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async deleteRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await RNC.destroy({ where: { id: id } });
      return res.status(204).json("RNC deletado com sucesso!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }

  static async restoreRNC(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await RNC.restore({ where: { id: id } });
      return res.status(204).json("RNC restaurado com sucesso!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  }
}
