const { genId } = require("./utils");

class CartRepository {
    constructor(db) { this.db = db; }

    findByUser(userId) {
        return { userId, items: this.db.query("SELECT * FROM cart_items WHERE user_id=? ORDER BY added_at DESC", [userId]) };
    }

    addItem(userId, item) {
        const c = { id: genId(), user_id: userId, added_at: Date.now(), ...item };
        this.db.run(
            `INSERT OR IGNORE INTO cart_items (id,user_id,listing_id,card_name,card_image,extension_name,price,currency,added_at)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [c.id,c.user_id,c.listing_id,c.card_name,c.card_image,c.extension_name,c.price,c.currency,c.added_at]
        );
        return this.findByUser(userId);
    }

    removeItem(userId, listingId) {
        this.db.run("DELETE FROM cart_items WHERE user_id=? AND listing_id=?", [userId, listingId]);
    }

    clear(userId) { this.db.run("DELETE FROM cart_items WHERE user_id=?", [userId]); }
}

module.exports = CartRepository;
