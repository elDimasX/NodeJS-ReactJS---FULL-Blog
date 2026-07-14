
const express = require("express");
const routes = express();

const Comments = require("../controllers/comments");
const Middlewares = require("../middlewares/commentValidation");
const MiddlewareCaptcha = require("../middlewares/captchaValidation");


const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const limitComment = rateLimit({
    windowMs: 1000 * 90, // 1 minuto e 30 segundos
    max: 3,
    message:
    {
        error: "Muitos comentários rapidamente. Aguarde um pouco antes de tentar novamente."
    },
    keyGenerator: (req) => {
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
})

const limitGetComments = rateLimit({
    windowMs: 6000 * 60,
    max: 18,
    message:
    {
        error: "Muitas requisições no servidor. Aguarde um pouco antes de tentar carregar os comentários."
    },
    keyGenerator: (req) => {
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
});

const limitDeleteComment = rateLimit({
    windowMs: 1000 * 20,
    max: 3,
    message:
    {
        error: "Você apagou muitos comentários rapidamente. Espere um pouco antes de deletar mais comentários."
    },
    keyGenerator: (req) => {
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
})

routes.post("/comments/:postSlug", limitComment, Middlewares.ValidarComentario, MiddlewareCaptcha.VerificarCaptcha, Comments.PostarComentario);

routes.get("/comments/:postSlug", limitGetComments, Comments.BuscarComentarios);

routes.get("/comments/replies/:commentId", limitGetComments, Comments.ObterRespostasDeUmComentario);

routes.delete("/comments/:commentId", limitDeleteComment, Comments.DeletarComentario);


module.exports = routes;
