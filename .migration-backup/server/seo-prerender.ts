import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const BASE_URL = "https://academik.fr";

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  contentHtml?: string;
}

interface ModuleSEO {
  slug: string;
  titleFr: string;
  subtitleFr: string;
  detailsFr: string;
  benefitsFr: string[];
  price?: string;
  category: string;
  faqFr?: { q: string; a: string }[];
}

const MODULE_SEO_DATA: ModuleSEO[] = [
  { slug: "memoire", titleFr: "Rédaction de Mémoire", subtitleFr: "Structurez et rédigez votre mémoire de master ou licence avec un accompagnement méthodologique complet.", detailsFr: "Academik accompagne les étudiants en licence et master dans la rédaction de leur mémoire. Notre plateforme propose une approche structurée : vous définissez votre sujet, formulez votre problématique, construisez vos hypothèses, puis Academik vous guide à travers chaque étape — du plan de travail à la rédaction finale.", benefitsFr: ["Formulation de la problématique et des hypothèses", "Génération du plan structuré adapté à votre domaine", "Construction du cadre théorique et conceptuel", "Revue de littérature guidée et synthèse", "Méthodologie de recherche", "Rédaction assistée section par section", "Export Word et PDF", "Mémoire contextuelle"], price: "179 €", category: "project-type", faqFr: [{ q: "Combien de temps faut-il pour rédiger un mémoire avec Academik ?", a: "Academik accélère significativement le processus en vous guidant étape par étape. La plupart des étudiants gagnent entre 40% et 60% de temps." }, { q: "Academik rédige-t-il le mémoire à ma place ?", a: "Non. Academik est un outil de méthodologie qui vous accompagne dans la structuration et la rédaction. Vous restez l'auteur de votre travail." }, { q: "Quels types de mémoires sont supportés ?", a: "Mémoires de master, licence, mémoires professionnels, tous domaines : sciences humaines, gestion, santé, droit, ingénierie." }, { q: "Puis-je exporter mon travail en Word ou PDF ?", a: "Oui, Academik permet l'export en Word (.docx) et PDF avec une mise en page académique professionnelle." }] },
  { slug: "tfe-infirmier", titleFr: "TFE Infirmier", subtitleFr: "Rédigez votre Travail de Fin d'Études infirmier avec une méthodologie spécifique aux soins.", detailsFr: "Le TFE est un passage obligé pour tout étudiant en soins infirmiers. Academik propose un parcours dédié qui suit la méthodologie spécifique de l'IFSI.", benefitsFr: ["Situation d'appel et question de départ", "Cadre conceptuel adapté aux soins infirmiers", "Guide d'entretien semi-directif", "Analyse qualitative des verbatims", "Confrontation résultats / littérature", "Validation des hypothèses", "Préparation de la soutenance", "Conforme aux exigences IFSI"], price: "179 €", category: "project-type", faqFr: [{ q: "Academik est-il adapté aux exigences de l'IFSI ?", a: "Oui, le parcours TFE suit la méthodologie spécifique des Instituts de Formation en Soins Infirmiers." }, { q: "Puis-je préparer ma soutenance de TFE ?", a: "Oui, avec le module PowerPoint de soutenance et le simulateur de questions du jury." }] },
  { slug: "these-doctorat", titleFr: "Thèse de Doctorat", subtitleFr: "Structurez votre thèse de doctorat avec une méthodologie de recherche rigoureuse.", detailsFr: "La rédaction d'une thèse de doctorat représente un défi majeur. Academik vous accompagne depuis la définition de votre problématique jusqu'à la préparation de votre soutenance.", benefitsFr: ["Revue de littérature systématique", "Cadre théorique approfondi", "Méthodologie de recherche avancée", "Analyse de données", "Gestion bibliographique multi-normes", "Rédaction structurée par chapitres", "Audit complet du document", "Préparation de la soutenance doctorale"], price: "179 €", category: "project-type", faqFr: [{ q: "Academik peut-il gérer la complexité d'une thèse ?", a: "Oui, avec des fonctionnalités avancées de revue de littérature et de méthodologie." }] },
  { slug: "vae", titleFr: "VAE – Validation des Acquis de l'Expérience", subtitleFr: "Préparez votre dossier VAE avec une cartographie complète de vos compétences.", detailsFr: "La VAE permet d'obtenir un diplôme en valorisant votre expérience professionnelle. Academik vous guide dans la constitution de votre dossier.", benefitsFr: ["Présentation du candidat structurée", "Parcours professionnel et expériences", "Analyse de la motivation", "Cartographie des compétences par blocs", "Démonstration des acquis", "Synthèse et conclusion argumentée", "PowerPoint de soutenance", "Simulation de l'oral VAE"], price: "179 €", category: "project-type", faqFr: [{ q: "Qu'est-ce que la VAE ?", a: "La VAE permet d'obtenir un diplôme en faisant reconnaître les compétences acquises par l'expérience professionnelle." }] },
  { slug: "rapport-de-stage", titleFr: "Rapport de Stage", subtitleFr: "Rédigez votre rapport de stage avec un questionnaire guidé et des sections dédiées.", detailsFr: "Le rapport de stage est un exercice académique reliant théorie et pratique professionnelle. Academik propose un parcours spécifique avec un questionnaire guidé.", benefitsFr: ["Questionnaire guidé", "Présentation de l'entreprise", "Description des missions", "Problématique et objectifs", "Analyse des résultats", "Recommandations", "9 sections dédiées", "Export Word / PDF"], price: "179 €", category: "project-type", faqFr: [{ q: "Quelle est la structure type d'un rapport de stage ?", a: "Introduction, présentation de l'entreprise, description des missions, problématique, analyse, bilan et conclusion." }] },
  { slug: "etude-de-cas", titleFr: "Étude de Cas", subtitleFr: "Analysez et rédigez votre étude de cas avec une structuration méthodique.", detailsFr: "L'étude de cas est une méthode d'analyse qui permet d'examiner en profondeur une situation réelle. Academik propose un parcours structuré avec 8 sections dédiées.", benefitsFr: ["Présentation du contexte", "Diagnostic de la situation", "Sélection d'outils d'analyse", "Analyse approfondie", "Recommandations argumentées", "Plan d'action opérationnel", "8 sections dédiées", "Modules soutenance et audit"], price: "179 €", category: "project-type", faqFr: [{ q: "Quels outils d'analyse sont disponibles ?", a: "SWOT, PESTEL, Porter, chaîne de valeur, matrice BCG et autres." }] },
  { slug: "memoire-professionnel", titleFr: "Mémoire Professionnel", subtitleFr: "Rédigez votre mémoire professionnel en articulant contexte terrain et cadre académique.", detailsFr: "Le mémoire professionnel se distingue par son ancrage dans la pratique terrain. Academik vous aide à articuler votre expérience professionnelle avec un cadre académique solide.", benefitsFr: ["Questionnaire de contexte professionnel", "Analyse du terrain", "Problématique ancrée dans le contexte pro", "Méthodologie appliquée", "Recommandations opérationnelles", "Sections académiques standards", "Articulation théorie / pratique", "Export professionnel"], price: "179 €", category: "project-type" },
  { slug: "problematique", titleFr: "Formulation de la Problématique", subtitleFr: "Formulez une problématique de recherche pertinente, précise et réalisable.", detailsFr: "La problématique est le fil conducteur de tout travail académique. Academik vous aide à transformer votre sujet en une question de recherche structurée.", benefitsFr: ["Analyse guidée de votre sujet", "Identification des tensions", "Formulation en question ouverte", "Validation méthodologique", "Exemples par domaine", "Cohérence avec les hypothèses"], category: "core-feature" },
  { slug: "plan-de-travail", titleFr: "Plan de Travail Structuré", subtitleFr: "Générez un plan de travail adapté à votre type de projet et votre domaine.", detailsFr: "Le plan de travail est la colonne vertébrale de votre mémoire. Academik génère un plan structuré en parties, chapitres et sous-sections.", benefitsFr: ["Plan généré selon le type de projet", "Parties, chapitres et sous-sections", "Articulation logique des idées", "Adaptation au domaine", "Régénération en mode similaire ou différent", "Base pour la rédaction"], category: "core-feature" },
  { slug: "cadre-theorique-conceptuel", titleFr: "Cadre Théorique et Conceptuel", subtitleFr: "Identifiez les concepts clés et théories de référence pour votre recherche.", detailsFr: "Le cadre théorique et conceptuel constitue le socle scientifique de votre travail. Academik vous aide à identifier les concepts clés et les théories de référence.", benefitsFr: ["Identification des concepts clés", "Théories et auteurs de référence", "Articulation des notions", "Distinction cadre théorique / conceptuel", "Contextualisation dans votre domaine", "Cohérence avec la problématique"], category: "core-feature" },
  { slug: "revue-de-litterature", titleFr: "Revue de Littérature", subtitleFr: "Analysez et synthétisez les sources académiques pour votre recherche.", detailsFr: "La revue de littérature est une étape essentielle qui permet de situer votre recherche dans le paysage scientifique existant.", benefitsFr: ["Recherche bibliographique guidée", "Analyse d'articles scientifiques", "Synthèse thématique des sources", "Confrontation des auteurs", "Identification des lacunes", "Bibliographie multi-normes"], category: "core-feature" },
  { slug: "methodologie-recherche", titleFr: "Méthodologie de Recherche", subtitleFr: "Définissez votre approche méthodologique, vos outils de collecte et votre protocole.", detailsFr: "La méthodologie est le cœur scientifique de votre recherche. Academik vous guide dans le choix de votre approche.", benefitsFr: ["Choix de l'approche", "Outils de collecte de données", "Stratégie d'échantillonnage", "Protocole de recherche détaillé", "Justification méthodologique", "Limites et biais identifiés"], category: "core-feature" },
  { slug: "redaction-assistee", titleFr: "Rédaction Assistée", subtitleFr: "Rédigez chaque section dans un registre académique avec reformulation et développement.", detailsFr: "La rédaction assistée d'Academik enrichit votre travail. Reformulation en registre académique, développement des idées, synthèse.", benefitsFr: ["Reformulation académique", "Développement et enrichissement", "Synthèse et condensation", "Correction stylistique", "Historique des versions", "Régénération contrôlée"], category: "core-feature" },
  { slug: "export-word-pdf", titleFr: "Export Word et PDF", subtitleFr: "Exportez votre travail en Word (.docx) ou PDF avec une mise en page professionnelle.", detailsFr: "Exportez en Word ou PDF avec mise en page académique professionnelle. Export section par section ou intégralité du mémoire.", benefitsFr: ["Export Word (.docx)", "Export PDF", "Sommaire automatique", "Mise en page académique", "Export section par section ou complet", "Fusion du mémoire"], category: "core-feature" },
  { slug: "questionnaire-recherche", titleFr: "Questionnaire de Recherche", subtitleFr: "Créez et diffusez votre questionnaire de recherche avec collecte automatisée.", detailsFr: "Créez un questionnaire de recherche complet, diffusez-le en ligne et collectez automatiquement les réponses.", benefitsFr: ["Questions ouvertes et fermées", "Échelles de Likert", "Diffusion par lien partageable", "Collecte automatisée", "Export des données", "Intégration avec le dépouillement"], price: "25 €", category: "optional-module" },
  { slug: "guide-entretien", titleFr: "Guide d'Entretien", subtitleFr: "Structurez vos entretiens semi-directifs avec un guide thématique.", detailsFr: "Le guide d'entretien est essentiel pour la recherche qualitative. Academik génère un guide structuré par thématiques.", benefitsFr: ["Questions principales par thème", "Relances et sous-questions", "Protocole d'entretien", "Adapté à la recherche qualitative", "Cohérent avec votre problématique", "Export du guide"], price: "25 €", category: "optional-module" },
  { slug: "depouillement-questionnaire", titleFr: "Dépouillement du Questionnaire", subtitleFr: "Analysez vos données avec tri à plat, tableaux croisés et graphiques automatiques.", detailsFr: "Analysez vos données de questionnaire : tableaux croisés, graphiques variés et interprétation statistique.", benefitsFr: ["Tri à plat et tri croisé", "Graphiques automatiques", "Import CSV / Excel", "Synchronisation Formulaire", "Analyse thématique", "Interprétation assistée"], price: "29 €", category: "optional-module" },
  { slug: "analyse-qualitative", titleFr: "Analyse Qualitative", subtitleFr: "Codage thématique, analyse de verbatims et synthèse interprétative.", detailsFr: "Assistez dans le codage thématique de vos entretiens, l'analyse de verbatims et la synthèse interprétative.", benefitsFr: ["Codage thématique automatisé", "Analyse de verbatims", "Catégorisation", "Synthèse interprétative", "Identification des patterns", "Visualisation des thèmes"], price: "39 €", category: "optional-module" },
  { slug: "analyse-quantitative", titleFr: "Analyse Quantitative", subtitleFr: "Tableaux statistiques, graphiques avancés et interprétation des résultats.", detailsFr: "Transformez vos données brutes en résultats exploitables : tableaux statistiques, graphiques et interprétation.", benefitsFr: ["Tableaux statistiques complets", "Graphiques variés", "Tendances et corrélations", "Interprétation automatisée", "Export des visualisations", "Intégration dans le mémoire"], price: "39 €", category: "optional-module" },
  { slug: "confrontation-resultats", titleFr: "Confrontation des Résultats", subtitleFr: "Mettez en perspective vos résultats avec la littérature scientifique.", detailsFr: "Mettez vos résultats en perspective avec la littérature existante, identifiant convergences et divergences.", benefitsFr: ["Confrontation résultats / littérature", "Identification des convergences", "Analyse des divergences", "Apport original", "Discussion structurée", "Liens avec le cadre théorique"], price: "19 €", category: "optional-module" },
  { slug: "validation-hypotheses", titleFr: "Validation des Hypothèses", subtitleFr: "Validez ou invalidez vos hypothèses avec une argumentation méthodologique.", detailsFr: "Confrontez chaque hypothèse à vos données de recherche et concluez de manière méthodologique.", benefitsFr: ["Validation / invalidation structurée", "Confrontation aux données empiriques", "Argumentation méthodologique", "Conclusion par hypothèse", "Cohérence avec la problématique", "Rigueur scientifique"], price: "19 €", category: "optional-module" },
  { slug: "formulaire-en-ligne", titleFr: "Formulaire en Ligne", subtitleFr: "Créez des formulaires en ligne avec collecte de réponses en temps réel.", detailsFr: "Créez des enquêtes en ligne, diffusez-les via un lien public et suivez les réponses en temps réel.", benefitsFr: ["Types de questions variés", "Liens partageables publics", "Collecte en temps réel", "Tableau de bord des réponses", "Synchronisation avec le dépouillement", "Aucune inscription pour les répondants"], price: "25 €", category: "optional-module" },
  { slug: "simulation-financiere", titleFr: "Simulation Financière", subtitleFr: "Réalisez vos prévisionnels financiers pour votre projet ou mémoire.", detailsFr: "Réalisez des prévisionnels complets : compte de résultat, plan de trésorerie, seuil de rentabilité.", benefitsFr: ["Compte de résultat prévisionnel", "Plan de trésorerie", "Seuil de rentabilité", "Analyse financière complète", "Graphiques financiers", "Export des tableaux"], price: "29 €", category: "optional-module" },
  { slug: "powerpoint-soutenance", titleFr: "PowerPoint de Soutenance", subtitleFr: "Générez un diaporama structuré pour votre soutenance académique.", detailsFr: "Générez un PowerPoint structuré qui synthétise les points clés de votre travail dans un format professionnel.", benefitsFr: ["Plan de soutenance structuré", "Slides clés générées", "Contenu synthétisé", "Mise en forme professionnelle", "Adapté à votre projet", "Export PowerPoint"], price: "29 €", category: "optional-module" },
  { slug: "simulation-soutenance", titleFr: "Simulation de Soutenance", subtitleFr: "Préparez votre oral avec une simulation de questions du jury.", detailsFr: "Préparez-vous aux questions du jury avec des questions adaptées à votre sujet.", benefitsFr: ["Simulation de questions du jury", "Réponses argumentées", "Gestion du stress", "Entraînement à l'oral", "Questions adaptées", "Retours et conseils"], price: "29 €", category: "optional-module" },
  { slug: "audit-memoire", titleFr: "Audit Complet du Mémoire", subtitleFr: "Faites vérifier la cohérence, la structure et la qualité de votre travail.", detailsFr: "L'audit analyse l'ensemble de votre travail pour identifier les points forts et les axes d'amélioration.", benefitsFr: ["Vérification de la cohérence", "Respect des normes académiques", "Qualité rédactionnelle", "Analyse de la structure", "Recommandations d'amélioration", "Score de qualité détaillé"], price: "49 €", category: "optional-module" },
  { slug: "bibliographie-multi-normes", titleFr: "Bibliographie Multi-Normes", subtitleFr: "Générez votre bibliographie en APA, Vancouver, MLA ou Chicago.", detailsFr: "Formatez automatiquement vos références selon la norme requise par votre établissement.", benefitsFr: ["Normes APA 7e édition", "Norme Vancouver", "Norme MLA", "Norme Chicago", "Formatage automatique", "Gestion des sources"], price: "25 €", category: "optional-module" },
  { slug: "analyse-articles-scientifiques", titleFr: "Analyse d'Articles Scientifiques", subtitleFr: "Analysez et résumez vos articles pour alimenter votre revue de littérature.", detailsFr: "Décortiquez chaque article scientifique : extraction des idées, analyse de la méthodologie, résumé structuré.", benefitsFr: ["Extraction des idées clés", "Analyse de la méthodologie", "Résumé structuré", "Positionnement critique", "Intégration dans la revue", "Confrontation des articles"], price: "29 €", category: "optional-module" },
  { slug: "simulation-entretien", titleFr: "Simulation d'Entretien Guidée", subtitleFr: "Préparez et simulez vos entretiens de recherche de manière interactive.", detailsFr: "Entraînez-vous avant d'aller sur le terrain avec une simulation interactive d'entretien.", benefitsFr: ["Simulation interactive", "Reformulation des questions", "Relances automatiques", "Retranscription", "Adapté aux entretiens semi-directifs", "Entraînement avant terrain"], price: "19 €", category: "optional-module" },
  { slug: "page-remerciements", titleFr: "Page de Remerciements", subtitleFr: "Rédigez des remerciements appropriés pour votre travail académique.", detailsFr: "Les remerciements ouvrent votre mémoire et témoignent de votre gratitude. Formulations appropriées et personnalisables.", benefitsFr: ["Structure type", "Formules académiques", "Personnalisation", "Registre adapté", "Plusieurs versions", "Intégration dans le document"], price: "9 €", category: "optional-module" },
  { slug: "resume-abstract", titleFr: "Résumé et Abstract", subtitleFr: "Synthétisez votre travail en un résumé structuré bilingue.", detailsFr: "Générez une synthèse bilingue (français/anglais) structurée avec les mots-clés pertinents.", benefitsFr: ["Résumé en français", "Abstract en anglais", "Mots-clés pertinents", "Synthèse structurée", "Conforme aux normes", "Traduction bilingue"], price: "9 €", category: "optional-module" },
  { slug: "page-de-couverture", titleFr: "Page de Couverture", subtitleFr: "Créez une page de couverture professionnelle pour votre mémoire.", detailsFr: "Générez une page de couverture professionnelle avec toutes les informations requises.", benefitsFr: ["Titre et sous-titre formatés", "Informations étudiant", "Logo de l'établissement", "Mise en page professionnelle", "Conforme aux normes", "Export intégré"], price: "15 €", category: "optional-module" },
];

