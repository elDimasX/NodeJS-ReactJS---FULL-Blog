import { useEffect, useContext, useState } from "react";
import { FaQrcode , FaCoins } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

import apiFetch from "../Services/api";

import { AuthContext } from "../Contexts/AuthContext";
import { executeCaptcha } from "../Components/Captcha";


import "../Css/Pagamento.css"

export default function Payment()
{
    const navigate = useNavigate();

    const [qrCode, setQrCode] = useState(null);
    const [qrBase64, setQrBase64] = useState(null);

    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");

    const suggestedValues = [5, 10, 25, 50];

    async function handlePixPayment()
    {
        try
        {
            setLoading(true);
            const captchaToken = await executeCaptcha("pixpayment");

            const res = await apiFetch("/payment/pix", {
                method: "POST",
                body: JSON.stringify({
                    amount: Number(amount),
                    captchaToken,
                    action: "pixpayment"
                })
            });

            setQrCode(res.qr_code);
            setQrBase64(res.qr_code_base64);

        } catch (err) 
        {
            console.error("Erro ao criar PIX:", err);
        } finally
        {
            
            setLoading(false);
        }
    }

    const { user } = useContext(AuthContext);


    useEffect(() => {

        if (!user)
        {
            navigate("/login");
        }

    }, [user, navigate]);

    function formatBRL(value) {
        return value
            ? `R$ ${Number(value).toFixed(2).replace(".", ",")}`
            : "";
    }

    return (
        <div className="payment-container">
            <div className="payment-card">

                <h2 className="payment-title">Pagamento via PIX</h2>

                <p className="payment-subtitle">
                Apoie o projeto 💙 e ganhe uma <strong>insígnia exclusiva.</strong> Além de entrar na lista de <strong><Link to={"/apoiadores"}>Ranking de doação</Link></strong>
                </p>

                {/* VALORES SUGERIDOS */}
                <div className="payment-suggestions">
                {suggestedValues.map((value) => (
                    <button
                    key={value}
                    className="suggestion-btn"
                    onClick={() => setAmount(value)}
                    >
                    R$ {value}
                    </button>
                ))}
                </div>

                {/* INPUT COM ÍCONE */}
                <div className="payment-input-wrapper">
                <FaCoins className="input-icon" />
                <input
                    type="text"
                    value={formatBRL(amount)}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setAmount((Number(raw) / 100).toFixed(2));
                    }}
                    className="payment-input"
                    placeholder="R$ 0,00"
                    />
                </div>

                {/* BOTÃO */}
                <button
                className="payment-button"
                onClick={handlePixPayment}
                disabled={loading}
                >
                    <FaQrcode style={{ marginRight: 8 }} />
                    {loading ? "Gerando PIX..." : "Pagar com PIX"}
                </button>

                <p className="payment-subtitle">Agradeçemos demais sua contribuição 😊😊</p>

                {/* QR CODE */}
                {qrBase64 && (
                <div className="payment-qr">
                    <img src={`data:image/png;base64,${qrBase64}`} alt="pix"/>

                    <textarea
                    className="payment-code"
                    value={qrCode}
                    readOnly
                    />
                </div>
                )}

                {/* STATUS */}
                {loading && (
                <p className="payment-status pending">
                    Gerando pagamento...
                </p>
                )}

                {!loading && qrBase64 && (
                <p className="payment-status pending">
                    Quando o pagamento for concluído, você receberá uma insígnia no seu perfil.
                </p>
                )}

            </div>
        </div>
    );

}
