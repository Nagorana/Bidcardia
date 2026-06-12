# 03_structure_projet.md

## Arborescence du projet

```
Projet a jour Mars/
│
├── Backend/                        ← Serveur Node.js / Express
│   ├── data/
│   │   └── tcg.db                  ← Base de données SQLite (fichier binaire)
│   ├── middleware/
│   │   └── auth.js                 ← Middleware JWT (vérification token)
│   ├── routes/
│   │   ├── admin.js                ← Routes admin (extensions, cartes)
│   │   ├── auth.js                 ← Routes auth (register, login, me)
│   │   ├── cart.js                 ← Routes panier (add, checkout)
│   │   └── listings.js             ← Routes marché (vente, enchères, bids)
│   ├── db.js                       ← Accès base de données SQLite
│   ├── server.js                   ← Point d'entrée du serveur Express
│   ├── .env                        ⚠️ Fichier de secrets (ne pas commiter)
│   └── env.example                 ← Modèle de variables d'environnement
│
├── src/                            ← Application React (front-end)
│   ├── assets/
│   │   └── logo.png                ← Logo de l'application
│   ├── pages/
│   │   ├── Admin.jsx               ← Interface d'administration
│   │   ├── Dashboard.jsx           ← Marché principal (listing + enchères)
│   │   ├── login.jsx               ← Page de connexion
│   │   ├── register.jsx            ← Page d'inscription
│   │   ├── panier.jsx              ← Page panier (⚠️ incomplète)
│   │   └── Vendre.jsx              ← Page vente (⚠️ fichier vide)
│   ├── styles/
│   │   ├── admin.css
│   │   ├── compte.css              ← Styles login/register
│   │   ├── dashboard.css
│   │   └── panier.css
│   ├── api.js                      ← Fonctions d'appel API centralisées
│   ├── App.js                      ← Routing React + Sidebar
│   ├── App.css                     ← Styles globaux + sidebar
│   └── index.js                    ← Point d'entrée React
│
├── public/
│   └── index.html                  ← Template HTML de base
│
├── node_modules/                   ⚠️ À exclure du dépôt Git
├── package.json                    ← Dépendances et scripts npm
├── package-lock.json
└── .gitignore
```

---

## Analyse de la structure

| Critère                        | Évaluation  | Commentaire                                              |
|-------------------------------|-------------|----------------------------------------------------------|
| Séparation front / back        | ✅ Bonne     | Dossiers `src/` et `Backend/` bien distincts             |
| Routes backend organisées      | ✅ Bonne     | Un fichier par domaine (auth, listings, cart, admin)     |
| Styles séparés par page        | ✅ Bonne     | Dossier `styles/` dédié                                  |
| Fichier `.env` présent         | ⚠️ Attention | Présent mais ne doit pas être commité                    |
| `node_modules` dans le zip     | ❌ Problème  | Dossier inclus dans l'export (très lourd, inutile)       |
| `Vendre.jsx` vide              | ❌ Problème  | Fichier créé mais sans contenu                           |
| README présent                 | ⚠️ Partiel   | README générique de Create React App, non personnalisé   |
