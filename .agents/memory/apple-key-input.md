---
name: Saisie des clés Apple dans les Secrets
description: Un fichier Apple valide peut devenir illisible si ses retours à la ligne sont aplatis lors de la saisie.
---

Un échec de lecture PEM ne signifie pas nécessairement que l'utilisateur a fourni
une mauvaise clé Apple. La saisie d'un Secret peut aplatir les retours à la ligne.

**Why:** la clé fournie était interprétable après remise en forme de son enveloppe
PEM et de ses lignes base64, sans aucun changement des octets cryptographiques.
Demander de recopier plusieurs fois le même fichier n'était pas nécessaire.

**How to apply:** avant de redemander une clé, vérifier sans afficher sa valeur
que l'enveloppe est complète, que le corps est du base64 et qu'une remise en
forme des seuls espaces et retours à la ligne permet une lecture cryptographique.
Ne jamais corriger, deviner ou remplacer les caractères du corps de la clé.
