
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema
({
    title: 
    {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    // MINI descrição
    slug:
    {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        maxlength: 100
    },
    content:
    {
        type: String,
        required: true
    },
    excerpt:
    {
        type: String,
    },
    author:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    coverImage: 
    {
        type: String,
    },
    coverImagePublicId:
    {
        type: String,
        default: ""
    },
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
    type: {
        type: String,
        default: "Post"
    }
}, { timestamps: true });

postSchema.pre("save", async function ()
{
    // if (this.isModified("content"))
    // {
    //     this.excerpt = this.content.length > 98
    //     ? this.content.substring(0, 96) + "..."
    //     : this.content
    // }

});

module.exports = mongoose.model("Posts", postSchema);
