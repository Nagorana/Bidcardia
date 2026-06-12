# 16_build_et_publication.md

## Build et publication — TCG Marketplace

---

## Build Frontend (React)

### Commande
```bash
npm run build
```

### Résultat
Génère un dossier `build/` contenant les fichiers statiques optimisés :
```
build/
├── static/
│   ├── js/      ← JavaScript minifié et bundlé
│   ├── css/     ← CSS minifié
│   └── media/   ← Images, fonts
└── index.html   ← Point d'entrée HTML
```

### Points d'attention
- La variable `REACT_APP_API_URL` doit être définie **avant** le build
- Sur Vercel, les variables d'environnement sont injectées au moment du build automatiquement
- Le build échoue si ESLint détecte des erreurs (Vercel met `CI=true`)

---

## Déploiement Backend (Render)

### Commande de démarrage
```bash
node server.js
```

### Processus Render
1. Render détecte un push sur la branche `main`
2. Installe les dépendances : `npm install`
3. Lance le serveur : `node server.js`
4. `initDB()` crée les tables PostgreSQL si elles n'existent pas
5. `initAdmin()` crée le compte admin si absent

---

## Résultats de build observés

| Étape                        | Résultat    | Commentaire                                        |
|------------------------------|-------------|----------------------------------------------------|
| `npm run build` (local)      | ✅ Succès    | Build généré en ~30 secondes                       |
| Déploiement Vercel           | ✅ Succès    | Après correction ESLint et REACT_APP_API_URL       |
| Démarrage Render             | ✅ Succès    | Tables PostgreSQL initialisées au premier run      |
| Connexion front → back       | ✅ Succès    | Après correction port et CORS                      |

---

## Erreurs rencontrées et résolues

| Erreur                              | Cause                              | Solution                              |
|-------------------------------------|------------------------------------|---------------------------------------|
| `npm` non reconnu                   | Node.js absent sur le PC           | Installation Node.js LTS              |
| `better-sqlite3` incompatible       | Version Node différente            | Migration vers `sqlite3` puis `pg`    |
| ESLint bloque le build Vercel       | `CI=true` + warnings hooks         | Correction `useEffect` avec `useCallback` |
| CORS bloqué                         | Mauvais port dans server.js        | Correction `FRONTEND_URL`             |
| `REACT_APP_API_URL` sans `/api`     | URL incomplète                     | Ajout de `/api` à la fin de l'URL     |
