import sequelize from "../config/connection.js";
import { Model, DataTypes, Op } from "sequelize";
import Orcamento from "./Orcamento.js";
import Vendedor from "./Vendedor.js";
import OrdemProducaoItem from "./OrdemProducaoItem.js";

export default class OrdemProducao extends Model {
  declare id: number;
  declare orcamento: Orcamento;
  declare id_orcamento: number;
  declare vendedor: Vendedor;
  declare id_vendedor: number;
  declare prazo: Date;
  declare venda: number;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;

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
      prazo: DataTypes.DATE,
      venda: DataTypes.INTEGER,
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
