import { FiSearch, FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";


import { NOME_WEBSITE } from "../Contexts/Variables";
import { AuthContext } from "../Contexts/AuthContext";
import BellNotification from "./BellNotification";

import "../Css/Header.css"

export default function Header()
{
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleSubmit = (e) =>
    {
        e.preventDefault();

        if (!query.trim()) return;

        navigate(`/posts?q=${encodeURIComponent(query)}`);
        
    };


    const { isAuthenticated, user } = useContext(AuthContext);

    return (


        <header>

            <button className="menuBtn" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FiX size={30}/> : <FiMenu size={30}/>}
            </button>

            <div className={`mainLinks ${menuOpen ? "open" : ""}`}>
                <Link to={"/"}><h3>{NOME_WEBSITE}</h3></Link>
                {/* <Link to={"/"}>Início</Link> */}
                <Link to={"/posts"}>Últimas noticias</Link>
                <Link to={"/apoiadores"}>Apoiadores</Link>

                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Procurar" value={query} onChange={(e) => setQuery(e.target.value)}/>
                    <FiSearch />
                </form>

            </div>

            <div className="loginLinks">
                {
                    !isAuthenticated ?
                    <>
                        <Link to={"/login"}>Fazer login</Link>
                        <Link to={"/register"} className="button-primary">Criar conta</Link>
                    </>

                    :

                    <>
                        {
                            user?.role === "admin" ?
                            (
                                <Link to={`/criar-post/`}>Criar</Link>
                            ) : null
                        }

                        <Link to={`/perfil/${user.nickname}`}>{user.nickname}</Link>
                        <BellNotification/>

                    </>
                }
                
            </div>

        </header>
    )


}
