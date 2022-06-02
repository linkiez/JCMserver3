import Pessoa from './Pessoa.js'
import Contato from './Contato.js'
import Produto from './Produto.js'


export function models(): void {
  Pessoa.associate()
  Contato.associate()
  Produto.associate()
}
