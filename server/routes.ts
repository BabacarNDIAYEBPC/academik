import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { SECTION_LABELS, SECTION_STATUSES } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";
import multer from "multer";
import mammoth from "mammoth";
import crypto from "crypto";
import { sendPaymentConfirmationEmail, sendInvoiceEmail, trackAbandonedCheckout, markCheckoutRecovered, startAbandonedCartScheduler } from "./email";
import { setupSEOPrerender } from "./seo-prerender";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function ensureStripeKey(): Promise<string | null> {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;
  let dbKey = await storage.getAdminSetting("stripe_secret_key");
  if (dbKey) {
    if (typeof dbKey === "string") {
      dbKey = dbKey.replace(/^"+|"+$/g, "").trim();
    }
    if (typeof dbKey === "string" && dbKey.startsWith("sk_")) {
      process.env.STRIPE_SECRET_KEY = dbKey;
      return dbKey;
    }
  }
  return null;
}

const SECTION_TO_ENTITLEMENT: Record<string, string | string[]> = {
  subject: "foundation",
  problematic: "foundation",
  hypotheses: "foundation",
  situation_appel: "foundation",
  construction_sujet: "foundation",
  vae_competencies: "foundation",
  plan: "plan",
  conceptual_framework: "conceptual",
  theoretical_framework: "conceptual",
  literature_review: "literature",
  methodology: "methodology",
  questionnaire: "questionnaire",
  guide_entretien: "guide_entretien",
  interview_simulation: "simulation_entretien",
  data_analysis: "data_visualization",
  financial_simulation: "financial_simulation",
  questionnaire_analysis: "questionnaire_analysis",
  assisted_writing: "redaction",
  bibliography: "biblio_multinormes",
  exports: "export_illimite",
  soutenance_ppt: "soutenance_ppt",
  soutenance_simulation: "soutenance_simulation",
  memoire_audit: "audit",
  rs_cover_page: "rs_foundation",
  rs_acknowledgements: "rs_foundation",
  rs_introduction: "rs_foundation",
  rs_company: "rs_foundation",
  rs_internship: "rs_foundation",
  rs_missions: "rs_foundation",
  rs_analysis: "rs_foundation",
  rs_contributions: "rs_foundation",
  rs_conclusion: "rs_foundation",
  mp_structure: "foundation",
  mp_emergence: "foundation",
  cs_fiche: "foundation",
  cs_contexte: "foundation",
  cs_probleme: "foundation",
  cs_cadre: "foundation",
  cs_donnees: "foundation",
  cs_options: "foundation",
  cs_recommandation: "foundation",
  cs_conclusion: "foundation",
  confrontation: "confrontation",
  hypothesis_validation: "hypothesis_validation",
  formulaire: "formulaire",
  remerciements: "remerciements",
  abstract_resume: "abstract_resume",
  sigles_acronymes: "sigles_acronymes",
  cover_page: "cover_page",
  vae_presentation: "vae_foundation",
  vae_parcours: "vae_foundation",
  vae_motivation: "vae_foundation",
  vae_cartographie: "vae_foundation",
  vae_bloc_demo: "vae_foundation",
  vae_synthese: "vae_foundation",
};

async function getModuleVisibility(): Promise<Record<string, boolean>> {
  try {
    const setting = await storage.getAdminSetting("module_visibility");
    if (setting && typeof setting === "object") return setting as Record<string, boolean>;
  } catch {}
  return {};
}

const ALL_ENTITLEMENT_KEYS = Array.from(new Set(Object.values(SECTION_TO_ENTITLEMENT).flat()));

