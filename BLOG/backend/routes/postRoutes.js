
/*

Não temos rate-limit aqui, porque é coisas que somente admins tem acesso

*/

const express = require("express");
const routes = express();

const Posts = require("../controllers/posts");

const PostsModels = require("../models/posts");
const Polls = require("../models/polls");

const Middlewares = require("../middlewares/postValidation");
const MiddlewaresUser = require("../middlewares/userValidation");
const MiddlewareCloudinary = require("../services/cloudinaryService");

const MiddlewareCaptcha = require("../middlewares/captchaValidation");

// const MiddlewaresCaptcha = require("../middlewares/captchaValidation");

routes.post("/createpost", MiddlewaresUser.IsAdmin,
    
MiddlewareCloudinary.upload.fields([
    { name: "coverImage", maxCount: 1 }
])

, Middlewares.ValidarCriarEditarPost, Posts.CriarPost);

routes.post(
    "/createpoll", 

    MiddlewaresUser.IsAdmin,
    MiddlewareCloudinary.upload.any(),

    Posts.CriarPoll
);

routes.put(
    "/editpost/:slug",
    
    MiddlewaresUser.IsAdmin,
    MiddlewareCloudinary.upload.fields([
        { name: "coverImage", maxCount: 1 }
    ]),
    
    Middlewares.ValidarCriarEditarPost, 
    Posts.AtualizarPostagem
);

routes.put(
    "/editpoll/:slug", 

    MiddlewaresUser.IsAdmin,
    MiddlewareCloudinary.upload.any(),

    Posts.AtualizarPoll
);

routes.get("/getposts", Posts.ObterPostagens);
routes.get("/getposts/:slug", Posts.ObterPostPeloSlug);
routes.get("/getpolls/:slug", Posts.ObterPollPeloSlug);

routes.post("/poll/vote/:slug", MiddlewareCaptcha.VerificarCaptcha, Posts.VotarPoll);

routes.delete("/deletepost/:slug", MiddlewaresUser.IsAdmin, Posts.DeletarPost);
routes.delete("/deletepoll/:slug", MiddlewaresUser.IsAdmin, Posts.DeletarPoll);

routes.get("/postMeta/:slug", async (req, res) => {

    const { slug } = req.params;
    const post = await PostsModels.findOne({ slug: slug })
    .populate("author", "-_id profile.nickname")
    .select("-lastViewUpdateAt");

    if (!post || post.status === "deleted") {
        return res.status(404).send("Post não encontrado");
    }

    const frontendUrl = `${process.env.FRONTEND_URL}/posts/${post.slug}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8" />
            <title>${post.title}</title>

            <meta property="og:type" content="article" />
            <meta property="og:title" content="${post.title}" />
            <meta property="og:description" content="${post.slug}" />
            <meta property="og:image" content="${post.banner}" />
            <meta property="og:url" content="${frontendUrl}" />

            <meta name="twitter:card" content="summary_large_image" />

            <meta http-equiv="refresh" content="0;url=${frontendUrl}" />
        </head>
        <body>
            Redirecionando...
        </body>
        </html>
    `);
});

routes.get("/pollMeta/:slug", async (req, res) => {

    const { slug } = req.params;
    const post = await PollModels.findOne({ slug })
    .populate("author", "-_id profile.nickname")
    .select("-lastViewUpdateAt");

    if (!post || post.status === "deleted") {
        return res.status(404).send("Poll não encontrado");
    }

    const frontendUrl = `${process.env.FRONTEND_URL}/posts/${post.slug}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8" />
            <title>${post.title}</title>

            <meta property="og:type" content="article" />
            <meta property="og:title" content="${post.title}" />
            <meta property="og:description" content="${post.slug}" />
            <meta property="og:url" content="${frontendUrl}" />

            <meta name="twitter:card" content="summary_large_image" />

            <meta http-equiv="refresh" content="0;url=${frontendUrl}" />
        </head>
        <body>
            Redirecionando...
        </body>
        </html>
    `);
});


module.exports = routes;

