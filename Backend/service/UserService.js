// service/UserService.js
// Équivalent de UserService.java (ProjetBachelor)

const bcrypt = require("bcryptjs");
const UserRepository = require("../repository/UserRepository");

class UserService {
    constructor(db) {
        this.userRepository = new UserRepository(db);
    }

    register({ email, password, username }) {
        if (!email || !password || !username) throw new Error("Email, pseudo et mot de passe requis");
        if (this.userRepository.findByEmail(email))    throw new Error("Email déjà utilisé");
        if (this.userRepository.findByUsername(username)) throw new Error("Ce pseudo est déjà pris");
        const hashed = bcrypt.hashSync(password, 10);
        return this.userRepository.save({ email, username, password: hashed });
    }

    login(email, password) {
        const user = this.userRepository.findByEmail(email);
        if (!user) throw new Error("Identifiants incorrects");
        if (!bcrypt.compareSync(password, user.password)) throw new Error("Identifiants incorrects");
        return user;
    }

    findById(id)       { return this.userRepository.findById(id); }
    findByEmail(email) { return this.userRepository.findByEmail(email); }

    // Crée l'admin au 1er démarrage, MET À JOUR ses credentials aux suivants
    ensureAdmin(email, plainPassword) {
        const hashed   = bcrypt.hashSync(plainPassword, 10);
        const existing = this.userRepository.findAdminByRole();
        if (!existing) {
            this.userRepository.save({ email, username: "Admin", password: hashed, role: "admin" });
            console.log(`✅ Admin créé : ${email}`);
        } else {
            this.userRepository.updateCredentials(existing.id, email, hashed);
            console.log(`✅ Admin prêt : ${email}`);
        }
    }
}

module.exports = UserService;
