// routes/listings.js
const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const ListingRepository = require("../repository/ListingRepository");
const ExtensionRepository = require("../repository/ExtensionRepository");

const router = express.Router();
const listingRepo = new ListingRepository();
const extRepo = new ExtensionRepository();

// IMPORTANT : routes statiques AVANT /:id
router.get("/extensions/all", (req, res) => {
    res.json(extRepo.findAll());
});

router.get("/my/sales", authMiddleware, (req, res) => {
    const all = listingRepo.findAll();
    res.json(all.filter(l => l.seller_id === req.user.id));
});

router.get("/my/bids", authMiddleware, (req, res) => {
    const all = listingRepo.findAll();
    const myBids = [];
    for (const listing of all) {
        const bid = listing.bids.find(b => b.bidder_id === req.user.id);
        if (bid) {
            const highestBid = Math.max(...listing.bids.map(b => b.amount));
            myBids.push({ listing, myBid: bid, isWinning: bid.amount === highestBid });
        }
    }
    res.json(myBids);
});

router.get("/", (req, res) => {
    const listings = listingRepo.findActive();
    const now = Date.now();
    const result = listings.map(l => {
        if (l.mode === "auction" && l.end_time && now > l.end_time && l.status === "active") {
            listingRepo.update(l.id, { status: "ended" });
            return { ...l, status: "ended" };
        }
        return l;
    });
    res.json(result);
});

router.get("/:id", (req, res) => {
    const listing = listingRepo.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    res.json(listing);
});

router.post("/", authMiddleware, (req, res) => {
    const { extensionId, cardId, price, currency, mode, endTime } = req.body;
    if (!extensionId || !cardId || !price || !mode)
        return res.status(400).json({ error: "Champs requis manquants" });
    if (!["immediate", "auction"].includes(mode))
        return res.status(400).json({ error: "Mode invalide" });
    if (mode === "auction" && !endTime)
        return res.status(400).json({ error: "Une enchère nécessite une date de fin" });
    if (endTime && new Date(endTime).getTime() < Date.now())
        return res.status(400).json({ error: "La date de fin est dans le passé" });

    const ext = extRepo.findById(extensionId);
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
        card_image: card.image,
        card_rarity: card.rarity,
        price: parseFloat(price),
        currency: currency || "€",
        mode,
        end_time: endTime ? new Date(endTime).getTime() : null
    });
    res.status(201).json(listing);
});

router.delete("/:id", authMiddleware, (req, res) => {
    const listing = listingRepo.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    if (listing.seller_id !== req.user.id && req.user.role !== "admin")
        return res.status(403).json({ error: "Non autorisé" });
    listingRepo.update(req.params.id, { status: "cancelled" });
    res.json({ ok: true });
});

router.post("/:id/bid", authMiddleware, (req, res) => {
    const listing = listingRepo.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    if (listing.mode !== "auction") return res.status(400).json({ error: "Pas une enchère" });
    if (listing.status !== "active") return res.status(400).json({ error: "Enchère terminée" });
    if (listing.end_time && Date.now() > listing.end_time)
        return res.status(400).json({ error: "Enchère expirée" });
    if (listing.seller_id === req.user.id)
        return res.status(403).json({ error: "Vous ne pouvez pas enchérir sur votre propre vente" });

    const { amount } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: "Montant invalide" });

    const highestBid = listing.bids.length > 0
        ? Math.max(...listing.bids.map(b => b.amount))
        : listing.price - 0.01;
    if (parseFloat(amount) <= highestBid)
        return res.status(400).json({ error: `L'offre doit dépasser ${highestBid} ${listing.currency}` });

    const bid = listingRepo.addBid(listing.id, {
        bidder_id: req.user.id,
        bidder_username: req.user.username,
        amount: parseFloat(amount)
    });
    res.status(201).json(bid);
});

router.get("/:id/bids", authMiddleware, (req, res) => {
    const listing = listingRepo.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    if (listing.seller_id !== req.user.id && req.user.role !== "admin")
        return res.status(403).json({ error: "Non autorisé" });
    const sorted = [...listing.bids].sort((a, b) => b.amount - a.amount);
    res.json({ bids: sorted, highestBid: sorted[0] || null });
});

router.post("/:id/accept-bid", authMiddleware, (req, res) => {
    const listing = listingRepo.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    if (listing.seller_id !== req.user.id) return res.status(403).json({ error: "Non autorisé" });
    if (listing.bids.length === 0) return res.status(400).json({ error: "Aucune offre reçue" });

    const best = [...listing.bids].sort((a, b) => b.amount - a.amount)[0];
    const updated = listingRepo.update(listing.id, {
        status: "sold",
        winner_id: best.bidder_id,
        winner_username: best.bidder_username,
        winner_amount: best.amount
    });
    res.json({ ok: true, winner: best, listing: updated });
});

module.exports = router;
