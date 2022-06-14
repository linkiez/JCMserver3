import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem.js";
import Fornecedor from "./Fornecedor.js";

export default class PedidoCompra extends Model {
  declare id: number;
  declare pedido: string;
  declare data_emissao: Date;
  declare cond_pagamento: string;
  declare frete: number;
  declare transporte: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare PedidoCompraItem: Array<PedidoCompraItem>;
  declare id_fornecedor: number;
  declare Fornecedor: Fornecedor;
  declare total: number;

  static associate() {
    // define association here
    PedidoCompra.hasMany(PedidoCompraItem, {
      foreignKey: "id_pedido",
      onDelete: "cascade",
    });
    PedidoCompra.belongsTo(Fornecedor, { foreignKey: "id_fornecedor" });
  }
}
PedidoCompra.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    pedido: DataTypes.STRING,
    data_emissao: DataTypes.DATE,
    cond_pagamento: DataTypes.STRING,
    frete: DataTypes.DECIMAL(10, 2),
    transporte: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "pedido_compra",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    
  }
);
