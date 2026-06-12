# 23_plan_correction.md

## Plan de correction — TCG Marketplace

---

## Plan d'action

| Anomalie                        | Priorité | Cause possible                                      | Correction prévue                                          | Redéploiement |
|---------------------------------|----------|-----------------------------------------------------|------------------------------------------------------------|---------------|
| Route /reset-admin publique     | 🔴 1      | Route temporaire oubliée dans le code               | Supprimer les lignes correspondantes dans `server.js`      | Oui           |
| Rôle admin non reconnu          | 🔴 2      | `login.jsx` ne stocke pas `user` dans localStorage  | Vérifier et corriger le bloc `localStorage.setItem("user", ...)` dans `login.jsx` | Oui |
| Cold start Render               | 🟡 3      | Limitation free tier Render (15min inactivité)      | Documenter / utiliser un cron de ping externe              | Non           |

---

## Détail des corrections

### Correction 1 — Supprimer la route /reset-admin

Dans `server.js`, supprimer le bloc suivant :
```js
// SUPPRIMER CE BLOC ENTIER
app.get("/api/reset-admin", async (req, res) => {
    ...
});
```

### Correction 2 — Rôle admin dans localStorage

Dans `login.jsx`, vérifier que après la réponse du serveur, les deux lignes suivantes sont bien présentes :
```js
const { token, user } = await authAPI.login(email, password);
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));  // ← vérifier cette ligne
```

Si `user` est undefined dans la réponse, vérifier la route `POST /api/auth/login` dans `Backend/routes/auth.js` pour s'assurer qu'elle retourne bien `{ token, user: { id, email, username, role } }`.

### Correction 3 — Cold start (optionnel)

Utiliser un service gratuit comme UptimeRobot pour envoyer une requête `GET /api/health` toutes les 10 minutes et maintenir Render actif.