interface BlogSEO {
  slug: string;
  titleFr: string;
  descFr: string;
  keywordsFr: string;
  date: string;
  readMinutes: number;
  contentExcerptFr: string;
}

const BLOG_SEO_DATA: BlogSEO[] = [
  { slug: "comment-rediger-problematique-memoire", titleFr: "Comment rédiger une problématique de mémoire ?", descFr: "Guide complet pour formuler une problématique de mémoire efficace : méthodologie, exemples concrets et erreurs à éviter.", keywordsFr: "problématique mémoire, formuler problématique, question de recherche, mémoire master, méthodologie", date: "2026-01-15", readMinutes: 8, contentExcerptFr: "La problématique est le fil conducteur de tout travail académique. Elle oriente votre recherche, structure votre réflexion et donne du sens à l'ensemble de votre mémoire. Découvrez comment formuler une problématique précise, pertinente, réalisable et originale." },
  { slug: "structurer-plan-memoire", titleFr: "Comment structurer le plan de votre mémoire ?", descFr: "Apprenez à construire un plan de mémoire solide et cohérent. Découvrez les différents types de plans et les meilleures pratiques.", keywordsFr: "plan mémoire, structurer mémoire, plan de travail, organisation mémoire, parties mémoire", date: "2026-01-22", readMinutes: 7, contentExcerptFr: "Le plan est l'architecture de votre mémoire. Un plan bien construit facilite la rédaction, assure la cohérence de votre argumentation et guide le lecteur. Découvrez les plans analytique, dialectique, thématique et chronologique." },
  { slug: "cadre-theorique-conceptuel-memoire", titleFr: "Cadre théorique et conceptuel : guide complet", descFr: "Comprendre la différence entre cadre théorique et cadre conceptuel, et savoir les construire pour votre mémoire.", keywordsFr: "cadre théorique, cadre conceptuel, mémoire, théories, concepts, schéma conceptuel", date: "2026-01-29", readMinutes: 9, contentExcerptFr: "Le cadre théorique et le cadre conceptuel sont deux piliers essentiels de tout mémoire académique. Bien qu'ils soient souvent confondus, ils remplissent des fonctions distinctes et complémentaires." },
  { slug: "revue-litterature-methode", titleFr: "Revue de littérature : méthode et bonnes pratiques", descFr: "Comment mener une revue de littérature efficace pour votre mémoire : recherche, sélection, analyse et synthèse des sources.", keywordsFr: "revue de littérature, recherche bibliographique, sources académiques, analyse articles, mémoire", date: "2026-02-01", readMinutes: 10, contentExcerptFr: "La revue de littérature est une étape fondamentale de votre mémoire. Elle démontre votre maîtrise du sujet, situe votre recherche dans le champ scientifique existant et justifie la pertinence de votre problématique." },
  { slug: "methodologie-memoire-guide", titleFr: "Guide de la méthodologie de mémoire", descFr: "Comment choisir et rédiger la partie méthodologie de votre mémoire : approche qualitative, quantitative ou mixte.", keywordsFr: "méthodologie mémoire, approche qualitative, approche quantitative, entretien, questionnaire, collecte données", date: "2026-02-05", readMinutes: 8, contentExcerptFr: "La méthodologie est la partie de votre mémoire qui explique comment vous avez mené votre recherche. Approches qualitative, quantitative et mixte expliquées." },
  { slug: "tfe-infirmier-guide-complet", titleFr: "TFE Infirmier : guide complet pour réussir", descFr: "Tout savoir sur le TFE infirmier : de la situation d'appel à la soutenance, en passant par la problématique et la méthodologie.", keywordsFr: "TFE infirmier, travail fin études, IFSI, mémoire infirmier, soutenance TFE, soins infirmiers", date: "2026-02-10", readMinutes: 12, contentExcerptFr: "Le TFE (Travail de Fin d'Études) est le passage obligé de tout étudiant en soins infirmiers. Guide complet de la situation d'appel à la soutenance." },
];

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "project-type": "Type de projet",
    "core-feature": "Fonctionnalité principale",
    "optional-module": "Module optionnel",
  };
  return labels[category] || category;
}

