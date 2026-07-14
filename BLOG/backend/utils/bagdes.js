

const badges = [
    {
        name: "Apoiador",
        min: 1,
        icon: "💙",
        color: "#3B82F6"
    },
    {
        name: "Entusiasta",
        min: 2,
        icon: "🌟",
        color: "#60A5FA"
    },
    {
        name: "Parceiro",
        min: 5,
        icon: "🤝",
        color: "#10B981"
    },
    {
        name: "Doador",
        min: 10,
        icon: "💎",
        color: "#EC4899"
    },
    {
        name: "Colaborador",
        min: 20,
        icon: "⚡",
        color: "#F59E0B"
    },
    {
        name: "Patrocinador",
        min: 50,
        icon: "🔥",
        color: "#EF4444"
    },
    {
        name: "Elite",
        min: 100,
        icon: "👑",
        color: "#A855F7"
    },
    {
        name: "G.O.A.T",
        min: 250,
        icon: "🐐",
        color: "#22C55E"
    },
    {
        name: "I.N.S.A.N.E",
        min: 500,
        icon: "👑",
        color: "#dbc33c"
    }
];

module.exports = function getBadge(total) {
    let best = null;

    for (const badge of badges) {
        if (total >= badge.min) {
            if (!best || badge.min > best.min) {
                best = badge;
            }
        }
    }

    if (!best) return null;

    return {
        name: best.name,
        icon: best.icon,
        min: best.min,
        color: best.color
    }
};
