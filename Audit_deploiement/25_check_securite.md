# 25_check_securite.md

## Check sécurité — TCG Marketplace

---

## Vérifications effectuées

| Vérification                              | Statut      | Commentaire                                              |
|-------------------------------------------|-------------|----------------------------------------------------------|
| Secrets absents du dépôt Git              | ✅ OK        | `.env` dans `.gitignore`, non commité                    |
| JWT_SECRET non exposé                     | ✅ OK        | Variable d'environnement Render, non visible dans le code |
| Mots de passe hashés en base              | ✅ OK        | `bcryptjs` avec salt 10                                  |
| Routes admin protégées                    | ✅ OK        | `adminMiddleware` vérifie `role === 'admin'`             |
| Routes authentifiées protégées            | ✅ OK        | `authMiddleware` vérifie le JWT sur toutes les routes sensibles |
| CORS restreint                            | ✅ OK        | Seul le domaine Vercel est autorisé en production        |
| Route temporaire /reset-admin supprimée   | ✅ OK        | Supprimée après utilisation                              |
| Mots de passe admin par défaut            | ⚠️ Attention | `Admin1234!` — à changer en production réelle            |
| Validation des données entrantes          | ⚠️ Partiel   | Vérifications présentes mais pas de sanitisation avancée |
| HTTPS activé                              | ✅ OK        | Vercel et Render fournissent HTTPS automatiquement       |
| Données sensibles dans les logs           | ✅ OK        | Aucun log de mot de passe ou token                       |
| Protection injection SQL                  | ✅ OK        | Requêtes paramétrées avec `$1, $2...` (pg)               |

---

## Points à améliorer (hors scope du TP)

- Changer le mot de passe admin par défaut
- Ajouter une validation plus stricte des entrées (ex: longueur max, format email)
- Mettre en place un rate limiting sur les routes d'authentification
- Ajouter une expiration de session côté front (token refresh)
