import redis, { RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();

let client: RedisClientType;

let retry_strategy = (options: any) => {
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
}

if (process.env.REDIS_URL) {
  const clientOptions = {
    url: process.env.REDIS_URL,
    retry_strategy
  };

  client = redis.createClient(clientOptions);
} else {
  const clientOptions = {
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
    retry_strategy
  };
  client = redis.createClient(clientOptions);
}

client.on('connect', function() {
  console.log('Connected to Redis');
});

client.on('error', function(err) {
  console.error('Redis error:', err);
});

export default client;
