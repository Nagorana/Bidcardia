# 12_bilan_preparation.md

## Bilan de préparation — TCG Marketplace

---

## Améliorations réalisées durant cette séance

| Action                                          | Statut      |
|-------------------------------------------------|-------------|
| Correction du port backend (`3002` → `3001`)    | ✅ Fait      |
| Correction du CORS (`3001` → `3000`)            | ✅ Fait      |
| Initialisation du dépôt Git                     | ✅ Fait      |
| Création du `.gitignore`                        | ✅ Fait      |
| Vérification du `env.example`                   | ✅ Fait      |
| Nettoyage de `node_modules` du dépôt            | ✅ Fait      |

---

## Points restants à traiter

| Point                                              | Priorité | Séance |
|----------------------------------------------------|----------|--------|
| Panier (`panier.jsx`) déconnecté de l'API backend  | 🔴 Haute  | 3 / 4  |
| Page `Vendre.jsx` vide                             | 🟠 Moyenne | 3 / 4 |
| Aucune protection de route `/admin` côté React     | 🟠 Moyenne | 4     |
| Aucun test automatisé                              | 🟡 Faible  | 4     |
| Pas de script de lancement unique (concurrently)   | 🟡 Faible  | 3     |

---

## État global du projet

Le projet est désormais **fonctionnel en local** :
- Frontend React accessible sur `http://localhost:3000`
- Backend Express accessible sur `http://localhost:3001`
- Communication front/back opérationnelle (CORS, ports alignés)
- Base de données SQLite initialisée automatiquement au démarrage
- Authentification (register/login/JWT) fonctionnelle
- Marché public et enchères accessibles

Le projet est **partiellement prêt** pour la mise en ligne.
Les corrections bloquantes sont toutes résolues. Les points restants sont des améliorations fonctionnelles et de sécurité à traiter en séance 3 et 4.
