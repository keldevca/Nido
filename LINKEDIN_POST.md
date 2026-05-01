# 📣 Post LinkedIn — Nido

---

## Version courte (recommandée — meilleur taux d'engagement)

🐦 J'ai construit **Nido** : une app web auto-hébergée pour gérer la liste de courses et les tâches partagées avec ma blonde.

Le déclic : on en avait marre de faire l'aller-retour entre Notes, Reminders et SMS. Tu modifies la liste sur ton téléphone, l'autre la voit immédiatement. Tu coches le lait, l'autre reçoit une notif.

**Ce qu'il y a dedans :**
🛒 Liste de courses avec calcul automatique des taxes québécoises (TPS + TVQ uniquement sur les articles taxables, selon les règles de Revenu Québec)
✅ Tâches partagées avec priorité, lieu, assigné·e, échéance
🔔 Cloche de notifications + push natif quand l'autre fait un changement
📱 PWA installable sur iPhone / Android — icône sur l'écran d'accueil, plein écran, badge sur l'icône
🔒 Authentification deux comptes
🐳 Déploiement Docker Compose en une commande

**Stack :** Next.js 14 (App Router), TypeScript, Prisma + PostgreSQL, NextAuth, Tailwind, SWR pour la synchro temps réel via polling.

Quelques trucs intéressants découverts en route :
→ Faire fonctionner Next.js derrière un sous-chemin nginx (`/Nido/`) avec basePath, ce n'est pas trivial — le `redirect()` serveur, les fetchs client, NextAuth et les cookies se comportent tous différemment
→ La Badging API (`navigator.setAppBadge`) qui met le petit chiffre rouge sur l'icône fonctionne sur iOS 16.4+ une fois la PWA installée
→ Le multi-stage Docker build avec Prisma — il faut copier le bon dossier `node_modules/prisma` pour que `migrate deploy` fonctionne au démarrage

Code public sous licence MIT 👇
🔗 https://github.com/<votre-username>/nido

#NextJS #TypeScript #SelfHosted #PWA #SideProject #Postgres #Docker

---

## Version longue (si tu veux raconter plus)

🐦 Petit projet perso terminé : **Nido**, une app web pour gérer la liste de courses et les tâches partagées avec ma blonde.

**Le problème :** on jonglait entre Notes Apple, Reminders, captures d'écran sur iMessage… Bref, c'était le bordel pour quelque chose d'aussi simple que « est-ce que tu as pris le pain ? ».

**La solution :** une PWA auto-hébergée sur mon serveur, accessible des deux téléphones, avec synchro automatique toutes les 5 secondes et notifications natives.

🛒 **Liste de courses**
- Catégories (Fruits & légumes, Pharmacie, Vêtements…)
- Calcul automatique des taxes québécoises : TPS 5 % + TVQ 9,975 % uniquement sur les articles taxables (selon les règles de Revenu Québec — un steak n'est pas taxé, une bouteille de Coke oui)
- Cocher un article = barré pour l'autre instantanément

✅ **Tâches partagées**
- Priorité (haute / normale / basse), lieu, assigné·e (toi / ta blonde / ensemble), date limite
- Filtre par personne
- Tri auto par priorité

🔔 **Notifications**
- Cloche dans le header avec compteur d'activité
- Notification navigateur native quand l'autre modifie quelque chose
- Badge sur l'icône de l'app (le petit chiffre rouge) sur iOS 16.4+ via la Badging API

📱 **Installable comme une vraie app**
- Sur iPhone : Safari → Partager → "Sur l'écran d'accueil"
- Plein écran, icône custom, gestion de la safe-area pour l'encoche

**Stack :** Next.js 14 (App Router, output standalone), TypeScript, Prisma 5 + PostgreSQL 16, NextAuth v4, Tailwind, Framer Motion, SWR. Le tout déployé via Docker Compose derrière nginx, sur mon homelab.

**Trucs appris en route :**

1️⃣ **Next.js sous un sous-chemin (`basePath`) c'est un terrier de lapin.** Le `redirect()` côté serveur, les `fetch()` côté client, les cookies NextAuth, les redirections de slash de Next vs nginx… chacun a son comportement et ils peuvent boucler entre eux. J'ai dû ajouter `skipTrailingSlashRedirect` pour tuer une boucle de redirection nginx ↔ Next.

2️⃣ **`NEXT_PUBLIC_*` au build time avec Docker.** Comme Next.js inline ces variables dans le bundle client à la compilation, il faut les passer comme `ARG` Docker et `ENV` avant le `npm run build`. Une fois compris ça simplifie beaucoup.

3️⃣ **PWA + iOS = niveau de détails.** `viewport-fit: cover`, `apple-mobile-web-app-capable`, `safe-area-inset-*`, taille minimum 180×180 pour l'apple-touch-icon, taille de police ≥ 16px sinon iOS zoom les inputs au focus… Plein de petits détails qui font la différence.

4️⃣ **Prisma dans Docker standalone.** Pour faire tourner `prisma migrate deploy` au démarrage du container, il faut copier `node_modules/prisma`, `node_modules/@prisma` et `node_modules/.prisma` séparément, et lancer via `node ./node_modules/prisma/build/index.js migrate deploy` plutôt que le binaire shell qui référence des `.wasm` par chemin relatif.

Code public, licence MIT, contributions bienvenues 👇
🔗 https://github.com/<votre-username>/nido

Si vous avez des projets perso similaires partagés en couple / colocation, ça m'intéresse — j'imagine pas être le seul à m'être tapé ce problème 😅

#NextJS #TypeScript #SelfHosted #PWA #SideProject #Postgres #Docker #FullStack #WebDev
