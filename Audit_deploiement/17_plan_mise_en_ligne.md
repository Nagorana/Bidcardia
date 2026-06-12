# 17_plan_mise_en_ligne.md

## Plan de mise en ligne — TCG Marketplace

---

## Étapes réalisées

### 1. Préparation du backend
- Migration de `better-sqlite3` → `sqlite3` → `pg` (PostgreSQL)
- Réécriture de `db.js` en async/await avec le driver `pg`
- Correction du port par défaut (`3002` → `3001`)
- Correction du CORS (`localhost:3001` → `localhost:3000` en local)

### 2. Création de la base PostgreSQL sur Render
- Création d'un service PostgreSQL Free tier sur Render
- Région : Frankfurt (EU)
- Récupération de l'Internal URL et External URL
- Ajout de `DATABASE_URL` dans les variables d'environnement Render

### 3. Configuration des variables d'environnement
- Backend Render : `PORT`, `FRONTEND_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, `NODE_ENV`
- Frontend Vercel : `REACT_APP_API_URL=https://projet-bidcarda-finale.onrender.com/api`

### 4. Déploiement backend sur Render
- Repository GitHub connecté à Render
- Branche : `main`
- Build command : `npm install`
- Start command : `node server.js`
- Premier démarrage : tables créées automatiquement + admin créé

### 5. Déploiement frontend sur Vercel
- Repository GitHub connecté à Vercel
- Branche : `main`
- Build command : `npm run build`
- Framework : Create React App (détecté automatiquement)
- Corrections ESLint appliquées pour passer le build CI

### 6. Vérification de la communication
- Test endpoint `/api/health` → `{"ok":true}`
- Test inscription → token JWT reçu
- Test connexion → utilisateur authentifié
- Test marché → données chargées depuis PostgreSQL

---

## Schéma de déploiement simplifié

```
Developer (local)
      │
      │ git push origin main
      ▼
   GitHub
   ├──────────────────────────────────┐
   ▼                                  ▼
Vercel (auto-deploy)           Render (auto-deploy)
npm run build                  npm install
→ build/ static files          node server.js
→ https://...vercel.app        → https://...onrender.com
```
