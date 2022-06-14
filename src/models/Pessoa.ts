import sequelize from "../config/connection.js";
import {
  Model,
  DataTypes,
  Op,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
} from "sequelize";
import Contato from "./Contato.js";
import Fornecedor from "./Fornecedor.js";
import File from "./File.js";
import Usuario from "./Usuario.js";
import Vendedor from "./Vendedor.js";

export default class Pessoa extends Model {
  declare id: number;
  declare nome: string;
  declare razao_social: string;
  declare pessoa_juridica: boolean;
  declare telefone: number;
  declare email: string;
  declare email_nfe: string;
  declare endereco: string;
  declare municipio: string;
  declare uf: string;
  declare cep: number;
  declare ie_rg: number;
  declare cnpj_cpf: number;
  declare data_nasc: Date;
  declare descricao: Text;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare contatos: Array<Contato>;
  declare files: Array<File>;

  declare getFiles: HasManyGetAssociationsMixin<File>; //
  declare addFile: HasManyAddAssociationMixin<File, number>;
  declare addFiles: HasManyAddAssociationsMixin<File, number>;
  declare setFiles: HasManySetAssociationsMixin<File, number>;
  declare removeFile: HasManyRemoveAssociationMixin<File, number>;
  declare removeFiles: HasManyRemoveAssociationsMixin<File, number>;
  declare hasFile: HasManyHasAssociationMixin<File, number>;
  declare hasFiles: HasManyHasAssociationsMixin<File, number>;
  declare countFiles: HasManyCountAssociationsMixin;

  declare getContatos: HasManyGetAssociationsMixin<Contato>;
  declare addContato: HasManyAddAssociationMixin<Contato, number>;
  declare addContatos: HasManyAddAssociationsMixin<Contato, number>;
  declare setContatos: HasManySetAssociationsMixin<Contato, number>;
  declare removeContato: HasManyRemoveAssociationMixin<Contato, number>;
  declare removeContatos: HasManyRemoveAssociationsMixin<Contato, number>;
  declare hasContato: HasManyHasAssociationMixin<Contato, number>;
  declare hasContatos: HasManyHasAssociationsMixin<Contato, number>;
  declare countContatos: HasManyCountAssociationsMixin;


  static associate() {
    // define association here
    Pessoa.hasOne(Fornecedor, { foreignKey: "id_pessoa" });
    Pessoa.hasOne(Usuario, { foreignKey: "id_pessoa" });
    Pessoa.hasOne(Vendedor, { foreignKey: "id_pessoa" });
    Pessoa.belongsToMany(File, { through: "pessoa_file" });
    Pessoa.belongsToMany(Contato, { through: "pessoa_contato" });
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
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
