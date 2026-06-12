# 05_points_bloquants.md

## Points bloquants identifiés — TCG Marketplace

---

### 🔴 Problème 1 — Incohérence de port entre front-end et back-end

**Impact :** Bloquant — aucun appel API ne fonctionne

Le fichier `src/api.js` envoie toutes les requêtes vers `http://localhost:3001`, mais `Backend/server.js` démarre le serveur sur le port `3002` (variable `PORT` ou valeur par défaut).

```js
// api.js
const BASE = "http://localhost:3001/api"; // ← port 3001

// server.js
const PORT = process.env.PORT || 3002;    // ← port 3002
```

**Action prévue :** Aligner les deux sur le même port (ex: `3001`), soit en modifiant `server.js`, soit en ajoutant `PORT=3001` dans le fichier `.env`.

---

### 🔴 Problème 2 — CORS mal configuré

**Impact :** Bloquant — les requêtes du front sont rejetées par le navigateur

Le middleware CORS dans `server.js` autorise uniquement `http://localhost:3002`, alors que React tourne sur `http://localhost:3000`.

```js
// server.js
origin: process.env.FRONTEND_URL || "http://localhost:3002" // ← mauvais port
```

**Action prévue :** Corriger la valeur par défaut à `http://localhost:3000` et utiliser la variable `FRONTEND_URL` dans le `.env`.

---

### 🔴 Problème 3 — Panier déconnecté du back-end

**Impact :** Bloquant — le panier ne conserve rien, le checkout est inutilisable

`panier.jsx` lit et écrit dans `localStorage` au lieu d'utiliser l'API `/api/cart` qui existe pourtant côté backend. Le bouton "Procéder au paiement" n'appelle aucune route.

**Action prévue :** Réécrire `panier.jsx` pour appeler `GET /api/cart`, `DELETE /api/cart/:id` et `POST /api/cart/checkout`.

---

### 🟠 Problème 4 — Aucune protection de route côté front

**Impact :** Important — n'importe qui peut accéder à `/admin` sans être connecté

Il n'existe pas de composant `ProtectedRoute` dans React. Un utilisateur non connecté peut naviguer manuellement vers `/admin`.

**Action prévue :** Créer un composant `ProtectedRoute` qui vérifie le token JWT avant d'afficher la page, et rediriger vers `/login` si absent.

---

### 🟡 Problème 5 — `node_modules` inclus dans l'export et `Vendre.jsx` vide

**Impact :** Mineur pour le fonctionnement, gênant pour le déploiement et la lisibilité

Le dossier `node_modules` (très lourd) est présent dans le ZIP exporté, ce qui ralentit le transfert et encombre inutilement. Par ailleurs, `Vendre.jsx` est un fichier vide référencé dans l'arborescence sans contenu.

**Action prévue :** Ajouter `node_modules/` au `.gitignore`, supprimer le dossier avant tout export. Compléter ou supprimer `Vendre.jsx`.
