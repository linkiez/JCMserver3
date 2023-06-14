import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem";
import Produto from "./Produto";
import Pessoa from "./Pessoa";
import Operador from "./Operador";
import FileDb from "./File";
import OrdemProducaoItem from "./OrdemProducaoItem";
import OrcamentoItem from "./OrcamentoItem";

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
  declare observacoes: string;
  declare file: FileDb[];
  static id: number;


  static associate() {
    RegistroInspecaoRecebimento.belongsTo(Produto, {
      foreignKey: "id_produto",
    });
    RegistroInspecaoRecebimento.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    RegistroInspecaoRecebimento.belongsTo(Operador, {
      foreignKey: "id_operador",
    });
    RegistroInspecaoRecebimento.belongsTo(PedidoCompraItem, {
      foreignKey: "id_pedido_compra_item",
    });
    RegistroInspecaoRecebimento.belongsToMany(FileDb, {
      through: "registro_inspecao_recebimento_file",
    });

    RegistroInspecaoRecebimento.hasOne(OrdemProducaoItem, {
      foreignKey: "id_rir",
    });
    RegistroInspecaoRecebimento.hasOne(OrcamentoItem, {
      foreignKey: "id_rir",
    });
  }
}
RegistroInspecaoRecebimento.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    descricao: DataTypes.CITEXT,
    quantidade: DataTypes.FLOAT,
    nfe: DataTypes.CITEXT,
    nfe_data: DataTypes.DATE,
    recebido_data: DataTypes.DATE,
    conferido: DataTypes.BOOLEAN,
    observacoes: DataTypes.TEXT,
    cliente: DataTypes.BOOLEAN,
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
