import sequelize from "../config/connMySql.js";
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
import Pessoa from "./Pessoa.js";
import Contato from "./Contato.js";
import Vendedor from "./Vendedor.js";
import OrcamentoItem from "./OrcamentoItem.js";
import OrdemProducao from "./OrdemProducao.js";

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
  declare aprovado: boolean;
  declare aprovacao: string;
  declare pc_cliente: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare cond_pag: string;
  declare frete: number;
  declare transporte: string;
  declare desconto: number;
  declare imposto: number;
  declare total: number;
  declare observacao: string;

  declare getOrcamentoItems: HasManyGetAssociationsMixin<OrcamentoItem>; //
  declare addOrcamentoItem: HasManyAddAssociationMixin<OrcamentoItem, number>;
  declare addOrcamentoItems: HasManyAddAssociationsMixin<OrcamentoItem, number>;
  declare setOrcamentoItems: HasManySetAssociationsMixin<OrcamentoItem, number>;
  declare removeOrcamentoItem: HasManyRemoveAssociationMixin<OrcamentoItem, number>;
  declare removeOrcamentoItems: HasManyRemoveAssociationsMixin<OrcamentoItem, number>;
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

    Orcamento.hasMany(OrcamentoItem, {
        foreignKey: "id_orcamento",
        onDelete: "cascade",
      });

    Orcamento.hasMany(OrdemProducao, { foreignKey: 'id_orcamento'})
  }
}
Orcamento.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    prazo_emdias: DataTypes.INTEGER,
    prazo_data: DataTypes.DATE,
    aprovado: DataTypes.BOOLEAN,
    aprovacao: DataTypes.STRING,
    pc_cliente: DataTypes.STRING,
    cond_pag: DataTypes.STRING,
    frete: DataTypes.DECIMAL(13, 2),
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
