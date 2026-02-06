import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { SECTION_LABELS } from "@shared/schema";
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
        return `=== TÂCHE: SUJET + PROBLÉMATIQUE ===
Génère:
1. **Sujet académique** : précis, original et réalisable
2. **Problématique** : question de recherche problématisée avec tensions conceptuelles
3. **Question de recherche** : formulée de façon ouverte
Structure ta réponse avec des titres Markdown clairs.`;
      } else if (projectType === "rapport_stage") {
        return `=== TÂCHE: SUJET PROFESSIONNEL ===
En te basant sur le contexte du stage:
1. **Sujet professionnel** : ancré dans la réalité du stage
2. **Problématique** : question professionnelle problématisée
3. **Axes d'analyse** : 3 axes structurants pour le rapport`;
      }
      return `=== TÂCHE: DÉFINITION DU SUJET ===\nGénère un sujet pertinent et une problématique cohérente pour ce travail académique.`;

    case "problematic":
      if (projectType === "tfe") {
        return `=== TÂCHE: QUESTIONNEMENT STRUCTURÉ ===
En te basant sur la situation d'appel et les éléments validés:
1. **Questionnement structuré** : questionnement professionnel progressif
2. **Question de départ** : claire et professionnelle
3. **Sujet du TFE** : déduit de la situation d'appel`;
      }
      return `=== TÂCHE: PROBLÉMATIQUE ===\nGénère une problématique de recherche problématisée, mettant en tension des concepts clés du domaine.`;

    case "hypotheses":
      if (projectType === "tfe") {
        return `=== TÂCHE: HYPOTHÈSES OPÉRATIONNELLES ===
Propose 3 hypothèses opérationnelles:
- Formulées comme des leviers d'amélioration (PAS des hypothèses statistiques)
- Orientées vers la pratique professionnelle
- Testables sur le terrain
Pour chaque hypothèse: énoncé, justification, piste de vérification.`;
      }
      return `=== TÂCHE: HYPOTHÈSES DE RECHERCHE ===
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
En lien direct avec la problématique et les hypothèses:
1. **Identification de 2 à 4 concepts clés** en lien avec le sujet
2. Pour chaque concept:
   - Définition synthétique et académique
   - Lien avec la problématique
   - Auteurs de référence
3. **Articulation des concepts** : comment ils interagissent dans cette recherche
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
Définis une méthodologie cohérente et justifiée:
1. **Type de recherche** : qualitative, quantitative, mixte ou analyse documentaire
2. **Justification** :
   - Lien avec la problématique
   - Lien avec chaque hypothèse
   - Avantages de cette approche
   - Limites et contraintes terrain
3. **Population et échantillon** : qui, combien, critères de sélection
4. **Outils de collecte** : entretiens, questionnaires, observation, analyse documentaire
5. **Méthode d'analyse** : comment les données seront traitées
6. **Considérations éthiques** : si applicable`;

    default:
      return `=== TÂCHE: GÉNÉRATION DE CONTENU ===\nGénère le contenu approprié pour la section "${sectionKey}".`;
  }
}

function getPlanTask(projectType: string): string {
  const plans: Record<string, string> = {
    memoire: `=== TÂCHE: PLAN DU MÉMOIRE ===
Génère un plan cohérent et structuré comprenant:
1. **Introduction**
2. **Cadre conceptuel** (concepts clés)
3. **Cadre théorique** (fondements théoriques)
4. **Revue de littérature**
5. **Méthodologie** (approche, outils, population)
6. **Analyse et discussion des résultats**
7. **Conclusion**
8. **Bibliographie**
9. **Annexes**
Pour chaque partie: sous-parties détaillées avec brève description du contenu attendu.`,

    tfe: `=== TÂCHE: PLAN DU TFE ===
Génère un plan conforme aux exigences du TFE santé/social:
1. **Introduction**
2. **Situation d'appel**
3. **Questionnement / Question de départ**
4. **Cadre conceptuel**
5. **Cadre théorique**
6. **Méthodologie**
7. **Analyse des résultats**
8. **Recommandations professionnelles**
9. **Conclusion**
10. **Bibliographie**
11. **Annexes**
Pour chaque partie: sous-parties détaillées.`,

    rapport_stage: `=== TÂCHE: PLAN DU RAPPORT DE STAGE ===
Génère un plan professionnel:
1. **Introduction**
2. **Présentation de la structure d'accueil**
3. **Présentation des missions**
4. **Problématique professionnelle**
5. **Analyse des pratiques**
6. **Apports et limites du stage**
7. **Conclusion**
8. **Bibliographie**
9. **Annexes**
Pour chaque partie: sous-parties détaillées.`,

    vae: `=== TÂCHE: PLAN DU DOSSIER VAE ===
Génère un plan structuré pour le dossier VAE:
1. **Introduction**
2. **Présentation de la personne**
3. **Parcours professionnel**
4. **Motivation de la démarche VAE**
5. **Blocs de compétences** (détaillés selon le référentiel)
6. **Situations professionnelles** (une par bloc minimum)
7. **Conclusion**
8. **Bibliographie** (si exigée)
9. **Annexes** (preuves)
Pour chaque partie: sous-parties et éléments attendus.`,
  };
  return plans[projectType] || plans.memoire;
}

function getUserId(req: any): string | undefined {
  return req.user?.claims?.sub;
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

  app.post(api.sections.saveManual.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sectionId = Number(req.params.id);
    const { content } = api.sections.saveManual.input.parse(req.body);
    const version = await storage.createVersion(sectionId, content, "manual");
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