function buildModulePageMeta(mod: ModuleSEO): PageMeta {
  const canonical = `${BASE_URL}/fonctionnalites/${mod.slug}`;
  const title = `${mod.titleFr} | Academik - Logiciel de rédaction académique`;
  const description = mod.subtitleFr;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `Academik - ${mod.titleFr}`,
      "url": canonical,
      "description": mod.subtitleFr,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      ...(mod.price ? { "offers": { "@type": "Offer", "price": mod.price.replace(/[^0-9]/g, ""), "priceCurrency": "EUR" } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Academik", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Fonctionnalités", "item": `${BASE_URL}/fonctionnalites` },
        { "@type": "ListItem", "position": 3, "name": mod.titleFr, "item": canonical },
      ],
    },
  ];

  if (mod.faqFr && mod.faqFr.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mod.faqFr.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    });
  }

  let contentHtml = `<div style="max-width:800px;margin:0 auto;padding:2rem">`;
  contentHtml += `<nav aria-label="breadcrumb"><a href="/">Academik</a> &gt; <a href="/fonctionnalites">Fonctionnalités</a> &gt; ${escapeHtml(mod.titleFr)}</nav>`;
  contentHtml += `<h1>${escapeHtml(mod.titleFr)}</h1>`;
  contentHtml += `<p>${escapeHtml(mod.subtitleFr)}</p>`;
  if (mod.price) contentHtml += `<p><strong>À partir de ${escapeHtml(mod.price)}</strong></p>`;
  contentHtml += `<p>${escapeHtml(getCategoryLabel(mod.category))}</p>`;
  contentHtml += `<h2>Avantages</h2><ul>`;
  mod.benefitsFr.forEach(b => { contentHtml += `<li>${escapeHtml(b)}</li>`; });
  contentHtml += `</ul>`;
  contentHtml += `<h2>Détails</h2><p>${escapeHtml(mod.detailsFr)}</p>`;
  if (mod.faqFr && mod.faqFr.length > 0) {
    contentHtml += `<h2>Questions fréquentes</h2>`;
    mod.faqFr.forEach(f => {
      contentHtml += `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`;
    });
  }
  contentHtml += `<p><a href="/">Découvrir Academik</a> | <a href="/fonctionnalites">Toutes les fonctionnalités</a></p>`;
  contentHtml += `</div>`;

  return { title, description, keywords: `${mod.titleFr}, Academik, rédaction académique, mémoire`, canonical, jsonLd, contentHtml };
}

