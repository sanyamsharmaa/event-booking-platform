// utils/reserveTickets.js
import {redis} from './redis.js'

const LOCK_TTL = 600; // 10 minutes

async function reserveTickets(eventId, passType, userId, quantity) {

  const availableKey = `event:${eventId}:tier:${passType}:available`;
  const userLockKey = `event:${eventId}:tier:${passType}:lock:${userId}`;

  const remaining = await redis.decrBy(availableKey, quantity);

  if (remaining < 0) {
    console.log("Not enough tickets available"); 
    await redis.incrBy(availableKey, quantity);
    return false;
  }

  await redis.set(userLockKey, quantity, 'EX', LOCK_TTL);

  return true;
}

export { reserveTickets };
