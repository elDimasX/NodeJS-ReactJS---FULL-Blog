
const express = require("express");
const routes = express();

const User = require("../controllers/user");
const Apoiadores = require("../controllers/apoiadores");

const Middlewares = require("../middlewares/userValidation");
const MiddlewareCaptcha = require("../middlewares/captchaValidation");
const MiddlewareCloudinary = require("../services/cloudinaryService");

const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Limite
const likeLimiter = rateLimit
({
    windowMs: 1000 * 60, // 1 Minuto
    max: 10,
    message:
    {
        error: "Muitas curtidas em pouco tempo. Tente novamente em instantes."
    },
    // Como somentes logados podem acessar, bloquearemos várias tentativas por sessão
    keyGenerator: (req) => req.session.user.id
});

const activeEmailAttemps = rateLimit({
    windowMs: 1000 * 15,
    max: 2,
    message:
    {
        error: "Muitas tentativas. Tente novamente em instantes."
    },
   keyGenerator: (req) => {
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
});

const loginAttemps = rateLimit
({
    windowMs: 1000 * 60,
    max: 5,
    message:
    {
        error: "Muita tentativas de login em pouco tempo. Tente novamente em instante."
    },
    keyGenerator: (req) => {
        // Vamos bloquear se o usuário estiver logado. Se não, vamos bloquear por IP
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
});

const registerAttemps = rateLimit
({
    windowMs: 1000 * 60 * 5,
    max: 2,
    message:
    {
        error: "Você tentou criar 2 contas em um periodo muito curto de tempo. Espere alguns minuto e tente novamente."
    },
    keyGenerator: (req) => {
        return req.session?.user?.id || ipKeyGenerator(req.ip);
    }
});

const notificationsAttemps = rateLimit
({
    windowMs: 1000 * 50,
    max: 2,
    message:
    {
        error: "Requisições de notificações muito rápidas. Aguarde um momento."
    },
    keyGenerator: (req) => req.session.user.id
    // keyGenerator: (req) => {
    //     return req.session?.user?.id || ipKeyGenerator(req.ip);
    // }
});

// Login e Registro
routes.post("/login", loginAttemps, MiddlewareCaptcha.VerificarCaptcha, User.LogarUsuario);
routes.post("/registrar", registerAttemps, MiddlewareCaptcha.VerificarCaptcha, Middlewares.ValidarPerfil, User.RegistrarUsuario);

routes.post("/resetar-senha", MiddlewareCaptcha.VerificarCaptcha, User.ResetarTokenSenha);
routes.put("/resetar-senha/:token", MiddlewareCaptcha.VerificarCaptcha, User.MudarSenha);

routes.get("/validar-email/:token", activeEmailAttemps, User.ValidarEmail);

// Obter informações de um PERFIL
routes.get("/perfil/:nickname", User.SobreUsuario);

// Carregar o perfil do usuário, caso ele dê F5. Já que está salvo em req.session, não precisamos de nada do frontend
routes.post("/meuperfil", User.CarregarUsuarioLogado);

// Editar o perfil
routes.put("/meuperfil/editar",
    
MiddlewareCloudinary.upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
])

, Middlewares.ValidarPerfil, MiddlewareCaptcha.VerificarCaptcha, User.EditarPerfilLogado);

// Curtir uma conta de usuário
routes.post("/curtirusuario", likeLimiter, User.CurtirUsuario);

// Logout
routes.post("/logout", User.Logout);

// Banir usuário
routes.delete("/deletar-usuario", Middlewares.IsAdmin, User.BanirUsuario);

// Obter notificações do usuário
routes.get("/notificacoes-de-usuario/buscar", /*notificationsAttemps,*/ User.ObterNotificacoes);

// Marcar notificações como lidas
routes.post("/notificacoes-de-usuario/lidas", notificationsAttemps, User.MarcarNotificacoesComoLidas);

// Carrega os melhores apoiadores do site
routes.get("/apoiadores", Apoiadores.ObterTopApoiadores);


module.exports.routes = routes;

