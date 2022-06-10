import sequelize from "../config/connection.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";

export default class file extends Model {
  url?: string
  originalFilename?: string
  newFilename?: string
  bucket?: string
  region?: string

  static associate() {
    // define association here
    file.belongsToMany(Pessoa, {through: 'pessoa_file'});
  }
}
file.init(
  {
    url: DataTypes.STRING,
    originalFilename: DataTypes.STRING,
    newFilename: DataTypes.STRING,
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
