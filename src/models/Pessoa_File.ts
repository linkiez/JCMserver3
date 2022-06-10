import sequelize from "../config/connection.js";
import { Model } from "sequelize";

export default class Pessoa extends Model {
  static associate() {
    // define association here
  }
}
Pessoa.init(
  {},
  {
    sequelize,
    modelName: "pessoa_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
