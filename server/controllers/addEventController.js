import { eventModal } from "../modals/eventModal.js";
import { DateTime } from 'luxon';
import { redis } from '../utils/redis.js';

export const addEvent = async (req, res) => {
    try {
        const {
            name,
            category,
            details,
            passTypes,
            img,
            artists,
            desp
        } = req.body;

        if (!name || !category || !details || !passTypes || !img || !artists || !desp) {
            return res.status(400).json({ success: false, msg: "All fields are required" });
        }

        if (!Array.isArray(details) || details.length === 0) {
            return res.status(400).json({ success: false, msg: "Event details cannot be empty" });
        }

        if (!Array.isArray(passTypes) || passTypes.length === 0) {
            return res.status(400).json({ success: false, msg: "Pass types cannot be empty" });
        }

        if (!Array.isArray(artists) || artists.length === 0) {
            return res.status(400).json({ success: false, msg: "Artists array cannot be empty" });
        }

        // Check if event with the same name already exists
        const existingEvent = await eventModal.findOne({ name });
        if (existingEvent) {
            return res.status(400).json({ success: false, msg: "An event with the same name is already present, try something unique" });
        }

        // Format and validate dates safely
        const dObj = details.map(d => {
            const parsedDate = DateTime.fromFormat(d.date, 'dd-MM-yyyy', { zone: 'utc' });
            return {
                city: d.city,
                date: parsedDate.isValid ? parsedDate.toJSDate() : new Date(d.date),
                venue: d.venue
            };
        });

        const obj = {
            name,
            category,
            details: dObj,
            passTypes,
            img,
            artists,
            desp
        };

        // Create the event in MongoDB first to get the generated event._id
        const newEvent = await eventModal.create(obj);

        // Store available ticket counts in Redis using the newly created event._id
        for (const type of passTypes) {
            await redis.set(
                `event:${newEvent._id}:tier:${type.tier}:available`,
                String(type.tktCount)
            );
        }

        return res.status(200).json({ success: true, msg: "Event listed successfully", event: newEvent });

    } catch (err) {
        console.error("Error in addEvent:", err);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};