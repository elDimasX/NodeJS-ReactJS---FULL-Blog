
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema
({

    // Qual a publicagem
    post: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "postType"
    },
    postType: {
        type: String,
        required: true,
        enum: ["Posts", "Polls"]
    },

    // Quem CRIOU o comentário
    author:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content:
    {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    parent:
    {
        type: Schema.Types.ObjectId,
        ref: "Comments",
        default: null
    },
    status:
    {
        type: String,
        enum: ["visible", "deleted"],
        default: "visible"
    }

}, { timestamps: true });

module.exports = mongoose.model("Comments", commentSchema);
