

import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext"
import { toast } from "react-toastify";


import { FaEdit, FaEnvelope, FaHeart, FaSignOutAlt, FaShareAlt, FaUserSlash  } from "react-icons/fa"

import "../Css/Perfil.css"
import apiFetch from "../Services/api";
import { Badge, getTier } from "../Components/Badge";
 
export default function Perfil()
{
    const navigate = useNavigate();
    const { nickname } = useParams();

    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);

    const isOwner = user && nickname === user.nickname;

    function handleLogout() {
        logout(); // função do AuthContext que limpa sessão/token
        navigate("/login");
    }

    const handleShare = async () => {
        if (!profile || !profile.nickname) return;

        const shareUrl = `${window.location.origin}/perfil/${profile.nickname}`;

        try {
            // Copia para a área de transferência
            await navigator.clipboard.writeText(shareUrl);

            // Opcional: feedback pro usuário
            toast.success("Link copiado para a área de transferência!");
        } catch (err) {
            console.error("Erro ao copiar o link:", err);
            toast.error("Não foi possível copiar o link. Tente novamente.");
        }
    };

    const [liking, setLiking] = useState(false);

    const handleLike = async () => {

        if (!profile || !profile.nickname) return;

        if (!user)
        {
            navigate("/login");
            return;
        }

        if (user.nickname === profile.nickname)
        {
            navigate("/meuperfil");
            return;
        }

        setLiking(true);

        try {

            const response = await apiFetch("/curtirusuario", {
                method: "POST",
                body: JSON.stringify({ targetNickname: profile.nickname })
            });

            if (response)
            {
                setProfile(prev => ({
                    ...prev,
                    likes: prev.likes + (response.liked ? 1 : -1),
                    alreadyLiked: response.liked
                }));
            }

        } catch (err)
        {
            console.log("Error ao curtir: " + err);
            toast.error(err.message || "Não foi possível curtir o usuário.");
        }

        setLiking(false);
    }

    const handleDisableAccount = async () =>
    {
        if (!profile || !profile.nickname) return;

        const confirm = window.confirm("Você quer mesmo desabilitar esta conta?")

        if (confirm)
        {
            const response = await apiFetch("/deletar-usuario", {
                method: "DELETE",
                body: JSON.stringify({ targetNickname: profile.nickname })
            });

            if (response)
            {
                toast.success("Conta desabilita com sucesso.");
            }


        }

    }

    useEffect(() => {

        const CarregarPerfil = async () =>
        {

            if (isOwner && user)
            {
                setProfile(user);
            } else if (nickname)
            {

                const response =  await apiFetch(`/perfil/${nickname}`, {
                    method: "GET"
                });

                if (!response) return;

                setProfile(response.user);

            } else {

                navigate("/login");
            }

        }

        CarregarPerfil();

    }, [user, navigate, isOwner, nickname])


    return (


        <div className="perfil-card" data-tier={getTier(profile?.badge?.min)}>

            {
                !profile ?
                (
                    <div style={{textAlign: "center"}}>
                    <h3>Carregando Perfil...</h3>
                    </div>
                ) : (

                    <>
                        <div
                            className="perfil-banner"
                            style={{
                                backgroundImage: `url(${profile.banner || "/default-banner.jpg"})`
                            }}
                        ></div>


                        <div className="perfil-body">

                            <img
                                src={profile.avatar || "/default-avatar.png"}
                                alt="Avatar"
                                className="perfil-avatar"
                            />

                            <h2>{profile.nickname}
                            </h2>
                            <span className="perfil-nome-real">{profile.name}</span>

                            <p className="perfil-bio">
                                {profile.bio || "Esse usuário ainda não escreveu uma descrição."}
                            </p>

                            <Badge badge={profile.badge} role={profile.role} />

                            <div className="perfil-info">

                                <div className="perfil-item">
                                    <FaEnvelope />
                                    <span>{profile.email}
                                    {
                                        profile.nickname === user?.nickname && !user?.showEmail ? (<b><br/>Somente para você</b>) : ""
                                    }
                                    </span>
                                </div>

                                <div className="perfil-item">
                                    <FaHeart />
                                    <span>{profile.likes} likes</span>
                                </div>

                            </div>

                            {isOwner ?
                            (
                                <>
                                <Link className="btn-editar" to={"/editar-perfil"}>
                                    <FaEdit />
                                    Editar perfil
                                </Link>

                                <button className="btn-share" onClick={handleShare}>
                                    <FaShareAlt />
                                    Compartilhar conta
                                </button>

                                <button className="btn-logout" onClick={handleLogout}>
                                    <FaSignOutAlt />
                                    Sair
                                </button>
                                </>
                            ) : 
                            (                            
                                <>
                                    <button
                                        className={`btn-like ${profile.alreadyLiked ? "liked" : ""}`}
                                        onClick={handleLike} disabled={liking}
                                    >
                                        <FaHeart />
                                        {profile.alreadyLiked ? "Curtido" : "Curtir"}
                                    </button>

                                    {(user?.role === "admin") && profile?.role !== "admin" && (
                                        <button
                                            className="btn-disable"
                                            onClick={handleDisableAccount}
                                        >
                                            <FaUserSlash />
                                            Desativar conta
                                        </button>
                                    )}
                                </>
                            )}
                            

                        </div>
                    </>
                )
            }

            

        </div>

    )

}