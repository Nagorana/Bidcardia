# 01_fiche_projet.md

## Nom du projet
TCG Marketplace — Marché de cartes à collectionner en ligne

## Objectif
Permettre aux utilisateurs d'acheter, vendre et enchérir sur des cartes à collectionner (TCG).
Le projet propose un marché en temps réel avec deux modes de vente : achat direct et enchères.

## Technologies

### Front-end
- React.js (Create React App)
- React Router v6
- CSS modules personnalisés
- Fetch API (communication avec le backend)

### Back-end
- Node.js + Express.js
- SQLite (via fichier `tcg.db`)
- JWT (authentification)
- bcryptjs (hachage des mots de passe)
- dotenv (variables d'environnement)

### Base de données
- SQLite — fichier local `Backend/data/tcg.db`

## État d'avancement
Projet fonctionnel en développement local.
Fonctionnalités implémentées :
- Authentification (inscription / connexion / JWT)
- Marché public avec filtres et recherche
- Mise en vente de cartes (achat direct ou enchère)
- Système d'enchères avec timer en temps réel
- Panier (partiellement implémenté)
- Interface d'administration (gestion des extensions et cartes)

Fonctionnalités incomplètes :
- Panier déconnecté de l'API backend (utilise encore localStorage)
- Page `Vendre.jsx` vide
- Paiement non implémenté

## Présence du front-end
Oui — dossier `src/` avec React

## Présence du back-end
Oui — dossier `Backend/` avec Express

## Présence d'une base de données
Oui — SQLite, fichier `Backend/data/tcg.db`
