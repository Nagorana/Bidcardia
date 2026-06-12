# 18_schema_deploiement_final.md

## Schéma final de déploiement — TCG Marketplace

---

## Architecture applicative

```
Front-end  →  API (Back-end)  →  Base de données
```

```
┌─────────────────────┐     HTTPS      ┌─────────────────────┐     SQL      ┌──────────────────────┐
│                     │  /api/...      │                     │   pool.      │                      │
│   React.js          │ ────────────▶  │   Express.js        │  query()     │   PostgreSQL         │
│   Vercel            │                │   Render            │ ───────────▶ │   Render             │
│                     │ ◀────────────  │                     │ ◀─────────── │                      │
│  projet-bidcarda-   │   JSON         │  projet-bidcarda-   │   rows[]     │  dpg-d8bfkjb...      │
│  finale.vercel.app  │                │  finale.onrender.com│              │  tcg_database_fjzc   │
└─────────────────────┘                └─────────────────────┘              └──────────────────────┘
```

---

## Chaîne de déploiement

```
Code source (local)
        │
        │ git add . && git commit -m "..." && git push origin main
        ▼
   GitHub (main branch)
        │
   ┌────┴────┐
   ▼         ▼
Vercel    Render
(front)   (back + DB)
   │         │
   ▼         ▼
Build     npm install
React     node server.js
   │         │
   ▼         ▼
fichiers  API live
statiques + PostgreSQL
```

---

## Variables d'environnement en production

```
Render (Backend)                    Vercel (Frontend)
─────────────────                   ─────────────────
PORT=443 (auto)                     REACT_APP_API_URL=
FRONTEND_URL=https://               https://projet-bidcarda-
  projet-bidcarda-finale.           finale.onrender.com/api
  vercel.app
JWT_SECRET=<secret>
ADMIN_EMAIL=admin@tcg.local
ADMIN_PASSWORD=Admin1234!
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## Tables PostgreSQL créées automatiquement

```
users ──────────────── listings ──── bids
  │                       │
  └── cart_items      extensions ─── cards
```
