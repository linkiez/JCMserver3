import e, { Request, Response } from "express";
import Operador from "../models/Operador";
import Pessoa from "../models/Pessoa";
import Produto from "../models/Produto";
import RIR from "../models/RIR";
import FileDb from "../models/File";
import PedidoCompraItem from "../models/PedidoCompraItem";
import RegistroInspecaoRecebimento_File from "../models/RIR_File";
import { Op } from "sequelize";
import PedidoCompra from "../models/PedidoCompra";

export default class RIRController {
  static async findAllRIRs(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue: req.query.searchValue || "",
      };

      let resultado: { rirs: RIR[]; totalRecords: Number } = {
        rirs: [],
        totalRecords: 0,
      };

      let queryWhere: any = {};

      if (consulta.searchValue !== "undefined" && consulta.searchValue !== "") {
        if (!isNaN(Number(consulta.searchValue)))
          queryWhere.id = consulta.searchValue;
      }

      let whereProduto = undefined;
      if (isNaN(Number(consulta.searchValue)))
        whereProduto = {
          nome: { [Op.like]: "%" + consulta.searchValue + "%" },
        };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      const include = [
        Pessoa,
        { model: Produto, where: whereProduto, required: false },
        {
          model: Operador,
          include: [Pessoa],
          attributes: { exclude: ["id_pessoa"] },
        },
        FileDb,
        { model: PedidoCompraItem, include: [PedidoCompra] },
      ];

      resultado.rirs = await RIR.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        include: include,
        attributes: {
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_file",
            "id_pedido_compra_item",
          ],
        },
        order: [["id", "DESC"]],
        paranoid: req.query.deleted === "true" ? false : true,
      });

      resultado.totalRecords = await RIR.count({
        where: consulta.searchValue !== "undefined" ? queryWhere : undefined,
        include: include,
        paranoid: req.query.deleted === "true" ? false : true,
      });
      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_file",
            "id_pedido_compra_item",
          ],
        },
      });
      return res.status(200).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllRIRsByPessoaAndProduto(req: Request, res: Response){
    try{
      const { id_pessoa, id_produto } = req.params;
      const rirs = await RIR.findAll({
        where: { id_pessoa: Number(id_pessoa), id_produto: Number(id_produto) },
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_file",
            "id_pedido_compra_item",
          ],
        },
      });
      return res.status(200).json(rirs);
    }catch(error: any){
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }

  }

  static async createRIR(req: Request, res: Response) {
    try {
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
      if (rir.pedido_compra_item) {
        rir.id_pedido_compra_item = rir.pedido_compra_item.id;
        delete rir.pedido_compra_item;
      }

      if (!rir.id)
        rir.id =
          ((await RIR.max("id", { paranoid: false })) as number) + 1;

      const rirCreated = await RIR.create(rir);

      if (rir.files) {
        for (let file of rir.files) {
          await RegistroInspecaoRecebimento_File.create({
            fileId: file.id,
            registroInspecaoRecebimentoId: rirCreated.id,
          });
        }
      }

      rir = await RIR.findOne({
        where: { id: rirCreated.id },
        include: [
          Pessoa,
          { model: Produto },
          {
            model: Operador,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
          FileDb,
          { model: PedidoCompraItem, include: [PedidoCompra] },
        ],
        attributes: {
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_pedido_compra_item",
          ],
        },
      });
      return res.status(201).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateRIR(req: Request, res: Response) {
    try {
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
      if (rir.pedido_compra_item) {
        rir.id_pedido_compra_item = rir.pedido_compra_item.id;
        delete rir.pedido_compra_item;
      }
      

      if (rir.files) {
        let filesOld = await RegistroInspecaoRecebimento_File.findAll({
          where: { registroInspecaoRecebimentoId: Number(id) },
        });
        for (let file of filesOld) {
          let search = rir.file.find((item: FileDb) => item.id === file.fileId);
          if (!search) {
            await RegistroInspecaoRecebimento_File.destroy({
              where: { fileId: file.fileId },
            });
          }
        }
        for (let file of rir.files) {
          await RegistroInspecaoRecebimento_File.findOrCreate({
            where: {
              fileId: file.id,
              registroInspecaoRecebimentoId: id,
            },
          });
        }
      }

      await RIR.update(rir, { where: { id: Number(id) } });
      const rirUpdated = await RIR.findOne({
        where: { id: Number(id) },
        include: [
          Pessoa,
          { model: Produto },
          {
            model: Operador,
            include: [Pessoa],
            attributes: { exclude: ["id_pessoa"] },
          },
          FileDb,
          { model: PedidoCompraItem, include: [PedidoCompra] },
        ],
        attributes: {
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_pedido_compra_item",
          ],
        },
      });
      return res.status(202).json(rirUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyRIR(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await RIR.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `RIR apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findAllRIRDeleted(req: Request, res: Response) {
    try {
      const rir = await RIR.scope("deleted").findAll({
        paranoid: false,
        include: [Pessoa, Produto, Operador, FileDb, PedidoCompraItem],
        attributes: {
          exclude: [
            "id_pessoa",
            "id_produto",
            "id_operador",
            "id_file",
            "id_pedido_compra_item",
          ],
        },
      });
      return res.status(200).json(rir);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }
}
