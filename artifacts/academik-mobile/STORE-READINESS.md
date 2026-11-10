# Academik — préparation App Store et Google Play

## État réel

Application Expo/React Native avec écrans natifs, API et données communes au site.
Ce document n’est pas une garantie d’acceptation. La validation finale appartient
à Apple et Google et dépend aussi des comptes développeur, produits et déclarations.

Les offres actuelles sont des **packs ponctuels de crédits consommables** :
10, 30 et 100 crédits. Aucun abonnement récurrent n’a été inventé.
Les identifiants des produits sont `fr.academik.app.starter`,
`fr.academik.app.essentiel`, `fr.academik.app.pro`.

## En place dans le code

- Authentification, inscription/vérification e-mail, récupération de mot de passe.
- Session native stockée dans SecureStore ; identifiant opaque signé, révocable au logout.
- Recherche et filtres, sélection, résumés, synthèse, confrontation, cartographie,
  bibliographie APA/Vancouver/MLA/Chicago, équations, sauvegardes/renommage/suppression.
- Export Word généré par le serveur, copie et partage natifs.
- Administration protégée : statistiques et liste/recherche/pagination des utilisateurs.
- Solde et historique communs au compte ; SDK RevenueCat et prix fournis par le store.
- Aucun checkout Stripe ou lien d’achat externe dans le parcours natif.
- Achat crédité seulement après confirmation RevenueCat pour le compte connecté.
- Attribution atomique, verrou transactionnel et protection contre les doublons.
- Synchronisation fondée sur l’historique RevenueCat vérifié côté serveur, sans
  confondre les identifiants RevenueCat et ceux des stores.
- Test Store interdit sur le serveur en production ; sandbox Apple/Google restreint
  aux comptes de revue explicitement autorisés par `IAP_SANDBOX_REVIEW_USER_IDS`.
- Suppression de compte dans l’application et page web `/suppression-compte`
  permettant une demande sans réinstallation.
- Suppression du client RevenueCat, purge transactionnelle des données locales
  et révocation de toutes les sessions du compte. Une empreinte hachée d’achat
  sans nom/e-mail/lien au compte est conservée pour empêcher le recrédit frauduleux ;
  les obligations de conservation et leurs durées doivent être validées juridiquement.
- Informations légales, assistance, consentement explicite au traitement IA,
  signalement d’un résultat IA dans l’application.
- Icône officielle Academik, identifiants iOS/Android `fr.academik.app`,
  permissions caméra/micro/stockage inutiles bloquées.

## RevenueCat

Projet dédié Academik créé avec applications iOS, Android et Test Store.
Offre `default`, packages `credits_10`, `credits_30`, `credits_100` et produits
consommables associés. Les clés publiques des applications sont des variables Expo.
La clé secrète de l’intégration n’est jamais envoyée au client.

La création de ces références RevenueCat **ne crée pas les produits dans les
consoles Apple et Google** et ne relie pas automatiquement leurs comptes.

La connexion OAuth disponible sait lire les clients/achats et gérer le catalogue,
mais ne demande pas le scope `customer_information:customers:read_write`.
Une simple reconnexion avec les mêmes scopes ne résout pas ce manque.
La purge fournisseur nécessite une clé secrète API v2, limitée au projet Academik
et à cette permission, dans le secret serveur `REVENUECAT_CUSTOMER_DELETE_API_KEY`.
Elle ne doit jamais porter le préfixe `EXPO_PUBLIC_` ni être placée dans le client.
Sans ce droit, la suppression échoue explicitement au lieu de prétendre avoir
supprimé les données conservées chez le fournisseur.
Le secret serveur est désormais configuré et son droit de suppression a été
confirmé par une suppression effective du client RevenueCat de recette.

## Vérifications effectuées

- Contrôle TypeScript mobile et bibliothèques clientes générées réussi ;
  compilation du serveur et du site réussie.
- Bundles JavaScript iOS et Android compilés par Metro. Cela ne constitue pas
  des binaires signés ni une validation TestFlight/Google Play.
- Recette navigateur avec compte jetable : connexion, bibliothèque, renommage,
  ouverture d’une recherche, export Word et recherche réelle avec consentement IA.
- Achat officiel RevenueCat Test Store : ajout de 10 crédits ; deux
  synchronisations serveur successives sans crédit supplémentaire.
- Test API réussi : authentification, sauvegarde/renommage/suppression, export
  Word valide, rejet de faux achats, déconnexion et révocation des sessions.
