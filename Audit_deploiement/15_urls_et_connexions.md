# 15_urls_et_connexions.md

## URLs et connexions — TCG Marketplace

---

## URLs de production

| Service    | URL                                                         |
|------------|-------------------------------------------------------------|
| Frontend   | https://projet-bidcarda-finale.vercel.app                  |
| Backend    | https://projet-bidcarda-finale.onrender.com                 |
| Health     | https://projet-bidcarda-finale.onrender.com/api/health      |

---

## Endpoints API critiques

| Méthode | Route                              | Auth requise | Description                    |
|---------|------------------------------------|--------------|--------------------------------|
| POST    | /api/auth/register                 | Non          | Inscription                    |
| POST    | /api/auth/login                    | Non          | Connexion + token JWT          |
| GET     | /api/auth/me                       | Oui (JWT)    | Profil utilisateur             |
| GET     | /api/listings                      | Non          | Marché public                  |
| GET     | /api/listings/extensions/all       | Non          | Extensions + cartes            |
| POST    | /api/listings                      | Oui          | Mettre une carte en vente      |
| POST    | /api/listings/:id/bid              | Oui          | Enchérir                       |
| GET     | /api/cart                          | Oui          | Panier                         |
| POST    | /api/cart/add                      | Oui          | Ajouter au panier              |
| DELETE  | /api/cart/:listingId               | Oui          | Retirer du panier              |
| POST    | /api/cart/checkout                 | Oui          | Valider la commande            |
| GET     | /api/admin/extensions              | Admin        | Gérer les extensions           |
| POST    | /api/admin/extensions              | Admin        | Créer une extension            |
| POST    | /api/admin/extensions/:id/cards    | Admin        | Ajouter une carte              |
| GET     | /api/health                        | Non          | Vérification état backend      |

---

## Ports

| Environnement | Frontend | Backend |
|---------------|----------|---------|
| Local         | 3000     | 3001    |
| Production    | 443 (HTTPS via Vercel) | 443 (HTTPS via Render) |

---

## Connexion base de données

| Environnement | Type d'URL          | SSL    |
|---------------|---------------------|--------|
| Local         | External URL Render | Non    |
| Production    | Internal URL Render | Oui    |
