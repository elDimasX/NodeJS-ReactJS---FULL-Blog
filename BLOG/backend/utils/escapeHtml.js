
// Proteção contra XSS (html encode)
const he = require("he");

function escapeHtml(text) {
    if (!text) return "";
    return he.encode(text);
}

module.exports = escapeHtml;