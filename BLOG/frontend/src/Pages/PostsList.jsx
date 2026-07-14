
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import apiFetch from "../Services/api";
import "./../Css/Posts.css";

import relativeTime from "dayjs/plugin/relativeTime";

import dayjs from "dayjs";
dayjs.extend(relativeTime);
dayjs.locale("pt-br");


export default function PostsList() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [loadMore, setLoadMore] = useState(true);
    
    

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const query = params.get("q");

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setLoadMore(true);
    }, [query]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() =>
    {
        async function buscar(texto)
        {
            if (loading && page !== 1)
            {
                return;
            }

            setLoading(true);

            try {

                if (page === 1) {
                    setLoadMore(true);
                }

                let data = null;

                if (texto.length <= 0)
                {
                    // Carrega lista de posts
                    data = await apiFetch(`/getposts?page=${page}&limit=10`, {
                        method: "GET"
                    });
                } else {

                    // Busca
                    data = await apiFetch(`/getposts?q=${texto}&page=${page}&limit=10`, {
                        method: "GET"
                    });
                }

                if (!data.posts || data.posts.length === 0)
                {
                    // Acabou os posts
                    setLoadMore(false);
                    setLoading(false);
                    return;
                }

                //setPosts(data.posts);
                if (page === 1) {
                    setPosts(data.posts);
                } else {
                    setPosts(prev => [...prev, ...data.posts]);
                }
                // setPosts(prev => [...prev, ...data.posts]);

            } catch (err) {
                console.error("Erro ao carregar post(s):", err);
            } finally {
                setLoading(false);
            }
        }

        buscar(query || "");
    }, 
        // eslint-disable-next-line
        [page, query]
    );

    if (loading && posts.length === 0)
    {
        return <div className="skeleton">
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                </div>
    }

    // Lista de posts
    return (
        <div className="posts">

            <h1>Postagens</h1>


            {posts.length === 0 ? (
                <h2>{query ? "Nenhum resultado encontrado" : "Nenhum post encontrado"}</h2>
            ) : (

                <>
                {posts.map(post =>
                (

                    <Link 
                        to={post.contentType === "poll" ? `/polls/${post.slug}` : `/posts/${post.slug}`} 
                        key={post._id}
                    >
                        <div className={`post-card ${post.contentType === "poll" ? "poll-variant" : ""}`}>
                            
                            {post.coverImage ? (
                                <img src={post.coverImage} alt={post.title} className="post-cover" />
                            ) : post.contentType === "poll" ? (
                                <div className="poll-placeholder">
                                    <span></span>
                                </div>
                            ) : null}

                            <div className="post-content">
                                <h2 className="post-title">
                                    {post.contentType === "poll" && ""} {post.title}
                                </h2>
                                
                                <p className="post-excerpt">
                                    {post.excerpt || "Clique para participar desta votação e deixar sua opinião!"}
                                </p>

                                <div className="post-meta">
                                    <span>{post.author?.profile?.nickname}</span>
                                    <span>
                                        {dayjs(post.createdAt).fromNow()}
                                    </span>
                                    
                                    {post?.status === "deleted" && <b className="deletado">Deletado</b>}
                                    
                                    <div className=
                                    {`
                                        type-badge 
                                        ${
                                            post.contentType === "poll" ?
                                            "mini-poll-card" : "mini-post-card"
                                        }
                                    `}>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                ))}
                </>
            )
            }

            {
                loadMore ? 
                (
                    <button onClick={() => setPage(prev => prev + 1)} className="button-primary" disabled={loading}>
                        Carregar Mais
                    </button>
                ) : null
            }
            

        </div>
    );


}