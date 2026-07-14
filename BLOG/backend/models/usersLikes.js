
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userLikeSchema = new Schema
({
    // Quem curtiu
    userId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Quem foi curtido
    likedUserId:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
}, { timestamps: true });

// Evita duplicados
userLikeSchema.index({ userId: 1, likedUserId: 1 }, { unique: true });

module.exports = mongoose.model("UserLike", userLikeSchema);
