import e, { Request, Response } from "express";
import Operador from "../models/Operador";
import Pessoa from "../models/Pessoa";
import Produto from "../models/Produto";
import RIR from "../models/RIR";
import FileDb from "../models/File";
import PedidoCompraItem from "../models/PedidoCompraItem";
import RegistroInspecaoRecebimento_File from "../models/RIR_File";
import { Op, Transaction } from "sequelize";
import PedidoCompra from "../models/PedidoCompra";
import Fornecedor from "../models/Fornecedor";
import OrcamentoItem from "../models/OrcamentoItem";
import Orcamento from "../models/Orcamento";
import OrdemProducao from "../models/OrdemProducao";
import OrdemProducaoItem from "../models/OrdemProducaoItem";

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
        {
          model: Pessoa,
          include: [{ model: Fornecedor, paranoid: false }],
          paranoid: false,
        },
        {
          model: Produto,
          where: whereProduto,
          required: false,
          paranoid: false,
        },
        {
          model: Operador,
          include: [{ model: Pessoa, paranoid: false }],
          attributes: { exclude: ["id_pessoa"] },
        },
        FileDb,
        { model: PedidoCompraItem, include: [PedidoCompra] },
        { model: OrdemProducaoItem, include: [] },
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
        include: [
          {
            model: Pessoa,
            include: [{ model: Fornecedor, paranoid: false }],
            paranoid: false,
          },
          { model: Produto, paranoid: false },
          { model: Operador, paranoid: false },
          FileDb,
          PedidoCompraItem,
        ],
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

  static async findAllRIRsByPessoaAndProduto(req: Request, res: Response) {
    try {
      const { id_pessoa, id_produto } = req.params;
      const rirs = await RIR.findAll({
        where: { id_pessoa: Number(id_pessoa), id_produto: Number(id_produto) },
        include: [
          { model: Pessoa, paranoid: false },
          { model: Produto, paranoid: false },
          { model: Operador, paranoid: false },
          FileDb,
          PedidoCompraItem,
        ],
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
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createRIR(req: Request, res: Response) {
    const transaction = await RIR.sequelize?.transaction();
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
        // delete rir.pedido_compra_item;
      }

      if (!rir.id)
        rir.id = ((await RIR.max("id", { paranoid: false })) as number) + 1;

      const rirCreated = await RIR.create(rir, { transaction });

      if (rir.files) {
        for (let file of rir.files) {
          await RegistroInspecaoRecebimento_File.create({
            fileId: file.id,
            registroInspecaoRecebimentoId: rirCreated.id,
          });
        }
      }

      if(rir.pedido_compra_item)await atualizarPesoEntreguePedidoDeCompraItem(rir.pedido_compra_item, transaction!);

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
      transaction?.commit();
      return res.status(201).json(rir);
    } catch (error: any) {
      transaction?.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateRIR(req: Request, res: Response) {
    const transaction = await RIR.sequelize?.transaction();
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
        // delete rir.pedido_compra_item;
      }

      if (rir.files) {
        let filesOld = await RegistroInspecaoRecebimento_File.findAll({
          where: { registroInspecaoRecebimentoId: Number(id) },
        });
        if (filesOld.length > 0) {
          for (let file of filesOld) {
            let search = rir.files.find(
              (item: FileDb) => item.id === file.fileId
            );
            if (!search) {
              await RegistroInspecaoRecebimento_File.destroy({
                where: { fileId: file.fileId }, transaction
              });
            }
          }
        }
        for (let file of rir.files) {
          await RegistroInspecaoRecebimento_File.findOrCreate({
            where: {
              fileId: file.id,
              registroInspecaoRecebimentoId: id,
            }, transaction
          });
        }
      }

      await RIR.update(rir, { where: { id: Number(id) }, transaction });

      if(rir.pedido_compra_item)await atualizarPesoEntreguePedidoDeCompraItem(rir.pedido_compra_item, transaction!);

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
      transaction?.commit()
      return res.status(202).json(rirUpdated);
    } catch (error: any) {
      transaction?.rollback()
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

async function atualizarPesoEntreguePedidoDeCompraItem(
  pedido_compra_item: PedidoCompraItem, transaction: Transaction
) {

  let pedidoCompra = await PedidoCompra.findOne({
    where: { id: pedido_compra_item.id_pedido },
    include: [{ model: PedidoCompraItem, include: [RIR] }],
  });
  for (let pedidoCompraItem of pedidoCompra?.pedido_compra_items || []) {
    let peso_entregue = 0;
    for (let rir of pedidoCompraItem.registro_inspecao_recebimentos || []) {
      peso_entregue = peso_entregue + rir.quantidade;
    }
    let PCIStatus = "Aguardando";
    if (peso_entregue > 0) {
      PCIStatus = "Entregue Parcial";
    }
    if (peso_entregue >= (pedidoCompraItem.peso ?? 0) * 0.9) {
      PCIStatus = "Entregue";
    }

    await PedidoCompraItem.update(
      { peso_entregue, status: PCIStatus },
      { where: { id: pedidoCompraItem.id }, transaction }
    );
  }

  pedidoCompra = await PedidoCompra.findOne({
    where: { id: pedido_compra_item.id_pedido },
    include: [{ model: PedidoCompraItem, include: [RIR] }],
  });

  pedidoCompra!.status = "Aprovado";
  const pedidoCompraItemStatus = pedidoCompra?.pedido_compra_items.map(
    (item: PedidoCompraItem) => item.status
  );
  const countEntregue = pedidoCompraItemStatus?.filter(
    (status: string) => status === "Entregue"
  ).length;

  const countEntregueParcial = pedidoCompraItemStatus?.filter(
    (status: string) => status === "Entregue Parcial"
  ).length;

  let PCStatus = "Aprovado";

  if (countEntregue === pedidoCompra?.pedido_compra_items.length)
    PCStatus = "Entregue";
  else if (
    countEntregue &&
    countEntregueParcial &&
    (countEntregue > 0 || countEntregueParcial > 0)
  )
    PCStatus = "Entregue Parcial";

  await PedidoCompra.update(
    { status: PCStatus },
    { where: { id: pedidoCompra?.id }, transaction }
  );
}
