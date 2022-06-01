import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import { Options } from "sequelize/types";
import dotenv from "dotenv";
dotenv.config();

const basename = path.basename(__filename);

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

var database: any = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = import(path.join(__dirname, file));
    model.then(model => {
      database[file.replace(".js", "")] = model
    })

    
  });

Object.keys(database).forEach((modelName) => {
  
    database[modelName].associate(database);
  
});

database.sequelize = sequelize;
database.Sequelize = Sequelize;

export {database, sequelize};

export * from './Produto.js'
export * from './Pessoa.js'
