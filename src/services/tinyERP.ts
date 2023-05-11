import Orcamento from "../models/Orcamento";
import Pessoa from "../models/Pessoa";
import moment from "moment";
import momentBussiness from "moment-business-days";
import Pessoa_Empresa from "../models/Pessoa_Empresa";
import Produto from "../models/Produto";
export class TinyERP {
  constructor() {}

  static async postData(url = "") {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "same-origin", // no-cors, *cors, same-origin
      cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      //body: JSON.stringify(dados), // body data type must match "Content-Type" header
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    // *** Fully read the response body and parse it from JSON:
    return await response.json();
  }

  static async getPessoaPorCNPJ_CPF(cnpj_cpf: string, token: string) {
    let request = {};
    return this.postData(
      "https://api.tiny.com.br/api2/contatos.pesquisa.php?token=" +
        token +
        "&formato=JSON&cpf_cnpj=" +
        cnpj_cpf
    );
  }

  static async createPessoa(pessoa: Pessoa, token: string) {
    let request = {
      contatos: [
        {
          contato: {
            sequencia: "1",
            nome: pessoa.nome,
            tipo_pessoa: pessoa.pessoa_juridica ? "J" : "F",
            cpf_cnpj: pessoa.cnpj_cpf,
            ie: pessoa.pessoa_juridica ? pessoa.ie_rg : "",
            rg: !pessoa.pessoa_juridica ? pessoa.ie_rg : "",
            im: "",
            endereco: pessoa.endereco,
            numero: pessoa.numero,
            complemento: "",
            bairro: pessoa.bairro,
            cep: pessoa.cep,
            cidade: pessoa.municipio,
            uf: pessoa.uf,
            pais: "Brasil",
            contatos: "",
            fone: pessoa.telefone,
            fax: "",
            celular: "",
            email: pessoa.email,
            id_vendedor: "",
            situacao: "A",
            obs: pessoa.descricao,
            contribuinte: "1",
          },
        },
      ],
    };
    return this.postData(
      "https://api.tiny.com.br/api2/contato.incluir.php?token=" +
        token +
        "&formato=JSON&contato=" +
        JSON.stringify(request)
    );
  }

  static async createVenda(orcamento: Orcamento, token: string) {
    momentBussiness.updateLocale("pt-BR", { workingWeekdays: [1, 2, 3, 4, 5] });
    const codigoCliente = await Pessoa_Empresa.findOne({
      where: { pessoaId: orcamento.pessoa.id, empresaId: orcamento.empresa.id },
    });
    let request = {
      pedido: {
        data_pedido: moment().format("DD-MM-YYYY"),
        data_prevista: momentBussiness()
          .businessAdd(orcamento.prazo_emdias)
          .format("DD-MM-YYYY"),
        cliente: {
          codigo: codigoCliente?.id_tinyerp,
          nome: orcamento.pessoa.nome,
          sequencia: "1",
          tipo_pessoa: orcamento.pessoa.pessoa_juridica ? "J" : "F",
          cpf_cnpj: orcamento.pessoa.cnpj_cpf,
          ie: orcamento.pessoa.pessoa_juridica ? orcamento.pessoa.ie_rg : "",
          rg: !orcamento.pessoa.pessoa_juridica ? orcamento.pessoa.ie_rg : "",
          im: "",
          endereco: orcamento.pessoa.endereco,
          numero: orcamento.pessoa.numero,
          complemento: "",
          bairro: orcamento.pessoa.bairro,
          cep: orcamento.pessoa.cep,
          cidade: orcamento.pessoa.municipio,
          uf: orcamento.pessoa.uf,
          pais: "Brasil",
          contatos: "",
          fone: orcamento.pessoa.telefone,
          fax: "",
          celular: "",
          email: orcamento.pessoa.email,
          id_vendedor: "",
          situacao: "A",
          obs: orcamento.pessoa.descricao,
          contribuinte: "1",
        },
        itens: orcamento.orcamento_items.map((item, index) => {
          return {
            item: {
              descricao: `${item.produto.nome} - ${item.descricao} - ${item.largura}x${item.altura}mm ${item.quantidade}PC`,
              unidade: "UN",
              quantidade: item.quantidade,
              valor_unitario: item.total / item.quantidade,
            },
          };
        }),
        valor_frete: orcamento.frete,
        valor_desconto: orcamento.desconto,
        numero_ordem_compra: orcamento.pc_cliente,
        situacao: "Aberto",
        obs: orcamento.observacao + "/n Orçamento: " + orcamento.id,
        nome_vendedor: orcamento.vendedor.pessoa.nome,
      },
    };
    console.log("Request Create Venda: ", request);
    return this.postData(
      "https://api.tiny.com.br/api2/pedido.incluir.php?token=" +
        token +
        "&formato=JSON&pedido=" +
        JSON.stringify(request)
    );
  }

  static async createVendaFmoreno(orcamento: Orcamento, token: string) {
    momentBussiness.updateLocale("pt-BR", { workingWeekdays: [1, 2, 3, 4, 5] });
    const codigoCliente = await Pessoa_Empresa.findOne({
      where: { pessoaId: orcamento.pessoa.id, empresaId: orcamento.empresa.id },
    });
    let request = {
      pedido: {
        data_pedido: moment().format("DD-MM-YYYY"),
        data_prevista: momentBussiness()
          .businessAdd(orcamento.prazo_emdias)
          .format("DD-MM-YYYY"),
        cliente: {
          codigo: codigoCliente?.id_tinyerp,
          nome: orcamento.pessoa.nome,
          sequencia: "1",
          tipo_pessoa: orcamento.pessoa.pessoa_juridica ? "J" : "F",
          cpf_cnpj: orcamento.pessoa.cnpj_cpf,
          ie: orcamento.pessoa.pessoa_juridica ? orcamento.pessoa.ie_rg : "",
          rg: !orcamento.pessoa.pessoa_juridica ? orcamento.pessoa.ie_rg : "",
          im: "",
          endereco: orcamento.pessoa.endereco,
          numero: orcamento.pessoa.numero,
          complemento: "",
          bairro: orcamento.pessoa.bairro,
          cep: orcamento.pessoa.cep,
          cidade: orcamento.pessoa.municipio,
          uf: orcamento.pessoa.uf,
          pais: "Brasil",
          contatos: "",
          fone: orcamento.pessoa.telefone,
          fax: "",
          celular: "",
          email: orcamento.pessoa.email,
          id_vendedor: "",
          situacao: "A",
          obs: orcamento.pessoa.descricao,
          contribuinte: "1",
        },
        itens: orcamento.orcamento_items.map((item, index) => {
          return {
            item: {
              codigo: item.produto.id_tiny,
              descricao: item.produto.nome,
              unidade: "KG",
              quantidade: item.total_peso,
              valor_unitario: item.total / item.total_peso,
            },
          };
        }),
        valor_frete: orcamento.frete,
        valor_desconto: orcamento.desconto,
        numero_ordem_compra: orcamento.pc_cliente,
        situacao: "Aberto",
        obs: orcamento.observacao  + "/n Orçamento: " + orcamento.id,
        nome_vendedor: orcamento.vendedor.pessoa.nome,
      },
    };

    return this.postData(
      "https://api.tiny.com.br/api2/pedido.incluir.php?token=" +
        token +
        "&formato=JSON&pedido=" +
        JSON.stringify(request)
    );
  }

  static getProduto(produto: Produto, token: string) {
    return this.postData(
      "https://api.tiny.com.br/api2/produtos.pesquisa.php?token=" +
        token +
        "&formato=JSON&pesquisa=" +
        produto.nome
    );
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
