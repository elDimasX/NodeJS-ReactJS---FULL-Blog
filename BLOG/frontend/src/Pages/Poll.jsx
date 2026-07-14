import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiFetch from "../Services/api";
import { AuthContext } from "../Contexts/AuthContext";
import { executeCaptcha } from "../Components/Captcha";
import Comments from "../Components/Comments/Comments";
import { FiEye, FiArrowLeft, FiEdit, FiCheckCircle, FiDelete,  } from "react-icons/fi";
import { FaVoteYea } from "react-icons/fa";
import { toast } from "react-toastify";

import "../Css/Posts.css";
import "../Css/Poll.css";

export default function Poll() {
    const { postLoad } = useParams(); // Slug da enquete
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);

    const [hasVoted, setHasVoted] = useState(false);
    const [userChoiceId, setUserChoiceId] = useState(null);

    useEffect(() => {

        async function carregarPoll()
        {
            setLoading(true);

            try 
            {

                const data = await apiFetch(`/getpolls/${postLoad}`, { method: "GET" });
                setPoll(data.poll);

                setHasVoted(data.hasVoted); // Backend deve retornar se o user já votou
                setUserChoiceId(data.userChoiceId);
                
                // Carregar comentários da enquete
                await carregarComentarios(data.poll.slug);

            } catch (err) 
            {
                console.log(err)
                toast.error("Enquete não encontrada.");
            } finally 
            {
                setLoading(false);
            }
        }

        carregarPoll();
    }, [postLoad]);

    

    const handleVote = async (optionId) => 
    {
        if (!user) return navigate("/login");
        if (voting) return;

        setVoting(true);

        try {
            const prevChoice = userChoiceId;

            const captchaToken = await executeCaptcha("vote");

            const data = await apiFetch(`/poll/vote/${poll.slug}`, {
                method: "POST",
                body: JSON.stringify({ optionId, captchaToken, action: "vote" })
            });

            if (data.success) {

                setPoll(prev => {
                    const updated = prev.options.map(opt => {
                        let votes = opt.votes;

                        // ❌ REMOVE VOTO (clicou no mesmo)
                        if (prevChoice === optionId && opt._id === optionId) {
                            votes -= 1;
                        }

                        // ❌ REMOVE VOTO ANTIGO (troca de opção)
                        if (prevChoice && opt._id === prevChoice && prevChoice !== optionId) {
                            votes -= 1;
                        }

                        // ✅ ADICIONA VOTO NOVO
                        if (opt._id === optionId && prevChoice !== optionId) {
                            votes += 1;
                        }

                        return {
                            ...opt,
                            votes: Math.max(votes, 0)
                        };
                    });

                    return { ...prev, options: updated };
                });

                // 🧠 estado correto do toggle
                if (prevChoice === optionId) {
                    setHasVoted(false);
                    setUserChoiceId(null);
                } else {
                    setHasVoted(true);
                    setUserChoiceId(optionId);
                }
            }

        } catch (err) {
            toast.error("Erro ao votar.");
        } finally {
            setVoting(false);
        }
    };




    /* FUNÇÃO DE COMENTÁRIOS */

    // Estados para comentários 
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [replies, setReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [acao, setAcao] = useState(false);

    async function carregarComentarios(slug)
    {
        setCommentsLoading(true);
        try {
            const data = await apiFetch(`/comments/${slug}`, { method: "GET" });
            setComments(data.comments || []);
        } finally { setCommentsLoading(false); }
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

            const data = await apiFetch(`/comments/${poll.slug}`, {
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

            const data = await apiFetch(`/comments/${poll.slug}`, {
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
        const confirm = window.confirm("Você tem certeza que quer deletar essa enquete?");

        if (confirm)
        {
            setAcao(true);

            const data = await apiFetch(`/deletepoll/${poll.slug}`, {
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

    if (loading || !poll)
    {
        return <div className="skeleton">
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                </div>
    }

    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

    return (
        <div className="post-single poll-single">

            <h1 className="post-title">{poll.title}</h1>

            <div className="post-meta">

                <span>Criado por: <Link to={`/perfil/${poll.author?.profile?.nickname}`}>{poll.author?.profile?.nickname}</Link> |</span>

                <span>
                {new Date(poll.createdAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }).replace(",", " •")}
                </span>

                <span className="post-views"><FiEye /> {poll.views || 0}</span>

                <span className="post-views"><FaVoteYea /> {totalVotes} votos</span>

            </div>


            {/* ÁREA DE VOTAÇÃO */}
            <div className="poll-container">

                <div className="poll-options-list">

                    {poll.options.map((opt, index) => 
                    {
                        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        

                        const isSelected = userChoiceId === opt._id;
                        
                        return (
                            <div 
                                key={opt._id} 

                                className={`poll-vote-card 
                                    
                                    ${isSelected && hasVoted ? "selected" : ""}
                                `}

                                onClick={() => handleVote(opt._id)}
                            >
                                {opt.image && <img src={opt.image} alt="" className="poll-opt-img" />}
                                
                                <div className="poll-opt-info">
                                    <div className="poll-opt-header">
                                        <span>{opt.text}</span>
                                        {hasVoted && <span className="poll-percent">{percent}%</span>}
                                    </div>

                                    {hasVoted && (
                                        <div className="poll-progress-bar">
                                            <div className="poll-progress-fill" style={{ width: `${percent}%` }}></div>
                                        </div>
                                    )}
                                </div>

                                {!hasVoted && <div className="poll-radio-circle"></div>}
                                {hasVoted && isSelected && <FiCheckCircle className="voted-icon" />}
                            </div>
                        );
                    })}

                    
                </div>

                {/* {hasVoted && <p className="voted-msg">Obrigado por votar!</p>} */}

            </div>

            <div className="footerPost">

                <Link to="/posts" className="back-link"><FiArrowLeft /> Voltar para posts</Link>
                {user?.role === "admin" && 
                (
                    <>
                    <Link to={`/criar-post/${poll.slug}?type=poll`} className="back-link"><FiEdit /> Editar poll</Link>
                    <button className="back-link" onClick={handleDelete}>
                        <FiDelete />
                        Deletar Enquete
                    </button>
                    </>
                )}

            </div>

            <Comments 
                post={poll}
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