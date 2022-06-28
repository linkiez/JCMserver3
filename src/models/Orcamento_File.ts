import sequelize from "../config/connMySql.js";
import { Model } from "sequelize";

export default class OrcamentoItem_File extends Model {
  static associate() {
    // define association here
    
  }
}
OrcamentoItem_File.init(
  {},
  {
    sequelize,
    modelName: "orcamento_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
