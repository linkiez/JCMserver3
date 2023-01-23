import sequelize from "../config/connPostgre";
import { DataTypes, Model } from "sequelize";

export default class Pessoa_Empresa extends Model {
  declare id_tinyerp: string;

  static associate() {
    // define association here
  }
}
Pessoa_Empresa.init(
  {
    id_tinyerp: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "pessoa_empresa",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
