import { sequelize } from "./index.js";

import { Model, DataTypes } from "sequelize";

export class Produto extends Model {
  static associate(models: any) {
    // define association here
    Produto.hasMany(models.PedidoComprasItens);
  }
}
Produto.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    categoria: DataTypes.STRING,
    espessura: DataTypes.STRING,
    peso: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "produto",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    defaultScope: {
      where: { deletedAt: null },
    },
  }
);
