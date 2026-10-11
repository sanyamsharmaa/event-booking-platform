import mongoose from "mongoose";
import { artistModal } from "../modals/artistModal.js";
import { eventModal } from "../modals/eventModal.js";

export const getArtist = async (req, res) => {
    try {
        const artistName = req.body?.artistName ;
        // console.log("artistName : ", artistName)
        if (!artistName) {
            return res.status(400).json({ success: false, msg: "Please provide the name of the artist" });
        }

        let artistData; 

        // try {
        //     // Attempt Atlas search if configured
        //     artistData = await artistModal.find().limit(20);
        //     artistData = await artistModal.aggregate([
        //         {
        //             $search: {
        //                 index: "artist-fuzzy-search",
        //                 text: {
        //                     query: artistName,
        //                     path: "name",
        //                     fuzzy: {
        //                         maxEdits: 2,
        //                         prefixLength: 0
        //                     }
        //                 }
        //             }
        //         },
        //         {
        //             $addFields: {
        //                 score: { $meta: "searchScore" }
        //             }
        //         },
        //         {
        //             $limit: 20
        //         },
        //         {
        //             $project: {
        //                 pass: 0,
        //                 mobile: 0,
        //                 mail: 0
        //             }
        //         }
        //     ]);

        // } catch (searchErr) {
        //     // Fallback to regex search for standard / local MongoDB
        //     console.log("searchErr")
        //     artistData = await artistModal.find(
        //         { name: { $regex: artistName, $options: 'i' } },
        //         { pass: 0, mobile: 0, mail: 0 }
        //     ).limit(20);
        // }

        artistData = await artistModal.find(
            { name: { $regex: artistName, $options: 'i' } },
            { pass: 0, mobile: 0, mail: 0 }
        ).limit(20);
        
        // console.log("artistData : ", artistData)

        return res.status(200).json({ success: true, data: artistData });

    } catch (err) {
        console.error("Error in getArtist:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

export const artistProfile = async (req, res) => {
    try {
        const id = req.body?.artistId || req.body?.id || req.query?.artistId;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "A valid artist id is required" });
        }

        const artist = await artistModal.findById(id, { pass: 0, mobile: 0, mail: 0 });
        if (!artist) {
            return res.status(404).json({ success: false, msg: "Artist profile not found" });
        }

        // Find events associated with this artist by creatorId or artist name
        const events = await eventModal.find({
            $or: [
                { creatorId: new mongoose.Types.ObjectId(id) },
                { artists: { $regex: new RegExp(`^${artist.name}$`, 'i') } }
            ]
        }).sort({ createdAt: -1 });

        const profileData = {
            ...artist.toObject(),
            events: events || []
        };

        return res.status(200).json({ success: true, data: profileData });

    } catch (err) {
        console.error("Error in artistProfile:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

