import sequelize from "../config/connMySql.js";
import { Model, DataTypes } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem.js";
import Fornecedor from "./Fornecedor.js";
import File from "./File.js";


export default class PedidoCompra extends Model {
  declare id: number;
  declare pedido: string;
  declare status: string;
  declare data_emissao: Date;
  declare cond_pagamento: string;
  declare frete: number;
  declare transporte: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare PedidoCompraItem: Array<PedidoCompraItem>;
  declare id_fornecedor: number;
  declare Fornecedor: Fornecedor;
  declare total: number;
  declare observacao: string;
  declare files: Array<File>;


  static associate() {
    // define association here
    PedidoCompra.hasMany(PedidoCompraItem, {
      foreignKey: "id_pedido",
      onDelete: "cascade",
    });
    PedidoCompra.belongsTo(Fornecedor, { foreignKey: "id_fornecedor" });
    PedidoCompra.belongsToMany(File, { through: "pedido_compra_file" });
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
    frete: DataTypes.DECIMAL(13, 2),
    transporte: DataTypes.STRING,
    total: DataTypes.DECIMAL(13, 2),
    status: DataTypes.STRING,
    observacao: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "pedido_compra",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    
  }
);