function isSuperAdminById(userId: string): boolean {
  const adminIds = (process.env.SUPER_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
  return adminIds.includes(userId);
}

async function checkSectionEntitlement(userId: string, sectionKey: string): Promise<boolean> {
  if (isSuperAdminById(userId)) return true;
  const requirement = SECTION_TO_ENTITLEMENT[sectionKey];
  if (!requirement) return true;
  const keys = Array.isArray(requirement) ? requirement : [requirement];
  const moduleVis = await getModuleVisibility();
  if (Object.keys(moduleVis).length > 0) {
    const allFree = keys.every(k => moduleVis[k] === false);
    if (allFree) return true;
  }
  const entitlements = await storage.getUserEntitlements(userId);
  return keys.some(key => entitlements.includes(key));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

async function checkAndConsumeQuota(userId: string): Promise<{ allowed: boolean; reason?: string; quota?: any }> {
  const quota = await storage.resetQuotaIfNeeded(userId);
  if (quota.actionsUsed >= quota.actionsLimit) {
    return { allowed: false, reason: "actions", quota };
  }
  if (quota.wordsUsed >= quota.wordsLimit) {
    return { allowed: false, reason: "words", quota };
  }
  return { allowed: true, quota };
}

async function recordQuotaUsage(userId: string, generatedText: string): Promise<void> {
  const words = countWords(generatedText);
  await storage.incrementQuotaUsage(userId, words, 1);
}

function getOpenAIClient(userApiKey?: string) {
  if (userApiKey) {
    return new OpenAI({ apiKey: userApiKey });
  }
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

const DOMAIN_LABELS: Record<string, string> = {
  soins_infirmiers: "Soins infirmiers / Santé",
  travail_social: "Travail social",
  management: "Management / Gestion",
  rh: "Ressources humaines",
  economie: "Économie / Finance",
  marketing: "Marketing / Communication",
  droit: "Droit / Administration publique",
  education: "Éducation / Pédagogie",
  psychologie: "Psychologie",
  informatique: "Informatique / Numérique",
  data_ia: "Data / Science des données",
  logistique: "Logistique / Supply chain",
  qualite: "Qualité / QHSE",
  comptabilite: "Comptabilité / Audit / Contrôle de gestion",
  banque: "Banque / Assurance",
  immobilier: "Immobilier / Urbanisme",
  sciences_politiques: "Sciences politiques / Relations internationales",
  environnement: "Environnement / Développement durable",
  industrie: "Industrie / Génie industriel",
};

function buildProjectContext(project: any, profile: any, documents: any[]) {
  const domain = DOMAIN_LABELS[project.mainDomain] || project.mainDomainOther || project.mainDomain || "Non spécifié";
  let ctx = `=== CONTEXTE DU PROJET ===\n`;
  ctx += `Type de travail: ${project.type}\n`;
  ctx += `Domaine: ${domain}\n`;
  ctx += `Formation: ${project.degreeTitle || "Non spécifié"} (${project.degreeLevel || "Non spécifié"})\n`;
  ctx += `Profil: ${project.userProfile || "Non spécifié"}\n`;
  ctx += `Finalité: ${project.finality || "Non spécifié"}\n`;
  ctx += `Approche: ${project.approach || "Non spécifié"}\n`;
  if (project.workDomain) ctx += `Domaine du poste: ${project.workDomain}\n`;
  if (project.workFunction) ctx += `Fonction: ${project.workFunction}\n`;
  if (project.workStructure) ctx += `Structure: ${project.workStructure}\n`;
  if (documents.length > 0) {
    ctx += `\n=== DOCUMENTS DE RÉFÉRENCE ===\n`;
    documents.forEach(d => {
      ctx += `\n--- Document: ${d.name} (${d.type}) ---\n`;
      if (d.content) {
        ctx += d.content.substring(0, 3000) + (d.content.length > 3000 ? "\n[...contenu tronqué]" : "") + "\n";
      }
    });
  }
  return ctx;
}

function getSystemPrompt(projectType: string, language: string) {
  const langInstruction = language === "English" ? "Respond entirely in English." : "Réponds entièrement en français.";
  return `Tu es un expert académique et méthodologique de haut niveau, spécialisé dans l'accompagnement des étudiants et professionnels dans la rédaction de travaux académiques. ${langInstruction}

RÈGLES IMPORTANTES:
- Adapte le niveau de complexité au diplôme visé
- Utilise un vocabulaire académique précis et approprié au domaine
- Respecte les normes académiques en vigueur
- Formule de manière claire et structurée
- Ne génère JAMAIS de contenu rédigé final, seulement des propositions structurées
- Retourne tes réponses en Markdown bien formaté avec des titres, sous-titres et listes`;
}

// === SECTION PROMPT BUILDERS (Modules 3-7) ===
function buildSectionPrompt(sectionKey: string, projectType: string, mode: string, projectContext: string, validatedContext: string, extraContext?: string, currentContent?: string) {
  let prompt = projectContext + "\n";

  if (validatedContext) {
    prompt += `\n=== SECTIONS DÉJÀ VALIDÉES (MÉMOIRE DU PROJET) ===\n${validatedContext}\n`;
  }

  if (extraContext) {
    prompt += `\n=== INFORMATIONS SPÉCIFIQUES DE L'UTILISATEUR ===\n${extraContext}\n`;
  }

  if (mode === "similar" && currentContent) {
    prompt += `\n=== VERSION ACTUELLE À REFORMULER/AMÉLIORER ===\nVoici la version actuelle. Génère une proposition SIMILAIRE : même axe, même logique, mais reformulée et améliorée.\n${currentContent}\n`;
  } else if (mode === "different" && currentContent) {
    prompt += `\n=== VERSION ACTUELLE (À CHANGER) ===\nVoici la version actuelle. Génère une proposition DIFFÉRENTE : angle différent, logique alternative, nouvelle approche.\n${currentContent}\n`;
  }

  prompt += "\n" + getSectionTask(sectionKey, projectType);
  return prompt;
}

function getSectionTask(sectionKey: string, projectType: string): string {
  switch (sectionKey) {
    case "subject":
      if (projectType === "memoire" || projectType === "these") {
        return `=== TÂCHE: SUJET UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT le sujet académique. Ne génère PAS la problématique ni les hypothèses.

Génère un sujet académique:
- Précis, original et réalisable
- Ancré dans le domaine et la formation de l'étudiant
- Formulé comme un titre de ${projectType === "these" ? "thèse de doctorat" : "mémoire académique"}

Structure ta réponse avec un titre Markdown clair.`;
      } else if (projectType === "rapport_stage") {
        return `=== TÂCHE: SUJET UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT le sujet professionnel. Ne génère PAS la problématique ni les hypothèses.

En te basant sur le contexte du stage:
- **Sujet professionnel** : ancré dans la réalité du stage
- Formulé comme un titre de rapport de stage

Structure ta réponse avec un titre Markdown clair.`;
      }
      return `=== TÂCHE: SUJET UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT le sujet. Ne génère PAS la problématique ni les hypothèses.
Génère un sujet pertinent pour ce travail académique.`;

    case "problematic":
      if (projectType === "tfe") {
        return `=== TÂCHE: PROBLÉMATIQUE UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT la problématique. Ne génère PAS le sujet ni les hypothèses.

En te basant sur la situation d'appel et les éléments validés:
1. **Questionnement structuré** : questionnement professionnel progressif
2. **Question de départ** : claire et professionnelle

Ne génère PAS le sujet du TFE ici, seulement la problématique.`;
      }
      return `=== TÂCHE: PROBLÉMATIQUE UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT la problématique. Ne génère PAS le sujet ni les hypothèses.
Génère une problématique de recherche problématisée, mettant en tension des concepts clés du domaine.`;

    case "hypotheses":
      if (projectType === "tfe") {
        return `=== TÂCHE: HYPOTHÈSES UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT les hypothèses. Ne génère PAS le sujet ni la problématique.

Propose 3 hypothèses opérationnelles:
- Formulées comme des leviers d'amélioration (PAS des hypothèses statistiques)
- Orientées vers la pratique professionnelle
- Testables sur le terrain
Pour chaque hypothèse: énoncé, justification, piste de vérification.`;
      }
      return `=== TÂCHE: HYPOTHÈSES UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT les hypothèses. Ne génère PAS le sujet ni la problématique.

Propose 3 hypothèses de recherche:
- Chaque hypothèse doit être vérifiable
- Cohérentes avec la problématique
- Adaptées au niveau du diplôme
Pour chaque hypothèse: énoncé clair, justification théorique, piste méthodologique.`;

    case "situation_appel":
      return `=== TÂCHE: RÉDACTION DE LA SITUATION D'APPEL INFIRMIÈRE ===
Tu es expert en TFE infirmier (France / Belgique / Suisse).

À partir des informations fournies par l'étudiant(e), rédige une situation d'appel complète et académiquement correcte.

RÈGLES:
- Style académique infirmier, clair, structuré, fluide
- Conforme aux attentes d'un TFE infirmier (IFSI / écoles de soins infirmiers)
- PAS d'analyse théorique, PAS de cadre conceptuel, PAS de méthodologie
- La situation d'appel doit décrire un vécu professionnel réel et les questionnements qu'il suscite
- Reformule si nécessaire pour rendre le texte académiquement correct et professionnel

STRUCTURE ATTENDUE:
1. **Contexte** : service, contexte de soins, rôle de l'étudiant(e)
2. **Description de la situation** : faits précis, déroulement
3. **Questionnements** : ce qui a interpellé l'étudiant(e), ressentis
4. **Enjeux identifiés** : problème professionnel, éthique, relationnel ou organisationnel
5. **Justification** : pourquoi cette situation mérite une réflexion approfondie

Rédige un texte continu et cohérent, pas une simple liste de points.`;

    case "construction_sujet":
      return `=== TÂCHE: CONSTRUCTION DU SUJET DE TFE INFIRMIER ===
Tu es expert en TFE infirmier (France / Belgique / Suisse).

À partir EXCLUSIVEMENT de la situation d'appel validée fournie en contexte, génère les éléments suivants:

## Sujet du TFE
Propose un sujet de TFE infirmier clair, ciblé et professionnel. Le sujet doit être formulé comme un titre académique.

## Question de départ
Formule la question centrale infirmière qui découle de la situation d'appel. Elle doit être:
- Ouverte (pas de réponse oui/non)
- Centrée sur la pratique infirmière
- Suffisamment précise pour guider la recherche

## Hypothèses de recherche
Propose 3 hypothèses de recherche adaptées au niveau TFE:
- Formulées comme des leviers d'amélioration de la pratique
- Orientées vers la pratique professionnelle infirmière
- Testables sur le terrain
Pour chaque hypothèse: énoncé clair et justification.

## Questionnements secondaires
Propose 3 à 5 questionnements infirmiers secondaires qui complètent la question de départ et permettent d'explorer d'autres dimensions de la problématique.

RÈGLES:
- Tous les éléments doivent être cohérents avec la situation d'appel
- Langage infirmier académique
- NE PAS générer de cadre théorique, revue de littérature ou méthodologie
- Cette section sert uniquement à passer du vécu à la problématique infirmière`;

    case "vae_competencies":
      return `=== TÂCHE: ANALYSE DES COMPÉTENCES VAE ===
IMPORTANT: En VAE, PAS de sujet académique, PAS de problématique de recherche, PAS d'hypothèses.
Analyse les documents et produis:
1. **Blocs de compétences** (4, 6 ou 8 blocs selon le référentiel)
2. Pour CHAQUE bloc:
   - Intitulé du bloc
   - Activités professionnelles à valoriser
   - Situations professionnelles pertinentes
   - Logique de démonstration (preuves attendues par le jury)`;

    case "plan":
      return getPlanTask(projectType);

    case "conceptual_framework":
      return `=== TÂCHE: CADRE CONCEPTUEL ===
En lien direct avec la problématique et les hypothèses, structure le cadre conceptuel en EXACTEMENT 3 sous-parties:

I. Cadre conceptuel

Présentation générale des concepts (paragraphe introductif sans numérotation)

1.1 Concept 1
   - Définition synthétique et académique
   - Lien avec la problématique
   - Auteurs de référence

1.2 Concept 2
   - Définition synthétique et académique
   - Lien avec la problématique
   - Auteurs de référence

1.3 Concept 3
   - Définition synthétique et académique
   - Lien avec la problématique
   - Auteurs de référence

IMPORTANT: Le cadre conceptuel doit contenir EXACTEMENT 3 concepts, pas plus, pas moins.
Chaque concept doit être directement en lien avec le sujet et la problématique.
Structure avec des titres Markdown.`;

    case "theoretical_framework":
      return `=== TÂCHE: CADRE THÉORIQUE ===
En s'appuyant sur le cadre conceptuel:
1. **Courants théoriques** : identification des théories et modèles pertinents
2. Pour chaque courant:
   - Fondements et auteurs clés
   - Pertinence pour la problématique
   - Articulation avec les hypothèses
3. **Positionnement théorique** : justification du choix de l'ancrage théorique`;

    case "literature_review":
      return `=== TÂCHE: REVUE DE LITTÉRATURE ===
Construis une revue de littérature structurée:
1. **Équations de recherche** : propositions pour les bases de données académiques
2. **Synthèse thématique** : organisée par concept clé ou axe du plan
3. Pour chaque thématique:
   - Résumé des travaux existants
   - Consensus et divergences
   - Lacunes identifiées dans la littérature
4. **Tableau récapitulatif** : auteur, année, type, résultat principal
Adapte les sources au domaine (académiques, professionnelles, institutionnelles).`;

    case "methodology":
      return `=== TÂCHE: MÉTHODOLOGIE DE RECHERCHE ===
En t'appuyant sur la problématique, les hypothèses, le cadre conceptuel/théorique et la revue de littérature validés, définis une méthodologie cohérente et justifiée:

1. **Type de recherche** : qualitative, quantitative, mixte ou analyse documentaire
   - Justifie ton choix en lien avec les résultats de la revue de littérature
2. **Justification** :
   - Lien avec la problématique
   - Lien avec chaque hypothèse
   - Cohérence avec les approches méthodologiques identifiées dans la revue de littérature
   - Avantages de cette approche
   - Limites et contraintes terrain
3. **Population et échantillon** : qui, combien, critères de sélection
4. **Outils de collecte** : entretiens, questionnaires, observation, analyse documentaire
   - Réfère-toi aux outils utilisés dans les articles analysés si pertinent
5. **Méthode d'analyse** : comment les données seront traitées
6. **Considérations éthiques** : si applicable

Si des articles ou ouvrages de la revue de littérature sont disponibles dans le contexte, cite-les pour justifier tes choix méthodologiques.`;

    case "data_collection":
      return `=== TÂCHE: OUTILS DE COLLECTE DE DONNÉES ===
En t'appuyant sur la méthodologie validée, les hypothèses et le cadre conceptuel:

1. **Choix des outils** : questionnaire structuré, guide d'entretien semi-directif, grille d'observation, analyse documentaire
   - Justifie le choix de chaque outil en lien avec les hypothèses
   - Précise le type de données collectées (qualitatives / quantitatives)
2. **Construction de l'outil** :
   - Structure en sections cohérentes
   - Questions/items liés aux indicateurs des hypothèses
   - Échelles de mesure adaptées
3. **Tableau de traçabilité** : Hypothèse | Indicateur | Questions/Items | Type de données
4. **Modalités d'administration** : durée, conditions, consignes

Adapte les outils au domaine, au terrain et au niveau du diplôme.`;

    case "interview_simulation":
      return `=== TÂCHE: SIMULATION D'ENTRETIEN ===
En t'appuyant sur le guide d'entretien et le profil de l'interviewé:

1. **Simulation réaliste** : génère des réponses crédibles et nuancées
2. **Adaptation au profil** : langage, posture, niveau de détail
3. **Suggestions d'amélioration** : reformulations, relances possibles, points à approfondir

La simulation doit aider l'étudiant à préparer ses entretiens de terrain.`;

    case "data_analysis":
      return `=== TÂCHE: ANALYSE DES DONNÉES ===
En t'appuyant sur les données collectées, la méthodologie et les hypothèses:

1. **Analyse qualitative** (si applicable) :
   - Segmentation thématique des verbatims
   - Codage thématique (thèmes, sous-thèmes, catégories)
   - Citations clés et interprétation
   - Synthèse par thème et par hypothèse
2. **Analyse quantitative** (si applicable) :
   - Tendances et distributions
   - Tableaux croisés et interprétation
   - Implications statistiques
3. **Confrontation avec la littérature** : convergences, divergences, apports
4. **Validation des hypothèses** : H1, H2, H3 — validée / invalidée / nuancée avec justification

Structure l'analyse de manière rigoureuse et académique.`;

    case "data_collection":
      return `=== TÂCHE: OUTILS DE COLLECTE DES DONNÉES ===
En t'appuyant sur la méthodologie, les hypothèses et la population cible:

1. **Choix de l'outil** : questionnaire et/ou guide d'entretien
2. **Justification** : pourquoi cet outil est adapté
3. **Structure préliminaire** : grandes lignes de l'instrument
4. **Lien hypothèses-questions** : comment chaque hypothèse sera mesurée
5. **Considérations pratiques** : durée, mode de passation, éthique

Structure ta réponse en Markdown avec des sections claires.`;

    case "interview_simulation":
      return `=== TÂCHE: PRÉPARATION À L'ENTRETIEN ===
En t'appuyant sur le guide d'entretien et la méthodologie:

1. **Points de vigilance** : questions à risque (trop fermées, biaisées, ambiguës)
2. **Conseils de passation** : posture, relances, gestion du temps
3. **Anticipation des difficultés** : situations complexes possibles
4. **Grille de prise de notes** : structure recommandée

Structure ta réponse en Markdown.`;

    case "data_analysis":
      return `=== TÂCHE: STRATÉGIE D'ANALYSE DES DONNÉES ===
En t'appuyant sur la méthodologie et les outils de collecte:

1. **Plan d'analyse** : approche qualitative et/ou quantitative
2. **Méthodes de traitement** : codage thématique, analyses statistiques
3. **Outils recommandés** : logiciels et techniques
4. **Lien avec les hypothèses** : comment chaque hypothèse sera testée
5. **Présentation des résultats** : format et structure attendus

Structure ta réponse en Markdown.`;

    case "rs_cover_page":
      return `=== TÂCHE: PAGE DE GARDE DU RAPPORT DE STAGE ===
Génère une page de garde professionnelle et structurée pour un rapport de stage, à partir des informations fournies par l'étudiant.

STRUCTURE:
- Nom de l'établissement de formation
- Intitulé de la formation / filière
- TITRE DU RAPPORT en majuscules
- Nom et prénom de l'étudiant
- Tuteur en entreprise
- Tuteur académique
- Année universitaire
- Période du stage

Présente ces informations de manière sobre, professionnelle et bien structurée avec des séparations claires.
N'ajoute AUCUN contenu supplémentaire (pas d'introduction, pas de résumé).`;

    case "rs_acknowledgements":
      return `=== TÂCHE: REMERCIEMENTS DU RAPPORT DE STAGE ===
À partir des informations fournies par l'étudiant, rédige des remerciements professionnels et sincères.

RÈGLES:
- Ton formel mais chaleureux
- Structure par catégorie (entreprise, formation, entourage)
- Chaque personne ou groupe doit être remercié avec une raison précise
- Style académique, sobre, sans excès d'émotion
- Longueur: 300-500 mots`;

    case "rs_introduction":
      return `=== TÂCHE: INTRODUCTION DU RAPPORT DE STAGE ===
À partir des réponses fournies, rédige une introduction générale complète et académique.

STRUCTURE ATTENDUE:
1. **Accroche** : mise en contexte du domaine ou du secteur
2. **Cadre du stage** : formation, année, objectif pédagogique
3. **Présentation de l'entreprise** (brève) : nom, secteur
4. **Motivations** : pourquoi cette entreprise, ce domaine
5. **Objectifs du stage** : ce que l'étudiant cherche à atteindre
6. **Annonce du plan** : structure du rapport

RÈGLES:
- Style académique, fluide, professionnel
- Longueur: 500-800 mots
- PAS de liste à puces, texte continu structuré en paragraphes`;

    case "rs_company":
      return `=== TÂCHE: PRÉSENTATION DE L'ENTREPRISE ===
À partir des informations fournies, rédige une présentation complète et structurée de l'entreprise d'accueil.

STRUCTURE ATTENDUE:
1. **Identité de l'entreprise** : nom, statut juridique, date de création, siège
2. **Secteur d'activité** : domaine, activité principale, produits/services
3. **Taille et organisation** : nombre d'employés, organigramme simplifié
4. **Positionnement** : clients/usagers, marché
5. **Organisation interne** : principaux services et leurs rôles
6. **Service d'accueil** : description du service où le stage a eu lieu

RÈGLES:
- Style académique et descriptif
- Longueur: 600-1000 mots
- Inclure des sous-titres Markdown pour chaque partie
- Données factuelles, pas d'opinions personnelles dans cette section`;

    case "rs_internship":
      return `=== TÂCHE: PRÉSENTATION DU STAGE ===
À partir des réponses fournies, rédige une présentation détaillée du stage.

STRUCTURE ATTENDUE:
1. **Cadre du stage** : intitulé du poste, durée, dates
2. **Objectifs** : objectifs fixés par l'entreprise et objectifs personnels
3. **Missions confiées** : vue d'ensemble des responsabilités
4. **Outils et méthodes** : technologies, logiciels, méthodologies utilisés
5. **Encadrement** : tuteur, organisation du suivi

RÈGLES:
- Style professionnel et factuel
- Longueur: 400-700 mots
- Transition naturelle vers la section "Missions réalisées"`;

    case "rs_missions":
      return `=== TÂCHE: MISSIONS RÉALISÉES ===
À partir des réponses fournies, rédige une description détaillée et structurée des missions réalisées pendant le stage.

STRUCTURE ATTENDUE:
1. **Mission principale** : description détaillée, objectifs, méthodologie, résultats
2. **Missions secondaires** : pour chacune, contexte, actions, résultats
3. **Organisation du travail** : rythme, planification, autonomie
4. **Responsabilités** : niveau de responsabilité, confiance accordée
5. **Travail en équipe** : collaboration, dynamique d'équipe

RÈGLES:
- Style narratif et analytique (pas une simple liste)
- Longueur: 800-1200 mots
- Montrer la progression et l'apprentissage
- Utiliser des exemples concrets`;

    case "rs_analysis":
      return `=== TÂCHE: ANALYSE D'UNE SITUATION PROFESSIONNELLE ===
À partir des réponses fournies, rédige une analyse approfondie d'une situation professionnelle marquante du stage.

STRUCTURE ATTENDUE:
1. **Description de la situation** : contexte précis, acteurs impliqués
2. **Enjeux** : professionnels, organisationnels, relationnels
3. **Actions menées** : ce qui a été fait, décisions prises
4. **Résultats obtenus** : impacts mesurables ou observables
5. **Difficultés rencontrées** : obstacles, contraintes
6. **Solutions apportées** : comment les difficultés ont été surmontées
7. **Bilan réflexif** : leçons tirées, ce qui serait fait différemment

RÈGLES:
- Style réflexif et analytique
- Longueur: 600-1000 mots
- Montrer la capacité de prise de recul et d'analyse critique
- Relier à des concepts ou compétences de la formation`;

    case "rs_contributions":
      return `=== TÂCHE: APPORTS DU STAGE ===
À partir des réponses fournies, rédige une section sur les apports personnels et professionnels du stage.

STRUCTURE ATTENDUE:
1. **Compétences professionnelles acquises** : techniques, méthodologiques, organisationnelles
2. **Connaissances du métier et du secteur** : compréhension du domaine, réalités professionnelles
3. **Développement personnel** : qualités renforcées, prises de conscience, maturité
4. **Articulation formation-terrain** : liens entre les enseignements et la pratique

RÈGLES:
- Style réflexif et mature
- Longueur: 500-800 mots
- Illustrer avec des exemples concrets du stage
- Montrer une vraie prise de recul`;

    case "rs_conclusion":
      return `=== TÂCHE: CONCLUSION DU RAPPORT DE STAGE ===
À partir des réponses fournies et du contexte global du rapport, rédige une conclusion complète.

STRUCTURE ATTENDUE:
1. **Bilan synthétique** : résumé de l'expérience, principaux enseignements
2. **Atteinte des objectifs** : rappel des objectifs initiaux et degré de réalisation
3. **Impact sur le projet professionnel** : comment le stage influence les choix futurs
4. **Perspectives** : suite envisagée (études, emploi, spécialisation)
5. **Ouverture** : réflexion plus large sur le domaine ou le métier

RÈGLES:
- Style sobre et mature
- Longueur: 400-600 mots
- Ne PAS introduire de nouvelles informations
- Cohérence avec l'introduction (effet miroir)`;

    case "cs_fiche":
      return `=== TÂCHE: FICHE DU CAS – ÉTUDE DE CAS ===
À partir des réponses fournies par l'utilisateur, rédige une fiche synthétique et structurée du cas étudié.

STRUCTURE ATTENDUE:
1. **Titre du cas** : titre clair et descriptif
2. **Zone géographique** : pays, région, zone concernée
3. **Période** : dates clés, chronologie
4. **Acteurs clés** : institutions, États, parties prenantes avec leur rôle
5. **Sources principales** : documents, rapports, données de référence
6. **Objectif de l'étude** : comprendre / décider / évaluer / proposer

RÈGLES:
- Format synthétique et professionnel
- Longueur: 300-500 mots
- Doit servir de référence rapide pour l'ensemble de l'étude de cas
- Ne PAS inventer d'informations non fournies`;

    case "cs_contexte":
      return `=== TÂCHE: CONTEXTE ET DIAGNOSTIC – ÉTUDE DE CAS ===
À partir des réponses fournies, rédige une analyse contextuelle complète du cas.

STRUCTURE ATTENDUE:
1. **Contexte historique et géopolitique** : toile de fond du cas
2. **Contexte économique et social** : situation économique, enjeux sociaux
3. **Faits déclencheurs** : événements qui ont provoqué ou aggravé la situation
4. **Indicateurs clés** : données chiffrées (commerce, sécurité, flux, budget) si disponibles
5. **Synthèse du diagnostic** : état des lieux global

RÈGLES:
- Style analytique et factuel
- Longueur: 500-800 mots
- Citer les sources et données mentionnées par l'utilisateur
- Chronologie claire des événements`;

    case "cs_probleme":
      return `=== TÂCHE: PROBLÈME CENTRAL ET QUESTIONS D'ANALYSE – ÉTUDE DE CAS ===
À partir des réponses fournies et du contexte (si validé), formule clairement le problème central et les questions d'analyse.

STRUCTURE ATTENDUE:
1. **Problème central** : formulation claire et concise (1-2 phrases)
2. **Enjeux sous-jacents** : dimensions du problème (politique, économique, social, sécuritaire…)
3. **Questions directrices** : 3 à 5 questions structurantes pour analyser le cas
4. **Périmètre de l'analyse** : ce qui est inclus et exclu de l'étude

RÈGLES:
- Formulation précise et académique
- Longueur: 300-500 mots
- Les questions doivent guider l'analyse de manière logique
- Cohérence avec le contexte précédemment établi`;

    case "cs_cadre":
      return `=== TÂCHE: CADRE D'ANALYSE – ÉTUDE DE CAS ===
À partir de l'outil d'analyse choisi par l'utilisateur et de ses éléments de réponse, applique le cadre analytique au cas.

OUTILS POSSIBLES:
- **SWOT** : Forces / Faiblesses / Opportunités / Menaces - tableau + analyse narrative
- **PESTEL** : Politique / Économique / Social / Technologique / Environnemental / Légal
- **Analyse des acteurs** : cartographie des parties prenantes, intérêts, pouvoir, positionnement
- **Scénarios** : 3 scénarios prospectifs (optimiste / central / pessimiste) avec probabilités et implications
- **Matrice risques/impacts** : identification des risques, probabilité, impact, stratégies de mitigation

RÈGLES:
- Appliquer rigoureusement l'outil choisi
- Longueur: 600-1000 mots
- Inclure des tableaux ou matrices structurées (en markdown)
- Lier chaque élément aux données du cas
- Si l'outil n'est pas précisé, utiliser SWOT par défaut`;

    case "cs_donnees":
      return `=== TÂCHE: DONNÉES ET PREUVES – ÉTUDE DE CAS ===
À partir des réponses fournies, structure les données et preuves du cas.

STRUCTURE ATTENDUE:
1. **Tableau des faits clés** : Format markdown avec colonnes : Fait | Source | Impact | Fiabilité
2. **Analyse des données** : interprétation des faits et leur signification
3. **Données contradictoires** : identification des points de tension ou d'incertitude
4. **Limites des données** : biais possibles, données manquantes

RÈGLES:
- Utiliser des tableaux markdown pour la présentation structurée
- Longueur: 400-700 mots
- Évaluer la fiabilité de chaque source (haute / moyenne / faible)
- Séparer faits établis et interprétations`;

    case "cs_options":
      return `=== TÂCHE: OPTIONS STRATÉGIQUES – ÉTUDE DE CAS ===
À partir des réponses fournies et de l'analyse précédente, présente les options stratégiques.

STRUCTURE ATTENDUE:
Pour chaque option (A, B, C) :
1. **Description** : en quoi consiste l'option
2. **Coûts** : ressources nécessaires (financières, humaines, politiques)
3. **Bénéfices attendus** : résultats escomptés
4. **Risques** : ce qui pourrait mal tourner
5. **Conditions de réussite** : facteurs clés de succès

Suivi d'un **tableau comparatif** des options (markdown).

RÈGLES:
- Présentation équilibrée et objective de chaque option
- Longueur: 600-900 mots
- Chaque option doit être réaliste et ancrée dans le contexte du cas
- Inclure un tableau comparatif synthétique`;

    case "cs_recommandation":
      return `=== TÂCHE: RECOMMANDATION – ÉTUDE DE CAS ===
À partir des options analysées et du contexte du cas, formule une recommandation argumentée.

STRUCTURE ATTENDUE:
1. **Recommandation principale** : choix argumenté parmi les options
2. **Justification** : pourquoi cette option est privilégiée (lien avec l'analyse)
3. **Plan d'action** :
   - Court terme (0-6 mois) : actions immédiates
   - Moyen terme (6-24 mois) : consolidation
4. **KPIs de suivi** : 3-5 indicateurs mesurables pour évaluer le succès
5. **Conditions de mise en œuvre** : prérequis, acteurs responsables

RÈGLES:
- Argumentaire logique basé sur l'analyse précédente
- Longueur: 500-700 mots
- KPIs spécifiques, mesurables et temporellement définis
- Plan d'action concret et réaliste`;

    case "cs_conclusion":
      return `=== TÂCHE: CONCLUSION ET LIMITES – ÉTUDE DE CAS ===
À partir de l'ensemble du cas et des réponses fournies, rédige une conclusion synthétique.

STRUCTURE ATTENDUE:
1. **Synthèse des enseignements** : ce que le cas nous apprend
2. **Limites de l'analyse** : biais, données manquantes, hypothèses non vérifiées
3. **Points de vigilance** : éléments à surveiller dans le futur
4. **Ouverture** : pistes de recherche ou d'analyse complémentaires

RÈGLES:
- Ton réflexif et nuancé
- Longueur: 400-600 mots
- Ne pas introduire de nouvelles données
- Cohérence avec l'ensemble des sections précédentes`;

    case "mp_structure":
      return `=== TÂCHE: PRÉSENTATION DE LA STRUCTURE PROFESSIONNELLE ===
À partir des réponses fournies par l'étudiant, rédige une présentation complète et structurée de la structure professionnelle servant de terrain au mémoire.

STRUCTURE ATTENDUE:
1. **Identification de la structure** : nom, statut juridique, année de création, secteur d'activité, taille, localisation
2. **Activités et missions** : activité principale, missions, produits/services, publics cibles
3. **Organisation interne** : organigramme fonctionnel, principaux services/pôles, service d'accueil de l'étudiant et son rôle
4. **Positionnement de l'étudiant** : rôle occupé, missions confiées, outils et méthodes utilisés, problématiques observées sur le terrain

RÈGLES:
- Style académique professionnel, à la troisième personne pour la structure, première personne pour le positionnement de l'étudiant
- Longueur: 600-900 mots
- Texte exploitable directement dans le mémoire professionnel
- Servir de socle logique pour l'émergence du sujet et de la problématique
- Ne PAS inventer d'informations non fournies par l'étudiant`;

    case "mp_emergence":
      return `=== TÂCHE: ÉMERGENCE DU SUJET ET DE LA PROBLÉMATIQUE ===
À partir des réponses fournies et du contexte de la structure professionnelle (si disponible dans les sections validées), rédige une section qui fait le pont entre le terrain professionnel et la réflexion académique.

STRUCTURE ATTENDUE:
1. **Problématique professionnelle identifiée** : description précise de la problématique observée sur le terrain
2. **Contexte et périmètre** : service ou contexte dans lequel la problématique s'inscrit
3. **Importance et enjeux** : pourquoi cette problématique est cruciale pour la structure
4. **Propositions académiques** :
   - Proposition de sujet de mémoire (formulé comme un titre académique)
   - Question de départ
   - Problématique formulée académiquement
   - Objectifs du mémoire (2-3 objectifs)
   - Hypothèses de travail (2-3 hypothèses si pertinent)

RÈGLES:
- Style académique, transition fluide du terrain vers la théorie
- Longueur: 500-700 mots
- Montrer clairement le lien entre l'observation de terrain et la question de recherche
- Les propositions doivent être ancrées dans la réalité décrite
- L'étudiant pourra ensuite affiner le sujet et la problématique dans les sections suivantes`;

    case "vae_presentation":
      return `=== TÂCHE: PRÉSENTATION DU CANDIDAT VAE ===
À partir des réponses fournies, rédige une présentation complète du candidat pour le dossier VAE.

STRUCTURE ATTENDUE:
1. **Identité et situation actuelle** : présentation personnelle et poste actuel
2. **Diplôme visé** : intitulé exact, niveau, organisme certificateur
3. **Ancienneté et expertise** : nombre d'années d'expérience dans le domaine
4. **Formation initiale** : parcours académique antérieur

RÈGLES:
- Style professionnel et factuel, à la première personne
- Longueur: 300-500 mots
- Mettre en valeur la cohérence entre le parcours et le diplôme visé
- Ne PAS inventer d'informations non fournies par le candidat`;

    case "vae_parcours":
      return `=== TÂCHE: PARCOURS PROFESSIONNEL VAE ===
À partir des réponses fournies, rédige une présentation détaillée et structurée du parcours professionnel du candidat.

STRUCTURE ATTENDUE:
1. **Chronologie professionnelle** : expériences listées chronologiquement avec postes, entreprises, durées
2. **Responsabilités clés** : missions et responsabilités les plus significatives
3. **Compétences managériales** : encadrement, gestion d'équipe si applicable
4. **Formations complémentaires** : formations continues, certifications, perfectionnements
5. **Compétences transversales** : soft skills, outils maîtrisés, méthodes

RÈGLES:
- Style narratif professionnel, à la première personne
- Longueur: 600-900 mots
- Valoriser la progression et la montée en compétences
- Chaque expérience doit démontrer un apport au profil global
- Inclure les expériences bénévoles/associatives si pertinentes`;

    case "vae_motivation":
      return `=== TÂCHE: MOTIVATION ET PROJET VAE ===
À partir des réponses fournies, rédige une lettre de motivation structurée pour la démarche VAE.

STRUCTURE ATTENDUE:
1. **Genèse de la démarche** : comment et pourquoi le candidat entreprend cette VAE
2. **Adéquation parcours-diplôme** : en quoi l'expérience correspond au référentiel
3. **Objectifs professionnels** : projections à court et moyen/long terme
4. **Impact attendu** : ce que la validation changerait concrètement
5. **Engagement personnel** : détermination et investissement dans la démarche

RÈGLES:
- Style sincère et motivé, à la première personne
- Longueur: 400-600 mots
- Montrer la cohérence entre le passé, le présent et le projet futur
- Éviter les formulations génériques ou clichés`;

    case "vae_cartographie":
      return `=== TÂCHE: CARTOGRAPHIE DES COMPÉTENCES VAE ===
À partir des réponses fournies et du référentiel si disponible dans les documents, réalise une cartographie des compétences du candidat.

STRUCTURE ATTENDUE:
1. **Tableau de synthèse** : pour chaque bloc de compétences du référentiel, indiquer:
   - Intitulé du bloc
   - Compétences associées
   - Expériences professionnelles correspondantes
   - Niveau de maîtrise estimé (Acquis / En cours / Partiel)
2. **Analyse des correspondances** : points forts du candidat par rapport au référentiel
3. **Zones à consolider** : blocs moins couverts et pistes de renforcement

RÈGLES:
- Présenter sous forme de tableau structuré en Markdown
- Être factuel et objectif
- Longueur: 500-800 mots
- Si le référentiel n'est pas disponible, proposer une structure générique basée sur le diplôme visé
- Identifier clairement les points forts et les axes d'amélioration`;

    case "vae_bloc_demo":
      return `=== TÂCHE: DÉMONSTRATION PAR BLOC DE COMPÉTENCES VAE ===
À partir des réponses fournies, rédige une démonstration détaillée des compétences pour le bloc en cours.

STRUCTURE ATTENDUE:
1. **Tableau récapitulatif** : compétences du bloc avec indicateurs de maîtrise
2. **Situation professionnelle détaillée** :
   - Contexte : cadre, enjeux, acteurs impliqués
   - Actions menées : rôle précis du candidat, méthodologie, étapes
   - Résultats obtenus : indicateurs chiffrés, livrables, impacts
3. **Analyse réflexive** :
   - Retour d'expérience : réussites, difficultés, apprentissages
   - Transferabilité : comment ces compétences s'appliquent ailleurs
   - Évolution : ce que le candidat ferait différemment aujourd'hui

RÈGLES:
- Style démonstratif et factuel, à la première personne
- Longueur: 600-1000 mots par bloc
- Chaque compétence doit être illustrée par un exemple concret
- Utiliser la méthode STAR (Situation, Tâche, Action, Résultat) implicitement
- Ne PAS inventer de situations non mentionnées par le candidat`;

    case "vae_synthese":
      return `=== TÂCHE: SYNTHÈSE ET PERSPECTIVES VAE ===
À partir des réponses fournies et du contexte global du dossier, rédige une synthèse conclusive.

STRUCTURE ATTENDUE:
1. **Bilan global** : résumé du parcours au regard du diplôme visé
2. **Points forts démontrés** : compétences les plus solides avec preuves
3. **Axes de progression** : domaines à renforcer et plan d'action
4. **Projection professionnelle** : comment la validation s'inscrit dans le projet de vie
5. **Message au jury** : réflexion personnelle et engagement

RÈGLES:
- Style sobre et réflexif, à la première personne
- Longueur: 400-600 mots
- Cohérence avec l'ensemble du dossier
- Ton positif mais réaliste
- Ne PAS répéter mot pour mot les sections précédentes`;

    default:
      return `=== TÂCHE: GÉNÉRATION DE CONTENU ===\nGénère le contenu approprié pour la section "${sectionKey}".`;
  }
}

function getPlanTask(projectType: string): string {
  const formatting = `

RÈGLES DE FORMATAGE OBLIGATOIRES:
- NE JAMAIS utiliser de symboles Markdown (pas de **, ##, *, -, backticks).
- NE JAMAIS utiliser de balises HTML, d'émojis, de symboles techniques ou de caractères spéciaux.
- Texte propre et lisible, prêt à être copié directement dans un document Word.
- Numérotation conforme au plan ci-dessus. Les grandes parties sont en MAJUSCULES sans numéro. Les sous-parties utilisent la numérotation décimale (1.1, 1.2, 2.1, etc.).
- Aucun sous-titre parasite ou ajouté en dehors de la structure imposée.
- CONTEXTUALISATION: Remplace "Concept 1", "Concept 2", "Concept 3" par les concepts réels identifiés dans le sujet et la problématique du projet. Remplace "Hypothèse 1", "Hypothèse 2", "Hypothèse 3" par les hypothèses réelles du projet. Tous les titres doivent refléter le sujet spécifique.
- Pour chaque sous-partie: ajoute une description brève (2-3 phrases) du contenu attendu, indentée sous le titre.`;

  const plans: Record<string, string> = {
    memoire: `=== TÂCHE: PLAN DU MÉMOIRE ===
Génère le plan suivant EN RESPECTANT STRICTEMENT cette structure figée. Contextualise UNIQUEMENT les titres selon le sujet du projet. Ne modifie pas la structure, n'ajoute et ne supprime aucune partie.

INTRODUCTION GÉNÉRALE
   Contexte général du sujet
   Intérêt et justification du choix du sujet
   Problématisation
   Question de recherche / question de départ
   Objectifs de la recherche
   Hypothèses de recherche
   Structure du travail

CADRE CONCEPTUEL
   1.1 Concept 1
      1.1.1 Définition du concept
      1.1.2 Enjeux et dimensions
      1.1.3 Lien avec la problématique
   1.2 Concept 2
      1.2.1 Définition du concept
      1.2.2 Enjeux et dimensions
      1.2.3 Lien avec la problématique
   1.3 Concept 3
      1.3.1 Définition du concept
      1.3.2 Enjeux et dimensions
      1.3.3 Lien avec la problématique

CADRE THÉORIQUE
   2.1 Théories et modèles mobilisés
      2.1.1 Principaux courants théoriques
      2.1.2 Apports des auteurs de référence
      2.1.3 Limites des approches théoriques
   2.2 Positionnement de la recherche
      2.2.1 Choix du cadre théorique
      2.2.2 Justification du positionnement
      2.2.3 Cohérence avec le sujet et la problématique
   2.3 Articulation entre cadre théorique et hypothèses
      2.3.1 Lien théories – hypothèses
      2.3.2 Construction du modèle d'analyse
      2.3.3 Hypothèses opérationnalisées

CADRE MÉTHODOLOGIQUE
   3.1 Choix méthodologique général
   3.2 Phase préopératoire / phase méthodologique
   3.3 Population cible et échantillonnage
   3.4 Outils de collecte des données
   3.5 Limites méthodologiques

ANALYSE ET INTERPRÉTATION DES DONNÉES
   4.1 Analyse des entretiens / données recueillies
      4.1.1 Thèmes émergents
      4.1.2 Analyse des verbatims
      4.1.3 Organisation des résultats
   4.2 Interprétation des résultats
      4.2.1 Lecture analytique des données
      4.2.2 Mise en relation avec la problématique
      4.2.3 Portée des résultats
   4.3 Discussion et confrontation avec la revue de littérature
      4.3.1 Convergences avec les travaux existants
      4.3.2 Divergences observées
      4.3.3 Apports spécifiques de la recherche
   4.4 Synthèse
   4.5 Validation ou invalidation des hypothèses
      4.5.1 Hypothèse 1
      4.5.2 Hypothèse 2
      4.5.3 Hypothèse 3

CONCLUSION GÉNÉRALE
   Rappel de la problématique
   Réponse à la question de recherche
   Apports théoriques et pratiques
   Limites de l'étude
   Perspectives de recherche ou d'amélioration professionnelle

BIBLIOGRAPHIE
ANNEXES${formatting}`,

    tfe: `=== TÂCHE: PLAN DU TFE ===
Génère le plan suivant EN RESPECTANT STRICTEMENT cette structure figée. Contextualise UNIQUEMENT les titres selon le sujet du projet. Ne modifie pas la structure, n'ajoute et ne supprime aucune partie.

INTRODUCTION GÉNÉRALE
   Contexte général du sujet
   Intérêt et justification du choix du sujet
   Problématisation
   Question de recherche / question de départ
   Objectifs de la recherche
   Hypothèses de recherche
   Structure du travail

CADRE CONCEPTUEL
   1.1 Concept 1
      1.1.1 Définition du concept
      1.1.2 Enjeux et dimensions
      1.1.3 Lien avec la problématique
   1.2 Concept 2
      1.2.1 Définition du concept
      1.2.2 Enjeux et dimensions
      1.2.3 Lien avec la problématique
   1.3 Concept 3
      1.3.1 Définition du concept
      1.3.2 Enjeux et dimensions
      1.3.3 Lien avec la problématique

CADRE THÉORIQUE
   2.1 Théories et modèles mobilisés
      2.1.1 Principaux courants théoriques
      2.1.2 Apports des auteurs de référence
      2.1.3 Limites des approches théoriques
   2.2 Positionnement de la recherche
      2.2.1 Choix du cadre théorique
      2.2.2 Justification du positionnement
      2.2.3 Cohérence avec le sujet et la problématique
   2.3 Articulation entre cadre théorique et hypothèses
      2.3.1 Lien théories – hypothèses
      2.3.2 Construction du modèle d'analyse
      2.3.3 Hypothèses opérationnalisées

CADRE MÉTHODOLOGIQUE
   3.1 Choix méthodologique général
   3.2 Phase préopératoire / phase méthodologique
   3.3 Population cible et échantillonnage
   3.4 Outils de collecte des données
   3.5 Limites méthodologiques

ANALYSE ET INTERPRÉTATION DES DONNÉES
   4.1 Analyse des entretiens / données recueillies
      4.1.1 Thèmes émergents
      4.1.2 Analyse des verbatims
      4.1.3 Organisation des résultats
   4.2 Interprétation des résultats
      4.2.1 Lecture analytique des données
      4.2.2 Mise en relation avec la problématique
      4.2.3 Portée des résultats
   4.3 Discussion et confrontation avec la revue de littérature
      4.3.1 Convergences avec les travaux existants
      4.3.2 Divergences observées
      4.3.3 Apports spécifiques de la recherche
   4.4 Synthèse
   4.5 Validation ou invalidation des hypothèses
      4.5.1 Hypothèse 1
      4.5.2 Hypothèse 2
      4.5.3 Hypothèse 3

CONCLUSION GÉNÉRALE
   Rappel de la problématique
   Réponse à la question de recherche
   Apports théoriques et pratiques
   Limites de l'étude
   Perspectives de recherche ou d'amélioration professionnelle

BIBLIOGRAPHIE
ANNEXES${formatting}`,

    rapport_stage: `=== TÂCHE: PLAN DU RAPPORT DE STAGE ===
Génère un plan professionnel avec des TITRES CONTEXTUALISÉS liés au stage. Respecte strictement cette structure:

INTRODUCTION
   Contexte du stage
   Objectifs du stage
   Annonce du plan

PRÉSENTATION DE LA STRUCTURE D'ACCUEIL
   1.1 Organisation et missions de la structure
   1.2 Environnement professionnel
   1.3 Place du stagiaire dans la structure

MISSIONS ET ACTIVITÉS RÉALISÉES
   2.1 Description des missions principales
   2.2 Activités quotidiennes et responsabilités
   2.3 Projets spécifiques menés

PROBLÉMATIQUE PROFESSIONNELLE
   3.1 Identification de la problématique
   3.2 Analyse de la situation
   3.3 Méthodologie d'intervention

ANALYSE DES PRATIQUES
   4.1 Compétences mobilisées
   4.2 Résultats obtenus
   4.3 Difficultés rencontrées et solutions apportées

APPORTS ET LIMITES
   5.1 Apports professionnels et personnels
   5.2 Limites de l'expérience
   5.3 Développement des compétences

CONCLUSION ET PERSPECTIVES
   Bilan du stage
   Perspectives professionnelles

BIBLIOGRAPHIE
ANNEXES${formatting}`,

    vae: `=== TÂCHE: PLAN DU DOSSIER VAE ===
Génère un plan structuré pour le dossier VAE avec des TITRES CONTEXTUALISÉS. Respecte strictement cette structure:

INTRODUCTION
   Projet professionnel et motivation
   Présentation de la démarche

PRÉSENTATION DU CANDIDAT
   1.1 Parcours et positionnement professionnel
   1.2 Formation initiale et continue

PARCOURS PROFESSIONNEL
   2.1 Chronologie des expériences
   2.2 Évolution des responsabilités

MOTIVATION DE LA DÉMARCHE VAE
   3.1 Projet professionnel
   3.2 Diplôme visé et référentiel

BLOCS DE COMPÉTENCES
   4.1 Bloc de compétences 1
      4.1.1 Situation professionnelle
      4.1.2 Compétences mobilisées
      4.1.3 Preuves et résultats
   4.2 Bloc de compétences 2
      4.2.1 Situation professionnelle
      4.2.2 Compétences mobilisées
      4.2.3 Preuves et résultats
   4.3 Bloc de compétences 3
      4.3.1 Situation professionnelle
      4.3.2 Compétences mobilisées
      4.3.3 Preuves et résultats

CONCLUSION ET PROJECTION PROFESSIONNELLE
   Bilan des compétences acquises
   Perspectives d'évolution

BIBLIOGRAPHIE
ANNEXES${formatting}`,
  };
  return plans[projectType] || plans.memoire;
}

function getUserId(req: any): string {
  return req.user?.claims?.sub || "";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);

  // === FILE UPLOAD (PARSE WORD/PDF) ===
  app.post("/api/parse-file", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ message: "Aucun fichier fourni" });

      const ext = file.originalname.toLowerCase().split(".").pop();
      let text = "";

      if (ext === "docx") {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else if (ext === "pdf") {
        const pdfMod = await import("pdf-parse");
        const PDFParse = (pdfMod as any).PDFParse;
        if (PDFParse && typeof PDFParse === "function") {
          const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
          await parser.load();
          text = await parser.getText();
        } else {
          const parseFn = (pdfMod as any).default || pdfMod;
          if (typeof parseFn === "function") {
            const data = await parseFn(file.buffer);
            text = data.text;
          } else {
            throw new Error("Module pdf-parse non compatible");
          }
        }
      } else if (["txt", "csv", "bib", "md", "rtf"].includes(ext || "")) {
        text = file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ message: "Format non supporté. Formats acceptés : .docx, .pdf, .txt, .csv, .bib, .md, .rtf" });
      }

      res.json({ text, fileName: file.originalname });
    } catch (err: any) {
      console.error("File parse error:", err);
      res.status(500).json({ message: "Erreur lors de la lecture du fichier: " + (err.message || "Erreur inconnue") });
    }
  });

  // === PROFILES ===
  app.get(api.profiles.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const profile = await storage.getProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.post(api.profiles.upsert.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.profiles.upsert.input.parse(req.body);
      const existing = await storage.getProfile(userId);
      let profile;
      if (existing) {
        profile = await storage.updateProfile(userId, input);
      } else {
        profile = await storage.createProfile({ ...input, userId } as any);
      }
      res.json(profile);
    } catch (err: any) {
      console.error("Profile upsert error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: err.message || "Internal server error" });
      }
    }
  });

  // === PROJECTS ===
  app.get(api.projects.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject({ ...input, userId } as any);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        console.error("Create project error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.projects.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const projectId = Number(req.params.id);
    const existing = await storage.getProject(projectId);
    if (!existing) return res.status(404).json({ message: "Project not found" });
    if (existing.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(projectId, input);
      res.json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const projectId = Number(req.params.id);
    const existing = await storage.getProject(projectId);
    if (!existing) return res.status(404).json({ message: "Project not found" });
    if (existing.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteProject(projectId);
    res.status(204).send();
  });

  // === DOCUMENTS ===
  app.get(api.documents.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const userId = getUserId(req);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    const docs = await storage.getDocuments(projectId);
    res.json(docs);
  });

  app.post(api.documents.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const userId = getUserId(req);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.documents.create.input.parse(req.body);
      const doc = await storage.createDocument({ ...input, projectId });
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    await storage.deleteDocument(Number(req.params.id));
    res.status(204).send();
  });

  // === LEGACY AI GENERATION ===
  app.get(api.ai.listGenerations.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const userId = getUserId(req);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    const gens = await storage.getAiGenerations(projectId);
    res.json(gens);
  });

  app.post(api.ai.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }
    try {
      const { projectId, type, context } = api.ai.generate.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");
      const validatedContext = await storage.getValidatedSectionsContext(projectId);
      const userPrompt = buildSectionPrompt(type, project.type, "initial", projectContext, validatedContext, context);
      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.7,
      });
      const content = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, content);
      const generation = await storage.createAiGeneration(projectId, type, { content });
      res.json(generation);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: err.message || "Erreur lors de la génération" });
      }
    }
  });

  // === SECTIONS (Modules 3-7 with versioning) ===
  app.get(api.sections.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const userId = getUserId(req);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
    const sections = await storage.getSections(projectId);
    res.json(sections);
  });

  app.get(api.sections.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const section = await storage.getSection(Number(req.params.id));
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  });

  app.get(api.sections.versions.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const versions = await storage.getVersions(sectionId);
    res.json(versions);
  });

  app.post(api.sections.updateConfig.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const sectionId = Number(req.params.id);
      const { config } = api.sections.updateConfig.input.parse(req.body);
      const section = await storage.getSection(sectionId);
      if (!section) return res.status(404).json({ message: "Section not found" });
      const project = await storage.getProject(section.projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });
      const existingConfig = (section.config as Record<string, any>) || {};
      const mergedConfig = { ...existingConfig, ...config };
      const updated = await storage.updateSectionConfig(sectionId, mergedConfig);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Erreur lors de la mise à jour" });
    }
  });

  app.post(api.sections.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { projectId, sectionKey, mode, extraContext, config } = api.sections.generate.input.parse(req.body);

      const hasAccess = await checkSectionEntitlement(userId, sectionKey);
      if (!hasAccess) {
        return res.status(403).json({ message: "Cette fonctionnalité n'est pas incluse dans votre offre. Veuillez activer le module correspondant." });
      }

      const quotaCheck = await checkAndConsumeQuota(userId!);
      if (!quotaCheck.allowed) {
        return res.status(429).json({ 
          message: quotaCheck.reason === "words" 
            ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
            : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
          quotaExceeded: quotaCheck.reason,
          quota: quotaCheck.quota 
        });
      }

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      let section = await storage.getSectionByKey(projectId, sectionKey);
      if (!section) {
        section = await storage.createSection(projectId, sectionKey, config);
      } else if (config) {
        section = await storage.updateSectionConfig(section.id, config);
      }

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      let currentContent: string | undefined;
      if (mode !== "initial" && section.activeVersionId) {
        const activeVersion = await storage.getActiveVersion(section.id);
        currentContent = activeVersion?.content;
      }

      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");
      const userPrompt = buildSectionPrompt(sectionKey, project.type, mode, projectContext, validatedContext, extraContext, currentContent);

      const temperature = mode === "similar" ? 0.5 : mode === "different" ? 0.9 : 0.7;
      const openai = getOpenAIClient((profile as any)?.openaiApiKey);

      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature,
      });

      const content = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, content);
      const contextSnapshot = projectContext.substring(0, 500) + (validatedContext ? "\n..." + validatedContext.substring(0, 500) : "");
      const version = await storage.createVersion(section.id, content, "ai", mode, contextSnapshot);

      await storage.updateSectionStatus(section.id, "generated");

      const impactedSections = await storage.markImpactedSections(projectId, sectionKey);

      const updatedSection = await storage.getSection(section.id);
      res.json({ section: updatedSection, version, impactedSections });

    } catch (err: any) {
      console.error("Section Generation Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: err.message || "Erreur lors de la génération" });
      }
    }
  });

  app.post(api.sections.generateCombined.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { projectId, combo, mode, extraContext } = api.sections.generateCombined.input.parse(req.body);

      const hasAccess = await checkSectionEntitlement(userId, "subject");
      if (!hasAccess) {
        return res.status(403).json({ message: "Cette fonctionnalité n'est pas incluse dans votre offre. Veuillez activer le module correspondant." });
      }

      const quotaCheck = await checkAndConsumeQuota(userId!);
      if (!quotaCheck.allowed) {
        return res.status(429).json({ 
          message: quotaCheck.reason === "words" 
            ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
            : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
          quotaExceeded: quotaCheck.reason,
          quota: quotaCheck.quota 
        });
      }
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);
      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");

      const sectionKeys = combo === "subject_problematic"
        ? ["subject", "problematic"]
        : ["subject", "problematic", "hypotheses"];

      const labels: Record<string, string> = { subject: "Sujet", problematic: "Problématique", hypotheses: "Hypothèses" };
      const sectionsList = sectionKeys.map(k => labels[k]).join(", ");

      let currentContents = "";
      if (mode !== "initial") {
        for (const key of sectionKeys) {
          const existing = await storage.getSectionByKey(projectId, key);
          if (existing?.activeVersionId) {
            const v = await storage.getActiveVersion(existing.id);
            if (v?.content) currentContents += `\n--- ${labels[key]} actuel ---\n${v.content}\n`;
          }
        }
      }

      let taskPrompt = `=== TÂCHE: GÉNÉRATION COMBINÉE (${sectionsList}) ===
IMPORTANT: Tu dois générer CHAQUE élément séparément et clairement délimité.

Génère les éléments suivants, chacun dans sa section bien identifiée:

`;
      if (sectionKeys.includes("subject")) {
        taskPrompt += `### <<<SUJET>>>
Génère un sujet académique précis, original et réalisable.
### <<<FIN_SUJET>>>

`;
      }
      if (sectionKeys.includes("problematic")) {
        taskPrompt += `### <<<PROBLEMATIQUE>>>
Génère une problématique de recherche problématisée, mettant en tension des concepts clés.
### <<<FIN_PROBLEMATIQUE>>>

`;
      }
      if (sectionKeys.includes("hypotheses")) {
        taskPrompt += `### <<<HYPOTHESES>>>
Propose 3 hypothèses de recherche vérifiables, cohérentes avec la problématique.
Pour chaque hypothèse: énoncé clair, justification théorique, piste méthodologique.
### <<<FIN_HYPOTHESES>>>

`;
      }

      taskPrompt += `RÈGLE STRICTE: Utilise exactement les délimiteurs <<<SUJET>>>, <<<FIN_SUJET>>>, <<<PROBLEMATIQUE>>>, <<<FIN_PROBLEMATIQUE>>>, <<<HYPOTHESES>>>, <<<FIN_HYPOTHESES>>> pour séparer chaque partie. Ne mélange PAS le contenu entre les parties.`;

      let userPrompt = projectContext + "\n";
      if (validatedContext) userPrompt += `\n=== SECTIONS DÉJÀ VALIDÉES ===\n${validatedContext}\n`;
      if (extraContext) userPrompt += `\n=== INFORMATIONS SPÉCIFIQUES ===\n${extraContext}\n`;
      if (mode !== "initial" && currentContents) {
        const verb = mode === "similar" ? "SIMILAIRE (reformulation)" : "DIFFÉRENTE (nouvel angle)";
        userPrompt += `\n=== VERSIONS ACTUELLES - Génère une version ${verb} ===\n${currentContents}\n`;
      }
      userPrompt += "\n" + taskPrompt;

      const temperature = mode === "similar" ? 0.5 : mode === "different" ? 0.9 : 0.7;
      const openai = getOpenAIClient((profile as any)?.openaiApiKey);

      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 6000,
        temperature,
      });

      const fullContent = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, fullContent);

      const extractSection = (text: string, startTag: string, endTag: string): string => {
        const startIdx = text.indexOf(startTag);
        const endIdx = text.indexOf(endTag);
        if (startIdx === -1) return "";
        const contentStart = startIdx + startTag.length;
        const contentEnd = endIdx === -1 ? text.length : endIdx;
        return text.substring(contentStart, contentEnd).trim();
      };

      const parsedContent: Record<string, string> = {
        subject: extractSection(fullContent, "<<<SUJET>>>", "<<<FIN_SUJET>>>"),
        problematic: extractSection(fullContent, "<<<PROBLEMATIQUE>>>", "<<<FIN_PROBLEMATIQUE>>>"),
        hypotheses: extractSection(fullContent, "<<<HYPOTHESES>>>", "<<<FIN_HYPOTHESES>>>"),
      };

      const contextSnapshot = projectContext.substring(0, 500);
      const results: Record<string, any> = {};

      for (const key of sectionKeys) {
        const content = parsedContent[key];
        if (!content) continue;

        let section = await storage.getSectionByKey(projectId, key);
        if (!section) {
          section = await storage.createSection(projectId, key);
        }

        const version = await storage.createVersion(section.id, content, "ai", mode, contextSnapshot);
        await storage.updateSectionStatus(section.id, "generated");
        const updatedSection = await storage.getSection(section.id);
        results[key] = { section: updatedSection, version };
      }

      res.json({ results });
    } catch (err: any) {
      console.error("Combined Generation Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: err.message || "Erreur lors de la génération combinée" });
      }
    }
  });

  app.post(api.sections.saveManual.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const { content } = api.sections.saveManual.input.parse(req.body);
    const version = await storage.createVersion(sectionId, content, "manual");
    await storage.updateSectionStatus(sectionId, "modified");

    const section = await storage.getSection(sectionId);
    if (section) {
      await storage.markImpactedSections(section.projectId, section.key);
    }

    res.json(version);
  });

  app.post(api.sections.validate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    await storage.clearNeedsReview(sectionId);
    const section = await storage.updateSectionStatus(sectionId, "validated");
    res.json(section);
  });

  app.post(api.sections.unvalidate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const section = await storage.updateSectionStatus(sectionId, "draft");
    res.json(section);
  });

  app.post(api.sections.activateVersion.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const versionId = Number(req.params.versionId);
    await storage.activateVersion(sectionId, versionId);
    res.json({ success: true });
  });

  app.get(api.sections.exportContents.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const contents = await storage.getSectionsWithContent(projectId);
    res.json(contents);
  });

  app.post(api.sections.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const { status, note } = req.body;
    const validStatuses = Object.values(SECTION_STATUSES);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Statut invalide: ${status}` });
    }
    const section = await storage.updateSectionStatus(sectionId, status, note);
    res.json(section);
  });

  app.get(api.sections.statusHistory.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const history = await storage.getStatusHistory(sectionId);
    res.json(history);
  });

  app.get(api.sections.projectStatusHistory.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const history = await storage.getProjectStatusHistory(projectId);
    res.json(history);
  });

  app.post(api.sections.clearNeedsReview.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    await storage.clearNeedsReview(sectionId);
    res.json({ success: true });
  });

  // === VALIDATED SECTION CONTENTS ===
  app.get(api.sections.validatedContents.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const projectId = Number(req.params.projectId);
    const project = await storage.getProject(projectId);
    if (!project || project.userId !== userId) return res.status(404).json({ message: "Project not found" });
    const contents = await storage.getValidatedSectionContents(projectId);
    res.json(contents);
  });

  // === LITERATURE REVIEW: ARTICLE SEARCH ===
  app.post(api.sections.generateArticles.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, config, extraContext } = api.sections.generateArticles.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const platformLabels: Record<string, string> = { google_scholar: "Google Scholar", pubmed: "PubMed", hal: "HAL", cairn: "Cairn", sciencedirect: "ScienceDirect" };
      const sourceLabels: Record<string, string> = { scientific_articles: "Articles scientifiques", books: "Ouvrages", institutional_reports: "Rapports institutionnels", recommendations: "Recommandations", referentials: "Référentiels" };
      const levelLabels: Record<string, string> = { academic: "Très académique", mixed: "Mixte", professional: "Professionnel" };

      let searchParams = "";
      if (config.platforms) searchParams += `Plateformes: ${(config.platforms as string[]).map(p => platformLabels[p] || p).join(", ")}\n`;
      if (config.articleCount) searchParams += `Nombre d'articles à proposer: ${config.articleCount}\n`;
      if (config.periodStart) searchParams += `Période: ${config.periodStart} - ${config.periodEnd || "aujourd'hui"}\n`;
      if (config.language) searchParams += `Langue: ${config.language === "fr" ? "Français" : config.language === "en" ? "Anglais" : "Les deux"}\n`;
      if (config.level) searchParams += `Niveau: ${levelLabels[config.level as string] || config.level}\n`;
      if (config.sourceTypes) searchParams += `Types: ${(config.sourceTypes as string[]).map(t => sourceLabels[t] || t).join(", ")}\n`;

      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");
      const userPrompt = `${projectContext}\n${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}${extraContext ? `\n=== CONTEXTE UTILISATEUR ===\n${extraContext}\n` : ""}
=== PARAMÈTRES DE RECHERCHE ===
${searchParams}

=== TÂCHE: RECHERCHE BIBLIOGRAPHIQUE ===
Tu es un moteur de recherche académique. Propose une liste de ${config.articleCount || 10} articles/ouvrages pertinents pour ce sujet de recherche.

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sans texte avant ou après. Le format exact est:
[
  {
    "lastName": "Nom de famille de l'auteur principal",
    "firstName": "Prénom de l'auteur principal",
    "title": "Titre complet de l'article ou ouvrage",
    "year": "Année de publication",
    "publisher": "Maison d'édition ou nom de la revue",
    "platform": "Plateforme source (Google Scholar, PubMed, etc.)",
    "url": "URL vers l'article si disponible, sinon chaîne vide",
    "type": "article|ouvrage|rapport|thèse|chapitre"
  }
]

Les articles doivent être:
- Pertinents pour le sujet, la problématique et les hypothèses du projet
- Issus des plateformes et types de sources demandés
- Dans la période et la langue spécifiées
- De niveau académique approprié
- Réalistes et plausibles (auteurs existants dans le domaine, revues connues)`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const raw = response.choices[0].message.content || "[]";
      await recordQuotaUsage(userId!, raw);
      let articles;
      try {
        let cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleaned = jsonMatch[0];
        articles = JSON.parse(cleaned);
        if (!Array.isArray(articles)) articles = [];
      } catch (parseErr) {
        console.error("Article JSON parse error:", parseErr, "Raw:", raw.substring(0, 200));
        articles = [];
      }
      res.json({ articles });
    } catch (err: any) {
      console.error("Article Search Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la recherche d'articles" });
    }
  });

  // === LITERATURE REVIEW: ARTICLE ANALYSIS ===
  app.post(api.sections.analyzeArticles.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, articles, analysisType, extraContext } = api.sections.analyzeArticles.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const articleList = articles.map((a, i) => `${i + 1}. ${a.authors} — "${a.title}" (${a.year})${a.source ? `, ${a.source}` : ""}${a.platform ? ` [${a.platform}]` : ""}`).join("\n");

      let task = "";
      if (analysisType === "single" || analysisType === "multiple") {
        task = `=== TÂCHE: ANALYSE D'ARTICLE(S) ===
Analyse les articles suivants en lien avec le projet de recherche:

${articleList}

Pour chaque article, fournis:
1. **Résumé** : synthèse des idées principales
2. **Méthodologie utilisée** : approche et outils de recherche
3. **Résultats principaux** : conclusions majeures
4. **Pertinence** : lien avec le sujet, la problématique et les hypothèses du projet
5. **Apports** : contribution à la recherche dans ce domaine
6. **Limites** : points faibles ou lacunes identifiées`;
      } else if (analysisType === "confrontation") {
        task = `=== TÂCHE: CONFRONTATION DES OUVRAGES ===
Confronte les articles/ouvrages suivants:

${articleList}

Produis une analyse comparative structurée:
1. **Convergences** : points d'accord entre les auteurs, résultats similaires
2. **Divergences** : désaccords, résultats contradictoires, approches opposées
3. **Approches théoriques** : cadres théoriques utilisés par chaque auteur
4. **Apports respectifs** : contribution unique de chaque ouvrage
5. **Synthèse** : positionnement global par rapport à la problématique du projet`;
      } else if (analysisType === "mapping") {
        task = `=== TÂCHE: CARTE DE MAPPING CONCEPTUEL ===
À partir des articles suivants:

${articleList}

Génère une carte de mapping conceptuel en format texte structuré:
1. **Concepts principaux** : identifie les concepts clés abordés par ces articles
2. **Liens entre concepts** : comment les concepts sont reliés entre eux
3. **Convergences** : quels articles convergent sur quels concepts
4. **Divergences** : quels articles divergent sur quels points
5. **Schéma de liens** : représentation textuelle des connexions

Utilise des symboles pour la visualisation:
- ←→ pour les liens bidirectionnels
- → pour les influences directes
- ≈ pour les convergences
- ≠ pour les divergences
- ⊂ pour l'inclusion conceptuelle

Structure le mapping pour qu'il soit utilisable pour:
- Justification du sujet
- Problématisation
- Structuration du cadre conceptuel`;
      }

      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");
      const userPrompt = `${projectContext}\n${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}${extraContext ? `\n${extraContext}\n` : ""}\n${task}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, content);
      res.json({ content });
    } catch (err: any) {
      console.error("Article Analysis Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'analyse" });
    }
  });

  // === LITERATURE REVIEW: BIBLIOGRAPHY GENERATION ===
  app.post(api.sections.generateBibliography.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, articles, norm } = api.sections.generateBibliography.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const normLabels: Record<string, string> = { apa7: "APA 7e édition", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };

      const articleList = articles.map((a: any) =>
        `- ${a.lastName || ""}, ${a.firstName || ""}. "${a.title || ""}". ${a.publisher || a.source || ""}. ${a.year || ""}. ${a.url || ""}`
      ).join("\n");

      const systemPrompt = `Tu es un expert en normes bibliographiques académiques. Formate les références suivantes selon la norme ${normLabels[norm] || norm}.`;
      const userPrompt = `Formate les références suivantes selon la norme ${normLabels[norm] || norm}:

