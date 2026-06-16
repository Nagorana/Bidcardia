const request = require("supertest");
const { createApp } = require("../app");

let app;
let userToken;
let adminToken;
let extId;
let cardId;
let listingId;
let auctionId;

beforeAll(async () => {
    app = await createApp();
});

// ─── Authentification ──────────────────────────────────────────────────────────

describe("Auth", () => {
    test("POST /api/auth/register — inscription réussie", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@bidcardia.fr", password: "Test1234!", username: "TestUser" });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe("user");
        userToken = res.body.token;
    });

    test("POST /api/auth/register — email déjà utilisé → 409", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "test@bidcardia.fr", password: "Test1234!", username: "AutreUser" });
        expect(res.status).toBe(409);
    });

    test("POST /api/auth/register — champs manquants → 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "incomplet@bidcardia.fr" });
        expect(res.status).toBe(400);
    });

    test("POST /api/auth/login — connexion réussie", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@bidcardia.fr", password: "Test1234!" });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test("POST /api/auth/login — mauvais mot de passe → 401", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "test@bidcardia.fr", password: "mauvais" });
        expect(res.status).toBe(401);
    });

    test("POST /api/auth/login — admin → role admin", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "admin@tcg.local", password: "Admin1234!" });
        expect(res.status).toBe(200);
        expect(res.body.user.role).toBe("admin");
        adminToken = res.body.token;
    });

    test("GET /api/auth/me — token valide → infos utilisateur", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("test@bidcardia.fr");
    });

    test("GET /api/auth/me — sans token → 401", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

describe("Admin — Extensions & Cartes", () => {
    test("POST /api/admin/extensions — admin crée une extension", async () => {
        const res = await request(app)
            .post("/api/admin/extensions")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Écarlate & Violet", description: "Série test" });
        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Écarlate & Violet");
        extId = res.body.id;
    });

    test("POST /api/admin/extensions — non-admin → 403", async () => {
        const res = await request(app)
            .post("/api/admin/extensions")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ name: "Test" });
        expect(res.status).toBe(403);
    });

    test("POST /api/admin/extensions/:extId/cards — admin ajoute une carte", async () => {
        const res = await request(app)
            .post(`/api/admin/extensions/${extId}/cards`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ name: "Pikachu ex", rarity: "rare" });
        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Pikachu ex");
        cardId = res.body.id;
    });
});

// ─── Listings ─────────────────────────────────────────────────────────────────

describe("Listings", () => {
    test("GET /api/listings — liste publique accessible sans token", async () => {
        const res = await request(app).get("/api/listings");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/listings — créer une vente directe", async () => {
        const res = await request(app)
            .post("/api/listings")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ extensionId: extId, cardId, price: 15.00, mode: "immediate" });
        expect(res.status).toBe(201);
        expect(res.body.mode).toBe("immediate");
        listingId = res.body.id;
    });

    test("POST /api/listings — créer une enchère", async () => {
        const endTime = new Date(Date.now() + 3600000).toISOString();
        const res = await request(app)
            .post("/api/listings")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ extensionId: extId, cardId, price: 5.00, mode: "auction", endTime });
        expect(res.status).toBe(201);
        expect(res.body.mode).toBe("auction");
        auctionId = res.body.id;
    });

    test("POST /api/listings — sans token → 401", async () => {
        const res = await request(app)
            .post("/api/listings")
            .send({ extensionId: extId, cardId, price: 10, mode: "immediate" });
        expect(res.status).toBe(401);
    });

    test("GET /api/listings/:id — récupérer un listing existant", async () => {
        const res = await request(app).get(`/api/listings/${listingId}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(listingId);
    });

    test("GET /api/listings/:id — listing inexistant → 404", async () => {
        const res = await request(app).get("/api/listings/id-inexistant");
        expect(res.status).toBe(404);
    });
});

// ─── Enchères ─────────────────────────────────────────────────────────────────

describe("Enchères", () => {
    let bidderToken;

    beforeAll(async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "bidder@bidcardia.fr", password: "Bidder123!", username: "Bidder" });
        bidderToken = res.body.token;
    });

    test("POST /api/listings/:id/bid — enchère valide", async () => {
        const res = await request(app)
            .post(`/api/listings/${auctionId}/bid`)
            .set("Authorization", `Bearer ${bidderToken}`)
            .send({ amount: 10.00 });
        expect(res.status).toBe(201);
        expect(res.body.amount).toBe(10);
    });

    test("POST /api/listings/:id/bid — montant insuffisant → 400", async () => {
        const res = await request(app)
            .post(`/api/listings/${auctionId}/bid`)
            .set("Authorization", `Bearer ${bidderToken}`)
            .send({ amount: 5.00 });
        expect(res.status).toBe(400);
    });

    test("POST /api/listings/:id/bid — enchérir sur sa propre annonce → 403", async () => {
        const res = await request(app)
            .post(`/api/listings/${auctionId}/bid`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({ amount: 50.00 });
        expect(res.status).toBe(403);
    });

    test("POST /api/listings/:id/bid — sur une vente directe → 400", async () => {
        const res = await request(app)
            .post(`/api/listings/${listingId}/bid`)
            .set("Authorization", `Bearer ${bidderToken}`)
            .send({ amount: 20.00 });
        expect(res.status).toBe(400);
    });

    test("POST /api/listings/:id/bid — sans token → 401", async () => {
        const res = await request(app)
            .post(`/api/listings/${auctionId}/bid`)
            .send({ amount: 20.00 });
        expect(res.status).toBe(401);
    });
});
