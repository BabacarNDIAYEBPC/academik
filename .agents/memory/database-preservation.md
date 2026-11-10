---
name: Préservation des données Academik
description: Contrainte de conservation de la base pendant la migration du site existant.
---

Conserver la base existante sans synchronisation destructive du schéma lors du déplacement du site.

**Why:** La base contient des tables historiques absentes du modèle actif ; un push global pourrait proposer leur suppression. Le déplacement demandé ne nécessite aucun changement de données ou de schéma.

**How to apply:** Pour une évolution ultérieure du schéma, vérifier le diff et conserver toutes les tables non concernées. Ne pas réactiver un push automatique à la fusion sans traiter ce risque.
