import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "fr" | "en";

const translations = {
  nav: {
    features: { fr: "Fonctionnalités", en: "Features" },
    pricing: { fr: "Tarifs", en: "Pricing" },
    signIn: { fr: "Se connecter", en: "Sign In" },
    signOut: { fr: "Déconnexion", en: "Sign Out" },
    dashboard: { fr: "Tableau de bord", en: "Dashboard" },
    newProject: { fr: "Nouveau Projet", en: "New Project" },
    settings: { fr: "Paramètres", en: "Settings" },
    billing: { fr: "Facturation", en: "Billing" },
    admin: { fr: "Super Admin", en: "Super Admin" },
  },
  hero: {
    badge: { fr: "De A à Z dans la rédaction académique", en: "From A to Z in Academic Writing" },
    title1: { fr: "Maîtrisez votre", en: "Master Your Academic" },
    title2: { fr: "parcours académique", en: "Writing Journey" },
    subtitle: {
      fr: "Que ce soit un Mémoire, TFE, Thèse, VAE ou Rapport de Stage, bénéficiez d'une assistance intelligente pour structurer, analyser et rédiger vos travaux académiques en toute confiance.",
      en: "Whether it's a Mémoire, TFE, Thesis, VAE, or Internship Report, get intelligent assistance to structure, analyze, and write your academic papers with confidence.",
    },
    cta: { fr: "Commencer", en: "Get Started" },
    demo: { fr: "Voir la démo", en: "View Demo" },
  },
  features: {
    sectionTitle: { fr: "Fonctionnalités de la plateforme", en: "Platform Features" },
    sectionSubtitle: {
      fr: "Une plateforme méthodologique intelligente pour construire un travail académique solide, étape par étape.",
      en: "An intelligent methodological platform to build solid academic work, step by step.",
    },
    projectTypes: { fr: "Types de travaux supportés", en: "Supported Project Types" },
    memoire: { fr: "Mémoire", en: "Dissertation" },
    tfe: { fr: "TFE", en: "Final Year Project" },
    these: { fr: "Thèse", en: "Thesis" },
    vae: { fr: "VAE", en: "VAE (Prior Learning)" },
    rapportStage: { fr: "Rapport de Stage", en: "Internship Report" },
    feat1Title: { fr: "Méthodologie & Recherche", en: "Methodology & Research" },
    feat1Desc: {
      fr: "Génération de sujet, problématique & hypothèses. Plans académiques intelligents. Cadre conceptuel & méthodologique complet.",
      en: "Subject, problematic & hypotheses generation. Intelligent academic plans. Complete conceptual & methodological framework.",
    },
    feat1Details: {
      fr: ["Génération de sujet, problématique & hypothèses", "Plans académiques intelligents", "Cadre conceptuel & méthodologique", "Régénération similaire ou alternative", "Historique complet des versions", "Export Word par section"],
      en: ["Subject, problematic & hypotheses generation", "Intelligent academic plans", "Conceptual & methodological framework", "Similar or alternative regeneration", "Complete version history", "Word export per section"],
    },
    feat2Title: { fr: "Revue de littérature avancée", en: "Advanced Literature Review" },
    feat2Desc: {
      fr: "Recherche multi-plateformes (Google Scholar, PubMed, HAL…). Résumés & confrontation d'articles. Bibliographie multi-normes (APA 7, Vancouver, MLA, Chicago).",
      en: "Multi-platform search (Google Scholar, PubMed, HAL…). Article summaries & confrontation. Multi-standard bibliography (APA 7, Vancouver, MLA, Chicago).",
    },
    feat2Details: {
      fr: ["Recherche multi-plateformes (Google Scholar, PubMed, HAL…)", "Résumés & confrontation d'articles", "Bibliographie multi-normes (APA 7, Vancouver, MLA, Chicago)", "Équations de recherche FR/EN", "Analyse individuelle et croisée"],
      en: ["Multi-platform search (Google Scholar, PubMed, HAL…)", "Article summaries & confrontation", "Multi-standard bibliography (APA 7, Vancouver, MLA, Chicago)", "Research equations FR/EN", "Individual and cross-analysis"],
    },
    feat3Title: { fr: "Collecte & Analyse des données", en: "Data Collection & Analysis" },
    feat3Desc: {
      fr: "Questionnaires & guides d'entretien. Simulation d'entretien IA. Analyse qualitative (verbatims, codage). Analyse quantitative (tableaux + graphiques dynamiques).",
      en: "Questionnaires & interview guides. AI interview simulation. Qualitative analysis (verbatims, coding). Quantitative analysis (tables + dynamic charts).",
    },
    feat3Details: {
      fr: ["Questionnaires & guides d'entretien", "Simulation d'entretien IA", "Analyse qualitative (verbatims, codage)", "Analyse quantitative (tableaux + graphiques dynamiques)"],
      en: ["Questionnaires & interview guides", "AI interview simulation", "Qualitative analysis (verbatims, coding)", "Quantitative analysis (tables + dynamic charts)"],
    },
    feat4Title: { fr: "Production & livrables", en: "Production & Deliverables" },
    feat4Desc: {
      fr: "Export Word / PowerPoint. PowerPoint de soutenance. Simulation de soutenance. Audit de mémoire.",
      en: "Word / PowerPoint export. Defense PowerPoint. Defense simulation. Dissertation audit.",
    },
    feat4Details: {
      fr: ["Export Word / PowerPoint", "PowerPoint de soutenance", "Simulation de soutenance", "Audit de mémoire"],
      en: ["Word / PowerPoint export", "Defense PowerPoint", "Defense simulation", "Dissertation audit"],
    },
    feat5Title: { fr: "Suivi & sécurité", en: "Tracking & Security" },
    feat5Desc: {
      fr: "Workflow & historique complets. Sauvegarde automatique. Import de documents existants. Comparaison de versions.",
      en: "Complete workflow & history. Automatic saving. Existing document import. Version comparison.",
    },
    feat5Details: {
      fr: ["Workflow & historique complets", "Sauvegarde automatique", "Import de documents existants", "Comparaison de versions", "Détection d'impact automatique"],
      en: ["Complete workflow & history", "Automatic saving", "Existing document import", "Version comparison", "Automatic impact detection"],
    },
  },
  pricing: {
    sectionTitle: { fr: "Tarification", en: "Pricing" },
    sectionSubtitle: { fr: "Un pack complet pour vos fondations, puis des options à la carte selon vos besoins.", en: "A complete pack for your foundations, then à la carte options as needed." },
    corePackTitle: { fr: "Pack Mémoire / TFE / VAE", en: "Dissertation / TFE / VAE Pack" },
    corePackSubtitle: { fr: "Fondations complètes", en: "Complete Foundations" },
    corePackDesc: {
      fr: "Tout ce qu'il faut pour structurer votre travail académique jusqu'à la méthodologie.",
      en: "Everything you need to structure your academic work through methodology.",
    },
    corePackIncludes: {
      fr: ["1 projet actif", "Paramétrage complet intelligent", "Sujet / Problématique / Hypothèses", "Plan académique structuré", "Cadre conceptuel (concepts + schémas)", "Équations de recherche", "Revue de littérature (recherche + sélection + filtrage)", "Méthodologie complète", "Workflow & historique", "Sauvegarde automatique", "Export Word par section", "Quota IA : 20 000 mots"],
      en: ["1 active project", "Smart complete setup", "Subject / Problematic / Hypotheses", "Structured academic plan", "Conceptual framework (concepts + diagrams)", "Research equations", "Literature review (search + selection + filtering)", "Complete methodology", "Workflow & history", "Automatic saving", "Word export per section", "AI Quota: 20,000 words"],
    },
    optionsTitle: { fr: "Options à la carte", en: "À la carte Options" },
    optionsSubtitle: { fr: "Ajoutez les modules dont vous avez besoin après la méthodologie.", en: "Add the modules you need after methodology." },
    catCollecte: { fr: "Collecte de données", en: "Data Collection" },
    catAnalyse: { fr: "Analyse des données", en: "Data Analysis" },
    catRevue: { fr: "Revue de littérature avancée", en: "Advanced Literature Review" },
    catSoutenance: { fr: "Soutenance & Finalisation", en: "Defense & Finalization" },
    catConfort: { fr: "Confort & Exports", en: "Comfort & Exports" },
    catIA: { fr: "IA, Quotas & Projets", en: "AI, Quotas & Projects" },
    total: { fr: "Total", en: "Total" },
    payAndActivate: { fr: "Payer et activer", en: "Pay & Activate" },
    included: { fr: "Inclus", en: "Included" },
    packLabel: { fr: "Pack", en: "Pack" },
  },
  app: {
    sectionLocked: { fr: "Section non activée", en: "Section not activated" },
    activateSection: { fr: "Activer cette section", en: "Activate this section" },
    sectionActive: { fr: "Section active", en: "Section active" },
    validatedSections: { fr: "sections validées", en: "validated sections" },
    generate: { fr: "Générer", en: "Generate" },
    modify: { fr: "Modifier", en: "Edit" },
    validate: { fr: "Valider", en: "Validate" },
    unvalidate: { fr: "Dévalider", en: "Unvalidate" },
    export: { fr: "Exporter", en: "Export" },
    variables: { fr: "Variables", en: "Variables" },
    options: { fr: "Options", en: "Options" },
    correctionPrompt: { fr: "Prompt de correction / d'ajustement", en: "Correction / adjustment prompt" },
    noContent: { fr: "Aucun contenu généré pour cette section.", en: "No content generated for this section." },
  },
  common: {
    or: { fr: "ou", en: "or" },
    free: { fr: "Gratuit", en: "Free" },
    close: { fr: "Fermer", en: "Close" },
    save: { fr: "Enregistrer", en: "Save" },
    cancel: { fr: "Annuler", en: "Cancel" },
    loading: { fr: "Chargement...", en: "Loading..." },
  },
  dashboard: {
    title: { fr: "Tableau de bord", en: "Dashboard" },
    subtitle: { fr: "Gérez vos projets académiques et vos recherches.", en: "Manage your academic projects and research." },
    newProject: { fr: "Nouveau Projet", en: "New Project" },
    openMenu: { fr: "Ouvrir le menu", en: "Open menu" },
    deleteProject: { fr: "Supprimer", en: "Delete" },
    confirmDelete: { fr: "Êtes-vous sûr de vouloir supprimer ce projet ?", en: "Are you sure you want to delete this project?" },
    approach: { fr: "approche", en: "approach" },
    noApproach: { fr: "Aucune approche définie.", en: "No specific approach defined yet." },
    updated: { fr: "mis à jour le", en: "updated" },
    open: { fr: "Ouvrir", en: "Open" },
    noProjects: { fr: "Aucun projet", en: "No projects yet" },
    noProjectsDesc: { fr: "Commencez par créer votre premier projet académique. Nous vous aiderons à le structurer.", en: "Get started by creating your first academic project. We'll help you structure it." },
    createProject: { fr: "Créer un projet", en: "Create Project" },
  },
  newProject: {
    back: { fr: "Retour", en: "Back" },
    stepProject: { fr: "Projet", en: "Project" },
    stepContext: { fr: "Contexte", en: "Context" },
    stepProfile: { fr: "Profil", en: "Profile" },
    stepOrientation: { fr: "Orientation", en: "Orientation" },
    projectDetails: { fr: "Détails du projet", en: "Project Details" },
    projectDetailsDesc: { fr: "Nommez votre projet et choisissez le type de travail.", en: "Name your project and choose the type of work." },
    projectName: { fr: "Nom du projet", en: "Project Name" },
    projectNamePlaceholder: { fr: "Ex: Impact du numérique sur les soins", en: "E.g.: Impact of digital on healthcare" },
    projectNameRequired: { fr: "Le nom du projet est requis", en: "Project name is required" },
    workType: { fr: "Type de travail", en: "Type of Work" },
    language: { fr: "Langue", en: "Language" },
    typeRequired: { fr: "Le type est requis", en: "Type is required" },
    select: { fr: "Sélectionner", en: "Select" },
    next: { fr: "Suivant", en: "Next" },
    academicContext: { fr: "Contexte académique", en: "Academic Context" },
    academicContextDesc: { fr: "Ces informations conditionnent toutes les propositions de l'IA.", en: "This information conditions all AI suggestions." },
    mainDomain: { fr: "Domaine principal", en: "Main Domain" },
    selectDomain: { fr: "Sélectionner le domaine", en: "Select domain" },
    domainRequired: { fr: "Le domaine est requis", en: "Domain is required" },
    specifyDomain: { fr: "Précisez le domaine", en: "Specify the domain" },
    specifyDomainPlaceholder: { fr: "Ex: Ergothérapie", en: "E.g.: Ergotherapy" },
    degree: { fr: "Formation / Diplôme", en: "Degree / Diploma" },
    degreeLevel: { fr: "Niveau", en: "Level" },
    degreeLevelRequired: { fr: "Le niveau est requis", en: "Level is required" },
    degreeTitle: { fr: "Intitulé exact", en: "Exact Title" },
    degreeTitlePlaceholder: { fr: "Ex: Master 2 RH", en: "E.g.: Master 2 HR" },
    degreeTitleRequired: { fr: "L'intitulé de la formation est requis", en: "Degree title is required" },
    degreeTitleHint: { fr: "Ex: IFSI, Master 2 RH, Licence Management", en: "E.g.: IFSI, Master 2 HR, Management Bachelor" },
    userProfile: { fr: "Profil utilisateur", en: "User Profile" },
    userProfileDesc: { fr: "Dites-nous en plus sur votre situation actuelle.", en: "Tell us more about your current situation." },
    yourSituation: { fr: "Votre situation", en: "Your Situation" },
    profileRequired: { fr: "Le profil est requis", en: "Profile is required" },
    workDomain: { fr: "Domaine du poste", en: "Work Domain" },
    workDomainPlaceholder: { fr: "Ex: Service de réanimation", en: "E.g.: Intensive care unit" },
    workDomainRequired: { fr: "Le domaine du poste est requis", en: "Work domain is required" },
    workFunction: { fr: "Fonction occupée", en: "Position Held" },
    workFunctionPlaceholder: { fr: "Ex: Infirmier(e) diplômé(e) d'État", en: "E.g.: Registered Nurse" },
    workFunctionRequired: { fr: "La fonction est requise", en: "Position is required" },
    structureType: { fr: "Type de structure", en: "Structure Type" },
    structureRequired: { fr: "Le type de structure est requis", en: "Structure type is required" },
    orientation: { fr: "Orientation du travail", en: "Work Orientation" },
    orientationDesc: { fr: "Dernière étape avant de créer votre projet.", en: "Last step before creating your project." },
    finality: { fr: "Finalité principale", en: "Main Purpose" },
    finalityRequired: { fr: "La finalité est requise", en: "Purpose is required" },
    approachType: { fr: "Type d'approche attendue", en: "Expected Approach Type" },
    approachRequired: { fr: "L'approche est requise", en: "Approach is required" },
    createProject: { fr: "Créer le projet", en: "Create Project" },
  },
  domains: {
    soins_infirmiers: { fr: "Soins infirmiers / Santé", en: "Nursing / Healthcare" },
    travail_social: { fr: "Travail social", en: "Social Work" },
    management: { fr: "Management / Gestion", en: "Management" },
    rh: { fr: "Ressources humaines", en: "Human Resources" },
    economie: { fr: "Économie / Finance", en: "Economics / Finance" },
    marketing: { fr: "Marketing / Communication", en: "Marketing / Communication" },
    droit: { fr: "Droit / Administration publique", en: "Law / Public Administration" },
    education: { fr: "Éducation / Pédagogie", en: "Education / Pedagogy" },
    psychologie: { fr: "Psychologie", en: "Psychology" },
    informatique: { fr: "Informatique / Numérique", en: "Computer Science / Digital" },
    data_ia: { fr: "Data / Intelligence artificielle", en: "Data / Artificial Intelligence" },
    logistique: { fr: "Logistique / Supply chain", en: "Logistics / Supply Chain" },
    qualite: { fr: "Qualité / QHSE", en: "Quality / QHSE" },
    comptabilite: { fr: "Comptabilité / Audit / Contrôle de gestion", en: "Accounting / Audit / Management Control" },
    banque: { fr: "Banque / Assurance", en: "Banking / Insurance" },
    immobilier: { fr: "Immobilier / Urbanisme", en: "Real Estate / Urban Planning" },
    sciences_politiques: { fr: "Sciences politiques / Relations internationales", en: "Political Science / International Relations" },
    environnement: { fr: "Environnement / Développement durable", en: "Environment / Sustainable Development" },
    industrie: { fr: "Industrie / Génie industriel", en: "Industry / Industrial Engineering" },
    autre: { fr: "Autre", en: "Other" },
  },
  degreeLevels: {
    bts_dut: { fr: "BTS / DUT", en: "BTS / DUT (2-year degree)" },
    licence: { fr: "Licence / Licence professionnelle", en: "Bachelor's Degree" },
    bachelor: { fr: "Bachelor", en: "Bachelor" },
    master1: { fr: "Master 1", en: "Master 1" },
    master2: { fr: "Master 2", en: "Master 2" },
    mba: { fr: "MBA", en: "MBA" },
    diplome_etat: { fr: "Diplôme d'État (santé / social)", en: "State Diploma (health / social)" },
    doctorat: { fr: "Doctorat", en: "Doctorate / PhD" },
    vae: { fr: "VAE", en: "VAE (Prior Learning)" },
    autre: { fr: "Autre", en: "Other" },
  },
  userProfiles: {
    etudiant_sans_stage: { fr: "Étudiant sans stage", en: "Student without internship" },
    etudiant_stage: { fr: "Étudiant en stage", en: "Student with internship" },
    etudiant_alternance: { fr: "Étudiant en alternance", en: "Work-study student" },
    professionnel: { fr: "Professionnel", en: "Professional" },
    professionnel_sante: { fr: "Professionnel de santé", en: "Healthcare professional" },
    candidat_vae: { fr: "Candidat VAE", en: "VAE Candidate" },
  },
  structureTypes: {
    hopital: { fr: "Hôpital / Clinique", en: "Hospital / Clinic" },
    entreprise_privee: { fr: "Entreprise privée", en: "Private company" },
    association: { fr: "Association", en: "Association / Non-profit" },
    administration: { fr: "Administration publique", en: "Public administration" },
    autre: { fr: "Autre", en: "Other" },
  },
  projectTypes: {
    memoire: { fr: "Mémoire", en: "Dissertation" },
    tfe: { fr: "TFE (Travail de Fin d'Études)", en: "TFE (Final Year Project)" },
    vae: { fr: "VAE (Validation des Acquis)", en: "VAE (Prior Learning Validation)" },
    rapport_stage: { fr: "Rapport de Stage", en: "Internship Report" },
    these: { fr: "Thèse (Doctorat)", en: "Thesis (PhD)" },
  },
  finalities: {
    academique: { fr: "Académique", en: "Academic" },
    professionnelle: { fr: "Professionnelle", en: "Professional" },
    mixte: { fr: "Mixte", en: "Mixed" },
  },
  approaches: {
    theorique: { fr: "Théorique", en: "Theoretical" },
    appliquee: { fr: "Appliquée", en: "Applied" },
    analyse_pratiques: { fr: "Analyse de pratiques", en: "Practice Analysis" },
    etude_cas: { fr: "Étude de cas", en: "Case Study" },
    ne_sais_pas: { fr: "Je ne sais pas", en: "I don't know" },
  },
  settings: {
    title: { fr: "Paramètres", en: "Settings" },
    subtitle: { fr: "Configurez votre assistant académique.", en: "Configure your academic assistant." },
    apiKeyTitle: { fr: "Clé API OpenAI", en: "OpenAI API Key" },
    apiKeyDesc: { fr: "Optionnel : connectez votre propre clé API OpenAI pour utiliser vos crédits personnels. Sans clé personnelle, le service intégré est utilisé.", en: "Optional: connect your own OpenAI API key to use your personal credits. Without a personal key, the integrated service is used." },
    status: { fr: "Statut", en: "Status" },
    personalKeyActive: { fr: "Clé personnelle active", en: "Personal key active" },
    integratedService: { fr: "Service intégré (par défaut)", en: "Integrated service (default)" },
    saveKey: { fr: "Enregistrer", en: "Save" },
    removeKey: { fr: "Supprimer ma clé et utiliser le service intégré", en: "Remove my key and use integrated service" },
    keySaved: { fr: "Clé API enregistrée", en: "API key saved" },
    keySavedDesc: { fr: "Votre clé OpenAI personnelle sera utilisée pour les générations.", en: "Your personal OpenAI key will be used for generations." },
    keyRemoved: { fr: "Clé API supprimée", en: "API key removed" },
    keyRemovedDesc: { fr: "Les générations utiliseront le service intégré.", en: "Generations will use the integrated service." },
    keyError: { fr: "Erreur", en: "Error" },
    keyErrorDesc: { fr: "Clé API invalide.", en: "Invalid API key." },
    keySecurityNote: { fr: "Votre clé est stockée de manière sécurisée et n'est jamais partagée. Elle est utilisée uniquement pour les appels IA de vos projets.", en: "Your key is stored securely and never shared. It is only used for AI calls in your projects." },
  },
  billing: {
    title: { fr: "Facturation", en: "Billing" },
    subscription: { fr: "Abonnement", en: "Subscription" },
    noSubscription: { fr: "Aucune souscription active", en: "No active subscription" },
    expired: { fr: "Expiré", en: "Expired" },
    expiringSoon: { fr: "Expire bientôt", en: "Expiring soon" },
    active: { fr: "Actif", en: "Active" },
    subscriptionExpired: { fr: "Votre abonnement a expiré", en: "Your subscription has expired" },
    renewalIn: { fr: "Renouvellement dans", en: "Renewal in" },
    daysRemaining: { fr: "jour(s) restant(s)", en: "day(s) remaining" },
    days: { fr: "jours", en: "days" },
    subscriptionExpiredAlert: { fr: "Abonnement expiré", en: "Subscription expired" },
    subscriptionExpiredDesc: { fr: "Veuillez renouveler votre souscription pour continuer à utiliser les fonctionnalités. Un prélèvement automatique sera tenté à la date de renouvellement.", en: "Please renew your subscription to continue using the features. An automatic payment will be attempted at the renewal date." },
    renewalImminent: { fr: "Renouvellement imminent", en: "Renewal imminent" },
    renewalImminentDesc: { fr: "Votre prélèvement automatique sera effectué la veille de la date de renouvellement. Assurez-vous que votre moyen de paiement est à jour.", en: "Your automatic payment will be processed the day before the renewal date. Make sure your payment method is up to date." },
    invoices: { fr: "Factures", en: "Invoices" },
    noInvoices: { fr: "Aucune facture", en: "No invoices" },
    paid: { fr: "Payée", en: "Paid" },
    pending: { fr: "En attente", en: "Pending" },
    article: { fr: "article", en: "item" },
    articles: { fr: "articles", en: "items" },
    quotas: { fr: "Vos Quotas", en: "Your Quotas" },
    words: { fr: "Mots", en: "Words" },
    aiActions: { fr: "Actions IA", en: "AI Actions" },
    projects: { fr: "Projets actifs", en: "Active Projects" },
    documents: { fr: "Documents", en: "Documents" },
    used: { fr: "utilisés", en: "used" },
    exceeded: { fr: "Dépassé", en: "Exceeded" },
    addQuota: { fr: "Ajouter du quota", en: "Add quota" },
    upgradeTitle: { fr: "Activer des modules", en: "Activate Modules" },
    upgradeSubtitle: { fr: "Choisissez les modules dont vous avez besoin.", en: "Choose the modules you need." },
    corePack: { fr: "Pack complet", en: "Complete Pack" },
    corePackDesc: { fr: "Tous les fondements en un seul achat", en: "All foundations in a single purchase" },
    alreadyOwned: { fr: "Déjà acquis", en: "Already owned" },
    saving: { fr: "Économie", en: "Saving" },
    orIndividually: { fr: "ou individuellement", en: "or individually" },
    options: { fr: "Options à la carte", en: "À la carte Options" },
    packs: { fr: "Packs", en: "Packs" },
    viewBilling: { fr: "Voir ma facturation", en: "View my billing" },
  },
  quota: {
    title: { fr: "Quotas", en: "Quotas" },
    words: { fr: "Mots", en: "Words" },
    aiActions: { fr: "Actions IA", en: "AI Actions" },
    projects: { fr: "Projets", en: "Projects" },
    renewal: { fr: "Renouvellement", en: "Renewal" },
    exceeded: { fr: "Quota atteint", en: "Quota reached" },
    wordsExceeded: { fr: "Quota de mots atteint", en: "Word quota reached" },
    actionsExceeded: { fr: "Quota d'actions IA atteint", en: "AI actions quota reached" },
    projectsExceeded: { fr: "Limite de projets atteinte", en: "Project limit reached" },
    increaseQuota: { fr: "Augmentez votre quota :", en: "Increase your quota:" },
    buy: { fr: "Acheter", en: "Buy" },
    surplusActivated: { fr: "Surplus activé", en: "Surplus activated" },
    surplusActivatedDesc: { fr: "Votre quota a été augmenté.", en: "Your quota has been increased." },
    surplusError: { fr: "Impossible d'acheter le surplus", en: "Unable to purchase surplus" },
    monthlyLimitReached: { fr: "Vous avez atteint une de vos limites mensuelles.", en: "You have reached one of your monthly limits." },
  },
  project: {
    notFound: { fr: "Projet introuvable", en: "Project not found" },
    assistant: { fr: "Academik", en: "Academik" },
    documentsTab: { fr: "Documents", en: "Documents" },
    overviewTab: { fr: "Paramétrage", en: "Settings" },
    academicContext: { fr: "Contexte académique", en: "Academic Context" },
    profileOrientation: { fr: "Profil & Orientation", en: "Profile & Orientation" },
    info: { fr: "Informations", en: "Information" },
    domain: { fr: "Domaine", en: "Domain" },
    degree: { fr: "Formation", en: "Degree" },
    level: { fr: "Niveau", en: "Level" },
    profile: { fr: "Profil", en: "Profile" },
    finality: { fr: "Finalité", en: "Purpose" },
    approach: { fr: "Approche", en: "Approach" },
    workDomain: { fr: "Domaine du poste", en: "Work Domain" },
    workFunction: { fr: "Fonction", en: "Position" },
    workStructure: { fr: "Structure", en: "Structure" },
    createdAt: { fr: "Créé le", en: "Created on" },
    status: { fr: "Statut", en: "Status" },
    language: { fr: "Langue", en: "Language" },
    notDefined: { fr: "Non défini", en: "Not defined" },
    foundations: { fr: "Fondements", en: "Foundations" },
    plan: { fr: "Plan", en: "Plan" },
    conceptualFramework: { fr: "Cadre conceptuel", en: "Conceptual Framework" },
    literatureReview: { fr: "Revue", en: "Literature Review" },
    methodology: { fr: "Méthodo", en: "Methodology" },
    questionnaire: { fr: "Questionnaire", en: "Questionnaire" },
    interviewGuide: { fr: "Guide d'entretien", en: "Interview Guide" },
    questionnaireAnalysis: { fr: "Dépouillement", en: "Survey Analysis" },
    interviewSimulation: { fr: "Simulation", en: "Simulation" },
    dataVisualization: { fr: "Visualisation", en: "Visualization" },
    financialSimulation: { fr: "Finance", en: "Finance" },
    assistedWriting: { fr: "Rédaction", en: "Writing" },
    bibliography: { fr: "Biblio", en: "Bibliography" },
    exportTab: { fr: "Export", en: "Export" },
    soutenancePPT: { fr: "PPT Soutenance", en: "Defense PPT" },
    soutenanceOral: { fr: "Oral", en: "Oral Defense" },
    audit: { fr: "Audit", en: "Audit" },
    workflow: { fr: "Workflow", en: "Workflow" },
    addDocument: { fr: "Ajouter un document", en: "Add Document" },
    uploadDocument: { fr: "Importer un document", en: "Upload Document" },
    documentName: { fr: "Nom du document", en: "Document Name" },
    documentContent: { fr: "Contenu", en: "Content" },
    noDocuments: { fr: "Aucun document importé", en: "No documents imported" },
    noDocumentsDesc: { fr: "Importez des documents pour enrichir le contexte de l'IA.", en: "Import documents to enrich the AI context." },
    deleteDocument: { fr: "Supprimer", en: "Delete" },
    workflowTitle: { fr: "Historique du projet", en: "Project History" },
    workflowDesc: { fr: "Suivi chronologique des actions réalisées.", en: "Chronological tracking of completed actions." },
    noHistory: { fr: "Aucun historique disponible", en: "No history available" },
  },
  section: {
    locked: { fr: "Section verrouillée", en: "Section locked" },
    lockedDesc: { fr: "Activez ce module pour y accéder.", en: "Activate this module to access it." },
    activate: { fr: "Activer", en: "Activate" },
    generate: { fr: "Générer", en: "Generate" },
    regenerateSimilar: { fr: "Similaire", en: "Similar" },
    regenerateDifferent: { fr: "Différent", en: "Different" },
    edit: { fr: "Modifier", en: "Edit" },
    save: { fr: "Enregistrer", en: "Save" },
    cancelEdit: { fr: "Annuler", en: "Cancel" },
    validate: { fr: "Valider", en: "Validate" },
    unvalidate: { fr: "Dévalider", en: "Unvalidate" },
    history: { fr: "Historique", en: "History" },
    version: { fr: "Version", en: "Version" },
    restoreVersion: { fr: "Restaurer", en: "Restore" },
    currentVersion: { fr: "Version actuelle", en: "Current version" },
    noContent: { fr: "Aucun contenu généré.", en: "No content generated." },
    noContentDesc: { fr: "Cliquez sur « Générer » pour créer le contenu de cette section.", en: "Click 'Generate' to create content for this section." },
    copySuccess: { fr: "Copié dans le presse-papier", en: "Copied to clipboard" },
    correctionPrompt: { fr: "Prompt de correction / d'ajustement", en: "Correction / adjustment prompt" },
    correctionPlaceholder: { fr: "Précisez vos modifications souhaitées...", en: "Specify your desired modifications..." },
    status: { fr: "Statut", en: "Status" },
    changeStatus: { fr: "Changer le statut", en: "Change status" },
    statusHistory: { fr: "Historique des statuts", en: "Status History" },
    compareVersions: { fr: "Comparer les versions", en: "Compare versions" },
    needsReview: { fr: "Relecture nécessaire", en: "Review needed" },
    dismissReview: { fr: "Ignorer", en: "Dismiss" },
    exportWord: { fr: "Exporter Word", en: "Export Word" },
    exportPdf: { fr: "Exporter PDF", en: "Export PDF" },
  },
  seo: {
    landingTitle: { fr: "Academik - Assistant de rédaction académique IA", en: "Academik - AI Academic Writing Assistant" },
    landingDescription: { fr: "Academik vous accompagne de A à Z dans la rédaction de votre mémoire, TFE, VAE ou rapport de stage. Structuration, analyse et rédaction assistées par IA.", en: "Academik supports you from A to Z in writing your dissertation, thesis, VAE or internship report. AI-assisted structuring, analysis and writing." },
    landingKeywords: { fr: "rédaction académique, mémoire, TFE, VAE, rapport de stage, IA, intelligence artificielle, aide rédaction, assistant académique", en: "academic writing, dissertation, thesis, VAE, internship report, AI, artificial intelligence, writing help, academic assistant" },
    dashboardTitle: { fr: "Tableau de bord - Academik", en: "Dashboard - Academik" },
    newProjectTitle: { fr: "Nouveau Projet - Academik", en: "New Project - Academik" },
    settingsTitle: { fr: "Paramètres - Academik", en: "Settings - Academik" },
    billingTitle: { fr: "Facturation - Academik", en: "Billing - Academik" },
    projectTitle: { fr: "Projet - Academik", en: "Project - Academik" },
    adminTitle: { fr: "Administration - Academik", en: "Administration - Academik" },
  },
} as const;

