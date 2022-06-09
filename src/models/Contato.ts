import sequelize from "../config/connection.js";

import { Model, DataTypes } from "sequelize";
import Pessoa from './Pessoa.js' 

export default class Contato extends Model {
  static associate() {
    // define association here
    Contato.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
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

