---
name: Client généré et résolution Metro
description: Pourquoi un aperçu mobile peut rester incomplet après une génération API réussie.
---

Le nettoyage du client API généré n’est pas atomique pour le processus Metro :
les imports peuvent momentanément disparaître et sa résolution échouée peut
survivre à la recréation des fichiers. Un contrôle TypeScript réussi ne valide
donc pas à lui seul l’état du graphe de modules de l’aperçu.

**Why:** après génération, l’aperçu conservait ses onglets mais perdait son contenu,
alors que les fichiers existaient et que TypeScript réussissait.

**How to apply:** si Metro signale un module généré introuvable après génération,
vérifier le fichier puis renouveler le graphe du workflow Expo avant de modifier
les écrans ou de réinstaller des dépendances.
