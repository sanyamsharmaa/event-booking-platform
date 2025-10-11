import { eventModal } from "../modals/eventModal.js"
import {DateTime} from 'luxon'

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
        } = req.body
        console.log("body-", req.body)

        if(!name || !category || !details || !passTypes || !img || !artists || !desp){
            res.status(400).json({status:false, msg:"fill all the fields"})
        }

        if(details.length==0){
            res.status(400).json({status:false, msg:"event details can't be empyty"})

        }
        const dObj = details.map(d=>({
            city : d.city,
            date :DateTime.fromFormat(d.date, 'dd-MM-yyyy', { zone: 'utc' }).toISO(),
            venue: d.venue
        }))
        
        if(Object.keys(passTypes).length==0){
            res.status(400).json({status:false, msg:"pass type can't be empyty"})

        }

        if(artists.length==0){
            res.status(400).json({status:false, msg:"artist array can't be empyty"})

        }

        const check = await eventModal.find({name:name});
        console.log("check-", check)
        if(check.length){
            res.status(400).json({status:false, msg:"event of same name is already present, try something unique"})
            
        }
        const obj = {
            name:name,
            category : category,
            details: dObj,
            passTypes: passTypes,
            img: img,
            artists: artists,
            desp : desp
        }
        await eventModal.create(obj)
        res.status(200).json({status:true, msg:"Event listed successfully"})

    }
    catch (err) {
        console.log(err)
         res.status(500).json({status:false, msg:"internal server error"})

    }
}