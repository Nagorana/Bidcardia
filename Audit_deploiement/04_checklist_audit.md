# 04_checklist_audit.md

## Grille d'audit — TCG Marketplace

| Élément à vérifier                          | Oui | Non | Partiel | Commentaire                                                  |
|--------------------------------------------|-----|-----|---------|--------------------------------------------------------------|
| Le projet se lance en local                | ✅  |     |         | Front React démarre avec `npm start`                         |
| La structure est compréhensible            | ✅  |     |         | Séparation claire `src/` / `Backend/`                        |
| Les dépendances sont identifiées           | ✅  |     |         | `package.json` présent avec toutes les dépendances           |
| Les scripts sont présents                  |     |     | ✅       | `npm start` OK, pas de script pour le backend (`node server.js` manuel) |
| Le README existe                           |     |     | ✅       | README générique CRA, non adapté au projet                   |
| Les variables sont repérées                | ✅  |     |         | `.env` et `env.example` présents dans `Backend/`             |
| Les fichiers sensibles sont isolés         |     |     | ✅       | `.env` présent mais inclus dans l'export ZIP                 |
| Le projet semble publiable                 |     |     | ✅       | Publiable après corrections des points bloquants             |
| L'API front/back communique correctement   |     | ✅  |         | Port mismatch : api.js → 3001, server.js → 3002              |
| Le CORS est correctement configuré         |     | ✅  |         | CORS autorise 3002 au lieu de 3000 (port React)              |
| Le panier est fonctionnel                  |     | ✅  |         | Panier lit localStorage, déconnecté de l'API                 |
| Les routes sont protégées côté front       |     | ✅  |         | `/admin` accessible sans vérification d'authentification     |
| La base de données est accessible          | ✅  |     |         | SQLite présent dans `Backend/data/tcg.db`                    |
| Le `node_modules` est exclu du dépôt       |     | ✅  |         | Inclus dans le ZIP exporté (lourd et inutile)                |
| Les pages sont toutes implémentées         |     |     | ✅       | `Vendre.jsx` est un fichier vide                             |
