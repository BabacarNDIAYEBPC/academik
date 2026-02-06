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
  },
  hero: {
    badge: { fr: "Propulsé par l'IA avancée", en: "Powered by Advanced AI" },
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
    module1Title: { fr: "Fondement méthodologique", en: "Methodological Foundation" },
    module1Desc: {
      fr: "Génération du sujet, de la problématique et des hypothèses. Séparation stricte, régénération en version similaire ou alternative, modification manuelle et historique des versions.",
      en: "Generate subject, problematic, and hypotheses. Strict separation, regeneration in similar or alternative versions, manual editing and version history.",
    },
    module1Details: {
      fr: ["Sujet, Problématique, Hypothèses", "Génération individuelle ou combinée", "Régénération similaire ou alternative", "Historique complet des versions", "Export Word"],
      en: ["Subject, Problematic, Hypotheses", "Individual or combined generation", "Similar or alternative regeneration", "Complete version history", "Word export"],
    },
    module2Title: { fr: "Plan du travail", en: "Work Plan" },
    module2Desc: {
      fr: "Génération d'un plan académique structuré, conforme aux exigences de votre type de travail, avec numérotation académique propre.",
      en: "Generate a structured academic plan, compliant with your project type requirements, with proper academic numbering.",
    },
    module2Details: {
      fr: ["Plan structuré académique", "Numérotation propre (1.1 / 1.1.1)", "Conforme Mémoire, TFE, Thèse, Rapport", "Modification et régénération", "Export Word"],
      en: ["Structured academic plan", "Proper numbering (1.1 / 1.1.1)", "Compliant for all project types", "Editing and regeneration", "Word export"],
    },
    module3Title: { fr: "Cadre conceptuel", en: "Conceptual Framework" },
    module3Desc: {
      fr: "Identification de 3 concepts clés avec définitions académiques et liens avec la problématique et les hypothèses.",
      en: "Identification of 3 key concepts with academic definitions and links to the problematic and hypotheses.",
    },
    module3Details: {
      fr: ["3 concepts clés identifiés", "Définitions académiques", "Lien concepts-problématique-hypothèses", "Structure claire et rigoureuse", "Export Word"],
      en: ["3 key concepts identified", "Academic definitions", "Concept-problematic-hypotheses links", "Clear and rigorous structure", "Word export"],
    },
    module4Title: { fr: "Revue de littérature", en: "Literature Review" },
    module4Desc: {
      fr: "Recherche avancée sur Google Scholar, PubMed, Cairn, HAL. Génération d'équations de recherche, analyse d'articles, bibliographie multi-normes.",
      en: "Advanced search on Google Scholar, PubMed, Cairn, HAL. Research equation generation, article analysis, multi-standard bibliography.",
    },
    module4Details: {
      fr: ["Recherche multi-plateformes", "Équations de recherche FR/EN", "Analyse individuelle et croisée", "Confrontation d'articles", "Bibliographie APA7, Vancouver, MLA, Chicago", "Historique des recherches", "Export Word"],
      en: ["Multi-platform search", "Research equations FR/EN", "Individual and cross-analysis", "Article confrontation", "APA7, Vancouver, MLA, Chicago bibliography", "Search history", "Word export"],
    },
    module5Title: { fr: "Méthodologie de recherche", en: "Research Methodology" },
    module5Desc: {
      fr: "Proposition du type de méthodologie, cohérence automatique avec la problématique et les hypothèses, définition de la population et des outils.",
      en: "Methodology type proposal, automatic coherence with problematic and hypotheses, population and tools definition.",
    },
    module5Details: {
      fr: ["Qualitative, quantitative ou mixte", "Cohérence problématique-hypothèses", "Population cible et outils", "Phases méthodologiques", "Limites identifiées", "Export Word"],
      en: ["Qualitative, quantitative or mixed", "Problematic-hypotheses coherence", "Target population and tools", "Methodological phases", "Identified limitations", "Word export"],
    },
    cat1Title: { fr: "Collecte & Analyse des données", en: "Data Collection & Analysis" },
    cat1Desc: {
      fr: "Questionnaires & guides d'entretien, simulation d'entretien IA, analyse qualitative (verbatims, codage), analyse quantitative (tableaux + graphiques dynamiques).",
      en: "Questionnaires & interview guides, AI interview simulation, qualitative analysis (verbatims, coding), quantitative analysis (tables + dynamic charts).",
    },
    cat1Details: {
      fr: ["Questionnaires avancés", "Guides d'entretien complets", "Simulation d'entretien IA", "Analyse qualitative (verbatims, codage, synthèse)", "Analyse quantitative (tableaux + graphiques)", "Export Word"],
      en: ["Advanced questionnaires", "Complete interview guides", "AI interview simulation", "Qualitative analysis (verbatims, coding, synthesis)", "Quantitative analysis (tables + charts)", "Word export"],
    },
    cat2Title: { fr: "Revue de littérature avancée", en: "Advanced Literature Review" },
    cat2Desc: {
      fr: "Recherche multi-plateformes (Google Scholar, PubMed, HAL…), résumés & confrontation d'articles, bibliographie multi-normes (APA 7, Vancouver, MLA, Chicago).",
      en: "Multi-platform search (Google Scholar, PubMed, HAL…), article summaries & confrontation, multi-standard bibliography (APA 7, Vancouver, MLA, Chicago).",
    },
    cat2Details: {
      fr: ["Résumé & analyse d'articles (lot)", "Confrontation d'articles", "Bibliographie APA 7, Vancouver, MLA, Chicago", "Recherche multi-plateformes"],
      en: ["Article summary & analysis (batch)", "Article confrontation", "APA 7, Vancouver, MLA, Chicago bibliography", "Multi-platform search"],
    },
    cat3Title: { fr: "Soutenance & Finalisation", en: "Defense & Finalization" },
    cat3Desc: {
      fr: "PowerPoint de soutenance structuré, simulation de soutenance (questions jury), audit complet du mémoire.",
      en: "Structured defense PowerPoint, defense simulation (jury questions), complete dissertation audit.",
    },
    cat3Details: {
      fr: ["PowerPoint de soutenance", "Simulation de soutenance (questions jury)", "Audit complet du mémoire", "Export Word / PPT"],
      en: ["Defense PowerPoint", "Defense simulation (jury questions)", "Complete dissertation audit", "Word / PPT export"],
    },
    cat4Title: { fr: "Suivi & Sécurité", en: "Tracking & Security" },
    cat4Desc: {
      fr: "Workflow & historique complets, sauvegarde automatique, import de documents existants.",
      en: "Complete workflow & history, automatic saving, existing document import.",
    },
    cat4Details: {
      fr: ["Workflow par section", "Historique horodaté", "Gestion des versions", "Sauvegarde automatique", "Import de documents"],
      en: ["Per-section workflow", "Timestamped history", "Version management", "Automatic saving", "Document import"],
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
