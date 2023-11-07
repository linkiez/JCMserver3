import { TinyERP } from "./../services/tinyERP";
import { Request, Response } from "express";
import sequelize from "../config/connPostgre";
import Orcamento from "../models/Orcamento";
import OrcamentoItem from "../models/OrcamentoItem";
import FileDb from "../models/File";
import Contato from "../models/Contato";
import Pessoa from "../models/Pessoa";
import Vendedor from "../models/Vendedor";
import Produto from "../models/Produto";
import { Op, Sequelize } from "sequelize";
import Empresa from "../models/Empresa";
import Pessoa_Empresa from "../models/Pessoa_Empresa";
import VendaTiny from "../models/VendaTiny";
import momentBussiness from "moment-business-days";
import OrdemProducao from "../models/OrdemProducao";
import OrdemProducaoItem from "../models/OrdemProducaoItem";
import OrdemProducaoItemProcesso from "../models/OrdemProducaoItemProcesso";
import PedidoCompraItem from "../models/PedidoCompraItem";
import PedidoCompra from "../models/PedidoCompra";
import Vendedor_Empresa from "../models/Vendedor_Empresa";
import Pessoa_Contato from "../models/Pessoa_Contato";
import File from "../models/File";
import RegistroInspecaoRecebimento from "../models/RIR";

