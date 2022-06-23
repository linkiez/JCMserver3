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
import Orcamento from "./Orcamento.js";
import Produto from "./Produto.js";
import FileDb from "./File.js";

export default class OrcamentoItem extends Model {
  declare id: number;
  declare orcamento: Orcamento;
  declare id_orcamento: number;
  declare descricao: string;
  declare produto: Produto;
  declare id_produto: number;
  declare material_incluido: boolean;
  declare processo: string;
  declare largura: number;
  declare altura: number;
  declare quantidade: number;
  declare preco_quilo: number;
  declare tempo: string;
  declare preco_hora: number;
  declare total_manual: number;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
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
  
  static associate() {
    OrcamentoItem.belongsTo(Orcamento, { foreignKey: "id_orcamento" });
    OrcamentoItem.belongsToMany(FileDb, { through: "orcamento_file" });
  }
}
OrcamentoItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    descricao: DataTypes.STRING,
    material_incluido: DataTypes.BOOLEAN,
    processo: DataTypes.STRING,
    largura: DataTypes.DECIMAL(13, 2),
    altura: DataTypes.DECIMAL(13, 2),
    quantidade: DataTypes.DECIMAL(13, 2),
    preco_quilo: DataTypes.DECIMAL(13, 2),
    tempo: DataTypes.STRING,
    preco_hora: DataTypes.DECIMAL(13, 2),
    total_manual: DataTypes.DECIMAL(13, 2),
  },
  {
    sequelize,
    modelName: "orcamento_item",
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
