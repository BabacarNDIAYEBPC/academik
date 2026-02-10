import { useParams, Link } from "wouter";
import { SEO } from "@/components/SEO";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, ArrowLeft, BookOpen, GraduationCap, Sparkles,
  FileText, Search, FlaskConical, CheckCircle2, Lightbulb, Map,
  BookMarked, Award, Briefcase, ClipboardList, BrainCircuit,
  BarChart3, Mic, FileCheck, Presentation, ShieldCheck, PenTool,
  MessageSquare, Calculator, Upload, ListChecks, Layers, Eye,
  Globe, Package, type LucideIcon,
} from "lucide-react";

interface ModuleEntry {
  slug: string;
  category: "project-type" | "core-feature" | "optional-module";
  icon: LucideIcon;
  seoTitleKey: string;
  seoDescKey: string;
  seoKeywordsKey: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  benefitsFr: string[];
  benefitsEn: string[];
  detailsFr: string;
  detailsEn: string;
  price?: string;
}

const MODULE_CATALOG: ModuleEntry[] = [
  {
    slug: "memoire",
    category: "project-type",
    icon: GraduationCap,
    seoTitleKey: "seo.memoireTitle",
    seoDescKey: "seo.memoireDescription",
    seoKeywordsKey: "seo.memoireKeywords",
    titleFr: "Rédaction de Mémoire",
    titleEn: "Dissertation Writing",
    subtitleFr: "Structurez et rédigez votre mémoire de master ou licence avec un accompagnement méthodologique complet.",
    subtitleEn: "Structure and write your master's or bachelor's dissertation with complete methodological support.",
    benefitsFr: [
      "Formulation de la problématique et des hypothèses",
      "Génération du plan structuré adapté à votre domaine",
      "Construction du cadre théorique et conceptuel",
      "Revue de littérature guidée et synthèse",
      "Méthodologie de recherche (qualitative / quantitative)",
      "Rédaction assistée section par section",
      "Export Word et PDF avec mise en page académique",
      "Mémoire contextuelle : chaque section alimente la suivante",
    ],
    benefitsEn: [
      "Research question and hypothesis formulation",
      "Structured outline generation adapted to your field",
      "Theoretical and conceptual framework building",
      "Guided literature review and synthesis",
      "Research methodology (qualitative / quantitative)",
      "Assisted writing section by section",
      "Word and PDF export with academic formatting",
      "Contextual memory: each section feeds the next",
    ],
    detailsFr: "Academik accompagne les étudiants en licence et master dans la rédaction de leur mémoire. Notre plateforme propose une approche structurée : vous définissez votre sujet, formulez votre problématique, construisez vos hypothèses, puis Academik vous guide à travers chaque étape — du plan de travail à la rédaction finale. Grâce à la mémoire contextuelle, chaque section validée enrichit automatiquement les générations suivantes, garantissant la cohérence de l'ensemble de votre travail académique.",
    detailsEn: "Academik supports bachelor's and master's students in writing their dissertation. Our platform offers a structured approach: you define your subject, formulate your research question, build your hypotheses, then Academik guides you through each step — from the work plan to the final draft. Thanks to contextual memory, each validated section automatically enriches subsequent generations, ensuring the coherence of your entire academic work.",
    price: "179 €",
  },
  {
    slug: "tfe-infirmier",
    category: "project-type",
    icon: ClipboardList,
    seoTitleKey: "seo.tfeTitle",
    seoDescKey: "seo.tfeDescription",
    seoKeywordsKey: "seo.tfeKeywords",
    titleFr: "TFE Infirmier",
    titleEn: "Nursing Thesis (TFE)",
    subtitleFr: "Rédigez votre Travail de Fin d'Études infirmier avec une méthodologie spécifique aux soins.",
    subtitleEn: "Write your nursing End of Studies Paper with care-specific methodology.",
    benefitsFr: [
      "Situation d'appel et question de départ",
      "Cadre conceptuel adapté aux soins infirmiers",
      "Guide d'entretien semi-directif",
      "Analyse qualitative des verbatims",
      "Confrontation résultats / littérature",
      "Validation des hypothèses",
      "Préparation de la soutenance (PPT + simulation)",
      "Conforme aux exigences IFSI",
    ],
    benefitsEn: [
      "Initial situation and starting question",
      "Conceptual framework adapted to nursing",
      "Semi-structured interview guide",
      "Qualitative verbatim analysis",
      "Results vs. literature confrontation",
      "Hypothesis validation",
      "Defense preparation (PPT + simulation)",
      "Compliant with nursing school requirements",
    ],
    detailsFr: "Le TFE (Travail de Fin d'Études) est un passage obligé pour tout étudiant en soins infirmiers. Academik propose un parcours dédié qui suit la méthodologie spécifique de l'IFSI : de la situation d'appel à la question de départ, en passant par le cadre conceptuel, les entretiens et l'analyse. Notre plateforme vous aide à structurer votre réflexion professionnelle tout en respectant les normes académiques.",
    detailsEn: "The TFE (End of Studies Paper) is a mandatory milestone for every nursing student. Academik offers a dedicated pathway that follows the specific methodology of nursing schools: from the initial situation to the starting question, through the conceptual framework, interviews and analysis. Our platform helps you structure your professional reflection while meeting academic standards.",
    price: "179 €",
  },
  {
    slug: "these-doctorat",
    category: "project-type",
    icon: BookOpen,
    seoTitleKey: "seo.theseTitle",
    seoDescKey: "seo.theseDescription",
    seoKeywordsKey: "seo.theseKeywords",
    titleFr: "Thèse de Doctorat",
    titleEn: "Doctoral Thesis",
    subtitleFr: "Structurez votre thèse de doctorat avec une méthodologie de recherche rigoureuse.",
    subtitleEn: "Structure your doctoral thesis with rigorous research methodology.",
    benefitsFr: [
      "Revue de littérature systématique et exhaustive",
      "Cadre théorique approfondi",
      "Méthodologie de recherche avancée",
      "Analyse de données (qualitative et quantitative)",
      "Gestion bibliographique multi-normes",
      "Rédaction structurée par chapitres",
      "Audit complet du document",
      "Préparation de la soutenance doctorale",
    ],
    benefitsEn: [
      "Systematic and exhaustive literature review",
      "In-depth theoretical framework",
      "Advanced research methodology",
      "Data analysis (qualitative and quantitative)",
      "Multi-standard bibliographic management",
      "Chapter-based structured writing",
      "Complete document audit",
      "Doctoral defense preparation",
    ],
    detailsFr: "La rédaction d'une thèse de doctorat représente un défi majeur qui s'étend sur plusieurs années. Academik vous accompagne dans la structuration de votre réflexion, depuis la définition de votre problématique jusqu'à la préparation de votre soutenance. Notre plateforme est conçue pour gérer la complexité et la profondeur requises par un travail doctoral.",
    detailsEn: "Writing a doctoral thesis is a major challenge spanning several years. Academik supports you in structuring your thinking, from defining your research question to preparing your defense. Our platform is designed to handle the complexity and depth required by doctoral work.",
    price: "179 €",
  },
  {
    slug: "vae",
    category: "project-type",
    icon: Award,
    seoTitleKey: "seo.vaeTitle",
    seoDescKey: "seo.vaeDescription",
    seoKeywordsKey: "seo.vaeKeywords",
    titleFr: "VAE – Validation des Acquis de l'Expérience",
    titleEn: "VAE – Prior Learning Assessment",
    subtitleFr: "Préparez votre dossier VAE avec une cartographie complète de vos compétences.",
    subtitleEn: "Prepare your VAE application with a complete competency mapping.",
    benefitsFr: [
      "Présentation du candidat structurée",
      "Parcours professionnel et expériences",
      "Analyse de la motivation et du projet",
      "Cartographie des compétences par blocs",
      "Démonstration des acquis bloc par bloc",
      "Synthèse et conclusion argumentée",
      "PowerPoint de soutenance",
      "Simulation de l'oral VAE",
    ],
    benefitsEn: [
      "Structured candidate presentation",
      "Professional background and experiences",
      "Motivation and project analysis",
      "Block-by-block competency mapping",
      "Prior learning demonstration by blocks",
      "Argued synthesis and conclusion",
      "Defense PowerPoint",
      "VAE oral simulation",
    ],
    detailsFr: "La VAE (Validation des Acquis de l'Expérience) permet d'obtenir un diplôme en valorisant votre expérience professionnelle. Academik vous guide dans la constitution de votre dossier : de la présentation de votre parcours à la démonstration de vos compétences par blocs, en passant par la cartographie assistée de vos acquis. Notre plateforme vous aide à structurer un dossier convaincant et conforme aux attentes des jurys.",
    detailsEn: "VAE (Prior Learning Assessment) allows you to obtain a degree by leveraging your professional experience. Academik guides you through building your application: from presenting your background to demonstrating competencies block by block, including assisted competency mapping. Our platform helps you structure a convincing application that meets jury expectations.",
    price: "179 €",
  },
  {
    slug: "rapport-de-stage",
    category: "project-type",
    icon: Briefcase,
    seoTitleKey: "seo.rapportStageTitle",
    seoDescKey: "seo.rapportStageDescription",
    seoKeywordsKey: "seo.rapportStageKeywords",
    titleFr: "Rapport de Stage",
    titleEn: "Internship Report",
    subtitleFr: "Rédigez votre rapport de stage avec un questionnaire guidé et des sections dédiées.",
    subtitleEn: "Write your internship report with a guided questionnaire and dedicated sections.",
    benefitsFr: [
      "Questionnaire guidé pour collecter les informations",
      "Présentation de l'entreprise et du secteur",
      "Description des missions et du poste",
      "Problématique et objectifs du stage",
      "Analyse des résultats et bilan",
      "Recommandations et perspectives",
      "9 sections dédiées au rapport de stage",
      "Export professionnel Word / PDF",
    ],
    benefitsEn: [
      "Guided questionnaire to collect information",
      "Company and sector presentation",
      "Mission and position description",
      "Research question and internship objectives",
      "Results analysis and review",
      "Recommendations and perspectives",
      "9 dedicated internship report sections",
      "Professional Word / PDF export",
    ],
    detailsFr: "Le rapport de stage est un exercice académique qui demande de relier théorie et pratique professionnelle. Academik propose un parcours spécifique avec un questionnaire guidé qui vous aide à structurer votre réflexion : présentation de l'entreprise, description des missions, analyse des résultats et bilan personnel. Chaque section est générée en cohérence avec les précédentes.",
    detailsEn: "The internship report is an academic exercise that requires linking theory and professional practice. Academik offers a specific pathway with a guided questionnaire that helps you structure your reflection: company presentation, mission description, results analysis and personal review. Each section is generated in coherence with the previous ones.",
    price: "179 €",
  },
  {
    slug: "etude-de-cas",
    category: "project-type",
    icon: Search,
    seoTitleKey: "seo.etudeCasTitle",
    seoDescKey: "seo.etudeCasDescription",
    seoKeywordsKey: "seo.etudeCasKeywords",
    titleFr: "Étude de Cas",
    titleEn: "Case Study",
    subtitleFr: "Analysez et rédigez votre étude de cas avec une structuration méthodique.",
    subtitleEn: "Analyze and write your case study with methodical structuring.",
    benefitsFr: [
      "Présentation du contexte et de l'entreprise",
      "Diagnostic de la situation",
      "Sélection d'outils d'analyse adaptés",
      "Analyse approfondie des données",
      "Recommandations argumentées",
      "Plan d'action opérationnel",
      "8 sections dédiées à l'étude de cas",
      "Modules soutenance, oral, biblio et audit",
    ],
    benefitsEn: [
      "Context and company presentation",
      "Situation diagnosis",
      "Adapted analysis tool selection",
      "In-depth data analysis",
      "Argued recommendations",
      "Operational action plan",
      "8 dedicated case study sections",
      "Defense, oral, bibliography and audit modules",
    ],
    detailsFr: "L'étude de cas est une méthode d'analyse qui permet d'examiner en profondeur une situation réelle. Academik propose un parcours structuré avec 8 sections dédiées : du contexte initial au plan d'action, en passant par le diagnostic et l'analyse avec des outils sélectionnés. Notre plateforme vous aide à développer une réflexion analytique rigoureuse.",
    detailsEn: "The case study is an analytical method that allows in-depth examination of a real situation. Academik offers a structured pathway with 8 dedicated sections: from initial context to action plan, through diagnosis and analysis with selected tools. Our platform helps you develop rigorous analytical thinking.",
    price: "179 €",
  },
  {
    slug: "memoire-professionnel",
    category: "project-type",
    icon: FileCheck,
    seoTitleKey: "seo.memoireProTitle",
    seoDescKey: "seo.memoireProDescription",
    seoKeywordsKey: "seo.memoireProKeywords",
    titleFr: "Mémoire Professionnel",
    titleEn: "Professional Dissertation",
    subtitleFr: "Rédigez votre mémoire professionnel en articulant contexte terrain et cadre académique.",
    subtitleEn: "Write your professional dissertation linking field context and academic framework.",
    benefitsFr: [
      "Questionnaire de contexte professionnel",
      "Analyse du terrain et des pratiques",
      "Problématique ancrée dans le contexte pro",
      "Méthodologie appliquée",
      "Recommandations opérationnelles",
      "Sections académiques standards incluses",
      "Articulation théorie / pratique",
      "Export et mise en page professionnelle",
    ],
    benefitsEn: [
      "Professional context questionnaire",
      "Field and practices analysis",
      "Research question rooted in professional context",
      "Applied methodology",
      "Operational recommendations",
      "Standard academic sections included",
      "Theory / practice articulation",
      "Professional export and formatting",
    ],
    detailsFr: "Le mémoire professionnel se distingue par son ancrage dans la pratique terrain. Academik vous aide à articuler votre expérience professionnelle avec un cadre académique solide. Le parcours commence par un questionnaire de contexte, puis intègre les sections académiques standards (problématique, cadre théorique, méthodologie) en les reliant à votre réalité professionnelle.",
    detailsEn: "The professional dissertation is distinguished by its grounding in field practice. Academik helps you articulate your professional experience with a solid academic framework. The pathway starts with a context questionnaire, then integrates standard academic sections (research question, theoretical framework, methodology) linking them to your professional reality.",
    price: "179 €",
  },
  {
    slug: "problematique",
    category: "core-feature",
    icon: Lightbulb,
    seoTitleKey: "seo.problematiqueTitle",
    seoDescKey: "seo.problematiqueDescription",
    seoKeywordsKey: "seo.problematiqueKeywords",
    titleFr: "Formulation de la Problématique",
    titleEn: "Research Question Formulation",
    subtitleFr: "Formulez une problématique de recherche pertinente, précise et réalisable.",
    subtitleEn: "Formulate a relevant, precise and feasible research question.",
    benefitsFr: [
      "Analyse guidée de votre sujet",
      "Identification des tensions et paradoxes",
      "Formulation en question ouverte",
      "Validation méthodologique automatique",
      "Exemples par domaine (santé, management, RH...)",
      "Cohérence avec les hypothèses et le plan",
    ],
    benefitsEn: [
      "Guided analysis of your subject",
      "Tension and paradox identification",
      "Open question formulation",
      "Automatic methodological validation",
      "Domain-specific examples (health, management, HR...)",
      "Coherence with hypotheses and outline",
    ],
    detailsFr: "La problématique est le fil conducteur de tout travail académique. Academik vous aide à transformer votre sujet en une question de recherche structurée, en identifiant les tensions théoriques et en formulant une interrogation précise, réalisable et originale.",
    detailsEn: "The research question is the guiding thread of any academic work. Academik helps you transform your subject into a structured research question, identifying theoretical tensions and formulating a precise, feasible and original question.",
  },
  {
    slug: "plan-de-travail",
    category: "core-feature",
    icon: Map,
    seoTitleKey: "seo.planTravailTitle",
    seoDescKey: "seo.planTravailDescription",
    seoKeywordsKey: "seo.planTravailKeywords",
    titleFr: "Plan de Travail Structuré",
    titleEn: "Structured Work Plan",
    subtitleFr: "Générez un plan de travail adapté à votre type de projet et votre domaine.",
    subtitleEn: "Generate a work plan adapted to your project type and field.",
    benefitsFr: [
      "Plan généré selon le type de projet",
      "Parties, chapitres et sous-sections",
      "Articulation logique des idées",
      "Adaptation au domaine disciplinaire",
      "Régénération en mode similaire ou différent",
      "Base pour la rédaction section par section",
    ],
    benefitsEn: [
      "Plan generated by project type",
      "Parts, chapters and sub-sections",
      "Logical idea articulation",
      "Disciplinary field adaptation",
      "Regeneration in similar or different mode",
      "Base for section-by-section writing",
    ],
    detailsFr: "Le plan de travail est la colonne vertébrale de votre mémoire. Academik génère un plan structuré en parties, chapitres et sous-sections, adapté à votre type de projet (mémoire, TFE, thèse...) et à votre domaine disciplinaire. Vous pouvez le régénérer en mode similaire ou différent jusqu'à obtenir la structure idéale.",
    detailsEn: "The work plan is the backbone of your dissertation. Academik generates a structured outline with parts, chapters and sub-sections, adapted to your project type (dissertation, thesis, TFE...) and disciplinary field. You can regenerate it in similar or different mode until you get the ideal structure.",
  },
  {
    slug: "cadre-theorique-conceptuel",
    category: "core-feature",
    icon: BrainCircuit,
    seoTitleKey: "seo.cadreTheoriqueTitle",
    seoDescKey: "seo.cadreTheoriqueDescription",
    seoKeywordsKey: "seo.cadreTheoriqueKeywords",
    titleFr: "Cadre Théorique et Conceptuel",
    titleEn: "Theoretical & Conceptual Framework",
    subtitleFr: "Identifiez les concepts clés et théories de référence pour votre recherche.",
    subtitleEn: "Identify key concepts and reference theories for your research.",
    benefitsFr: [
      "Identification des concepts clés",
      "Théories et auteurs de référence",
      "Articulation des notions entre elles",
      "Distinction cadre théorique / conceptuel",
      "Contextualisation dans votre domaine",
      "Cohérence avec la problématique et les hypothèses",
    ],
    benefitsEn: [
      "Key concept identification",
      "Reference theories and authors",
      "Notion articulation",
      "Theoretical vs. conceptual framework distinction",
      "Field contextualization",
      "Coherence with research question and hypotheses",
    ],
    detailsFr: "Le cadre théorique et conceptuel constitue le socle scientifique de votre travail. Academik vous aide à identifier les concepts clés, les théories de référence et les auteurs principaux, puis à les articuler de manière cohérente avec votre problématique et vos hypothèses.",
    detailsEn: "The theoretical and conceptual framework constitutes the scientific foundation of your work. Academik helps you identify key concepts, reference theories and main authors, then articulate them coherently with your research question and hypotheses.",
  },
  {
    slug: "revue-de-litterature",
    category: "core-feature",
    icon: BookMarked,
    seoTitleKey: "seo.revueLitteratureTitle",
    seoDescKey: "seo.revueLitteratureDescription",
    seoKeywordsKey: "seo.revueLitteratureKeywords",
    titleFr: "Revue de Littérature",
    titleEn: "Literature Review",
    subtitleFr: "Analysez et synthétisez les sources académiques pour votre recherche.",
    subtitleEn: "Analyze and synthesize academic sources for your research.",
    benefitsFr: [
      "Recherche bibliographique guidée",
      "Analyse d'articles scientifiques",
      "Synthèse thématique des sources",
      "Confrontation des auteurs",
      "Identification des lacunes dans la littérature",
      "Bibliographie multi-normes (APA, MLA, Chicago, Vancouver)",
    ],
    benefitsEn: [
      "Guided bibliographic research",
      "Scientific article analysis",
      "Thematic source synthesis",
      "Author confrontation",
      "Literature gap identification",
      "Multi-standard bibliography (APA, MLA, Chicago, Vancouver)",
    ],
    detailsFr: "La revue de littérature est une étape essentielle qui permet de situer votre recherche dans le paysage scientifique existant. Academik vous aide à analyser des articles, synthétiser les apports de différents auteurs et identifier les lacunes que votre travail va combler.",
    detailsEn: "The literature review is an essential step that positions your research within the existing scientific landscape. Academik helps you analyze articles, synthesize contributions from different authors and identify gaps that your work will fill.",
  },
  {
    slug: "methodologie-recherche",
    category: "core-feature",
    icon: FlaskConical,
    seoTitleKey: "seo.methodologieTitle",
    seoDescKey: "seo.methodologieDescription",
    seoKeywordsKey: "seo.methodologieKeywords",
    titleFr: "Méthodologie de Recherche",
    titleEn: "Research Methodology",
    subtitleFr: "Définissez votre approche méthodologique, vos outils de collecte et votre protocole.",
    subtitleEn: "Define your methodological approach, collection tools and protocol.",
    benefitsFr: [
      "Choix de l'approche (qualitative / quantitative / mixte)",
      "Outils de collecte de données",
      "Stratégie d'échantillonnage",
      "Protocole de recherche détaillé",
      "Justification méthodologique",
      "Limites et biais identifiés",
    ],
    benefitsEn: [
      "Approach choice (qualitative / quantitative / mixed)",
      "Data collection tools",
      "Sampling strategy",
      "Detailed research protocol",
      "Methodological justification",
      "Identified limitations and biases",
    ],
    detailsFr: "La méthodologie est le cœur scientifique de votre recherche. Academik vous guide dans le choix de votre approche (qualitative, quantitative ou mixte), la définition de vos outils de collecte, votre stratégie d'échantillonnage et la rédaction de votre protocole de recherche.",
    detailsEn: "The methodology is the scientific heart of your research. Academik guides you through choosing your approach (qualitative, quantitative or mixed), defining your collection tools, your sampling strategy and writing your research protocol.",
  },
  {
    slug: "redaction-assistee",
    category: "core-feature",
    icon: PenTool,
    seoTitleKey: "seo.redactionTitle",
    seoDescKey: "seo.redactionDescription",
    seoKeywordsKey: "seo.redactionKeywords",
    titleFr: "Rédaction Assistée",
    titleEn: "Assisted Writing",
    subtitleFr: "Rédigez chaque section dans un registre académique avec reformulation et développement.",
    subtitleEn: "Write each section in academic register with reformulation and development.",
    benefitsFr: [
      "Reformulation en registre académique",
      "Développement et enrichissement du contenu",
      "Synthèse et condensation",
      "Correction et amélioration stylistique",
      "Historique des versions",
      "Régénération contrôlée (similaire / différent)",
    ],
    benefitsEn: [
      "Academic register reformulation",
      "Content development and enrichment",
      "Synthesis and condensation",
      "Stylistic correction and improvement",
      "Version history",
      "Controlled regeneration (similar / different)",
    ],
    detailsFr: "La rédaction assistée d'Academik ne remplace pas votre travail : elle l'enrichit. Vous pouvez reformuler dans un registre académique, développer vos idées, synthétiser des passages et améliorer la qualité rédactionnelle. Chaque modification est tracée dans l'historique des versions.",
    detailsEn: "Academik's assisted writing doesn't replace your work: it enriches it. You can reformulate in academic register, develop your ideas, synthesize passages and improve writing quality. Each modification is tracked in version history.",
  },
  {
    slug: "export-word-pdf",
    category: "core-feature",
    icon: FileText,
    seoTitleKey: "seo.exportTitle",
    seoDescKey: "seo.exportDescription",
    seoKeywordsKey: "seo.exportKeywords",
    titleFr: "Export Word et PDF",
    titleEn: "Word & PDF Export",
    subtitleFr: "Exportez votre travail en Word (.docx) ou PDF avec une mise en page professionnelle.",
    subtitleEn: "Export your work to Word (.docx) or PDF with professional formatting.",
    benefitsFr: [
      "Export Word (.docx) formaté",
      "Export PDF avec mise en page",
      "Sommaire automatique",
      "Mise en page académique standard",
      "Export section par section ou complet",
      "Fusion du mémoire en un seul document",
    ],
    benefitsEn: [
      "Formatted Word (.docx) export",
      "PDF export with layout",
      "Automatic table of contents",
      "Standard academic formatting",
      "Section-by-section or complete export",
      "Dissertation merge into single document",
    ],
    detailsFr: "Une fois votre travail rédigé et validé, Academik vous permet de l'exporter en Word ou PDF avec une mise en page académique professionnelle. Vous pouvez exporter section par section ou l'intégralité de votre mémoire, avec un sommaire automatique.",
    detailsEn: "Once your work is written and validated, Academik lets you export it to Word or PDF with professional academic formatting. You can export section by section or your entire dissertation, with an automatic table of contents.",
  },
  {
    slug: "questionnaire-recherche",
    category: "optional-module",
    icon: ClipboardList,
    seoTitleKey: "seo.questionnaireTitle",
    seoDescKey: "seo.questionnaireDescription",
    seoKeywordsKey: "seo.questionnaireKeywords",
    titleFr: "Questionnaire de Recherche",
    titleEn: "Research Questionnaire",
    subtitleFr: "Créez et diffusez votre questionnaire de recherche avec collecte automatisée.",
    subtitleEn: "Create and distribute your research questionnaire with automated collection.",
    benefitsFr: ["Questions ouvertes et fermées", "Échelles de Likert", "Diffusion par lien partageable", "Collecte automatisée des réponses", "Export des données", "Intégration avec le dépouillement"],
    benefitsEn: ["Open and closed questions", "Likert scales", "Shareable link distribution", "Automated response collection", "Data export", "Integration with analysis"],
    detailsFr: "Le module Questionnaire vous permet de créer un questionnaire de recherche complet, de le diffuser en ligne via un lien partageable et de collecter automatiquement les réponses pour votre analyse.",
    detailsEn: "The Questionnaire module lets you create a complete research questionnaire, distribute it online via a shareable link and automatically collect responses for your analysis.",
    price: "25 €",
  },
  {
    slug: "guide-entretien",
    category: "optional-module",
    icon: MessageSquare,
    seoTitleKey: "seo.guideEntretienTitle",
    seoDescKey: "seo.guideEntretienDescription",
    seoKeywordsKey: "seo.guideEntretienKeywords",
    titleFr: "Guide d'Entretien",
    titleEn: "Interview Guide",
    subtitleFr: "Structurez vos entretiens semi-directifs avec un guide thématique.",
    subtitleEn: "Structure your semi-structured interviews with a thematic guide.",
    benefitsFr: ["Questions principales par thème", "Relances et sous-questions", "Protocole d'entretien", "Adapté à la recherche qualitative", "Cohérent avec votre problématique", "Export du guide"],
    benefitsEn: ["Main questions by theme", "Follow-ups and sub-questions", "Interview protocol", "Adapted to qualitative research", "Coherent with your research question", "Guide export"],
    detailsFr: "Le guide d'entretien est essentiel pour la recherche qualitative. Academik génère un guide structuré par thématiques avec des questions principales, des relances et un protocole adapté à vos objectifs de recherche.",
    detailsEn: "The interview guide is essential for qualitative research. Academik generates a structured guide by themes with main questions, follow-ups and a protocol adapted to your research objectives.",
    price: "25 €",
  },
  {
    slug: "depouillement-questionnaire",
    category: "optional-module",
    icon: BarChart3,
    seoTitleKey: "seo.depouilElementTitle",
    seoDescKey: "seo.depouilElementDescription",
    seoKeywordsKey: "seo.depouilElementKeywords",
    titleFr: "Dépouillement du Questionnaire",
    titleEn: "Questionnaire Analysis",
    subtitleFr: "Analysez vos données avec tri à plat, tableaux croisés et graphiques automatiques.",
    subtitleEn: "Analyze your data with frequency tables, cross-tabulations and automatic charts.",
    benefitsFr: ["Tri à plat et tri croisé", "Graphiques automatiques (barres, camembert, radar)", "Import CSV / Excel", "Synchronisation avec le module Formulaire", "Analyse thématique", "Interprétation assistée"],
    benefitsEn: ["Frequency and cross-tabulation", "Automatic charts (bar, pie, radar)", "CSV / Excel import", "Form module sync", "Thematic analysis", "Assisted interpretation"],
    detailsFr: "Le module Dépouillement permet d'analyser vos données de questionnaire : tableaux croisés, graphiques variés et interprétation statistique. Les données peuvent être importées depuis CSV/Excel ou synchronisées depuis le module Formulaire.",
    detailsEn: "The Analysis module lets you analyze your questionnaire data: cross-tabulations, various charts and statistical interpretation. Data can be imported from CSV/Excel or synced from the Form module.",
    price: "29 €",
  },
  {
    slug: "analyse-qualitative",
    category: "optional-module",
    icon: Eye,
    seoTitleKey: "seo.analyseQualiTitle",
    seoDescKey: "seo.analyseQualiDescription",
    seoKeywordsKey: "seo.analyseQualiKeywords",
    titleFr: "Analyse Qualitative",
    titleEn: "Qualitative Analysis",
    subtitleFr: "Codage thématique, analyse de verbatims et synthèse interprétative.",
    subtitleEn: "Thematic coding, verbatim analysis and interpretive synthesis.",
    benefitsFr: ["Codage thématique automatisé", "Analyse de verbatims", "Catégorisation des données", "Synthèse interprétative", "Identification des patterns", "Visualisation des thèmes"],
    benefitsEn: ["Automated thematic coding", "Verbatim analysis", "Data categorization", "Interpretive synthesis", "Pattern identification", "Theme visualization"],
    detailsFr: "L'analyse qualitative est au cœur de nombreuses recherches en sciences humaines. Academik vous assiste dans le codage thématique de vos entretiens, l'analyse de verbatims et la production d'une synthèse interprétative rigoureuse.",
    detailsEn: "Qualitative analysis is at the heart of much research in social sciences. Academik assists you in thematic coding of your interviews, verbatim analysis and producing a rigorous interpretive synthesis.",
    price: "39 €",
  },
  {
    slug: "analyse-quantitative",
    category: "optional-module",
    icon: BarChart3,
    seoTitleKey: "seo.analyseQuantiTitle",
    seoDescKey: "seo.analyseQuantiDescription",
    seoKeywordsKey: "seo.analyseQuantiKeywords",
    titleFr: "Analyse Quantitative",
    titleEn: "Quantitative Analysis",
    subtitleFr: "Tableaux statistiques, graphiques avancés et interprétation des résultats.",
    subtitleEn: "Statistical tables, advanced charts and results interpretation.",
    benefitsFr: ["Tableaux statistiques complets", "Graphiques (barres, lignes, aires, radar)", "Tendances et corrélations", "Interprétation automatisée", "Export des visualisations", "Intégration dans le mémoire"],
    benefitsEn: ["Complete statistical tables", "Charts (bar, line, area, radar)", "Trends and correlations", "Automated interpretation", "Visualization export", "Dissertation integration"],
    detailsFr: "Le module d'analyse quantitative transforme vos données brutes en résultats exploitables : tableaux statistiques, graphiques variés et interprétation automatisée pour enrichir votre partie empirique.",
    detailsEn: "The quantitative analysis module transforms your raw data into usable results: statistical tables, various charts and automated interpretation to enrich your empirical section.",
    price: "39 €",
  },
  {
    slug: "confrontation-resultats",
    category: "optional-module",
    icon: Layers,
    seoTitleKey: "seo.confrontationTitle",
    seoDescKey: "seo.confrontationDescription",
    seoKeywordsKey: "seo.confrontationKeywords",
    titleFr: "Confrontation des Résultats",
    titleEn: "Results Confrontation",
    subtitleFr: "Mettez en perspective vos résultats avec la littérature scientifique.",
    subtitleEn: "Put your results in perspective with scientific literature.",
    benefitsFr: ["Confrontation résultats / littérature", "Identification des convergences", "Analyse des divergences", "Apport original de votre recherche", "Discussion structurée", "Liens avec le cadre théorique"],
    benefitsEn: ["Results vs. literature confrontation", "Convergence identification", "Divergence analysis", "Original research contribution", "Structured discussion", "Links with theoretical framework"],
    detailsFr: "La confrontation des résultats est une étape cruciale de la discussion académique. Academik vous aide à mettre vos résultats en perspective avec la littérature existante, identifiant convergences et divergences pour dégager l'apport original de votre recherche.",
    detailsEn: "Results confrontation is a crucial step in academic discussion. Academik helps you put your results in perspective with existing literature, identifying convergences and divergences to highlight the original contribution of your research.",
    price: "19 €",
  },
  {
    slug: "validation-hypotheses",
    category: "optional-module",
    icon: ListChecks,
    seoTitleKey: "seo.validationHypTitle",
    seoDescKey: "seo.validationHypDescription",
    seoKeywordsKey: "seo.validationHypKeywords",
    titleFr: "Validation des Hypothèses",
    titleEn: "Hypothesis Validation",
    subtitleFr: "Validez ou invalidez vos hypothèses avec une argumentation méthodologique.",
    subtitleEn: "Validate or invalidate your hypotheses with methodological argumentation.",
    benefitsFr: ["Validation / invalidation structurée", "Confrontation aux données empiriques", "Argumentation méthodologique", "Conclusion par hypothèse", "Cohérence avec la problématique", "Rigueur scientifique"],
    benefitsEn: ["Structured validation / invalidation", "Empirical data confrontation", "Methodological argumentation", "Per-hypothesis conclusion", "Research question coherence", "Scientific rigor"],
    detailsFr: "Le module de validation des hypothèses vous permet de confronter chaque hypothèse à vos données de recherche, de construire une argumentation structurée et de conclure de manière méthodologique sur la validation ou l'invalidation de chaque hypothèse.",
    detailsEn: "The hypothesis validation module lets you confront each hypothesis with your research data, build structured argumentation and methodologically conclude on the validation or invalidation of each hypothesis.",
    price: "19 €",
  },
  {
    slug: "formulaire-en-ligne",
    category: "optional-module",
    icon: Globe,
    seoTitleKey: "seo.formulaireTitle",
    seoDescKey: "seo.formulaireDescription",
    seoKeywordsKey: "seo.formulaireKeywords",
    titleFr: "Formulaire en Ligne",
    titleEn: "Online Form Builder",
    subtitleFr: "Créez des formulaires en ligne avec collecte de réponses en temps réel.",
    subtitleEn: "Create online forms with real-time response collection.",
    benefitsFr: ["Types de questions variés (texte, QCM, Likert, oui/non)", "Liens partageables publics", "Collecte en temps réel", "Tableau de bord des réponses", "Synchronisation avec le dépouillement", "Aucune inscription requise pour les répondants"],
    benefitsEn: ["Various question types (text, MCQ, Likert, yes/no)", "Public shareable links", "Real-time collection", "Response dashboard", "Sync with analysis module", "No registration required for respondents"],
    detailsFr: "Le module Formulaire vous permet de créer des enquêtes en ligne complètes, de les diffuser via un lien public et de suivre les réponses en temps réel depuis un tableau de bord dédié. Les données sont automatiquement synchronisées avec le module de dépouillement.",
    detailsEn: "The Form module lets you create complete online surveys, distribute them via a public link and track responses in real-time from a dedicated dashboard. Data is automatically synced with the analysis module.",
    price: "25 €",
  },
  {
    slug: "simulation-financiere",
    category: "optional-module",
    icon: Calculator,
    seoTitleKey: "seo.simulationFinTitle",
    seoDescKey: "seo.simulationFinDescription",
    seoKeywordsKey: "seo.simulationFinKeywords",
    titleFr: "Simulation Financière",
    titleEn: "Financial Simulation",
    subtitleFr: "Réalisez vos prévisionnels financiers pour votre projet ou mémoire.",
    subtitleEn: "Create financial forecasts for your project or dissertation.",
    benefitsFr: ["Compte de résultat prévisionnel", "Plan de trésorerie", "Seuil de rentabilité", "Analyse financière complète", "Graphiques financiers", "Export des tableaux"],
    benefitsEn: ["Projected income statement", "Cash flow plan", "Break-even point", "Complete financial analysis", "Financial charts", "Table export"],
    detailsFr: "Le module de simulation financière vous permet de réaliser des prévisionnels complets : compte de résultat, plan de trésorerie, seuil de rentabilité et analyse financière, indispensables pour les mémoires en gestion, management ou entrepreneuriat.",
    detailsEn: "The financial simulation module lets you create complete forecasts: income statement, cash flow plan, break-even point and financial analysis, essential for management, business or entrepreneurship dissertations.",
    price: "29 €",
  },
  {
    slug: "powerpoint-soutenance",
    category: "optional-module",
    icon: Presentation,
    seoTitleKey: "seo.soutenancePptTitle",
    seoDescKey: "seo.soutenancePptDescription",
    seoKeywordsKey: "seo.soutenancePptKeywords",
    titleFr: "PowerPoint de Soutenance",
    titleEn: "Defense PowerPoint",
    subtitleFr: "Générez un diaporama structuré pour votre soutenance académique.",
    subtitleEn: "Generate a structured slideshow for your academic defense.",
    benefitsFr: ["Plan de soutenance structuré", "Slides clés générées", "Contenu synthétisé", "Mise en forme professionnelle", "Adapté à votre type de projet", "Export PowerPoint"],
    benefitsEn: ["Structured defense plan", "Key slides generated", "Synthesized content", "Professional formatting", "Adapted to your project type", "PowerPoint export"],
    detailsFr: "La soutenance est l'étape finale de votre parcours académique. Academik génère un PowerPoint structuré qui synthétise les points clés de votre travail : problématique, méthodologie, résultats et conclusion, dans un format professionnel prêt à présenter.",
    detailsEn: "The defense is the final step of your academic journey. Academik generates a structured PowerPoint that synthesizes the key points of your work: research question, methodology, results and conclusion, in a professional format ready to present.",
    price: "29 €",
  },
  {
    slug: "simulation-soutenance",
    category: "optional-module",
    icon: Mic,
    seoTitleKey: "seo.soutenanceSimTitle",
    seoDescKey: "seo.soutenanceSimDescription",
    seoKeywordsKey: "seo.soutenanceSimKeywords",
    titleFr: "Simulation de Soutenance",
    titleEn: "Defense Simulation",
    subtitleFr: "Préparez votre oral avec une simulation de questions du jury.",
    subtitleEn: "Prepare your oral with a jury question simulation.",
    benefitsFr: ["Simulation de questions du jury", "Réponses argumentées suggérées", "Gestion du stress", "Entraînement à l'oral", "Questions adaptées à votre sujet", "Retours et conseils"],
    benefitsEn: ["Jury question simulation", "Suggested argued answers", "Stress management", "Oral presentation training", "Subject-adapted questions", "Feedback and advice"],
    detailsFr: "La simulation de soutenance vous prépare aux questions potentielles du jury. Academik génère des questions adaptées à votre sujet, vous propose des pistes de réponses argumentées et vous aide à vous entraîner pour le jour J.",
    detailsEn: "The defense simulation prepares you for potential jury questions. Academik generates questions adapted to your subject, suggests argued answer paths and helps you practice for the big day.",
    price: "29 €",
  },
  {
    slug: "audit-memoire",
    category: "optional-module",
    icon: ShieldCheck,
    seoTitleKey: "seo.auditTitle",
    seoDescKey: "seo.auditDescription",
    seoKeywordsKey: "seo.auditKeywords",
    titleFr: "Audit Complet du Mémoire",
    titleEn: "Complete Dissertation Audit",
    subtitleFr: "Faites vérifier la cohérence, la structure et la qualité de votre travail.",
    subtitleEn: "Have the coherence, structure and quality of your work verified.",
    benefitsFr: ["Vérification de la cohérence globale", "Respect des normes académiques", "Qualité rédactionnelle", "Analyse de la structure", "Recommandations d'amélioration", "Score de qualité détaillé"],
    benefitsEn: ["Global coherence check", "Academic standards compliance", "Writing quality", "Structure analysis", "Improvement recommendations", "Detailed quality score"],
    detailsFr: "L'audit de mémoire analyse l'ensemble de votre travail pour identifier les points forts et les axes d'amélioration : cohérence entre les sections, respect des normes académiques, qualité de la rédaction et force de l'argumentation.",
    detailsEn: "The dissertation audit analyzes your entire work to identify strengths and areas for improvement: section coherence, academic standards compliance, writing quality and argumentation strength.",
    price: "49 €",
  },
  {
    slug: "bibliographie-multi-normes",
    category: "optional-module",
    icon: BookOpen,
    seoTitleKey: "seo.biblioTitle",
    seoDescKey: "seo.biblioDescription",
    seoKeywordsKey: "seo.biblioKeywords",
    titleFr: "Bibliographie Multi-Normes",
    titleEn: "Multi-Standard Bibliography",
    subtitleFr: "Générez votre bibliographie en APA, Vancouver, MLA ou Chicago.",
    subtitleEn: "Generate your bibliography in APA, Vancouver, MLA or Chicago.",
    benefitsFr: ["Normes APA 7e édition", "Norme Vancouver", "Norme MLA", "Norme Chicago", "Formatage automatique", "Gestion des sources"],
    benefitsEn: ["APA 7th edition", "Vancouver standard", "MLA standard", "Chicago standard", "Automatic formatting", "Source management"],
    detailsFr: "Le module Bibliographie multi-normes formate automatiquement vos références selon la norme requise par votre établissement : APA, Vancouver, MLA ou Chicago. Plus besoin de vous soucier des règles de formatage complexes.",
    detailsEn: "The multi-standard bibliography module automatically formats your references according to the standard required by your institution: APA, Vancouver, MLA or Chicago. No more worrying about complex formatting rules.",
    price: "25 €",
  },
  {
    slug: "analyse-articles-scientifiques",
    category: "optional-module",
    icon: Search,
    seoTitleKey: "seo.articleAnalysisTitle",
    seoDescKey: "seo.articleAnalysisDescription",
    seoKeywordsKey: "seo.articleAnalysisKeywords",
    titleFr: "Analyse d'Articles Scientifiques",
    titleEn: "Scientific Article Analysis",
    subtitleFr: "Analysez et résumez vos articles pour alimenter votre revue de littérature.",
    subtitleEn: "Analyze and summarize your articles to feed your literature review.",
    benefitsFr: ["Extraction des idées clés", "Analyse de la méthodologie", "Résumé structuré", "Positionnement critique", "Intégration dans la revue de littérature", "Confrontation des articles entre eux"],
    benefitsEn: ["Key idea extraction", "Methodology analysis", "Structured summary", "Critical positioning", "Literature review integration", "Inter-article confrontation"],
    detailsFr: "Le module d'analyse d'articles vous permet de décortiquer chaque article scientifique : extraction des idées principales, analyse de la méthodologie, résumé structuré et positionnement critique pour enrichir votre revue de littérature.",
    detailsEn: "The article analysis module lets you dissect each scientific article: main idea extraction, methodology analysis, structured summary and critical positioning to enrich your literature review.",
    price: "29 €",
  },
  {
    slug: "simulation-entretien",
    category: "optional-module",
    icon: Mic,
    seoTitleKey: "seo.simulationEntretienTitle",
    seoDescKey: "seo.simulationEntretienDescription",
    seoKeywordsKey: "seo.simulationEntretienKeywords",
    titleFr: "Simulation d'Entretien Guidée",
    titleEn: "Guided Interview Simulation",
    subtitleFr: "Préparez et simulez vos entretiens de recherche de manière interactive.",
    subtitleEn: "Prepare and simulate your research interviews interactively.",
    benefitsFr: ["Simulation interactive", "Reformulation des questions", "Relances automatiques", "Retranscription", "Adapté aux entretiens semi-directifs", "Entraînement avant terrain"],
    benefitsEn: ["Interactive simulation", "Question reformulation", "Automatic follow-ups", "Transcription", "Adapted to semi-structured interviews", "Pre-field training"],
    detailsFr: "La simulation d'entretien vous permet de vous entraîner avant d'aller sur le terrain. Academik simule un entretien interactif avec reformulation, relances et retranscription pour vous préparer à mener vos entretiens semi-directifs.",
    detailsEn: "The interview simulation lets you practice before going into the field. Academik simulates an interactive interview with reformulation, follow-ups and transcription to prepare you for conducting your semi-structured interviews.",
    price: "19 €",
  },
  {
    slug: "page-remerciements",
    category: "optional-module",
    icon: Sparkles,
    seoTitleKey: "seo.remerciementsTitle",
    seoDescKey: "seo.remerciementsDescription",
    seoKeywordsKey: "seo.remerciementsKeywords",
    titleFr: "Page de Remerciements",
    titleEn: "Acknowledgments Page",
    subtitleFr: "Rédigez des remerciements appropriés pour votre travail académique.",
    subtitleEn: "Write appropriate acknowledgments for your academic work.",
    benefitsFr: ["Structure type de remerciements", "Formules académiques appropriées", "Personnalisation", "Registre adapté", "Plusieurs versions proposées", "Intégration dans le document final"],
    benefitsEn: ["Standard acknowledgments structure", "Appropriate academic expressions", "Personalization", "Adapted register", "Multiple versions proposed", "Final document integration"],
    detailsFr: "Les remerciements ouvrent votre mémoire et témoignent de votre gratitude envers les personnes qui ont contribué à votre travail. Academik vous propose des formulations appropriées et personnalisables.",
    detailsEn: "Acknowledgments open your dissertation and express gratitude toward people who contributed to your work. Academik suggests appropriate and customizable formulations.",
    price: "9 €",
  },
  {
    slug: "resume-abstract",
    category: "optional-module",
    icon: FileText,
    seoTitleKey: "seo.abstractTitle",
    seoDescKey: "seo.abstractDescription",
    seoKeywordsKey: "seo.abstractKeywords",
    titleFr: "Résumé et Abstract",
    titleEn: "Abstract & Summary",
    subtitleFr: "Synthétisez votre travail en un résumé structuré bilingue.",
    subtitleEn: "Synthesize your work into a bilingual structured summary.",
    benefitsFr: ["Résumé en français", "Abstract en anglais", "Mots-clés pertinents", "Synthèse structurée", "Conforme aux normes académiques", "Traduction bilingue"],
    benefitsEn: ["French summary", "English abstract", "Relevant keywords", "Structured synthesis", "Academic standards compliant", "Bilingual translation"],
    detailsFr: "Le résumé et l'abstract sont des éléments indispensables de tout travail académique. Academik génère une synthèse bilingue (français/anglais) structurée avec les mots-clés pertinents pour référencer votre travail.",
    detailsEn: "The summary and abstract are essential elements of any academic work. Academik generates a bilingual (French/English) structured synthesis with relevant keywords to reference your work.",
    price: "9 €",
  },
  {
    slug: "page-de-couverture",
    category: "optional-module",
    icon: Package,
    seoTitleKey: "seo.coverPageTitle",
    seoDescKey: "seo.coverPageDescription",
    seoKeywordsKey: "seo.coverPageKeywords",
    titleFr: "Page de Couverture",
    titleEn: "Cover Page",
    subtitleFr: "Créez une page de couverture professionnelle pour votre mémoire.",
    subtitleEn: "Create a professional cover page for your dissertation.",
    benefitsFr: ["Titre et sous-titre formatés", "Informations étudiant", "Logo de l'établissement", "Mise en page professionnelle", "Conforme aux normes", "Export intégré"],
    benefitsEn: ["Formatted title and subtitle", "Student information", "Institution logo", "Professional layout", "Standards compliant", "Integrated export"],
    detailsFr: "La page de couverture est la première impression de votre travail. Academik génère une page de couverture professionnelle avec toutes les informations requises : titre, sous-titre, nom, établissement et date.",
    detailsEn: "The cover page is the first impression of your work. Academik generates a professional cover page with all required information: title, subtitle, name, institution and date.",
    price: "15 €",
  },
];

