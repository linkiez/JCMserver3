import sequelize from "../config/connPostgre";
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
    modelName: "pessoa_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
