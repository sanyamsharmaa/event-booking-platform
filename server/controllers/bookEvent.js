import { bookedEventModal } from "../modals/bookedEventsModal.js";
import { eventModal } from "../modals/eventModal.js";
import { userModal } from "../modals/userModal.js";
import { DateTime } from 'luxon';


async function bookEvent(req, res) {
    try {
        const {
            uId,
            eId,
            passType,
            tkts,
            detail,
        } = req.body

        const user = await userModal.findById(uId);
        if (!user) {
            res.status(400).json({ success: false, msg: "user not found" });
        }
        const event = await eventModal.findById(eId);
        if (!event) {
            res.status(400).json({ success: false, msg: "event not found" });
        }

        const date = await DateTime.now()
        if (detail.date > date) {
            res.status(400).json({ success: false, msg: "event ended" });
        }

        // const show = await eventModal.aggregate([
        //     {
        //         $match:{
        //             passTypes:{
        //                 $elemMatch:{
        //                     tier:passType
        //                 },
        //                 $elemMatch:{
        //                     tktCount:{$gte:tkts}
        //                 }
        //             }
        //         }
        //     }
        // ])
        // const show = await eventModal.findOne({
        //     _id: eId,
        //     "passTypes.tier": passType,
        // });.
        console.log("passtype-", passType)
        const show = await eventModal.findOne(
            {
                _id: eId,
                passTypes: {
                    $elemMatch:{ tier: passType },
                    
                }
            },
        );
        
        console.log("show-", show)

        if (!show) {
            res.status(400).json({ success: false, msg: `${tkts} are not available, try with less number of tickets` });
        }

        await bookedEventModal.create({
            userId: uId,
            eventId: eId,
            passType: passType,
            date: detail.date,
            location: `${detail.venue}, ${detail.city}`,
            tktCount: tkts,
        })

        await eventModal.updateOne(
            { _id: eId, "passTypes.tier": passType },
            { $inc: { "passTypes.$.tktCount": -tkts } }
        );
        res.status(200).json({ success: false, msg: "Your tickets are booked" });

    }
    catch (err) {
        res.status(500).json({ success: false, msg: `Internal server error - ${err}` });

    }
}


export default bookEvent;