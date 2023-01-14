import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import Orcamento from "./Orcamento";
import RegistroInspecaoRecebimento from "./RIR";
import OrdemProducaoItemProcesso from "./OrdemProducaoItemProcesso";

export default class Operador extends Model {
  declare id: number;
  declare senha: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Operador.belongsTo(Pessoa, { foreignKey: "id_pessoa" });
    Operador.hasMany(RegistroInspecaoRecebimento, {
      foreignKey: "id_operador",
    });
    Operador.hasMany(OrdemProducaoItemProcesso, { foreignKey: "id_operador" });
  }
}
Operador.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "operador",
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
