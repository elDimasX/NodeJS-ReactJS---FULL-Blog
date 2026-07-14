
import { useState, useEffect, useContext } from "react";
import { useParams, useSearchParams  } from "react-router-dom"
import { toast } from "react-toastify";

import apiFetch from "./../../Services/api";

import { AuthContext } from "../../Contexts/AuthContext"

import "./../../Css/CriarPost.css"

export default function CriarPost() {

    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState("");
    const [pollTitle, setPollTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [tags, setTags] = useState("");
    const [loading, setLoading] = useState(false);

    const { post } = useParams();
    const [searchParams] = useSearchParams();

    const [pollOptions, setPollOptions] = useState([
        { text: "", image: null, preview: null },
        { text: "", image: null, preview: null }
    ]);

    const handleOptionChange = (index, field, value) => {

        const newOptions = [...pollOptions];
        
        if (field === "image") 
        {
            // Se já existia um preview, limpa ele da memória do navegador
            if (newOptions[index].preview) {
                URL.revokeObjectURL(newOptions[index].preview);
            }

            const file = value;
            
            if (file) {
                newOptions[index].image = file;
                newOptions[index].preview = URL.createObjectURL(file);
            } else {
                // Se for remover (clique no X), volta ao estado inicial
                newOptions[index].image = null;
                newOptions[index].preview = null;
            }
        } else {
            newOptions[index].text = value;
        }
        
        setPollOptions(newOptions);
    };

    const addOption = () => {
        if (pollOptions.length < 5) {
            setPollOptions([...pollOptions, { text: "", image: null, preview: null }]);
        }
    };


    async function handlePostSubmit(e)
    {
        e.preventDefault();

        if (!title || title.trim() === "") {
            return toast.error("Por favor, digite o título da postagem.");
        }

        setLoading(true);

        try {

            const formattedTags = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

            let url = "/createpost";
            let method = "POST";
            if (post)
            {
                url = `/editpost/${post}`;
                method = "PUT";
            }

            const formData = new FormData();

            formData.append("title", title);
            formData.append("excerpt", excerpt);
            formData.append("content", content);
            formData.append("coverImage", coverImage);
            formData.append("tags", formattedTags);

            const data = await apiFetch(url, {
                method: method,
                body: formData
            });

            if (data.message)
            {
                if (!post)
                {
                    toast.success("Post criado com sucesso!");

                    setTitle("");
                    setExcerpt("");
                    setContent("");
                    setCoverImage(null);
                    setTags("");
                } else
                {
                    toast.success("Post editado com sucesso!");
                }
            }

        } catch (err)
        {
            console.error(err);
            toast.error(err);

        } finally {
            setLoading(false);
        }
    }

    async function handlePollSubmit(e)
    {
        e.preventDefault();
        setLoading(true);

        try
        {
            if (!pollTitle || pollTitle.trim() === "") {
                return toast.error("Por favor, digite o título da enquete.");
            }

            const formData = new FormData();
            formData.append("title", pollTitle); 
            formData.append("type", "poll");

            pollOptions.forEach((option, index) => {
                formData.append(`options[${index}][text]`, option.text);
                formData.append(`options[${index}][id]`, option._id || "");

                // Só envia se for arquivo real
                if (option.image instanceof File) {
                    formData.append(`options[${index}][image]`, option.image);
                }
            });

            let url = "/createpoll";
            let method = "POST";
            
            if (post) {
                url = `/editpoll/${post}`;
                method = "PUT";
            }

            const data = await apiFetch(url, {
                method: method,
                body: formData
            });

            if (data.message) {
                toast.success(post ? "Enquete editada!" : "Enquete lançada!");
                if (!post) {
                    setTitle("");
                    setPollOptions([
                        { text: "", image: null, preview: null },
                        { text: "", image: null, preview: null }
                    ]);
                }
            }
        } catch (err) {
            toast.error("Erro ao processar enquete");
        } finally {
            setLoading(false);
        }
    }

    const [type, setType] = useState("");
    const [aba, setAba] = useState("");

    useEffect(() => {

        const abaParaEditar = searchParams.get("type")?.toLowerCase() || "";

        if (!abaParaEditar || abaParaEditar === "")
        {
            setType("");
            setAba("");
        } 

        const carregar = async function() 
        {
            try 
            {
                const endpoint = abaParaEditar === "poll"
                    ? `/getpolls/${post}`
                    : `/getposts/${post}`;

                const data = await apiFetch(`${endpoint}`, { 
                    method: "GET"
                });

                setType(abaParaEditar);
                setAba(abaParaEditar);

                if (abaParaEditar === "post")
                {
                    setTitle(data.post.title);
                    setExcerpt(data.post.excerpt);
                    setContent(data.post.content);
                    setCoverImage(data.post.coverImage);
                    setTags(data.post.tags.join(","));
                } 
                else if (abaParaEditar === "poll")
                {
                    setPollTitle(data.poll.title);
                    
                    // Mapeia as opções vindas do banco para o formato do nosso estado
                    const optionsDoBanco = data.poll.options.map(opt => ({
                        text: opt.text,
                        image: null, // O arquivo File a gente não tem, só a URL
                        preview: opt.image // URL que vem do seu S3/Cloudinary/Uploads
                    }));
                    
                    setPollOptions(optionsDoBanco);
                }
            } catch (err) 
            {
                console.error("Erro ao carregar conteúdo", err);
            }
        };

        if (post) 
        {
            carregar();
        }

    }, [post, searchParams]);

    if (!user || user.role !== "admin")
    {
        return (
            <div className="create-post" style={{textAlign: "center"}}>
                <h2>Página não encontrada.</h2>
            </div>
        )
    }


    return (

        <div className="createSomething">

            <div className="tab-selector">
                <button 
                    className={!aba || aba === "post" ? "active" : ""} 
                    onClick={() => setAba("post")}
                >
                    📝 Post
                </button>
                <button 
                    className={aba === "poll" ? "active" : ""} 
                    onClick={() => setAba("poll")}
                >
                    📊 Votação
                </button>
            </div>

            {


            !aba || aba === "post" ?

                <div className="create-post">

                    <h1 className="create-title">
                        {type === "post" ? "Editar Postagem" : "Criar Postagem"}
                    </h1>
                    
                    <form onSubmit={handlePostSubmit} className="create-form">

                        <input
                            type="text"
                            placeholder="Título do post"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Excerpt (Mini-Resumo do post)"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            required
                        />

                        <input
                            type="file"
                            placeholder="Imagem de capa"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                        />

                        <input
                            type="text"
                            placeholder="Tags (ex: node, react, javascript)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />

                        <textarea
                            placeholder="Conteúdo do post... (.md)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="10"
                            required
                        />

                    <button type="submit" disabled={loading} className="button-primary">
                        
                        {
                        type === "post"
                            ?
                            (
                                loading ?
                                "Atualizando postagem..."
                                :
                                "Atualizar postagem"
                            )
                            :
                            "Criar postagem"
                        }
                    </button>

                    </form>

                </div>

                :


                <div className="create-vote create-post">

                    <h1 className="create-title">
                        {type === "poll" ? "Editar Votação" : "Criar Votação"}
                    </h1>

                    <form onSubmit={handlePollSubmit} className="create-form">
                        <input 
                            type="text" 
                            placeholder="Pergunta da enquete..." 
                            onChange={(e) => setPollTitle(e.target.value)}
                            value={pollTitle}
                            required 
                        />
                        
                        <div className="poll-options-grid">
                            {pollOptions.map((opt, index) => (

                                <div key={index} className="poll-option-card">

                                    {/* Preview da Imagem */}
                                    <div className="option-image-wrapper">
                                        {opt.preview ? (
                                            <img src={opt.preview} alt="Preview" className="preview-img" />
                                        ) : (
                                            <label className="upload-label">
                                                <span>+ Foto</span>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    hidden 
                                                    onChange={(e) => handleOptionChange(index, "image", e.target.files[0])} 
                                                />
                                            </label>
                                        )}
                                        {opt.preview && (
                                            <button type="button" className="remove-img" onClick={() => handleOptionChange(index, "image", null)}>×</button>
                                        )}
                                    </div>

                                    <input 
                                        type="text" 
                                        placeholder={`Opção ${index + 1}`}
                                        value={opt.text}
                                        onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                                        required
                                    />

                                </div>
                            ))}
                        </div>

                        {pollOptions.length < 5 && (
                            <button type="button" className="button-primary" onClick={addOption} >
                                + Adicionar Opção
                            </button>
                        )}

                        <button type="submit" disabled={loading} className="button-primary">
                            {
                                type === "poll"
                                ?
                                (
                                    loading ?
                                    "Atualizando votação..."
                                    :
                                    "Atualizar votação"
                                )
                                :
                                "Criar votação"
                            }
                        </button>

                    </form>
                </div>

            }


        </div>

    );
}