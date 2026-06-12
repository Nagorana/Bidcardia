# 13_architecture_deploiement.md

## Architecture du projet — TCG Marketplace

---

## Architecture applicative

```
Frontend (React)          Backend (Express)         Base de données
──────────────────        ──────────────────        ─────────────────
Vercel                →   Render                →   PostgreSQL (Render)
localhost:3000            localhost:3001             dpg-xxx.render.com
                          
src/
├── pages/            →   /api/auth             →   TABLE users
│   ├── Dashboard          /api/listings         →   TABLE listings
│   ├── login              /api/cart             →   TABLE cart_items
│   ├── register           /api/admin            →   TABLE extensions
│   ├── panier                                   →   TABLE cards
│   ├── Vendre                                   →   TABLE bids
│   └── Admin
├── api.js            →   middleware/auth.js
└── App.js                 (JWT verification)
```

---

## Identification des composants

| Composant        | Technologie         | Hébergement         | Rôle                              |
|------------------|---------------------|---------------------|-----------------------------------|
| Frontend         | React.js (CRA)      | Vercel              | Interface utilisateur             |
| Backend          | Node.js + Express   | Render (Web Service)| API REST, logique métier          |
| Base de données  | PostgreSQL          | Render (PostgreSQL) | Persistance des données           |
| Auth             | JWT + bcryptjs      | Backend             | Authentification et autorisation  |

---

## Services externes

| Service | URL | Usage |
|---------|-----|-------|
| Vercel  | https://projet-bidcarda-finale.vercel.app | Hébergement frontend |
| Render (backend) | https://projet-bidcarda-finale.onrender.com | API REST |
| Render (DB) | dpg-d8bfkjbtqb8s73da4ik0-a | Base PostgreSQL |

---

## Flux de données

```
Utilisateur
    │
    ▼
[Vercel - React]
    │  fetch(/api/...)
    │  Authorization: Bearer <JWT>
    ▼
[Render - Express]
    │  authMiddleware vérifie JWT
    │  pool.query(SQL)
    ▼
[Render - PostgreSQL]
    │  résultat JSON
    ▼
[React - Affichage]
```
