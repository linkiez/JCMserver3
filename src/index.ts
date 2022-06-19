import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import { models } from "./models/index.js";
import sequelize from "./config/connection.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

const corsOptions = {
  origin: process.env.CORS || "*",
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json(), express.urlencoded({ extended: true }));

models();
routes(app);
sequelize.sync({ alter: false, force: false });

app.listen(PORT, () => console.log(`servidor está rodando na porta ${PORT}`));
