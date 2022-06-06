import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem.js";

export default class Produto extends Model {
  static associate() {
    // define association here
    Produto.hasOne(PedidoCompraItem,  { foreignKey: "id_produto" })
  }
}
Produto.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    categoria: DataTypes.STRING,
    espessura: DataTypes.STRING,
    peso: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "produto",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);
