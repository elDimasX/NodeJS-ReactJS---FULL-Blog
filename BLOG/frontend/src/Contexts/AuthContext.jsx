

import { createContext, useState, useEffect } from "react";


import apiFetch from "../Services/api";
import { executeCaptcha } from "../Components/Captcha";

import { BACKEND_URL } from "./Variables";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [notifications, setNotifications] = useState([]);
    const [hasMoreNotification, setHasMoreNotification] = useState(true);
    const [loadingMoreNotification, setLoadingMoreNotification] = useState(false);

    // eslint-disable-next-line
    useEffect(() => {
        checkAuth();
    }, []);

    // Para as notificações
    useEffect(() =>
    {
        if (!user) return;

        getNotifications(user);

        const interval = setInterval(() => {
            getNotifications(user);
        }, 60000);

        return () => clearInterval(interval);
    }, [user]);

    async function getNotifications()
    {
        try {

            const response = await apiFetch(`/notificacoes-de-usuario/buscar`, {
                method: "GET"
            });

            if (response.notifications)
            {
                setNotifications(response);
            }

        } catch (error)
        {

        }
    }

    async function loadMoreNotifications()
    {

        if (!notifications.length || !hasMoreNotification || loadingMoreNotification)
        {
            setHasMoreNotification(false);
            return;
        }

        try {

            setLoadingMoreNotification(true);

            const last = notifications[notifications.length - 1];

            const res = await fetch(`/notificacoes-de-usuario/buscar?lastDate=${last.time}`);
            const data = await res.json();

            setNotifications(prev => [
                ...prev,
                ...data.notifications
            ]);

            setHasMoreNotification(data.hasMore);

        } catch (err) {
            console.error("Erro ao carregar mais", err);
        } finally {
            setLoadingMoreNotification(false);
        }
    };

    async function checkAuth()
    {
        try {

            const response = await apiFetch(`/meuperfil`, {
                method: "POST"
            });

            if (!response.user)
            {
                return;
            }

            setUser(response.user);
            
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password, setError)
    {

        const captchaToken = await executeCaptcha("login");

        const response = await fetch(`${BACKEND_URL}/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password, captchaToken, action: "login" })
        });

        const result = await response.json();

        if (!response.ok)
        {
            setError(result.error);
            throw new Error("Login inválido");
        }

        await checkAuth();
    }

    async function logout()
    {
        await apiFetch(`/logout`, {
            method: "post"
        });

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                isAuthenticated: !!user,


                notifications,
                setNotifications,
                hasMoreNotification,
                loadMoreNotifications,
                loadingMoreNotification,

                checkAuth
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};