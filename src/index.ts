import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import { routes } from "./routes/index.js";
import { models } from "./models/index.js";
import sequelize from "./config/connPostgre.js";
import cors from "cors";
import { seed } from "./seed/index.js";
import cluster from "cluster";
import os from "os";
import http from "http";
import https from "https";
import fs from "fs";
import compression from "compression";
import { CorsOptions } from "cors";
import { dropViews, upViews } from "./config/syncViews.js";

dotenv.config();

const app: Express = express();

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");
    if (
      origin &&
      allowedOrigins &&
      (allowedOrigins.some((originItem) => origin.includes(originItem)) ||
        allowedOrigins.includes("*"))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(
  express.json({ limit: "50mb" }),
  express.urlencoded({ limit: "50mb", extended: true })
);

app.use(compression());

models();
await routes(app);

const httpServer = http.createServer(app);
httpServer.keepAliveTimeout = 60 * 1000 + 1000;
httpServer.headersTimeout = 60 * 1000 + 2000;

const httpsServer = https.createServer(
  {
    key: fs.readFileSync("./ssl/jcmmetais.ddns.net-PrivateKey.key"),
    cert: fs.readFileSync("./ssl/jcmmetais_ddns_net.crt"),
  },
  app
);
httpsServer.keepAliveTimeout = 60 * 1000 + 1000;
httpsServer.headersTimeout = 60 * 1000 + 2000;

// For Master process
if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  await dropViews(sequelize);

  await sequelize
    .sync({
      alter: JSON.parse(process.env.SEQUELIZE_ALTER ?? "false"),
      force: JSON.parse(process.env.SEQUELIZE_FORCE ?? "false"),
    })
    .then(() => {
      if (JSON.parse(process.env.SEQUELIZE_SEED ?? "false")) {
        seed();
      }
    });

  await upViews(sequelize);
  // Fork workers.
  const WORKERS = Number(process.env.WEB_CONCURRENCY) || os.cpus().length;

  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }

  cluster.on("error", (error) => {
    console.error("Cluster error:", error);
  });

  // This event is firs when worker died
  cluster.on("exit", (worker: any, code: any, signal: any) => {
    console.log(`worker ${worker.process.pid} died`);

    // Check if all workers have exited
    if (!cluster.workers || Object.keys(cluster.workers).length === 0) {
      console.log("All workers have died, restarting...");

      // Exit the master process to trigger a restart
      process.exit();
    }
  });
}

// For Worker
else {
  const PORT = process.env.PORT || 3000;
  const PORT_SSL = process.env.PORT_SSL || 3001;
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  httpServer.listen(PORT, () => {
    console.log(`Worker ${process.pid} started on port ${PORT}`);
  });
  httpsServer.listen(PORT_SSL, () => {
    console.log(`Worker SSL ${process.pid} started on port ${PORT_SSL}`);
  });
}
