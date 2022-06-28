import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import ListaGenerica from "./ListaGenerica.js";

export default class ListaGenericaItem extends Model {
  declare id: number;
  declare valor: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_lista: number;
  
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
    scopes: {
      deleted: {
        where: {
          deletedAt: {[Op.not]: null},
        },
      },
    },
  }
);