function buildBlogArticleMeta(article: BlogSEO): PageMeta {
  const canonical = `${BASE_URL}/blog/${article.slug}`;
  const title = `${article.titleFr} | Blog Academik`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.titleFr,
      "description": article.descFr,
      "url": canonical,
      "datePublished": article.date,
      "author": { "@type": "Organization", "name": "Academik" },
      "publisher": { "@type": "Organization", "name": "Academik", "url": BASE_URL },
      "mainEntityOfPage": canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Academik", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
        { "@type": "ListItem", "position": 3, "name": article.titleFr, "item": canonical },
      ],
    },
  ];

  let contentHtml = `<div style="max-width:800px;margin:0 auto;padding:2rem">`;
  contentHtml += `<nav aria-label="breadcrumb"><a href="/">Academik</a> &gt; <a href="/blog">Blog</a> &gt; ${escapeHtml(article.titleFr)}</nav>`;
  contentHtml += `<h1>${escapeHtml(article.titleFr)}</h1>`;
  contentHtml += `<p><time datetime="${article.date}">${article.date}</time> · ${article.readMinutes} min de lecture</p>`;
  contentHtml += `<p>${escapeHtml(article.contentExcerptFr)}</p>`;
  contentHtml += `<p><a href="/blog">Voir tous les articles</a> | <a href="/">Découvrir Academik</a></p>`;
  contentHtml += `</div>`;

  return { title, description: article.descFr, keywords: article.keywordsFr, canonical, jsonLd, contentHtml };
}

