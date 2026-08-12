import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on('error', (err) => console.error('❌ Erro no cliente Redis:', err));

await redisClient.connect();
console.log("✅ Conexão com Redis estabelecida");

export default redisClient;