${articleList}

IMPORTANT: Produis uniquement la liste bibliographique formatée, sans explications. Chaque référence doit être correctement formatée selon la norme demandée. Trie par ordre alphabétique du nom de famille.`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, content);
      res.json({ content });
    } catch (err: any) {
      console.error("Bibliography Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération de la bibliographie" });
    }
  });

  // === RESEARCH EQUATIONS GENERATION ===
  app.post(api.sections.generateEquations.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, language, extraContext } = api.sections.generateEquations.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const langInstruction = language === "fr"
        ? "Génère les équations en FRANÇAIS uniquement."
        : language === "en"
          ? "Génère les équations en ANGLAIS uniquement."
          : "Génère les équations dans les DEUX langues (français ET anglais).";

      const prompt = `Tu es un expert en recherche documentaire académique. Génère les équations de recherche pour ce projet académique.

${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}

${langInstruction}

Structure attendue (texte uniquement, sans Markdown, sans symboles spéciaux):

1. TERMES-CLÉS PRINCIPAUX
   Liste les termes-clés extraits du sujet et de la problématique.

2. SYNONYMES ET TERMES ASSOCIÉS
   Pour chaque terme-clé, donne les synonymes, termes associés et variantes orthographiques.

3. ÉQUATIONS DE RECHERCHE
   Formule les équations de recherche complètes utilisant les opérateurs booléens (AND, OR, NOT).
   Propose au minimum 3 équations adaptées aux bases de données académiques.

