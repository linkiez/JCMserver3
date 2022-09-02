import redis from 'redis';
import dotenv from "dotenv";
dotenv.config();

let username = process.env.REDIS_USERNAME
let password = process.env.REDIS_PASSWORD
let host = process.env.REDIS_HOST || 'localhost'
let port = Number(process.env.REDIS_PORT)
let url = 'redis://';

if(username) url = url + username + ':' + password + '@'
url = url + host;
if(port) url = url + ':' + port;
url = url + '/';

const client = redis.createClient({
    socket: { 
      host: host,
      port: port
    },
    password: password
  })

  client.connect()

export default client
