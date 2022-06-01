import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import { database } from "./models/index.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

var corsOptions = {
  origin: process.env.CORS || "*",
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json(), express.urlencoded({ extended: true }));

routes(app);
database.sequelize.sync({ alter: false, force: true });

app.listen(PORT, () => console.log(`servidor está rodando na porta ${PORT}`));
