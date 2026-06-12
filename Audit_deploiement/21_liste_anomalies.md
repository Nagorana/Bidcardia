# 21_liste_anomalies.md

## Liste des anomalies détectées — TCG Marketplace

---

## Anomalie 1 — Rôle admin non reconnu côté frontend

**Contexte :** Après connexion avec `admin@tcg.local / Admin1234!`, le bouton Admin n'apparaît pas dans la sidebar et l'accès à `/admin` est refusé.

**Observation :** `localStorage.getItem("user")` retourne `undefined` après la connexion admin, alors que pour un utilisateur normal il retourne bien les données.

**Impact :** Le compte admin est inutilisable depuis l'interface web. Il est impossible de créer des extensions et des cartes.

---

## Anomalie 2 — Route temporaire `/api/reset-admin` toujours active

**Contexte :** Une route de debug a été ajoutée pour forcer la recréation du compte admin en base.

**Observation :** La route `GET /api/reset-admin` est accessible publiquement sans authentification. N'importe qui peut l'appeler et réinitialiser le compte admin.

**Impact :** Faille de sécurité critique en production.

---

## Anomalie 3 — Render endort le service après inactivité

**Contexte :** Render Free tier met en veille le service web après 15 minutes d'inactivité.

**Observation :** Le premier chargement après inactivité prend 30 à 60 secondes (cold start).

**Impact :** Expérience utilisateur dégradée, semblait être une erreur de connexion.

---

## Récapitulatif

| N° | Anomalie                              | Criticité  | Statut      |
|----|---------------------------------------|------------|-------------|
| 1  | Rôle admin non reconnu (localStorage) | 🔴 Haute   | À corriger  |
| 2  | Route /reset-admin publique           | 🔴 Haute   | À supprimer |
| 3  | Cold start Render (inactivité)        | 🟡 Faible  | Connu, acceptable en free tier |
