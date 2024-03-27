import { Sequelize } from "sequelize";
import { Options } from "sequelize/types";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

let config: Options = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  dialect: "postgres",
  minifyAliases: true,
  pool: {
    max: 20,
    min: 0,
    idle: 10000,
    acquire: 30000,
  },
  logging: console.log,
};

if (process.env.NODE_ENV == "production") {
  config.logging = false;
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync("../ssl/jcmapp-db-server-ca.pem"),
      cert: fs.readFileSync("../ssl/jcmapp-db-client-cert.pem"),
      key: fs.readFileSync("../ssl/jcmapp-db-client-key.pem"),
    },
  };
}

let sequelize: Sequelize;
if (process.env.NODE_ENV == "test") {
  sequelize = new Sequelize("sqlite::memory:", { logging: true });
} else {
  sequelize = new Sequelize(
    config.database!,
    config.username!,
    config.password,
    config
  );
}

export default sequelize;
