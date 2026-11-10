---
name: Différences pnpm entre aperçu et Expo Launch
description: Vérifier les règles de scripts avec la version pnpm du serveur de compilation, pas seulement celle du workspace.
---

Expo Launch peut utiliser une version majeure de pnpm différente de celle du workspace.
Un install local réussi ne suffit donc pas à valider l'installation distante.

**Why:** une compilation iOS utilisait pnpm 11 tandis que le workspace utilisait 10.26.
La liste historique d'autorisation des scripts était ignorée par la version distante.
Un essai isolé avec pnpm 11 a aussi révélé que le contrôle du gestionnaire devait
accepter le marqueur de cycle de vie propre à pnpm quand son user-agent était absent.

**How to apply:** consulter d'abord les journaux Expo Launch, puis vérifier
l'installation avec lockfile figé dans une copie temporaire des manifests, avec
la version majeure distante. Conserver une liste explicite de scripts approuvés ;
ne pas autoriser globalement tous les scripts pour contourner un échec.

Le manifeste Expo utilisé à l'export distant peut être normalisé vers la version
corrective effectivement installée, sans réécrire le specifier du lockfile.

**Why:** l'installation initiale réussissait, mais l'export relançait une
installation figée et refusait un specifier Expo différent entre les deux fichiers.

**How to apply:** si les journaux montrent ce décalage, aligner les déclarations
sur la version déjà résolue, puis vérifier l'installation figée et l'export iOS.
Ne pas désactiver le lockfile figé pour masquer le problème.
