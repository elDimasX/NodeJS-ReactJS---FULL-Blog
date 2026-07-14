
import "../Css/Badge.css"

import { useState } from "react";

export const getTier = (min) => {
    if (min >= 500) return "max";
    if (min >= 250) return "lenda";
    if (min >= 100) return "elite";
    if (min >= 50) return "patrocinador";
    if (min >= 20) return "colaborador";
    return "apoiador";
};

function formatBRL(value) {
    return value
        ? `R$ ${Number(value).toFixed(2).replace(".", ",")}`
        : "";
}

const getPublicTooltip = (tier, min) => {
    switch(tier) {
        case "max":
            return <>👑 <strong>{formatBRL(min)}</strong> — nível máximo de apoio! Todo respeito para esse apoiador!</>;
        case "lenda":
            return <>💎 <strong>{formatBRL(min)}</strong> — lendário! Quem contribui assim merece destaque!</>;
        case "elite":
            return <>🌟 <strong>{formatBRL(min)}</strong> — elite! Apoio de alto nível!</>;
        case "patrocinador":
            return <>🔥 <strong>{formatBRL(min)}</strong> — patrocinador oficial do site!</>;
        case "colaborador":
            return <>✨ <strong>{formatBRL(min)}</strong> — colaborador dedicado!</>;
        case "apoiador":
        default:
            return <>Apoiador com mais de {formatBRL(min)} — obrigado pelo suporte!</>;
    }
};

export function Badge({ badge, role, size = "normal" })
{
    const [open, setOpen] = useState(false);
    const [openAdmin, setOpenAdmin] = useState(false);

    if (!badge) return null;
    
    return (

        <div className="badges">

            {/* Badge principal do apoiador */}
            <div
                className={`badge-wrapper contribution ${size} ${open ? "active" : ""}`}
                data-tier={getTier(badge.min)}
                onClick={() => setOpen(!open)}
            >
                <div
                    className="badge"
                    style={{ "--color": badge.color }}
                    
                >
                    <span className="badge-icon">{badge.icon}</span>
                    {size !== "mini" && badge.name}
                </div>
                
                <div className="badge-tooltip">
                    {/* 🏆 Já contribuiu com mais de <strong>{formatBRL(badge.min)}</strong> */}
                    {getPublicTooltip(getTier(badge.min), badge.min)}
                </div>

                
            </div>

            {/* Badge de permissão (moderador/admin) */}
            {["moderator", "admin"].includes(role) && (
                <div
                    className={`badge-wrapper role ${size} ${openAdmin ? "active" : ""}`}
                    data-tier={role}
                    onClick={() => setOpenAdmin(!openAdmin)}
                >
                    <div 
                        className="badge"
                        style={{
                            "--color": role === "moderator" ?   "var(--color-warning)" :
                                                                "var(--color-danger)" 
                        }}
                        data-tier="moderation"

                    >
                        <span className="badge-icon">{role === "moderator" ? "🛡️" : "🔧"}</span>
                        {size !== "mini" && (role === "moderator" ? "Moderador" : "Admin")}
                    </div>
                    
                    <div className="badge-tooltip-admin">
                        {role === "moderator"
                            ? "Este usuário tem permissões de Moderação"
                            : "Este usuário tem permissões de Administração"}
                    </div>
                </div>
            )}

        </div>
    );
}