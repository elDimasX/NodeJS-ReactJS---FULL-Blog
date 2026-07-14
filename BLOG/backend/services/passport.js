

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const slugify = require("slugify");
const passport = require("passport");

const escapeHtml = require("escape-html");

passport.use(
  new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID_FOR_LOGIN,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_FOR_LOGIN,
        callbackURL: "/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {

            let user = await User.findOne({ "auth.google.id": profile.id });

            if (!user) 
            {

                const email = profile.emails[0].value;

                // Verifica se já existe conta com esse email
                user = await User.findOne({ email });

                if (user)
                {
                    user.auth.googleId = profile.id;
                    user.auth.provider = "google";
                    await user.save();
                }
                
                else {

                    // Cria nickname único
                    let baseNickname = slugify(profile.displayName || "user", {
                        lower: true,
                        strict: true
                    });

                    // fallback se ficar vazio
                    if (!baseNickname) {
                        baseNickname = "user";
                    }

                    // garante formato válido
                    baseNickname = baseNickname.replace(/[^a-z0-9_]/g, "");

                    // garante tamanho mínimo
                    if (baseNickname.length < 3) {
                        baseNickname = baseNickname + crypto.randomBytes(2).toString("hex");
                    }

                    let nickname = escapeHtml(baseNickname);
                    let count = 0;

                    // garante único
                    while (await User.findOne({ nickname })) {
                        count++;
                        nickname = `${baseNickname}${count}`;
                    }

                    user = await User.create({
                        auth:
                        {
                            provider: "google",

                            google:
                            {
                                id: profile.id
                            }
                        },

                        profile:
                        {
                            nickname,

                            name: profile.displayName,

                            email,

                            avatar:
                            {
                                url: profile.photos[0].value
                            }
                        },

                        emailVerified: true
                    });
                }
            } else {

                console.log("passport.use(new GoogleStrategy(");


            }

            return done(null, user);

        } catch (err) {

            console.log(`/services/passport.js passport.use ${err}`)
            return done(err, null);
        }
    }
  )
);

