
const User = require("../models/user");
const badges = require("../utils/bagdes");

exports.ObterTopApoiadores = async (req, res) => 
{

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page <= 0 || limit <= 0 || limit >= 11) {
            return res.status(400).json({
                error: "Valores de apoiadores inválidas."
            });
        }

        const skip = (page - 1) * limit;

        const topsApoiadores = await User.find
        ({
            "statusAccount.isActive": true,
            "stats.amountDonation": { $gt: 0 }
        })
        .sort({ amountDonation: -1 }) // Quem tem mais
        .select("profile.nickname stats.amountDonation profile.avatar.url profile.bio role")
        .skip(skip)
        .limit(limit)
        .lean();

        const total = await User.countDocuments({
            "statusAccount.isActive": true,
            "stats.amountDonation": { $gt: 0 }
        });

        const resultado = topsApoiadores.map(apoiador => {
            return {
                nickname: apoiador.profile.nickname,
                avatar: apoiador.profile.avatar.url,
                bio: apoiador.profile.bio,
                role: apoiador.role,
                badge: badges(apoiador.stats.amountDonation)
            };
        });

        return res.status(200).json({

            apoiadores: resultado,
            hasMore: skip + limit < total
        });


    } catch (err)
    {

        console.error("/controllers/apoiadores.js ObterTopApoiadores error:", err);

        return res.status(500).json({
            error: "Internal server error."
        });
    }

};
