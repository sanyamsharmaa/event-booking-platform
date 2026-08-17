import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import crypto from "crypto";
import { reserveTickets } from "../utils/reserveTickets.js";
import { redis } from "../utils/redis.js";

//Razorpay instanse
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to generate idempotency key
function generateIdempotencyKey(orderId, userId) {
  return crypto
    .createHash("sha256")
    .update(`${orderId}-${userId}-${Date.now()}`)
    .digest("hex");
}

export const createOrder = async (req, res) => {
  try {
    const {
      amount,
      receipt,
      notes,
      orderId = "xyz",
      eventId,
      tkts,
      passType,
    } = req?.body;
    const userId = req?.user?.id || "6969";

    const reserved = await reserveTickets(eventId, passType, userId, tkts);

    if (!reserved) {
      return res.status(400).json({
        message: "Not enough tickets available",
      });
    }

    const idempotencyKey = generateIdempotencyKey(orderId, userId);
    const options = {
      amount: amount, // Razorpay expects amount in paise
      currency: "INR",
      receipt: receipt,
      notes: notes,
    };
    console.log("options-", options);
    instance.orders.create(
      options,
    //   {
    //     headers: {
    //       "X-Payer-Idempotent": idempotencyKey,
    //     },
    //   },
      function (err, order) {
        if (err) {
          return res
            .status(500)
            .json({ success: false, msg: "Error creating order", error: err });
        }
        return res.status(200).json({ success: true, order });
      },
    );
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const isverified = validateWebhookSignature(
      razorpay_order_id + "|" + razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET,
    );
    console.log("isverified-", isverified);
    if (isverified) {
      console.log("payment is verified");
      res
        .status(200)
        .json({ success: true, msg: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, msg: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Error in verifyPayment:", err);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};
