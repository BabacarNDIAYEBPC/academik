import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
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
  const langInstruction = language === "English"
    ? "Respond entirely in English."
    : "Réponds entièrement en français.";

  const base = `Tu es un expert académique et méthodologique de haut niveau, spécialisé dans l'accompagnement des étudiants et professionnels dans la rédaction de travaux académiques. ${langInstruction}

RÈGLES IMPORTANTES:
- Adapte le niveau de complexité au diplôme visé
- Utilise un vocabulaire académique précis et approprié au domaine
- Respecte les normes académiques en vigueur
- Formule de manière claire et structurée
- Ne génère JAMAIS de contenu rédigé final, seulement des propositions structurées
- Retourne tes réponses en Markdown bien formaté avec des titres, sous-titres et listes`;

  return base;
}

function buildPromptForType(type: string, projectType: string, context: string, projectContext: string, extraContext?: string) {
  let prompt = projectContext + "\n";
  
  if (extraContext) {
    prompt += `\n=== INFORMATIONS SPÉCIFIQUES ===\n${extraContext}\n`;
  }
  if (context) {
    prompt += `\n=== REMARQUES DE L'UTILISATEUR ===\n${context}\n`;
  }

  switch (projectType) {
    case "memoire":
      if (type === "subject") {
        prompt += `\n=== TÂCHE: CAS A — MÉMOIRE ===
Génère les éléments suivants de manière cohérente et académique:

1. **Sujet académique** : Un sujet précis, original et réalisable dans le cadre du diplôme
2. **Problématique** : Une question de recherche problématisée, qui met en tension des concepts clés
3. **Question de recherche** : La question centrale, formulée de façon ouverte
4. **3 hypothèses de recherche** : 
   - Chaque hypothèse doit être vérifiable
   - Formulées comme des propositions à tester
   - Cohérentes avec la problématique
   - Adaptées au niveau académique du diplôme

Structure ta réponse avec des titres Markdown clairs.`;
      } else if (type === "hypotheses") {
        prompt += `\n=== TÂCHE: GÉNÉRATION D'HYPOTHÈSES ===
En te basant sur le contexte du projet et les éventuelles générations précédentes, propose:

1. **3 hypothèses de recherche** bien formulées
2. Pour chaque hypothèse:
   - Énoncé clair et vérifiable
   - Justification théorique brève
   - Piste méthodologique pour la vérifier

Les hypothèses doivent être cohérentes entre elles et avec le domaine d'étude.`;
      }
      break;

    case "tfe":
      if (type === "analysis") {
        prompt += `\n=== TÂCHE: CAS B — TFE — ANALYSE DE LA SITUATION D'APPEL ===
À partir de la situation d'appel décrite ci-dessus:

1. **Reformulation de la situation** : Reformule la situation de manière structurée et professionnelle
2. **Identification des enjeux professionnels** : 
   - Enjeux pour le patient/bénéficiaire
   - Enjeux pour le professionnel
   - Enjeux pour l'institution
3. **Concepts clés identifiés** : Liste les concepts professionnels et théoriques en jeu
4. **Problème central** : Synthétise le problème principal identifié

Attends la validation de l'utilisateur avant de passer à la génération du questionnement.`;
      } else if (type === "problematic") {
        prompt += `\n=== TÂCHE: CAS B — TFE — GÉNÉRATION DU QUESTIONNEMENT ===
En te basant sur la situation d'appel et l'analyse:

1. **Questionnement structuré** : Développe un questionnement professionnel progressif
2. **Question de départ** : Formule une question de départ claire et professionnelle
3. **Sujet du TFE** : Déduit de la situation d'appel
4. **3 hypothèses opérationnelles** :
   - Formulées comme des leviers d'amélioration (PAS des hypothèses statistiques)
   - Orientées vers la pratique professionnelle
   - Testables sur le terrain`;
      }
      break;

    case "vae":
      if (type === "vae_competencies") {
        prompt += `\n=== TÂCHE: CAS C — VAE — ANALYSE DES COMPÉTENCES ===
IMPORTANT: En VAE, il n'y a PAS de sujet académique, PAS de problématique de recherche, PAS d'hypothèses théoriques.

Analyse tous les documents fournis (CV, référentiel, attestations, etc.) et produis:

1. **Identification des blocs de compétences** (4, 6 ou 8 blocs selon le référentiel)
2. Pour CHAQUE bloc identifié:
   - **Intitulé du bloc**
   - **Activités professionnelles à valoriser** : Liste des activités pertinentes du parcours
   - **Situations professionnelles pertinentes** : Situations concrètes à développer dans le dossier
   - **Logique de démonstration** : Ce que le jury attend comme preuves et argumentation

NE PAS rédiger de texte final. Fournir uniquement la structure et les pistes.`;
      }
      break;

    case "rapport_stage":
      if (type === "subject") {
        prompt += `\n=== TÂCHE: CAS D — RAPPORT DE STAGE ===
En te basant sur le contexte du stage et les missions décrites:

1. **Sujet professionnel** : Un sujet ancré dans la réalité du stage
2. **Problématique** : Une question professionnelle problématisée
3. **Axes d'analyse** : 3 axes structurants pour le rapport
4. **3 hypothèses** (si pertinent selon le niveau du diplôme):
   - Orientées terrain
   - Liées aux missions effectuées`;
      } else if (type === "hypotheses") {
        prompt += `\n=== TÂCHE: AXES D'ANALYSE ET HYPOTHÈSES ===
Propose:

1. **3 axes d'analyse** pour structurer le rapport
2. **3 hypothèses** liées aux missions du stage
3. Pour chaque axe:
   - Questions à explorer
   - Méthodologie suggérée`;
      }
      break;
  }

  return prompt;
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

  // === AI GENERATION ===
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
      const userPrompt = buildPromptForType(type, project.type, context || "", projectContext);

      const openai = getOpenAIClient((profile as any)?.openaiApiKey);

      const response = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
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
