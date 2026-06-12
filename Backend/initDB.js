// initDB.js — Crée les tables (équivalent hbm2ddl.auto=update)

function initDB(db) {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user', created_at INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS extensions (
        id TEXT PRIMARY KEY, name TEXT NOT NULL,
        description TEXT DEFAULT '', created_at INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        extension_id TEXT NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
        name TEXT NOT NULL, image TEXT DEFAULT '', rarity TEXT DEFAULT 'commune'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY, seller_id TEXT NOT NULL REFERENCES users(id),
        seller_username TEXT NOT NULL, extension_id TEXT NOT NULL,
        extension_name TEXT NOT NULL, card_id TEXT NOT NULL,
        card_name TEXT NOT NULL, card_image TEXT DEFAULT '',
        card_rarity TEXT DEFAULT 'commune', price REAL NOT NULL,
        currency TEXT DEFAULT '€',
        mode TEXT NOT NULL CHECK(mode IN ('immediate','auction')),
        end_time INTEGER, status TEXT NOT NULL DEFAULT 'active',
        winner_id TEXT, winner_username TEXT, winner_amount REAL,
        created_at INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        bidder_id TEXT NOT NULL REFERENCES users(id),
        bidder_username TEXT NOT NULL, amount REAL NOT NULL, placed_at INTEGER NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
        listing_id TEXT NOT NULL, card_name TEXT NOT NULL,
        card_image TEXT DEFAULT '', extension_name TEXT NOT NULL,
        price REAL NOT NULL, currency TEXT DEFAULT '€',
        added_at INTEGER NOT NULL, UNIQUE(user_id, listing_id)
    )`);
    console.log("✅ Tables SQLite initialisées");
}

module.exports = { initDB };
