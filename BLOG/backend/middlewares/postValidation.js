
const escapeHtml = require("../utils/escapeHtml");

exports.ValidarCriarEditarPost = async (req, res, next) =>
{

    try {
 
        let { title, content, excerpt, coverImage, tags } = req.body;

        title = escapeHtml(title);
        content = escapeHtml(content);
        excerpt = escapeHtml(excerpt);

        if (!title.trim() || !content.trim())
        {
            return res.status(400).json({
                error: "Título, Excerpt e Conteúdo necessários."
            });

        }

        // Siga adiante
        next();
    }  catch (err)
    {
        console.log(`/middlewares/postValidation.js ValidarPost error: ${err}`)
        return res.status(500).json({ error: "Internal server error." })
    }

}
