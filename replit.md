# Academik

Site de recherche bibliographique académique : recherche d’articles, bibliographies
APA/Vancouver/MLA/Chicago, analyses, synthèses et achat de crédits.

## Démarrage

Les services utilisent les workflows gérés par leurs artifacts :

- `artifacts/academik: web` — site existant à `/`.
- `artifacts/api-server: API Server` — serveur Express à `/api`, ainsi que sitemap,
  robots et vérifications Google/Bing.

Après installation des dépendances, démarrer ces deux workflows. Ne pas lancer
`pnpm dev` à la racine.

## Structure

- `artifacts/academik/` : interface React/Vite originale, styles Tailwind 3,
  traductions, pages légales et pages de référencement.
- `artifacts/api-server/src/` : routes, authentification email/mot de passe,
  administration, recherche et services de messagerie existants.
- `lib/db/` : connexion PostgreSQL et schéma actif.
- `lib/academik-shared/` : modèles et constantes partagés sans connexion PostgreSQL.
- `.migration-backup/` : copie originale préservée.

## Choix de migration

Le site conserve son client React Query et ses appels HTTP existants. Les routes
historiques sont enregistrées directement sur Express pour préserver les sessions
et leurs chemins. Aucun remplacement par les hooks générés n’est nécessaire pour
cette migration.

Les polices Inter/Lora, les styles, les logos et les autres ressources visuelles
proviennent du site original. Le site n’a pas été redessiné.

## Vérification

Avec les deux workflows démarrés :

```sh
node artifacts/api-server/scripts/migration-smoke.mjs
```

Le test crée un compte synthétique vérifié sans envoyer d’email, contrôle la
connexion, la session, les crédits et le cycle de sauvegarde des bibliographies,
puis supprime ses propres données.

Limite préexistante constatée dans la base de développement : la table historique
`invoices` ne possède pas les colonnes `stripe_session_id` et `credits` attendues
par le code original. Le test ne valide donc pas la consultation des factures
authentifiées. Les paiements réels, les emails et les générations IA payantes ne
sont pas déclenchés par le test.
