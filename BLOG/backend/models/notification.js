
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({

    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    type: {
        type: String,
        enum: ["comment", "reply", "follow", "likeProfile", "dislikePost", "likePost"],
        required: true
    },

    target:
    {
        type: Schema.Types.ObjectId,
        refPath: "postType"
    },

    postType:
    {
        type: String,
        enum:
        [
            "Posts",
            "Polls"
        ]
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comments"
    },

    read: {
        type: Boolean,
        default: false,
        index: true
    }

}, { timestamps: true });

notificationSchema.index(
    { recipient: 1, sender: 1, type: 1, post: 1 },
    /* Somente um para cada usuário e etc */
    {
        unique: true,

        // SOMENTE para essas partes que ele não duplicará
        partialFilterExpression:
        {
            type: { $in: ["likeProfile", "likePost", "follow"] }
        }
    }
);

module.exports = mongoose.model("Notification", notificationSchema);