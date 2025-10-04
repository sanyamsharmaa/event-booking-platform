import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()
// console.log(process.env.MONGO_URI)
export const connectDB =async()=>{
    console.log("trying to connect with server")
    try{
       await mongoose.connect(process.env.MONGO_URI).then( ()=>console.log("database successfully connected"))
    }
    catch(err){
        console.log("error in connecting with database-",err)
    }
}