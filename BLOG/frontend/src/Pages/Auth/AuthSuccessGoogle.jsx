import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";

import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import "../../Css/Auth/AuthGoogle.css"

export default function AuthSuccessGoogle({ status }) {

    const { checkAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function run() {

            if (status === "success") {
                await checkAuth();
                setTimeout(() => {
                    navigate("/", { replace: true });
                }, 2000);
            }

            if (status === "fail") {
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 3000);
            }
        }

        run();
    }, [status, checkAuth, navigate]);

    return (
        <div className="auth-google">

            <div className="auth-google-card">

                <div className="auth-google-icon">

                    {status === "success" && <FiCheckCircle className="icon-success" />}
                    {status === "fail" && <FiXCircle className="icon-error" />}
                    {!status && <FiLoader className="icon-loading" />}

                </div>

                <h1>
                    {status === "success" && "Login realizado com sucesso!"}
                    {status === "fail" && "Falha na autenticação"}
                    {!status && "Finalizando login..."}
                </h1>

                <p className="auth-google-text">
                    {status === "success" && "Redirecionando para o site..."}
                    {status === "fail" && "Você será redirecionado para o login."}
                    {!status && "Aguarde um instante..."}
                </p>

            </div>

        </div>
    );
}