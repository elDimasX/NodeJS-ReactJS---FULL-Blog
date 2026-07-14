
import "../Css/Footer.css"
import { NOME_WEBSITE, DESCRICAO, GITHUB, LINKEDIN, EMAIL } from "../Contexts/Variables";
import { Link } from "react-router-dom"

export default function Footer() {

    return (
        <footer className="footer">
            <div className="footer-container">

            <div className="footer-brand">
                <h3>{NOME_WEBSITE}</h3>
                <p>{DESCRICAO}</p>
            </div>

            <div className="footer-links">
                <h4>Links</h4>
                <Link to={"/"}>Home</Link>
                <Link to={"/posts"}>Posts</Link>
                <Link to={"/sobre"}>Sobre</Link>
            </div>  

            <div className="footer-social">
                <h4>Contato</h4>
                <Link to={GITHUB}>GitHub</Link>
                <Link to={LINKEDIN}>LinkedIn</Link>
                <Link to={`mailto:${EMAIL}`}>Email</Link>
            </div>

            </div>

            <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {NOME_WEBSITE}. Todos os direitos reservados.</span>
            </div>
        </footer>
    );

}
