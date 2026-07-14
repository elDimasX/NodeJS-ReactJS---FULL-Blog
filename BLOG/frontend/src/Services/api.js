
import { BACKEND_URL } from "../Contexts/Variables";
import { toast } from "react-toastify";

const apiFetch = async (endpoint, options = {}) => 
{

    try
    {
        const url = `${BACKEND_URL}${endpoint}`;

        const isFormData = options.body instanceof FormData;

        const config = {
            credentials: "include",
            ...options,
            headers: {
                ...(options.headers || {}),
                
                // Só seta JSON se NÃO for FormData
                ...(!isFormData && { "Content-Type": "application/json" })
            }
        };

        const response = await fetch(url, config);

        let data;

        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok)
        {
            if (endpoint !== "/meuperfil" && endpoint !== "/notificacoes-de-usuario/buscar")
            {
                toast.error(data?.error || "Erro na requisição.");
            }
            return null;
        }

        return data;

    } catch (err) {
        console.error("Erro de conexão:", err);
        toast.error("Erro de conexão com o servidor.");
        return null;
    }
};

export default apiFetch;
