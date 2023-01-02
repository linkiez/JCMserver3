import sequelize from "../config/connMySql";
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
    modelName: "produto_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
