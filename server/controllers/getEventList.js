import { eventModal } from "../modals/eventModal.js";
import { DateTime } from 'luxon'

export const getEventList = async (req, res) => {

    try {
        const {
            location,
            category,
            date = "",
            search = "",
        } = req.body



        if (!location || !category) {
            res.status(404).json({ success: true, msg: "All fields are required" })
        }
        let filter = {}
        if (date != "") {
            let startDate, endDate;
            const today = DateTime.now();
            if (date !== "") {
                startDate = new Date(today.startOf(date).toISO()),
                    endDate = new Date(today.endOf(date).toISO())  // date must be either  'week', 'month'
                console.log("start and end date-", startDate, endDate, typeof(startDate))
                // filter['details.date'] = { $gte: startDate, $lte: endDate }
                // This ensures that a SINGLE element in the details array matches the entire date range.
                filter.details = {
                    $elemMatch: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                };
            }
        }
        if (category !== 'All') {
            // filter.category = { $in: ['movies', 'concerts', 'sports', 'comedy', 'workshops'] }
            filter.category = { $eq: category }
        }
        if (location !== "All") {
            // filter.details.city = {$eq:location}
            filter['details.city'] = location;
        }

        if (search != "") {

            //regex search - for name, category, city, venue, artist, 
            filter = {
                $or:[
                    {"name" : {$regex : search, $options : 'i'}},
                    {"category":  {$regex : search, $options : 'i'}},
                    {"details.venue":  {$regex : search, $options : 'i'}},
                    {"artists": {$regex : search, $options : 'i'}},
                ]
            }
        }
        console.log("filter-", filter)
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
                    desp: 1
                }
            }
        ])

        res.status(200).json(eventData)
    }
    catch (err) {
        console.log('err-', err)
        res.status(500).json({ success: true, msg: "Internal server error" })
    }
}