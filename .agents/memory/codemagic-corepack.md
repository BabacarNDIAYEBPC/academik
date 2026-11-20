---
name: Codemagic et signatures pnpm
description: Erreur de signature Corepack dans les compilations iOS Codemagic.
---

Node 22.11.0 fournit une version de Corepack qui peut ne pas reconnaître les
signatures npm utilisées par les versions récentes de pnpm. L'échec arrive avant
l'installation des dépendances avec `Cannot find matching keyid`.

**Why:** npm a ajouté une nouvelle clé de signature que Corepack antérieur à 0.31
ne connaissait pas. Désactiver le contrôle d'intégrité contournerait une protection
de sécurité au lieu de la réparer.

**How to apply:** dans les scripts Codemagic, installer d'abord Corepack 0.31.0
ou une version ultérieure, puis l'activer et préparer la version pnpm épinglée.
Ne jamais utiliser `COREPACK_INTEGRITY_KEYS=0` comme correctif.

Codemagic peut aussi exécuter les commandes depuis un dossier parent dont le
`package.json` impose Yarn. Corepack peut alors refuser pnpm même après sa mise à
jour.

**Why:** le runner a signalé un `packageManager` Yarn hors du dépôt alors que le
workflow Academik prépare explicitement pnpm.

**How to apply:** pour un workflow qui épingle volontairement pnpm, définir
`COREPACK_ENABLE_PROJECT_SPEC=0` afin que Corepack utilise la version préparée,
sans modifier les manifests du dépôt.
