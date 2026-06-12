# 22_priorisation.md

## Priorisation des anomalies — TCG Marketplace

---

## Classement par criticité

| Priorité | Anomalie                              | Type          | Justification                                          |
|----------|---------------------------------------|---------------|--------------------------------------------------------|
| 🔴 1      | Route /reset-admin publique           | Sécurité      | Faille critique : réinitialisation admin sans auth     |
| 🔴 2      | Rôle admin non reconnu (localStorage) | Bloquante     | Fonctionnalité admin inaccessible                      |
| 🟡 3      | Cold start Render                     | Performance   | Comportement normal du free tier, non bloquant         |

---

## Détail de la priorisation

### Priorité 1 — Route /reset-admin (SÉCURITÉ)
La route expose une action critique sans aucune protection. En production, n'importe quel utilisateur peut appeler `GET /api/reset-admin` et réinitialiser le mot de passe admin. C'est la priorité absolue.

**Action : supprimer immédiatement du code et redéployer.**

### Priorité 2 — Rôle admin non reconnu (BLOQUANTE)
Sans rôle admin, il est impossible de créer des extensions et des cartes depuis l'interface. Le marché est donc vide et inutilisable pour un démo ou une soutenance.

**Action : corriger le stockage du `user` dans localStorage après connexion admin.**

### Priorité 3 — Cold start Render (AMÉLIORATION)
Le service Render Free tier se met en veille automatiquement. Ce n'est pas un bug mais une limitation du plan gratuit. Acceptable pour un projet étudiant.

**Action : documenter le comportement, ou utiliser un service de ping externe pour maintenir le service actif.**