type TranslationPath = string;

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (path: TranslationPath) => string;
  tArray: (path: TranslationPath) => string[];
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: (path) => path,
  tArray: () => [],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("app_lang") as Lang) || "fr";
    }
    return "fr";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("app_lang", l);
  }, []);

  const t = useCallback((path: string): string => {
    const val = getNestedValue(translations, path);
    if (val && typeof val === "object" && lang in val) {
      return val[lang];
    }
    return path;
  }, [lang]);

  const tArray = useCallback((path: string): string[] => {
    const val = getNestedValue(translations, path);
    if (val && typeof val === "object" && lang in val) {
      return val[lang] as unknown as string[];
    }
    return [];
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tArray }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSelector({ variant = "default" }: { variant?: "default" | "minimal" }) {
  const { lang, setLang } = useI18n();

  if (variant === "minimal") {
    return (
      <button
        onClick={() => setLang(lang === "fr" ? "en" : "fr")}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-muted-foreground hover-elevate transition-colors"
        data-testid="button-language-toggle"
      >
        <span className={lang === "fr" ? "font-bold text-foreground" : ""}>FR</span>
        <span className="text-border">/</span>
        <span className={lang === "en" ? "font-bold text-foreground" : ""}>EN</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50" data-testid="language-selector">
      <button
        onClick={() => setLang("fr")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          lang === "fr" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        }`}
        data-testid="button-lang-fr"
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
          lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
        }`}
        data-testid="button-lang-en"
      >
        EN
      </button>
    </div>
  );
}
