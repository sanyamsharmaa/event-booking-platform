import { eventModal } from "../modals/eventModal.js";
import { DateTime } from 'luxon';
import { redis, redisConnect } from '../utils/redis.js';
import mongoose from 'mongoose';

/**
 * Get all events listed by the authenticated artist
 */
export const myShows = async (req, res) => {
    try {
        const artistId = req.user?.id;
        const artistName = req.user?.name;

        if (!artistId) {
            return res.status(401).json({ success: false, msg: "Unauthorized" });
        }

        // Query by creatorId, or fallback to matching artist name for legacy events
        const queryConditions = [
            { creatorId: new mongoose.Types.ObjectId(artistId) }
        ];

        if (artistName) {
            queryConditions.push({ artists: { $regex: new RegExp(`^${artistName}$`, 'i') } });
        }

        const events = await eventModal.find({
            $or: queryConditions
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: events,
            count: events.length
        });

    } catch (err) {
        console.error("Error in myShows:", err);
        return res.status(500).json({ success: false, msg: `Internal server error: ${err.message}` });
    }
};

/**
 * Update an existing event listed by the artist
 */
export const updateEvent = async (req, res) => {
    try {
        const artistId = req.user?.id;
        const artistName = req.user?.name;
        const { eventId, name, category, details, passTypes, img, artists, desp, hype } = req.body;

        if (!eventId) {
            return res.status(400).json({ success: false, msg: "Event ID is required" });
        }

        const event = await eventModal.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, msg: "Event not found" });
        }

        // Check ownership
        const isOwner = (event.creatorId && event.creatorId.toString() === artistId) ||
                        (artistName && event.artists?.some(a => a.toLowerCase() === artistName.toLowerCase()));

        if (!isOwner) {
            return res.status(403).json({ success: false, msg: "You are not authorized to edit this event" });
        }

        // Format dates safely if details provided
        let formattedDetails = event.details;
        if (Array.isArray(details) && details.length > 0) {
            formattedDetails = details.map(d => {
                if (d.date instanceof Date) return d;
                const parsedDate = DateTime.fromFormat(String(d.date), 'dd-MM-yyyy', { zone: 'utc' });
                return {
                    city: d.city,
                    date: parsedDate.isValid ? parsedDate.toJSDate() : new Date(d.date),
                    venue: d.venue
                };
            });
        }

        // Prepare updated fields
        if (name) event.name = name;
        if (category) event.category = category;
        if (formattedDetails) event.details = formattedDetails;
        if (img) event.img = img;
        if (artists && Array.isArray(artists)) event.artists = artists;
        if (desp) event.desp = desp;
        if (hype !== undefined) event.hype = Number(hype);
        if (!event.creatorId) event.creatorId = artistId;

        if (Array.isArray(passTypes) && passTypes.length > 0) {
            event.passTypes = passTypes;

            // Sync updated available counts in Redis
            if (redis.isOpen) {
                for (const tier of passTypes) {
                    try {
                        await redis.set(
                            `event:${event._id}:tier:${tier.tier}:available`,
                            String(tier.tktCount)
                        );
                    } catch (redisErr) {
                        console.error("Redis sync error during updateEvent:", redisErr.message);
                    }
                }
            }
        }

        const updatedEvent = await event.save();

        return res.status(200).json({
            success: true,
            msg: "Event updated successfully",
            event: updatedEvent
        });

    } catch (err) {
        console.error("Error in updateEvent:", err);
        return res.status(500).json({ success: false, msg: `Internal server error: ${err.message}` });
    }
};

/**
 * Delete an existing event listed by the artist
 */
export const deleteEvent = async (req, res) => {
    try {
        const artistId = req.user?.id;
        const artistName = req.user?.name;
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ success: false, msg: "Event ID is required" });
        }

        const event = await eventModal.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, msg: "Event not found" });
        }

        // Check ownership
        const isOwner = (event.creatorId && event.creatorId.toString() === artistId) ||
                        (artistName && event.artists?.some(a => a.toLowerCase() === artistName.toLowerCase()));

        if (!isOwner) {
            return res.status(403).json({ success: false, msg: "You are not authorized to delete this event" });
        }

        // Clean up Redis inventory cache for all pass tiers of this event
        if (redis.isOpen && event.passTypes) {
            for (const tier of event.passTypes) {
                try {
                    await redis.del(`event:${event._id}:tier:${tier.tier}:available`);
                } catch (redisErr) {
                    console.error("Redis cleanup error during deleteEvent:", redisErr.message);
                }
            }
        }

        await eventModal.findByIdAndDelete(eventId);

        return res.status(200).json({
            success: true,
            msg: "Event deleted successfully",
            eventId
        });

    } catch (err) {
        console.error("Error in deleteEvent:", err);
        return res.status(500).json({ success: false, msg: `Internal server error: ${err.message}` });
    }
};
