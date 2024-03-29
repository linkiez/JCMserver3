import sequelize from "../config/connPostgre";
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
import Contato from "./Contato";
import Fornecedor from "./Fornecedor";
import File from "./File";
import Usuario from "./Usuario";
import Vendedor from "./Vendedor";
import Orcamento from "./Orcamento";
import RegistroInspecaoRecebimento from "./RIR";
import Operador from "./Operador";
import Empresa from "./Empresa";

export default class Pessoa extends Model {
  declare id: number;
  declare nome: string;
  declare razao_social: string;
  declare pessoa_juridica: boolean;
  declare telefone: string;
  declare email: string;
  declare email_nfe: string;
  declare endereco: string;
  declare numero: string;
  declare complemento: string;
  declare bairro: string;
  declare municipio: string;
  declare uf: string;
  declare cep: string;
  declare ie_rg: string;
  declare cnpj_cpf: string;
  declare data_nasc: Date;
  declare descricao: Text;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare contatos: Array<Contato>;
  declare files: Array<File>;
  declare fornecedor: Fornecedor;
  declare operador: Operador;
  declare usuario: Usuario;
  declare vendedor: Vendedor;
  declare empresa: Empresa;

  declare getFiles: HasManyGetAssociationsMixin<File>; //
  declare addFile: HasManyAddAssociationMixin<File, number>;
  declare addFiles: HasManyAddAssociationsMixin<File, number>;
  declare setFiles: HasManySetAssociationsMixin<File, number>;
  declare removeFile: HasManyRemoveAssociationMixin<File, number>;
  declare removeFiles: HasManyRemoveAssociationsMixin<File, number>;
  declare hasFile: HasManyHasAssociationMixin<File, number>;
  declare hasFiles: HasManyHasAssociationsMixin<File, number>;
  declare countFiles: HasManyCountAssociationsMixin;

  declare addEmpresa: HasManyAddAssociationMixin<Empresa, number>;
  declare hasEmpresa: HasManyHasAssociationMixin<Empresa, number>;
  declare getEmpresas: HasManyGetAssociationsMixin<Empresa>;

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
    Pessoa.hasOne(Fornecedor, { foreignKey: "id_pessoa", onDelete: "CASCADE" });
    Pessoa.hasOne(Usuario, { foreignKey: "id_pessoa", onDelete: "CASCADE" });
    Pessoa.hasOne(Vendedor, { foreignKey: "id_pessoa", onDelete: "CASCADE" });
    Pessoa.hasOne(Empresa, { foreignKey: "id_pessoa", onDelete: "CASCADE" });
    Pessoa.belongsToMany(Empresa, { through: "pessoa_empresa" })
    Pessoa.hasOne(Operador, { foreignKey: "id_pessoa", onDelete: "CASCADE" });
    Pessoa.hasMany(RegistroInspecaoRecebimento, { foreignKey: "id_pessoa" });
    Pessoa.hasMany(Orcamento, { foreignKey: "id_pessoa" });
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
    nome: {type: DataTypes.CITEXT, unique: true},
    razao_social: DataTypes.CITEXT,
    pessoa_juridica: DataTypes.BOOLEAN,
    telefone: DataTypes.CITEXT,
    email: {
      type: DataTypes.CITEXT,
      validate: {
        isEmail: true,
      },
    },
    email_nfe: {
      type: DataTypes.CITEXT,
      validate: {
        isEmail: true,
      },
    },
    endereco: DataTypes.CITEXT,
    numero: DataTypes.CITEXT,
    complemento: DataTypes.CITEXT,
    bairro: DataTypes.CITEXT,
    municipio: DataTypes.CITEXT,
    uf: DataTypes.STRING(2),
    cep: DataTypes.STRING,
    ie_rg: {
      type: DataTypes.STRING,
      //unique: true,
    },
    cnpj_cpf: {
      type: DataTypes.STRING,
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
