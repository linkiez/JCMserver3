import sequelize from "../config/connPostgre";
import { Model, DataTypes } from "sequelize";
import PedidoCompra from "./PedidoCompra";
import Produto from "./Produto";
import RegistroInspecaoRecebimento from "./RIR";

export default class PedidoCompraItem extends Model {
  declare id: number;
  declare dimensao: string;
  declare quantidade: number;
  declare peso: number;
  declare preco: number;
  declare ipi: number;
  declare prazo: Date;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_pedido: number;
  declare id_produto: number;
  declare produto: Produto;

  static associate() {
    // define association here
    PedidoCompraItem.belongsTo(PedidoCompra, { foreignKey: "id_pedido" });
    PedidoCompraItem.belongsTo(Produto, { foreignKey: "id_produto" });
    PedidoCompraItem.hasOne(RegistroInspecaoRecebimento, {
      foreignKey: "id_pedido_compra_item",
    });
  }
}
PedidoCompraItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    dimensao: DataTypes.CITEXT,
    quantidade: DataTypes.FLOAT,
    peso: DataTypes.FLOAT,
    preco: DataTypes.FLOAT,
    ipi: DataTypes.FLOAT, 
    prazo: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "pedido_compra_item",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);
