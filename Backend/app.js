// app.js — Express app exportable pour les tests (sans listen)
require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");

const DatabaseConnector   = require("./repository/DatabaseConnector");
const { initDB }          = require("./initDB");
const UserService         = require("./service/UserService");
const ExtensionRepository = require("./repository/ExtensionRepository");
const ListingRepository   = require("./repository/ListingRepository");
const CartRepository      = require("./repository/CartRepository");
const { authMiddleware, adminMiddleware } = require("./middleware/auth");

const SECRET         = process.env.JWT_SECRET || "tcg_secret_dev";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@tcg.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";

let appInstance = null;

async function createApp() {
    if (appInstance) return appInstance;

    const db = await DatabaseConnector.getInstance();
    initDB(db);

    const userService   = new UserService(db);
    const extensionRepo = new ExtensionRepository(db);
    const listingRepo   = new ListingRepository(db);
    const cartRepo      = new CartRepository(db);

    userService.ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);

    const app = express();
    app.use(cors());
    app.use(express.json());

    function makeToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            SECRET, { expiresIn: "7d" }
        );
    }

    app.get("/api/health", (req, res) => res.json({ ok: true }));

    // Auth routes
    app.post("/api/auth/register", (req, res) => {
        try {
            const user = userService.register(req.body);
            const token = makeToken(user);
            res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
        } catch (e) {
            const status = e.message.includes("requis") ? 400 : 409;
            res.status(status).json({ error: e.message });
        }
    });

    app.post("/api/auth/login", (req, res) => {
        try {
            const { email, password } = req.body;
            const user = userService.login(email, password);
            const token = makeToken(user);
            res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
        } catch (e) {
            res.status(401).json({ error: e.message });
        }
    });

    app.get("/api/auth/me", (req, res) => {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "Non authentifié" });
        try {
            const user = jwt.verify(header.slice(7), SECRET);
            res.json({ user });
        } catch {
            res.status(401).json({ error: "Token invalide" });
        }
    });

    // Listings routes
    app.get("/api/listings", (req, res) => {
        res.json(listingRepo.findActive());
    });

    app.get("/api/listings/:id", (req, res) => {
        const listing = listingRepo.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: "Listing introuvable" });
        res.json(listing);
    });

    app.post("/api/listings", authMiddleware, (req, res) => {
        const { extensionId, cardId, price, currency, mode, endTime } = req.body;
        if (!extensionId || !cardId || !price || !mode)
            return res.status(400).json({ error: "Champs requis manquants" });
        if (!["immediate", "auction"].includes(mode))
            return res.status(400).json({ error: "Mode invalide" });
        if (mode === "auction" && !endTime)
            return res.status(400).json({ error: "Une enchère nécessite une date de fin" });

        const ext = extensionRepo.findById(extensionId);
        if (!ext) return res.status(404).json({ error: "Extension introuvable" });
        const card = ext.cards.find(c => c.id === cardId);
        if (!card) return res.status(404).json({ error: "Carte introuvable" });

        const listing = listingRepo.save({
            seller_id: req.user.id,
            seller_username: req.user.username,
            extension_id: extensionId,
            extension_name: ext.name,
            card_id: cardId,
            card_name: card.name,
            card_image: card.image || "",
            card_rarity: card.rarity,
            price: parseFloat(price),
            currency: currency || "€",
            mode,
            end_time: endTime ? new Date(endTime).getTime() : null
        });
        res.status(201).json(listing);
    });

    app.post("/api/listings/:id/bid", authMiddleware, (req, res) => {
        const listing = listingRepo.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: "Listing introuvable" });
        if (listing.mode !== "auction") return res.status(400).json({ error: "Pas une enchère" });
        if (listing.status !== "active") return res.status(400).json({ error: "Enchère terminée" });
        if (listing.seller_id === req.user.id)
            return res.status(403).json({ error: "Vous ne pouvez pas enchérir sur votre propre vente" });

        const { amount } = req.body;
        if (!amount || isNaN(amount)) return res.status(400).json({ error: "Montant invalide" });

        const highestBid = listing.bids.length > 0
            ? Math.max(...listing.bids.map(b => b.amount))
            : listing.price - 0.01;
        if (parseFloat(amount) <= highestBid)
            return res.status(400).json({ error: `L'offre doit dépasser ${highestBid}` });

        const bid = listingRepo.addBid(listing.id, {
            bidder_id: req.user.id,
            bidder_username: req.user.username,
            amount: parseFloat(amount)
        });
        res.status(201).json(bid);
    });

    // Admin routes
    app.get("/api/admin/extensions", adminMiddleware, (req, res) => {
        res.json(extensionRepo.findAll());
    });

    app.post("/api/admin/extensions", adminMiddleware, (req, res) => {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: "Nom requis" });
        const ext = extensionRepo.save({ name, description: description || "" });
        res.status(201).json(ext);
    });

    app.post("/api/admin/extensions/:extId/cards", adminMiddleware, (req, res) => {
        const { name, image, rarity } = req.body;
        if (!name) return res.status(400).json({ error: "Nom de carte requis" });
        const card = extensionRepo.addCard(req.params.extId, { name, image: image || "", rarity: rarity || "commune" });
        res.status(201).json(card);
    });

    appInstance = app;
    return app;
}

module.exports = { createApp };
