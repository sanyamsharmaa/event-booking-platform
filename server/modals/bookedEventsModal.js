import mongoose from "mongoose";


const schema = new mongoose.Schema({
    holder:{
        type:String,
        required:true
    },
    passType:{
        type:Date,
        required:true
    },
    Category:{
        type: String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    passType:{
        type: Object,
        required:true
    },
    tktCount:{
        type:Number,
        required :true
    }
},{
    timestamps:true
})

 

const bookedEventModal = mongoose.model('event', schema)
export {bookedEventModal}