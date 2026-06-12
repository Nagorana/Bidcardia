# 08_etat_git.md

## État du dépôt Git — TCG Marketplace

---

## Vérification de l'état Git

```bash
cd "Projet a jour Mars"
git init
git status
```

---

## Résultat

Le projet ne possédait pas de dépôt Git initialisé lors de l'export.
Git a été initialisé manuellement avec les commandes suivantes :

```bash
git init
git add .
git commit -m "Initial commit — TCG Marketplace"
```

---

## État du dépôt après initialisation

| Élément              | État         | Commentaire                                      |
|----------------------|--------------|--------------------------------------------------|
| Git initialisé       | ✅ Oui        | Dépôt local créé avec `git init`                 |
| Premier commit       | ✅ Effectué   | Tous les fichiers sources versionnés             |
| `.gitignore` présent | ✅ Oui        | Créé lors de cette séance (voir fichier dédié)   |
| Dépôt distant        | ❌ Non        | Pas encore de remote GitHub/GitLab configuré     |
| Branche principale   | ✅ `main`     | Branche par défaut                               |

---

## Commandes exécutées

```bash
git init
git add .
git commit -m "Initial commit — TCG Marketplace"
git branch -M main
```

---

## Prochaine étape
Créer un dépôt distant (GitHub ou GitLab) et y pousser le projet :
```bash
git remote add origin <url_du_depot>
git push -u origin main
```
