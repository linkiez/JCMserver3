import sequelize from "../config/connection.js";
import { Model, DataTypes, Op } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem.js";
import RegistroInspecaoRecebimento from "./RegistroInspecaoRecebimento.js";

export default class Produto extends Model {
  declare id: number;
  declare nome: string;
  declare categoria: string;
  declare espessura: number;
  declare peso: number;
  declare updateAt: Date;
  declare createAt: Date;
  declare deletedAt: Date;

  static associate() {
    // define association here
    Produto.hasOne(PedidoCompraItem, { foreignKey: "id_produto" });
    Produto.hasOne(RegistroInspecaoRecebimento, { foreignKey: "id_produto" });
  }
}
Produto.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    nome: DataTypes.STRING,
    categoria: DataTypes.STRING,
    espessura: DataTypes.STRING,
    peso: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "produto",
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