function buildBlogIndexMeta(): PageMeta {
  const canonical = `${BASE_URL}/blog`;
  const title = "Blog Academik - Guides et conseils pour la rédaction académique";
  const description = "Découvrez nos guides complets sur la rédaction académique : problématique, plan, cadre théorique, revue de littérature, méthodologie et TFE infirmier.";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog Academik",
      "url": canonical,
      "description": description,
      "publisher": { "@type": "Organization", "name": "Academik", "url": BASE_URL },
      "blogPost": BLOG_SEO_DATA.map(a => ({
        "@type": "BlogPosting",
        "headline": a.titleFr,
        "url": `${BASE_URL}/blog/${a.slug}`,
        "datePublished": a.date,
        "description": a.descFr,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Academik", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": canonical },
      ],
    },
  ];

  let contentHtml = `<div style="max-width:800px;margin:0 auto;padding:2rem">`;
  contentHtml += `<nav aria-label="breadcrumb"><a href="/">Academik</a> &gt; Blog</nav>`;
  contentHtml += `<h1>Blog Academik</h1>`;
  contentHtml += `<p>${escapeHtml(description)}</p>`;
  contentHtml += `<h2>Articles</h2><ul>`;
  BLOG_SEO_DATA.forEach(a => {
    contentHtml += `<li><a href="/blog/${a.slug}">${escapeHtml(a.titleFr)}</a> - ${escapeHtml(a.descFr)}</li>`;
  });
  contentHtml += `</ul>`;
  contentHtml += `<p><a href="/">Découvrir Academik</a> | <a href="/fonctionnalites">Fonctionnalités</a></p>`;
  contentHtml += `</div>`;

  return { title, description, keywords: "blog académique, rédaction mémoire, méthodologie, TFE, guides", canonical, jsonLd, contentHtml };
}

