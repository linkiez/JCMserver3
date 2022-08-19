import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import ListaGenericaItem from "./ListaGenericaItem.js";

export default class ListaGenerica extends Model {
  declare id: number;
  declare nome: string;
  declare ListaGenericaItem: Array<ListaGenericaItem>;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  
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
    scopes: {
      deleted: {
        where: {
          deletedAt: {[Op.not]: null},
        },
      },
    },
  }
);