export default class OrcamentoController {
  static async findAllOrcamento(req: Request, res: Response) {
    try {
      let consulta: any = {
        pageCount: Number(req.query.pageCount) || 10,
        page: Number(req.query.page) || 0,
        searchValue:
          req.query.searchValue == '""'
            ? ""
            : JSON.parse(req.query.searchValue as string),
        vendedor:
          req.query.vendedor !== "undefined"
            ? JSON.parse(req.query.vendedor as string)
            : undefined,
      };

      let resultado: { orcamento: Orcamento[]; totalRecords: Number } = {
        orcamento: [],
        totalRecords: 0,
      };

      let queryWhere: any = {};

      if (consulta.searchValue !== "undefined" && consulta.searchValue !== "") {
        if (!isNaN(Number(consulta.searchValue)))
          queryWhere.id = consulta.searchValue;
        else
          queryWhere[Op.or] = [
            {
              "$contato.nome$": {
                [Op.like]: "%" + consulta.searchValue + "%",
              },
            },
            {
              "$pessoa.nome$": { [Op.like]: "%" + consulta.searchValue + "%" },
            },
          ];
      }

      let wherePessoa = undefined;
      if (isNaN(Number(consulta.searchValue)))
        wherePessoa = { nome: { [Op.like]: "%" + consulta.searchValue + "%" } };

      if (req.query.deleted === "true")
        queryWhere = { ...queryWhere, deletedAt: { [Op.not]: null } };

      const include = [
        {
          model: Vendedor,
          include: [{ model: Pessoa, paranoid: false }],
          where: consulta.vendedor ? { id: consulta.vendedor.id } : undefined,
          paranoid: false,
        },
        {
          model: Pessoa,
          paranoid: false,
        },
        { model: Contato, 
          paranoid: false },
      ];

      resultado.orcamento = await Orcamento.findAll({
        limit: consulta.pageCount,
        offset: consulta.pageCount * consulta.page,
        where: queryWhere,
        paranoid: req.query.deleted === "true" ? false : true,
        include: include,
        order: [["id", "DESC"]],
      });

      resultado.totalRecords = await Orcamento.count({
        where: queryWhere,
        include: include,
        paranoid: req.query.deleted === "true" ? false : true,
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.log("Request: ", req.body, "Erro: ", error);
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
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async findOneOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      let orcamento = await Orcamento.findOne({
        where: { id: id },
        include: [
          { model: Contato, paranoid: false },
          {
            model: Empresa,
            attributes: { exclude: ["token_tiny", "id_file", "id_pessoa"] },
            include: [Pessoa, File],
            paranoid: false,
          },
          { model: Pessoa, paranoid: false },
          {
            model: Vendedor,
            include: [{ model: Pessoa, paranoid: false }],
            paranoid: false,
          },
          VendaTiny,
          {
            model: OrcamentoItem,
            include: [
              {
                model: Produto,
                include: [
                  {
                    model: PedidoCompraItem,
                    attributes: {
                      include: [
                        [Sequelize.literal("(preco*(ipi+1))"), "precoComIpi"],
                        // [Sequelize.fn('max', Sequelize.col('pedido_compra_item.updatedAt')), 'atualizado']
                      ],
                    },
                    order: [["id_pedido", "DESC"]],
                    limit: 1,
                    separate: true,
                    include: [
                      {
                        model: PedidoCompra,
                        required: true,
                        where: {
                          status: {
                            [Op.and]: [
                              { [Op.not]: "Cancelado" },
                              { [Op.not]: "Orçamento" },
                            ],
                          },
                          data_emissao: {
                            [Op.gte]: sixMonthsAgo,
                          },
                        },
                      },
                    ],
                  },
                ],
                paranoid: false,
              },
              FileDb,
              RegistroInspecaoRecebimento,
            ],
          },
        ],
      });
      return res.status(200).json(orcamento);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async createOrcamento(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> | Array<Promise<OrcamentoItem>> =
        orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato.id) {
        orcamento.id_contato = orcamento.contato.id;
        if (orcamento.id_pessoa && orcamento.id_contato)
          await Pessoa_Contato.findOrCreate({
            where: {
              contatoId: orcamento.id_contato,
              pessoaId: orcamento.id_pessoa,
            },
          });
      } else {
        if (orcamento.contato.nome && orcamento.contato.valor) {
          let contato = await Contato.findOrCreate({
            where: { valor: orcamento.contato.valor },
            defaults: orcamento.contato,
            // transaction: transaction,
          });
          orcamento.id_contato = contato[0].id;
          if (orcamento.id_pessoa && orcamento.id_contato)
            await Pessoa_Contato.findOrCreate({
              where: {
                contatoId: orcamento.id_contato,
                pessoaId: orcamento.id_pessoa,
              },
            });
        }
      }
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;
      if (orcamento.empresa) orcamento.id_empresa = orcamento.empresa.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;
      delete orcamento.produto;

      if (!orcamento.id)
        orcamento.id =
          ((await Orcamento.max("id", { paranoid: false })) as number) + 1;

      let orcamentoCreated: Orcamento = await Orcamento.create(orcamento, {
        transaction: transaction,
      });

      orcamentoItens = orcamentoItens.map(async (orcamentoItem: any) => {
        let files = orcamentoItem.files;
        delete orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
          delete orcamentoItem.produto;
        } else {
          throw new Error("Produto não encontrado");
        }

        if (orcamentoItem.registro_inspecao_recebimento)
          orcamentoItem.id_rir = orcamentoItem.registro_inspecao_recebimento.id;
        delete orcamentoItem.registro_inspecao_recebimento;

        orcamentoItem.id_orcamento = orcamentoCreated.id;

        delete orcamentoItem.id;

        let orcamentoItemCreated = await OrcamentoItem.create(orcamentoItem, {
          transaction: transaction,
        });

        if (files) {
          await orcamentoItemCreated.setFiles(
            files.map((item: any) => item.id),
            { transaction: transaction }
          );
        }

        return orcamentoItemCreated;
      });

      Promise.all(orcamentoItens).then(async () => {
        await transaction.commit();

        let orcamentoCreated2 = await orcamentoFindByPk(
          orcamentoCreated!.id.toString()
        );

        return res.status(201).json(orcamentoCreated2);
      });
    } catch (error: any) {
      transaction.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async updateOrcamento(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      let orcamento = req.body;
      let orcamentoItens: Array<OrcamentoItem> = orcamento.orcamento_items;
      delete orcamento.orcamento_items;

      if (orcamento.pessoa) orcamento.id_pessoa = orcamento.pessoa.id;
      if (orcamento.contato.id) {
        orcamento.id_contato = orcamento.contato.id;
        delete orcamento.contato.id;
        Contato.update(orcamento.contato, {
          where: { id: orcamento.id_contato },
          // transaction: transaction,
        });
        if (orcamento.id_pessoa && orcamento.id_contato) {
          await Pessoa_Contato.findOrCreate({
            where: {
              contatoId: orcamento.id_contato,
              pessoaId: orcamento.id_pessoa,
            },
          });
        }
      } else {
        if (orcamento.contato.nome && orcamento.contato.valor) {
          let contato = await Contato.create(orcamento.contato, {
            // transaction: transaction,
          });
          orcamento.id_contato = contato.id;
          if (orcamento.id_pessoa && orcamento.id_contato) {
            await Pessoa_Contato.findOrCreate({
              where: {
                contatoId: orcamento.id_contato,
                pessoaId: orcamento.id_pessoa,
              },
            });
          }
        } else {
          throw new Error("Contato sem nome ou valor");
        }
      }
      if (orcamento.vendedor) orcamento.id_vendedor = orcamento.vendedor.id;
      if (orcamento.empresa) orcamento.id_empresa = orcamento.empresa.id;

      delete orcamento.pessoa;
      delete orcamento.contato;
      delete orcamento.vendedor;
      delete orcamento.id;

      await Orcamento.update(orcamento, {
        where: { id: Number(id) },
        transaction: transaction,
      });

      const orcamentoItemsOld: OrcamentoItem[] = await OrcamentoItem.findAll({
        where: { id_orcamento: Number(id) },
        transaction: transaction,
      });

      for (const orcamentoItemOld of orcamentoItemsOld) {
        if (
          !(orcamentoItens as OrcamentoItem[]).find(
            (orcamentoItem: any) => orcamentoItem.id === orcamentoItemOld.id
          )
        ) {
          await OrcamentoItem.destroy({
            where: { id: orcamentoItemOld.id },
            transaction: transaction,
            force: true,
          });
        }
      }

      for (let orcamentoItem of orcamentoItens) {
        let files: FileDb[] = orcamentoItem.files;

        if (orcamentoItem.produto) {
          orcamentoItem.id_produto = orcamentoItem.produto.id;
        } else {
          throw new Error("Produto não encontrado");
        }

        if (orcamentoItem.registro_inspecao_recebimento)
          orcamentoItem.id_rir = orcamentoItem.registro_inspecao_recebimento.id;

        orcamentoItem.id_orcamento = +id;

        let orcamentoItemNew: any = undefined;

        if (orcamentoItem.id) {
          await OrcamentoItem.update(orcamentoItem, {
            where: { id: orcamentoItem.id },
            transaction: transaction,
          });
          orcamentoItemNew = await OrcamentoItem.findByPk(orcamentoItem.id);
        } else {
          orcamentoItemNew = await OrcamentoItem.create(
            { ...orcamentoItem },
            {
              transaction: transaction,
            }
          );
        }

        if (files) {
          await orcamentoItemNew.setFiles(
            files.map((item: FileDb) => item.id),
            { transaction: transaction }
          );
        }
      }

      await transaction.commit();

      let orcamentoUpdated = await orcamentoFindByPk(id);

      return res.status(201).json(orcamentoUpdated);
    } catch (error: any) {
      transaction.rollback();
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async destroyOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.destroy({ where: { id: Number(id) } });
      return res.status(202).json({ message: `Orcamento apagado` });
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async restoreOrcamento(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await Orcamento.restore({ where: { id: Number(id) } });
      const orcamentoUpdated = await Orcamento.findOne({
        where: { id: Number(id) },
      });
      return res.status(202).json(orcamentoUpdated);
    } catch (error: any) {
      console.log("Resquest: ", req.body, "Erro: ", error);
      return res.status(500).json(error.message);
    }
  }

  static async aprovarOrcamento(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;

    try {
      const orcamento = await orcamentoFindByPk(id);

      if (!orcamento) {
        throw new Error("Orçamento não encontrado");
      }

      if (!orcamento.pessoa) {
        throw new Error("Pessoa não encontrada");
      }

      if (!orcamento.empresa) {
        throw new Error("Empresa para faturamento não encontrada");
      }

      if (!orcamento.pessoa.cnpj_cpf) {
        throw new Error("CNPJ/CPF da Pessoa não encontrado");
      }

      verificaPessoaTinyERP(orcamento);
      verificaVendedorTinyERP(orcamento);

      const createVenda = await createVendaForOrcamento(orcamento);

      if (createVenda.retorno.status === "Erro") {
        console.log(JSON.stringify(createVenda));
        throw new Error(createVenda.retorno.registros.registro.erros[0].erro);
      }

      const ordemProducao = await createOrdemProducaoForOrcamento(
        orcamento,
        createVenda
      );

      const { aprovacao } = req.body;

      const venda = await createVendaTinyForOrcamento(
        orcamento,
        ordemProducao,
        createVenda,
        aprovacao
      );

      await updateOrcamentoStatus(id, "Aprovado");

      const updatedOrcamento = await orcamentoFindByPk(id);

      return res.status(200).json(updatedOrcamento);
    } catch (error: any) {
      console.log("Request: ", req.body, "Error: ", error);
      return res.status(500).json(error.message);
    }
  }
}

async function createVendaForOrcamento(orcamento: any): Promise<any> {
  let createVenda: any = null;

  if (orcamento?.empresa.pessoa.cnpj_cpf == "42768425000195") {
    orcamento.orcamento_items = await Promise.all(
      orcamento.orcamento_items.map(async (item: OrcamentoItem) => {
        if (!item.produto.id_tiny) {
          const find = orcamento?.orcamento_items.find(
            (itemFind: OrcamentoItem) => {
              itemFind.produto.id_tiny &&
                itemFind.produto.id == item.produto.id;
            }
          );

          if (find) {
            item.produto.id_tiny = find.produto.id_tiny;
            await Produto.update(
              { id_tiny: find.produto.id_tiny },
              { where: { id: item.produto.id } }
            );
            return item;
          } else {
            const produtoRetorno = await TinyERP.getProduto(
              item.produto,
              orcamento!.empresa.token_tiny
            );

            if (produtoRetorno.retorno.status === "OK") {
              item.produto.id_tiny =
                produtoRetorno.retorno.produtos[0].produto.id;
              await Produto.update(
                { id_tiny: produtoRetorno.retorno.produtos[0].produto.id },
                { where: { id: item.produto.id } }
              );
              return item;
            }

            if (produtoRetorno.retorno.status === "Erro") {
              throw new Error(produtoRetorno.retorno.erros[0].erro);
            }
          }
        }

        return item;
      })
    );

    createVenda = await TinyERP.createVendaFmoreno(
      orcamento!,
      orcamento!.empresa.token_tiny
    );
  } else {
    createVenda = await TinyERP.createVenda(
      orcamento!,
      orcamento!.empresa.token_tiny
    );
  }

  return createVenda;
}

async function createOrdemProducaoForOrcamento(
  orcamento: any,
  createVenda: any
): Promise<any> {
  const ordemProducao = await OrdemProducao.create({
    id: createVenda.retorno.registros.registro.numero,
    id_orcamento: orcamento!.id,
    id_vendedor: orcamento!.vendedor.id,
    data_prazo: momentBussiness().businessAdd(orcamento!.prazo_emdias).toDate(),
    venda: createVenda.retorno.registros.registro.numero,
    status: "Aguardando",
  });

  for (let item of orcamento.orcamento_items) {
    const ordemProducaoItem = await OrdemProducaoItem.create({
      descricao: item.descricao,
      quantidade: item.quantidade,
      id_ordem_producao: ordemProducao.id,
      id_produto: item.produto.id,
      id_rir: item.registro_inspecao_recebimento?.id,
      id_orcamento_item: item.id,
    });

    await ordemProducaoItem.setFiles(item.files);

    item.processo.push("Inspeção");

    if (item.processo.includes("Laser") || item.processo.includes("Plasma")) {
      item.processo.push("Programação");
    }

    for (let processo of item.processo) {
      await OrdemProducaoItemProcesso.create({
        id_ordem_producao_item: ordemProducaoItem.id,
        processo: processo,
      });
    }
  }

  return ordemProducao;
}

async function createVendaTinyForOrcamento(
  orcamento: any,
  ordemProducao: any,
  createVenda: any,
  aprovacao: any
): Promise<any> {
  const venda = await VendaTiny.create({
    venda: createVenda.retorno.registros.registro.numero,
    id_orcamento: orcamento!.id,
    id_ordem_producao: ordemProducao.id,
    aprovacao: aprovacao,
    id_empresa: orcamento?.empresa.id,
  });

  return venda;
}

async function updateOrcamentoStatus(
  id: string,
  status: string
): Promise<void> {
  await Orcamento.update(
    { status: status, aprovado: true },
    { where: { id: Number(id) } }
  );
}

function orcamentoFindByPk(id: string) {
  return Orcamento.findOne({
    where: { id: Number(id) },
    include: [
      {
        model: OrcamentoItem,
        include: [
          FileDb,
          { model: Produto, paranoid: false },
          RegistroInspecaoRecebimento,
        ],
        attributes: { exclude: ["id_orcamento", "id_produto"] },
      },
      { model: Contato, paranoid: false },
      { model: Pessoa, paranoid: false },
      {
        model: Vendedor,
        include: [{ model: Pessoa, paranoid: false }],
        attributes: { exclude: ["id_pessoa"] },
        paranoid: false,
      },
      {
        model: Empresa,
        include: [{ model: Pessoa, paranoid: false }, FileDb],
        attributes: { exclude: ["id_pessoa", "id_file"] },
        paranoid: false,
      },
      {
        model: VendaTiny,
        include: [OrdemProducao],
        attributes: { exclude: ["id_ordem_producao"] },
      },
    ],
    attributes: {
      exclude: ["id_pessoa", "id_vendedor", "id_contato", "id_empresa"],
    },
  });
}

async function verificaPessoaTinyERP(orcamento: Orcamento) {
  const pessoa_Empresa = await Pessoa_Empresa.findOne({
    where: {
      pessoaId: orcamento.pessoa.id,
      empresaId: orcamento.empresa.id,
    },
  });

  if (pessoa_Empresa == null || !pessoa_Empresa.id_tinyerp) {
    const verificaPessoa = await TinyERP.getPessoaPorCNPJ_CPF(
      orcamento?.pessoa.cnpj_cpf,
      orcamento?.empresa.token_tiny
    );

    if (verificaPessoa.retorno.status === "OK") {
      await Pessoa_Empresa.create(
        {
          pessoaId: orcamento.pessoa.id,
          empresaId: orcamento.empresa.id,
          id_tinyerp: verificaPessoa.retorno.contatos[0].contato.id,
        }
        // { transaction: transaction }
      );
    } else if (
      verificaPessoa.retorno.erros[0].erro ==
      "A consulta não retornou registros"
    ) {
      const response = await TinyERP.createPessoa(
        orcamento.pessoa,
        orcamento.empresa.token_tiny
      );

      if (response.retorno.status === "Erro")
        throw new Error(response.retorno.erros[0].erro);

      if (response.retorno.status === "OK") {
        await Pessoa_Empresa.create(
          {
            pessoaId: orcamento.pessoa.id,
            empresaId: orcamento.empresa.id,
            id_tinyerp: response.retorno.registros[0].registro.id,
          }
          // { transaction: transaction }
        );
      }
    } else {
      throw new Error(verificaPessoa.retorno.erros[0].erro);
    }
  }
}

async function verificaVendedorTinyERP(orcamento: Orcamento) {
  const vendedor_Empresa = await Vendedor_Empresa.findOne({
    where: {
      vendedorId: orcamento.vendedor.id,
      empresaId: orcamento.empresa.id,
    },
  });

  if (vendedor_Empresa == null || !vendedor_Empresa.id_tinyerp) {
    const verificaVendedor = await TinyERP.getVendedorPorNome(
      orcamento?.vendedor.pessoa.nome,
      orcamento?.empresa.token_tiny
    );

    if (verificaVendedor.retorno.status === "OK") {
      await Vendedor_Empresa.create(
        {
          vendedorId: orcamento.vendedor.id,
          empresaId: orcamento.empresa.id,
          id_tinyerp: verificaVendedor.retorno.vendedores[0].vendedor.id,
        }
        // { transaction: transaction }
      );
    } else {
      throw new Error(verificaVendedor.retorno.erros[0].erro);
    }
  }
}
