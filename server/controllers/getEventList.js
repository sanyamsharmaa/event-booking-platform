import { eventModal } from "../modals/eventModal.js";


export const getEventList = async (req, res) => {

    try {
        const {
            location,
            category,
            date = "",
            search = "",
        } = req.body



        if (!location || !category ) {
            res.status(404).json({ success: true, msg: "All fields are required" })
        }
        const filter = {}
        if (date != "") {
            let startDate, endDate;
            const today = DateTime.now();
            if (date !== "") {
                startDate = today.startof(date).toISO(),
                    endDate = today.endof(date).toISO()  // date must be either  'week', 'month'
                filter.details.date = { $gte: startDate, $lte: endDate }
            }
        }
            if (category !== 'All') {
                // filter.category = { $in: ['movies', 'concerts', 'sports', 'comedy', 'workshops'] }
                filter.category = { $eq: category }
            }
            if(location !== ""){
                // filter.details.city = {$eq:location}
                filter['details.city'] = location; 
            }

            if (search != "") {

                //regex search - for name, category, city, venue, artist, 

            }
            console.log("filter-", filter)
            const eventData = await eventModal.aggregate([
                {
                    $match: filter
                },
                {
                    $project: {
                        name : 1,
                        category : 1,
                        details : 1,
                        passTypes : 1,
                        img : 1,
                        artists : 1,
                        desp : 1
                    }
                }
            ])  
                      
            res.status(200).json(eventData)
        }
    catch (err) {
        console.log('err-', err)
        res.status(500).json({success :true, msg:"Internal server error"}) 
    }
}