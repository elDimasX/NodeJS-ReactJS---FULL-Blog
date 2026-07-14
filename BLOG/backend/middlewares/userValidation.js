
const escapeHtml = require("../utils/escapeHtml");

// Mais organizado (Objeto), mas estou com preguiça de adaptar tudo para o frontend, já que estamos acostuamos com o "error"
// exports.ValidarPerfil = (req, res, next) =>
// {
//     const { nickname, nome, email, bio, avatar, banner } = req.body;
//     const errors = {};

//     // ===== NICKNAME =====
//     if (!nickname || nickname.trim().length < 3)
//     {
//         errors.nickname = "Nickname deve ter no mínimo 3 caracteres";
//     } else if (nickname.trim().length > 22)
//     {
//         errors.nickname = "Nickname deve ter no máximo 22 caracteres";
//     }
//     else if (nickname.trim().toLowerCase() === "contadesativada")
//     {
//         errors.nickname = "Nickname inválido";
//     }


//     // ===== NOME =====
//     if (!nome || nome.trim().length < 3)
//     {
//         errors.nome = "Nome deve ter no mínimo 3 caracteres";
//     } else if (nome.trim().length > 60)
//     {
//         errors.nome = "Nome deve ter no máximo 60 caracteres";
//     }

//     // ===== EMAIL =====
//     // if (email)
//     // {
//     const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i;
//     if (!emailRegex.test(email))
//     {
//         errors.email = "Email inválido";
//     }
//     else if (email.length < 5)
//     {
//         errors.email = "Email deve ter no mínimo 5 caracteres";
//     } else if (email.length > 50)
//     {
//         errors.email = "Email deve ter no máximo 50 caracteres";
//     }
//     // }

//     // ===== BIO =====
//     if (bio && (bio.length < 1 || bio.length > 200))
//     {
//         errors.bio = "Bio deve ter entre 1 e 200 caracteres";
//     }

//     // ===== AVATAR =====
//     if (avatar && avatar.length > 300)
//     {
//         errors.avatar = "Avatar URL deve ter no máximo 300 caracteres";
//     }

//     // ===== BANNER =====
//     if (banner && banner.length > 300)
//     {
//         errors.banner = "Banner URL deve ter no máximo 300 caracteres";
//     }

//     // ===== SE TIVER ERROS, BLOQUEIA =====
//     if (Object.keys(errors).length > 0)
//     {
//         return res.status(400).json({ valid: false, errors });
//     }

//     // Tudo certo, continua pra próxima função da rota
//     next();
// };
exports.ValidarPerfil = (req, res, next) =>
{
    let { nickname, name, email, bio, avatar, banner } = req.body;
    let error = "";


    // Proteção XSS, não precisamos pro nickname ou email porque já tem regex
    bio = escapeHtml(bio);
    name = escapeHtml(name);

    // ===== NICKNAME =====
    if (!nickname || nickname.trim().length < 3)
    {
        error += "Nickname deve ter no mínimo 3 caracteres. ";
    } 
    else if (nickname.trim().length > 22)
    {
        error += "Nickname deve ter no máximo 22 caracteres. ";
    }
    else if (nickname.trim().toLowerCase() === "contadesativada")
    {
        error += "Nickname inválido. ";
    }

    // ===== NOME =====
    if (!name || name.trim().length < 3)
    {
        error += "Nome deve ter no mínimo 3 caracteres. ";
    } 
    else if (name.trim().length > 60)
    {
        error += "Nome deve ter no máximo 60 caracteres. ";
    }

    // ===== EMAIL =====
    const emailRegex = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i;

    if (!emailRegex.test(email))
    {
        error += "Email inválido. ";
    }
    else if (email.length < 5)
    {
        error += "Email deve ter no mínimo 5 caracteres. ";
    } 
    else if (email.length > 50)
    {
        error += "Email deve ter no máximo 50 caracteres. ";
    }

    // ===== BIO =====
    if (bio && (bio.length < 1 || bio.length > 200))
    {
        error += "Bio deve ter entre 1 e 200 caracteres. ";
    }

    // ===== AVATAR =====
    if (avatar && avatar.length > 300)
    {
        error += "Avatar URL deve ter no máximo 300 caracteres. ";
    }

    // ===== BANNER =====
    if (banner && banner.length > 300)
    {
        error += "Banner URL deve ter no máximo 300 caracteres. ";
    }

    // ===== SE TIVER ERROS =====
    if (error.length > 0)
    {
        return res.status(400).json({ valid: false, error });
    }

    next();
};

exports.IsAdmin = (req, res, next) =>
{

    try {

    
        if (!req.session || !req?.session.user)
        {
            return res.status(400).json({ error: "Você precisa estar logado para continuar a operação. "});
        }

        if (req.session.user.role !== "admin")
        {
            return res.status(403).json({ error: "Você não possui direitos para concluir esta operação. "});
        }

        next();

    } catch (err)
    {
        console.log(`/middlewares/userValidation.js IsAdmin error: ${err}`);
        return res.status(500).json({ error: "Internal server error." });
    }

}
