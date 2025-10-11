import mongoose from "mongoose"

const user = mongoose.Schema({
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
    interest:{
        type :Array,
        required:true
    }
},{
    timestamps:true  
})


const userModal = mongoose.model('user',user )

export {userModal}