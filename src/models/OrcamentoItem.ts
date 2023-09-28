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
import Orcamento from "./Orcamento";
import Produto from "./Produto";
import FileDb from "./File";
import RegistroInspecaoRecebimento from "./RIR";

export default class OrcamentoItem extends Model {
  declare id: number;
  declare orcamento: Orcamento;
  declare id_orcamento: number;
  declare descricao: string;
  declare produto: Produto;
  declare id_produto: number;
  declare material_incluido: boolean;
  declare processo: Array<string>;
  declare largura: number;
  declare altura: number;
  declare quantidade: number;
  declare imposto: number;
  declare preco_quilo: number;
  declare tempo: string;
  declare preco_hora: number;
  declare peso: number;
  declare total_peso: number;
  declare total_manual: number;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare files: FileDb[];
  declare total: number;
  declare registro_inspecao_recebimento: RegistroInspecaoRecebimento;
  declare id_rir: number;

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
    OrcamentoItem.belongsTo(RegistroInspecaoRecebimento, {
      foreignKey: "id_rir",
    });
    OrcamentoItem.belongsTo(Orcamento, { foreignKey: "id_orcamento" });
    OrcamentoItem.belongsTo(Produto, { foreignKey: "id_produto" });
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
    descricao: DataTypes.CITEXT,
    material_incluido: DataTypes.BOOLEAN,
    processo: DataTypes.ARRAY(DataTypes.STRING),
    largura: DataTypes.DECIMAL(13, 2),
    altura: DataTypes.DECIMAL(13, 2),
    quantidade: DataTypes.DECIMAL(13, 2),
    imposto: DataTypes.DECIMAL(5, 2),
    preco_quilo: DataTypes.DECIMAL(13, 2),
    tempo: DataTypes.STRING,
    preco_hora: DataTypes.DECIMAL(13, 2),
    total_manual: DataTypes.DECIMAL(13, 2),
    total_peso: DataTypes.DECIMAL(13, 2),
    total_hora: DataTypes.DECIMAL(13, 2),
    total: DataTypes.DECIMAL(13, 2),
    peso: DataTypes.FLOAT,
    custo: DataTypes.DECIMAL(13, 2),
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
