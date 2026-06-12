# 02_verification_locale.md

## Commande de lancement

### Front-end
```bash
cd "Projet a jour Mars"
npm install
npm start
```
Lance l'application React sur `http://localhost:3000`

### Back-end
```bash
cd "Projet a jour Mars/Backend"
node server.js
```
Lance le serveur Express sur `http://localhost:3001` 

---

## Résultat du lancement

| Élément                        | Résultat       | Commentaire                                              |
|-------------------------------|----------------|----------------------------------------------------------|
| Front-end démarre             | ✅ Oui          | `npm start` lance React sur le port 3000                 |
| Back-end démarre              | ⚠️ Partiel      | Démarre mais port incohérent (3002 vs 3001 dans api.js)  |
| Page d'accueil s'affiche      | ✅ Oui          | Dashboard visible avec sidebar                           |
| Données du marché chargent    | ❌ Non          | Appels API échouent à cause du mauvais port              |
| Connexion / Inscription       | ⚠️ Partiel      | Formulaires OK, mais requêtes bloquées (port + CORS)     |
| Panier fonctionnel            | ❌ Non          | Lit localStorage au lieu de l'API `/api/cart`            |

---

## Erreurs observées dans la console

1. **`npm` non reconnu** sur le PC de déploiement → Node.js absent, nécessite installation
2. **Port mismatch** : `api.js` appelle `localhost:3001`, `server.js` écoute sur `3002`
3. **CORS bloqué** : `server.js` autorise `localhost:3002` au lieu de `localhost:3000`
4. **Panier vide** : les items ajoutés au panier via l'API ne s'affichent pas dans `panier.jsx`

---

## Routes principales vérifiées

| Route          | Accessible | Commentaire                          |
|----------------|-----------|--------------------------------------|
| `/`            | ✅         | Dashboard avec grille de cartes      |
| `/login`       | ✅         | Formulaire de connexion              |
| `/register`    | ✅         | Formulaire d'inscription             |
| `/panier`      | ⚠️         | S'affiche mais panier toujours vide  |
| `/admin`       | ✅         | Accessible (pas de garde côté React) |
