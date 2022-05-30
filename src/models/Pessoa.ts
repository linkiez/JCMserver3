import { sequelize } from "./index";

const { Model, DataTypes } = require("sequelize");

export class Pessoa extends Model {
  static associate(models: any) {
  }
}
Pessoa.init(
    {
      nome: DataTypes.STRING,
      razao_social: DataTypes.STRING,
      pessoa_juridica: DataTypes.BOOLEAN,
      telefone: DataTypes.BIGINT,
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            args: true,
            msg: "email inválido",
          },
        },
      },
      email_nfe: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            args: true,
            msg: "email inválido",
          },
        },
      },
      endereco: DataTypes.STRING,
      municipio: DataTypes.STRING,
      uf: DataTypes.STRING(2),
      cep: DataTypes.INTEGER,
      ie_rg: {
        type: DataTypes.INTEGER,
        unique: true
      },
      cnpj_cpf: {
        type: DataTypes.INTEGER,
        unique: true
      },
      data_nasc: DataTypes.DATE,
      descricao: DataTypes.TEXT,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Pessoa",
      paranoid: true,
      timestamps: true,
      freezeTableName: true,
      defaultScope: {
        where: { deletedAt: null },
      },
    }
  );
