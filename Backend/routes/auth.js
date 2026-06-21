// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const UserService = require("../service/UserService");

const SECRET = process.env.JWT_SECRET || "tcg_secret_dev";

function makeToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, username: user.username, role: user.role },
        SECRET,
        { expiresIn: "7d" }
    );
}

// Factory : reçoit l'instance DatabaseConnector déjà initialisée (db)
// et renvoie un router Express prêt à être monté avec app.use("/api/auth", authRoutes(db)).
module.exports = function authRoutes(db) {
    const router = express.Router();
    const userService = new UserService(db);

    router.post("/register", (req, res) => {
        try {
            const user = userService.register(req.body);
            const token = makeToken(user);
            res.status(201).json({
                token,
                user: { id: user.id, email: user.email, username: user.username, role: user.role }
            });
        } catch (e) {
            const status = e.message.includes("requis") ? 400 : 409;
            res.status(status).json({ error: e.message });
        }
    });

    router.post("/login", (req, res) => {
        try {
            const { email, password } = req.body;
            const user = userService.login(email, password);
            const token = makeToken(user);
            res.json({
                token,
                user: { id: user.id, email: user.email, username: user.username, role: user.role }
            });
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    });

    router.get("/me", (req, res) => {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Non authentifié" });
        try {
            const user = jwt.verify(header.slice(7), SECRET);
            res.json({ user });
        } catch {
            res.status(401).json({ error: "Token invalide" });
        }
    });

    return router;
};
