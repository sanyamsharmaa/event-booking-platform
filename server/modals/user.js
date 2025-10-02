import mongoose from "mongoose"

const user = {
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
    }
}


const userModal = mongoose.model('user',user )

export {userModal}