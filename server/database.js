import mongoose from "mongoose";
// console.log(process.env.MONGO_URI)
export const connectDB =()=>{
mongoose.connect(process.env.MONGO_URI).then( ()=>console.log("databse connected"))
}