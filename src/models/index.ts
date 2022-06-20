import Pessoa from './Pessoa.js'
import Contato from './Contato.js'
import Produto from './Produto.js'
import Fornecedor from './Fornecedor.js'
import ListaGenerica from "./ListaGenerica.js";
import ListaGenericaItem from "./ListaGenericaItem.js";
import PedidoCompra from "./PedidoCompra.js";
import PedidoCompraItem from "./PedidoCompraItem.js";
import Usuario from './Usuario.js';
import Vendedor from './Vendedor.js';
import Orcamento from './Orcamento.js';
import OrcamentoItem from './OrcamentoItem.js';
import Operador from './Operador.js';
import RegistroInspecaoRecebimento from './RegistroInspecaoRecebimento.js'

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
}
