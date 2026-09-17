import mongoose from "mongoose";

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mail: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    pass: {
        type: String,
        required: true
    },
    interest: {
        type: [String],
        required: true,
        default: []
    }
}, {
    timestamps: true
});

const userModal = mongoose.model('user', user);

export { userModal };