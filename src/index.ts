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
import AirBrake from "@airbrake/node";
import AirBrakeExpress from "@airbrake/node/dist/instrumentation/express";

const airbrake = new AirBrake.Notifier({
  projectId: 518064,
  projectKey: "00d8815db560752be9d60a4e724f5008",
});

const numCPUs = os.cpus().length;

dotenv.config();

const PORT = process.env.PORT || 3000;
// const PORT_SSL = process.env.PORT_SSL || 3001;
const app: Express = express();

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(
  express.json({ limit: "50mb" }),
  express.urlencoded({ limit: "50mb", extended: true })
);
app.use(AirBrakeExpress.makeMiddleware(airbrake));

models();
await routes(app);

app.use(AirBrakeExpress.makeErrorHandler(airbrake));

const httpServer = http.createServer(app);
httpServer.keepAliveTimeout = 60 * 1000 + 1000;
httpServer.headersTimeout = 60 * 1000 + 2000;

// const httpsServer = https.createServer(
//   {
//     key: fs.readFileSync("./ssl/linkiez_ddns_net.key"),
//     cert: fs.readFileSync("./ssl/linkiez_ddns_net.crt"),
//   },
//   app
// );

// For Master process
if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  sequelize
    .sync({
      alter: JSON.parse(process.env.SEQUELIZE_ALTER ?? "false"),
      force: JSON.parse(process.env.SEQUELIZE_FORCE ?? "false"),
    })
    .then(() => {
      if (JSON.parse(process.env.SEQUELIZE_SEED ?? "false")) {
        seed();
      }
    });

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
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
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  httpServer.listen(PORT, () => {
    console.log(`Worker ${process.pid} started`);
  });
  // httpsServer.listen(PORT_SSL, () => {
  //   console.log(`Worker SSL ${process.pid} started`);
  // });
}
