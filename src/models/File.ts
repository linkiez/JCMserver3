import sequelize from "../config/connPostgre";
import { Model, DataTypes, Op } from "sequelize";
import Pessoa from "./Pessoa";
import OrcamentoItem from "./OrcamentoItem";
import RegistroInspecaoRecebimento from "./RIR";
import PedidoCompra from "./PedidoCompra";
import Produto from "./Produto";
import Empresa from "./Empresa";

export default class File extends Model {
  declare id: number;
  declare url: string;
  declare originalFilename: string;
  declare newFilename: string;
  declare mimeType: string;
  declare bucket: string;
  declare region: string;
  declare deletedAt: Date;
  declare updatedAt: Date;
  declare createdAt: Date;

  static associate() {
    // define association here
    File.belongsToMany(Pessoa, { through: "pessoa_file" });
    File.belongsToMany(OrcamentoItem, { through: "orcamento_file" });
    File.belongsToMany(RegistroInspecaoRecebimento, {
      through: "registro_inspecao_recebimento_file",
    });
    File.belongsToMany(PedidoCompra, { through: "pedido_compra_file" });
    File.belongsToMany(Produto, { through: "produto_file" });

    File.hasOne(Empresa, { foreignKey: "id_file" })
  }
}
File.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    url: DataTypes.CITEXT,
    originalFilename: DataTypes.CITEXT,
    newFilename: DataTypes.CITEXT,
    mimeType: DataTypes.CITEXT,
    bucket: DataTypes.CITEXT,
    region: DataTypes.CITEXT,
    deletedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "file",
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    scopes: {
      deleted: {
        where: {
          deletedAt: { [Op.not]: null },
        },
      },
    },
  }
);
