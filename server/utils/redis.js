import { createClient } from 'redis';


export const redis = createClient({
    username: 'default',
    password: 'NI8SBuzF4tuzpakc7dVWlcnONcbTeo2x',
    socket: {
        host: 'redis-18366.c61.us-east-1-3.ec2.cloud.redislabs.com',
        port: 18366
    }
});

export const redisConnect=async()=>{
    try{
        redis.on('error', err => console.log('Redis Client Error', err));
        redis.on('connect', () => console.log('Redis Client Connected'));
        redis.on('reconnecting', () => console.log('Redis Client Reconnecting'));
        redis.on('ready', () => console.log('Redis Client Ready'));
        await redis.connect();
        // console.log('✅ Redis connected successfully');
    }
    catch(err){
        console.error('❌ Redis connection failed:', err);
        throw err;
    }
}


