import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    details: [{
        city: { type: String, required: true },
        date: { type: Date, required: true },
        venue: { type: String, required: true },
    }],
    passTypes: [{
        tier: { type: String, required: true },
        price: { type: Number, required: true },
        tktCount: { type: Number, required: true }
    }],
    img: {
        type: String,
        required: true
    },
    artists: {
        type: [String],
        required: true,
        index: true
    },
    desp: {
        type: String,
        required: true
    },
    hype: {
        type: Number,
        default: 0,
        index: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'artist',
        index: true
    }
}, {
    timestamps: true
});

schema.index({ "details.city": 1, "details.date": 1 });

const eventModal = mongoose.model('event', schema);
export { eventModal };