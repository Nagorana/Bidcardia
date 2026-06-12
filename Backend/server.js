// server.js — Point d'entrée BidCardia Backend
require("dotenv").config();
const fs      = require("fs");
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");

// Crée data/ si besoin
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const DatabaseConnector    = require("./repository/DatabaseConnector");
const { initDB }           = require("./initDB");
const UserService          = require("./service/UserService");
const ExtensionRepository  = require("./repository/ExtensionRepository");
const ListingRepository    = require("./repository/ListingRepository");
const CartRepository       = require("./repository/CartRepository");
const { authMiddleware, adminMiddleware } = require("./middleware/auth");

const PORT    = process.env.PORT    || 3001;
const SECRET  = process.env.JWT_SECRET || "tcg_secret_dev";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@tcg.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin1234!";

// ─── Démarrage asynchrone ─────────────────────────────────────────────────────
async function start() {

    // 1. Singleton DatabaseConnector (= HibernateConnector.getSession())
    const db = await DatabaseConnector.getInstance();

    // 2. Crée les tables (= hbm2ddl.auto=update)
    initDB(db);

    // 3. Crée/met à jour l'admin depuis le .env
    const userService     = new UserService(db);
    const extensionRepo   = new ExtensionRepository(db);
    const listingRepo     = new ListingRepository(db);
    const cartRepo        = new CartRepository(db);

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

    // ── Auth ───────────────────────────────────────────────────────────────────
    function makeToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, username: user.username, role: user.role },
            SECRET, { expiresIn: "7d" }
        );
    }

    app.post("/api/auth/register", (req, res) => {
        try {
            const user  = userService.register(req.body);
            const token = makeToken(user);
            res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
        } catch (e) {
            res.status(e.message.includes("requis") ? 400 : 409).json({ error: e.message });
        }
    });

    app.post("/api/auth/login", (req, res) => {
        try {
            const user  = userService.login(req.body.email, req.body.password);
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
            res.json({ user: jwt.verify(header.slice(7), SECRET) });
        } catch {
            res.status(401).json({ error: "Token invalide" });
        }
    });

    // ── Admin ──────────────────────────────────────────────────────────────────
    app.get   ("/api/admin/extensions",                    adminMiddleware, (req, res) => res.json(extensionRepo.findAll()));
    app.post  ("/api/admin/extensions",                    adminMiddleware, (req, res) => {
        if (!req.body.name) return res.status(400).json({ error: "Nom requis" });
        res.status(201).json(extensionRepo.save({ name: req.body.name, description: req.body.description || "" }));
    });
    app.put   ("/api/admin/extensions/:id",                adminMiddleware, (req, res) => {
        const ext = extensionRepo.update(req.params.id, req.body);
        if (!ext) return res.status(404).json({ error: "Extension introuvable" });
        res.json(ext);
    });
    app.delete("/api/admin/extensions/:id",                adminMiddleware, (req, res) => {
        extensionRepo.delete(req.params.id);
        res.json({ ok: true });
    });
    app.post  ("/api/admin/extensions/:extId/cards",       adminMiddleware, (req, res) => {
        if (!req.body.name) return res.status(400).json({ error: "Nom de carte requis" });
        res.status(201).json(extensionRepo.addCard(req.params.extId, {
            name: req.body.name, image: req.body.image || "", rarity: req.body.rarity || "commune"
        }));
    });
    app.delete("/api/admin/extensions/:extId/cards/:cardId", adminMiddleware, (req, res) => {
        const ext = extensionRepo.removeCard(req.params.extId, req.params.cardId);
        if (!ext) return res.status(404).json({ error: "Extension introuvable" });
        res.json({ ok: true });
    });

    // ── Listings ───────────────────────────────────────────────────────────────
    app.get("/api/listings/extensions/all", (req, res) => res.json(extensionRepo.findAll()));

    app.get("/api/listings/my/sales", authMiddleware, (req, res) => {
        res.json(listingRepo.findAll().filter(l => l.seller_id === req.user.id));
    });

    app.get("/api/listings/my/bids", authMiddleware, (req, res) => {
        const myBids = [];
        for (const l of listingRepo.findAll()) {
            const bid = l.bids.find(b => b.bidder_id === req.user.id);
            if (bid) {
                const top = Math.max(...l.bids.map(b => b.amount));
                myBids.push({ listing: l, myBid: bid, isWinning: bid.amount === top });
            }
        }
        res.json(myBids);
    });

    app.get("/api/listings", (req, res) => {
        const now = Date.now();
        res.json(listingRepo.findActive().map(l => {
            if (l.mode === "auction" && l.end_time && now > l.end_time && l.status === "active") {
                listingRepo.update(l.id, { status: "ended" });
                return { ...l, status: "ended" };
            }
            return l;
        }));
    });

    app.get("/api/listings/:id", (req, res) => {
        const l = listingRepo.findById(req.params.id);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        res.json(l);
    });

    app.post("/api/listings", authMiddleware, (req, res) => {
        const { extensionId, cardId, price, currency, mode, endTime } = req.body;
        if (!extensionId || !cardId || !price || !mode)
            return res.status(400).json({ error: "Champs requis manquants" });
        if (!["immediate","auction"].includes(mode))
            return res.status(400).json({ error: "Mode invalide" });
        if (mode === "auction" && !endTime)
            return res.status(400).json({ error: "Une enchère nécessite une date de fin" });
        if (endTime && new Date(endTime).getTime() < Date.now())
            return res.status(400).json({ error: "La date de fin est dans le passé" });
        const ext  = extensionRepo.findById(extensionId);
        if (!ext)  return res.status(404).json({ error: "Extension introuvable" });
        const card = ext.cards.find(c => c.id === cardId);
        if (!card) return res.status(404).json({ error: "Carte introuvable" });
        res.status(201).json(listingRepo.save({
            seller_id: req.user.id, seller_username: req.user.username,
            extension_id: extensionId, extension_name: ext.name,
            card_id: cardId, card_name: card.name, card_image: card.image, card_rarity: card.rarity,
            price: parseFloat(price), currency: currency || "€", mode,
            end_time: endTime ? new Date(endTime).getTime() : null
        }));
    });

    app.delete("/api/listings/:id", authMiddleware, (req, res) => {
        const l = listingRepo.findById(req.params.id);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        if (l.seller_id !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ error: "Non autorisé" });
        listingRepo.update(req.params.id, { status: "cancelled" });
        res.json({ ok: true });
    });

    app.post("/api/listings/:id/bid", authMiddleware, (req, res) => {
        const l = listingRepo.findById(req.params.id);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        if (l.mode !== "auction")   return res.status(400).json({ error: "Pas une enchère" });
        if (l.status !== "active")  return res.status(400).json({ error: "Enchère terminée" });
        if (l.end_time && Date.now() > l.end_time) return res.status(400).json({ error: "Enchère expirée" });
        if (l.seller_id === req.user.id) return res.status(403).json({ error: "Vous ne pouvez pas enchérir sur votre propre vente" });
        const { amount } = req.body;
        if (!amount || isNaN(amount)) return res.status(400).json({ error: "Montant invalide" });
        const top = l.bids.length > 0 ? Math.max(...l.bids.map(b => b.amount)) : l.price - 0.01;
        if (parseFloat(amount) <= top)
            return res.status(400).json({ error: `L'offre doit dépasser ${top} ${l.currency}` });
        res.status(201).json(listingRepo.addBid(l.id, {
            bidder_id: req.user.id, bidder_username: req.user.username, amount: parseFloat(amount)
        }));
    });

    app.get("/api/listings/:id/bids", authMiddleware, (req, res) => {
        const l = listingRepo.findById(req.params.id);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        if (l.seller_id !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ error: "Non autorisé" });
        const sorted = [...l.bids].sort((a, b) => b.amount - a.amount);
        res.json({ bids: sorted, highestBid: sorted[0] || null });
    });

    app.post("/api/listings/:id/accept-bid", authMiddleware, (req, res) => {
        const l = listingRepo.findById(req.params.id);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        if (l.seller_id !== req.user.id) return res.status(403).json({ error: "Non autorisé" });
        if (!l.bids.length) return res.status(400).json({ error: "Aucune offre reçue" });
        const best    = [...l.bids].sort((a, b) => b.amount - a.amount)[0];
        const updated = listingRepo.update(l.id, { status: "sold", winner_id: best.bidder_id, winner_username: best.bidder_username, winner_amount: best.amount });
        res.json({ ok: true, winner: best, listing: updated });
    });

    // ── Cart ───────────────────────────────────────────────────────────────────
    app.get("/api/cart", authMiddleware, (req, res) =>
        res.json(cartRepo.findByUser(req.user.id))
    );

    app.post("/api/cart/add", authMiddleware, (req, res) => {
        const l = listingRepo.findById(req.body.listingId);
        if (!l) return res.status(404).json({ error: "Listing introuvable" });
        if (l.mode !== "immediate") return res.status(400).json({ error: "Seuls les achats immédiats vont au panier" });
        if (l.status !== "active")  return res.status(400).json({ error: "Ce listing n'est plus disponible" });
        if (l.seller_id === req.user.id) return res.status(403).json({ error: "Vous ne pouvez pas acheter votre propre carte" });
        res.json(cartRepo.addItem(req.user.id, {
            listing_id: req.body.listingId, card_name: l.card_name, card_image: l.card_image,
            extension_name: l.extension_name, price: l.price, currency: l.currency
        }));
    });

    app.delete("/api/cart/:listingId", authMiddleware, (req, res) => {
        cartRepo.removeItem(req.user.id, req.params.listingId);
        res.json({ ok: true });
    });

    app.post("/api/cart/checkout", authMiddleware, (req, res) => {
        const cart = cartRepo.findByUser(req.user.id);
        if (!cart.items.length) return res.status(400).json({ error: "Panier vide" });
        for (const item of cart.items) listingRepo.update(item.listing_id, { status: "sold" });
        cartRepo.clear(req.user.id);
        res.json({ ok: true, message: "Commande validée !", itemCount: cart.items.length });
    });

    // ── Listen ─────────────────────────────────────────────────────────────────
    app.listen(PORT, () => {
        console.log(`🚀 Backend BidCardia sur http://localhost:${PORT}`);
    });
}

start().catch(err => {
    console.error("❌ Erreur démarrage :", err);
    process.exit(1);
});
