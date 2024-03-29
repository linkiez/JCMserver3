import sequelize from "../config/connPostgre";
import { Model } from "sequelize";

export default class OrdemProducaoItem_File extends Model {
  declare fileId: number;
  declare ordemProducaoItemId: number;

  static associate() {
    // define association here
  }
}
OrdemProducaoItem_File.init(
  {},
  {
    sequelize,
    modelName: "ordem_producao_item_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
