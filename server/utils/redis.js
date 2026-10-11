import { createClient } from 'redis';
import 'dotenv/config';

const redisConfig = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis max reconnection attempts reached');
                return new Error('Redis max reconnection retries reached');
            }
            return Math.min(retries * 200, 3000);
        }
    }
};

export const redis = createClient(redisConfig);

redis.on('error', err => console.error('Redis Client Error:', err.message || err));
redis.on('connect', () => console.log('Redis Client Connected'));
redis.on('ready', () => console.log('Redis Client Ready'));

export const redisConnect = async () => {
    try {
        if (!redis.isOpen) {
            await redis.connect();
        }
    } catch (err) {
        console.error('Redis initial connection failed:', err.message || err);
    }
};




