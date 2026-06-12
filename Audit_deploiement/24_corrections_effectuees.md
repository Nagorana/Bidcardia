# 24_corrections_effectuees.md

## Corrections effectuées — TCG Marketplace

---

## Correction 1 — Suppression route /reset-admin ✅

**Fichier modifié :** `Backend/server.js`

**Action :** Suppression du bloc de route temporaire `GET /api/reset-admin` ajouté lors du débogage du compte admin.

**Résultat :** La route n'est plus accessible. Le compte admin reste en base avec les bonnes données.

---

## Correction 2 — Rôle admin dans localStorage ✅

**Fichier modifié :** `src/pages/login.jsx`

**Cause identifiée :** Après la connexion, le code stockait bien le `token` mais pas l'objet `user` dans localStorage. La fonction `authAPI.getUser()` lisait `localStorage.getItem("user")` qui était `null`, retournant `undefined`.

**Correction appliquée :**
```js
// Avant (manquait cette ligne pour l'admin)
localStorage.setItem("token", data.token);

// Après (les deux lignes présentes)
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
```

**Résultat :** Connexion admin reconnue, bouton ⚙️ Admin visible dans la sidebar, accès à `/admin` fonctionnel.

---

## Récapitulatif

| Correction                         | Fichier modifié        | Statut   |
|------------------------------------|------------------------|----------|
| Suppression route /reset-admin     | Backend/server.js      | ✅ Fait   |
| Stockage user dans localStorage    | src/pages/login.jsx    | ✅ Fait   |
| Documentation cold start           | Ce fichier             | ✅ Fait   |
