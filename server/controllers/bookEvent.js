import { bookedEventModal } from "../modals/bookedEventsModal.js";
import { eventModal } from "../modals/eventModal.js";
import { userModal } from "../modals/userModal.js";
import { redis } from '../utils/redis.js';
import mongoose from "mongoose";

async function bookEvent(req, res) {
    const { uId, eId, passType, tkts, detail } = req.body || {};

    if (!uId || !eId || !passType || !tkts || !detail || !detail.date || !detail.venue || !detail.city) {
        return res.status(400).json({ success: false, msg: "Missing required booking details (uId, eId, passType, tkts, detail)" });
    }

    const lockey = `event:${eId}:tier:${passType}:lock:${uId}`;
    let lockAcquired = false;
    const session = await mongoose.startSession();

    try {
        // Acquire Redis lock with modern v4/v5 options (NX: only set if not exists, EX: TTL in seconds)
        const lockResult = await redis.set(lockey, "1", { NX: true, EX: 30 });
        if (!lockResult) {
            return res.status(409).json({ success: false, msg: "Another booking is in progress. Please try again." });
        }
        lockAcquired = true;

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

        // Update ticket availability in Redis cache if key exists
        try {
            await redis.decrBy(`event:${eId}:tier:${passType}:available`, Number(tkts));
        } catch (redisErr) {
            console.error("Error updating Redis ticket count cache:", redisErr);
        }

        return res.status(200).json({ success: true, msg: "Your tickets are booked!", booking });

    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("bookEvent error:", err);
        return res.status(500).json({ success: false, msg: `Internal server error - ${err.message}` });

    } finally {
        // ONLY release the lock if this request was the one that acquired it
        if (lockAcquired) {
            await redis.del(lockey);
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

        const events = await bookedEventModal.find({ userId: uid }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: events });

    } catch (err) {
        console.error("myEvents error:", err);
        return res.status(500).json({ success: false, msg: `Internal server error - ${err.message}` });
    }
}

export { bookEvent, myEvents };