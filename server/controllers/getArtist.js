import mongoose from "mongoose"

import { artistModal } from "../modals/artistModal.js";

export const getArtist = async (req, res) => {
    try{
        const artistName = req.body.artistName;
        if(!artistName){
            res.status(400).json({success:false,msg:"please give name of artist"});
        }
        // const filter = { name : { $regex: artistName, $options: 'i' } };
        // const artistData = await artistModal.aggregate([
        //     {
        //         $match: filter 
        //     }
        // ])
 
 const artistData = await artistModal.aggregate([
        {
            $search: {
                index: "artist-fuzzy-search", // Must match the index name you created
                text: {
                    query: artistName,
                    path: "name",
                    fuzzy: {
                        maxEdits: 2,        // Allows up to 2 character differences
                        prefixLength: 0     // Fuzzy matching starts from first character
                    }
                }
            }
        },
        {
            $addFields: {
                score: { $meta: "searchScore" }  // Add relevance score
            }
        },
        {
            $limit: 20  // Limit results (optional)
        },
        {
            $project: {
                // pass: 0,  // Exclude password from results!
                name:1
            }
        }
    ]);
        
        return res.status(200).json({success : true, data: artistData})
    }
    catch(err){
        console.log("err-", err)
        return res.status(500).json({success : false, msg: "Internal Server Error"})
    }
}

export const artistProfile = async(req,res) =>{
    try{
        const id = req.body.artistId;
        if(!id){
        return res.status(400).json({success : false, msg: "artist id is required"})
        }

        const profile = await artistModal.aggregate([
            {
                $match:{
                    _id : new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup:{
                    from : "events",
                    localField : "name",
                    foreignField: "artists",
                    as : "events"
                }
            },
            {
                $project:{
                    pass:0,
                    mobile : 0,
                    mail:0
                }
            }
        ])

        if(!profile){
        return res.status(400).json({success : false, msg: "No events"})
        }
        return res.status(200).json({success : false, data : profile})

    }
    catch(err){
        console.log("err-", err)
        return res.status(500).json({success : false, msg: "Internal Server Error"})
    }
}