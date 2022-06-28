import sequelize from "../config/connMySql.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";
import PedidoCompra from "./PedidoCompra.js";

export default class Fornecedor extends Model {
  declare id: number;
  declare data_aprov: Date;
  declare data_venc: Date;
  declare observacao: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Fornecedor.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
    Fornecedor.hasMany(PedidoCompra, { foreignKey: "id_fornecedor" })
  }
}
Fornecedor.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    data_aprov: DataTypes.DATE,
    data_venc: DataTypes.DATE,
    observacao: DataTypes.TEXT,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "fornecedor",
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
