import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { SECTION_LABELS, SECTION_STATUSES } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";

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
  data_ia: "Data / Intelligence artificielle",
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
      if (projectType === "memoire") {
        return `=== TÂCHE: SUJET UNIQUEMENT ===
IMPORTANT: Génère UNIQUEMENT le sujet académique. Ne génère PAS la problématique ni les hypothèses.

Génère un sujet académique:
- Précis, original et réalisable
- Ancré dans le domaine et la formation de l'étudiant
- Formulé comme un titre de mémoire académique

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
      return `=== TÂCHE: ANALYSE DE LA SITUATION D'APPEL ===
À partir de la situation d'appel:
1. **Reformulation** : reformule de manière structurée et professionnelle
2. **Enjeux professionnels** : pour le patient, le professionnel, l'institution
3. **Concepts clés** : concepts professionnels et théoriques en jeu
4. **Problème central** : synthèse du problème principal`;

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

    default:
      return `=== TÂCHE: GÉNÉRATION DE CONTENU ===\nGénère le contenu approprié pour la section "${sectionKey}".`;
  }
}

function getPlanTask(projectType: string): string {
  const common = `

RÈGLES DE FORMATAGE OBLIGATOIRES:
- Utilise UNIQUEMENT la numérotation académique classique: I., II., III. pour les parties principales, puis 1., 2., 3. pour les sous-parties, puis 1.1., 1.2. pour les sous-sous-parties.
- NE JAMAIS utiliser de symboles Markdown (pas de **, ##, *, -, backticks).
- NE JAMAIS utiliser de balises HTML, d'émojis, de symboles techniques ou de caractères spéciaux.
- Texte propre et lisible, prêt à être copié directement dans un document Word.
- Les titres des chapitres et sous-parties doivent être contextualisés et refléter le sujet spécifique du travail.
- Chaque titre doit intégrer les termes clés du sujet, de la problématique ou des hypothèses validées.
- Pour chaque partie et sous-partie: description brève du contenu attendu (2-3 phrases) en retrait.
- Le plan doit montrer la progression logique de la réflexion.

EXEMPLE DE FORMAT ATTENDU:
I. Introduction
   Accroche et mise en contexte du sujet. Présentation de la problématique et annonce du plan.

II. [Titre contextualisé de la première partie]
   1. [Sous-titre contextualisé]
      Description du contenu attendu.
   2. [Sous-titre contextualisé]
      Description du contenu attendu.`;

  const plans: Record<string, string> = {
    memoire: `=== TÂCHE: PLAN DU MÉMOIRE ===
Génère un plan cohérent et structuré en utilisant des TITRES CONTEXTUALISÉS liés au sujet. Le plan doit contenir les parties suivantes (à contextualiser):
I. Introduction (accroche, contexte, annonce du plan)
II. Cadre conceptuel — titre à contextualiser selon les concepts clés identifiés
III. Cadre théorique — titre à contextualiser selon les courants théoriques mobilisés
IV. Revue de littérature — titre à contextualiser selon les thématiques
V. Méthodologie — préciser le type (quali/quanti/mixte) dans le titre
VI. Analyse et discussion des résultats — lier au sujet
VII. Conclusion et perspectives
VIII. Bibliographie
IX. Annexes${common}`,

    tfe: `=== TÂCHE: PLAN DU TFE ===
Génère un plan conforme aux exigences du TFE santé/social avec des TITRES CONTEXTUALISÉS. Le plan doit contenir les parties suivantes (à contextualiser):
I. Introduction (contexte professionnel, motivation)
II. Situation d'appel — contextualiser selon la situation clinique/professionnelle
III. Questionnement / Question de départ — formuler en lien avec la situation
IV. Cadre conceptuel — titre reflétant les concepts professionnels
V. Cadre théorique — titre lié aux modèles de soins/intervention
VI. Méthodologie — préciser l'approche dans le titre
VII. Analyse des résultats — lier aux hypothèses opérationnelles
VIII. Recommandations professionnelles — contextualiser selon le terrain
IX. Conclusion
X. Bibliographie
XI. Annexes${common}`,

    rapport_stage: `=== TÂCHE: PLAN DU RAPPORT DE STAGE ===
Génère un plan professionnel avec des TITRES CONTEXTUALISÉS liés au stage. Le plan doit contenir les parties suivantes (à contextualiser):
I. Introduction (contexte, objectifs du stage)
II. Présentation de la structure d'accueil — nommer le type de structure
III. Présentation des missions — contextualiser selon les missions réelles
IV. Problématique professionnelle — titre reflétant la question posée
V. Analyse des pratiques — lier aux missions et observations
VI. Apports et limites — relier au développement professionnel
VII. Conclusion et perspectives
VIII. Bibliographie
IX. Annexes${common}`,

    vae: `=== TÂCHE: PLAN DU DOSSIER VAE ===
Génère un plan structuré pour le dossier VAE avec des TITRES CONTEXTUALISÉS. Le plan doit contenir les parties suivantes (à contextualiser):
I. Introduction (projet professionnel, motivation)
II. Présentation du candidat — parcours et positionnement
III. Parcours professionnel — chronologie et évolution
IV. Motivation de la démarche VAE — projet et diplôme visé
V. Blocs de compétences — TITRES SPÉCIFIQUES selon le référentiel du diplôme
VI. Situations professionnelles — titres contextualisés par bloc
VII. Conclusion et projection professionnelle
VIII. Bibliographie (si exigée)
IX. Annexes (preuves)${common}`,
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
      const generation = await storage.createAiGeneration(projectId, type, { content });
      res.json(generation);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: err.message || "Erreur lors de la génération IA" });
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
      const contextSnapshot = projectContext.substring(0, 500) + (validatedContext ? "\n..." + validatedContext.substring(0, 500) : "");
      const version = await storage.createVersion(section.id, content, "ai", mode, contextSnapshot);

      await storage.updateSectionStatus(section.id, "generated");
      const updatedSection = await storage.getSection(section.id);
      res.json({ section: updatedSection, version });

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

  app.post(api.sections.generateDiagram.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { projectId, diagramType, articles, extraContext } = api.sections.generateDiagram.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const documents = await storage.getDocuments(projectId);
      const projectContext = buildProjectContext(project, profile, documents);
      const validatedContext = await storage.getValidatedSectionsContext(projectId);

      const diagramPrompts: Record<string, { title: string; task: string }> = {
        concept_relations: {
          title: "Relations entre concepts",
          task: `À partir du cadre conceptuel validé, génère un diagramme Mermaid montrant les relations entre les concepts identifiés.
Utilise un diagramme de type 'graph TD' (top-down).
- Chaque concept est un noeud
- Les relations entre concepts sont des flèches avec des labels descriptifs
- Utilise des formes différentes pour les concepts principaux vs secondaires`,
        },
        concept_problematic: {
          title: "Articulation Concepts - Problématique - Hypothèses",
          task: `Génère un diagramme Mermaid montrant l'articulation entre:
- La problématique (au centre)
- Les concepts clés (liés à la problématique)
- Les hypothèses (découlant des concepts et de la problématique)
Utilise un diagramme 'graph LR' (left-right) avec des couleurs et formes distinctes.`,
        },
        article_synthesis: {
          title: "Synthèse des articles",
          task: `À partir des articles fournis, génère un diagramme Mermaid de synthèse montrant:
- Les thématiques principales abordées
- Les liens entre articles par thématique
- Les résultats convergents et divergents
Utilise un diagramme 'graph TD'.`,
        },
        article_confrontation: {
          title: "Confrontation des articles",
          task: `À partir des articles fournis, génère un diagramme Mermaid de confrontation montrant:
- Les points d'accord entre auteurs
- Les points de désaccord ou divergence
- Les complémentarités
Utilise un diagramme 'graph LR' avec des couleurs distinctes pour accord/désaccord.`,
        },
        article_mapping: {
          title: "Cartographie des articles",
          task: `À partir des articles fournis, génère un diagramme Mermaid de type 'mindmap' ou 'graph TD' montrant:
- Les axes thématiques principaux
- La répartition des articles par axe
- Les interconnexions entre thèmes
Chaque article est un noeud avec auteur et année.`,
        },
      };

      const config = diagramPrompts[diagramType];
      let userPrompt = projectContext + "\n";
      if (validatedContext) userPrompt += `\n=== SECTIONS VALIDÉES ===\n${validatedContext}\n`;
      if (articles && articles.length > 0) {
        userPrompt += `\n=== ARTICLES ===\n${articles.map(a => `- ${a.authors} (${a.year}). ${a.title}`).join("\n")}\n`;
      }
      if (extraContext) userPrompt += `\n=== CONTEXTE ADDITIONNEL ===\n${extraContext}\n`;
      userPrompt += `\n${config.task}\n\nIMPORTANT: Retourne UNIQUEMENT le code Mermaid valide, sans commentaire ni explication. Ne mets PAS de blocs \`\`\`mermaid, retourne directement le code Mermaid.`;

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Tu es un expert en visualisation de données académiques. Tu génères du code Mermaid.js valide et bien structuré." },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });

      let mermaidCode = response.choices[0].message.content || "";
      mermaidCode = mermaidCode.replace(/```mermaid\n?/g, "").replace(/```\n?/g, "").trim();

      res.json({ mermaidCode, title: config.title });
    } catch (err: any) {
      console.error("Diagram Generation Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du diagramme" });
    }
  });

  app.post(api.sections.saveManual.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const { content } = api.sections.saveManual.input.parse(req.body);
    const version = await storage.createVersion(sectionId, content, "manual");
    await storage.updateSectionStatus(sectionId, "modified");
    res.json(version);
  });

  app.post(api.sections.validate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
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
      res.json({ content });
    } catch (err: any) {
      console.error("Bibliography Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération de la bibliographie" });
    }
  });

  // === DIAGRAM GENERATION ===
  app.post(api.sections.generateDiagram.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { projectId, diagramType, articles, extraContext } = api.sections.generateDiagram.input.parse(req.body);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) return res.status(401).json({ message: "Unauthorized" });

      const profile = await storage.getProfile(userId);
      const sections = await storage.getProjectSections(projectId);
      const validatedContent: string[] = [];
      for (const s of sections) {
        if (s.status === "validated" && s.activeVersionId) {
          const versions = await storage.getSectionVersions(s.id);
          const active = versions.find(v => v.id === s.activeVersionId);
          if (active?.content) {
            const label = (SECTION_LABELS as any)[s.sectionKey] || s.sectionKey;
            validatedContent.push(`${label}:\n${active.content}`);
          }
        }
      }

      const contextBlock = validatedContent.length > 0
        ? `\nContenu validé du projet:\n${validatedContent.join("\n\n")}\n`
        : "";

      const articleBlock = articles && articles.length > 0
        ? `\nArticles de référence:\n${articles.map((a, i) => `${i + 1}. ${a.title} — ${a.authors} (${a.year})`).join("\n")}\n`
        : "";

      const diagramPrompts: Record<string, { title: string; prompt: string }> = {
        concept_relations: {
          title: "Relations entre les concepts clés",
          prompt: `Génère un diagramme Mermaid (flowchart LR) montrant les relations entre les concepts clés du cadre conceptuel de ce projet académique.
${contextBlock}
Projet: ${project.subject || ""} — ${project.problematic || ""}

RÈGLES STRICTES pour le code Mermaid:
- Utilise flowchart LR (orientation gauche-droite)
- Chaque nœud doit avoir un identifiant simple (A, B, C...) suivi d'un label entre crochets
- Les labels doivent être courts (3-5 mots maximum)
- Utilise des flèches avec labels: A -->|relation| B
- Maximum 8 nœuds et 12 liens
- NE PAS utiliser de caractères spéciaux dans les labels (pas d'accents, pas d'apostrophes, pas de guillemets)
- NE PAS utiliser subgraph
- Retourne UNIQUEMENT le code Mermaid, sans backticks, sans explication`,
        },
        concept_problematic: {
          title: "Articulation Concepts - Problématique - Hypothèses",
          prompt: `Génère un diagramme Mermaid (flowchart TD) montrant l'articulation entre les concepts du cadre conceptuel, la problématique et les hypothèses de ce projet académique.
${contextBlock}
Projet: ${project.subject || ""} — ${project.problematic || ""}
Hypothèses: ${project.hypotheses || ""}

RÈGLES STRICTES pour le code Mermaid:
- Utilise flowchart TD (orientation haut-bas)
- Place la problématique en haut, les concepts au milieu, les hypothèses en bas
- Chaque noeud doit avoir un identifiant simple (P, C1, C2, H1...) suivi d'un label entre crochets
- Les labels doivent être courts (3-5 mots maximum)
- Maximum 10 noeuds
- NE PAS utiliser de caracteres speciaux dans les labels (pas d accents, pas d apostrophes, pas de guillemets)
- NE PAS utiliser subgraph
- Retourne UNIQUEMENT le code Mermaid, sans backticks, sans explication`,
        },
        article_synthesis: {
          title: "Schema de synthese des articles",
          prompt: `Génère un diagramme Mermaid (flowchart TD) synthétisant les thèmes et résultats clés des articles de la revue de littérature.
${contextBlock}${articleBlock}

RÈGLES STRICTES pour le code Mermaid:
- Utilise flowchart TD
- Regroupe les articles par thème principal
- Chaque noeud doit avoir un identifiant simple (T1, T2, A1, A2...) suivi d'un label entre crochets
- Les labels doivent etre courts (3-5 mots maximum)
- Maximum 10 noeuds et 15 liens
- NE PAS utiliser de caracteres speciaux dans les labels (pas d accents, pas d apostrophes, pas de guillemets)
- NE PAS utiliser subgraph
- Retourne UNIQUEMENT le code Mermaid, sans backticks, sans explication`,
        },
        article_confrontation: {
          title: "Schema de confrontation des articles",
          prompt: `Génère un diagramme Mermaid (flowchart LR) montrant les convergences et divergences entre les articles de la revue de littérature.
${contextBlock}${articleBlock}

RÈGLES STRICTES pour le code Mermaid:
- Utilise flowchart LR
- Montre les points de convergence et de divergence entre les articles
- Chaque noeud doit avoir un identifiant simple (A1, A2, Conv1, Div1...) suivi d'un label entre crochets
- Les labels doivent etre courts (3-5 mots maximum)
- Utilise des styles de fleches differents: --> pour convergence, -.-> pour divergence
- Maximum 10 noeuds et 12 liens
- NE PAS utiliser de caracteres speciaux dans les labels (pas d accents, pas d apostrophes, pas de guillemets)
- NE PAS utiliser subgraph
- Retourne UNIQUEMENT le code Mermaid, sans backticks, sans explication`,
        },
        article_mapping: {
          title: "Carte de mapping thematique",
          prompt: `Génère un diagramme Mermaid (mindmap) cartographiant les thèmes, sous-thèmes et auteurs de la revue de littérature.
${contextBlock}${articleBlock}

RÈGLES STRICTES pour le code Mermaid:
- Utilise la syntaxe mindmap
- Le noeud racine est le theme general de la recherche
- Les branches sont les sous-themes
- Les feuilles sont les auteurs ou references
- Les labels doivent etre courts (3-5 mots maximum)
- Maximum 3 niveaux de profondeur
- Maximum 15 noeuds total
- NE PAS utiliser de caracteres speciaux dans les labels (pas d accents, pas d apostrophes, pas de guillemets)
- Retourne UNIQUEMENT le code Mermaid, sans backticks, sans explication`,
        },
      };

      const diagramInfo = diagramPrompts[diagramType];
      if (!diagramInfo) return res.status(400).json({ message: "Type de diagramme inconnu" });

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: "Tu es un expert en visualisation académique. Tu génères du code Mermaid.js valide et syntaxiquement correct. Tu ne retournes QUE le code Mermaid, sans bloc de code markdown, sans explication." },
          { role: "user", content: diagramInfo.prompt + (extraContext ? `\n\nContexte additionnel: ${extraContext}` : "") },
        ],
        max_tokens: 2000,
        temperature: 0.5,
      });

      let mermaidCode = (response.choices[0].message.content || "").trim();
      mermaidCode = mermaidCode.replace(/^```(?:mermaid)?\n?/g, "").replace(/\n?```$/g, "").trim();

      res.json({ mermaidCode, title: diagramInfo.title });
    } catch (err: any) {
      console.error("Diagram Generation Error:", err);
      res.status(500).json({ message: err.message || "Erreur lors de la génération du diagramme" });
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

  return httpServer;
}
