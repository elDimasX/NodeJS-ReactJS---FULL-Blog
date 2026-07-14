
const Comments = require("../models/comments");
const Posts = require("../models/posts");
const Polls = require("../models/polls");
const User = require("../models/user");

const notificationService = require("../services/notification");

const badges = require("../utils/bagdes");

exports.PostarComentario = async (req, res) => {
    try
    {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                error: "Você precisa estar logado para completar a operação."
            });
        }

        const user = await User.findById(req.session.user.id);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        if (user?.statusAccount.isActive === false) {
            return res.status(403).json({
                error: "Esta conta de usuário(a) foi desativada."
            });
        }

        if (
            user.lastActions.commentAt &&
            Date.now() - user.lastActions.commentAt.getTime() < 1000 * 10
        ) {
            return res.status(429).json({
                error: "Você precisa esperar um tempo antes de comentar novamente."
            });
        }

        const { postSlug } = req.params;
        const { content, parent } = req.body;

        let post = await Posts.findOne({ slug: postSlug });
        let postType = "Posts";

        if (!post) {
            post = await Polls.findOne({ slug: postSlug });
            postType = "Polls";
        }

        if (!post || post.status === "deleted") {
            return res.status(400).json({
                error: "Esse conteúdo não é válido."
            });
        }

        let parentComment = null;

        if (parent) {
            parentComment = await Comments.findById(parent);

            if (!parentComment || parentComment.status === "deleted") {
                return res.status(400).json({
                    error: "Não é possível responder esse comentário."
                });
            }

            if (
                parentComment.post.toString() !== post._id.toString() ||
                parentComment.postType !== postType
            ) {
                return res.status(400).json({
                    error: "Comentário pai inválido."
                });
            }
        }

        const result = await User.updateOne(
            {
                _id: user._id,
                $or: [
                    { "lastActions.commentAt": { $exists: false } },
                    { "lastActions.commentAt": { $lt: new Date(Date.now() - 10 * 1000) } }
                ]
            },
            {
                $set: { "lastActions.commentAt": new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(429).json({
                error: "Você precisa esperar um tempo antes de comentar novamente."
            });
        }

        const comment = new Comments({
            post: post._id,
            postType: postType,
            author: user._id,
            content,
            parent: parent || null
        });

        await comment.save();
        await comment.populate("author", "profile.nickname profile.avatar.url -_id");

        try {
            if (parentComment)
            {
                if (parentComment.author.toString() !== user._id.toString())
                {
                    await notificationService.createNotification({
                        recipient: parentComment.author,
                        sender: comment.author,
                        type: "reply",
                        target: comment.post,
                        postType: comment.postType,
                        comment: comment._id
                    });
                }
            }
            else
            {
                if (post.author.toString() !== user._id.toString())
                {
                    await notificationService.createNotification({
                        recipient: post.author,
                        sender: comment.author,
                        type: "comment",
                        target: post._id,
                        postType: comment.postType,
                        comment: comment._id
                    });
                }
            }
        } catch (err) {
            console.log("notification error:", err);
        }

        return res.status(201).json({
            message: "Comentário criado.",
            comment
        });

    } catch (err) {
        console.error("PostarComentario error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.BuscarComentarios = async (req, res) => {
    try
    {
        const { postSlug } = req.params;

        // Buscar em Post e Poll
        let post = await Posts.findOne({ slug: postSlug });
        let postType = "Posts";

        if (!post) {
            post = await Polls.findOne({ slug: postSlug });
            postType = "Polls";
        }

        if (!post /* || post.status === "deleted" */) {
            return res.status(400).json({
                error: "Esse conteúdo não é válido."
            });
        }

        const comments = await Comments.find({
            post: post._id,
            postType: postType,
            parent: null
        })
        .select("-post -postType")
        .populate("author", "profile.nickname profile.avatar.url statusAccount.isActive stats.amountDonation role -_id")

        .sort({ createdAt: -1 })
        .lean();

        // Badge
        comments.forEach(comment => {
            if (comment.author) {
                comment.author.badge = badges(comment.author.stats.amountDonation);
                delete comment.author.amountDonation;
            }
        });

        //  Mascarar comentários deletados
        for (const comment of comments) {
            let isActive = comment.author?.statusAccount?.isActive;

            if (comment.status === "deleted" || !isActive) {
                comment.content = "Comentário Removido";
            }

            if (!isActive && comment.author) {
                comment.author.avatar = "";
                comment.author.nickname = "contadesativada";
                comment.status = "deleted";
            }
        }

        // Contar respostas (agora filtrando corretamente também)
        for (let comment of comments) {
            const count = await Comments.countDocuments({
                parent: comment._id,
                postType: postType 
            });

            comment.repliesCount = count;
        }

        return res.json({ comments });

    } catch (err) {
        console.error("BuscarComentarios error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.ObterRespostasDeUmComentario = async (req, res) => {
    try
    {
        const { commentId } = req.params;

        if (!commentId) {
            return res.status(400).json({
                error: "Valores errados."
            });
        }

        // Buscar comentário pai primeiro
        const parentComment = await Comments.findById(commentId);

        if (!parentComment) {
            return res.status(404).json({
                error: "Comentário não encontrado."
            });
        }

        // Buscar replies com filtro correto
        const replies = await Comments.find({
            parent: commentId,
            postType: parentComment.postType
        })
        .select("-post -postType")
        .populate("author", "profile.nickname profile.avatar.url statusAccount.isActive stats.amountDonation role -_id")
        .sort({ createdAt: 1 })
        .lean();

        // Badge
        replies.forEach(comment => {
            if (comment.author) {
                comment.author.badge = badges(comment.author.stats.amountDonation);
                delete comment.author.amountDonation;
            }
        });

        // Tratamento de comentários deletados / usuários desativados
        for (const reply of replies) {
            let isActive = reply.author?.statusAccount.isActive;

            if (reply.status === "deleted" || !isActive) {
                reply.content = "Comentário Removido";
            }

            if (!isActive && reply.author) {
                reply.author.avatar = "";
                reply.author.nickname = "contadesativada";
                reply.status = "deleted";
            }
        }

        return res.json({
            replies
        });

    } catch (err) {
        console.error("ObterRespostasDeUmComentario error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.DeletarComentario = async (req, res) =>
{
    try {

        if (!req?.session?.user)
        {
            return res.status(401).json({
                error: "Você precisa estar logado para concluir essa operação."
            });
        }

        const { commentId } = req.params;

        const comment = await Comments.findById(commentId);

        if (!comment)
        {
            return res.status(404).json({
                error: "Comentário não encontrado."
            });
        }

        const isAuthor = comment.author.toString() === req.session.user.id;
        const isStaff = ["moderator", "admin"].includes(req.session.user.role);

        if (!isAuthor && !isStaff)
        {
            return res.status(403).json({
                error: "Você não tem permissão para deletar esse comentário."
            });
        }

        if (comment.status === "deleted")
        {
            return res.status(200).json({
                message: "Este comentário já está deletado."
            });
        }

        comment.status = "deleted";
        await comment.save();

        return res.status(200).json({
            message: "Comentário deletado com sucesso."
        });

    } catch (err)
    {
        console.error("/controllers/comment.js DeletarComentario:", err);

        return res.status(500).json({
            error: "Internal server error."
        });
    }
};


