---
name: Portée native Academik
description: Exigence de parité native et séparation des projets de paiement.
---

L’utilisateur demande Academik en application native Apple et Android, en reprenant
toutes les fonctionnalités déjà disponibles « tous sans exception », et en tenant
compte des exigences des deux stores.

**Why:** l’utilisateur l’a demandé explicitement ; ne pas limiter le travail à une
WebView ou à une simple page de présentation, ni présenter une préparation technique
comme une acceptation acquise des stores.

**How to apply:** contrôler la parité des parcours existants, y compris les fonctions
protégées selon leurs droits, et distinguer ce qui est implémenté de ce qui dépend
des comptes développeur, de leurs déclarations et de la revue des stores.

Utiliser un projet RevenueCat dédié à Academik, sans modifier les projets d’autres
produits présents dans la même connexion.

**Why:** une intégration connectée peut donner accès à plusieurs produits sans
qu’ils fassent partie du périmètre Academik.

**How to apply:** vérifier le nom du projet avant toute modification des ressources
de paiement.

Ne pas supposer que la permission générale « read_write » d’une intégration couvre
tous les scopes RevenueCat, ni qu’une reconnexion ajoute un scope absent.

**Why:** la connexion permettait de gérer le catalogue et de lire les achats, mais
la suppression client renvoyait un 403 exigeant
`customer_information:customers:read_write`, absent des scopes OAuth demandés.

**How to apply:** comparer l’erreur aux scopes réellement demandés avant de proposer
une reconnexion ; pour une capacité absente, utiliser une autorisation adaptée et
les Secrets serveur, jamais une clé intégrée au client ni une fausse réussite.
