# 10_variables_environnement.md

## Variables d'environnement — TCG Marketplace

---

## Tableau des variables

| Variable         | Valeur locale              | Valeur production attendue         | Obligatoire |
|------------------|----------------------------|------------------------------------|-------------|
| `PORT`           | `3001`                     | `3001` (ou port attribué par l'hébergeur) | Non (défaut : 3001) |
| `FRONTEND_URL`   | `http://localhost:3000`    | `https://mon-domaine.com`          | Oui         |
| `JWT_SECRET`     | `changez_ce_secret_...`    | Chaîne aléatoire longue et complexe | Oui        |
| `ADMIN_EMAIL`    | `admin@tcg.local`          | Email réel de l'administrateur     | Non (défaut fourni) |
| `ADMIN_PASSWORD` | `Admin1234!`               | Mot de passe fort et unique        | Non (défaut fourni) |

---

## Localisation

Les variables sont définies dans `Backend/.env` (non commité).
Un modèle est disponible dans `Backend/env.example`.

---

## Contenu de env.example

```
# Port du serveur backend
PORT=

# URL du frontend React (pour CORS)
FRONTEND_URL=

# Secret JWT — doit être une chaîne longue et aléatoire en production
JWT_SECRET=

# Compte administrateur créé automatiquement au démarrage
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

## Secrets identifiés

| Variable         | Niveau de sensibilité | Raison                                              |
|------------------|-----------------------|-----------------------------------------------------|
| `JWT_SECRET`     | 🔴 Critique            | Sert à signer tous les tokens d'authentification    |
| `ADMIN_PASSWORD` | 🔴 Critique            | Mot de passe du compte admin créé automatiquement   |
| `ADMIN_EMAIL`    | 🟠 Sensible            | Identifiant du compte administrateur                |

---

## Bonnes pratiques appliquées

- Le fichier `.env` est exclu du dépôt Git via `.gitignore`
- Un fichier `env.example` avec les clés vides est versionné pour guider l'installation
- Les valeurs par défaut en développement sont différentes de celles en production
