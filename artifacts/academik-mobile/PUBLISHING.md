# Academik — étapes restantes de publication

## Origine de production

L’origine publiée vérifiée est `https://academik.fr`.
`EXPO_PUBLIC_DOMAIN=academik.fr` est configuré pour les builds de production ;
le script de développement conserve explicitement son domaine de développement.
Les écrans et identifiants natifs restent dans `app.json`, sans configuration
Expo dynamique ni changement du bundle/package `fr.academik.app`.

La présence d’un HTTP 200 sur une URL ne prouve pas qu’un nouvel endpoint API est
publié : le site peut retourner sa page HTML par défaut. Vérifier le type et le
contenu JSON, notamment pour les nouveaux endpoints.

## Activer les remboursements

Le code reçoit `CANCELLATION` et `REFUND_REVERSED` pour les trois consommables
Academik, depuis les applications RevenueCat autorisées seulement. Les
abonnements, les autres produits/projets et Stripe web ne sont pas retraités.

1. Faire approuver la règle par le propriétaire puis définir le paramètre serveur
   non secret `IAP_REFUND_POLICY` :
   - `carry_debt` : retrait intégral, solde éventuellement négatif ; les prochains
     crédits compensent le déficit. Aucun prélèvement d’argent supplémentaire.
   - `cap_zero` : retrait limité au solde restant ; les crédits déjà utilisés ne
     sont pas récupérés.
   **Choix approuvé : `carry_debt`, désormais configuré dans l’environnement.**
2. Republier l’API avec les secrets serveur existants, notamment `SESSION_SECRET`.
   La publication reste une action déclenchée par le propriétaire.
3. Exécuter :
   `pnpm --filter @workspace/api-server exec tsx scripts/configure-revenuecat-webhook.ts`
4. Le script vérifie le projet Academik, envoie un test authentifié à
   `https://academik.fr/api/iap/webhook`, vérifie la règle réellement publiée,
   puis crée/met à jour uniquement l’intégration nommée `Academik credit refunds`.
   Aucun jeton ou secret retourné par RevenueCat n’est affiché.
5. Effectuer un remboursement Apple sandbox puis Google sandbox, contrôler
   l’historique et le solde, puis répéter la notification sans second retrait.
   Contrôler les tentatives/reprises dans le tableau de bord RevenueCat.

L’autorisation de notification est un jeton HMAC dérivé de `SESSION_SECRET` avec
un contexte distinct des sessions, transmis seulement à RevenueCat sur HTTPS.
Le serveur le compare en temps constant. Toute rotation de `SESSION_SECRET`
nécessite de relancer la configuration et d’en vérifier le résultat.
La signature HMAC du corps RevenueCat peut être activée en plus : renseigner son
secret dans `REVENUECAT_WEBHOOK_SIGNING_SECRET` via le stockage sécurisé, jamais
dans le chat ni dans le client. Si ce secret existe, la signature sur les octets
bruts et sa date sont obligatoirement vérifiées (tolérance cinq minutes).

Une notification n’est acquittée qu’après la transaction validée. Les échecs
renvoient 503 pour permettre les reprises RevenueCat ; ne pas ignorer les échecs
qui persistent au-delà de sa fenêtre de reprise. Les identifiants de notifications
et d’achats sont hachés ; les états techniques ne figurent pas dans l’historique
utilisateur. Aucun changement de schéma ni suppression de table n’est nécessaire.

## Vérifications automatisées

- `RUN_NATIVE_REFUND_TEST=1 pnpm --filter @workspace/api-server exec tsx --test src/native-refunds.test.ts`
- `RUN_NATIVE_SMOKE=1 pnpm --filter @workspace/api-server exec tsx --test src/native-smoke.test.ts`
- `pnpm --filter @workspace/academik-mobile exec tsc --noEmit`

Les tests utilisent des comptes jetables sur la base de développement, sans
paiement réel ni e-mail. Ils couvrent authentification/signature, appels HTTP du
webhook, catalogue RevenueCat en lecture, doublons, événements désordonnés,
retrait plafonné/intégral, annulation du remboursement, achat non encore crédité,
compte supprimé et concurrence avec les dépenses/ajouts.

## Apple et Google

Les comptes développeur, contrats, prix/pays, identité légale, déclarations
confidentialité/âge et droits de la marque nécessitent confirmation du propriétaire.
Les références créées dans RevenueCat ne remplacent pas les produits des consoles.
Consulter aussi `STORE-READINESS.md` pour la matrice de recette sur appareils signés.

Replit propose le parcours Expo Launch pour les builds et la soumission iOS,
à déclencher dans l’interface de publication ; ne pas utiliser EAS CLI.
La publication Google Play n’est actuellement pas prise en charge par ce parcours
intégré. Le projet Android est présent, mais la création/distribution du binaire et
sa soumission Google Play doivent suivre un parcours externe approprié.

L’acceptation appartient aux stores. Aucun test navigateur ni bundle JavaScript
ne remplace un build signé, les essais sur appareils et la revue Apple/Google.
