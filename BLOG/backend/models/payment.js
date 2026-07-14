
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
