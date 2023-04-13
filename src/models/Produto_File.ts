import sequelize from "../config/connPostgre";
import { Model } from "sequelize";

export default class Produto_File extends Model {
  static associate() {
    // define association here
  }
}
Produto_File.init(
  {},
  {
    sequelize,
    modelName: "produto_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
