import { eventModal } from "../modals/eventModal.js";
import { userModal } from "../modals/userModal.js";

export const recommendedShows = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, msg: "Authentication required" });
        }

        const user = await userModal.findById(userId);
        if (!user || !user.interest || user.interest.length === 0) {
            // Fallback: return top shows if no interests found
            const fallbackEvents = await eventModal.find().sort({ hype: -1 }).limit(10);
            return res.status(200).json({ success: true, data: fallbackEvents });
        }

        const recommendedEvents = await eventModal.find({
            category: { $in: user.interest }
        }).limit(10);

        return res.status(200).json({ success: true, data: recommendedEvents });

    } catch (err) {
        console.error("Error in recommendedShows:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};