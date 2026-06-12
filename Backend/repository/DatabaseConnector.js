// repository/DatabaseConnector.js
// Pattern Singleton — équivalent de HibernateConnector.java (ProjetBachelor)

const fs   = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "bidcardia.db");

class DatabaseConnector {
    static #instance = null;
    #db  = null;
    #SQL = null;

    constructor() {
        if (DatabaseConnector.#instance) throw new Error("Utilisez DatabaseConnector.getInstance()");
    }

    async #init() {
        const initSqlJs = require("sql.js");
        this.#SQL = await initSqlJs();
        if (fs.existsSync(DB_PATH)) {
            this.#db = new this.#SQL.Database(fs.readFileSync(DB_PATH));
        } else {
            this.#db = new this.#SQL.Database();
        }
        this.#db.run("PRAGMA foreign_keys = ON");
    }

    #save() {
        fs.writeFileSync(DB_PATH, Buffer.from(this.#db.export()));
    }

    static async getInstance() {
        if (!DatabaseConnector.#instance) {
            const conn = new DatabaseConnector();
            await conn.#init();
            DatabaseConnector.#instance = conn;
        }
        return DatabaseConnector.#instance;
    }

    // SELECT — retourne un tableau d'objets
    query(sql, params = []) {
        const stmt = this.#db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
    }

    // SELECT une ligne
    queryOne(sql, params = []) {
        return this.query(sql, params)[0] || null;
    }

    // INSERT / UPDATE / DELETE — sauvegarde sur disque
    run(sql, params = []) {
        this.#db.run(sql, params);
        this.#save();
    }

    // Transaction atomique (BEGIN / COMMIT / ROLLBACK)
    transaction(fn) {
        this.#db.run("BEGIN");
        try {
            fn();
            this.#db.run("COMMIT");
            this.#save();
        } catch (err) {
            try { this.#db.run("ROLLBACK"); } catch {}
            throw err;
        }
    }
}

module.exports = DatabaseConnector;
