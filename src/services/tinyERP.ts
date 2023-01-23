import Orcamento from "../models/Orcamento";
import Pessoa from "../models/Pessoa";
import moment from "moment";
import momentBussiness from "moment-business-days";
import Pessoa_Empresa from "../models/Pessoa_Empresa";
export class TinyERP {
  static formato = "json";

  constructor() {}

  static async postData(url = "", data = {}, token: string) {
    let dados = { ...data, token: token, formato: this.formato };
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "same-origin", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(dados), // body data type must match "Content-Type" header
    });
    const stream = await response.body?.getReader().read();

    let jsonBuffer = Buffer.from(stream?.value!);

    let jsonString = jsonBuffer.toString("utf8");
    console.log(jsonString);
    return JSON.parse(jsonString); // parses JSON response into native JavaScript objects
  }

  static async getPessoaPorCNPJ_CPF(cnpj_cpf: string, token: string) {
    let request = {};
    return this.postData(
      "https://api.tiny.com.br/api2/contatos.pesquisa.php?token=" +
        token +
        "&formato=JSON&cpf_cnpj=" +
        cnpj_cpf,
      request,
      token
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
        JSON.stringify(request),
      request,
      token
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
        obs: orcamento.observacao,
      },
    };

    return this.postData(
      "https://api.tiny.com.br/api2/pedido.incluir.php?token=" +
        token +
        "&formato=JSON&pedido=" +
        JSON.stringify(request),
      request,
      token
    );
  }
}
