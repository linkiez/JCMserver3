import sequelize from "../config/connMySql";
import { Model } from "sequelize";

export default class Pessoa_Contato extends Model {
  static associate() {
    // define association here
  }
}
Pessoa_Contato.init(
  {},
  {
    sequelize,
    modelName: "pessoa_contato",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  } 
);
