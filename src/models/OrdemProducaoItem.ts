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
} from "sequelize";
import Produto from "./Produto";
import RegistroInspecaoRecebimento from "./RIR";
import FileDb from "./File";
import OrdemProducao from "./OrdemProducao";
import OrdemProducaoItemProcesso from "./OrdemProducaoItemProcesso";
import OrcamentoItem from "./OrcamentoItem";
import { RNCItem } from "./RNCItem";

export default class OrdemProducaoItem extends Model {
  declare id: number;
  declare descricao: string;
  declare produto?: Produto;
  declare id_produto: number;
  declare quantidade: number;
  declare rir?: RegistroInspecaoRecebimento;
  declare id_rir: number;
  declare observacao: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare files?: Array<FileDb>;
  declare id_ordem_producao: number;
  declare ordem_producao_item_processos?: Array<OrdemProducaoItemProcesso>;
  declare registro_inspecao_recebimento?: RegistroInspecaoRecebimento;

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
    OrdemProducaoItem.belongsToMany(FileDb, {
      through: "ordem_producao_item_file",
    });
    OrdemProducaoItem.belongsTo(Produto, { foreignKey: "id_produto" });
    OrdemProducaoItem.belongsTo(RegistroInspecaoRecebimento, {
      foreignKey: "id_rir",
    });
    OrdemProducaoItem.belongsTo(OrdemProducao, {
      foreignKey: "id_ordem_producao",
    });
    OrdemProducaoItem.hasMany(OrdemProducaoItemProcesso, {
      foreignKey: "id_ordem_producao_item",
      onDelete: "cascade",
    });
    OrdemProducaoItem.hasMany(RNCItem, { foreignKey: "id_ordem_producao_item" });
    OrdemProducaoItem.belongsTo(OrcamentoItem, {
      foreignKey: "id_orcamento_item",
    });
  }
}
OrdemProducaoItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    descricao: DataTypes.CITEXT,
    quantidade: DataTypes.FLOAT,
    observacao: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "ordem_producao_item",
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
