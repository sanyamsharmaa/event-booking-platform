import { redis, redisConnect } from './redis.js';

const LOCK_TTL = 600; // 10 minutes

async function reserveTickets(eventId, passType, userId, quantity) {
  const qty = Number(quantity) || 1;
  const availableKey = `event:${eventId}:tier:${passType}:available`;
  const userReservationKey = `event:${eventId}:tier:${passType}:reservation:${userId}`;

  try {
    if (!redis.isOpen) {
      await redisConnect();
    }

    if (!redis.isOpen) {
      console.warn("Redis client offline, skipping ticket cache reservation");
      return true; // Fallback to DB check
    }

    const remaining = await redis.decrBy(availableKey, qty);
    console.log(remaining, "remaining")

    if (remaining < 0) {
      console.log("Not enough tickets available in inventory cache");
      await redis.incrBy(availableKey, qty);
      return false;
    }

    // Hold reservation in Redis for 10 minutes while user is on payment screen
    await redis.set(userReservationKey, String(qty), { EX: LOCK_TTL });
    return true;

  } catch (err) {
    console.error("Redis reserveTickets warning:", err.message);
    // Allow order creation to proceed even if Redis cache is temporarily reconnecting
    return true;
  }
}

export { reserveTickets };


