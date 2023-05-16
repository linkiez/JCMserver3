import sequelize from "../config/connPostgre";
import { DataTypes, Model } from "sequelize";

export default class Vendedor_Empresa extends Model {
  declare id_tinyerp: string;

  static associate() {
    // define association here
  }
}
Vendedor_Empresa.init(
  {
    id_tinyerp: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "vendedor_empresa",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
