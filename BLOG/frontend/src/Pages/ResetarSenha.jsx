

import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useForm } from "react-hook-form"

import { AuthContext } from "../Contexts/AuthContext";
import { executeCaptcha } from "../Components/Captcha";

import apiFetch from "../Services/api";

import "../Css/LoginRegister.css";

export default function ResetarSenha() {

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { user } = useContext(AuthContext);

    const {

        register,
        handleSubmit,
        formState: { errors },

    } = useForm();

    const navigate = useNavigate();

    const [enabled, setEnabled] = useState(true);

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const token = params.get("token");

    const EnviarEmailRecuperar = async (data) => {

        setEnabled(false);

        try {

            const captchaToken = await executeCaptcha("resetpassword");

            if (!token)
            {
                

                const response = await apiFetch("/resetar-senha", {
                    method: "POST",
                    body: JSON.stringify(
                    {
                        email: data.email,
                        captchaToken,
                        action: "resetpassword"
                    })

                });

                if (response.error)
                {

                    setError(response.error);
                    setEnabled(true);
                    throw new Error("Email inválido");

                } else {

                    setSuccess(response?.success || "Um email foi enviado com um link para recuperação. Verifique sua caixa de spam.");
                }
            } else {

                const response = await apiFetch(`/resetar-senha/${token}`, {
                    method: "PUT",
                    body: JSON.stringify({

                        newPassword: data.senha,
                        captchaToken,
                        action: "resetpassword"
                    })
                })

                if (response.error)
                {

                    setError(response.error);
                    setEnabled(true);
                    throw new Error("Ocorreu um erro!");

                } else {

                    setSuccess(response?.success || "Senha alterada com sucesso! Todas as sessões da sua conta foram encerradas por segurança.");
                }
            }

        } catch (err) {

        }

        setEnabled(true);
    };

    useEffect(() => {

        if (user)
        {
            navigate("/");
        }

    }, [user, navigate, token]);



    return (

        <div className="auth-container">

        <div className="auth-card">

            {
                !token ? <h2>Recuperar conta</h2> : <h2>Redefinir senha</h2>
            }
            

            {error.length > 0 && (
                <span className="error-message">{error}</span>
            )}

            {success && (
                <span className="success-message">{success}</span>
            )}

            <form onSubmit={handleSubmit(EnviarEmailRecuperar)}>

                <div className="input-group">

                    {
                    !token ?

                    <>
                    <label>Email</label>
                    {errors.email && (
                        <span className="error-message">
                            {errors.email.message}
                        </span>
                    )}

                    
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        {...register("email", {
                            required: "Email necessário",
                            pattern: {
                                value: /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i,
                                message: "Email inválido",
                            },
                            maxLength: {
                                value: 70,
                                message: "Máximo de 70 caracteres"
                            },
                            minLength: {
                                value: 5,
                                message: "Email inválido"
                            }
                        })}
                        className={errors.email ? "input error" : ""}
                    />
                    </>

                    :

                    <>
                    <label>Senha</label>
                    {errors.senha && (
                        <span className="error-message">
                            {errors.senha.message}
                        </span>
                    )}

                    <div className="password-wrapper">
                    <input
                    type={showPassword ? "text" : "password"}
                    placeholder={showPassword ? "Sua senha" : "••••••••"}
                    {...register("senha", {
                        required: "Senha necessária",
                        maxLength: {
                            value: 50,
                            message: "Máximo de 50 caracteres"
                        },
                        minLength: {
                            value: 8,
                            message: "Mínimo de 8 caracteres" 
                        }
                    })}
                    className={errors.senha ? "input error" : ""}
                    />

                    <button type="button" className="password-toggle" onClick={() => setShowPassword(prev => !prev)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                        {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </button>
                    </div>
                    </>

                    }

                </div>
                
                <button type="submit" className="button-primary submit-button" disabled={!enabled}>
                    { !token ? "Recuperar Conta" : "Resetar Senha" }
                </button>

            </form>

            <p className="auth-footer">
                Ao invés disso <Link to="/login">faça login</Link>
            </p>

        </div>

        </div>
    );
}

