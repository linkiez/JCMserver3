import sequelize from "../config/connection.js";
import { Model, DataTypes, Op } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem.js";
import Produto from "./Produto.js";
import Pessoa from "./Pessoa.js";
import Operador from "./Operador.js";
import FileDb from "./File.js";

export default class RegistroInspecaoRecebimento extends Model {
  declare id: number;
  declare rir: string;
  declare descricao: string;
  declare produto: Produto;
  declare id_produto: number;
  declare quantidade: number;
  declare nfe: string;
  declare nfe_data: Date;
  declare cliente: boolean;
  declare pessoa: Pessoa;
  declare id_pessoa: number;
  declare recebido_data: Date;
  declare operador: Operador;
  declare id_operador: number;
  declare conferido: boolean;
  declare pedido_compra_item: PedidoCompraItem;
  declare id_pedido_compra_item: number;
  declare ordem_producao: number;
  declare observacoes: string;
  declare file: FileDb;
  declare id_file: number;

  static associate() {
    RegistroInspecaoRecebimento.belongsTo(Produto, { foreignKey: 'id_produto'})
    RegistroInspecaoRecebimento.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
    RegistroInspecaoRecebimento.belongsTo(Operador, { foreignKey: 'id_operador'})
    RegistroInspecaoRecebimento.belongsTo(PedidoCompraItem, { foreignKey: 'id_pedido_compra_item'})
    RegistroInspecaoRecebimento.belongsTo(FileDb, { foreignKey: 'id_file'})
  }
}
RegistroInspecaoRecebimento.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    rir: DataTypes.STRING,
    descricao: DataTypes.STRING,
    quantidade: DataTypes.FLOAT,
    nfe: DataTypes.STRING,
    nfe_data: DataTypes.DATE,
    cliente: DataTypes.BOOLEAN,
    recebido_data: DataTypes.DATE,
    conferido: DataTypes.BOOLEAN,
    observacoes: DataTypes.TEXT
  },
  {
    sequelize,
    modelName: "registro_inspecao_recebimento",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
