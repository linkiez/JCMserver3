import { Request, Response } from "express";
import sequelize from "../config/connection.js";
import Orcamento from '../models/Orcamento.js'
import OrcamentoItem from "../models/OrcamentoItem.js"

export default class OrcamentoController {
  static async createOrcamento(req: Request, res: Response) {
    const transaction = sequelize.transaction();
    try {
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> = orcamento.OrcamentoItem;
      delete orcamento.OrcamentoItem;

        orcamento.id_pessoa = orcamento.pessoa.id;
        orcamento.id_contato = orcamento.contato.id;
        orcamento.id_vendedor = orcamento.vendedor.id;

        delete orcamento.pessoa
        delete orcamento.contato
        delete orcamento.vendedor

        let orcamentoCreated: Orcamento | null = await Orcamento.create(orcamento);

        orcamentoItens = orcamentoItens.map(async(orcamentoItem) =>{
            let files = orcamentoItem.files;
            delete orcamentoItem.files;

            let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem)
            orcamentoItemCreated.setFiles(files.map((item) => item.id))

            return orcamentoItemCreated
        })

        Promise.all(orcamentoItens).then(async (orcamentoItem) =>{
            orcamentoCreated!.addOrcamentoItems(orcamentoItem);

            orcamentoCreated = await Orcamento.findByPk(orcamentoCreated!.id, {include: [OrcamentoItem]});

            (await transaction).commit();
            return res.status(201).json(orcamentoCreated);

        });
    } catch (error) {
      (await transaction).rollback;
      console.log(error);
      return res.status(500).json(error.message);
    }
  }
}
