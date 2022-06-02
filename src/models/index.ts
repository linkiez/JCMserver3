import Pessoa from './Pessoa.js'
import Contato from './Contato.js'
import Produto from './Produto.js'
import Fornecedor from './Fornecedor.js'


export function models(): void {
  Pessoa.associate()
  Contato.associate()
  Produto.associate()
  Fornecedor.associate()
}
