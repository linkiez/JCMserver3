import sequelize from "../config/connection.js";
import { Model, DataTypes } from "sequelize";
import Contato from "./Contato.js";
import Fornecedor from "./Fornecedor.js";

export default class Pessoa extends Model {
  static associate() {
    // define association here
    Pessoa.hasMany(Contato, { foreignKey: "id_pessoa" });
    Pessoa.hasOne(Fornecedor, { foreignKey: "id_pessoa" })
  }
}
Pessoa.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    razao_social: DataTypes.STRING,
    pessoa_juridica: DataTypes.BOOLEAN,
    telefone: DataTypes.BIGINT,
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    email_nfe: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    endereco: DataTypes.STRING,
    municipio: DataTypes.STRING,
    uf: DataTypes.STRING(2),
    cep: DataTypes.INTEGER,
    ie_rg: {
      type: DataTypes.BIGINT,
      unique: true,
    },
    cnpj_cpf: {
      type: DataTypes.BIGINT,
      unique: true,
    },
    data_nasc: DataTypes.DATE,
    descricao: DataTypes.TEXT,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "pessoa",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    defaultScope: {
      where: { deletedAt: null },
    },
  }
);
