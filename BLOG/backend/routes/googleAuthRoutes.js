
const router = require("express").Router();
const passport = require("passport");

// 
router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

// Callback (Google volta pra cá)
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    (req, res) => 
    {

        // Salva a sessão
        req.session.user = {
            id: req.user._id,
            role: req.user.role
        };

        return req.session.save(err => {
            
            if (err) 
            {
                return res.redirect(`${process.env.FRONTEND_URL}/auth/google/fail`);
            }

            return res.redirect(`${process.env.FRONTEND_URL}/auth/google/success`);
        });
    }
);

module.exports = router;