import { Request, Response } from "express";
import Operador from "../models/Operador";
import Pessoa from "../models/Pessoa";
import Produto from "../models/Produto";
import RIR from "../models/RIR";
import FileDb from "../models/File";
import PedidoCompraItem from "../models/PedidoCompraItem";

export default class RIRController {
  static async findAllRIRs(req: Request, res: Response) {
    try {
      const rir = await RIR.findAll({
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: ["id_pessoa", "id_produto", "id_operador", "id_file", "id_pedido_compra_item"],
        },
      });
      return res.status(200).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findOneRIR(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const rir = await RIR.findOne({
        where: { id: Number(id) },
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: ["id_pessoa", "id_produto", "id_operador", "id_file", "id_pedido_compra_item"],
        },
      });
      return res.status(200).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async createRIR(req: Request, res: Response) {
    let rir = req.body;
    if (rir.pessoa) {
      rir.id_pessoa = rir.pessoa.id;
      delete rir.pessoa;
    }
    if (rir.produto) {
      rir.id_produto = rir.produto.id;
      delete rir.produto;
    }
    if (rir.operador) {
      rir.id_operador = rir.operador.id;
      delete rir.operador;
    }
    if (rir.file) {
      rir.id_file = rir.file.id;
      delete rir.file;
    }
    if (rir.pedido_compra_item) {
      rir.id_pedido_compra_item = rir.pedido_compra_item.id;
      delete rir.pedido_compra_item;
    }
    try {
      const rirCreated = await RIR.create(rir);
      return res.status(201).json(rirCreated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async updateRIR(req: Request, res: Response) {
    const { id } = req.params;
    let rir = req.body;
    if (rir.pessoa) {
      rir.id_pessoa = rir.pessoa.id;
      delete rir.pessoa;
    }
    if (rir.produto) {
      rir.id_produto = rir.produto.id;
      delete rir.produto;
    }
    if (rir.operador) {
      rir.id_operador = rir.operador.id;
      delete rir.operador;
    }
    if (rir.file) {
      rir.id_file = rir.file.id;
      delete rir.file;
    }
    if (rir.pedido_compra_item) {
      rir.id_pedido_compra_item = rir.pedido_compra_item.id;
      delete rir.pedido_compra_item;
    }
    delete rir.id;
    try {
      await RIR.update(rir, { where: { id: Number(id) } });
      const rirUpdated = await RIR.findOne({
        where: { id: Number(id) },
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: ["id_pessoa", "id_produto", "id_operador", "id_file", "id_pedido_compra_item"],
        },
      });
      return res.status(202).json(rirUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async destroyRIR(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await RIR.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `RIR apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async findAllRIRDeleted(req: Request, res: Response) {
    try {
      const rir = await RIR.scope("deleted").findAll({
        paranoid: false,
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: ["id_pessoa", "id_produto", "id_operador", "id_file", "id_pedido_compra_item"],
        },
      });
      return res.status(200).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }

  static async restoreRIR(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await RIR.restore({ where: { id: Number(id) } });
      const rirUpdated = await RIR.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(rirUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error)
      return res.status(500).json(error.message);
    }
  }
}