function buildFeaturesIndexMeta(): PageMeta {
  const canonical = `${BASE_URL}/fonctionnalites`;
  const title = "Fonctionnalités Academik - Tous les outils pour votre travail académique";
  const description = "Découvrez toutes les fonctionnalités d'Academik : rédaction de mémoire, TFE infirmier, thèse, VAE, rapport de stage, et 25+ modules spécialisés.";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Fonctionnalités Academik",
      "url": canonical,
      "description": description,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": MODULE_SEO_DATA.map((m, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "url": `${BASE_URL}/fonctionnalites/${m.slug}`,
          "name": m.titleFr,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Academik", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": "Fonctionnalités", "item": canonical },
      ],
    },
  ];

  let contentHtml = `<div style="max-width:800px;margin:0 auto;padding:2rem">`;
  contentHtml += `<nav aria-label="breadcrumb"><a href="/">Academik</a> &gt; Fonctionnalités</nav>`;
  contentHtml += `<h1>Fonctionnalités Academik</h1>`;
  contentHtml += `<p>${escapeHtml(description)}</p>`;

  const projectTypes = MODULE_SEO_DATA.filter(m => m.category === "project-type");
  const coreFeatures = MODULE_SEO_DATA.filter(m => m.category === "core-feature");
  const optionalModules = MODULE_SEO_DATA.filter(m => m.category === "optional-module");

  contentHtml += `<h2>Types de projets</h2><ul>`;
  projectTypes.forEach(m => { contentHtml += `<li><a href="/fonctionnalites/${m.slug}">${escapeHtml(m.titleFr)}</a> - ${escapeHtml(m.subtitleFr)}</li>`; });
  contentHtml += `</ul>`;

  contentHtml += `<h2>Fonctionnalités principales</h2><ul>`;
  coreFeatures.forEach(m => { contentHtml += `<li><a href="/fonctionnalites/${m.slug}">${escapeHtml(m.titleFr)}</a> - ${escapeHtml(m.subtitleFr)}</li>`; });
  contentHtml += `</ul>`;

  contentHtml += `<h2>Modules optionnels</h2><ul>`;
  optionalModules.forEach(m => { contentHtml += `<li><a href="/fonctionnalites/${m.slug}">${escapeHtml(m.titleFr)}</a>${m.price ? ` - ${m.price}` : ""} - ${escapeHtml(m.subtitleFr)}</li>`; });
  contentHtml += `</ul>`;

  contentHtml += `<p><a href="/">Découvrir Academik</a> | <a href="/blog">Blog</a></p>`;
  contentHtml += `</div>`;

  return { title, description, keywords: "fonctionnalités Academik, outils rédaction, mémoire, TFE, thèse, VAE, modules", canonical, jsonLd, contentHtml };
}

