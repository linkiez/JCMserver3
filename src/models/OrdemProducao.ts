import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Orcamento from "./Orcamento";
import Vendedor from "./Vendedor";
import OrdemProducaoItem from "./OrdemProducaoItem";
import VendaTiny from "./VendaTiny";
import OrdemProducaoHistorico from "./OrdemProducaoHistorico";

export default class OrdemProducao extends Model {
  declare id: number;
  declare orcamento: Orcamento;
  declare id_orcamento: number;
  declare vendedor: Vendedor;
  declare id_vendedor: number;
  declare data_prazo: Date;
  declare data_finalizacao: Date;
  declare data_entregue: Date;
  declare venda: number;
  declare status: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;

  static associate() {
    OrdemProducao.belongsTo(Orcamento, { foreignKey: "id_orcamento" });
    OrdemProducao.belongsTo(Vendedor, { foreignKey: "id_vendedor" });
    OrdemProducao.hasMany(OrdemProducaoItem, {
      foreignKey: "id_ordem_producao",
      onDelete: "cascade",
    });
    OrdemProducao.hasMany(OrdemProducaoHistorico, {
      foreignKey: "id_ordem_producao",
      onDelete: "cascade",
    });
    OrdemProducao.hasOne(VendaTiny, { foreignKey: "id_ordem_producao" });
  }
}
OrdemProducao.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.BIGINT,
    },
    data_prazo: DataTypes.DATE,
    data_finalizacao: DataTypes.DATE,
    data_entregue: DataTypes.DATE,
    data_negociado: DataTypes.DATE,
    dias_de_producao: DataTypes.INTEGER,
    venda: DataTypes.INTEGER,
    status: DataTypes.CITEXT,
  },
  {
    sequelize,
    modelName: "ordem_producao",
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
