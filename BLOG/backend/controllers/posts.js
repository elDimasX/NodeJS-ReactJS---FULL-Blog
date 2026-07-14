
const Posts = require("../models/posts");
const Polls = require("../models/polls");
const slugify = require("slugify");

const { cloudinary } = require("../services/cloudinaryService");


exports.CriarPost = async (req, res, next) =>
{

    try {

        let coverImage = null;

        if (req.files?.coverImage)
        {

            const result = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
                folder: "bannersPosts"
            });

            coverImage = result.secure_url;
        }

        const { title, excerpt, content, tags } = req.body;

        // Pega o título, e converte.
        // Por exemplo: Como criar um aplicativo node
        // E fica: como-criar-um-aplicativo-node
        let baseSlug = slugify(title, {
            lower: true,
            strict: true
        });

        let slug = baseSlug;
        let counter = 1;

        // Impede duplicadas
        // aprendendo-node
        // aprendendo-node-2
        // aprendendo-node-3
        while (await Posts.findOne({slug}))
        {
            slug = `${baseSlug}-${counter}`
            counter++;
        }

        const excerptFixed = excerpt.length > 98
        ? excerpt.substring(0, 96) + "..."
        : excerpt;

        // Ensures that the tags are valid.
        const formattedTags = Array.isArray(tags) ? tags : [];

        const newPost = new Posts
        ({
            title: title,
            slug: slug,
            content: content,
            excerpt: excerptFixed,
            author: req.session.user.id,
            coverImage: coverImage,
            coverImagePublicId: coverImage,
            tags: formattedTags
        });

        let parsedTags = tags;

        if (typeof tags === "string") {
            parsedTags = tags.split(",");
        }

        if (Array.isArray(parsedTags)) {
            newPost.tags = parsedTags;
        }

        const savedPost = await newPost.save();

        return res.status(201).json({
            message: "Post criado com sucesso",
            post: {
                id: savedPost._id,
                title: savedPost.title,
                slug: savedPost.slug,
                excerpt: savedPost.excerpt,
                status: savedPost.status,
                createdAt: savedPost.createdAt
            }
        });

    } catch (err)
    {
        console.log(`/controllers/posts.js CriarPost Error CreatePost: ${err}`)
        return res.status(500).json({ error: "Internal server error." })
    }

}

