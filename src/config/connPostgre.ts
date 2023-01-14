import { Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import dotenv from "dotenv";
dotenv.config();

var config: Options = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: "postgres"
};

if (process.env.NODE_ENV == "production") config.logging = false;

let sequelize: Sequelize;
if (process.env.NODE_ENV == "test") {
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
}else{
  sequelize = new Sequelize(
    config.database!,
    config.username!,
    config.password,
    process.env.NODE_ENV != 'test' ? config : {
      dialect: "sqlite",
      storage: ":memory:",
      logging: false
    }
  );
}



export default sequelize;

