import { Express } from "express";
import authRoutes from "./authRoutes";
import contatoRoutes from "./contatoRoutes";
import empresaRoutes from "./empresaRoutes";
import fileRoutes from "./fileRoutes";
import fornecedorRoutes from "./fornecedorRoutes";
import produtoRoutes from "./produtoRoutes";
import usuarioRoutes from "./usuarioRoutes";
import listaGenericaRoutes from "./listaGenericaRoutes";
import operadorRoutes from "./operadorRoutes";
import orcamentoRoutes from "./orcamentoRoutes";
import ordemProducaoRoutes from "./ordemProducaoRoutes";
import pedidoCompraRoutes from "./pedidoCompraRoutes";
import pessoaRoutes from "./pessoaRoutes";
import RIRRoutes from "./RIRRoutes";
import vendedorRoutes from "./vendedorRoutes";
import healthRoutes from "./healthRoutes";

export async function routes(app: Express) {
  app.use(
    authRoutes,
    contatoRoutes,
    empresaRoutes,
    fileRoutes,
    fornecedorRoutes,
    produtoRoutes,
    usuarioRoutes,
    listaGenericaRoutes,
    operadorRoutes,
    orcamentoRoutes,
    ordemProducaoRoutes,
    pedidoCompraRoutes,
    pessoaRoutes,
    RIRRoutes,
    vendedorRoutes,
    healthRoutes
  );
}
