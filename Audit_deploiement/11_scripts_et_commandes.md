# 11_scripts_et_commandes.md

## Scripts et commandes — TCG Marketplace

---

## Scripts disponibles

### Frontend (racine du projet)

| Commande        | Description                                      | Résultat              |
|-----------------|--------------------------------------------------|-----------------------|
| `npm install`   | Installe toutes les dépendances frontend         | ✅ Fonctionnel         |
| `npm start`     | Lance React en mode développement sur port 3000  | ✅ Fonctionnel         |
| `npm run build` | Génère le build de production dans `/build`      | ✅ Fonctionnel         |
| `npm test`      | Lance les tests React (aucun test écrit)         | ⚠️ Aucun test défini  |

### Backend (`Backend/`)

| Commande              | Description                                  | Résultat        |
|-----------------------|----------------------------------------------|-----------------|
| `npm install`         | Installe les dépendances backend             | ✅ Fonctionnel   |
| `node server.js`      | Lance le serveur Express sur port 3001       | ✅ Fonctionnel   |
| `npm run dev`         | Non défini (pas de nodemon configuré)        | ❌ Inexistant    |

---

## Procédure de lancement complète

```bash
# 1. Installer les dépendances frontend
cd "Projet a jour Mars"
npm install

# 2. Installer les dépendances backend
cd Backend
npm install

# 3. Créer le fichier .env backend (depuis le modèle)
cp env.example .env
# Puis remplir les valeurs dans .env

# 4. Lancer le backend (Terminal 1)
cd Backend
node server.js

# 5. Lancer le frontend (Terminal 2)
cd "Projet a jour Mars"
npm start
```

---

## Points d'attention

- `better-sqlite3` nécessite une recompilation native sur un nouveau PC → remplacé par `sqlite3`
- Le backend doit être lancé **avant** le frontend pour éviter les erreurs d'API au démarrage
- Deux terminaux sont nécessaires pour faire tourner le projet complet
- Pas de script `concurrently` configuré pour lancer les deux en une seule commande
