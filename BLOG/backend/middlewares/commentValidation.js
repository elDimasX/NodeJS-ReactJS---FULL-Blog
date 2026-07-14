
const escapeHtml = require("../utils/escapeHtml");

exports.ValidarComentario = async (req, res, next) =>
{
    
    try {

        let { postSlug, content, parent } = req.body;

        // Como já usaremos o he aqui, não precisaremos usar no controller.js
        content = escapeHtml(content);

        if (!content || !content.trim())
        {
            return res.status(400).json({
                error: "Comentário vazio."
            });
        }

        if (content.length > 400)
        {
            return res.status(400).json({
                error: "Comentário muito grande. Máximo de 400 caracteres."
            });
        }

        next();

    }  catch (err)
    {
        console.log(`/middlewares/commentValidation.js ValidarComentario error: ${err}`)
        return res.status(500).json({ error: "Internal server error." })
    }

}
