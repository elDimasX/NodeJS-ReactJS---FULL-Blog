
const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bcrypt = require("bcrypt")


const userSchema = new Schema(
{
    // ======================
    // PERFIL
    // ======================
    profile:
    {
        nickname:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 22,
            lowercase: true,
            match: [/^[a-z0-9_]+$/, "Invalid nickname!"]
        },

        name:
        {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 60
        },

        email:
        {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email!"],
            minlength: 5,
            maxlength: 70
        },

        showEmail:
        {
            type: Boolean,
            default: false
        },

        avatar:
        {
            url:
            {
                type: String,
                default: "https://res.cloudinary.com/dinqxcmyu/image/upload/v1775776517/default-avatar-icon-of-social-media-user-vector_s2fcre.jpg"
            },

            publicId:
            {
                type: String,
                default: ""
            }
        },

        banner:
        {
            url:
            {
                type: String,
                default: ""
            },

            publicId:
            {
                type: String,
                default: ""
            }
        },

        bio:
        {
            type: String,
            trim: true,
            maxlength: 200,
            default: "Oi, eu sou novo por aqui!"
        }
    },

    // ======================
    // AUTENTICAÇÃO
    // ======================

    auth:
    {
        provider:
        {
            type: String,
            default: "local"
        },

        password:
        {
            type: String,
            minlength: 6,
            maxlength: 60,
            validate:
            {
                validator: function (value)
                {
                    if (this.auth?.provider === "google")
                    {
                        return true;
                    }

                    return typeof value === "string" && value.length >= 6;
                },

                message: "Password inválida."
            }
        },

        google:
        {
            id:
            {
                type: String,
                unique: true,
                sparse: true
            }
        }
    },

    // ======================
    // PERMISSÕES
    // ======================

    role:
    {
        type: String,
        enum: ["user", "moderator", "admin"],
        default: "user"
    },

    // ======================
    // EMAIL VERIFICADO
    // ======================
    emailVerified:
    {
        type: Boolean,
        default: false
    },

    // ======================
    // TOKENS
    // ======================

    tokens:
    {
        emailVerification:
        {
            token:
            {
                type: String,
                sparse: true,
                unique: true
            },

            expires:
            {
                type: Date
            }
        },

        passwordReset:
        {
            token:
            {
                type: String,
                sparse: true,
                unique: true
            },

            expires:
            {
                type: Date
            }
        }
    },

    // ======================
    // ATIVIDADE
    // ======================

    stats:
    {
        likes:
        {
            type: Number,
            default: 0
        },

        amountDonation:
        {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ======================
    // RATE LIMITS / TEMPOS
    // ======================

    lastActions:
    {
        profileUpdateAt:
        {
            type: Date
        },

        commentAt:
        {
            type: Date
        }
    },

    // ======================
    // STATUS ACCOUNT
    // ======================

    statusAccount:
    {
        isActive:
        {
            type: Boolean,
            default: true
        },

        reason:
        {
            type: String,
            default: ""
        }
    }

}, { timestamps: true });

// Isso agiliza pro top doadores, vamos organizar pela doação
userSchema.index({
    "statusAccount.isActive": 1,
    "stats.amountDonation": -1
});

const SALT_ROUNDS = 10;

userSchema.pre("save", async function (){

    if (this.isModified("auth.password"))
    {
        this.auth.password = await bcrypt.hash(this.auth.password, SALT_ROUNDS);
    }

    // if (!this.token)
    // {
    //     this.token = randomUUID();
    // }

});

userSchema.methods.comparePassword = function (passwordToCheck)
{
    return bcrypt.compare(passwordToCheck, this.auth.password)
};

module.exports = mongoose.model("User", userSchema);
