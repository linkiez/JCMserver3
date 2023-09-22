import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import OrdemProducaoHistorico from "./OrdemProducaoHistorico";
import RNC from "./RNC";

export default class Usuario extends Model {
  declare id: number;
  declare email: string;
  declare senha?: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;
  declare acesso: any;

  static associate() {
    // define association here
    Usuario.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    Usuario.hasMany(OrdemProducaoHistorico, { foreignKey: "id_usuario" })
    Usuario.hasMany(RNC, { foreignKey: "responsavel_analise_id",})
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
      type: DataTypes.CITEXT,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha: DataTypes.STRING,
    acesso: DataTypes.JSON,
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
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
