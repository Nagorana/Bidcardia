# 07_nettoyage_effectue.md

## Nettoyage du projet — TCG Marketplace

---

## Actions effectuées

### Fichiers supprimés / exclus
| Élément                  | Action              | Raison                                                    |
|--------------------------|---------------------|-----------------------------------------------------------|
| `node_modules/`          | Exclu du dépôt      | Dossier très lourd, régénéré via `npm install`            |
| `.env`                   | Exclu du dépôt      | Contient des secrets (JWT_SECRET, mot de passe admin)     |
| `Backend/data/tcg.db`    | Exclu du dépôt      | Fichier binaire de base de données, local uniquement      |

### Fichiers corrigés
| Fichier                  | Correction apportée                                                      |
|--------------------------|--------------------------------------------------------------------------|
| `Backend/server.js`      | PORT par défaut corrigé : `3002` → `3001`                                |
| `Backend/server.js`      | CORS par défaut corrigé : `localhost:3001` → `localhost:3000`            |

### Fichiers incomplets identifiés
| Fichier           | État              | Action prévue                        |
|-------------------|-------------------|--------------------------------------|
| `src/pages/Vendre.jsx` | Fichier vide | À compléter ou supprimer             |
| `src/pages/panier.jsx` | Déconnecté de l'API | À relier à `/api/cart`          |

---

## État après nettoyage

Le projet est plus propre et fonctionnel :
- Le frontend React démarre sur `http://localhost:3000`
- Le backend Express démarre sur `http://localhost:3001`
- Les deux communiquent correctement (CORS résolu)
- La base de données SQLite s'initialise automatiquement au démarrage