export { MODULE_CATALOG };

function getCategoryLabel(category: string, lang: string): string {
  const labels: Record<string, { fr: string; en: string }> = {
    "project-type": { fr: "Type de projet", en: "Project Type" },
    "core-feature": { fr: "Fonctionnalité principale", en: "Core Feature" },
    "optional-module": { fr: "Module optionnel", en: "Optional Module" },
  };
  return labels[category]?.[lang as "fr" | "en"] || category;
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "project-type": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "core-feature": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    "optional-module": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return colors[category] || "";
}

function Navbar() {
  const { lang } = useI18n();
  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight">Academik</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Link href="/fonctionnalites">
            <Button variant="ghost" className="hidden sm:flex" data-testid="nav-modules">
              {lang === "fr" ? "Fonctionnalités" : "Features"}
            </Button>
          </Link>
          <LanguageSelector />
          <a href="/api/login">
            <Button variant="outline" data-testid="button-login">
              {lang === "fr" ? "Se connecter" : "Sign In"}
            </Button>
          </a>
          <a href="/api/login">
            <Button data-testid="button-signup">
              {lang === "fr" ? "S'inscrire" : "Sign Up"}
            </Button>
          </a>
        </div>
      </div>
    </nav>
  );
}

function ModuleIndex() {
  const { t, lang } = useI18n();

  const projectTypes = MODULE_CATALOG.filter(m => m.category === "project-type");
  const coreFeatures = MODULE_CATALOG.filter(m => m.category === "core-feature");
  const optionalModules = MODULE_CATALOG.filter(m => m.category === "optional-module");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": lang === "fr" ? "Fonctionnalités Academik" : "Academik Features",
    "description": t("seo.modulesIndexDescription"),
    "numberOfItems": MODULE_CATALOG.length,
    "itemListElement": MODULE_CATALOG.map((m, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": lang === "fr" ? m.titleFr : m.titleEn,
      "url": `https://academik.fr/fonctionnalites/${m.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        titleKey="seo.modulesIndexTitle"
        descriptionKey="seo.modulesIndexDescription"
        keywordsKey="seo.modulesIndexKeywords"
        canonicalPath="/fonctionnalites"
        jsonLd={jsonLd}
      />
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            {lang === "fr" ? "Toutes les Fonctionnalités" : "All Features"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {lang === "fr"
              ? "Découvrez l'ensemble des modules et outils proposés par Academik pour accompagner votre travail académique."
              : "Discover all the modules and tools offered by Academik to support your academic work."}
          </p>
        </div>

        <Section
          title={lang === "fr" ? "Types de Projets" : "Project Types"}
          subtitle={lang === "fr" ? "Choisissez le type de travail académique que vous souhaitez rédiger." : "Choose the type of academic work you want to write."}
          items={projectTypes}
          lang={lang}
        />

        <Section
          title={lang === "fr" ? "Fonctionnalités Principales" : "Core Features"}
          subtitle={lang === "fr" ? "Incluses dans le pack fondamental à 179 €." : "Included in the core pack at 179 €."}
          items={coreFeatures}
          lang={lang}
        />

        <Section
          title={lang === "fr" ? "Modules Optionnels" : "Optional Modules"}
          subtitle={lang === "fr" ? "Enrichissez votre expérience avec des modules à la carte." : "Enhance your experience with à la carte modules."}
          items={optionalModules}
          lang={lang}
        />

        <div className="text-center mt-16">
          <a href="/api/login">
            <Button size="lg" data-testid="button-modules-cta">
              {lang === "fr" ? "Commencer maintenant" : "Get Started Now"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

function Section({ title, subtitle, items, lang }: { title: string; subtitle: string; items: ModuleEntry[]; lang: string }) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-8">{subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link key={item.slug} href={`/fonctionnalites/${item.slug}`}>
            <Card className="h-full hover-elevate cursor-pointer" data-testid={`card-module-${item.slug}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(item.category)}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{lang === "fr" ? item.titleFr : item.titleEn}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{lang === "fr" ? item.subtitleFr : item.subtitleEn}</p>
                    {item.price && (
                      <Badge variant="secondary" className="mt-2 text-xs">{item.price}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ModuleDetail({ entry }: { entry: ModuleEntry }) {
  const { lang } = useI18n();
  const Icon = entry.icon;

  const relatedModules = MODULE_CATALOG.filter(m => m.category === entry.category && m.slug !== entry.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `Academik - ${lang === "fr" ? entry.titleFr : entry.titleEn}`,
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "description": lang === "fr" ? entry.subtitleFr : entry.subtitleEn,
    "url": `https://academik.fr/fonctionnalites/${entry.slug}`,
    ...(entry.price ? { "offers": { "@type": "Offer", "price": entry.price.replace(" €", ""), "priceCurrency": "EUR" } } : {}),
    "creator": {
      "@type": "Organization",
      "name": "Performance Consulting Groupe SAS",
      "url": "https://academik.fr",
    },
    "inLanguage": ["fr", "en"],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        titleKey={entry.seoTitleKey}
        descriptionKey={entry.seoDescKey}
        keywordsKey={entry.seoKeywordsKey}
        canonicalPath={`/fonctionnalites/${entry.slug}`}
        jsonLd={jsonLd}
      />
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Link href="/fonctionnalites">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-modules">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {lang === "fr" ? "Toutes les fonctionnalités" : "All features"}
          </Button>
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(entry.category)}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              {getCategoryLabel(entry.category, lang)}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lang === "fr" ? entry.titleFr : entry.titleEn}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              {lang === "fr" ? entry.subtitleFr : entry.subtitleEn}
            </p>
            {entry.price && (
              <Badge className="mt-3 text-sm">{lang === "fr" ? `À partir de ${entry.price}` : `From ${entry.price}`}</Badge>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">
              {lang === "fr" ? "Ce que vous obtenez" : "What you get"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(lang === "fr" ? entry.benefitsFr : entry.benefitsEn).map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">
              {lang === "fr" ? "En détail" : "In detail"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {lang === "fr" ? entry.detailsFr : entry.detailsEn}
            </p>
          </CardContent>
        </Card>

        <div className="text-center mb-16">
          <a href="/api/login">
            <Button size="lg" data-testid="button-module-cta">
              {lang === "fr" ? "Commencer avec Academik" : "Get Started with Academik"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-3">
            {lang === "fr" ? "Inscription gratuite. Aucune carte bancaire requise." : "Free registration. No credit card required."}
          </p>
        </div>

        {relatedModules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {lang === "fr" ? "Modules similaires" : "Similar modules"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedModules.map((m) => (
                <Link key={m.slug} href={`/fonctionnalites/${m.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-related-${m.slug}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <m.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-sm">{lang === "fr" ? m.titleFr : m.titleEn}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{lang === "fr" ? m.subtitleFr : m.subtitleEn}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer lang={lang} />
    </div>
  );
}

function Footer({ lang }: { lang: string }) {
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                  A
                </div>
                <span className="font-bold text-lg">Academik</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              {lang === "fr"
                ? "Un assistant méthodologique intelligent."
                : "An intelligent methodological assistant."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
            <Link href="/fonctionnalites">
              <Button variant="ghost" size="sm" data-testid="link-footer-modules">
                {lang === "fr" ? "Fonctionnalités" : "Features"}
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" data-testid="link-footer-blog">Blog</Button>
            </Link>
            <Link href="/legal/cgu">
              <Button variant="ghost" size="sm" data-testid="link-footer-cgu">
                {lang === "fr" ? "CGU" : "Terms of Use"}
              </Button>
            </Link>
            <Link href="/legal/cgv">
              <Button variant="ghost" size="sm" data-testid="link-footer-cgv">
                {lang === "fr" ? "CGV" : "Terms of Sale"}
              </Button>
            </Link>
            <Link href="/legal/politique-de-confidentialite">
              <Button variant="ghost" size="sm" data-testid="link-footer-privacy">
                {lang === "fr" ? "Confidentialité" : "Privacy"}
              </Button>
            </Link>
          </div>
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Performance Consulting Groupe SAS – SIREN 913 540 944</p>
            <p>3 Avenue de Toulouse, 66140 Canet-en-Roussillon</p>
            <p><a href="mailto:contact@academik.fr" className="hover:underline">contact@academik.fr</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function ModulePage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug;

  if (!slug) {
    return <ModuleIndex />;
  }

  const entry = MODULE_CATALOG.find(m => m.slug === slug);

  if (!entry) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-muted-foreground mb-8">Ce module n'existe pas.</p>
          <Link href="/fonctionnalites">
            <Button data-testid="button-back-modules-404">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Toutes les fonctionnalités
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ModuleDetail entry={entry} />;
}
