const { genId } = require("./utils");

class UserRepository {
    constructor(db) { this.db = db; }

    findAll()          { return this.db.query("SELECT * FROM users"); }
    findByEmail(e)     { return this.db.queryOne("SELECT * FROM users WHERE email = ?", [e]); }
    findById(id)       { return this.db.queryOne("SELECT * FROM users WHERE id = ?", [id]); }
    findByUsername(u)  { return this.db.queryOne("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [u]); }
    findAdminByRole()  { return this.db.queryOne("SELECT * FROM users WHERE role = 'admin'"); }

    save(data) {
        const user = { id: genId(), created_at: Date.now(), role: "user", ...data };
        this.db.run(
            "INSERT INTO users (id,email,username,password,role,created_at) VALUES (?,?,?,?,?,?)",
            [user.id, user.email, user.username, user.password, user.role, user.created_at]
        );
        return user;
    }

    updateCredentials(id, email, hashedPassword) {
        this.db.run("UPDATE users SET email=?, password=? WHERE id=?", [email, hashedPassword, id]);
    }
}

module.exports = UserRepository;
