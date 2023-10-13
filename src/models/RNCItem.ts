import { Model, DataTypes, Op } from "sequelize";
import OrdemProducaoItem from "./OrdemProducaoItem";
import sequelize from "../config/connPostgre";

import Produto from "./Produto";
import RNC from "./RNC";

export class RNCItem extends Model {
  declare id: number;
  declare id_rnc: number;
  declare id_produto: number;
  declare produto: Produto;
  declare quantidade: number;
  declare largura: number;
  declare altura: number;
  declare id_ordem_producao_item: number;
  declare ordem_producao_item: OrdemProducaoItem;

  static associate() {
    RNCItem.belongsTo(RNC, { foreignKey: "id_rnc" });

    RNCItem.belongsTo(OrdemProducaoItem, {
      foreignKey: "id_ordem_producao_item",
    });

    RNCItem.belongsTo(Produto, { foreignKey: "id_produto" });
  }
}
RNCItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    quantidade: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    largura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    altura: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "rnc_item",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
          paranoid: false,
        },
      },
    },
  }
);
