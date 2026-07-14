
import { FiArrowLeft, FiEdit, FiDelete, FiEye } from "react-icons/fi";
import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import apiFetch from "../Services/api";
import Comments from "../Components/Comments/Comments";

import { AuthContext } from "../Contexts/AuthContext";
import { executeCaptcha } from "../Components/Captcha";

import "./../Css/Posts.css";

import ReactMarkdown from "react-markdown";

export default function Post()
{

    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);

    const [post, setPost] = useState(null); // Post único

    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    const [replies, setReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});


    const { postLoad } = useParams();
    const { user } = useContext(AuthContext);

    const navigate = useNavigate();

    const [acao, setAcao] = useState(false);

    async function carregarComentarios(postSlug)
    {
        try {
            setAcao(true);


            setCommentsLoading(true);

            const data = await apiFetch(`/comments/${postSlug}`, {
                method: "GET"
            });

            setComments(data.comments || []);

        } catch (err) {

            console.error("Erro ao buscar comentários:", err);

        } finally {

            setCommentsLoading(false);
            setAcao(false);

        }
    }

    const carregarReplies = async (commentId) =>
    {
        setAcao(true);

        if (replies[commentId]) return;

        // const limit = 10;
        // const skip = (repliesPage[commentId] || 0) * limit;

        setLoadingReplies(prev => ({
            ...prev,
            [commentId]: true
        }));

        try {

            // `/comments/replies/${commentId}?limit=${limit}&skip=${skip}`
            const data = await apiFetch(`/comments/replies/${commentId}`, {
                method: "GET"
            });

            if (data.replies)
            {
                setReplies(prev => ({
                    ...prev,
                    [commentId]: data.replies
                }));
            }

        } catch (err) {
            console.error("Erro ao carregar respostas:", err);
        }
        finally
        {

            setLoadingReplies(prev => ({
                ...prev,
                [commentId]: false
            }));

            setAcao(false);

        }
    };

    async function handleComment(e)
    {
        e.preventDefault();

        if (!commentText.trim()) return;

        setAcao(true);

        try {

            const captchaToken = await executeCaptcha("comment");

            const data = await apiFetch(`/comments/${post.slug}`, {
                method: "POST",
                body: JSON.stringify({
                    content: commentText,
                    captchaToken,
                    action: "comment"
                })
            });

            if (data.comment)
            {
                setCommentText("");

                // adiciona comentário sem recarregar página
                setComments(prev => [data.comment, ...prev]);
            }

        } catch (err) {

            console.log("Erro ao enviar comentário:", err);

        }
        finally {

            setAcao(false);

        }
    }

    const handleReply = async (commentId) => {

        if (!replyText.trim()) return;

        if (!user)
        {
            navigate("/login");
            return;
        }

        setAcao(true);

        try {

            const captchaToken = await executeCaptcha("replycomment");

            const data = await apiFetch(`/comments/${post.slug}`, {
                method: "POST",
                body: JSON.stringify({
                    content: replyText,
                    parent: commentId,
                    captchaToken,
                    action: "replycomment"
                })
            });

            if (data.comment)
            {
                // Mostra o comentário que acabou de enviar para uma resposta
                const newReply = data.comment;
                setReplies(prev => ({
                    ...prev,
                    [commentId]: [
                        ...(prev[commentId] || []),
                        newReply
                    ]
                }));

                setReplyText("");
                setReplyingTo(null);
            }

        } catch (err)
        {
            console.error("Erro ao responder:", err);
        }
        finally {
            setAcao(false);
        }
    };

    const toggleReplies = (commentId) => {

        if (replies[commentId])
        {
            // ocultar
            setReplies(prev => {
                const updated = { ...prev };
                delete updated[commentId];
                return updated;
            });
        }
        else
        {
            setAcao(true);

            carregarReplies(commentId);
            setAcao(false);
        }

    };

    async function handleDeleteComment(commentId)
    {
        try {


            const confirm = window.confirm("Você tem certeza que quer deletar esse comentário?");

            if (confirm)
            {
                setAcao(true);


                await apiFetch(`/comments/${commentId}`, {
                    method: "DELETE"
                });

                // atualiza comentários principais
                setComments(prev =>
                    prev.map(c =>
                        c._id === commentId
                            ? { ...c, status: "deleted", content: "Comentário Removido" }
                            : c
                    )
                );

                // atualiza replies
                setReplies(prev => {
                    const updated = { ...prev };

                    for (const parentId in updated)
                    {
                        updated[parentId] = updated[parentId].map(r =>
                            r._id === commentId
                                ? { ...r, status: "deleted", content: "Comentário Removido" }
                                : r
                        );
                    }

                    return updated;
                });
            }

        } catch (err)
        {
            console.error("Erro ao deletar comentário:", err);
        }
        finally {
            setAcao(false);

        }
    }

    const handleDelete = async function()
    {
        const confirm = window.confirm("Você tem certeza que quer deletar essa postagem?");

        if (confirm)
        {
            setAcao(true);

            const data = await apiFetch(`/deletepost/${post.slug}`, {
                method: "DELETE"
            });

            if (data.message)
            {
                alert(data.message);
                navigate("/posts");
            }
            else 
            {
                alert(data.error);
            }
            
            setAcao(false);

        }
    }

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        async function carregar()
        {
            if (loading) return;
    
            setLoading(true);
    
            try {

                // Carrega post único pelo slug
                const data = await apiFetch(`/getposts/${postLoad}`, {
                    method: "GET"
                });

                setPost(data.post); // espera { post: {...} }

                // Carregar comentários
                await carregarComentarios(data.post.slug);

            } catch (err) {
                console.error("Erro ao carregar post(s):", err);
            } finally {
                setLoading(false);
            }
        }

        carregar();

        // eslint-disable-next-line
    }, [postLoad]);

    if (post === null || loading === true)
    {
        return <div className="skeleton">
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                </div>
    }


    return (
        <div className="post-single">


            {/* Título */}
            <h1 className="post-title">{post.title}</h1>

            {/* Imagem de capa */}
            {post.coverImage && (
                <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="post-cover-single" 
                />
            )}

            {/* Meta info */}
            <div className="post-meta">
                <span>
                    Criado por: <Link to={`/perfil/${post.author?.profile?.nickname}`}>{post.author?.profile?.nickname}</Link> |
                </span>
                <span>
                    {new Date(post.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    }).replace(",", " •")}
                </span>
                {post?.status === "deleted" && <b className="deletado">Deletado</b>}

                <span className="post-views">
                    <FiEye />{post.views}
                </span>
            </div>

            {/* Conteúdo */}
            <div className="post-content-single">
                {/* {post.content.split("\n").map((line, idx) => (
                    <p key={idx}><ReactMarkdown>{line}</ReactMarkdown></p>
                ))} */}
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="post-tags">
                {post.tags.map((tag, index) =>
                {
                    return <span key={index}>{tag}</span>
                })}
            </div>

            <div className="footerPost">
                {/* Back link com ícone */}
                <Link to="/posts" className="back-link">
                    <FiArrowLeft style={{ verticalAlign: "middle" }} />
                    Voltar para posts
                </Link>

                {/* Botão de editar para admins */}
                {user?.role === "admin" && post?.status !== "deleted" && (
                    <>
                    <Link to={`/criar-post/${post.slug}?type=post`} className="back-link">
                        <FiEdit />
                        Editar Post
                    </Link>

                    <button className="back-link" onClick={handleDelete}>
                        <FiDelete />
                        Deletar Post
                    </button>
                    </>
                )}
            </div>


            <Comments
                post={post}
                user={user}
                comments={comments}
                commentsLoading={commentsLoading}
                handleComment={handleComment}
                commentText={commentText}
                setCommentText={setCommentText}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReply={handleReply}
                replies={replies}
                carregarReplies={carregarReplies}
                toggleReplies={toggleReplies}
                loadingReplies={loadingReplies}
                handleDeleteComment={handleDeleteComment}
                acao={acao}
            />

        </div>
    );

}