4. RECOMMANDATIONS
   Indique les bases de données les plus pertinentes pour ces équations.
   Propose des filtres recommandés (période, type de document, langue).

RÈGLES DE FORMATAGE:
- NE JAMAIS utiliser de symboles Markdown (pas de **, ##, *, -, backticks).
- NE JAMAIS utiliser de balises HTML ou d'émojis.
- Texte propre et lisible, prêt à être copié dans un document Word.
- Utilise la numérotation (1., 2., 3.) et l'indentation pour structurer.${extraContext ? `\n\nContexte additionnel: ${extraContext}` : ""}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Tu es un expert en recherche documentaire et en méthodologie de recherche académique. Tu génères des équations de recherche claires et exploitables pour les bases de données scientifiques. Réponds en texte propre sans Markdown." },
          { role: "user", content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.5,
      });

      const content = (response.choices[0].message.content || "").trim();
      await recordQuotaUsage(userId!, content);
      res.json({ content });
    } catch (err: any) {
      console.error("Equations Generation Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération des équations" });
    }
  });

  // === CONCEPTUAL FRAMEWORK: GENERATE CONCEPTS FROM SOURCES ===
  app.post(api.sections.generateConcepts.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, sources, citationNorm, extraContext } = api.sections.generateConcepts.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const normLabels: Record<string, string> = { apa7: "APA 7e édition", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };
      const normLabel = normLabels[citationNorm] || "APA 7e édition";

      const sourceList = sources.map((s: any) =>
        `- ${s.lastName || ""}, ${s.firstName || ""}. "${s.title || ""}". ${s.publisher || s.source || ""}. ${s.year || ""}. Type: ${s.type || "article"}`
      ).join("\n");

      const systemPrompt = `Tu es un expert en méthodologie de recherche académique. Tu identifies et définis les concepts-clés à partir de sources académiques sélectionnées. Tu utilises la norme ${normLabel} pour les citations dans le texte.`;

      const userPrompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}

=== SOURCES SÉLECTIONNÉES ===
${sourceList}

=== TÂCHE ===
À partir des sources sélectionnées ci-dessus, génère le cadre conceptuel structuré:

I. CADRE CONCEPTUEL

Pour chaque concept identifié (minimum 3):
1. Nom du concept
2. Définition académique (avec citations selon la norme ${normLabel})
3. Lien avec la problématique du projet
4. Lien avec les hypothèses

IMPORTANT:
- Cite les auteurs des sources sélectionnées dans le texte selon la norme ${normLabel}
- Ne génère PAS de cadre théorique (traité séparément dans la revue de littérature)
- Structure claire avec numérotation académique (I., 1., 1.1.)
- Minimum 3 concepts, maximum 5
${extraContext ? `\n\nInstructions supplémentaires: ${extraContext}` : ""}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.5,
      });
      const content = response.choices[0].message.content || "";
      await recordQuotaUsage(userId!, content);

      const bibPrompt = `Formate les références suivantes selon la norme ${normLabel}:

${sourceList}

Produis uniquement la liste bibliographique formatée, triée par ordre alphabétique du nom de famille. Chaque référence doit être correctement formatée selon la norme ${normLabel}.`;

      const bibResponse = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: `Tu es un expert en normes bibliographiques. Formate selon ${normLabel}.` },
          { role: "user", content: bibPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });
      const bibliography = bibResponse.choices[0].message.content || "";
      await recordQuotaUsage(userId!, bibliography);

      res.json({ content, bibliography });
    } catch (err: any) {
      console.error("Generate Concepts Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération des concepts" });
    }
  });

  // === CONCEPTUAL FRAMEWORK: SUGGEST COMPLEMENTARY SOURCES ===
  app.post(api.sections.suggestSources.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, existingSources, extraContext } = api.sections.suggestSources.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const existingList = existingSources.map((s: any) =>
        `- ${s.lastName || ""}, ${s.firstName || ""}. "${s.title || ""}". ${s.year || ""}. ${s.publisher || ""}`
      ).join("\n");

      const prompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}

=== SOURCES EXISTANTES ===
${existingList}

=== TÂCHE ===
Propose 10 sources complémentaires qui enrichiraient le cadre conceptuel de ce projet.
Les sources proposées doivent:
- Être différentes des sources existantes
- Être pertinentes pour la problématique et les hypothèses
- Couvrir des aspects non traités par les sources existantes
- Être des références académiques crédibles

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sous cette forme exacte:
[
  {"lastName": "Nom", "firstName": "Prénom", "title": "Titre de l'article ou ouvrage", "year": "2023", "publisher": "Revue ou Éditeur", "platform": "Google Scholar", "url": "", "type": "article"},
  ...
]
${extraContext ? `\nInstructions: ${extraContext}` : ""}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Tu es un expert en recherche documentaire académique. Tu proposes des sources complémentaires pertinentes. Réponds UNIQUEMENT en JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      const raw = (response.choices[0].message.content || "").trim();
      await recordQuotaUsage(userId!, raw);
      let articles: any[] = [];
      try {
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) articles = JSON.parse(jsonMatch[0]);
      } catch { articles = []; }

      res.json({ articles });
    } catch (err: any) {
      console.error("Suggest Sources Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la suggestion de sources" });
    }
  });

  // === METHODOLOGY: GENERATE ANALYTICAL TABLES ===
  app.post(api.sections.generateMethodologyTables.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId!);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ 
        message: quotaCheck.reason === "words" 
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer." 
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota 
      });
    }

    try {
      const { projectId, tableType, extraContext } = api.sections.generateMethodologyTables.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const tablePrompts: Record<string, { columns: string[]; instruction: string }> = {
        methodological_choice: {
          columns: ["Type de méthodologie", "Justification du choix", "Lien avec la problématique", "Lien avec les hypothèses", "Avantages", "Limites"],
          instruction: "Génère un tableau analytique présentant le choix méthodologique pour ce projet de recherche. Propose 2-3 options méthodologiques avec leurs justifications.",
        },
        pre_operational: {
          columns: ["Objectifs du terrain", "Démarche retenue", "Contraintes identifiées", "Solutions envisagées"],
          instruction: "Génère un tableau analytique de la phase préopératoire / terrain. Détaille les objectifs, la démarche, les contraintes et solutions.",
        },
        target_population: {
          columns: ["Population concernée", "Tranche d'âge", "Région / lieu", "Comportements / caractéristiques", "Critères d'inclusion", "Critères d'exclusion"],
          instruction: "Génère un tableau analytique de la population cible. Propose des critères adaptés au sujet et au type de recherche.",
        },
        collection_tools: {
          columns: ["Outil", "Objectif de l'outil", "Type de données collectées", "Justification du choix"],
          instruction: "Génère un tableau analytique des outils de collecte de données. Propose des outils adaptés (questionnaire, entretien, grille d'observation, etc.).",
        },
        limits: {
          columns: ["Limites identifiées", "Impact potentiel", "Mesures correctives"],
          instruction: "Génère un tableau analytique des limites méthodologiques. Identifie les biais possibles et propose des mesures correctives.",
        },
      };

      const tableDef = tablePrompts[tableType];
      if (!tableDef) return res.status(400).json({ message: "Type de tableau invalide" });

      const prompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}

=== TÂCHE ===
${tableDef.instruction}

Colonnes du tableau: ${tableDef.columns.join(", ")}

IMPORTANT: Réponds UNIQUEMENT en JSON valide sous cette forme exacte:
{
  "rows": [
    {${tableDef.columns.map(c => `"${c}": "contenu"`).join(", ")}},
    ...
  ],
  "comment": "Commentaire explicatif et suggestions pour l'étudiant (formulations, améliorations possibles, points d'attention)."
}

