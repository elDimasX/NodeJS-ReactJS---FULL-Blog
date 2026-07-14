
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const pollSchema = new mongoose.Schema({

    title: 
    {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    slug:
    {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        maxlength: 100
    },
    author:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    options:
    [{
        text: String,
        image: String,
        votes: { type: Number, default: 0 }
    }],
    voters: 
    [{
        user: { type: Schema.Types.ObjectId, ref: "User" },
        optionId: { type: Schema.Types.ObjectId }
    }],
    tags:
    [{
        type: String
    }],
    lastViewUpdateAt: {
        type: Date
    },
    views:
    {
        type: Number,
        default: 0
    },
    status:
    {
        type: String,
        enum: ["published", "deleted"],
        default: "published"
    },
    type:
    {
        type: String,
        default: "Poll"
    }
}, { timestamps: true });

module.exports = mongoose.model("Polls", pollSchema);