exports.CriarPoll = async (req, res, next) => {
    try
    {
        const { title, options } = req.body;
        const authorId = req.session?.user?.id;

        if (!title || title.trim() === "") {
            return res.status(400).json({ error: "O título da enquete não pode estar vazio." });
        }

        // Gerar slug único
        let baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;

        while (await Polls.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Arquivos enviados
        const files = req.files || [];

        // garantir array
        const rawOptions = Array.isArray(options) ? options : [];

        // Processar opções
        const processedOptions = await Promise.all(
            rawOptions.map(async (opt, index) => {

                let imageUrl = null;

                // Acha o arquivo certo baseado no nome
                const file = files.find(
                    f => f.fieldname === `options[${index}][image]`
                );

                if (file) {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "pollsOptions"
                    });
                    imageUrl = result.secure_url;
                }

                return {
                    text: opt.text,
                    image: imageUrl,
                    votes: 0
                };
            })
        );

        const newPoll = new Polls({
            title: title.trim(),
            slug: slug,
            author: authorId,
            options: processedOptions,
            status: "published",
            type: "poll"
        });

        const savedPoll = await newPoll.save();

        return res.status(201).json({
            message: "Enquete criada com sucesso!",
            poll: {
                title: savedPoll.title,
                slug: savedPoll.slug
            }
        });

    } catch (err) {
        console.error("CriarPoll Error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};



exports.DeletarPost = async (req, res, next) =>
{

    try {

        const { slug } = req.params;

        const post = await Posts.findOne({slug: slug});

        if (!post || post.status === "deleted")
        {
            return res.statu(404).json({ error: "Postagem não encontrada." });
        }

        post.status = "deleted";
        await post.save();

        return res.json
        ({
            message: "Postagem deletada com sucesso."
        })

    } catch (err)
    {
        console.log(`/controllers/posts.js DeletarPost error: ${err}`);
        return res.status(500).json({ error: "Internal server error." });
    }

};

exports.DeletarPoll = async (req, res, next) =>
{

    try {

        const { slug } = req.params;

        const poll = await Polls.findOne({ slug });

        if (!poll || poll.status === "deleted")
        {
            return res.statu(404).json({ error: "Enquete não encontrada." });
        }

        poll.status = "deleted";
        await poll.save();

        return res.json
        ({
            message: "Enquete deletada com sucesso."
        })

    } catch (err)
    {
        console.log(`/controllers/posts.js DeletarPoll error: ${err}`);
        return res.status(500).json({ error: "Internal server error." });
    }

}



exports.ObterPostagens = async (req, res) => 
{

    try {

        const home = req.query.home === "true";

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        if (page <= 0 || limit <= 0 || limit >= 50) 
        {
            return res.status(400).json({ error: "Valores inválidos." });
        }

        let buscarConfig = { status: "published" };
        const isAdmin = req.session?.user?.role === "admin";

        if (isAdmin)
        {
            buscarConfig.status = { $in: ["published", "deleted"] };
        }

        const postSelect = "title slug excerpt coverImage author createdAt views";
        const pollSelect = "title slug options author createdAt views";

        if (home)
        {
            const now = new Date();

            // Semana de calendário (segunda 00:00 até próxima segunda 00:00)
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay(); // 0 = domingo, 1 = segunda...
            const diffToMonday = day === 0 ? -6 : 1 - day;
            startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 7);

            const usedPostIds = new Set();
            const usedPollIds = new Set();

            // ===============================
            // 🏆 FEATURED: SEMPRE POST
            // primeiro tenta posts da semana
            // ===============================
            let weekPosts = await Posts.find({
                ...buscarConfig,
                createdAt: { $gte: startOfWeek, $lt: endOfWeek }
            })
                .sort({ views: -1, createdAt: -1 })
                .select(postSelect)
                .populate("author", "profile.nickname -_id ")
                .lean();

            let featured = weekPosts[0] || null;

            // fallback só se não existir NENHUM post na semana
           if (!featured) {
                featured = await Posts.findOne(buscarConfig)
                    .sort({ createdAt: -1 }) 
                    .select(postSelect)
                    .populate("author", "profile.nickname -_id")
                    .lean();
            }

            if (featured) {
                featured.contentType = "post";
                usedPostIds.add(featured._id.toString());
            }

            // remove o featured da lista da semana pra não repetir nos destaques
            if (weekPosts.length > 0 && featured) {
                weekPosts = weekPosts.filter(p => p._id.toString() !== featured._id.toString());
            }

            // ===============================
            // 📊 2 POLLS PRINCIPAIS
            // tenta polls da semana primeiro
            // ===============================
            let weekPolls = await Polls.find({
                ...buscarConfig,
                createdAt: { $gte: startOfWeek, $lt: endOfWeek }
            })
                .sort({ views: -1, createdAt: -1 })
                .select(pollSelect)
                .populate("author", "profile.nickname -_id")
                .lean();

            let mainPolls = weekPolls.slice(0, 2);

            if (mainPolls.length < 2) {
                const fallback = await Polls.find({
                    ...buscarConfig,
                    _id: { $nin: mainPolls.map(p => p._id) }
                })
                    .sort({ views: -1, createdAt: -1 })
                    .limit(2 - mainPolls.length)
                    .select(pollSelect)
                    .populate("author", "profile.nickname -_id")
                    .lean();

                mainPolls = [...mainPolls, ...fallback];
            }

            mainPolls.forEach(p => usedPollIds.add(p._id.toString()));

            mainPolls = mainPolls.map(p => ({
                ...p,
                contentType: "poll"
            }));

            // ===============================
            // 🔥 4 DESTAQUES DA SEMANA
            // pega os posts restantes da semana
            // ===============================
            let highlights = weekPosts.slice(0, 4);

            if (highlights.length < 4) {
                const fallback = await Posts.find({
                    ...buscarConfig,
                    _id: {
                        $nin: [
                            ...Array.from(usedPostIds),
                            ...highlights.map(p => p._id.toString())
                        ]
                    }
                })
                    .sort({ createdAt: -1 }) // fallback por recência, não por views
                    .limit(4 - highlights.length)
                    .select(postSelect)
                    .populate("author", "profile.nickname -_id")
                    .lean();

                highlights = [...highlights, ...fallback];
            }

            highlights.forEach(p => usedPostIds.add(p._id.toString()));

            highlights = highlights.map(p => ({
                ...p,
                contentType: "post"
            }));

            // ===============================
            // 🆕 LISTAGEM NORMAL (SEM REPETIÇÃO)
            // ===============================
            const [posts, polls] = await Promise.all([
                Posts.find({
                    ...buscarConfig,
                    _id: { $nin: Array.from(usedPostIds) }
                })
                    .sort({ createdAt: -1 })
                    .select(postSelect)
                    .populate("author", "profile.nickname -_id")
                    .lean(),

                Polls.find({
                    ...buscarConfig,
                    _id: { $nin: Array.from(usedPollIds) }
                })
                    .sort({ createdAt: -1 })
                    .select(pollSelect)
                    .populate("author", "profile.nickname -_id")
                    .lean()
            ]);

            const mixed = [
                ...posts.map(p => ({ ...p, contentType: "post" })),
                ...polls.map(p => ({ ...p, contentType: "poll" }))
            ]
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(skip, skip + limit);

            const total =
                (await Posts.countDocuments(buscarConfig)) +
                (await Polls.countDocuments(buscarConfig));

            return res.json({
                featured,
                mainPolls,
                highlights,
                latestPosts: mixed,
                page,
                hasMore: page * limit < total
            });
        }

        // ===============================
        // 🔎 BUSCA NORMAL
        // ===============================
        const q = req.query.q;
        let searchFilter = { ...buscarConfig };

        if (q) {
            searchFilter.$or = [
                { title: { $regex: q, $options: "i" } },
                { tags: { $regex: q, $options: "i" } }
            ];
        }

        const [posts, polls] = await Promise.all([
            Posts.find(searchFilter)
                .select(postSelect)
                .populate("author", "profile.nickname -_id")
                .lean(),

            Polls.find(searchFilter)
                .select(pollSelect)
                .populate("author", "profile.nickname -_id")
                .lean()
        ]);

        const all = [
            ...posts.map(p => ({ ...p, contentType: "post" })),
            ...polls.map(p => ({ ...p, contentType: "poll" }))
        ]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(skip, skip + limit);

        return res.json({
            posts: all,
            total: all.length,
            page
        });
    } catch (err) {
        console.error("/controllers/posts.js ObterPostagens:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};




exports.ObterPostPeloSlug = async (req, res, next) =>
{

    try {

        const { slug } = req.params;
        const isAdmin = req.session?.user?.role === "admin";

        // Filtro condicional
        const filter = isAdmin
            ? { slug } // admin vê qualquer post
            : { slug, status: "published" }; // usuários normais só published

        // Busca no banco
        const post = await Posts.findOne(filter).populate("author", "profile.nickname -_id").select("-lastViewUpdateAt");

        if (!post)
        {
            return res.status(404).json({ error: "Postagem não encontrada." });
        }

        await Posts.updateOne
        ({
                _id: post._id,

                // Melhor usar Redis, mas como queremos uma simples proteção de spam, isso deve funcionar bem
                $or: [
                    { lastViewUpdateAt: { $exists: false } },
                    { lastViewUpdateAt: { $lt: new Date(Date.now() - 1000 * 8) } }
                ]
            },
            {
                $inc: { views: 1 },
                $set: { lastViewUpdateAt: new Date() }
            }
        );

        return res.json({ post });


    } catch (err)
    {
        console.error("/controllers/posts.js ObterPostPeloSlug error:", err);
        return res.status(500).json({
            error: "Internal server error."
        });
    }

};

exports.ObterPollPeloSlug = async (req, res) => {
    try
    {
        const { slug } = req.params;

        const isAdmin = req.session?.user?.role === "admin";
        const filter = isAdmin ? { slug } : { slug, status: "published" };

        const poll = await Polls.findOne(filter).populate("author", "profile.nickname -_id").select("-lastViewUpdateAt -id").lean();

        if (!poll)
        {
            return res.status(404).json({ error: "Enquete não encontrada." });
        }

        // Verifica se o usuário logado já votou
        const hasVoted = poll.voters?.some(v => v.user.toString() === req.session?.user?.id);

        const vote = poll.voters?.find(v =>v.user.toString() === req.session?.user?.id);
        const userChoiceId = vote?.optionId ?? null;

        await Polls.updateOne
        ({
                _id: poll._id,

                $or: [
                    { lastViewUpdateAt: { $exists: false } },
                    { lastViewUpdateAt: { $lt: new Date(Date.now() - 1000 * 8) } }
                ]
            },
            {
                $inc: { views: 1 },
                $set: { lastViewUpdateAt: new Date() }
            }
        );

        return res.json({ poll, hasVoted, userChoiceId });

    } catch (err)
    {
        console.error("/controllers/posts.js ObterPollPeloSlug error:", err);
        return res.status(500).json({ error: "Internal server error." });

    }
};



exports.AtualizarPostagem = async (req, res, next) =>
{

    try {


        const { slug } = req.params;
        const { title, excerpt, content, tags, status } = req.body

        const post = await Posts.findOne({slug: slug});

        if (!post || post.status === "deleted")
        {
            return res.status(404).json({ error: "Postagem não encontrada" });
        }

        const excerptFixed = excerpt.length > 98
        ? excerpt.substring(0, 96) + "..."
        : excerpt;

        post.excerpt = excerptFixed;

        // Atualize somente os campos permitido
        if (title) post.title = title;
        if (content) post.content = content;

        let parsedTags = tags;

        if (typeof tags === "string") {
            parsedTags = tags.split(",");
        }

        if (Array.isArray(parsedTags)) {
            post.tags = parsedTags;
        }

        if (status && ["published", "deleted"].includes(status))
        {
            post.status = status;
        };


        if (req.files?.coverImage)
        {
            const result = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
                folder: "bannersPosts"
            });

            post.coverImage = result.secure_url;

            if (post.coverImagePublicId) {
                await cloudinary.uploader.destroy(post.coverImagePublicId);
            }

            post.coverImagePublicId = result.public_id;
        }



        //  Não precisamos atualizar o excerpt porque ele sempre é salvo quando o "save()" é chamado 
        const updatedPost = await post.save();

        return res.json
        ({
            message: "Postagem atualizada com sucesso.",
            // post: {
            //     id: updatedPost._id,
            //     title: updatedPost.title,
            //     slug: updatedPost.slug,
            //     excerpt: updatedPost.excerpt,
            //     status: updatedPost.status,
            //     updatedAt: updatedPost.updatedAt
            // }
        });

    } catch (err) {
        console.error("/controllers/posts.js AtualizarPostagem error:", err);
        return res.status(500).json({
            error: "Internal server error."
        })
    }

};

exports.AtualizarPoll = async (req, res, next) => {
    try {
        
        const { slug } = req.params;
        const { title, options } = req.body;

        const poll = await Polls.findOne({ slug });

        if (!poll)
        {
            return res.status(404).json({ error: "Enquete não encontrada." });
        }

        if (title && title.trim() !== "")
        {
            poll.title = title.trim();
        }

        const files = req.files || [];
        const incomingOptions = Array.isArray(options) ? options : [];
        const updatedOptions = [];

        for (let index = 0; index < incomingOptions.length; index++) {
            const opt = incomingOptions[index];

            // tenta achar pelo id primeiro
            let existing = null;
            if (opt.id) {
                existing = poll.options.find(
                    o => String(o._id) === String(opt.id)
                );
            }

            // se não achou pelo id, tenta pelo índice
            if (!existing && poll.options[index]) {
                existing = poll.options[index];
            }

            const file = files.find(
                f => f.fieldname === `options[${index}][image]`
            );

            let imageUrl = existing?.image || null;

            if (file) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "pollsOptions"
                });
                imageUrl = result.secure_url;
            }

            updatedOptions.push({
                _id: existing?._id,
                text: opt.text,
                image: imageUrl,
                votes: existing?.votes ?? 0
            });
        }

        poll.options = updatedOptions;
        await poll.save();

        return res.status(200).json({
            message: "Enquete atualizada com sucesso!"
        });

    } catch (err) {
        console.error("/controllers/posts.js AtualizarPoll Error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};




exports.VotarPoll = async (req, res) => {
    try 
    {
        const { slug } = req.params;
        const { optionId } = req.body;

        const userId = req.session?.user?.id;

        if (!userId) 
        {
            return res.status(401).json({ error: "Não autenticado." });
        }

        if (!optionId) 
        {
            return res.status(400).json({ error: "Opção inválida." });
        }

        const poll = await Polls.findOne({ slug })
        .populate("author", "-_id profile.nickname")
        .select("-lastViewUpdateAt");

        if (!poll || poll.status === "deleted")     
        {
            return res.status(404).json({ error: "Enquete não encontrada." });
        }

        const option = poll.options.id(optionId);

        if (!option) 
        {
            return res.status(400).json({ error: "Opção não existe." });
        }

        const existingVote = poll.voters.find(
            v => v.user.toString() === userId.toString()
        );

        if (!existingVote?.optionId) 
        {
            // Fallback: remove voto inválido
            poll.voters = poll.voters.filter(
                v => v.user.toString() !== userId.toString()
            );
        }


        // CASO 1: nunca votou
        if (!existingVote)
        {
            poll.voters.push({ user: userId, optionId });
            option.votes += 1;

            await poll.save();

            return res.json({
                success: true,
                message: "Voto computado!",
            });
        }

        // CASO 2: clicou na mesma opção → REMOVE (toggle)
        if (existingVote.optionId.toString() === optionId) {

            const oldOption = poll.options.id(existingVote.optionId);

            if (oldOption && oldOption.votes > 0) {
                oldOption.votes -= 1;
            }

            poll.voters = poll.voters.filter(
                v => v.user.toString() !== userId.toString()
            );

            await poll.save();

            return res.json({
                success: true,
                message: "Voto removido.",
            });
        }

        // CASO 3: trocou de opção → MOVE VOTO
        const oldOption = poll.options.id(existingVote.optionId);

        if (oldOption && oldOption.votes > 0) {
            oldOption.votes -= 1;
        }

        option.votes += 1;

        existingVote.optionId = optionId;

        await poll.save();

        return res.json({
            success: true,
            message: "Voto atualizado!",
        });

    } catch (err) {
        console.error("/controllers/posts.js VotarPoll Error:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};
