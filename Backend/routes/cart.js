// routes/cart.js
const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const CartRepository = require("../repository/CartRepository");
const ListingRepository = require("../repository/ListingRepository");

const router = express.Router();
router.use(authMiddleware);

const cartRepo = new CartRepository();
const listingRepo = new ListingRepository();

router.get("/", (req, res) => {
    res.json(cartRepo.findByUser(req.user.id));
});

router.post("/add", (req, res) => {
    const { listingId } = req.body;
    const listing = listingRepo.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing introuvable" });
    if (listing.mode !== "immediate") return res.status(400).json({ error: "Seuls les achats immédiats vont au panier" });
    if (listing.status !== "active") return res.status(400).json({ error: "Ce listing n'est plus disponible" });
    if (listing.seller_id === req.user.id) return res.status(403).json({ error: "Vous ne pouvez pas acheter votre propre carte" });

    const cart = cartRepo.addItem(req.user.id, {
        listing_id: listingId,
        card_name: listing.card_name,
        card_image: listing.card_image,
        extension_name: listing.extension_name,
        price: listing.price,
        currency: listing.currency
    });
    res.json(cart);
});

router.delete("/:listingId", (req, res) => {
    cartRepo.removeItem(req.user.id, req.params.listingId);
    res.json({ ok: true });
});

router.post("/checkout", (req, res) => {
    const cart = cartRepo.findByUser(req.user.id);
    if (!cart.items.length) return res.status(400).json({ error: "Panier vide" });
    for (const item of cart.items) {
        listingRepo.update(item.listing_id, { status: "sold" });
    }
    cartRepo.clear(req.user.id);
    res.json({ ok: true, message: "Commande validée !", itemCount: cart.items.length });
});

module.exports = router;
