const { genId } = require("./utils");

class ListingRepository {
    constructor(db) { this.db = db; }

    #withBids(listings) {
        return listings.map(l => ({
            ...l, bids: this.db.query("SELECT * FROM bids WHERE listing_id=? ORDER BY amount DESC", [l.id])
        }));
    }

    findAll()    { return this.#withBids(this.db.query("SELECT * FROM listings ORDER BY created_at DESC")); }
    findActive() { return this.#withBids(this.db.query("SELECT * FROM listings WHERE status='active' ORDER BY created_at DESC")); }

    findById(id) {
        const l = this.db.queryOne("SELECT * FROM listings WHERE id=?", [id]);
        if (!l) return null;
        l.bids = this.db.query("SELECT * FROM bids WHERE listing_id=? ORDER BY amount DESC", [id]);
        return l;
    }

    save(data) {
        const l = {
            id: genId(), status: "active", created_at: Date.now(),
            end_time: null, winner_id: null, winner_username: null, winner_amount: null,
            card_image: "", card_rarity: "commune", currency: "€", ...data
        };
        this.db.run(
            `INSERT INTO listings (id,seller_id,seller_username,extension_id,extension_name,
             card_id,card_name,card_image,card_rarity,price,currency,mode,end_time,status,created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [l.id,l.seller_id,l.seller_username,l.extension_id,l.extension_name,
             l.card_id,l.card_name,l.card_image,l.card_rarity,l.price,l.currency,
             l.mode,l.end_time,l.status,l.created_at]
        );
        return { ...l, bids: [] };
    }

    update(id, data) {
        const allowed = ["status","winner_id","winner_username","winner_amount"];
        const filtered = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
        if (!Object.keys(filtered).length) return this.findById(id);
        const fields = Object.keys(filtered).map(k => `${k}=?`).join(",");
        this.db.run(`UPDATE listings SET ${fields} WHERE id=?`, [...Object.values(filtered), id]);
        return this.findById(id);
    }

    addBid(listingId, bid) {
        const b = { id: genId(), listing_id: listingId, placed_at: Date.now(), ...bid };
        this.db.run(
            "INSERT INTO bids (id,listing_id,bidder_id,bidder_username,amount,placed_at) VALUES (?,?,?,?,?,?)",
            [b.id, b.listing_id, b.bidder_id, b.bidder_username, b.amount, b.placed_at]
        );
        return b;
    }
}

module.exports = ListingRepository;
