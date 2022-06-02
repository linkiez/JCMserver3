import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import Pessoa from "./Pessoa.js";

export default class Fornecedor extends Model {
  static associate() {
    // define association here
    Fornecedor.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
  }
}
Fornecedor.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    data_aprov: DataTypes.DATE,
    data_venc: DataTypes.DATE,
    observacao: DataTypes.TEXT,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "fornecedor",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    defaultScope: {
      where: { deletedAt: null },
    },
  }
);
