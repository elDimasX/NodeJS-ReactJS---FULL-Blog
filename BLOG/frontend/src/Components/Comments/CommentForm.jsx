

export default function CommentForm({ handleComment, commentText, setCommentText, acao }) {

    return (

        <form className="comment-form" onSubmit={handleComment}>

            <textarea
            placeholder="Escreva um comentário..."
            value={commentText}
            onChange={(e)=>setCommentText(e.target.value)}
            className="styled"
            required
            />

            <button type="submit" disabled={acao}>
                Comentar
            </button>

        </form>

    );
}