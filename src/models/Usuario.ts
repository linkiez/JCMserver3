import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";

export default class Usuario extends Model {
  declare id: number;
  declare email: string;
  senha?: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Usuario.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
  }
}
Usuario.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    senha: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "usuario",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: {[Op.not]: null},
        },
      },
    },
  }
);
