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

Le propriétaire dispose d’une adhésion Apple Developer active et d’un compte
Google Play Console actif.

**Why:** il a confirmé explicitement les deux comptes.

**How to apply:** ne pas redemander leur existence ; vérifier séparément les apps,
produits, contrats et liaisons RevenueCat, sans demander les mots de passe en chat.

Le public visé par Academik est « dès 13 ans ». Les tarifs des stores doivent
reprendre ceux du site.

**Why:** le propriétaire a confirmé ces deux choix.

**How to apply:** préparer les fiches des deux stores avec ce public cible et
conserver la cohérence tarifaire avec le catalogue web ; remplir séparément les
questionnaires de classification d’âge et de confidentialité des stores.

Utiliser un projet RevenueCat dédié à Academik, sans modifier les projets d’autres
produits présents dans la même connexion.

**Why:** une intégration connectée peut donner accès à plusieurs produits sans
qu’ils fassent partie du périmètre Academik.

**How to apply:** vérifier le nom du projet avant toute modification des ressources
de paiement.

Conserver la fiche Apple existante avec l’identifiant iOS `app.replit.academik`.
Android conserve `fr.academik.app` ; ne pas renommer les identifiants des produits
d’achat pour simplement les faire ressembler au nouvel identifiant iOS.

**Why:** le propriétaire a explicitement approuvé l’alignement sur son unique fiche
App Store existante, plutôt que la création d’une deuxième application.

**How to apply:** maintenir la cohérence entre la configuration native, la fiche
Apple sélectionnée et l’app iOS RevenueCat, sans toucher aux autres produits.

Ne pas supposer que la permission générale « read_write » d’une intégration couvre
tous les scopes RevenueCat, ni qu’une reconnexion ajoute un scope absent.
La présence d’un secret et la confirmation manuelle d’un changement de droit ne
prouvent pas son activation : contrôler la réponse réelle du fournisseur.

**Why:** la connexion permettait de gérer le catalogue et de lire les achats, mais
la suppression client renvoyait un 403 exigeant
`customer_information:customers:read_write`, absent des scopes OAuth demandés.

**How to apply:** comparer l’erreur aux scopes réellement demandés avant de proposer
une reconnexion ; pour une capacité absente, utiliser une autorisation adaptée et
les Secrets serveur, jamais une clé intégrée au client ni une fausse réussite.
