import redis from 'redis';


const client = redis.createClient({
    //redis[s]://[[username][:password]@][host][:port][/db-number]
    url: 'redis://localhost:6379/'
  })

  client.connect()

export default client
