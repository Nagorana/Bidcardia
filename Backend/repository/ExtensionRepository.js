const { genId } = require("./utils");

class ExtensionRepository {
    constructor(db) { this.db = db; }

    findAll() {
        return this.db.query("SELECT * FROM extensions ORDER BY created_at DESC").map(ext => ({
            ...ext, cards: this.db.query("SELECT * FROM cards WHERE extension_id = ?", [ext.id])
        }));
    }

    findById(id) {
        const ext = this.db.queryOne("SELECT * FROM extensions WHERE id = ?", [id]);
        if (!ext) return null;
        ext.cards = this.db.query("SELECT * FROM cards WHERE extension_id = ?", [id]);
        return ext;
    }

    save(data) {
        const ext = { id: genId(), created_at: Date.now(), description: "", ...data };
        this.db.run("INSERT INTO extensions (id,name,description,created_at) VALUES (?,?,?,?)",
            [ext.id, ext.name, ext.description, ext.created_at]);
        return { ...ext, cards: [] };
    }

    update(id, data) {
        const allowed = ["name","description"];
        const filtered = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
        if (!Object.keys(filtered).length) return this.findById(id);
        const fields = Object.keys(filtered).map(k => `${k}=?`).join(",");
        this.db.run(`UPDATE extensions SET ${fields} WHERE id=?`, [...Object.values(filtered), id]);
        return this.findById(id);
    }

    delete(id) { this.db.run("DELETE FROM extensions WHERE id=?", [id]); }

    addCard(extId, cardData) {
        const card = { id: genId(), extension_id: extId, rarity: "commune", image: "", ...cardData };
        this.db.run("INSERT INTO cards (id,extension_id,name,image,rarity) VALUES (?,?,?,?,?)",
            [card.id, card.extension_id, card.name, card.image, card.rarity]);
        return card;
    }

    removeCard(extId, cardId) {
        this.db.run("DELETE FROM cards WHERE id=? AND extension_id=?", [cardId, extId]);
        return this.findById(extId);
    }
}

module.exports = ExtensionRepository;
