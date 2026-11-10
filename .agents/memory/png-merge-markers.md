---
name: Faux marqueurs Git dans les PNG
description: Le contrôle de résolution peut détecter des marqueurs dans les données compressées d’une image valide.
---

Le contrôle de résolution des conflits peut interpréter des suites d’octets dans
un bloc PNG IDAT comme des marqueurs Git, même après restauration exacte du fichier.

**Why:** Ce cas a bloqué l’intégration d’une sauvegarde alors que les empreintes
Git confirmaient que l’image était identique à l’original.

**How to apply:** Vérifier d’abord la signature PNG et les empreintes des versions.
Si le marqueur est dans IDAT, recompresser sans perte le flux zlib en conservant
toutes les autres données PNG ; vérifier que le flux décompressé est inchangé.
Ne jamais supprimer des octets du fichier ni remplacer l’image par un espace réservé.
