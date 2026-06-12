# 09_gitignore_justification.md

## Justification du .gitignore — TCG Marketplace

---

## Contenu du .gitignore

```
# Dépendances
node_modules/

# Variables d'environnement
.env
.env.local
.env.production

# Base de données locale
Backend/data/tcg.db
Backend/data/*.db

# Build React
build/

# Logs
npm-debug.log*
*.log

# Système
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

---

## Justification de chaque exclusion

| Entrée                  | Raison                                                                           |
|-------------------------|----------------------------------------------------------------------------------|
| `node_modules/`         | Dossier très lourd (centaines de Mo), régénéré avec `npm install`                |
| `.env`                  | Contient des secrets : `JWT_SECRET`, `ADMIN_PASSWORD` — ne jamais commiter       |
| `.env.local`            | Variables locales propres à la machine du développeur                            |
| `.env.production`       | Variables de production sensibles (base de données, clés API)                    |
| `Backend/data/tcg.db`   | Fichier binaire de base de données SQLite, propre à chaque environnement         |
| `build/`                | Dossier généré par `npm run build`, inutile dans le dépôt source                 |
| `*.log`                 | Fichiers de log temporaires sans valeur pour le versionning                      |
| `.DS_Store`             | Fichier système macOS sans utilité dans le projet                                |
| `Thumbs.db`             | Fichier système Windows sans utilité dans le projet                              |
| `.vscode/` / `.idea/`   | Configuration personnelle de l'éditeur, ne doit pas être partagée               |