- Suppression vérifiée pour un compte sans achat et un compte ayant acheté dans
  Test Store : client RevenueCat introuvable après suppression, données locales
  purgées et empreinte anti-rejeu dissociée du compte. Les comptes et identifiants
  de recette ont été nettoyés.

Les corrections de synchronisation et de confirmation de suppression ont été
confirmées côté API et par inspection du code, sans refaire toute la recette
navigateur. Les parcours sur appareils et builds signés restent à exécuter.
Le contrôle TypeScript global de l’API contient encore des erreurs préexistantes
hors de cette implémentation native ; sa compilation et la recette API réussissent.

## Blocages avant soumission — actions du propriétaire

1. Disposer des comptes Apple Developer/App Store Connect et Google Play Console.
   Vérifier propriété de marque, identité développeur, contrats payants,
   coordonnées fiscales et bancaires. Les identifiants d’app doivent être disponibles.
2. Enregistrer les apps et créer les trois produits consommables dans chaque console,
   avec les identifiants exacts ci-dessus, disponibilités/pays, prix, descriptions,
   traductions et captures demandées. Les prix proposés doivent être décidés/confirmés
   dans les stores : l’app affiche leur prix local réel, pas un prix codé en dur.
3. Relier App Store Connect et les autorisations/service account Google Play dans
   RevenueCat ; vérifier les permissions et la synchronisation des produits.
   Ne jamais envoyer ces clés dans le chat ou les mettre dans le client.
4. Configurer des notifications de remboursement/révocation authentifiées et idempotentes,
   ainsi que la politique d’ajustement des crédits déjà consommés.
   Cette automatisation des remboursements n’est pas encore implémentée.
5. Publier l’API et le site sur leur origine HTTPS stable. Les builds de production
   doivent définir `EXPO_PUBLIC_DOMAIN` sur cette origine, **pas le domaine de développement**.
   Publier la politique complète et l’URL `/suppression-compte` et contrôler leur accessibilité.
6. Compléter App Privacy (Apple), Data Safety et Data deletion (Google), en incluant
   compte/e-mail, recherches, achats, OpenAI, RevenueCat, hébergeurs et conservation.
   Faire valider les textes juridiques complets et leur cohérence avec les sous-traitants.
7. Compléter âge/public cible, génération IA, chiffrement/export compliance,
   coordonnées d’assistance, URL de confidentialité, description et captures réelles.
   Confirmer que l’app n’est pas destinée aux enfants avant de déclarer la tranche d’âge.
8. Fournir un compte de revue fonctionnel, les étapes précises de test et les produits
   IAP soumis avec l’app. Ajouter uniquement l’identifiant du compte de revue dans
   `IAP_SANDBOX_REVIEW_USER_IDS` pour autoriser les achats sandbox sur l’API publiée.
9. Vérifier le comportement RevenueCat de restauration/transfert pour conserver
   l’appartenance des achats au bon compte Academik. Les consommables dépensés ne
   se restaurent pas comme une licence permanente ; le solde est conservé côté serveur.
10. Générer et signer les binaires, contrôler les versions SDK/target Android exigées
    par les consoles au jour de la soumission, effectuer les tests de distribution
    imposés au compte, puis soumettre à chaque store. Les captures navigateur et
    bundles JavaScript ne remplacent pas TestFlight ni les tests internes Google Play.

## Matrice de recette sur les builds signés

- iPhone et iPad : inscription, code e-mail, connexion, récupération, déconnexion.
- Android : mêmes parcours et retour système, clavier, zones sûres et partage Word.
- Recherche réelle et opérations IA : crédits insuffisants, réseau interrompu,
  erreurs fournisseur, résultats vides, crédits débités selon le serveur.
- Sauvegarder, retrouver sur un autre appareil/site, renommer, supprimer et exporter.
- Achat sandbox Apple puis Google : succès, annulation, pending, interruption réseau,
  nouvelle tentative de synchronisation, double envoi et changement de compte.
- Vérifier qu’un faux identifiant de transaction ne peut attribuer aucun crédit.
- Vérifier refunds/révocations après implémentation du webhook.
- Suppression du compte et de ses données ; demandes externes et durées légales.
- Accessibilité VoiceOver/TalkBack, tailles de texte, contrastes et langues déclarées.

## Références officielles à contrôler avant envoi

- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://support.google.com/googleplay/android-developer/answer/13327111
- https://support.google.com/googleplay/android-developer/answer/17105854
