
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useForm } from "react-hook-form"
import { FcGoogle } from "react-icons/fc";

import { AuthContext } from "../Contexts/AuthContext";
import { BACKEND_URL } from "../Contexts/Variables";

import "../Css/LoginRegister.css";

export default function Login() {

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const { user, login } = useContext(AuthContext);

    const {

        register,
        handleSubmit,
        formState: { errors },       

    } = useForm();

    const navigate = useNavigate();

    const [enabled, setEnabled] = useState(true);

    const Login = async (data) => {

        setEnabled(false);

        try {

            setError("");
            await login(data.email, data.senha, setError);

        } catch (err) {

        }

        setEnabled(true);
    };

    const handleGoogleLogin = (e) => {
        e.preventDefault();

        setEnabled(false);
        window.location.href = `${BACKEND_URL}/auth/google`;
    };

    useEffect(() => {

        if (user)
        {
            navigate("/");
        }

    }, [user, navigate]);



    return (

        <div className="auth-container">

        <div className="auth-card">
            <h2>Entrar</h2>

            {error.length > 0 && (
                <span className="error-message">{error}</span>
            )}

            <form onSubmit={handleSubmit(Login)}>
            <div className="input-group">

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
            </div>

            <div className="input-group">

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
            </div>

            
            <button type="submit" className="login-with-google submit-button" disabled={!enabled} onClick={handleGoogleLogin}>
                <FcGoogle size={20} />
                Entrar com o Google
            </button>

            <button type="submit" className="button-primary submit-button" disabled={!enabled}>
                Entrar
            </button>

            </form>

            <p className="auth-footer">
                Não tem conta? <Link to="/register">Criar conta</Link>
            </p>

            <p className="auth-footer">
                Esqueceu a senha? <Link to="/resetar-senha">Recuperar conta</Link>
            </p>

        </div>

        </div>
    );
}
