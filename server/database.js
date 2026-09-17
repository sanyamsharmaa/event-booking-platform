import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database successfully connected");
    } catch (err) {
        console.error("Error in connecting with database:", err);
    }
};