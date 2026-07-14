
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import apiFetch from "../Services/api";
import { Badge } from "../Components/Badge"
import "../Css/Apoiadores.css"

export default function Apoiadores()
{
    const [apoiadores, setApoiadores] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [loadMore, setLoadMore] = useState(true);

    useEffect(() =>
    {
         const CarregarTopApoiadores = async () =>
        {
            setLoading(true);

            try {

                const response = await apiFetch(`/apoiadores?page=${page}&limit=10`, {
                    method: "GET"
                });

                if (response.apoiadores)
                {
                    setApoiadores(prev => [...prev, ...response.apoiadores]);
                    setLoadMore(response.hasMore);
                }

            } catch (err) {
                console.error("Erro ao carregar top doadores:", err);
            } finally {
                setLoading(false);
            }
        };

        CarregarTopApoiadores();

    }, [page]);

    if (loading && apoiadores.length === 0)
    {
        return <div className="skeleton">
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                    <div className="skeleton-card"></div>
                </div>
    }


    return (


        <div className="apoiadores">

            {
            apoiadores.length === 0 ? (
                <h2>Nenhum apoiador no site... seja o primeiro a nos apoiar e ganhe até uma insígnia exclusiva! <Link to={"/pagamento"}>Faça um apoio!❤️</Link> </h2>
            ) :
            (
                <>
                <h1>Os melhores apoiadores do planeta ❤️! Amamos vocês de coração 🥺❤️!</h1>
                <h3>Você também pode nos ajudar, se quiser! Faça uma contribuição <Link to={"/pagamento"} className="h3">clicando aqui</Link>. Ficaremos eternamente gratos, e você ganhará um lugar por aqui.</h3>
                {apoiadores.map(apoiador => 

                    <Link to={`/perfil/${apoiador.nickname}`} key={apoiador.nickname} className="perfil">
                        <div className="perfil-left">
                            <img src={apoiador.avatar} alt="user"/>

                            <div className=".perfil-infoapoiadores">
                                <span className="nickname">{apoiador.nickname}</span>
                                <u className="bio">{apoiador.bio}</u>
                            </div>
                        </div>

                        <Badge badge={apoiador.badge} role={apoiador?.role} />
                    </Link>
                )}
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
