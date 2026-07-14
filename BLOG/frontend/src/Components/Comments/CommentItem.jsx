import { Link } from "react-router-dom";
import ReplyItem from "./ReplyItem";
import { FiTrash2 } from "react-icons/fi";
import { Badge } from "../Badge";

import relativeTime from "dayjs/plugin/relativeTime";

import dayjs from "dayjs";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

export default function CommentItem({
    comment,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleReply,
    replies,
    toggleReplies,
    loadingReplies,
    handleDeleteComment,
    user,
    acao
})
{

    return(

        <div className="comment">

            <div className="comment-body">

                <img
                src={comment.author?.profile?.avatar.url || "/default-avatar.png"}
                alt={comment.author?.profile?.nickname}
                className="comment-avatar"
                />

                <div className="comment-content-area">

                <div className="comment-header">

                    <div className="comment-left">
                        <Badge badge={comment.author?.badge} role={comment.author?.role} size="mini"/>

                        <Link to={`/perfil/${comment.author?.profile?.nickname}`}>
                            {comment.author?.profile?.nickname}
                        </Link>
                    </div>

                    <span className="comment-date">
                        {dayjs(comment.createdAt).fromNow()}
                        {/* {new Date(comment.createdAt).toLocaleString("pt-BR",{
                        day:"2-digit",
                        month:"short",
                        hour:"2-digit",
                        minute:"2-digit"
                        }).replace(",", " •")} */}
                    </span>

                </div>

            
            <p className={`comment-content ${comment.status === "deleted" ? "deleted-comment" : ""}`}>
                {comment.content}
            </p>
            

            <div className="alignOptions">


                {
                    comment.status === "visible" &&
                    (
                        <button
                            className="comment-reply-btn"
                            disabled={acao}
                            onClick={()=>setReplyingTo(
                            replyingTo === comment._id ? null : comment._id
                        )}
                        >
                            Responder
                        </button>
                    )
                }

                {
                    user && comment.status === "visible" && 
                    (
                    user.role === "admin" ||
                    user.role === "moderator" ||
                    user.nickname === comment.author?.profile?.nickname
                    ) && 
                (

                    <button
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(comment._id)}
                    >
                        <FiTrash2/>
                        Deletar
                    </button>

                )}

                {comment.repliesCount > 0 && (

                    <button
                    className="comment-show-replies"
                    disabled={acao}
                    onClick={() => toggleReplies(comment._id)}
                    >
                    {replies[comment._id]
                        ? "Ocultar respostas"
                        : `Ver respostas (${comment.repliesCount})`
                    }
                    </button>

                )}

            </div>

            {replyingTo === comment._id && (

            <div className="reply-box">

                <textarea
                    placeholder="Escreva sua resposta..."
                    value={replyText}
                    onChange={(e)=>setReplyText(e.target.value)}
                    className="styled"
                />

                <button
                    onClick={()=>handleReply(comment._id)}
                    className="btn-reply"
                    disabled={acao}
                >
                    Enviar resposta
                </button>

            </div>

            )}

            </div>

            </div>

            {loadingReplies[comment._id] && (
            <p className="loading-replies">Carregando respostas...</p>
            )}

            {replies[comment._id]?.map(reply => (
            <ReplyItem key={reply._id} reply={reply} user={user} handleDeleteComment={handleDeleteComment}/>
            ))}

        </div>

    );
}