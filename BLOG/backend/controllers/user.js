const slugify = require("slugify");
const crypto = require("crypto");

const User = require("../models/user");
const UserLike = require("../models/usersLikes");
const Notification = require("../models/notification");

const mongoose = require("mongoose");

const { cloudinary } = require("../services/cloudinaryService");

const { 
    enviarEmail, 
    mensagemAtivarConta, 
    mensagemContaAtivada,
    mensagemRecuperacaoSenha,
    mensagemSenhaAlterada
} = require("../services/sendgrid");


const notificationService = require("../services/notification");

const badges = require("../utils/bagdes");

exports.LogarUsuario = async (req, res) =>
{

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ "profile.email": email });

        if (!user)
        {
            return res.status(401).json({ error: "Usuário ou senha não são válidos" });
        }

        if (user.auth.provider === "google")
        {
            return res.status(403).json({ error: "Essa conta foi criada com Google. Use 'Entrar com Google'." });
        }

        const passwordValid = await user.comparePassword(password);

        if (!passwordValid)
        {
            return res.status(401).json({ error: "Usuário ou senha não são válidos" });
        }

        
        if (user.statusAccount.isActive === false)
        {
            return res.status(403).json({ error: "A conta deste usuário(a) foi desativada. Contate nosso email para suporte." });
        }

        // Se não verificou o token ainda
        if (user.emailVerified === false)
        {
            // verifica se expirou
            if (user.tokens.emailVerification.expires < Date.now())
            {
                const token = crypto.randomBytes(32).toString("hex"); // cria um novo token

                user.tokens.emailVerification.token = token;
                user.tokens.emailVerification.expires = Date.now() + 1000 * 60 * 60; // +1h

                const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

                await enviarEmail(
                    email,
                    `Ativação de conta - ${process.env.SITE_NAME}. Re-link.`,
                    mensagemAtivarConta(link)
                )
                .catch(err => 
                {
                    console.error("/controllers/user.js LogarUsuario erro ao enviarEmail", err);

                    return res.status(500).json({ error: "Erro ao enviar email de validação. Tente novamente mais tarde." })
                });

                await user.save();


                return res.status(403).json({
                    error: "Token de expirado. Enviamos um novo link no seu email para ativar sua conta. Verifique a caixa de spam."
                });
            }

            return res.status(403).json({
                error: "Conta não verificada. Verifique o link no seu email para ativar sua conta."
            });
        }

        req.session.user =
        {
            id: user._id,
            role: user.role
        };

        return req.session.save(erroSeExistir => {

            if (erroSeExistir) {
                console.log("/controllers/user.js Erro ao salvar sessão: ", erroSeExistir);
                return res.status(500).json({ error: "Session não salva." })
            }

            return res.status(200).json
            ({
                success: "Usuário logado com sucesso.",
                user: {
                    nickname: user.profile.nickname,
                    name: user.profile.name,
                    email: user.profile.email, // opcional
                    bio: user.profile.bio,
                    avatar: user.profile.avatar.url,
                    banner: user.profile.banner.url,
                    likes: user.stats.likes,
                    showEmail: user.profile.showEmail,
                    badge: badges(user.stats.amountDonation),
                    role: user.role
                }
            })

        });

    } catch (err) {

        console.error("/controllers/user.js LogarUsuario error:", err);

        return res.status(500).json({ error: "Internal server error." });
    }



};

