import sequelize from "../config/connection.js";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa.js";
import Orcamento from "./Orcamento.js";
import RegistroInspecaoRecebimento from "./RIR.js";

export default class Operador extends Model {
  declare id: number;
  declare senha: string;
  declare deletedAt: Date;
  declare updateAt: Date;
  declare createAt: Date;
  declare id_pessoa: number;
  declare pessoa: Pessoa;

  static associate() {
    // define association here
    Operador.belongsTo(Pessoa, { foreignKey: "id_pessoa" })
    Operador.hasMany(RegistroInspecaoRecebimento, { foreignKey: 'id_operador'})
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
          deletedAt: {[Op.not]: null},
        },
      },
    },
  }
);
