import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import Orcamento from "./Orcamento";
import OrdemProducao from "./OrdemProducao";
import Empresa from "./Empresa";

export default class VendaTiny extends Model {
  declare id: number;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_orcamento: number;
  declare id_ordem_producao: number;
  declare google_docs: string;

  static associate() {
    // define association here
    VendaTiny.belongsTo(Orcamento, { foreignKey: "id_orcamento" });
    VendaTiny.belongsTo(OrdemProducao, { foreignKey: "id_ordem_producao" });
    VendaTiny.belongsTo(Empresa, { foreignKey: "id_empresa" });
  }
}
VendaTiny.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.BIGINT,
    },
    deletedAt: DataTypes.DATE,
    aprovacao: DataTypes.STRING,
    venda: DataTypes.INTEGER,
  },
  {
    sequelize,
    modelName: "vendastiny",
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
