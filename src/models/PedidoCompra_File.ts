import sequelize from "../config/connPostgre";
import { Model } from "sequelize";

export default class PedidoCompra_File extends Model {
  static associate() {
    // define association here
  }
}
PedidoCompra_File.init(
  {},
  {
    sequelize,
    modelName: "pedido_compra_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
