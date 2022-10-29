import redis from 'redis';
import dotenv from "dotenv";
dotenv.config();

let password = process.env.REDIS_PASSWORD
let host = process.env.REDIS_HOST || 'localhost'
let port = Number(process.env.REDIS_PORT)

const client = redis.createClient({
    socket: { 
      host: host,
      port: port
    },
    password: password
  })

  client.connect()

export default client
