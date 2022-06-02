import { FornecedorType } from "./fornecedorType";
import { ProdutoType } from "./produtoType";

export type PedidoCompraType = {
  id?: number;
  pedido?: string;
  data_emissao?: Date;
  cond_pagamento?: string;
  frete?: number;
  transporte?: string;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  PedidoCompraItem?: Array<PedidoCompraItemType>;
  id_fornecedor?: number;
  Fornecedor?: FornecedorType;
  total?: number;
};

export type PedidoCompraItemType = {
  id?: number;
  dimensao?: string;
  quantidade?: number;
  peso?: number;
  preco?: number;
  ipi?: number;
  prazo?: Date;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  id_pedido?: number;
  id_produto?: number;
  Produto?: ProdutoType;
};
