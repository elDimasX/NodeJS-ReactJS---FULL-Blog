
import apiFetch from "../Services/api";

import { useState, useEffect, useContext } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";

import { AuthContext } from "../Contexts/AuthContext";
import "../Css/VerificarEmail.css"

export default function VerificarEmail()
{

    const [status, setStatus] = useState("Aguardando validação...");
    const navigate = useNavigate();

    const { checkAuth } = useContext(AuthContext);

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const token = params.get("token");

    useEffect(() => {

        const ValidarEmail = async() =>
        {
            if (!token)
            {    
                setStatus("Token necessário.");
                return;
            }

            setStatus("Aguardando validação...");

            const response = await apiFetch(`/validar-email/${token}`, {
                method: "GET"
            });

            if (!response) {
                setStatus("Erro ao conectar com o servidor.");
                return;
            }

            if (response.success)
            {

                setStatus(response.success);
                await checkAuth();

                setTimeout(() => {
                    navigate("/");
                }, 3000);

            } else if (response.error)
            {
                setStatus(response.error);
            } else {
                setStatus("Resposta inválida do servidor.");
            }

        }

        ValidarEmail();

    }, [token ]);


    return (
        <div className="verificar-email">

            <div className="verificar-card">

                {/* ICON */}
                <div className="verificar-icon">
                    {status === "Aguardando validação..." && (
                        <FiLoader className="verificar-loading" />
                    )}

                    {status.includes("sucesso") && (
                        <FiCheckCircle className="verificar-sucesso" />
                    )}

                    {status.includes("Erro") || status.includes("inválida") ? (
                        <FiXCircle className="verificar-erro" />
                    ) : null}
                </div>

                {/* TITLE */}
                <h1>{status}</h1>

                {/* SUBTEXT */}
                <p className="verificar-text">
                    {status === "Aguardando validação..." && "Validando seu email..."}
                    {status.includes("sucesso") && "Você será redirecionado em instantes."}
                    {status.includes("Erro") && "Verifique o link ou tente novamente."}
                </p>

            </div>

        </div>
    );

}
