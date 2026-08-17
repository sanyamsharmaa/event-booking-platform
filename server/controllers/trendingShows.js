import { eventModal } from "../modals/eventModal.js";

export const trendingShows = async (req, res)=>{
    try{
        const trendingEvents = await eventModal.find().sort({ hype: -1 }).limit(10);
        res.status(200).json({success:true, trendingEvents});
    }
    catch(err){
        res.status(500).json({success:false, message:"Internal Server Error"})
    }   
}