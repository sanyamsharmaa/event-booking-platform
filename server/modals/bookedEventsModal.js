import mongoose from "mongoose";


const schema = new mongoose.Schema({
    userId: { // userid
        type: mongoose.Types.ObjectId,
        required: true
    },
    eventId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    passType: {
        type: String,
        required: true
    },
    // Category:{
    //     type: String,
    //     required:true
    // },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,  // combined string of city and venue
        required: true
    },
    tktCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true    
})



const bookedEventModal = mongoose.model('bookedEvent', schema)
export { bookedEventModal }