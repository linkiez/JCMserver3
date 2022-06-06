import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import ListaGenericaItem from "./ListaGenericaItem.js";

export default class ListaGenerica extends Model {
  static associate() {
    // define association here
    ListaGenerica.hasMany(ListaGenericaItem, { foreignKey: "id_lista", onDelete: 'cascade'})
  }
}
ListaGenerica.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "lista_generica",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);

