import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import Orcamento from "./Orcamento";
import OrdemProducao from "./OrdemProducao";

export default class Empresa extends Model {
  declare id: number;
  declare senha: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Empresa.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    Empresa.hasMany(Orcamento, { foreignKey: "id_empresa" });
    Empresa.hasMany(OrdemProducao, { foreignKey: "id_empresa" });
  }
}
Empresa.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    deletedAt: DataTypes.DATE,
    token_tiny: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "empresa",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
