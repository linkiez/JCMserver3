import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import Orcamento from "./Orcamento";
import OrdemProducao from "./OrdemProducao";
import VendaTiny from "./VendaTiny";
import File from "./File";
import Vendedor from "./Vendedor";

export default class Empresa extends Model {
  declare id: number;
  declare senha: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;
  declare token_tiny: string;

  static associate() {
    // define association here
    Empresa.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    Empresa.belongsToMany(Pessoa, { through: "pessoa_empresa" })
    Empresa.belongsToMany(Vendedor, { through: "vendedor_empresa" })
    Empresa.hasMany(Orcamento, { foreignKey: "id_empresa" });
    Empresa.hasMany(VendaTiny, { foreignKey: "id_empresa" })

    Empresa.belongsTo(File, { foreignKey: "id_file" })
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
