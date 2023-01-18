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
import Pessoa from "./Pessoa";
import Contato from "./Contato";
import Vendedor from "./Vendedor";
import OrcamentoItem from "./OrcamentoItem";
import OrdemProducao from "./OrdemProducao";
import Empresa from "./Empresa";

export default class Orcamento extends Model {
  declare id: number;
  declare contato: Contato;
  declare id_contato: number;
  declare pessoa: Pessoa;
  declare id_pessoa: number;
  declare vendedor: Vendedor;
  declare id_vendedor: number;
  declare prazo_emdias: number;
  declare prazo_data: Date;
  declare status: string;
  declare aprovacao: string;
  declare pc_cliente: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare cond_pag: string;
  declare frete: number;
  declare embalagem: string;
  declare transporte: string;
  declare desconto: number;
  declare imposto: number;
  declare total: number;
  declare observacao: string;

  declare getOrcamentoItems: HasManyGetAssociationsMixin<OrcamentoItem>; //
  declare addOrcamentoItem: HasManyAddAssociationMixin<OrcamentoItem, number>;
  declare addOrcamentoItems: HasManyAddAssociationsMixin<OrcamentoItem, number>;
  declare setOrcamentoItems: HasManySetAssociationsMixin<OrcamentoItem, number>;
  declare removeOrcamentoItem: HasManyRemoveAssociationMixin<
    OrcamentoItem,
    number
  >;
  declare removeOrcamentoItems: HasManyRemoveAssociationsMixin<
    OrcamentoItem,
    number
  >;
  declare hasOrcamentoItem: HasManyHasAssociationMixin<OrcamentoItem, number>;
  declare hasOrcamentoItems: HasManyHasAssociationsMixin<OrcamentoItem, number>;
  declare countOrcamentoItems: HasManyCountAssociationsMixin;

  static associate() {
    Orcamento.belongsTo(Contato, {
      foreignKey: { name: "id_contato", allowNull: false },
    });
    Orcamento.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    Orcamento.belongsTo(Vendedor, {
      foreignKey: { name: "id_vendedor", allowNull: false },
    });
    Orcamento.belongsTo(Empresa, {
      foreignKey: { name: "id_empresa", allowNull: true },
    });
    Orcamento.hasMany(OrcamentoItem, {
      foreignKey: "id_orcamento",
      onDelete: "cascade",
    });

    Orcamento.hasMany(OrdemProducao, { foreignKey: "id_orcamento" });
  }
}
Orcamento.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    prazo_emdias: DataTypes.INTEGER,
    prazo_data: DataTypes.DATE,
    status: DataTypes.STRING,
    aprovacao: DataTypes.STRING,
    pc_cliente: DataTypes.STRING,
    cond_pag: DataTypes.STRING,
    frete: DataTypes.DECIMAL(13, 2),
    embalagem: DataTypes.STRING,
    transporte: DataTypes.STRING,
    desconto: DataTypes.DECIMAL(13, 2),
    imposto: DataTypes.DECIMAL(3, 2),
    total: DataTypes.DECIMAL(13, 2),
    observacao: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "orcamento",
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