exports.RegistrarUsuario = async (req, res) =>
{

    try {

        let { nickname, name, email, password, confirmPassword } = req.body;

        if (!nickname.trim() || !name.trim() || !email.trim() || !password || !confirmPassword)
        {
            return res.status(400).json({ error: "Campos inválidos" });
        }

        nickname = slugify(nickname, {
            lower: true,
            strict: true
        });

        if (password !== confirmPassword)
        {
            return res.status(400).json({
                error: "Confirmação de senha incorreta"
            });
        }

        const usuarioExistente = await User.findOne
        ({
            $or: [{ "profile.nickname": nickname }, { "profile.email": email }]
        });

        if (usuarioExistente?.profile.nickname === nickname)
        {
            return res.status(403).json({ error: "Esse nickname já está em uso." });
        }

        if (usuarioExistente?.profile.email === email)
        {
            return res.status(403).json({ error: "Esse email já está em uso." });
        }

        try {

            const token = crypto.randomBytes(32).toString("hex");

            const user = new User({

                profile:
                {
                    nickname,
                    name: name,
                    email
                },

                auth:
                {
                    password
                },

                tokens:
                {
                    emailVerification:
                    {
                        token,
                        expires: Date.now() + 1000 * 60 * 60 // 1h
                    }
                }

            });

            const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

            await enviarEmail(
                email,
                `Ativação de conta - ${process.env.SITE_NAME}`,
                mensagemAtivarConta(link)
            )
            .catch(err => 
            {
                console.error("/controllers/user.js RegistrarUsuario erro ao enviarEmail", err);

                return res.status(500).json({ error: "Erro ao enviar email de validação. Tente novamente mais tarde." })
            });

            await user.save();

            return res.status(201).json({
                success: "Enviamos um link de ativação para seu email, por favor, clique o link para ativar sua conta. Verifique sua caixa de spam."
            });

        } catch (err) {

            if (err.code === 11000) {
                return res.status(400).json({
                    error: "Email ou nickname já estão em uso."
                });
            }

            console.error("/controllers/user.js Erro ao criar usuário:", err);

            return res.status(500).json({
                error: "Erro interno ao criar usuário."
            });
        }

    } catch (err) {
        console.error("/controllers/user.js RegistrarUsuario error:", err)
        return res.status(500).json({ error: "Internal server error." })
    }

};

