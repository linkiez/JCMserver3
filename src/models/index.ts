import Pessoa from './Pessoa'
import Contato from './Contato'
import Produto from './Produto'
import Fornecedor from './Fornecedor'
import ListaGenerica from "./ListaGenerica";
import ListaGenericaItem from "./ListaGenericaItem";
import PedidoCompra from "./PedidoCompra";
import PedidoCompraItem from "./PedidoCompraItem";
import Usuario from './Usuario';
import Vendedor from './Vendedor';
import Orcamento from './Orcamento';
import OrcamentoItem from './OrcamentoItem';
import Operador from './Operador';
import RegistroInspecaoRecebimento from './RIR'
import OrdemProducao from './OrdemProducao';
import OrdemProducaoItem from './OrdemProducaoItem';
import OrdemProducaoItemProcesso from './OrdemProducaoItemProcesso';
import Empresa from './Empresa';
import VendaTiny from './VendaTiny';

export function models(): void {
  Pessoa.associate()
  Contato.associate()
  Produto.associate()
  Fornecedor.associate()
  ListaGenerica.associate()
  ListaGenericaItem.associate()
  PedidoCompra.associate()
  PedidoCompraItem.associate()
  Usuario.associate()
  Vendedor.associate()
  Orcamento.associate()
  OrcamentoItem.associate()
  Operador.associate()
  RegistroInspecaoRecebimento.associate()
  OrdemProducao.associate()
  OrdemProducaoItem.associate()
  OrdemProducaoItemProcesso.associate()
  Empresa.associate()
  VendaTiny.associate()
}
