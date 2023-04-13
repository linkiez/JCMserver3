import sequelize from "../config/connPostgre";
import {
  Model,
  DataTypes,
  Op
} from "sequelize";
import OrdemProducao from "./OrdemProducao";
import Usuario from "./Usuario";

export default class OrdemProducaoHistorico extends Model {
  declare id: number;
  declare texto: string;

  static associate() {
    OrdemProducaoHistorico.belongsTo(OrdemProducao, {
        foreignKey: "id_ordem_producao",
      });
    OrdemProducaoHistorico.belongsTo(Usuario, {
        foreignKey: "id_usuario",
    })
  }
}
OrdemProducaoHistorico.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    texto: DataTypes.TEXT,
    
  },
  {
    sequelize,
    modelName: "ordem_producao_historico",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
