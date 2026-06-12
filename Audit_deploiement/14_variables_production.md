# 14_variables_production.md

## Variables d'environnement — Local vs Production

---

## Tableau comparatif

| Variable           | Valeur locale                              | Valeur production                                      | Obligatoire |
|--------------------|--------------------------------------------|--------------------------------------------------------|-------------|
| `PORT`             | `3001`                                     | Attribuée automatiquement par Render                   | Non         |
| `FRONTEND_URL`     | `http://localhost:3000`                    | `https://projet-bidcarda-finale.vercel.app`            | Oui         |
| `JWT_SECRET`       | `changez_ce_secret_en_production_svp`      | Chaîne longue et aléatoire                             | Oui         |
| `ADMIN_EMAIL`      | `admin@tcg.local`                          | `admin@tcg.local`                                      | Non         |
| `ADMIN_PASSWORD`   | `Admin1234!`                               | `Admin1234!`                                           | Non         |
| `DATABASE_URL`     | External URL PostgreSQL Render             | Internal URL PostgreSQL Render                         | Oui         |
| `NODE_ENV`         | Non défini (development par défaut)        | `production`                                           | Oui         |
| `REACT_APP_API_URL`| `http://localhost:3001/api`                | `https://projet-bidcarda-finale.onrender.com/api`      | Oui         |

---

## Différences clés local / production

| Point                  | Local                        | Production                              |
|------------------------|------------------------------|-----------------------------------------|
| Base de données        | SQLite (fichier local)       | PostgreSQL (Render, persistant)         |
| URL API                | localhost:3001               | onrender.com (HTTPS)                    |
| SSL PostgreSQL         | Désactivé                    | Activé (`rejectUnauthorized: false`)    |
| DATABASE_URL           | External URL                 | Internal URL (réseau interne Render)    |
| CORS                   | localhost:3000               | vercel.app (domaine public)             |

---

## Localisation des variables

- **Backend local** : `Backend/.env` (non commité)
- **Backend production** : Render → Settings → Environment Variables
- **Frontend local** : `.env` à la racine (non commité)
- **Frontend production** : Vercel → Settings → Environment Variables
