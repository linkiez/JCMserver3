import sequelize from "../config/connMySql.js";
import { Model, DataTypes } from "sequelize";
import PedidoCompra from "./PedidoCompra.js";
import Produto from "./Produto.js";
import RegistroInspecaoRecebimento from "./RIR.js";

export default class PedidoCompraItem extends Model {
  declare id: number;
  declare dimensao: string;
  declare quantidade: number;
  declare peso: number;
  declare preco: number;
  declare ipi: number;
  declare prazo: Date;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_pedido: number;
  declare id_produto: number;
  declare Produto: Produto;

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
    dimensao: DataTypes.STRING,
    quantidade: DataTypes.FLOAT,
    peso: DataTypes.FLOAT,
    preco: DataTypes.FLOAT,
    ipi: DataTypes.DECIMAL(5, 2),
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
