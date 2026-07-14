
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import apiFetch from "../Services/api";


import "../Css/Home.css"

export default function Home()
{
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [loadMore, setLoadMore] = useState(true);

    const [featured, setFeatured] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [mainPolls, setMainPolls] = useState([]);

    const carregarPosts = async function () {
        if (loading || !loadMore) return;

        setLoading(true);

        try {
            const data = await apiFetch(
                `/getposts?page=${page}&limit=10&home=true`
            );

            // 🔥 primeira página (home sections)
            if (page === 1) {
                setFeatured(data.featured || null);
                setHighlights(data.highlights || []);
                setMainPolls(data.mainPolls || []);
            }

            // 🔥 feed principal
            if (!data.latestPosts || data.latestPosts.length === 0) {
                setLoadMore(false);
                return;
            }

            setPosts(prev =>
                page === 1
                    ? data.latestPosts
                    : [...prev, ...data.latestPosts]
            );

            setLoadMore(data.hasMore);

        } catch (err) {
            console.log("Erro ao carregar posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        carregarPosts();

    }, [page]);

    if (loading && posts.length === 0)
    {
        return <div className="skeleton">
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                </div>
    }

    return (


        <main className="home">

            <div className="top-layout">


                {/* 🏆 FEATURED */}
                <div className="section featured-section">
                    <h1 className="section-title">Mais visto da semana</h1>

                    {featured && (
                        <Link
                        to={`/posts/${featured.slug}`}
                        className={`featured-post ${featured.contentType}`}
                        >
                        {featured.coverImage && (
                            <img src={featured.coverImage} alt={featured.title} />
                        )}

                        <div className="featured-post-content">
                            <h1>{featured.title}</h1>

                            {featured.contentType === "post" && (
                            <p>{featured.excerpt}</p>
                            )}

                            {featured.contentType === "poll" && (
                            <span className="badge-poll">Enquete</span>
                            )}
                        </div>
                        </Link>
                    )}
                    </div>

                    

            </div>
            

            {/* 🔥 DESTAQUES DA SEMANA */}
            {highlights?.length > 0 && (
                <div className="section">
                    <h2 className="section-title">Destaques da semana</h2>

                    <section className="posts-grid horizontal">
                        {highlights.map(item => (
                            <Link
                                key={item._id}
                                to={`/posts/${item.slug}`}
                                className={`post-card ${item.contentType}`}
                            >
                                {item.coverImage && (
                                    <img src={item.coverImage} alt={item.title} />
                                )}

                                <div className="post-card-content">
                                    <h2>{item.title}</h2>
                                </div>
                            </Link>
                        ))}
                    </section>
                </div>
            )}

            {/* 🗳️ ENQUETES LATERAIS */}
                    {mainPolls?.length > 0 && (
                        <div className="section">
                            <h2 className="section-title">Enquetes em alta</h2>

                            <section className="posts-grid polls">
                                {mainPolls.map(poll => (
                                    <Link to={`/polls/${poll.slug}`} className="poll-card">
                                        <h2 className="poll-title">{poll.title}</h2>

                                        <div className="poll-options">
                                            {poll.options.slice(0, 4).map((opt, i) => (
                                            <div key={i} className="poll-option">
                                                {opt.image && <img src={opt.image} alt={opt.text} />}
                                                <span>{opt.text}</span>
                                            </div>
                                            ))}
                                        </div>
                                    </Link>
                                ))}
                            </section>
                        </div>
                    )}

            {/* 🆕 RECENTES */}
            <div className="section">
                <h2 className="section-title">Postagens recentes</h2>

                <section className="posts-grid">
                    {posts.length === 0 ? (
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Nada por aqui 👀
                        </p>
                    ) : (
                        posts.map(item => (
                            <Link
                                key={item._id}
                                to={`/posts/${item.slug}`}
                                className={`post-card ${item.contentType}`}
                            >
                                {item.coverImage && (
                                    <img src={item.coverImage} alt={item.title} />
                                )}

                                <div className="post-card-content">
                                    <h2>{item.title}</h2>

                                    {item.contentType === "post" && (
                                        <p>{item.excerpt}</p>
                                    )}

                                    {item.contentType === "poll" && (
                                        <span className="badge-poll">Enquete</span>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </section>

                {/* 🔘 LOAD MORE */}
                {loadMore && (
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        className="button-primary load-more"
                        disabled={loading}
                    >
                        {loading ? "Carregando..." : "Carregar mais"}
                    </button>
                )}
            </div>

        </main>

    )
}
