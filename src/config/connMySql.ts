import { Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import dotenv from "dotenv";
dotenv.config();

var config: Options = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: "mysql"
};

if (process.env.NODE_ENV == "production") config.logging = false;

const sequelize = new Sequelize(
  config.database!,
  config.username!,
  config.password,
  config
);

export default sequelize;

