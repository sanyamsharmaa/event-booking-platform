import Razorpay from "razorpay";
import crypto from "crypto";
import { reserveTickets } from "../utils/reserveTickets.js";

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export const createOrder = async (req, res) => {
    try {
        const {
            amount,
            receipt,
            notes,
            eventId,
            tkts,
            passType,
        } = req.body || {};

        if (!amount || !eventId || !tkts || !passType) {
            return res.status(400).json({ success: false, msg: "Missing required order parameters (amount, eventId, tkts, passType)" });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, msg: "Authentication required" });
        }

        if (req.user?.role === 'artist') {
            return res.status(403).json({ success: false, msg: "Artists are not allowed to book tickets. Please use an Attendee account." });
        }

        const reserved = await reserveTickets(eventId, passType, userId, tkts);
        if (!reserved) {
            return res.status(400).json({
                success: false,
                msg: "Not enough tickets available for this tier",
            });
        }

        const instance = getRazorpayInstance();
        const options = {
            amount: Math.round(Number(amount) * 100), // Convert to paise
            currency: "INR",
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: notes || {},
        };

        const order = await instance.orders.create(options);
        return res.status(200).json({ success: true, order });

    } catch (error) {
        console.error("Error in createOrder:", error);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, msg: "Payment verification parameters missing" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature === razorpay_signature) {
            return res.status(200).json({ success: true, msg: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, msg: "Payment signature verification failed" });
        }

    } catch (err) {
        console.error("Error in verifyPayment:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

