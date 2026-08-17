import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type : String,
        required :true
    },
    mail:{
        type : String,
        required :true
    },
    mobile:{
        type : String,
        required :true
    },
    pass:{
        type : String,
        required :true
    },
    stats:{
        type:Number,
        default:0
    },
    headline:{
        type : String,
        default: 'Artist'
    }

},{timestamps:true})

const artistModal = mongoose.model('artist', schema);

export {artistModal}