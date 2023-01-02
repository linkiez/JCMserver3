import sequelize from "../config/connMySql";
import { Model, DataTypes, Op } from "sequelize";
import Orcamento from "./Orcamento";
import Vendedor from "./Vendedor";
import OrdemProducaoItem from "./OrdemProducaoItem";

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
    OrdemProducao.belongsTo(Orcamento, { foreignKey: 'id_orcamento'});
    OrdemProducao.belongsTo(Vendedor, { foreignKey: 'id_vendedor'})
    OrdemProducao.hasMany(OrdemProducaoItem, { foreignKey: 'id_ordem_producao', onDelete: 'cascade'})
  }
}
OrdemProducao.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      data_prazo: DataTypes.DATE,
      data_finalizacao: DataTypes.DATE,
      data_entregue: DataTypes.DATE,
      venda: DataTypes.INTEGER,
      status: DataTypes.STRING
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
