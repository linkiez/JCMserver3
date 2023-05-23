import sequelize from "../config/connPostgre";
import { Model } from "sequelize";

export default class RegistroInspecaoRecebimento_File extends 
Model {
  declare id: number;
  declare registroInspecaoRecebimentoId: number;
  declare fileId: number;
  
  static associate() {
    // define association here
  }
}
RegistroInspecaoRecebimento_File.init(
  {},
  {
    sequelize,
    modelName: "registro_inspecao_recebimento_file",
    paranoid: false,
    timestamps: true,
    freezeTableName: true,
  }
);
