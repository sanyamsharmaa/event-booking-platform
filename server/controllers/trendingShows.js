import { eventModal } from "../modals/eventModal.js";

export const trendingShows = async (req, res) => {
    try {
        const trendingEvents = await eventModal.find().sort({ hype: -1 }).limit(10);
        return res.status(200).json({ success: true, data: trendingEvents });
    } catch (err) {
        console.error("Error in trendingShows:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};