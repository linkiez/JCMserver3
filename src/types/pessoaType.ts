import { ContatoType } from "./contatoType";

export type PessoaType = {
  id?: number;
  nome?: string;
  razao_social?: string;
  pessoa_juridica?: Boolean;
  telefone?: number;
  email?: string;
  email_nfe?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  cep?: number;
  ie_rg?: number;
  cnpj_cpf?: number;
  data_nasc?: Date;
  descricao?: Text;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  contato?: Array<ContatoType>;
};
