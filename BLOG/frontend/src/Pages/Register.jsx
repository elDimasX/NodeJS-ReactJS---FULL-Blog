
import "../Css/LoginRegister.css";
import { Link, useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";

import { AuthContext } from "../Contexts/AuthContext"; 

import { executeCaptcha } from "../Components/Captcha";
import { BACKEND_URL } from "../Contexts/Variables";

import apiFetch from "../Services/api";


export default function Register() {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { user } = useContext(AuthContext);

    const {

        register,
        handleSubmit,
        watch,
        formState: { errors },       

    } = useForm();

    const navigate = useNavigate();
    const senha = watch("senha");

    const [enabled, setEnabled] = useState(true);


    const Registrar = async (data) => {


        setEnabled(false);

        try {

            setError("");
            setSuccess("");

            const captchaToken = await executeCaptcha("register");

            const response = await apiFetch("/registrar", {
                method: "POST",
                body: JSON.stringify({
                    nickname: data.nickname,
                    name: data.nome,
                    email: data.email,
                    password: data.senha,
                    confirmPassword: data.confirmarSenha,
                    captchaToken,
                    action: "register"
                })
            });

            if (response.error)
            {
                setError(response.error);
                setEnabled(true);
                throw new Error("Login inválido");
            }
            else {

                setSuccess(response?.success || "Conta criada com sucesso. Verifique seu email para ativar sua conta pelo link.");
            }

            // await login(data.email, data.senha, setError);
            // navigate("/perfil");

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
            <h2>Criar Conta</h2>

            {error && (
                <span className="error-message">{error}</span>
            )}
            
            {success && (
                <span className="success-message">{success}</span>
            )}

            <form onSubmit={handleSubmit(Registrar)}>

                <div className="input-group">

                    <label>Nickname único</label>
                    {errors.nickname && (
                        <span className="error-message">
                            {errors.nickname.message}
                        </span>
                    )}

                    <input
                    type="text"
                    placeholder="Seu nickname (único para cada pessoa)"
                    {...register("nickname", {
                        required: "Nickname necessário",
                        maxLength: {
                            value: 22,
                            message: "Máximo de 22 caracteres"
                        },
                        minLength: {
                            value: 3,
                            message: "Mínimo de 3 caracteres" 
                        },
                        pattern: {
                            value: /^[a-z0-9_]+$/,
                            message: "Somente letras e números"
                        },
                        setValueAs: (value) => value.trim().toLowerCase()
                    })}
                    className={errors.nickname ? "input error" : ""}
                    />
                </div>

                <div className="input-group">

                    <label>Nome</label>
                    {errors.nome && (
                        <span className="error-message">
                            {errors.nome.message}
                        </span>
                    )}

                    <input
                    type="text"
                    placeholder="Seu nome completo"
                    {...register("nome", {
                        required: "Nome necessário",
                        maxLength: {
                            value: 60,
                            message: "Máximo de 60 caracteres"
                        },
                        minLength: {
                            value: 3,
                            message: "Mínimo de 3 caracteres" 
                        }
                    })}
                    className={errors.nome ? "input error" : ""}
                    />
                </div>

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
                            value: 50,
                            message: "Máximo de 50 caracteres"
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

                <div className="input-group">
                    <label>Confirmar Senha</label>
                    {errors.confirmarSenha && (
                        <span className="error-message">
                            {errors.confirmarSenha.message}
                        </span>
                    )}

                    <div className="password-wrapper">
                    <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={showConfirmPassword ? "Sua confirmação de senha" : "••••••••"}
                    {...register("confirmarSenha", {
                        required: "Confirmação de senha necessária",
                        maxLength: {
                            value: 50,
                            message: "Máximo de 50 caracteres"
                        },
                        minLength: {
                            value: 8,
                            message: "Mínimo de 8 caracteres" 
                        },
                        
                        validate: (value) =>
                            value === senha || "As senhas não coincidem"
                    })}
                    className={errors.senha ? "input error" : ""}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(prev => !prev)} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                        {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </button>
                    
                    </div>
                </div>

                 <button type="submit" className="login-with-google submit-button" disabled={!enabled} onClick={handleGoogleLogin}>
                    <FcGoogle size={20} />
                    Entrar com o Google
                </button>

                <button type="submit" className="button-primary submit-button" disabled={!enabled}>
                    Criar Conta
                </button>


            </form>

            <p className="auth-footer">
            Já tem conta? <Link to="/login">Entrar</Link>
            </p>

        </div>
        </div>

    );
}

