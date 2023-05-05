import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Operador from "./Operador";
import OrdemProducaoItem from "./OrdemProducaoItem";

export default class OrdemProducaoItemProcesso extends Model {
  declare id: number;
  declare processo: string;
  declare operador: Operador;
  declare id_operador: number;
  declare fabricado: Date;

  static associate() {
    OrdemProducaoItemProcesso.belongsTo(Operador, {
      foreignKey: "id_operador",
    });
    OrdemProducaoItemProcesso.belongsTo(OrdemProducaoItem, {
      foreignKey: "id_ordem_producao_item",
    });
  }
}
OrdemProducaoItemProcesso.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    processo: DataTypes.CITEXT,
    inicio: DataTypes.DATE,
    fabricado: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "ordem_producao_item_processo",
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
