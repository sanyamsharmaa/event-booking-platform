import mongoose from "mongoose";

const schema = new mongoose.Schema({
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
    stats: {
        type: Number,
        default: 0
    },
    headline: {
        type: String,
        default: 'Artist'
    },
    img: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const artistModal = mongoose.model('artist', schema);

export { artistModal };