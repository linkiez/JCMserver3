import { PessoaType } from "./pessoaType";

export type FornecedorType = {
  id?: number;
  data_aprov?: Date;
  data_venc?: Date;
  observacao?: string,
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  id_pessoa?: number;
  pessoa?: PessoaType
};