exports.ResetarTokenSenha = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email || email.trim().length < 2)
        {
            return res.status(400).json({ error: "Insira um email válido" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const user = await User.findOne({ "profile.email": email });

        if (!user)
        {
            return res.status(401).json({ error: "Email inválido" });
        }

        if (user.auth.provider === "google")
        {
            return res.status(403).json({ error: "Essa conta foi criada com Google. Use 'Entrar com Google' na tela de Login." });
        }

        if (user.statusAccount.isActive === false)
        {
            return res.status(403).json({ error: "A conta deste usuário(a) foi desativada. Contate nosso email para suporte." });
        }

        if (user.emailVerified === false)
        {
            // verifica se expirou
            if (user.tokens.emailVerification.expires < Date.now())
            {

                user.tokens.emailVerification.token = token;
                user.tokens.emailVerification.expires = Date.now() + 1000 * 60 * 60;

                const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

                await enviarEmail(
                    email,
                    `Ativação de conta - ${process.env.SITE_NAME}. Re-link.`,
                    mensagemAtivarConta(link)
                )
                .catch(err => 
                {
                    console.error("/controllers/user.js TokenSenha erro ao enviarEmail", err);

                    return res.status(500).json({ error: "Erro ao enviar email de validação. Tente novamente mais tarde." })
                });

                await user.save();


                return res.status(403).json({
                    error: "Token de expirado. Enviamos um novo link no seu email para ativar sua conta. Verifique a caixa de spam."
                });
            }

            return res.status(403).json({
                error: "Conta ainda não verificada. Verifique o link no seu email para ativar sua conta."
            });
        }

        if (
            user.tokens.passwordReset.token &&
            user.tokens.passwordReset.expires > Date.now()
        )
        {
            return res.status(429).json({
                error: "Um link de recuperação já foi enviado recentemente. Verifique seu email."
            });
        }

        user.tokens.passwordReset.token = token;
        user.tokens.passwordReset.expires = Date.now() + 1000 * 60 * 10; // 10 Minutos

        const link = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`;

        await enviarEmail(
            email,
            `Resetar de senha - ${process.env.SITE_NAME}.`,
            mensagemRecuperacaoSenha(user.profile.name, link)
        )
        .catch(err => 
        {
            console.error("/controllers/user.js ResetarTokenSenha erro ao enviarEmail", err);

            return res.status(500).json({ error: "Erro ao enviar email de validação. Tente novamente mais tarde." })
        });


        await user.save();
        return res.status(200).json({ success: "Um link com para resetar sua senha foi enviada ao seu email. Verifique a caixa de spam." })


    } catch (err)
    {
        console.error("/controllers/user.js ResetarTokenSenha error:", err)
        return res.status(500).json({ error: "Internal server error." })
    }

};

exports.MudarSenha = async (req, res) => {

    try {

        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token || token.length < 1 || token.length > 200)
        {
            return res.status(400).json({ error: "Token inválido." });
        }

        if (!newPassword || newPassword.length < 6 || newPassword.length > 60)
        {
            return res.status(400).json({ error: "A senha deve respeitar o limite e mínimo de caracteres." });
        }

        const user = await User.findOne({
            "tokens.passwordReset.token": token,
            "tokens.passwordReset.expires": { $gt: Date.now() }
        });

        if (!user)
        {
            return res.status(400).json({ error: "Token inválido ou expirado" });
        }

        if (!user.emailVerified) {
            return res.status(200).json({
                success: "Essa conta não foi verificada anteriormente. Ative-a primeiro."
            });
        }

        if (user.statusAccount?.isActive === false) {
            return res.status(200).json({
                success: "Essa conta foi desativada. Entre em contato conosco."
            });
        }

        // Primeiro, desconecte todos os usuários com esse ID
        await mongoose.connection.db.collection("sessions").deleteMany({
            session: {
                $regex: `"user":{"id":"${user._id.toString()}"`
            }
        });

        user.auth.password = newPassword;

        user.tokens.passwordReset.token = undefined;
        user.tokens.passwordReset.expires = undefined;

        await user.save();

        const link = `${process.env.FRONTEND_URL}/login`;

        await enviarEmail(
            user.profile.email,
            `Senha alterada com sucesso! - ${process.env.SITE_NAME}`,
            mensagemSenhaAlterada(user.profile.name, link)
        )
        .catch(err => 
        {
            console.error("/controllers/user.js MudarSenha erro ao enviarEmail", err);

            return res.status(500).json({ error: "Erro ao enviar email de validação. Tente novamente mais tarde." })
        });;

        
        return res.status(200).json
        ({
            success: "Senha alterada com sucesso! Todas as sessões da sua conta foram encerradas por segurança."
        });

    } catch (err)
    {
        console.error("/controllers/user.js MudarSenha error:", err)
        return res.status(500).json({ error: "Internal server error." })
    }

};

exports.ValidarEmail = async (req, res) =>
{
    try {

        const { token } = req.params;

        if (!token || token.length < 1 || token.length > 200)
        {
            return res.status(400).json({ error: "Token inválido." });
        }

        const user = await User.findOne({
            "tokens.emailVerification.token": token,
            "tokens.emailVerification.expires": { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                error: "Token inválido ou expirado."
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                success: "Email já verificado anteriormente."
            });
        }

         // valida email
        user.emailVerified = true;

        // limpa token
        user.tokens.emailVerification.token = undefined;
        user.tokens.emailVerification.expires = undefined;

        await user.save();

        const link = `${process.env.FRONTEND_URL}/login`;

        await enviarEmail(
            user.profile.email,
            `Conta ativada com sucesso! - ${process.env.SITE_NAME}`,
            mensagemContaAtivada(user.profile.name, link)
        );

        req.session.user =
        {
            id: user._id,
            role: user.role
        };

        return res.status(200).json
        ({
            success: "Usuário logado com sucesso.",
            // user: {
            //     nickname: user.profile.nickname,
            //     name: user.profile.name,
            //     email: user.profile.email, // opcional
            //     bio: user.profile.bio,
            //     avatar: user.profile.avatar.url,
            //     banner: user.profile.banner.url,
            //     likes: user.stats.likes,
            //     showEmail: user.profile.showEmail,
            //     badge: badges(user.stats.amountDonation),
            //     role: user.role
            // }
        })

        // return res.status(200).json({
        //     message: "Email verificado com sucesso!"
        // });

    } catch (err) {
        console.error("Erro ao verificar email:", err);
        return res.status(500).json({
            error: "Erro interno no servidor."
        });
    }


};

exports.SobreUsuario = async (req, res) =>
{

    try {

       const { nickname } = req.params;

        const user = await User.findOne({ "profile.nickname": nickname });

        if (!user)
        {
            return res.status(404).json({
                error: "Usuário não encontrado."
            });
        }

        if (user?.statusAccount.isActive === false)
        {
            return res.status(404).json( {error: "Esta conta de usuário(a) foi desativada."} );
        }

        let alreadyLiked = false;

        if (req.session && req.session.user && req.session.user.id)
        {
            const loggedUserId = req.session.user.id;

            const like = await UserLike.findOne({
                userId: loggedUserId,
                likedUserId: user._id
            });

            alreadyLiked = !!like;
        }

        const userData = {
            nickname: user.profile.nickname,
            name: user.profile.name,
            bio: user.profile.bio,
            avatar: user.profile.avatar.url,
            banner: user.profile.banner.url,
            likes: user.stats.likes,
            role: user.role,
            badge: badges(user.stats.amountDonation),
            alreadyLiked
        };

        userData.email = user.profile.showEmail ? user.profile.email : "Email Privado";

        return res.json({
            authenticated: !!(req.session && req.session.user),
            user: userData
        });

    } catch (err) {
        console.error("/controllers/user.js SobreMim error:", err);

        return res.status(500).json({ error: "Internal server error." });
    }

};

exports.CarregarUsuarioLogado = async (req, res) =>
{
    try {
        if (!req.session || !req.session.user)
        {
            return res.status(401).json({ authenticated: false });
        }

        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(401).json({ authenticated: false });
        }

        if (user?.statusAccount.isActive === false)
        {
            return res.status(404).json( {error: "Esta conta foi desativada do nosso sistema."} );
        }

        req.session.user =
        {
            id: user._id,
            role: user.role
        };

        return res.json({
            authenticated: true,
            user: {
                
                nickname: user.profile.nickname,
                name: user.profile.name,
                email: user.profile.email, // opcional
                bio: user.profile.bio,
                avatar: user.profile.avatar.url,
                banner: user.profile.banner.url,
                likes: user.stats.likes,
                showEmail: user.profile.showEmail,
                badge: badges(user.stats.amountDonation),
                role: user.role,
            }
        });

    } catch (err) {
        console.error("/controller/user.js CarregarUsuarioLogado:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.EditarPerfilLogado = async (req, res) =>
{

    try
    {
        if (!req.session || !req.session.user)
        {
            return res.status(401).json({ error: "Não autenticado" });
        }

        const user = await User.findById(req.session.user.id);
        if (!user)
        {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (user?.statusAccount.isActive === false)
        {
            return res.status(404).json( {error: "Este usuário foi banido do nosso sistema."} );
        }

        // Verificação na memória
        if (
            user.lastActions.profileUpdateAt &&
            Date.now() - user.lastActions.profileUpdateAt.getTime() < 60 * 1000
        )
        {
            return res.status(429).json({
                error: "Aguarde 1 minuto antes de fazer outra alteração."
            });
        }

        let { nickname, name, bio, showEmail } = req.body;
        
        // Converte showEmail de string para boolean
        showEmail = showEmail === "true";

        nickname = slugify(nickname, {
            lower: true,
            strict: true
        });

        if (nickname)
        {
            const usuarioExistente = await User.findOne
            ({
                $or: [{ "profile.nickname": nickname }]
            });

            if (usuarioExistente?.profile.nickname === nickname && !user._id.equals(usuarioExistente._id))
            {
                return res.status(403).json({ error: "Esse nickname já está em uso." });
            }
        }

        // O updateOne + matchedCount é mais seguro em casos concorrentes e é útil se você tiver várias requisições chegando quase ao mesmo tempo. Sem ele, duas requisições próximas poderiam passar pelo if e atualizar o banco quase simultaneamente.
        const result = await User.updateOne({
            _id: user._id,

            $or: [
                {
                    "lastActions.profileUpdateAt": {
                        $exists: false
                    }
                },

                {
                    "lastActions.profileUpdateAt": {
                        $lt: new Date(Date.now() - 60 * 1000)
                    }
                }
            ]
        },

        {
            $set:
            {
                "profile.nickname":
                    nickname ?? user.profile.nickname,

                "profile.name":
                    name ?? user.profile.name,

                "profile.bio":
                    bio ?? user.profile.bio,

                "profile.showEmail":
                    showEmail ?? user.profile.showEmail,

                "lastActions.profileUpdateAt":
                    new Date()
            }
            
        });

        // Verificação NO BANCO
        if (result.matchedCount === 0) {
            return res.status(429).json({
                error: "Aguarde 1 minuto antes de fazer outra alteração."
            });
        }

        if (req.files?.avatar) {
            const result = await cloudinary.uploader.upload(req.files.avatar[0].path, {
                folder: "avatars"
            });

            user.profile.avatar.url = result.secure_url;

            if (user.profile.avatar.publicId) {
                await cloudinary.uploader.destroy(user.profile.avatar.publicId);
            }
            
            user.profile.avatar.publicId = result.public_id;
        }

        if (req.files?.banner) {
            const result = await cloudinary.uploader.upload(req.files.banner[0].path, {
                folder: "banners"
            });

             user.profile.banner.url = result.secure_url;

            if (user.profile.banner.publicId) {
                await cloudinary.uploader.destroy(user.profile.banner.publicId);
            }

            user.profile.banner.publicId = result.public_id;
        }

        // Agora salve as fotos e banners
        await user.save();

        return res.json({
            message: "Perfil atualizado com sucesso",
            user: {
                nickname: nickname,
                name: name,
                email: user.profile.email,
                bio: bio,
                avatar: user.profile.avatar.url,
                banner: user.profile.banner.url,
                likes: user.stats.likes,
                showEmail: showEmail,
                badge: badges(user.stats.amountDonation),
                role: user.role
            }
        });


    } catch (err) {
        console.error("/controllers/user.js EditarPerfilLogado:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.Logout = async (req, res) =>
{

    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Não autenticado" });
    }

    try {
        await new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err) return reject(err);
                resolve();
            });
        });

        res.clearCookie('connect.sid');
        return res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (err) {
        console.error("/controllers/user.js Logout:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
}

exports.CurtirUsuario = async (req, res) =>
{
    try {

        if (!req.session || !req.session.user)
        {
            return res.status(401).json({ error: "Não autenticado." });
        }

        const userId = req.session.user.id; // Quem está curtindo
        const { targetNickname } = req.body; // Nickname do usuário que será curtido

        if (!targetNickname)
        {
            return res.status(400).json({ error: "Nickname do usuário para curtir é obrigatório." });
        }

        const target = await User.findOne({ "profile.nickname": targetNickname });

        if (!target)
        {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        if (target?.statusAccount.isActive === false)
        {
            return res.status(404).json( {error: "Esta conta de usuário(a) foi desativada."} );
        }

        if (target._id.equals(userId))
        {
            return res.status(400).json({ error: "Você não pode curtir a si mesmo." });
        }

        try {
            // Tenta criar um like no banco
            // Se NÃO existir ainda → sucesso
            await UserLike.create({ userId, likedUserId: target._id });

            // Incrementa +1 no contador de likes do usuário alvo
            await User.updateOne(
                { _id: target._id },
                { $inc: { "stats.likes": 1 } } // $inc soma automaticamente
            );

            // const existing = await Notification.findOne({
            //     recipient: target._id,
            //     sender: userId,
            //     type: "likeProfile"
            // });

            try {
                await notificationService.createNotification({
                    recipient: target._id,
                    sender: userId,
                    type: "likeProfile"
                });
            } catch (err)
            {
                if (err.code === 11000) {
                    // duplicado → ignora; porque estamos usando (unique) aqui
                } else
                {
                    
                    //console.error("/controllers/user.js CurtirUsuario:", err);
                    return res.status(500).json({ error: "Internal server error." });
                }
            }

            // Retorna que agora está "curtido"
            return res.json({ liked: true });

        } catch (err) {

            // Se caiu aqui, pode ser erro de duplicidade
            // (ou seja, o like já existia)
            if (err.code === 11000) {

                // Remove o like existente (toggle)
                await UserLike.deleteOne({ userId, likedUserId: target._id });

                // Decrementa -1 no contador de likes
                await User.updateOne(
                    { _id: target._id },
                    { $inc: { "stats.likes": -1 } }
                );

                // Retorna que agora está "descurtido"
                return res.json({ liked: false });
            }

            // Se for outro erro qualquer
            return res.status(500).json({ error: "Internal server error." });
        }

    } catch (err)
    {
        console.error("/controllers/user.js CurtirUsuario:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
}

exports.BanirUsuario = async (req, res) =>
{

    try {

    
        const { targetNickname } = req.body;

        if (!targetNickname)
        {
            return res.status(400).json({ error: "Nickname do usuário para curtir é obrigatório." });
        }

        const user = await User.findOne({ "profile.nickname": targetNickname });

        if (!user)
        {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        user.statusAccount.isActive = false;
        await user.save();

        return res.status(200).json({ message: "Conta do usuário desativada." });

    } catch (err)
    {
        console.error("/controllers/user.js BanirUsuario:", err);
        return res.status(500).json({ error: "Internal server error." });
    }

}

exports.ObterNotificacoes = async (req, res) => {

    try {

        if (!req.session || !req.session.user)
        {
            return res.status(401).json({ error: "Não autenticado" });
        }

        const { lastDate } = req.query;

        const query = {
            recipient: req.session.user.id
        };

        if (lastDate) {
            query.createdAt = { $lt: new Date(lastDate) };
        }

        const notifications = await Notification.find({
            recipient: req.session.user.id
        })
        .sort({ createdAt: -1 })
        .limit(21)
        .populate("sender", "profile.nickname profile.avatar.url")
        .populate("target", "slug")
        .select("-_id")
        .lean();

        const hasMore = notifications.length > 20;

        if (hasMore) {
            notifications.pop(); // Remove o extra
        }

        const formatted = notifications.map(n => ({
            id: n._id,

            type: n.type,

            read: n.read,

            sender:
            {
                nickname: n.sender?.profile?.nickname || null,

                avatar:
                    n.sender?.profile?.avatar?.url || null
            },

            time: n.createdAt,

            slug: n.target?.slug || null,

            postType: n.postType || null
        }));

        return res.status(200).json
        ({
            notifications: formatted,
            hasMore
        });

    } catch (err){

        console.error("/controllers/user.js ObterNotificacoes:", err);

        return res.status(500).json({
            error: "Internal server error."
        });

    }

}

exports.MarcarNotificacoesComoLidas = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: "Não autenticado" });
        }

        await Notification.updateMany(
            {
                recipient: req.session.user.id,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        return res.sendStatus(204);

    } catch (err) {

        console.error("/controllers/user.js MarcarNotificacoesComoLidas:", err);
        return res.status(500).json({
            error: "Internal server error."
        });
    }
};

