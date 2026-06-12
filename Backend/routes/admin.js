// routes/admin.js
const express = require("express");
const { adminMiddleware } = require("../middleware/auth");
const ExtensionRepository = require("../repository/ExtensionRepository");

const router = express.Router();
router.use(adminMiddleware);

const extRepo = new ExtensionRepository();

router.get("/extensions", (req, res) => {
    res.json(extRepo.findAll());
});

router.post("/extensions", (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Nom requis" });
    const ext = extRepo.save({ name, description: description || "" });
    res.status(201).json(ext);
});

router.put("/extensions/:id", (req, res) => {
    const ext = extRepo.update(req.params.id, req.body);
    if (!ext) return res.status(404).json({ error: "Extension introuvable" });
    res.json(ext);
});

router.delete("/extensions/:id", (req, res) => {
    extRepo.delete(req.params.id);
    res.json({ ok: true });
});

router.post("/extensions/:extId/cards", (req, res) => {
    const { name, image, rarity } = req.body;
    if (!name) return res.status(400).json({ error: "Nom de carte requis" });
    const card = extRepo.addCard(req.params.extId, {
        name,
        image: image || "",
        rarity: rarity || "commune"
    });
    res.status(201).json(card);
});

router.delete("/extensions/:extId/cards/:cardId", (req, res) => {
    const ext = extRepo.removeCard(req.params.extId, req.params.cardId);
    if (!ext) return res.status(404).json({ error: "Extension introuvable" });
    res.json({ ok: true });
});

module.exports = router;
