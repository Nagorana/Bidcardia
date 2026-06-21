// server.js — Point d'entrée BidCardia Backend
require("dotenv").config();
const fs      = require("fs");
const path    = require("path");
const express = require("express");
const cors    = require("cors");

// Crée data/ si besoin
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const DatabaseConnector = require("./repository/DatabaseConnector");
const { initDB }        = require("./initDB");
const UserService        = require("./service/UserService");

const authRoutes     = require("./routes/auth");
const adminRoutes    = require("./routes/admin");
const listingsRoutes = require("./routes/listings");
const cartRoutes      = require("./routes/cart");

const PORT    = process.env.PORT    || 3001;
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@tcg.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";

// ─── Démarrage asynchrone ─────────────────────────────────────────────────────
async function start() {

    // 1. Singleton DatabaseConnector (= HibernateConnector.getSession())
    const db = await DatabaseConnector.getInstance();

    // 2. Crée les tables (= hbm2ddl.auto=update)
    initDB(db);

    // 3. Crée/met à jour l'admin depuis le .env
    const userService = new UserService(db);
    userService.ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`   ⚠️  Modifiable dans le fichier .env\n`);

    // 4. Express
    const app = express();
    app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
    app.use(express.json());

    // ── Santé ──────────────────────────────────────────────────────────────────
    app.get("/api/health", (req, res) =>
        res.json({ ok: true, time: new Date().toISOString() })
    );

    // ── Routes par domaine (chaque module reçoit db et renvoie un router) ───────
    app.use("/api/auth", authRoutes(db));
    app.use("/api/admin", adminRoutes(db));
    app.use("/api/listings", listingsRoutes(db));
    app.use("/api/cart", cartRoutes(db));

    // ── Listen ─────────────────────────────────────────────────────────────────
    app.listen(PORT, () => {
        console.log(`🚀 Backend BidCardia sur http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error("❌ Erreur démarrage :", err);
    process.exit(1);
});
