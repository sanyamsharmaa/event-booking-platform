import mongoose from "mongoose";

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        required: true,
        index: true
    },
    passType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    tktCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true    
});

const bookedEventModal = mongoose.model('bookedEvent', schema);

export { bookedEventModal };