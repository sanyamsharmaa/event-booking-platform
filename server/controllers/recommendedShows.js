import {eventModal} from "../modals/eventModal.js";
import {userModal} from "../modals/userModal.js";

export const recommendedShows = async(req, res) => {
    try{
        const user = req.user;
        const obj = await userModel.findById(user.id);
        const interests = obj.interest; //array of interests
        const recommendedEvents = await eventModel.find({category : {$in: interests}}).limit(10);
        res.status(200).json({success:true, recommendedEvents});
    }
    catch(err){
        res.status(500).json({success:false, message:"Internal Server Error"})
    }
}