Génère au minimum 2 lignes dans le tableau. Les contenus doivent être précis, académiques et adaptés au contexte du projet.
${extraContext ? `\nInstructions supplémentaires: ${extraContext}` : ""}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Tu es un expert en méthodologie de recherche. Tu génères des tableaux analytiques structurés pour aider les étudiants à construire leur cadre méthodologique. Réponds UNIQUEMENT en JSON valide." },
          { role: "user", content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.5,
      });

      const raw = (response.choices[0].message.content || "").trim();
      await recordQuotaUsage(userId!, raw);
      let result = { rows: [] as any[], comment: "" };
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          result.comment = parsed.comment || "";
          if (Array.isArray(parsed.rows)) {
            result.rows = parsed.rows.map((row: any) => {
              const normalized: Record<string, string> = {};
              for (const col of tableDef.columns) {
                normalized[col] = row[col] || "";
              }
              return normalized;
            });
          }
        }
      } catch {
        result = { rows: [], comment: "Erreur de parsing. Veuillez réessayer." };
      }

      if (result.rows.length === 0) {
        return res.status(422).json({ message: "Le logiciel n'a pas pu générer un tableau structuré. Veuillez réessayer." });
      }

      res.json(result);
    } catch (err: any) {
      console.error("Methodology Tables Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du tableau" });
    }
  });

  // === MODULE 8: GENERATE QUESTIONNAIRE ===
  app.post(api.sections.generateQuestionnaire.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "questionnaire");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, config, extraContext } = api.sections.generateQuestionnaire.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");

      const taskPrompt = `=== TÂCHE: GÉNÉRATION D'UN QUESTIONNAIRE DE COLLECTE DE DONNÉES ===

Configuration demandée:
- Type de questionnaire: ${config.questionnaireType}
- Nombre de questions souhaité: ${config.questionCount}
- Formats de questions: ${config.questionFormats.join(", ")}
- Durée cible: ${config.targetDuration}
- Profil du répondant: ${config.respondentProfile}
${config.instructions ? `- Instructions spécifiques: ${config.instructions}` : ""}

OBJECTIF: Génère UNIQUEMENT un questionnaire prêt à être distribué aux répondants. Ce document doit être propre, professionnel et directement utilisable (imprimable ou envoyable).

STRUCTURE DU QUESTIONNAIRE:

**EN-TÊTE**
- Titre du questionnaire (en lien avec le sujet de recherche)
- Sous-titre: "Questionnaire à destination de : ${config.respondentProfile}"
- Durée estimée: ${config.targetDuration}
- Mention de confidentialité: "Les données recueillies sont strictement anonymes et confidentielles. Elles seront utilisées uniquement dans le cadre de cette recherche."
- Consigne de remplissage claire et concise

**SECTION 1 — Informations générales**
- Questions sur le profil sociodémographique du répondant (âge, genre, ancienneté, fonction, structure, etc.)
- Adaptées au profil cible: ${config.respondentProfile}
- Utilise des formats adaptés (choix unique, choix multiples)

**SECTION 2 — Contexte professionnel**
- Questions permettant de situer le répondant dans son environnement
- En lien avec le sujet de recherche

**SECTIONS SUIVANTES — Questions thématiques**
- Organise les questions par thème ou axe de recherche
- Pour chaque section thématique, donne un titre clair
- Répartis ${config.questionCount} questions selon les formats demandés: ${config.questionFormats.join(", ")}
- Chaque question doit être numérotée (Q1, Q2, Q3...)

**SECTION FINALE — Question ouverte et remerciements**
- Une question ouverte finale (ex: "Souhaitez-vous ajouter un commentaire ?")
- Remerciements au répondant

POUR CHAQUE QUESTION, FOURNIS UNIQUEMENT:
- Le numéro (Q1, Q2, etc.)
- L'énoncé de la question (clair, neutre, sans biais)
- Les modalités de réponse (cases à cocher, échelle, espace de texte)
  - Pour les échelles de Likert: écris toutes les options (ex: Pas du tout d'accord / Plutôt pas d'accord / Neutre / Plutôt d'accord / Tout à fait d'accord)
  - Pour les choix multiples: liste toutes les options proposées
  - Pour les questions ouvertes: indique "Réponse libre"

RÈGLES STRICTES:
- NE GÉNÈRE AUCUNE RÉPONSE aux questions
- NE GÉNÈRE AUCUN RÉSUMÉ ni tableau de synthèse
- NE GÉNÈRE AUCUNE ANALYSE ni interprétation
- NE GÉNÈRE AUCUN tableau de traçabilité
- Le document doit contenir UNIQUEMENT les questions et leurs modalités de réponse
- Le questionnaire doit être prêt à être exporté en Word, propre et professionnel
- Adapte le vocabulaire au domaine et au niveau académique
- Les questions doivent être neutres, claires et univoques
- Utilise un format Markdown bien structuré avec des titres, sous-titres et listes`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
        temperature: 0.7,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result.trim(), traceability: "" });
    } catch (err: any) {
      console.error("Generate Questionnaire Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du questionnaire" });
    }
  });

  // === MODULE 8: GENERATE INTERVIEW GUIDE ===
  app.post(api.sections.generateInterviewGuide.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "guide_entretien");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, config, extraContext } = api.sections.generateInterviewGuide.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = getSystemPrompt(project.type, project.language || "Français");

      const taskPrompt = `=== TÂCHE: GÉNÉRATION D'UN GUIDE D'ENTRETIEN (OUTIL DE COLLECTE) ===

Configuration demandée:
- Type d'entretien: ${config.interviewType}
- Durée cible: ${config.targetDuration}
- Nombre de thèmes: ${config.themeCount}
- Questions par thème: ${config.questionsPerTheme}
- Ton: ${config.tone}
${config.intervieweeProfile ? `- Profil de l'interviewé: ${config.intervieweeProfile}` : ""}
${config.intervieweeFunction ? `- Fonction de l'interviewé: ${config.intervieweeFunction}` : ""}
${config.structureType ? `- Type de structure: ${config.structureType}` : ""}
${config.instructions ? `- Instructions spécifiques: ${config.instructions}` : ""}

OBJECTIF: Génère UNIQUEMENT un guide d'entretien prêt à être utilisé par le chercheur lors de ses entretiens. Ce document doit être propre, professionnel, structuré et directement utilisable (imprimable).

STRUCTURE DU GUIDE D'ENTRETIEN:

**EN-TÊTE**
- Titre: "Guide d'entretien ${config.interviewType}"
- Mention: "Entretien avec : ${config.intervieweeProfile || '[Profil du participant]'}"
${config.intervieweeFunction ? `- Fonction: ${config.intervieweeFunction}` : ""}
${config.structureType ? `- Structure: ${config.structureType}` : ""}
- Durée estimée: ${config.targetDuration}

**INTRODUCTION (texte à lire au participant)**
- Présentation du chercheur et de l'objet de la recherche
- Objectif de l'entretien
- Rappel de la confidentialité et du consentement éclairé
- Demande d'autorisation d'enregistrement
- Mise en confiance

**THÈMES ET QUESTIONS**
Pour chaque thème (${config.themeCount} thèmes attendus):
- **Titre du thème** clairement formulé
- **Question principale** : ouverte, neutre, non-directive
- **Questions de relance** (${config.questionsPerTheme} par thème) :
  - Relances de clarification
  - Relances d'approfondissement

**CONCLUSION**
- Question de synthèse ouverte (ex: "Souhaitez-vous ajouter quelque chose que nous n'aurions pas abordé ?")
- Remerciements

RÈGLES STRICTES:
- NE GÉNÈRE AUCUNE RÉPONSE aux questions (ni attendues, ni fictives)
- NE GÉNÈRE AUCUNE SYNTHÈSE ni résumé des réponses
- NE GÉNÈRE AUCUNE ANALYSE ni interprétation
- NE GÉNÈRE AUCUN tableau récapitulatif
- Le guide doit contenir UNIQUEMENT les questions à poser et les consignes pour le chercheur
- C'est un outil de COLLECTE, pas d'analyse
- Adapte le vocabulaire et le ton (${config.tone}) au profil de l'interviewé
- Questions ouvertes, neutres, sans biais
- Progression logique du général au spécifique
- Le document doit être prêt à être exporté en Word, propre et professionnel
- Utilise un format Markdown bien structuré avec des titres, sous-titres et listes`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 5000,
        temperature: 0.7,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result });
    } catch (err: any) {
      console.error("Generate Interview Guide Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du guide d'entretien" });
    }
  });

  // === MODULE 9: SIMULATE RESPONSE ===
  app.post(api.sections.simulateResponse.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "interview_simulation");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, question, intervieweeProfile, tone, length, extraContext } = api.sections.simulateResponse.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un simulateur d'entretien académique. Tu incarnes un interviewé réaliste et crédible pour aider un étudiant-chercheur à préparer ses entretiens de terrain. Tu dois produire des réponses authentiques, nuancées et contextualisées.`;

      const taskPrompt = `=== TÂCHE: SIMULATION DE RÉPONSE D'ENTRETIEN ===

Question posée par le chercheur:
"${question}"

Profil de l'interviewé à incarner: ${intervieweeProfile}
${tone ? `Ton souhaité: ${tone}` : ""}
${length ? `Longueur de réponse souhaitée: ${length}` : ""}

Consignes de simulation:
1. **Incarne le profil** : adopte le langage, le niveau de vocabulaire, les préoccupations et la posture professionnelle correspondant au profil décrit
2. **Réponse réaliste** : la réponse doit sembler authentique, avec:
   - Des hésitations naturelles si pertinent
   - Des exemples concrets tirés de l'expérience professionnelle simulée
   - Des nuances et des réserves (pas de réponse trop "parfaite")
   - Un niveau de détail cohérent avec le profil
3. **Longueur adaptée** : ${length || "réponse de 150 à 300 mots, comme dans un entretien réel"}

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "response": "La réponse simulée de l'interviewé...",
  "suggestions": [
    "Suggestion de relance 1 pour approfondir",
    "Suggestion de relance 2 pour clarifier un point",
    "Suggestion d'amélioration de la question initiale"
  ]
}`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let responseText = raw;
      let suggestions: string[] = [];
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          responseText = parsed.response || raw;
          suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        }
      } catch {
        responseText = raw;
        suggestions = [];
      }

      res.json({ response: responseText, suggestions });
    } catch (err: any) {
      console.error("Simulate Response Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la simulation de réponse" });
    }
  });

  // === MODULE 9: IMPROVE QUESTION ===
  app.post(api.sections.improveQuestion.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "interview_simulation");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, question, improvementType, extraContext } = api.sections.improveQuestion.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const improvementLabels: Record<string, string> = {
        clarify: "Clarifier la question — la rendre plus compréhensible, sans ambiguïté",
        remove_bias: "Supprimer les biais — reformuler pour une neutralité totale",
        make_open: "Rendre la question plus ouverte — favoriser une réponse libre et développée",
        make_targeted: "Rendre la question plus ciblée — focaliser sur un aspect précis",
        suggest_relances: "Proposer des relances — générer des questions de suivi pour approfondir",
      };

      const improvementInstruction = improvementLabels[improvementType] || "Améliorer la question";

      const systemPrompt = `Tu es un expert en méthodologie de recherche qualitative et en construction d'outils de collecte de données. Tu aides les chercheurs à améliorer leurs questions d'entretien et de questionnaire.`;

      const taskPrompt = `=== TÂCHE: AMÉLIORATION D'UNE QUESTION ===

Question originale:
"${question}"

Type d'amélioration demandée: ${improvementInstruction}

Consignes:
1. Analyse la question originale: identifie ses forces et ses faiblesses
2. Propose une version améliorée selon le type d'amélioration demandé
3. Explique clairement pourquoi la version améliorée est meilleure

${improvementType === "suggest_relances" ? `
Pour les relances, propose 3 à 5 questions de relance:
- Relance de clarification
- Relance d'approfondissement
- Relance de confrontation
- Relance de reformulation
` : ""}

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "improved": "La question améliorée (ou les relances proposées)",
  "explanation": "Explication détaillée de l'amélioration apportée et pourquoi elle est plus pertinente méthodologiquement"
}`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.6,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let improved = raw;
      let explanation = "";
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          improved = parsed.improved || raw;
          explanation = parsed.explanation || "";
        }
      } catch {
        improved = raw;
        explanation = "";
      }

      res.json({ improved, explanation });
    } catch (err: any) {
      console.error("Improve Question Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'amélioration de la question" });
    }
  });

  // === MODULE 10: ANALYZE QUALITATIVE ===
  app.post(api.sections.analyzeQualitative.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "data_analysis");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, verbatims, analysisMode, extraContext } = api.sections.analyzeQualitative.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en analyse qualitative de données de recherche. Tu maîtrises l'analyse thématique (Paillé & Mucchielli), l'analyse de contenu (Bardin) et le codage thématique. Tu produis des analyses rigoureuses, structurées et académiques.`;

      const verbatimsList = verbatims.map((v, i) =>
        `\n--- Entretien ${i + 1} ---\nInitiales: ${v.initials}\nFonction: ${v.function}\nStructure: ${v.structureType}${v.date ? `\nDate: ${v.date}` : ""}\n\nVerbatim:\n${v.content}`
      ).join("\n");

      const modeLabels: Record<string, string> = {
        per_interview: "Analyse par entretien — chaque entretien est analysé individuellement avant la synthèse",
        global: "Analyse globale transversale — tous les entretiens sont analysés ensemble par thèmes",
        per_hypothesis: "Analyse par hypothèse — les données sont organisées et analysées en fonction de chaque hypothèse",
      };

      const taskPrompt = `=== TÂCHE: ANALYSE QUALITATIVE DES DONNÉES ===

Mode d'analyse: ${modeLabels[analysisMode] || analysisMode}

${verbatimsList}

Réalise une analyse qualitative complète selon le mode demandé:

${analysisMode === "per_interview" ? `
**Pour CHAQUE entretien:**
1. **Fiche synthétique** : profil, contexte, durée, conditions
2. **Segmentation** : découpage du verbatim en unités de sens
3. **Codage thématique** : identification des thèmes et sous-thèmes
4. **Citations clés** : verbatims significatifs avec interprétation
5. **Synthèse individuelle** : points saillants, posture, apports

**Puis synthèse transversale:**
` : ""}

${analysisMode === "global" ? `
**Analyse transversale:**
` : ""}

${analysisMode === "per_hypothesis" ? `
**Pour CHAQUE hypothèse (H1, H2, H3):**
1. **Données pertinentes** : extraits de verbatims liés à l'hypothèse
2. **Codage thématique** : thèmes et sous-thèmes associés
3. **Analyse interprétative** : ce que les données révèlent sur l'hypothèse
4. **Degré de validation** : éléments qui confirment / infirment / nuancent

**Puis synthèse globale:**
` : ""}

1. **Tableau thématique** : Thème | Sous-thème | Catégorie | Fréquence | Entretiens concernés
2. **Thèmes principaux** : description détaillée de chaque thème identifié
3. **Citations clés** : les verbatims les plus significatifs (entre guillemets, avec attribution)
4. **Synthèse par thème** : interprétation et mise en perspective
5. **Synthèse par hypothèse** : lien entre les résultats et chaque hypothèse
6. **Points de convergence et de divergence** entre les entretiens

IMPORTANT:
- Utilise des citations directes entre guillemets avec attribution (initiales)
- Reste fidèle aux propos des interviewés
- Distingue les faits des interprétations
- Structure en Markdown avec titres et sous-titres clairs`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
        temperature: 0.5,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result });
    } catch (err: any) {
      console.error("Analyze Qualitative Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'analyse qualitative" });
    }
  });

  // === MODULE 10: ANALYZE QUANTITATIVE ===
  app.post(api.sections.analyzeQuantitative.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "data_analysis");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, data, analysisType, filters, extraContext } = api.sections.analyzeQuantitative.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en analyse quantitative de données de recherche. Tu maîtrises l'analyse statistique descriptive, les tableaux croisés, l'interprétation des tendances et la mise en relation des résultats avec les hypothèses de recherche. Tu produis des analyses rigoureuses et académiques.`;

      const analysisLabels: Record<string, string> = {
        cross_tab: "Tableaux croisés dynamiques — analyse des relations entre variables",
        cross_chart: "Graphiques croisés dynamiques — représentation visuelle des croisements",
        trends: "Analyse des tendances — identification des patterns et distributions",
        interpretation: "Interprétation globale — synthèse et mise en perspective des résultats",
      };

      const taskPrompt = `=== TÂCHE: ANALYSE QUANTITATIVE DES DONNÉES ===

Type d'analyse: ${analysisLabels[analysisType] || analysisType}
${filters ? `Filtres appliqués: ${JSON.stringify(filters)}` : ""}

=== DONNÉES À ANALYSER ===
${data}

Réalise une analyse quantitative complète:

${analysisType === "cross_tab" ? `
**Tableaux croisés:**
1. Pour chaque croisement pertinent de variables:
   - Tableau croisé en Markdown (effectifs et pourcentages)
   - Interprétation du tableau: que révèle-t-il ?
   - Lien avec les hypothèses de recherche
2. **Synthèse des croisements** : tendances principales observées
` : ""}

${analysisType === "cross_chart" ? `
**Graphiques croisés dynamiques:**
1. Pour chaque croisement pertinent de variables:
   - Décris en détail le graphique recommandé (barres groupées, empilées, camembert, radar, aires, courbes)
   - Fournis les données sous forme de tableau Markdown pour la visualisation
   - Interprétation visuelle : que montre le graphique ?
2. **Types de graphiques recommandés** : pour chaque croisement, recommande le type de graphique le plus adapté
3. **Synthèse visuelle** : présente les patterns et tendances identifiés visuellement
4. **Données tabulaires** : fournis les données en format structuré pour permettre la génération automatique des graphiques
` : ""}

${analysisType === "trends" ? `
**Analyse des tendances:**
1. **Distribution des réponses** : pour chaque question/variable, présente la répartition
2. **Tendances centrales** : modes, médianes, moyennes si pertinent
3. **Patterns identifiés** : régularités, anomalies, groupes distincts
4. **Représentation** : décris les graphiques recommandés (histogrammes, diagrammes circulaires, etc.)
` : ""}

${analysisType === "interpretation" ? `
**Interprétation globale:**
1. **Résultats principaux** : synthèse des données les plus significatives
2. **Mise en relation avec les hypothèses** : H1, H2, H3
3. **Implications** : que signifient ces résultats pour la recherche ?
4. **Limites** : biais possibles, limites de l'échantillon
` : ""}

Pour TOUS les types d'analyse:
- **Lien avec chaque hypothèse** : quels résultats soutiennent / infirment chaque hypothèse
- **Tableaux de synthèse** en Markdown
- **Interprétation académique** : utilise un vocabulaire rigoureux
- **Recommandations** : analyses complémentaires suggérées

IMPORTANT:
- Structure en Markdown avec titres et sous-titres clairs
- Utilise des tableaux Markdown pour présenter les données
- Reste objectif dans l'interprétation
- Distingue description et interprétation`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 5000,
        temperature: 0.5,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result });
    } catch (err: any) {
      console.error("Analyze Quantitative Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'analyse quantitative" });
    }
  });

  // === MODULE 10: CONFRONT RESULTS ===
  app.post(api.sections.confrontResults.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "data_analysis");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, results, extraContext } = api.sections.confrontResults.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en méthodologie de recherche académique. Tu excelles dans la confrontation des résultats de terrain avec la littérature scientifique. Tu produis des discussions académiques rigoureuses, nuancées et bien argumentées.`;

      const taskPrompt = `=== TÂCHE: CONFRONTATION DES RÉSULTATS AVEC LA LITTÉRATURE ===

=== RÉSULTATS DE TERRAIN ===
${results}

Réalise une confrontation rigoureuse des résultats de terrain avec la revue de littérature et le cadre conceptuel/théorique:

**I. RAPPEL DES RÉSULTATS PRINCIPAUX**
- Synthèse brève des résultats clés issus de l'analyse des données

**II. CONFRONTATION AVEC LA LITTÉRATURE**
Pour chaque résultat significatif:

1. **Convergences** :
   - Quels résultats confirment les travaux existants ?
   - Références aux auteurs et théories du cadre conceptuel/théorique
   - Explication des convergences observées

2. **Divergences** :
   - Quels résultats contredisent ou nuancent la littérature ?
   - Hypothèses explicatives de ces divergences
   - Facteurs contextuels pouvant expliquer les écarts

3. **Apports originaux** :
   - Quels résultats constituent des contributions nouvelles ?
   - En quoi enrichissent-ils le champ de connaissances ?
   - Implications pour la pratique professionnelle

**III. DISCUSSION PAR HYPOTHÈSE**
Pour chaque hypothèse (H1, H2, H3):
- Résultats associés
- Position par rapport à la littérature
- Degré de validation à la lumière de la confrontation

**IV. CONTRIBUTIONS AU CHAMP**
- Apports théoriques de la recherche
- Apports pratiques et professionnels
- Limites et perspectives

