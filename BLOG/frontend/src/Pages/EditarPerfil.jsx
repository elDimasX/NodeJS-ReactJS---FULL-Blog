import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import apiFetch from "../Services/api";

import { AuthContext } from "../Contexts/AuthContext";
import { executeCaptcha } from "../Components/Captcha";

import "../Css/EditarPerfil.css";

export default function EditarPerfil() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    // Carrega dados do usuário logado
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        setValue("nickname", user.nickname);
        setValue("nome", user.name);
        setValue("email", user.email);
        setValue("bio", user.bio || "");
        setValue("avatar", user.avatar || "");
        setValue("banner", user.banner || "");
        setValue("showEmail", user.showEmail ?? true);
    }, [user, setValue, navigate]);

    const onSubmit = async (data) =>
    {
        setSaving(true);
        setError("");

        try
        {
            const formData = new FormData();

            formData.append("nickname", data.nickname);
            formData.append("name", data.nome);
            formData.append("email", data.email);
            formData.append("bio", data.bio);
            formData.append("avatar", data.avatar[0]);
            formData.append("banner", data.banner[0]);
            formData.append("showEmail", data.showEmail);
            
            const captchaToken = await executeCaptcha("mudarperfil");

            // Captcha
            formData.append("captchaToken", captchaToken);
            formData.append("action", "mudarperfil");

            const res = await apiFetch("/meuperfil/editar", {
                method: "PUT",
                body: formData
            });

            setUser(res.user);
            navigate(`/perfil/${res.user.nickname}`);
        } catch (err) {
            console.error(err);
            setError("Não foi possível atualizar o perfil");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editar-perfil-card">
            <h2>Editar Perfil</h2>

            {error && <span className="error-message">{error}</span>}

            <form onSubmit={handleSubmit(onSubmit)} className="editar-perfil-form">

                {/* Nickname */}
                <label>
                    Nickname:
                    {errors.nickname && <span className="error-message">{errors.nickname.message}</span>}
                    <input
                        {...register("nickname", {
                            required: "Nickname necessário",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            maxLength: { value: 22, message: "Máximo 22 caracteres" },
                            pattern: {
                                value: /^[a-z0-9_]+$/,
                                message: "Não pode conter espaços"
                            },
                            setValueAs: (value) => value.trim().toLowerCase()
                        })}
                    />
                </label>

                {/* Nome */}
                <label>
                    Nome:
                    {errors.nome && <span className="error-message">{errors.nome.message}</span>}
                    <input
                        {...register("nome", {
                            required: "Nome necessário",
                            minLength: { value: 3, message: "Mínimo 3 caracteres" },
                            maxLength: { value: 60, message: "Máximo 60 caracteres" }
                        })}
                    />
                </label>

                {/* Email */}
                <label>
                    Email (Não é possível alterar):
                    {errors.email && <span className="error-message">{errors.email.message}</span>}
                    <input
                        type="email"
                        {...register("email", {
                            pattern: { 
                                value: /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i,
                                message: "Email inválido"
                            },
                            minLength: { value: 5, message: "Mínimo 5 caracteres" },
                            maxLength: { value: 50, message: "Máximo 50 caracteres" }
                        })}

                        readOnly
                    />
                </label>

                {/* Bio */}
                <label>
                    Bio:
                    {errors.bio && <span className="error-message">{errors.bio.message}</span>}
                    <textarea
                        {...register("bio", {
                            minLength: { value: 1, message: "Mínimo 1 caractere" },
                            maxLength: { value: 200, message: "Máximo 200 caracteres" }
                        })}
                    />
                </label>

                {/* Avatar */}
                <label>
                    Avatar:
                    {errors.avatar && <span className="error-message">{errors.avatar.message}</span>}
                    <input type="file"
                        {...register("avatar", {
                            maxLength: { value: 300, message: "Máximo 300 caracteres" }
                        })}
                    />
                </label>

                {/* Banner */}
                <label>
                    Banner:
                    {errors.banner && <span className="error-message">{errors.banner.message}</span>}
                    <input type="file"
                        {...register("banner", {
                            maxLength: { value: 300, message: "Máximo 300 caracteres" }
                        })}
                    />
                </label>

                {/* Mostrar email */}
                <label className="checkbox-container">
                    <input type="checkbox" {...register("showEmail")} />
                    <span className="checkbox-box"></span>
                    Mostrar email para outros usuários
                </label>

                <button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar alterações"}
                </button>
            </form>
        </div>
    );
}