function buildLegalPageMeta(slug: string): PageMeta {
  const titles: Record<string, string> = {
    cgu: "Conditions Générales d'Utilisation (CGU)",
    cgv: "Conditions Générales de Vente (CGV)",
    "politique-de-confidentialite": "Politique de Confidentialité (RGPD)",
  };
  const canonical = `${BASE_URL}/legal/${slug}`;
  const title = `${titles[slug] || "Mentions légales"} | Academik`;
  const description = `${titles[slug] || "Mentions légales"} d'Academik - Performance Consulting Groupe SAS.`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": titles[slug] || "Mentions légales",
      "url": canonical,
      "description": description,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Academik", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": titles[slug] || "Mentions légales", "item": canonical },
      ],
    },
  ];

  let contentHtml = `<div style="max-width:800px;margin:0 auto;padding:2rem">`;
  contentHtml += `<nav aria-label="breadcrumb"><a href="/">Academik</a> &gt; ${escapeHtml(titles[slug] || "")}</nav>`;
  contentHtml += `<h1>${escapeHtml(titles[slug] || "Mentions légales")}</h1>`;
  contentHtml += `<p>Performance Consulting Groupe SAS - SIREN : 913 540 944 - RCS Perpignan</p>`;
  contentHtml += `<p>3 Avenue de Toulouse, 66140 Canet-en-Roussillon, France</p>`;
  contentHtml += `<p><a href="/">Retour à Academik</a></p>`;
  contentHtml += `</div>`;

  return { title, description, keywords: `${titles[slug] || ""}, Academik, mentions légales`, canonical, jsonLd, contentHtml };
}