IMPORTANT:
- Cite les auteurs de la revue de littérature quand tu fais des rapprochements
- Structure en Markdown avec titres et sous-titres clairs
- Reste académique et nuancé dans le propos
- Distingue clairement convergences, divergences et apports originaux`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 5000,
        temperature: 0.6,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result });
    } catch (err: any) {
      console.error("Confront Results Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la confrontation des résultats" });
    }
  });

  // === MODULE 10: VALIDATE HYPOTHESES ===
  app.post(api.sections.validateHypotheses.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "data_analysis");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, results, extraContext } = api.sections.validateHypotheses.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en méthodologie de recherche académique. Tu maîtrises la validation et l'invalidation des hypothèses de recherche en t'appuyant sur les données collectées, l'analyse réalisée et la confrontation avec la littérature. Tu produis des conclusions rigoureuses, nuancées et académiquement fondées.`;

      const taskPrompt = `=== TÂCHE: VALIDATION / INVALIDATION DES HYPOTHÈSES ===

=== RÉSULTATS ET ANALYSE ===
${results}

Produis une validation rigoureuse de chaque hypothèse de recherche:

**I. RAPPEL DES HYPOTHÈSES**
- Rappelle chaque hypothèse telle que formulée initialement

**II. VALIDATION PAR HYPOTHÈSE**

Pour CHAQUE hypothèse (H1, H2, H3):

### Hypothèse [N] : [Rappel de l'énoncé]

1. **Statut** : VALIDÉE / PARTIELLEMENT VALIDÉE (NUANCÉE) / INVALIDÉE

2. **Éléments de preuve** :
   - Données quantitatives appuyant le verdict (chiffres, pourcentages, tendances)
   - Données qualitatives appuyant le verdict (verbatims clés, thèmes identifiés)
   - Références à la littérature confirmant ou contredisant

3. **Justification détaillée** :
   - Argumentation rigoureuse expliquant le verdict
   - Nuances et réserves éventuelles
   - Conditions de validité (contexte, population, limites)

4. **Implications** :
   - Conséquences théoriques
   - Conséquences pratiques et professionnelles

**III. SYNTHÈSE GLOBALE**
- Tableau récapitulatif: | Hypothèse | Statut | Justification résumée |
- Cohérence d'ensemble des résultats
- Forces et limites de la validation
- Pistes de recherche futures

IMPORTANT:
- Sois rigoureux et honnête: ne valide pas une hypothèse sans preuves suffisantes
- Utilise la formulation "nuancée" quand les résultats sont partiels ou ambigus
- Appuie-toi sur les données réelles, pas sur des suppositions
- Structure en Markdown avec titres et sous-titres clairs`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 5000,
        temperature: 0.5,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result });
    } catch (err: any) {
      console.error("Validate Hypotheses Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la validation des hypothèses" });
    }
  });

  // === MODULE: FINANCIAL SIMULATION ===
  app.post(api.sections.generateFinancialSimulation.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "financial_simulation");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const parsed = api.sections.generateFinancialSimulation.input.parse(req.body);
      const { simulationType, timeHorizon, currency, customInstructions, extraContext: userExtraContext } = parsed;
      const projectId = parsed.projectId;
      if (!projectId) return res.status(400).json({ message: "projectId is required" });
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const typeLabels: Record<string, string> = {
        budget_previsionnel: "Budget prévisionnel",
        plan_financement: "Plan de financement",
        compte_resultat: "Compte de résultat prévisionnel",
        seuil_rentabilite: "Seuil de rentabilité",
        plan_tresorerie: "Plan de trésorerie",
      };

      const systemPrompt = `Tu es un expert en finance d'entreprise et en analyse financière académique. Tu produis des simulations financières rigoureuses, chiffrées et professionnelles adaptées au contexte académique (mémoire, TFE, rapport de stage, VAE). Tu maîtrises les tableaux financiers, les calculs de rentabilité et les projections.`;

      const taskPrompt = `=== TÂCHE: SIMULATION FINANCIÈRE ===

Type de simulation: ${typeLabels[simulationType] || simulationType}
Horizon temporel: ${timeHorizon} an(s)
Devise: ${currency}
${customInstructions ? `Instructions spécifiques: ${customInstructions}` : ""}

Produis une simulation financière complète et professionnelle:

1. **Hypothèses de départ** : Liste les hypothèses retenues pour la simulation (chiffre d'affaires, charges, investissements, etc.)

2. **Tableau(x) financier(s)** : Présente le/les tableau(x) en Markdown avec des colonnes par année/période sur ${timeHorizon} an(s) en ${currency}

3. **Analyse et commentaires** : Commente les résultats, les tendances, les points de vigilance

4. **Indicateurs clés** : Marge, ratio, seuil de rentabilité ou tout indicateur pertinent

5. **Recommandations** : Préconisations basées sur les résultats

IMPORTANT:
- Utilise des chiffres réalistes et cohérents avec le contexte du projet
- Présente les tableaux en format Markdown lisible
- Structure en titres et sous-titres clairs
- Adapte le vocabulaire au niveau académique`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (userExtraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${userExtraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
        temperature: 0.6,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result.trim() });
    } catch (err: any) {
      console.error("Financial Simulation Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération de la simulation financière" });
    }
  });

  // === MODULE: QUESTIONNAIRE ANALYSIS (DÉPOUILLEMENT) ===
  app.post(api.sections.generateQuestionnaireAnalysis.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "questionnaire_analysis");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, analysisType, respondentCount, responseData, customInstructions, questionnaireContent, extraContext: userExtraContext } = api.sections.generateQuestionnaireAnalysis.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const typeLabels: Record<string, string> = {
        depouillement: "Dépouillement complet",
        tri_plat: "Tri à plat",
        tri_croise: "Tri croisé",
        analyse_thematique: "Analyse thématique des réponses",
      };

      const systemPrompt = `Tu es un expert en méthodologie de recherche et en analyse de données d'enquête. Tu maîtrises le dépouillement de questionnaires, les tris à plat, les tris croisés et l'analyse thématique des réponses ouvertes. Tu produis des analyses rigoureuses, structurées et adaptées au contexte académique.`;

      const taskPrompt = `=== TÂCHE: DÉPOUILLEMENT ET ANALYSE DU QUESTIONNAIRE ===

Type d'analyse: ${typeLabels[analysisType] || analysisType}
Nombre de répondants: ${respondentCount}
${customInstructions ? `Instructions spécifiques: ${customInstructions}` : ""}
${questionnaireContent ? `\n=== QUESTIONNAIRE UTILISÉ ===\n${questionnaireContent}\n` : ""}
=== DONNÉES DES RÉPONSES ===
${responseData}

Produis une analyse complète et structurée:

1. **Profil des répondants** : Synthèse du profil sociodémographique des ${respondentCount} répondants

2. **Résultats par question** :
   - Pour chaque question fermée: effectifs, pourcentages, tableau de fréquences
   - Pour les échelles de Likert: moyenne, médiane, écart-type
   - Pour les questions ouvertes: catégorisation thématique des réponses

3. **Tableaux de synthèse** : Présente les résultats sous forme de tableaux Markdown clairs

4. **Analyse et interprétation** : 
   - Tendances principales
   - Résultats significatifs
   - Points de convergence et de divergence

5. **Liens avec les hypothèses** : Si des hypothèses sont définies, relie les résultats aux hypothèses

6. **Limites méthodologiques** : Taille de l'échantillon, biais potentiels, représentativité

IMPORTANT:
- Sois rigoureux dans les calculs et pourcentages
- Utilise des tableaux Markdown lisibles
- Structure en titres et sous-titres académiques
- Adapte le vocabulaire au niveau académique`;

      const userPrompt = projectContext + "\n" +
        (validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : "") +
        (userExtraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${userExtraContext}\n` : "") +
        taskPrompt;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
        temperature: 0.5,
      });

      const result = completion.choices[0]?.message?.content || "";
      await recordQuotaUsage(userId, result);

      res.json({ content: result.trim() });
    } catch (err: any) {
      console.error("Questionnaire Analysis Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'analyse du questionnaire" });
    }
  });

  // === USER API KEY ===
  app.post("/api/settings/openai-key", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const { apiKey } = req.body;
    try {
      if (apiKey) {
        const testClient = new OpenAI({ apiKey });
        await testClient.models.list();
      }
      const existing = await storage.getProfile(userId);
      if (existing) {
        await storage.updateProfile(userId, { openaiApiKey: apiKey || null } as any);
      }
      res.json({ success: true, hasKey: !!apiKey });
    } catch (err: any) {
      res.status(400).json({ message: "Clé API invalide. Vérifiez qu'elle est correcte." });
    }
  });

  app.get("/api/settings/openai-key", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const profile = await storage.getProfile(userId);
    res.json({ hasKey: !!(profile as any)?.openaiApiKey });
  });

  // === MODULE VISIBILITY (public) ===
  app.get("/api/modules/visibility", async (req, res) => {
    try {
      const setting = await storage.getAdminSetting("module_visibility");
      if (setting && typeof setting === "object") {
        res.json(setting);
      } else {
        res.json({});
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ENTITLEMENTS ===
  app.get("/api/entitlements", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (isSuperAdminById(userId)) {
      return res.json({ entitlements: ALL_ENTITLEMENT_KEYS });
    }
    const entitlements = await storage.getUserEntitlements(userId);
    res.json({ entitlements });
  });

  app.get("/api/purchases", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const purchases = await storage.getUserPurchases(userId);
    res.json(purchases);
  });

  // === STRIPE CHECKOUT ===
  const PRICING: Record<string, { price: number; label: string }> = {
    core_pack: { price: 17900, label: "Pack Mémoire / TFE / VAE – Fondations complètes" },
    foundation: { price: 2900, label: "Sujet / Problématique / Hypothèses" },
    plan: { price: 2500, label: "Plan académique structuré" },
    conceptual: { price: 3500, label: "Cadre conceptuel (concepts + schémas)" },
    literature: { price: 4900, label: "Revue de littérature" },
    methodology: { price: 3900, label: "Méthodologie complète" },
    questionnaire: { price: 2500, label: "Questionnaire (collecte)" },
    guide_entretien: { price: 2500, label: "Guide d'entretien (collecte)" },
    pack_collecte: { price: 4500, label: "Pack Collecte (questionnaire + guide)" },
    simulation_entretien: { price: 1900, label: "Simulation d'entretien guidée" },
    data_visualization: { price: 2500, label: "Analyse et visualisation des données" },
    confrontation: { price: 1900, label: "Confrontation des résultats" },
    hypothesis_validation: { price: 1900, label: "Validation des hypothèses" },
    formulaire: { price: 2500, label: "Formulaire en ligne" },
    remerciements: { price: 900, label: "Page de remerciements" },
    abstract_resume: { price: 900, label: "Résumé / Abstract" },
    sigles_acronymes: { price: 900, label: "Sigles et acronymes" },
    cover_page: { price: 1500, label: "Page de couverture" },
    financial_simulation: { price: 2900, label: "Simulation financière" },
    questionnaire_analysis: { price: 2900, label: "Dépouillement du questionnaire" },
    analyse_qualitative: { price: 3900, label: "Analyse qualitative" },
    analyse_quantitative: { price: 3900, label: "Analyse quantitative" },
    pack_analyse: { price: 6900, label: "Pack Analyse complet" },
    article_analysis: { price: 2900, label: "Résumé & analyse d'articles" },
    article_confrontation: { price: 2900, label: "Confrontation d'articles" },
    biblio_multinormes: { price: 2500, label: "Bibliographie multi-normes" },
    pack_revue: { price: 5900, label: "Pack Revue avancée" },
    soutenance_ppt: { price: 2900, label: "PowerPoint de soutenance" },
    soutenance_simulation: { price: 2900, label: "Simulation de soutenance" },
    audit: { price: 4900, label: "Audit complet du mémoire" },
    pack_soutenance: { price: 7900, label: "Pack Soutenance & Audit" },
    export_illimite: { price: 1900, label: "Export illimité Word / PPT" },
    fusion_memoire: { price: 1900, label: "Fusion mémoire en un document" },
    words_20k: { price: 1900, label: "+20 000 mots" },
    words_50k: { price: 3900, label: "+50 000 mots" },
    extra_project: { price: 2900, label: "Projet supplémentaire" },
  };

  const PACK_PRICES: Record<string, { price: number; items: string[] }> = {
    core_pack: { price: 17900, items: ["core_pack"] },
    pack_collecte: { price: 4500, items: ["questionnaire", "guide_entretien"] },
    pack_analyse: { price: 6900, items: ["analyse_qualitative", "analyse_quantitative"] },
    pack_revue: { price: 5900, items: ["article_analysis", "article_confrontation", "biblio_multinormes"] },
    pack_soutenance: { price: 7900, items: ["soutenance_ppt", "soutenance_simulation", "audit"] },
  };

  app.post("/api/checkout", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { items, pack } = req.body as { items?: string[]; pack?: string };

      let lineItems: { key: string; price: number; label: string }[] = [];

      if (pack && PACK_PRICES[pack]) {
        const packDef = PACK_PRICES[pack];
        lineItems = packDef.items.map(key => ({
          key,
          price: PRICING[key]?.price || 0,
          label: PRICING[key]?.label || key,
        }));
      } else if (items?.length) {
        lineItems = items.filter(key => PRICING[key]).map(key => ({
          key,
          price: PRICING[key].price,
          label: PRICING[key].label,
        }));
      }

      if (!lineItems.length) {
        return res.status(400).json({ message: "Aucun article sélectionné" });
      }

      const existing = await storage.getUserEntitlements(userId);
      lineItems = lineItems.filter(item => !existing.includes(item.key));

      if (!lineItems.length) {
        return res.status(400).json({ message: "Vous possédez déjà tous ces éléments" });
      }

      const totalCents = pack ? (PACK_PRICES[pack]?.price || 0) : lineItems.reduce((s, i) => s + i.price, 0);

      const stripeSecretKey = await ensureStripeKey();
      if (!stripeSecretKey) {
        return res.status(503).json({ message: "Le système de paiement n'est pas configuré. Veuillez contacter l'administrateur." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems.map(item => ({
          price_data: {
            currency: "eur",
            product_data: { name: item.label },
            unit_amount: item.price,
          },
          quantity: 1,
        })),
        mode: "payment",
        success_url: `${req.headers.origin || ""}/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || ""}/billing?payment=cancelled`,
        metadata: {
          userId,
          items: JSON.stringify(lineItems.map(i => i.key)),
          pack: pack || "",
        },
      });

      trackAbandonedCheckout(
        userId,
        lineItems.map(i => ({ key: i.key, label: i.label, price: i.price })),
        lineItems.reduce((s, i) => s + i.price, 0),
        session.id
      ).catch(err => console.error("[CHECKOUT] Track abandoned cart error:", err));

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("Checkout error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la création du paiement" });
    }
  });

  app.post("/api/checkout/confirm", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ message: "Session ID manquant" });

      const stripeKeyConfirm = await ensureStripeKey();
      if (!stripeKeyConfirm) {
        return res.status(503).json({ message: "Le système de paiement n'est pas configuré." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKeyConfirm);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Paiement non confirmé" });
      }

      const items = JSON.parse(session.metadata?.items || "[]") as string[];
      const pack = session.metadata?.pack || "";

      for (const key of items) {
        const existing = await storage.getUserEntitlements(userId);
        if (!existing.includes(key)) {
          await storage.createPurchase({
            userId,
            itemType: pack ? "pack" : (["foundation", "plan", "conceptual", "literature", "methodology"].includes(key) ? "section" : key === "base" ? "base" : "option"),
            itemKey: key,
            price: PRICING[key]?.price || 0,
            currency: "eur",
            stripeSessionId: sessionId,
            stripePaymentIntentId: session.payment_intent as string,
            status: "active",
          });
        }
      }

      const profile = await storage.getProfile(userId);
      const totalAmount = items.reduce((s: number, key: string) => s + (PRICING[key]?.price || 0), 0);
      const invoiceNumber = await storage.getNextInvoiceNumber();
      await storage.createInvoice({
        userId,
        invoiceNumber,
        amount: totalAmount,
        currency: "eur",
        status: "paid",
        items: items.map((key: string) => ({ key, label: PRICING[key]?.label || key, price: PRICING[key]?.price || 0 })),
        clientName: profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : undefined,
        clientEmail: profile?.email || undefined,
        paymentMethod: "card",
        stripePaymentIntentId: session.payment_intent as string,
      });

      markCheckoutRecovered(userId, items, sessionId).catch(err =>
        console.error("[CHECKOUT] Mark recovered error:", err)
      );

      if (profile?.email) {
        const emailItems = items.map((key: string) => ({
          label: PRICING[key]?.label || key,
          price: PRICING[key]?.price || 0,
        }));
        const firstName = (profile.firstName || profile.email.split("@")[0] || "Client");

        sendPaymentConfirmationEmail(
          profile.email,
          firstName,
          emailItems,
          totalAmount,
          invoiceNumber
        ).catch(err => console.error("[CHECKOUT] Payment confirmation email error:", err));

        sendInvoiceEmail(
          profile.email,
          firstName,
          invoiceNumber,
          emailItems,
          totalAmount
        ).catch(err => console.error("[CHECKOUT] Invoice email error:", err));
      }

      res.json({ success: true, entitlements: await storage.getUserEntitlements(userId) });
    } catch (err: any) {
      console.error("Confirm error:", err);
      res.status(500).json({ message: err.message || "Erreur de confirmation" });
    }
  });

  // === INVOICES ===
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const userInvoices = await storage.getUserInvoices(userId);
    res.json(userInvoices);
  });

  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const invoice = await storage.getInvoice(parseInt(req.params.id));
    if (!invoice || invoice.userId !== userId) return res.status(404).json({ message: "Facture introuvable" });
    res.json(invoice);
  });

  // === QUOTA MANAGEMENT ===
  const SURPLUS_PRICING: Record<string, { price: number; amount: number; label: string; type: string }> = {
    words_5k: { price: 1900, amount: 5000, label: "+5 000 mots", type: "words" },
    words_10k: { price: 2900, amount: 10000, label: "+10 000 mots", type: "words" },
    actions_50: { price: 900, amount: 50, label: "+50 actions", type: "actions" },
    project_1: { price: 900, amount: 1, label: "+1 projet actif", type: "projects" },
  };

  app.get("/api/quota", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const quota = await storage.resetQuotaIfNeeded(userId);
    const activeProjects = await storage.getActiveProjectCount(userId);
    res.json({ ...quota, activeProjects, surplusOptions: SURPLUS_PRICING });
  });

  app.post("/api/quota/surplus", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { surplusKey } = req.body as { surplusKey: string };
      const surplus = SURPLUS_PRICING[surplusKey];
      if (!surplus) return res.status(400).json({ message: "Pack surplus invalide" });

      const stripeKeySurplusCheckout = await ensureStripeKey();
      if (!stripeKeySurplusCheckout) {
        return res.status(503).json({ message: "Le système de paiement n'est pas configuré. Veuillez contacter l'administrateur." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKeySurplusCheckout);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "eur",
            product_data: { name: surplus.label },
            unit_amount: surplus.price,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${req.headers.origin || ""}/billing?surplus=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || ""}/billing?surplus=cancelled`,
        metadata: { userId, surplusKey, surplusType: surplus.type, surplusAmount: String(surplus.amount) },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: any) {
      console.error("Surplus checkout error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'achat du surplus" });
    }
  });

  // === ADMIN CHECK ===
  function isSuperAdmin(req: any): boolean {
    const userId = getUserId(req);
    return isSuperAdminById(userId);
  }

  function requireAdmin(req: any, res: any): boolean {
    if (!req.isAuthenticated()) { res.status(401).json({ message: "Unauthorized" }); return false; }
    if (!isSuperAdmin(req)) { res.status(403).json({ message: "Forbidden" }); return false; }
    return true;
  }

  // Admin status check
  app.get("/api/admin/check", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ isAdmin: false });
    const userId = getUserId(req);
    const adminIds = (process.env.SUPER_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    console.log("[ADMIN_CHECK] userId:", JSON.stringify(userId), "type:", typeof userId, "adminIds:", JSON.stringify(adminIds), "match:", adminIds.includes(userId));
    res.json({ isAdmin: isSuperAdmin(req) });
  });

  // === ADMIN: USER MANAGEMENT ===

  app.get("/api/admin/users", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const search = req.query.search as string | undefined;
      const users = await storage.listAllUsers(search);
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/users/:userId", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const user = await storage.getUserById(req.params.userId);
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/users/:userId/credits", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { words = 0, actions = 0 } = req.body;
      const quota = await storage.addCreditsToUser(req.params.userId, words, actions);
      await storage.createAuditLog({
        actorId: getUserId(req),
        actorEmail: req.user?.claims?.email,
        action: "add_credits",
        targetType: "user",
        targetId: req.params.userId,
        details: { words, actions },
      });
      res.json(quota);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/admin/users/:userId/quota", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const updates = req.body;
      const quota = await storage.updateUserQuotaAdmin(req.params.userId, updates);
      await storage.createAuditLog({
        actorId: getUserId(req),
        actorEmail: req.user?.claims?.email,
        action: "update_quota",
        targetType: "user",
        targetId: req.params.userId,
        details: updates,
      });
      res.json(quota);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: ENTITLEMENTS GRANT/REVOKE ===

  app.get("/api/admin/users/:userId/entitlements", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const purchases = await storage.getUserPurchases(req.params.userId);
      const items = purchases.map(p => p.itemKey);
      res.json({ items });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/users/:userId/entitlements", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { itemKey } = req.body;
      if (!itemKey) return res.status(400).json({ message: "itemKey requis" });
      const existing = await storage.getUserPurchases(req.params.userId);
      if (existing.some(p => p.itemKey === itemKey)) {
        return res.status(409).json({ message: "Module déjà activé" });
      }
      await storage.createPurchase({
        userId: req.params.userId,
        itemType: "admin_grant",
        itemKey,
        price: 0,
        currency: "eur",
        stripeSessionId: "admin_grant",
        stripePaymentIntentId: "admin_grant",
        status: "active",
      });
      await storage.createAuditLog({
        actorId: getUserId(req),
        actorEmail: (req.user as any)?.claims?.email,
        action: "grant_entitlement",
        targetType: "user",
        targetId: req.params.userId,
        details: { itemKey },
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/users/:userId/entitlements/:itemKey", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { userId, itemKey } = req.params;
      await storage.deletePurchaseByKey(userId, itemKey);
      await storage.createAuditLog({
        actorId: getUserId(req),
        actorEmail: (req.user as any)?.claims?.email,
        action: "revoke_entitlement",
        targetType: "user",
        targetId: userId,
        details: { itemKey },
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: PLANS ===

  app.get("/api/admin/plans", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allPlans = await storage.getPlans();
      res.json(allPlans);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/plans", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const plan = await storage.createPlan(req.body);
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "create_plan",
        targetType: "plan",
        targetId: String(plan.id),
        details: req.body,
      });
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/admin/plans/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const plan = await storage.updatePlan(Number(req.params.id), req.body);
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "update_plan",
        targetType: "plan",
        targetId: req.params.id,
        details: req.body,
      });
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/plans/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      await storage.deletePlan(Number(req.params.id));
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "delete_plan",
        targetType: "plan",
        targetId: req.params.id,
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: AI SETTINGS ===

  app.get("/api/admin/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allSettings = await storage.getAllAdminSettings();
      const settingsMap: Record<string, any> = {};
      const sensitiveKeys = ["stripe_secret_key", "openai_api_key"];
      for (const s of allSettings) {
        if (!sensitiveKeys.includes(s.key)) {
          settingsMap[s.key] = s.value;
        }
      }
      settingsMap.hasGlobalOpenAIKey = !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
      const stripeKey = await ensureStripeKey();
      settingsMap.hasStripeKey = !!stripeKey;
      res.json(settingsMap);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ message: "Clé requise" });
      const setting = await storage.setAdminSetting(key, value);
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "update_setting",
        targetType: "setting",
        targetId: key,
        details: { value },
      });
      res.json(setting);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/api-key", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { type, key } = req.body;
      if (!type || !key) return res.status(400).json({ message: "Type et clé requis" });
      if (type === "openai") {
        process.env.AI_INTEGRATIONS_OPENAI_API_KEY = key;
        await storage.setAdminSetting("openai_key_configured", "true");
      } else if (type === "stripe") {
        process.env.STRIPE_SECRET_KEY = key;
        await storage.setAdminSetting("stripe_secret_key", key);
        await storage.setAdminSetting("stripe_key_configured", "true");
      } else {
        return res.status(400).json({ message: "Type invalide" });
      }
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "configure_api_key",
        targetType: "setting",
        targetId: type,
        details: { type, configured: true },
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: LOGS ===

  app.get("/api/admin/audit-logs", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const logs = await storage.getAuditLogs(limit, offset);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/ai-logs", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const logs = await storage.getAiLogs(limit, offset);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/ai-logs/stats", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const stats = await storage.getAiLogStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: DUNNING & PAYMENT REMINDERS ===

  app.get("/api/admin/dunning/stats", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { getDunningStats } = await import("./dunning");
      const stats = await getDunningStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/dunning/reminders", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { getPaymentReminders } = await import("./dunning");
      const limit = Number(req.query.limit) || 50;
      const reminders = await getPaymentReminders(limit);
      res.json(reminders);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/dunning/emails/:reminderId", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { getDunningEmailHistory } = await import("./dunning");
      const emails = await getDunningEmailHistory(Number(req.params.reminderId));
      res.json(emails);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/dunning/process", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { processDunningQueue } = await import("./dunning");
      const result = await processDunningQueue();
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "manual_dunning_process",
        targetType: "dunning",
        details: result,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/dunning/test-reminder", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { createPaymentReminder } = await import("./dunning");
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const profile = await storage.getProfile(userId);
      await createPaymentReminder({
        userId,
        type: "test",
        amount: 17900,
        recipientEmail: profile?.email || undefined,
        recipientName: profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : undefined,
        failureReason: "Test reminder",
      });
      res.json({ success: true, message: "Test reminder created" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/dunning/resolve/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { db } = await import("./db");
      const { paymentReminders } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(paymentReminders)
        .set({ resolved: true, resolvedAt: new Date(), updatedAt: new Date() })
        .where(eq(paymentReminders.id, Number(req.params.id)));
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "resolve_dunning",
        targetType: "dunning",
        targetId: req.params.id,
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/recover-payment", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ message: "Session ID requis" });

      const stripeKey = await ensureStripeKey();
      if (!stripeKey) return res.status(503).json({ message: "Stripe non configuré" });

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: `Paiement non effectué (statut: ${session.payment_status})` });
      }

      const targetUserId = session.metadata?.userId;
      if (!targetUserId) return res.status(400).json({ message: "userId non trouvé dans les métadonnées de la session" });

      const items = JSON.parse(session.metadata?.items || "[]") as string[];
      const pack = session.metadata?.pack || "";

      let created = 0;
      for (const key of items) {
        const existing = await storage.getUserEntitlements(targetUserId);
        if (!existing.includes(key)) {
          await storage.createPurchase({
            userId: targetUserId,
            itemType: pack ? "pack" : "option",
            itemKey: key,
            price: PRICING[key]?.price || 0,
            currency: "eur",
            stripeSessionId: sessionId,
            stripePaymentIntentId: session.payment_intent as string,
            status: "active",
          });
          created++;
        }
      }

      const profile = await storage.getProfile(targetUserId);
      const totalAmount = items.reduce((s: number, key: string) => s + (PRICING[key]?.price || 0), 0);
      const invoiceNumber = await storage.getNextInvoiceNumber();
      await storage.createInvoice({
        userId: targetUserId,
        invoiceNumber,
        amount: totalAmount,
        currency: "eur",
        status: "paid",
        items: items.map((key: string) => ({ key, label: PRICING[key]?.label || key, price: PRICING[key]?.price || 0 })),
        clientName: profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : undefined,
        clientEmail: profile?.email || undefined,
        paymentMethod: "card",
        stripePaymentIntentId: session.payment_intent as string,
      });

      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "recover_payment",
        targetType: "payment",
        targetId: sessionId,
        details: { items, pack, userId: targetUserId, created },
      });

      res.json({ success: true, items, created, userId: targetUserId });
    } catch (err: any) {
      console.error("Recovery error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/dunning/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { senderEmail } = req.body;
      if (senderEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(senderEmail)) {
          return res.status(400).json({ message: "Format d'email invalide" });
        }
        await storage.setAdminSetting("dunning_sender_email", senderEmail);
      }
      await storage.createAuditLog({
        actorId: getUserId(req),
        action: "update_dunning_settings",
        targetType: "setting",
        details: { senderEmail },
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/dunning/settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const senderEmail = await storage.getAdminSetting("dunning_sender_email");
      const cleaned = typeof senderEmail === "string" ? senderEmail.replace(/^"+|"+$/g, "").trim() : "";
      res.json({ senderEmail: cleaned || "contact@academik.fr" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: PAYMENTS ===

  app.get("/api/admin/payments", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const limit = Number(req.query.limit) || 100;
      const purchases = await storage.getAllPurchases(limit);
      const surplus = await storage.getAllSurplus(limit);
      res.json({ purchases, surplus });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === ADMIN: CSV EXPORT ===

  app.get("/api/admin/users/export/csv", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allUsers = await storage.listAllUsers();
      const header = "ID,Prénom,Nom,Email,Statut,Projets,Mots utilisés,Mots limite,Actions utilisées,Actions limite,Date création\n";
      const rows = allUsers.map(u => {
        return `${u.id},${u.firstName || ""},${u.lastName || ""},${u.email || ""},${u.status},${u.projectCount},${u.quota?.wordsUsed || 0},${u.quota?.wordsLimit || 0},${u.quota?.actionsUsed || 0},${u.quota?.actionsLimit || 0},${u.createdAt || ""}`;
      }).join("\n");
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=users_export.csv");
      res.send(header + rows);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/quota/surplus/confirm", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ message: "Session ID manquant" });

      const stripeKeySurplus = await ensureStripeKey();
      if (!stripeKeySurplus) {
        return res.status(503).json({ message: "Le système de paiement n'est pas configuré." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKeySurplus);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Paiement non confirmé" });
      }

      const surplusType = session.metadata?.surplusType || "";
      const surplusAmount = Number(session.metadata?.surplusAmount || "0");
      const surplusKey = session.metadata?.surplusKey || "";
      const price = SURPLUS_PRICING[surplusKey]?.price || 0;

      await storage.addQuotaSurplus(userId, surplusType, surplusAmount, price);
      const updatedQuota = await storage.getQuota(userId);
      res.json({ success: true, quota: updatedQuota });
    } catch (err: any) {
      console.error("Surplus confirm error:", err);
      res.status(500).json({ message: err.message || "Erreur de confirmation surplus" });
    }
  });

  // === MODULE 11: DOCUMENT IMPORT + EXTRACT ===
  app.post(api.sections.importDocument.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const projectId = Number(req.params.projectId);
      const { content, fileName } = api.sections.importDocument.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);

      await storage.createDocument({ projectId, name: fileName, type: 'import', content });

      const systemPrompt = `Tu es un expert en analyse de documents académiques. Tu maîtrises parfaitement l'extraction d'informations structurées à partir de documents de recherche, mémoires, thèses, rapports de stage et travaux académiques. Réponds entièrement en français.`;

      const taskPrompt = `${projectContext}

=== TÂCHE: ANALYSE ET EXTRACTION D'UN DOCUMENT IMPORTÉ ===

Le document suivant a été importé par l'utilisateur. Analyse-le en profondeur et extrais les éléments structurants s'ils sont identifiables.

=== CONTENU DU DOCUMENT: ${fileName} ===
${content.substring(0, 8000)}${content.length > 8000 ? "\n[...contenu tronqué]" : ""}

Analyse ce document et extrais les éléments suivants s'ils sont identifiables:
1. **Sujet** : le sujet principal du travail
2. **Problématique** : la question de recherche ou problématique centrale
3. **Hypothèses** : les hypothèses formulées (si présentes)
4. **Résumé** : un résumé structuré du contenu (200-400 mots)

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "subject": "Le sujet identifié ou null si non identifiable",
  "problematic": "La problématique identifiée ou null si non identifiable",
  "hypotheses": "Les hypothèses identifiées ou null si non identifiables",
  "summary": "Résumé structuré du document"
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let subject: string | undefined;
      let problematic: string | undefined;
      let hypotheses: string | undefined;
      let summary: string | undefined;

      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          subject = parsed.subject && parsed.subject !== "null" ? parsed.subject : undefined;
          problematic = parsed.problematic && parsed.problematic !== "null" ? parsed.problematic : undefined;
          hypotheses = parsed.hypotheses && parsed.hypotheses !== "null" ? parsed.hypotheses : undefined;
          summary = parsed.summary || undefined;
        }
      } catch {
        summary = raw;
      }

      res.json({ subject, problematic, hypotheses, summary, fullContent: content });
    } catch (err: any) {
      console.error("Import Document Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'import du document" });
    }
  });

  // === MODULE 9: BATCH SIMULATION ===
  app.post(api.sections.simulateBatch.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "interview_simulation");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, questions, intervieweeProfile, tone, extraContext } = api.sections.simulateBatch.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un simulateur d'entretien académique. Tu incarnes un interviewé réaliste et crédible pour aider un étudiant-chercheur à préparer ses entretiens de terrain. Tu dois produire des réponses authentiques, nuancées et contextualisées pour CHAQUE question posée.`;

      const questionsList = questions.map((q, i) =>
        `Question ${i + 1}: "${q.question}"${q.prerequisites ? `\nPrérequis/contexte: ${q.prerequisites}` : ""}`
      ).join("\n\n");

      const taskPrompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}
${extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : ""}
=== TÂCHE: SIMULATION BATCH DE RÉPONSES D'ENTRETIEN ===

Profil de l'interviewé à incarner: ${intervieweeProfile}
${tone ? `Ton souhaité: ${tone}` : ""}

Voici les questions auxquelles tu dois répondre en incarnant le profil ci-dessus:

${questionsList}

Consignes de simulation:
1. **Incarne le profil** : adopte le langage, le niveau de vocabulaire, les préoccupations et la posture professionnelle correspondant au profil décrit
2. **Réponses réalistes** : chaque réponse doit sembler authentique avec des exemples concrets, des nuances et un niveau de détail cohérent
3. **Longueur adaptée** : chaque réponse doit faire entre 150 et 300 mots
4. **Suggestions de relance** : propose 2-3 suggestions de relance pour chaque question

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "responses": [
    {
      "question": "La question posée",
      "response": "La réponse simulée de l'interviewé...",
      "suggestions": ["Suggestion de relance 1", "Suggestion de relance 2"]
    }
  ]
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.8,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let responses: Array<{ question: string; response: string; suggestions?: string[] }> = [];
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          responses = Array.isArray(parsed.responses) ? parsed.responses : [];
        }
      } catch {
        responses = questions.map(q => ({ question: q.question, response: raw, suggestions: [] }));
      }

      res.json({ responses });
    } catch (err: any) {
      console.error("Simulate Batch Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la simulation batch" });
    }
  });

  // === MODULE 11: ASSISTED WRITING ===
  app.post(api.sections.assistWriting.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "assisted_writing");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, text, mode, sectionTarget, extraContext } = api.sections.assistWriting.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un assistant de rédaction académique de haut niveau. Tu aides les étudiants à AMÉLIORER leur propre texte sans jamais écrire de contenu nouveau à leur place. Tu respectes leur voix et leur style tout en élevant la qualité académique. Réponds entièrement en français.

