import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";
import Orcamento from "./Orcamento.js";
import OrdemProducao from "./OrdemProducao.js";

export default class Vendedor extends Model {
  declare id: number;
  declare senha: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Vendedor.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
    Vendedor.hasMany(Orcamento, { foreignKey: "id_vendedor" })
    Vendedor.hasMany(OrdemProducao, { foreignKey: "id_vendedor"})
  }
}
Vendedor.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "vendedor",
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
