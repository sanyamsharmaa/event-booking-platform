import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    category:{
        type: String,
        required:true
    },
    details: [{
        city : String,  //array of objects each object has detail of city, date and venue 
        date :Date,
        venue: String,
    }],
    passTypes:[{
        tier: String, //object that having keys as type and value for price
        price : Number,
        tktCount:Number
    }],
    img:{
        type:String,
        required:true
    },
    artists:[  String
    ],
    desp:{
        type: String,
        required:true
    },
},
    {timestamps:true

    })


const eventModal = mongoose.model('event', schema)
export {eventModal}