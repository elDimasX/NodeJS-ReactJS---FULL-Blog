import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

import { Link } from "react-router-dom";

export default function Comments({
    post,
    user,
    comments,
    commentsLoading,
    handleComment,
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    handleReply,
    replies,
    carregarReplies,
    toggleReplies,
    loadingReplies,
    handleDeleteComment,
    acao
}) {

return (

<div className="comments">

    <h3 className="comments-title">Comentários</h3>

    {user ? (
        <CommentForm
            handleComment={handleComment}
            commentText={commentText}
            setCommentText={setCommentText}
            acao={acao}
        />
    ) :
        <div className="login-for-comment">
            Para comentar, faça o <Link to={"/login"}>login</Link>
        </div>
    }

    {commentsLoading && <p>Carregando comentários...</p>}

    {!commentsLoading && comments.length === 0 && (
        <p className="no-comments">Ainda não há comentários.</p>
    )}

    <div className="comments-list">

        {comments.map(comment => (
            <CommentItem
                key={comment._id}
                comment={comment}
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
                user={user}
                acao={acao}
            />
        ))}

    </div>

</div>

);
}