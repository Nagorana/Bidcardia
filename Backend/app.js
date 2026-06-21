// app.js — Express app exportable pour les tests (sans listen)
require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const DatabaseConnector = require("./repository/DatabaseConnector");
const { initDB }        = require("./initDB");
const UserService        = require("./service/UserService");

const authRoutes     = require("./routes/auth");
const adminRoutes    = require("./routes/admin");
const listingsRoutes = require("./routes/listings");
const cartRoutes      = require("./routes/cart");

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@tcg.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";

let appInstance = null;

async function createApp() {
    if (appInstance) return appInstance;

    const db = await DatabaseConnector.getInstance();
    initDB(db);

    const userService = new UserService(db);
    userService.ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/api/health", (req, res) => res.json({ ok: true }));

    // ── Routes par domaine (chaque module reçoit db et renvoie un router) ───────
    app.use("/api/auth", authRoutes(db));
    app.use("/api/admin", adminRoutes(db));
    app.use("/api/listings", listingsRoutes(db));
    app.use("/api/cart", cartRoutes(db));

    appInstance = app;
    return app;
}

module.exports = { createApp };
