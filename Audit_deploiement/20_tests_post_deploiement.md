# 20_tests_post_deploiement.md

## Tests post-déploiement — TCG Marketplace

---

## Grille de tests

| Vérification                              | OK  | KO  | Commentaire                                          |
|-------------------------------------------|-----|-----|------------------------------------------------------|
| L'application s'ouvre                     | ✅  |     | https://projet-bidcarda-finale.vercel.app accessible |
| La route /api/health répond               | ✅  |     | `{"ok":true,"time":"..."}` retourné                 |
| Les routes principales répondent          | ✅  |     | Dashboard, login, register accessibles               |
| L'inscription fonctionne                  | ✅  |     | Compte créé, token JWT reçu                          |
| La connexion fonctionne                   | ✅  |     | Token stocké en localStorage                         |
| Les données s'affichent correctement      | ✅  |     | Dashboard charge les listings depuis PostgreSQL      |
| Le panier fonctionne                      | ✅  |     | Ajout, suppression, checkout via API                 |
| La page Vendre fonctionne                 | ✅  |     | Mise en vente opérationnelle                         |
| Les enchères fonctionnent                 | ✅  |     | Timer affiché, enchères placées                      |
| Les appels API fonctionnent               | ✅  |     | HTTPS front → back opérationnel                      |
| Aucune erreur visible dans la console     |     | ✅  | Erreur rôle admin dans localStorage                 |
| Gestion des erreurs (404/500)             | ✅  |     | Messages d'erreur affichés côté front                |
| Responsive (mobile/tablette)              | ✅  |     | Interface adaptée                                    |
| Connexion admin reconnue                  |     | ✅  | `user` non stocké correctement → rôle non détecté   |

---

## Tests réalisés

### Test 1 — Health check
```
GET https://projet-bidcarda-finale.onrender.com/api/health
→ {"ok":true,"time":"2026-05-26T..."}  ✅
```

### Test 2 — Inscription
```
POST /api/auth/register
Body: { email, password, username }
→ { token: "eyJ...", user: { id, email, username, role } }  ✅
```

### Test 3 — Connexion
```
POST /api/auth/login
→ token JWT reçu et stocké ✅
→ user stocké dans localStorage ✅ (utilisateur normal)
→ user stocké pour admin ❌ (undefined)
```

### Test 4 — Dashboard
```
GET /api/listings
→ Tableau de listings chargé depuis PostgreSQL ✅
```
