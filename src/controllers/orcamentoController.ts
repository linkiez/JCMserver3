import { Request, Response } from "express";
import sequelize from "../config/connMySql.js";
import Orcamento from "../models/Orcamento.js";
import OrcamentoItem from "../models/OrcamentoItem.js";
import Orcamento_File from "../models/Orcamento_File.js";
import FileDb from "../models/File.js";
import Contato from "../models/Contato.js";
import Pessoa from "../models/Pessoa.js";
import Vendedor from "../models/Vendedor.js";

export default class OrcamentoController {
  static async findAllOrcamento(req: Request, res: Response){
    try{ 
      let orcamento = await Orcamento.findAll()
      return res.status(200).json(orcamento)

    }catch(error: any){
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllOrcamentosDeleted(req: Request, res: Response) {
    try {
      const orçamentos = await Orcamento.scope("deleted").findAll({
        paranoid: false,
      });
      return res.status(200).json(orçamentos);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try{ 
      let orcamento = await Orcamento.findByPk(id, {
        include: [
          {
            model: OrcamentoItem,
            include: [FileDb],
            attributes: { exclude: ["id_orcamento"] },
          },
          Contato,
          Pessoa,
          Vendedor,
        ],
        attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
      })
      return res.status(200).json(orcamento)
    }catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async createOrcamento(req: Request, res: Response) {
    const transaction = sequelize.transaction();
    try {
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> =
        orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato) orcamento.id_contato = orcamento.contato.id;
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;

      let orcamentoCreated: Orcamento = await Orcamento.create(orcamento);

      orcamentoItens = orcamentoItens.map(async (orcamentoItem: any) => {
        let files = orcamentoItem.files;
        delete orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
          delete orcamentoItem.produto;
        }

        orcamentoItem.id_orcamento = orcamentoCreated.id;

        let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem);

        if (files) {
          await orcamentoItemCreated.setFiles(files.map((item: any) => item.id));
        }

        return orcamentoItemCreated;
      });

      Promise.all(orcamentoItens).then(async (orcamentoItem) => {
        let orcamentoCreated2 = await Orcamento.findByPk(orcamentoCreated!.id, {
          include: [
            {
              model: OrcamentoItem,
              include: [FileDb],
              attributes: { exclude: ["id_orcamento"] },
            },
            Contato,
            Pessoa,
            Vendedor,
          ],
          attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
        });

        (await transaction).commit();
        return res.status(201).json(orcamentoCreated2);
      });
    } catch (error: any) {
      (await transaction).rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOrcamento(req: Request, res: Response) {
    const transaction = sequelize.transaction();
    try {
      const { id } = req.params;
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> =
        orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato) orcamento.id_contato = orcamento.contato.id;
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;
      delete orcamento.id;

      await Orcamento.update(orcamento, {where: { id: Number(id) }})

      await OrcamentoItem.destroy({ where: { id_orcamento: Number(id) } })

      orcamentoItens = orcamentoItens.map(async (orcamentoItem: any) => {
        let files = orcamentoItem.files;
        delete orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
          delete orcamentoItem.produto;
        }

        orcamentoItem.id_orcamento = id;

        let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem);

        if (files) {
          await orcamentoItemCreated.setFiles(files.map((item: any) => item.id));
        }

        return orcamentoItemCreated;
      });

      Promise.all(orcamentoItens).then(async (orcamentoItem) => {
        let orcamentoUpdated = await Orcamento.findByPk(id, {
          include: [
            {
              model: OrcamentoItem,
              include: [FileDb],
              attributes: { exclude: ["id_orcamento"] },
            },
            Contato,
            Pessoa,
            Vendedor,
          ],
          attributes: { exclude: ["id_pessoa", "id_vendedor", "id_contato"] },
        });

        (await transaction).commit();
        return res.status(201).json(orcamentoUpdated);
      });


    } catch (error: any) {
      (await transaction).rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Orcamento apagado` });
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.restore({ where: { id: Number(id) } });
      const orcamentoUpdated = await Orcamento.findOne({ where: { id: Number(id) } });
      return res.status(202).json(orcamentoUpdated);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