function getPageMeta(pathname: string): PageMeta | null {
  const fonctMatch = pathname.match(/^\/fonctionnalites\/([^/]+)\/?$/);
  if (fonctMatch) {
    const mod = MODULE_SEO_DATA.find(m => m.slug === fonctMatch[1]);
    if (mod) return buildModulePageMeta(mod);
  }

  if (pathname === "/fonctionnalites" || pathname === "/fonctionnalites/") {
    return buildFeaturesIndexMeta();
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const article = BLOG_SEO_DATA.find(a => a.slug === blogMatch[1]);
    if (article) return buildBlogArticleMeta(article);
  }

  if (pathname === "/blog" || pathname === "/blog/") {
    return buildBlogIndexMeta();
  }

  const legalMatch = pathname.match(/^\/legal\/([^/]+)\/?$/);
  if (legalMatch) {
    return buildLegalPageMeta(legalMatch[1]);
  }

  return null;
}

function injectMetaIntoHtml(html: string, meta: PageMeta): string {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  html = html.replace(
    /<meta name="keywords" content="[^"]*" \/>/,
    `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`
  );

  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${meta.canonical}" />`
  );

  html = html.replace(
    /<link rel="alternate" hreflang="fr" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="fr" href="${meta.canonical}" />`
  );
  html = html.replace(
    /<link rel="alternate" hreflang="en" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="en" href="${meta.canonical}" />`
  );
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="x-default" href="${meta.canonical}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${meta.canonical}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );

  if (meta.jsonLd) {
    const jsonLdStr = JSON.stringify(meta.jsonLd);
    html = html.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${jsonLdStr}</script>`
    );
  }

  if (meta.contentHtml) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"></div><div id="seo-content" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">${meta.contentHtml}</div>`
    );
  }

  return html;
}

export function setupSEOPrerender(app: Express) {
  const seoRoutes = [
    "/fonctionnalites",
    "/fonctionnalites/:slug",
    "/blog",
    "/blog/:slug",
    "/legal/:slug",
  ];

  seoRoutes.forEach(route => {
    app.get(route, (req: Request, res: Response, next: NextFunction) => {
      const meta = getPageMeta(req.path);
      if (!meta) return next();

      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      fs.promises.readFile(clientTemplate, "utf-8").then(template => {
        const page = injectMetaIntoHtml(template, meta);
        res.status(200).set({
          "Content-Type": "text/html",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        }).end(page);
      }).catch(err => {
        console.error("SEO prerender error:", err);
        next();
      });
    });
  });
}
