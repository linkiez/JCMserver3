import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import ListaGenerica from "./ListaGenerica.js";

export default class ListaGenericaItem extends Model {
  static associate() {
    // define association here
    ListaGenericaItem.belongsTo(ListaGenerica, { foreignKey: "id_lista" })
  }
}
ListaGenericaItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    valor: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "lista_generica_item",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    defaultScope: {
      where: { deletedAt: null },
    },
  }
);