RÈGLE ABSOLUE: Tu ne rédiges JAMAIS de contenu à la place de l'utilisateur. Tu améliores, reformules, structures ou corriges UNIQUEMENT le texte qu'il te soumet.`;

      const modeInstructions: Record<string, string> = {
        reformulate: `MODE: REFORMULATION ACADÉMIQUE
Reformule le texte suivant dans un registre académique plus soutenu:
- Améliore le vocabulaire (termes plus précis, académiques)
- Restructure les phrases pour plus de clarté
- Maintiens le sens original intact
- Ajoute des connecteurs logiques si nécessaire`,
        clarify: `MODE: CLARIFICATION
Simplifie et clarifie le texte suivant:
- Rends les idées plus accessibles
- Élimine les ambiguïtés
- Découpe les phrases trop longues
- Assure la fluidité de lecture`,
        structure: `MODE: STRUCTURATION
Restructure le texte suivant pour une meilleure logique argumentaire:
- Organise les idées en paragraphes cohérents
- Assure une progression logique
- Ajoute des transitions entre les idées
- Identifie et corrige les ruptures de logique`,
        improve_style: `MODE: AMÉLIORATION DU STYLE ACADÉMIQUE
Améliore le style académique du texte suivant:
- Élimine les tournures familières ou journalistiques
- Utilise la voix passive quand approprié
- Renforce la précision terminologique
- Assure un ton objectif et distancié`,
        check_coherence: `MODE: VÉRIFICATION DE COHÉRENCE
Vérifie la cohérence du texte suivant par rapport au plan et aux hypothèses du projet:
- Identifie les contradictions avec les sections validées
- Vérifie l'alignement avec la problématique
- Signale les écarts par rapport aux hypothèses
- Propose des ajustements pour renforcer la cohérence`,
      };

      const taskPrompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n` : ""}
${sectionTarget ? `\n=== SECTION CIBLE ===\nCette amélioration concerne la section: ${sectionTarget}\n` : ""}
${extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : ""}

=== TÂCHE: RÉDACTION ASSISTÉE ===

${modeInstructions[mode] || modeInstructions.reformulate}

=== TEXTE DE L'UTILISATEUR À AMÉLIORER ===
${text}

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "content": "Le texte amélioré selon le mode demandé...",
  "suggestions": [
    "Suggestion d'amélioration supplémentaire 1",
    "Suggestion d'amélioration supplémentaire 2"
  ]
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.4,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let content = raw;
      let suggestions: string[] | undefined;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          content = parsed.content || raw;
          suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : undefined;
        }
      } catch {
        content = raw;
      }

      res.json({ content, suggestions });
    } catch (err: any) {
      console.error("Assist Writing Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'assistance à la rédaction" });
    }
  });

  // === MODULE 12: GENERATE FULL BIBLIOGRAPHY ===
  app.post(api.sections.generateBibliographyFull.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "bibliography");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, norm, extraContext } = api.sections.generateBibliographyFull.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const normLabels: Record<string, string> = {
        apa7: "APA 7e édition",
        vancouver: "Vancouver",
        mla: "MLA (Modern Language Association)",
        chicago: "Chicago (Notes et bibliographie)",
      };

      const systemPrompt = `Tu es un expert en bibliographie académique et en normes de citation. Tu maîtrises parfaitement les normes ${normLabels[norm] || norm}. Tu génères des bibliographies complètes, rigoureuses et parfaitement formatées. Réponds entièrement en français.`;

      const taskPrompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES (contenant les sources citées) ===\n${validatedContext}\n` : ""}
${extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : ""}

=== TÂCHE: GÉNÉRATION DE LA BIBLIOGRAPHIE COMPLÈTE ===

Norme bibliographique demandée: **${normLabels[norm] || norm}**

À partir de TOUTES les sections validées du projet (revue de littérature, cadre conceptuel, cadre théorique, méthodologie, etc.), identifie et compile toutes les sources citées ou référencées.

Pour chaque source identifiée:
1. Reconstitue la référence bibliographique complète selon la norme ${normLabels[norm] || norm}
2. Classe les sources par ordre alphabétique (ou numérique pour Vancouver)
3. Vérifie la cohérence du formatage

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "content": "La bibliographie complète formatée en Markdown...",
  "sources": [
    {"author": "Nom, Prénom", "year": "2024", "title": "Titre de l'ouvrage", "type": "article/livre/thèse/web", "reference": "Référence complète formatée selon la norme"}
  ]
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let content = raw;
      let sources: any[] = [];
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          content = parsed.content || raw;
          sources = Array.isArray(parsed.sources) ? parsed.sources : [];
        }
      } catch {
        content = raw;
      }

      res.json({ content, sources });
    } catch (err: any) {
      console.error("Generate Bibliography Full Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération de la bibliographie" });
    }
  });

  // === MODULE 12: CHECK BIBLIOGRAPHY COHERENCE ===
  app.post(api.sections.checkBibliographyCoherence.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "bibliography");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint. Achetez un pack supplémentaire pour continuer."
          : "Quota d'actions mensuel atteint. Achetez un pack supplémentaire pour continuer.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, bibliography, extraContext } = api.sections.checkBibliographyCoherence.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en vérification bibliographique académique. Tu vérifies la cohérence entre les citations dans le texte et les entrées bibliographiques. Tu identifies les erreurs, omissions et incohérences avec rigueur. Réponds entièrement en français.`;

      const taskPrompt = `${projectContext}
${validatedContext ? `\n=== SECTIONS VALIDÉES (contenant les citations dans le texte) ===\n${validatedContext}\n` : ""}
${extraContext ? `\n=== INSTRUCTIONS UTILISATEUR ===\n${extraContext}\n` : ""}

=== TÂCHE: VÉRIFICATION DE COHÉRENCE BIBLIOGRAPHIQUE ===

Voici la bibliographie soumise par l'utilisateur:
${bibliography}

Vérifie la cohérence entre:
1. **Citations dans le texte** : identifie toutes les citations (auteur, année) présentes dans les sections validées
2. **Entrées bibliographiques** : vérifie que chaque citation a une entrée correspondante dans la bibliographie
3. **Références orphelines** : identifie les entrées bibliographiques qui ne sont citées nulle part dans le texte
4. **Format** : vérifie la cohérence du formatage des entrées
5. **Complétude** : signale les informations manquantes dans les entrées

IMPORTANT: Réponds en JSON valide sous cette forme exacte:
{
  "alerts": [
    {"type": "missing_entry", "message": "La citation (Dupont, 2023) n'a pas d'entrée correspondante dans la bibliographie"},
    {"type": "orphan_reference", "message": "L'entrée 'Martin (2022)' n'est citée nulle part dans le texte"},
    {"type": "format_error", "message": "L'entrée pour 'Durand (2021)' est incomplète: éditeur manquant"},
    {"type": "inconsistency", "message": "Description de l'incohérence..."}
  ],
  "suggestions": [
    "Suggestion d'amélioration 1",
    "Suggestion d'amélioration 2"
  ]
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const raw = (completion.choices[0]?.message?.content || "").trim();
      await recordQuotaUsage(userId, raw);

      let alerts: Array<{ type: string; message: string }> = [];
      let suggestions: string[] = [];
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];
          suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
        }
      } catch {
        alerts = [{ type: "info", message: raw }];
      }

      res.json({ alerts, suggestions });
    } catch (err: any) {
      console.error("Check Bibliography Coherence Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la vérification de cohérence bibliographique" });
    }
  });

  // === MODULE 14: SOUTENANCE PPT ===
  app.post(api.sections.generateSoutenancePPT.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint."
          : "Quota d'actions mensuel atteint.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, slideCount, theme, extraContext } = api.sections.generateSoutenancePPT.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const systemPrompt = `Tu es un expert en préparation de soutenances académiques. Tu crées des présentations PowerPoint structurées, claires et professionnelles pour des soutenances de mémoire, TFE et rapports de stage. Réponds UNIQUEMENT en JSON valide.`;

      const userPrompt = `${projectContext}

${validatedContext ? `=== CONTENU VALIDÉ DU PROJET ===\n${validatedContext}\n` : ""}
${extraContext || ""}

Génère une présentation de soutenance de ${slideCount} slides au format JSON.
Thème visuel: ${theme}

Structure attendue (adapte selon le contenu disponible):
1. Page de garde (titre, auteur, formation)
2. Contexte & justification du sujet
3. Problématique & objectifs
4. Hypothèses
5. Cadre conceptuel
6. Méthodologie
7-8. Résultats principaux
9. Discussion & confrontation avec la littérature
10. Validation / invalidation des hypothèses
11. Conclusion & perspectives
12. Remerciements

IMPORTANT: Utilise UNIQUEMENT le contenu déjà validé du projet. Ne crée PAS de nouveau contenu.

