import sequelize from "../config/connMySql.js";
import { Model } from "sequelize";

export default class Pessoa_File extends Model {
  static associate() {
    // define association here
  }
}
Pessoa_File.init(
  {},
  {
    sequelize,
    modelName: "pedido_compra_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
