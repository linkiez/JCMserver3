import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import PedidoCompra from "./PedidoCompra.js";
import Produto from "./Produto.js";

export default class PedidoCompraItem extends Model {
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
  Produto?: Produto;

  static associate() {
    // define association here
    PedidoCompraItem.belongsTo(PedidoCompra, { foreignKey: "id_pedido" });
    PedidoCompraItem.belongsTo(Produto, { foreignKey: "id_produto" })
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
    timestamps: true
  }
);
