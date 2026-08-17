import { bookedEventModal } from "../modals/bookedEventsModal.js";
import { eventModal } from "../modals/eventModal.js";
import { userModal } from "../modals/userModal.js";
import { DateTime } from 'luxon';
import { redis } from '../utils/redis.js'


async function bookEvent(req, res) {
    const session = await mongoose.startSession();
    const lockey = `event:${req.body.eId}:tier:${req.body.passType}:lock:${req.body.uId}`;

    try {
        const { uId, eId, passType, tkts, detail } = req.body;

        // ✅ FIX 5: Acquire Redis lock BEFORE doing anything (NX = only set if not exists, EX = TTL in seconds)
        const lockAcquired = await redis.set(lockey, "1", "NX", "EX", 30);
        if (!lockAcquired) {
            return res.status(409).json({ success: false, msg: "Another booking is in progress. Please try again." });
        }

        // ✅ FIX 1: return after every early-exit response
        const user = await userModal.findById(uId);
        if (!user) {
            return res.status(400).json({ success: false, msg: "User not found" });
        }

        const event = await eventModal.findById(eId);
        if (!event) {
            return res.status(400).json({ success: false, msg: "Event not found" });
        }

        // ✅ FIX 2 & 3: Correct date comparison using plain Date (no await on DateTime.now())
        const now = new Date();
        if (new Date(detail.date) < now) {
            return res.status(400).json({ success: false, msg: "Event has already ended" });
        }

        // ✅ FIX 4: Single $elemMatch combining both conditions
        const show = await eventModal.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(eId),
                    passTypes: {
                        $elemMatch: {
                            tier: passType,
                            tktCount: { $gte: tkts },
                        },
                    },
                },
            },
        ]);

        // ✅ FIX 7: aggregate returns array, check .length not truthiness
        if (show.length === 0) {
            return res.status(400).json({
                success: false,
                msg: `${tkts} tickets not available for this pass type. Try fewer tickets.`,
            });
        }

        // ✅ FIX 6: Start transaction — session abort handled in catch/finally
        session.startTransaction();

        await bookedEventModal.create([{
            userId: uId,
            eventId: eId,
            passType: passType,
            date: detail.date,
            location: `${detail.venue}, ${detail.city}`,
            tktCount: tkts,
        }], { session });

        await eventModal.updateOne(
            { _id: eId, "passTypes.tier": passType },
            { $inc: { "passTypes.$.tktCount": -tkts } },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({ success: true, msg: "Your tickets are booked!" });

    } catch (err) {
        // ✅ FIX 6: Abort transaction on any failure
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("bookEvent error:", err);
        return res.status(500).json({ success: false, msg: `Internal server error - ${err.message}` });

    } finally {
        // ✅ FIX 5 + 6: Always release Redis lock and end session, success or failure
        await redis.del(lockey);
        await session.endSession();
    }
}

async function myEvents(req,res){
    try{
        const {
            uid 
        } = req.body

        if(!uid){
            res.status(400).json({ success: false, msg: "user id is  missing" });
        }
        
        const events = await bookedEventModal.find({userId:uid});
        res.status(200).json({ success: true, data : events});
        
    }
    catch(err){
        res.status(500).json({ success: false, msg: `Internal server error - ${err}` });
    }
}

export  {bookEvent, myEvents};