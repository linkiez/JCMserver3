import redis from 'redis';
import dotenv from "dotenv";
dotenv.config();

let username = process.env.REDIS_USERNAME
let password = process.env.REDIS_PASSWORD
let host = process.env.REDIS_HOST || 'localhost'
let port = process.env.REDIS_PORT || ''
let url = 'redis://';

if(username) url = url + username + ':' + password + '@'
url = url + host;
if(port) url = url + ':' + port;
url = url + '/';

const client = redis.createClient({
    //redis[s]://[[username][:password]@][host][:port][/db-number]
    url: url
  })

  client.connect()

export default client