Réponds en JSON: { "slides": [{ "title": "...", "content": "...", "notes": "..." }] }`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 6000,
        temperature: 0.5,
      });

      const raw = response.choices[0].message.content || "{}";
      await recordQuotaUsage(userId, raw);

      let slides: { title: string; content: string; notes?: string }[] = [];
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        slides = parsed.slides || [];
      } catch {
        slides = [{ title: "Erreur", content: "Impossible de parser la réponse. Contenu brut:\n" + raw }];
      }

      res.json({ slides });
    } catch (err: any) {
      console.error("Soutenance PPT Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du PowerPoint" });
    }
  });

  // === MODULE 15: SIMULATION DE SOUTENANCE ===
  app.post(api.sections.generateJuryQuestions.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint."
          : "Quota d'actions mensuel atteint.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, juryType, questionCount, extraContext } = api.sections.generateJuryQuestions.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const juryDescriptions: Record<string, string> = {
        academique: "jury académique (enseignants-chercheurs, directeurs de mémoire) - questions théoriques, méthodologiques, épistémologiques",
        professionnel: "jury professionnel (experts métier, tuteurs de stage) - questions pratiques, opérationnelles, retour d'expérience",
        mixte: "jury mixte (académiques et professionnels) - équilibre entre théorie et pratique",
      };

      const systemPrompt = `Tu es un expert en préparation de soutenances académiques. Tu simules un ${juryDescriptions[juryType] || juryDescriptions.academique}. Tu identifies les points faibles du travail et proposes des réponses structurées. Réponds UNIQUEMENT en JSON valide.`;

      const userPrompt = `${projectContext}

${validatedContext ? `=== CONTENU VALIDÉ DU PROJET ===\n${validatedContext}\n` : ""}
${extraContext || ""}

Génère exactement ${questionCount} questions qu'un jury de soutenance pourrait poser, réparties dans ces catégories:
- Méthodologiques: questions sur le choix de méthode, la validité, la fiabilité
- Théoriques: questions sur le cadre conceptuel, les théories mobilisées
- Critiques: questions sur les limites, les biais, les lacunes
- Pratiques: questions sur l'application, les recommandations, les perspectives

Pour chaque question, propose une réponse argumentée et structurée.
Identifie aussi les points faibles du travail que le jury pourrait relever.

Réponds en JSON:
{
  "questions": [
    { "category": "Méthodologique|Théorique|Critique|Pratique", "question": "...", "suggestedAnswer": "...", "difficulty": "facile|moyenne|difficile" }
  ],
  "weakPoints": ["point faible 1", "point faible 2", ...]
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 6000,
        temperature: 0.7,
      });

      const raw = response.choices[0].message.content || "{}";
      await recordQuotaUsage(userId, raw);

      let questions: any[] = [];
      let weakPoints: string[] = [];
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        questions = parsed.questions || [];
        weakPoints = parsed.weakPoints || [];
      } catch {
        questions = [{ category: "Erreur", question: "Impossible de parser la réponse", suggestedAnswer: raw, difficulty: "moyenne" }];
      }

      res.json({ questions, weakPoints });
    } catch (err: any) {
      console.error("Jury Questions Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération des questions" });
    }
  });

  // === MODULE 16: AUDIT DE MÉMOIRE ===
  app.post(api.sections.auditMemoire.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const quotaCheck = await checkAndConsumeQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        message: quotaCheck.reason === "words"
          ? "Quota de mots mensuel atteint."
          : "Quota d'actions mensuel atteint.",
        quotaExceeded: quotaCheck.reason,
        quota: quotaCheck.quota
      });
    }

    try {
      const { projectId, memoireContent, guideContent, tutorInstructions, extraContext } = api.sections.auditMemoire.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);

      const systemPrompt = `Tu es un auditeur académique expert. Tu analyses des mémoires, TFE et rapports de stage pour identifier les forces, faiblesses et proposer des améliorations concrètes. Tu es rigoureux, constructif et bienveillant. Réponds UNIQUEMENT en JSON valide.`;

      let userPrompt = `Effectue un audit complet du mémoire suivant selon 3 axes : structurel, méthodologique, et théorique/bibliographique.

=== MÉMOIRE À AUDITER ===
${memoireContent.substring(0, 15000)}
`;

      if (guideContent) {
        userPrompt += `\n=== GUIDE MÉTHODOLOGIQUE DE RÉFÉRENCE ===\n${guideContent.substring(0, 3000)}\n`;
      }
      if (tutorInstructions) {
        userPrompt += `\n=== CONSIGNES DU TUTEUR ===\n${tutorInstructions}\n`;
      }
      if (extraContext) {
        userPrompt += `\n${extraContext}\n`;
      }

      userPrompt += `
Analyse selon ces axes:

1. AUDIT STRUCTUREL:
- Respect du plan académique attendu
- Cohérence globale et enchaînement logique des parties
- Qualité des transitions et de l'argumentation

2. AUDIT MÉTHODOLOGIQUE:
- Adéquation entre méthode choisie et problématique
- Cohérence des outils de collecte et d'analyse
- Rigueur dans la validation des hypothèses

3. AUDIT THÉORIQUE & BIBLIOGRAPHIQUE:
- Qualité et pertinence des sources
- Respect des normes bibliographiques
- Cohérence entre citations dans le texte et bibliographie

Réponds en JSON:
{
  "structural": { "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["..."] },
  "methodological": { "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["..."] },
  "theoretical": { "strengths": ["..."], "weaknesses": ["..."], "recommendations": ["..."] },
  "priorities": ["correction prioritaire 1", "correction prioritaire 2", ...],
  "score": 0-100
}`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        max_tokens: 6000,
        temperature: 0.4,
      });

      const raw = response.choices[0].message.content || "{}";
      await recordQuotaUsage(userId, raw);

      const defaultAuditAxis = { strengths: [], weaknesses: [], recommendations: [] };
      let result: any;
      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        result = JSON.parse(cleaned);
      } catch {
        result = {
          structural: { ...defaultAuditAxis, weaknesses: ["Erreur lors de l'analyse. Contenu brut: " + raw.substring(0, 500)] },
          methodological: defaultAuditAxis,
          theoretical: defaultAuditAxis,
          priorities: [],
        };
      }

      res.json({
        structural: result.structural || defaultAuditAxis,
        methodological: result.methodological || defaultAuditAxis,
        theoretical: result.theoretical || defaultAuditAxis,
        priorities: result.priorities || [],
        score: result.score,
      });
    } catch (err: any) {
      console.error("Audit Memoire Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'audit du mémoire" });
    }
  });

  // === MODULE 13: EXPORT DOCUMENT ===
  app.post(api.sections.exportDocument.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const hasAccess = await checkSectionEntitlement(userId, "exports");
    if (!hasAccess) {
      return res.status(403).json({ error: "Accès non autorisé. Veuillez activer le module correspondant." });
    }

    try {
      const projectId = Number(req.params.projectId);
      const input = api.sections.exportDocument.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const allSections = await storage.getSections(projectId);
      const sectionsToExport = input.sections
        ? allSections.filter(s => input.sections!.includes(s.key))
        : allSections;

      let exportContent = "";

      const SECTION_SEPARATOR = "\n<!--SECTION_BREAK-->\n";

      if (input.includeTableOfContents) {
        exportContent += "# Table des matières\n\n";
        for (const section of sectionsToExport) {
          const label = SECTION_LABELS[section.key] || section.key;
          exportContent += `- ${label}\n`;
        }
        exportContent += SECTION_SEPARATOR;
      }

      for (const section of sectionsToExport) {
        const label = SECTION_LABELS[section.key] || section.key;
        const version = await storage.getActiveVersion(section.id);
        const content = version?.content || "_Section non rédigée_";
        exportContent += `# ${label}\n\n${content}${SECTION_SEPARATOR}`;
      }

      if (input.includeBibliography) {
        const bibSection = allSections.find(s => s.key === "bibliography");
        if (bibSection) {
          const bibVersion = await storage.getActiveVersion(bibSection.id);
          if (bibVersion) {
            exportContent += `# Bibliographie\n\n${bibVersion.content}${SECTION_SEPARATOR}`;
          }
        }
      }

      if (input.includeAnnexes) {
        const docs = await storage.getDocuments(projectId);
        if (docs.length > 0) {
          exportContent += `# Annexes\n\n`;
          for (const doc of docs) {
            exportContent += `## ${doc.name}\n\n${doc.content || "_Contenu non disponible_"}\n\n`;
          }
        }
      }

      const exportTypeLabels: Record<string, string> = {
        draft: "brouillon",
        tutor: "tuteur",
        final: "final",
      };

      const fileName = `${project.name.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæ\s-]/g, "").replace(/\s+/g, "_")}_${exportTypeLabels[input.exportType] || "export"}.${input.format}`;

      res.json({ content: exportContent, fileName });
    } catch (err: any) {
      console.error("Export Document Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'export du document" });
    }
  });

  // === FORMS API ===

  app.get("/api/projects/:projectId/forms", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(404).json({ message: "Projet non trouvé" });
      const formsList = await storage.getFormsByProject(projectId);
      const formsWithCounts = await Promise.all(formsList.map(async (f) => {
        const responseCount = await storage.getFormResponseCount(f.id);
        return { ...f, responseCount };
      }));
      res.json(formsWithCounts);
    } catch (err: any) {
      console.error("List Forms Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la récupération des formulaires" });
    }
  });

  app.post("/api/projects/:projectId/forms", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(404).json({ message: "Projet non trouvé" });
      const body = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }).parse(req.body);
      const publicId = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
      const form = await storage.createForm({
        projectId,
        userId,
        title: body.title,
        description: body.description || null,
        publicId,
        status: "draft",
        settings: null,
      });
      res.status(201).json(form);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Create Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la création du formulaire" });
    }
  });

  app.get("/api/forms/:formId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const questions = await storage.getFormQuestions(formId);
      const responseCount = await storage.getFormResponseCount(formId);
      res.json({ ...form, questions, responseCount });
    } catch (err: any) {
      console.error("Get Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la récupération du formulaire" });
    }
  });

  app.patch("/api/forms/:formId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const body = z.object({
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        status: z.enum(["draft", "published", "closed"]).optional(),
      }).parse(req.body);
      const updated = await storage.updateForm(formId, body);
      res.json(updated);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Update Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la mise à jour du formulaire" });
    }
  });

  app.delete("/api/forms/:formId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      await storage.deleteForm(formId);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Delete Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la suppression du formulaire" });
    }
  });

  app.post("/api/forms/:formId/questions", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const body = z.object({
        type: z.string().min(1),
        label: z.string().min(1),
        description: z.string().optional(),
        options: z.any().optional(),
        required: z.boolean().optional(),
      }).parse(req.body);
      const existingQuestions = await storage.getFormQuestions(formId);
      const maxOrder = existingQuestions.reduce((max, q) => Math.max(max, q.order), -1);
      const question = await storage.createFormQuestion({
        formId,
        type: body.type,
        label: body.label,
        description: body.description || null,
        options: body.options || null,
        required: body.required ?? false,
        order: maxOrder + 1,
      });
      res.status(201).json(question);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Add Question Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de l'ajout de la question" });
    }
  });

  app.patch("/api/forms/:formId/questions/:questionId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const questionId = parseInt(req.params.questionId);
      const body = z.object({
        type: z.string().min(1).optional(),
        label: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        options: z.any().optional(),
        required: z.boolean().optional(),
      }).parse(req.body);
      const updated = await storage.updateFormQuestion(questionId, body);
      res.json(updated);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Update Question Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la mise à jour de la question" });
    }
  });

  app.delete("/api/forms/:formId/questions/:questionId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const questionId = parseInt(req.params.questionId);
      await storage.deleteFormQuestion(questionId);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Delete Question Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la suppression de la question" });
    }
  });

  app.post("/api/forms/:formId/questions/reorder", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const body = z.object({
        questionIds: z.array(z.number()),
      }).parse(req.body);
      await storage.reorderFormQuestions(formId, body.questionIds);
      const questions = await storage.getFormQuestions(formId);
      res.json(questions);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Reorder Questions Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la réorganisation des questions" });
    }
  });

  app.get("/api/forms/:formId/responses", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const responses = await storage.getFormResponses(formId);
      const allAnswers = await storage.getFormAllAnswers(formId);
      const responsesWithAnswers = responses.map(r => ({
        ...r,
        answers: allAnswers.filter(a => a.responseId === r.id),
      }));
      res.json(responsesWithAnswers);
    } catch (err: any) {
      console.error("Get Responses Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la récupération des réponses" });
    }
  });

  app.delete("/api/forms/:formId/responses/:responseId", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Non authentifié" });
      const formId = parseInt(req.params.formId);
      const form = await storage.getForm(formId);
      if (!form || form.userId !== userId) return res.status(404).json({ message: "Formulaire non trouvé" });
      const responseId = parseInt(req.params.responseId);
      await storage.deleteFormResponse(responseId);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Delete Response Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la suppression de la réponse" });
    }
  });

  app.get("/api/public/forms/:publicId", async (req, res) => {
    try {
      const form = await storage.getFormByPublicId(req.params.publicId);
      if (!form || form.status !== "published") return res.status(404).json({ message: "Formulaire non trouvé" });
      const questions = await storage.getFormQuestions(form.id);
      res.json({ id: form.id, title: form.title, description: form.description, publicId: form.publicId, questions });
    } catch (err: any) {
      console.error("Public Get Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la récupération du formulaire" });
    }
  });

  app.post("/api/public/forms/:publicId/submit", async (req, res) => {
    try {
      const form = await storage.getFormByPublicId(req.params.publicId);
      if (!form || form.status !== "published") return res.status(404).json({ message: "Formulaire non trouvé" });
      const body = z.object({
        answers: z.array(z.object({
          questionId: z.number(),
          value: z.any(),
        })),
        metadata: z.any().optional(),
      }).parse(req.body);
      const questions = await storage.getFormQuestions(form.id);
      const questionIds = new Set(questions.map(q => q.id));
      for (const answer of body.answers) {
        if (!questionIds.has(answer.questionId)) {
          return res.status(400).json({ message: `Question invalide: ${answer.questionId}` });
        }
      }
      const requiredQuestions = questions.filter(q => q.required);
      for (const rq of requiredQuestions) {
        const answer = body.answers.find(a => a.questionId === rq.id);
        if (!answer || answer.value === null || answer.value === undefined || answer.value === "") {
          return res.status(400).json({ message: `La question "${rq.label}" est obligatoire` });
        }
      }
      const questionMap = new Map(questions.map(q => [q.id, q]));
      for (const answer of body.answers) {
        const q = questionMap.get(answer.questionId);
        if (!q) continue;
        const val = answer.value;
        if (val === null || val === undefined || val === "") continue;
        if (q.type === "email" && typeof val === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            return res.status(400).json({ message: `La question "${q.label}" doit contenir un email valide` });
          }
        }
        if (q.type === "number") {
          if (isNaN(Number(val))) {
            return res.status(400).json({ message: `La question "${q.label}" doit contenir un nombre valide` });
          }
          answer.value = Number(val);
        }
        if (q.type === "yes_no" && typeof val === "string") {
          if (!["oui", "non", "yes", "no"].includes(val.toLowerCase())) {
            return res.status(400).json({ message: `La question "${q.label}" doit être Oui ou Non` });
          }
        }
        if ((q.type === "mcq" || q.type === "likert") && typeof val === "string") {
          const options = (q.options as string[]) || [];
          if (options.length > 0 && !options.includes(val)) {
            return res.status(400).json({ message: `Réponse invalide pour "${q.label}"` });
          }
        }
        if (q.type === "mcq_multiple" && Array.isArray(val)) {
          const options = (q.options as string[]) || [];
          if (options.length > 0) {
            for (const v of val) {
              if (!options.includes(v)) {
                return res.status(400).json({ message: `Réponse invalide pour "${q.label}"` });
              }
            }
          }
        }
      }
      const response = await storage.createFormResponse(
        { formId: form.id, respondentId: null, metadata: body.metadata || null },
        body.answers.map(a => ({ responseId: 0, questionId: a.questionId, value: a.value }))
      );
      res.status(201).json(response);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Données invalides", errors: err.errors });
      console.error("Public Submit Form Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la soumission du formulaire" });
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /projects
Disallow: /settings
Disallow: /billing
Disallow: /admin
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://academik.fr/sitemap.xml
`);
  });

  app.get("/sitemap.xml", (_req, res) => {
    const now = new Date().toISOString().split("T")[0];
    const blogSlugs = [
      "comment-rediger-problematique-memoire",
      "structurer-plan-memoire",
      "cadre-theorique-conceptuel-memoire",
      "revue-litterature-methode",
      "methodologie-memoire-guide",
      "tfe-infirmier-guide-complet",
    ];
    const blogUrls = blogSlugs.map(slug => `  <url>
    <loc>https://academik.fr/blog/${slug}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/blog/${slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/blog/${slug}" />
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

    const projectTypeSlugs = ["memoire", "tfe-infirmier", "these-doctorat", "vae", "rapport-de-stage", "etude-de-cas", "memoire-professionnel"];
    const coreFeatureSlugs = ["problematique", "plan-de-travail", "cadre-theorique-conceptuel", "revue-de-litterature", "methodologie-recherche", "redaction-assistee", "export-word-pdf"];
    const optionalModuleSlugs = [
      "questionnaire-recherche", "guide-entretien", "depouillement-questionnaire",
      "analyse-qualitative", "analyse-quantitative", "confrontation-resultats",
      "validation-hypotheses", "formulaire-en-ligne", "simulation-financiere",
      "powerpoint-soutenance", "simulation-soutenance", "audit-memoire",
      "bibliographie-multi-normes", "analyse-articles-scientifiques", "simulation-entretien",
      "page-remerciements", "resume-abstract", "page-de-couverture",
    ];

    const makeModuleUrl = (slug: string, priority: string) => `  <url>
    <loc>https://academik.fr/fonctionnalites/${slug}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/fonctionnalites/${slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/fonctionnalites/${slug}" />
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;

    const moduleUrls = [
      ...projectTypeSlugs.map(s => makeModuleUrl(s, "0.9")),
      ...coreFeatureSlugs.map(s => makeModuleUrl(s, "0.8")),
      ...optionalModuleSlugs.map(s => makeModuleUrl(s, "0.7")),
    ].join("\n");

    const legalSlugs = ["cgv", "cgu", "politique-de-confidentialite"];
    const legalUrls = legalSlugs.map(slug => `  <url>
    <loc>https://academik.fr/legal/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`).join("\n");

    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://academik.fr</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr" />
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://academik.fr" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://academik.fr/fonctionnalites</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/fonctionnalites" />
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/fonctionnalites" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${moduleUrls}
  <url>
    <loc>https://academik.fr/blog</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/blog" />
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/blog" />
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${blogUrls}
${legalUrls}
</urlset>
`);
  });

  app.get("/llms.txt", (_req, res) => {
    res.type("text/plain").send(`# Academik
> Logiciel de méthodologie académique connecté aux principales plateformes universitaires

## À propos
Academik (https://academik.fr) est un logiciel de méthodologie qui accompagne les étudiants et professionnels dans la structuration, l'analyse et la rédaction de leurs travaux académiques.

## Types de travaux supportés
- Mémoire (Master, Licence)
- TFE Infirmier (Travail de Fin d'Études)
- Thèse de doctorat
- VAE (Validation des Acquis de l'Expérience)
- Rapport de Stage

## Fonctionnalités principales
- Génération de contenu section par section avec mémoire contextuelle
- Cadre théorique et conceptuel assisté
- Revue de littérature automatisée
- Plan de travail dynamique
- Construction de problématique et hypothèses
- Analyse qualitative et quantitative
- Simulation d'entretien
- Export Word et PDF
- Historique des versions pour chaque section
- Régénération contrôlée (mode similaire ou différent)

## Tarification
- Pack fondamental : 179 € (fondements, plan, cadres, revue, méthodologie)
- Options à la carte : collecte, analyse, soutenance, audit
- Packs économiques disponibles

## Langues
- Français (langue principale)
- Anglais

## Entreprise
Performance Consulting Groupe SAS
SIREN : 913 540 944
RCS Perpignan
3 Avenue de Toulouse, 66140 Canet-en-Roussillon, France

## Contact
Site web : https://academik.fr
`);
  });

  app.get("/.well-known/ai-plugin.json", (_req, res) => {
    res.json({
      schema_version: "v1",
      name_for_human: "Academik",
      name_for_model: "academik",
      description_for_human: "Logiciel de rédaction académique pour mémoire, TFE, thèse, VAE et rapport de stage.",
      description_for_model: "Academik is an academic writing software that helps students and professionals structure, analyze, and write academic papers including dissertations, nursing theses (TFE), doctoral theses, VAE (prior learning assessment), and internship reports. It provides section-by-section content generation with contextual memory, version history, and controlled regeneration. Connected to academic platforms like Google Scholar, PubMed, HAL. Available in French and English.",
      auth: { type: "none" },
      api: { type: "openapi", url: "https://academik.fr" },
      logo_url: "https://academik.fr/images/logo-512.png",
      contact_email: "contact@academik.fr",
      legal_info_url: "https://academik.fr"
    });
  });

  setupSEOPrerender(app);

  return httpServer;
}
