import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { Badge } from "../Badge";

import relativeTime from "dayjs/plugin/relativeTime";

import dayjs from "dayjs";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");


export default function ReplyItem({ reply, comment, handleDeleteComment, user }){

    return(

        <div className="comment reply">

        

        <div className="comment-content-area">

        <div className="comment-header">

            <div className="comment-left">

                <img
                    src={reply.author?.profile?.avatar.url}
                    alt={reply.author?.profile?.nickname}
                    className="comment-avatar"
                />

                <Badge badge={reply.author?.badge} role={reply.author?.role} size="mini"/>

                <Link to={`/perfil/${reply.author?.profile?.nickname}`}>
                    {reply.author?.profile?.nickname}
                </Link>
            </div>

            <span className="comment-date">
                {dayjs(reply.createdAt).fromNow()}
                {/* {new Date(reply.createdAt).toLocaleString("pt-BR",{
                day:"2-digit",
                month:"short",
                hour:"2-digit",
                minute:"2-digit"
                }).replace(",", " •")} */}
            </span>

        </div>

        <p className={`comment-content ${reply.status === "deleted" ? "deleted-comment" : ""}`}>
            {reply.content}
        </p>

        {
            user && reply.status === "visible" && (user.role === "admin" ||
            user.role === "moderator" ||
            user.nickname === reply.author?.profile?.nickname) &&
        (

            <button
                className="comment-delete-btn"
                onClick={() => handleDeleteComment(reply._id)}
            >
                <FiTrash2/>
                Deletar
            </button>

        )
        }

        
        </div>

        </div>

    );
}