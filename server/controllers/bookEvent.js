import { bookedEventModal } from "../modals/bookedEventsModal.js";
import { eventModal } from "../modals/eventModal.js";
import { userModal } from "../modals/userModal.js";
import { redis, redisConnect } from '../utils/redis.js';
import mongoose from "mongoose";

async function bookEvent(req, res) {
    const { uId, eId, passType, tkts, detail } = req.body || {};

    if (!uId || !eId || !passType || !tkts || !detail || !detail.date || !detail.venue || !detail.city) {
        return res.status(400).json({ success: false, msg: "Missing required booking details (uId, eId, passType, tkts, detail)" });
    }

    if (req.user?.role === 'artist') {
        return res.status(403).json({ success: false, msg: "Artists are not allowed to book tickets. Please use an Attendee account." });
    }

    const mutexKey = `lock:bookEvent:${eId}:${passType}:${uId}`;
    const reservationKey = `event:${eId}:tier:${passType}:reservation:${uId}`;
    let lockAcquired = false;
    const session = await mongoose.startSession();

    console.log("uId", uId)

    try {
        if (!redis.isOpen) {
            await redisConnect();
        }

        if (redis.isOpen) {
            // Acquire short-lived Mutex lock (NX: only set if not exists, EX: 15 seconds)
            const lockResult = await redis.set(mutexKey, "1", { NX: true, EX: 15 });
            if (!lockResult) {
                return res.status(409).json({ success: false, msg: "Another booking is in progress. Please try again." });
            }
            lockAcquired = true;
        }

        const user = await userModal.findById(uId);
        if (!user) {
            return res.status(400).json({ success: false, msg: "User not found" });
        }

        const event = await eventModal.findById(eId);
        if (!event) {
            return res.status(400).json({ success: false, msg: "Event not found" });
        }

        // Date comparison
        const now = new Date();
        if (new Date(detail.date) < now) {
            return res.status(400).json({ success: false, msg: "Event has already ended" });
        }

        // Check if enough tickets are available for the requested pass type
        const show = await eventModal.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(eId),
                    passTypes: {
                        $elemMatch: {
                            tier: passType,
                            tktCount: { $gte: Number(tkts) },
                        },
                    },
                },
            },
        ]);

        if (show.length === 0) {
            return res.status(400).json({
                success: false,
                msg: `${tkts} tickets not available for this pass type. Try fewer tickets.`,
            });
        }

        session.startTransaction();

        const [booking] = await bookedEventModal.create([{
            userId: uId,
            eventId: eId,
            passType: passType,
            date: new Date(detail.date),
            location: `${detail.venue}, ${detail.city}`,
            tktCount: Number(tkts),
        }], { session });

        await eventModal.updateOne(
            { _id: eId, "passTypes.tier": passType },
            { $inc: { "passTypes.$.tktCount": -Number(tkts) } },
            { session }
        );

        await session.commitTransaction();

        // Clear user temporary reservation hold from Redis
        if (redis.isOpen) {
            try {
                await redis.del(reservationKey);
            } catch (clearErr) {
                console.warn("Could not clear reservation key:", clearErr.message);
            }
        }

        return res.status(200).json({ success: true, msg: "Your tickets are booked!", booking });

    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("bookEvent error:", err);
        return res.status(500).json({ success: false, msg: `Internal server error - ${err.message}` });

    } finally {
        // Release the mutex lock
        if (lockAcquired && redis.isOpen) {
            try {
                await redis.del(mutexKey);
            } catch (delErr) {
                console.error("Error releasing Redis mutex lock:", delErr.message);
            }
        }
        await session.endSession();
    }
}

async function myEvents(req, res) {
    try {
        const uid = req.user?.id || req.body?.uid;

        if (!uid) {
            return res.status(400).json({ success: false, msg: "User ID is required" });
        }

        const events = await bookedEventModal.find({ userId: uid })
            .populate('eventId')
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: events });

    } catch (err) {
        console.error("myEvents error:", err);
        return res.status(500).json({ success: false, msg: `Internal server error - ${err.message}` });
    }
}


export { bookEvent, myEvents };
