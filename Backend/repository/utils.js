// repository/utils.js
// Utilitaire partagé par tous les repositories

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

module.exports = { genId };
