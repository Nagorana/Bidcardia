# 19_bilan_mise_en_ligne.md

## Bilan de mise en ligne — TCG Marketplace

---

## Ce qui est déployé et fonctionnel

| Fonctionnalité                    | Statut      | URL / Commentaire                              |
|-----------------------------------|-------------|------------------------------------------------|
| Frontend accessible               | ✅ OK        | https://projet-bidcarda-finale.vercel.app      |
| Backend accessible                | ✅ OK        | https://projet-bidcarda-finale.onrender.com    |
| Health check                      | ✅ OK        | /api/health → `{"ok":true}`                   |
| Base de données PostgreSQL        | ✅ OK        | Tables créées, données persistantes            |
| Inscription utilisateur           | ✅ OK        | /api/auth/register                             |
| Connexion utilisateur             | ✅ OK        | /api/auth/login → JWT retourné                 |
| Dashboard / Marché public         | ✅ OK        | Cartes chargées depuis PostgreSQL              |
| Panier connecté à l'API           | ✅ OK        | Plus de localStorage pour les données         |
| Page Vendre                       | ✅ OK        | Formulaire + liste des ventes actives          |
| Communication HTTPS front → back  | ✅ OK        | CORS configuré, JWT transmis                   |

---

## Ce qui reste à corriger (séance 4)

| Problème                          | Priorité    | Description                                    |
|-----------------------------------|-------------|------------------------------------------------|
| Rôle admin non reconnu front      | 🔴 Haute     | `localStorage.getItem("user")` = undefined après connexion admin |
| Route `/api/reset-admin` active   | 🟠 Moyenne  | Route temporaire à supprimer du code           |

---

## Points techniques résolus durant le déploiement

1. **Migration SQLite → PostgreSQL** : `better-sqlite3` incompatible avec les environnements sans Python/node-gyp
2. **Correction CORS** : origin mal configurée bloquait toutes les requêtes front
3. **Correction port** : incohérence 3001/3002 entre `api.js` et `server.js`
4. **Fix REACT_APP_API_URL** : `/api` manquant dans l'URL de base
5. **Fix ESLint CI** : `useEffect` avec dépendances manquantes bloquaient le build Vercel
6. **Panier** : reconnecté à l'API `/api/cart` au lieu du localStorage

---

## Prêt pour séance 4

Le projet est **déployé et majoritairement fonctionnel** en production. Il reste un bug d'authentification admin à corriger et la route temporaire à supprimer.
