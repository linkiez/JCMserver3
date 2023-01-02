import sequelize from "../config/connMySql";
import { Model, DataTypes, Op, HasManySetAssociationsMixin } from "sequelize";
import PedidoCompraItem from "./PedidoCompraItem";
import RegistroInspecaoRecebimento from "./RIR";
import OrdemProducaoItem from "./OrdemProducaoItem";
import FileDb from "./File";

export default class Produto extends Model {
  declare id: number;
  declare nome: string;
  declare categoria: string;
  declare espessura: number;
  declare peso: number;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare deletedAt: Date;
  declare files: Array<FileDb>;

  declare setFiles: HasManySetAssociationsMixin<File, number>;


  static associate() {
    // define association here
    Produto.hasMany(PedidoCompraItem, { foreignKey: "id_produto" });
    Produto.hasMany(RegistroInspecaoRecebimento, { foreignKey: "id_produto" });
    Produto.hasMany(OrdemProducaoItem, { foreignKey: "id_produto" })
    Produto.belongsToMany(FileDb, { through: "produto_file" });
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
    espessura: DataTypes.FLOAT,
    peso: DataTypes.FLOAT,
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
