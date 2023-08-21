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
import Usuario from "./Usuario";
import OrdemProducaoItem from "./OrdemProducaoItem";

export default class RNC extends Model {
  declare id: number;
  declare status: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date;
  declare data_fechamento: Date;
  declare descricao: string;
  declare causa: string;
  declare acao_disposicao:
    | "Refugar"
    | "Retrabalhar"
    | "Reclassificar"
    | "Aprovação Condicional"
    | "Outros"
    | null;
  declare acao_corretiva: string;
  declare acao_preventiva: string;
  declare acao_imediata: string;
  declare responsavel_analise: Usuario;
  declare responsavel_analise_id: number;
  declare reclamacao_cliente: boolean;
  declare ordem_producao_item: OrdemProducaoItem[];

  static associate() {
    RNC.belongsTo(Usuario, {
      foreignKey: "responsavel_analise_id",
      as: "responsavel_analise",
    });
    RNC.hasMany(OrdemProducaoItem, { foreignKey: "id_rnc" });
  }
}
RNC.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    status: {
      type: DataTypes.ENUM("Aberto", "Fechado"),
      defaultValue: "Aberto",
    },
    data_fechamento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    causa: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    acao_disposicao: {
      type: DataTypes.ENUM(
        "Refugar",
        "Retrabalhar",
        "Reclassificar",
        "Aprovação Condicional",
        "Outros"
      ),
      allowNull: false,
    },
    acao_corretiva: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    acao_preventiva: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    acao_imediata: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reclamacao_cliente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "rnc",
    paranoid: true,
    timestamps: true,
    freezeTableName: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
          paranoid: false,
        },
      },
    },
  }
);
