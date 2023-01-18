
import Pessoa from "../models/Pessoa";

export class TinyERP {
  static token = process.env.TINYERP_TOKEN;
  static formato = "json";

  constructor() {}

  static async postData(url = "", data = {}) {
    let dados = { ...data, token: this.token, formato: this.formato };
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
    const stream = await response.body?.getReader().read(); // parses JSON response into native JavaScript objects
    const jsonString = Buffer.from(stream?.value!).toString("utf8");
    console.log(jsonString);
    return JSON.parse(jsonString);
  }

  static async getPessoaPorCNPJ_CPF(cnpj_cpf: string) {
    let request = {};
    let response = this.postData(
      "https://api.tiny.com.br/api2/contatos.pesquisa.php?token=" +
        this.token +
        "&formato=JSON&cpf_cnpj=" +
        cnpj_cpf,
      request
    );
    return response;
  }

  static async createPessoa(pessoa: Pessoa) {
    let request = {
        "contatos": [
          {
            "contato": {
              "sequencia": "1",
              "nome": pessoa.nome,
              "tipo_pessoa": pessoa.pessoa_juridica ? "J" : "F",
              "cpf_cnpj": pessoa.cnpj_cpf,
              "ie": pessoa.pessoa_juridica ? pessoa.ie_rg : "",
              "rg": !pessoa.pessoa_juridica ? pessoa.ie_rg : "",
              "im": "",
              "endereco": pessoa.endereco,
              "numero": pessoa.numero,
              "complemento": "",
              "bairro": pessoa.bairro,
              "cep": pessoa.cep,
              "cidade": pessoa.municipio,
              "uf": pessoa.uf,
              "pais": "Brasil",
              "contatos": "",
              "fone": pessoa.telefone,
              "fax": "",
              "celular": "",
              "email": pessoa.email,
              "id_vendedor": "",
              "situacao": "A",
              "obs": pessoa.descricao,
              "contribuinte": "1"
            }
          }
        ]
      };
    let response = this.postData(
      "https://api.tiny.com.br/api2/contato.incluir.php?token=" +
      this.token + "&formato=JSON&contato=" + JSON.stringify(request),
      request
    );
    return response;
  }
}
