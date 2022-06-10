import sequelize from "../config/connection.js";
import { Model, DataTypes, Op, Identifier } from "sequelize";
import Contato from "./Contato.js";
import Fornecedor from "./Fornecedor.js";
import File from "./File.js";

export default class Pessoa extends Model {
  id?: number;
  nome?: string;
  razao_social?: string;
  pessoa_juridica?: boolean;
  telefone?: number;
  email?: string;
  email_nfe?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  cep?: number;
  ie_rg?: number;
  cnpj_cpf?: number;
  data_nasc?: Date;
  descricao?: Text;
  deletedAt?: Date;
  updateAt?: Date;
  createAt?: Date;
  contatos?: Array<Contato>;
  files?: Array<File>


  static associate() {
    // define association here
    Pessoa.hasMany(Contato, { foreignKey: "id_pessoa" });
    Pessoa.hasOne(Fornecedor, { foreignKey: "id_pessoa" });
    Pessoa.belongsToMany(File, {through: 'pessoa_file'});
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
    scopes: {
      deleted: {
        where: {
          deletedAt: {[Op.not]: null},
        },
      },
    },
  }
);
