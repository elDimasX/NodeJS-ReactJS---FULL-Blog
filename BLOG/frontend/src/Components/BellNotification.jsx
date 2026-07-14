import { useContext, useState, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import { AuthContext } from "../Contexts/AuthContext";
import { Link } from "react-router-dom";

import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

import apiFetch from "../Services/api";

import dayjs from "dayjs";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");


export default function BellNotification()
{
    const [open, setOpen] = useState(false);
    const [marking, setMarking] = useState(false);

    const { notifications, setNotifications, hasMoreNotification, loadMoreNotifications, loadingMoreNotification } = useContext(AuthContext);


    const unreadCount = notifications.notifications?.filter(n => !n.read)?.length || 0;

    const renderText = function(type) {
        switch (type) {
            case "comment":
                return "Comentou no seu post";
            case "reply":
                return "Respondeu seu comentário";
            case "follow":
                return "Começou a te seguir";
            case "likeProfile":
                return "Adorou o seu perfil";
            case "likePost":
                return "Curtiu sua postagem";
            case "dislikePost":
                return "Não curtiu sua postagem";
            default:
                return "Fez algo";
        }
    }

    const handleToggle = async () =>
    {
        setOpen(prev => !prev);

        if (!open && unreadCount > 0 && !marking)
        {
            setMarking(true);

            try {
                await apiFetch(`/notificacoes-de-usuario/lidas`, {
                    method: "POST"
                });

                setNotifications(prev => ({
                    ...prev,
                    notifications: prev.notifications.map(n => ({
                        ...n,
                        read: true
                    }))
                }));

            } catch (err)
            {
                console.error("Erro ao marcar como lido", err);

            } finally
            {
                setMarking(false);
            }
        }
    };

    useEffect(() => {

        const originalTitle = document.title;

        if (unreadCount > 0) {
            document.title = `(${unreadCount}) ${originalTitle}`;
        } else {
            document.title = originalTitle;
        }

        return () => {
            document.title = originalTitle; // limpa quando desmontar
        };

    }, [unreadCount]);

    return (
        <div className="bellDiv">

            <div style={{ position: "relative" }}>
                
                <FiBell
                    size={22}
                    onClick={() =>
                    {
                        handleToggle();
                    }}
                />

                {unreadCount > 0 && (
                    <span className="number">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}

                {open && (
                    <div className="notifications" style={{
                        
                    }}>

                        <strong>Notificações</strong>



                        <div style={{ marginTop: "10px" }}>
                            {!notifications.notifications || notifications.notifications?.length === 0 ? (
                                <p>
                                    Nada por aqui 👀
                                </p>
                            ) : (

                            notifications.notifications && notifications.notifications.map(n =>
                            (
                                <div key={n._id}>
                                    <Link

                                        to={
                                            n.slug ?
                                           
                                            `/${n.postType === "Polls" ? "polls" : "posts"}/${n.slug}`
                                            :
                                           `/perfil/${n.sender?.nickname}`
                                        }
                                       
                                        key={n._id}
                                        style={{
                                            color: n.read ? "#A5ADBA" : "#fff"
                                        }}
                                        className="notification"
                                    >
                                        <img src={n.sender?.avatar} alt={n.sender?.nickname}/>
                                        <div>
                                            <strong>{n.sender?.nickname}</strong>{" "}
                                            {renderText(n.type)}
                                        </div>
                                    </Link>
                                    <p>{dayjs(n.time).fromNow()}</p>

                                    
                                </div>
                            )

                            
                            ))}

                            {
                            hasMoreNotification && 
                                (
                                    <button className="button-primary" onClick={loadMoreNotifications} disabled={loadingMoreNotification}>
                                        {loadingMoreNotification ? "Carregando..." : "Carregar Mais"}
                                    </button>
                                )
                            }
                        </div>

                    </div>
                )}
            </div>

        </div>
    )
}
