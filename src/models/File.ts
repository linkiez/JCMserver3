import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";
import OrcamentoItem from "./OrcamentoItem.js";
import RegistroInspecaoRecebimento from "./RIR.js";

export default class file extends Model {
  declare id: number
  declare url: string
  declare originalFilename: string
  declare newFilename: string
  declare mimeType: string
  declare bucket: string
  declare region: string

  static associate() {
    // define association here
    file.belongsToMany(Pessoa, {through: 'pessoa_file'});
    file.belongsToMany(OrcamentoItem, {through: 'orcamento_file'});
    file.hasMany(RegistroInspecaoRecebimento, { foreignKey: 'id_file'})
  }
}
file.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    url: DataTypes.STRING,
    originalFilename: DataTypes.STRING,
    newFilename: DataTypes.STRING,
    mimeType: DataTypes.STRING,
    bucket: DataTypes.STRING,
    region: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "file",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
