import redis, { RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

let password = process.env.REDIS_PASSWORD;
let host = process.env.REDIS_HOST || "localhost";
let port = Number(process.env.REDIS_PORT);

let client: RedisClientType;

if (process.env.REDIS_URL) {
  const clientOptions = {
    url: process.env.REDIS_URL,
    retry_strategy: (options: any) => {
      if (options.error && options.error.code === "ECONNREFUSED") {
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
  };

  client = redis.createClient(clientOptions);
} else {
  const clientOptions = {
    socket: {
      host: host,
      port: port,
    },
    password: password,
    retry_strategy: (options: any) => {
      if (options.error && options.error.code === "ECONNREFUSED") {
        return new Error("The server refused the connection");
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        return new Error("Retry time exhausted");
      }
      if (options.attempt > 10) {
        return undefined;
      }
      return Math.min(options.attempt * 100, 3000);
    },
  };
  client = redis.createClient(clientOptions);
}

export default client;
