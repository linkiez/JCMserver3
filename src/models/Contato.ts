import sequelize from "../config/connPostgre";

import { Model, DataTypes } from "sequelize";
import Pessoa from "./Pessoa";
import Orcamento from "./Orcamento";

export default class Contato extends Model {
  declare id: number;
  declare nome: string;
  declare tipo: string;
  declare valor: number;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;

  static associate() {
    // define association here
    Contato.belongsToMany(Pessoa, { through: "pessoa_contato" });
    Contato.hasMany(Orcamento, { foreignKey: "id_contato" });
  }
}
Contato.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    tipo: DataTypes.STRING,
    valor: {
      type: DataTypes.STRING,
      unique: true,
    },
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "contato",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);
