import { eventModal } from "../modals/eventModal.js";
import { DateTime } from 'luxon';

export const getEventList = async (req, res) => {
    try {
        const {
            location = "All",
            category = "All",
            date = "",
            search = "",
        } = req.body;

        const filter = {};

        // Category filter
        if (category && category !== 'All') {
            filter.category = category;
        }

        // Details element match filter (city and date)
        const detailsMatch = {};

        if (location && location !== "All") {
            detailsMatch.city = location;
        }

        if (date && date.trim() !== "") {
            const parsedDate = DateTime.fromFormat(date, "dd-MM-yyyy");
            const dt = parsedDate.isValid ? parsedDate : DateTime.fromISO(date);

            if (dt.isValid) {
                detailsMatch.date = {
                    $gte: dt.startOf('day').toJSDate(),
                    $lte: dt.endOf('day').toJSDate()
                };
            }
        } else {
            // Default: only return shows starting from today onwards
            detailsMatch.date = {
                $gte: DateTime.now().startOf('day').toJSDate()
            };
        }

        if (Object.keys(detailsMatch).length > 0) {
            filter.details = { $elemMatch: detailsMatch };
        }

        // Search filter (name, category, venue, artist) merged with existing filter
        if (search && search.trim() !== "") {
            filter.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { category: { $regex: search.trim(), $options: 'i' } },
                { "details.venue": { $regex: search.trim(), $options: 'i' } },
                { artists: { $regex: search.trim(), $options: 'i' } },
            ];
        }

        const eventData = await eventModal.aggregate([
            {
                $match: filter
            },
            {
                $project: {
                    name: 1,
                    category: 1,
                    details: 1,
                    passTypes: 1,
                    img: 1,
                    artists: 1,
                    desp: 1,
                    hype: 1
                }
            }
        ]);

        return res.status(200).json({ success: true, data: eventData });

    } catch (err) {
        console.error("Error in getEventList:", err);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};