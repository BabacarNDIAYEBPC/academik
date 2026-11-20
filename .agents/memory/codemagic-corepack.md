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
