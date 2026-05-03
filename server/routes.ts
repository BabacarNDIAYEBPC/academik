import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import OpenAI from "openai";
import multer from "multer";
import { CREDIT_COSTS, CREDIT_PACKS } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function getUserId(req: any): string {
  return req.user?.claims?.sub || "";
}

async function getOpenAI(): Promise<OpenAI> {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // HTTPS redirect in production
  app.use((req, res, next) => {
    const proto = req.headers["x-forwarded-proto"];
    const host = req.headers["host"];
    if (proto === "http" && host) {
      return res.redirect(301, `https://${host}${req.url}`);
    }
    next();
  });

  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);

  // === CREDITS ===
  app.get("/api/credits", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const credits = await storage.getCredits(userId);
    res.json({ credits });
  });

  app.get("/api/credits/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const transactions = await storage.getCreditTransactions(userId);
    res.json(transactions);
  });

  // === STRIPE CHECKOUT ===
  app.post("/api/checkout", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const { packId } = req.body;
    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return res.status(400).json({ message: "Pack invalide" });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ message: "Stripe non configuré" });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const userId = getUserId(req);
    const host = req.headers["host"] || "localhost:5000";
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Pack ${pack.label} — ${pack.credits} crédits`,
            description: `${pack.credits} crédits pour Refbib`,
          },
          unit_amount: Math.round(pack.price * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${baseUrl}/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing?payment=cancelled`,
      metadata: { userId, packId, credits: String(pack.credits) },
    });

    res.json({ url: session.url });
  });

  app.post("/api/checkout/confirm", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID manquant" });

    const existing = await storage.getInvoiceBySession(sessionId);
    if (existing) return res.json({ success: true, credits: existing.credits });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ message: "Stripe non configuré" });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return res.status(400).json({ message: "Paiement non complété" });

    const userId = session.metadata?.userId;
    const credits = parseInt(session.metadata?.credits || "0");
    const amount = (session.amount_total || 0) / 100;
    const packId = session.metadata?.packId;

    if (!userId || !credits) return res.status(400).json({ message: "Métadonnées invalides" });

    await storage.addCredits(userId, credits, "purchase", `Achat pack ${packId}`, sessionId);
    await storage.createInvoice({ userId, stripeSessionId: sessionId, amount, credits, status: "paid" });

    res.json({ success: true, credits });
  });

  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const inv = await storage.getInvoices(userId);
    res.json(inv);
  });

  // === BIBLIOGRAPHIES ===
  app.get("/api/bibliographies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const items = await storage.getBibliographies(userId);
    res.json(items);
  });

  app.get("/api/bibliographies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getBibliography(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Non trouvé" });
    if (item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    res.json(item);
  });

  app.post("/api/bibliographies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const item = await storage.createBibliography({ ...req.body, userId });
    res.json(item);
  });

  app.patch("/api/bibliographies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getBibliography(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    const updated = await storage.updateBibliography(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/bibliographies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getBibliography(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    await storage.deleteBibliography(Number(req.params.id));
    res.json({ success: true });
  });

  // === SEARCH ARTICLES (AI) ===
  app.post("/api/search-articles", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const { query, domain, norm = "APA" } = req.body;
    if (!query) return res.status(400).json({ message: "Requête manquante" });

    const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, `Recherche: ${query}`);
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });

    const openai = await getOpenAI();
    const prompt = `Tu es un assistant de recherche académique expert en bibliographie. 
Trouve 8 à 10 articles scientifiques pertinents pour la requête suivante: "${query}"${domain ? ` dans le domaine: ${domain}` : ""}.

Pour chaque article, fournis:
1. Titre complet
2. Auteur(s) - Nom, Prénom
3. Année de publication
4. Revue/Source
5. DOI ou URL si disponible
6. Résumé court (2-3 phrases)
7. Citation au format ${norm}

Réponds en JSON avec ce format exact:
{
  "articles": [
    {
      "title": "...",
      "authors": "...",
      "year": "...",
      "source": "...",
      "doi": "...",
      "abstract": "...",
      "citation": "..."
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    res.json(result);
  });

  // === GENERATE BIBLIOGRAPHY (AI) ===
  app.post("/api/generate-bibliography", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const { sources, norm = "APA", bibliographyId } = req.body;
    if (!sources || !sources.length) return res.status(400).json({ message: "Sources manquantes" });

    const spent = await storage.spendCredits(userId, CREDIT_COSTS.GENERATE_BIBLIOGRAPHY, "Génération bibliographie");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });

    const openai = await getOpenAI();
    const sourcesText = sources.map((s: any, i: number) => `${i + 1}. ${s.title} - ${s.authors} (${s.year})`).join("\n");
    const prompt = `Génère une bibliographie complète et formatée au format ${norm} pour les sources suivantes. Classe-les par ordre alphabétique du premier auteur. Sois précis dans le formatage APA 7.

Sources:
${sourcesText}

Réponds avec le texte de la bibliographie formatée.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content || "";

    if (bibliographyId) {
      await storage.updateBibliography(bibliographyId, { content, sources, norm });
    }

    res.json({ content });
  });

  // === READING CARDS ===
  app.get("/api/reading-cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const items = await storage.getReadingCards(userId);
    res.json(items);
  });

  app.get("/api/reading-cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getReadingCard(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Non trouvé" });
    if (item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    res.json(item);
  });

  app.post("/api/reading-cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const item = await storage.createReadingCard({ ...req.body, userId });
    res.json(item);
  });

  app.patch("/api/reading-cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getReadingCard(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    const updated = await storage.updateReadingCard(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/reading-cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getReadingCard(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    await storage.deleteReadingCard(Number(req.params.id));
    res.json({ success: true });
  });

  // === GENERATE READING CARD FROM PDF (AI) ===
  app.post("/api/reading-cards/generate", upload.single("pdf"), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const norm = req.body.norm || "APA";

    const spent = await storage.spendCredits(userId, CREDIT_COSTS.GENERATE_READING_CARD, "Génération fiche de lecture");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });

    let pdfText = req.body.text || "";

    if (req.file) {
      try {
        const pdfMod = await import("pdf-parse");
        const parseFn = (pdfMod as any).default || pdfMod;
        const data = await parseFn(req.file.buffer);
        pdfText = data.text?.slice(0, 12000) || "";
      } catch (e) {
        pdfText = req.body.text || "";
      }
    }

    if (!pdfText) return res.status(400).json({ message: "Aucun texte extrait du PDF" });

    const openai = await getOpenAI();
    const prompt = `Tu es un expert en méthodologie académique. Analyse ce texte scientifique et génère une fiche de lecture structurée au format ${norm}.

TEXTE:
${pdfText.slice(0, 8000)}

Génère une fiche de lecture complète en JSON avec ce format exact:
{
  "title": "Titre de l'article",
  "authors": "Auteur(s)",
  "year": "Année",
  "source": "Revue/Éditeur",
  "doi": "DOI si trouvé",
  "summary": "Résumé structuré en 3-4 paragraphes couvrant: problématique, méthodologie, résultats, conclusions",
  "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "mot-clé 4", "mot-clé 5"],
  "mainArgument": "Argument principal / thèse centrale de l'article",
  "methodology": "Description de la méthodologie utilisée",
  "keyQuotes": ["Citation importante 1", "Citation importante 2", "Citation importante 3"],
  "criticalAnalysis": "Analyse critique: points forts, limites, contribution au domaine",
  "apaCitation": "Référence complète au format ${norm}"
}

Réponds uniquement en JSON, en français.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const card = JSON.parse(response.choices[0].message.content || "{}");
    res.json({ ...card, pdfText: pdfText.slice(0, 5000) });
  });

  // === SYNTHESES ===
  app.get("/api/syntheses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const items = await storage.getSyntheses(userId);
    res.json(items);
  });

  app.get("/api/syntheses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getSynthesis(Number(req.params.id));
    if (!item) return res.status(404).json({ message: "Non trouvé" });
    if (item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    res.json(item);
  });

  app.post("/api/syntheses", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const item = await storage.createSynthesis({ ...req.body, userId });
    res.json(item);
  });

  app.patch("/api/syntheses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getSynthesis(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    const updated = await storage.updateSynthesis(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/syntheses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const item = await storage.getSynthesis(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    await storage.deleteSynthesis(Number(req.params.id));
    res.json({ success: true });
  });

  // === GENERATE SYNTHESIS (AI) ===
  app.post("/api/generate-synthesis", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = getUserId(req);
    const { cardIds, theme, title } = req.body;
    if (!cardIds || cardIds.length < 2) return res.status(400).json({ message: "Au moins 2 fiches requises" });

    const spent = await storage.spendCredits(userId, CREDIT_COSTS.GENERATE_SYNTHESIS, "Génération synthèse");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });

    const cards = await Promise.all(cardIds.map((id: number) => storage.getReadingCard(id)));
    const validCards = cards.filter(Boolean);

    const cardsContent = validCards.map((c, i) => `
--- Article ${i + 1}: ${c!.title} ---
Auteurs: ${c!.authors || "N/A"}
Année: ${c!.year || "N/A"}
Argument principal: ${c!.mainArgument || "N/A"}
Résumé: ${c!.summary || "N/A"}
Méthodologie: ${c!.methodology || "N/A"}
Analyse critique: ${c!.criticalAnalysis || "N/A"}
Citation APA: ${c!.apaCitation || "N/A"}
`).join("\n");

    const openai = await getOpenAI();
    const prompt = `Tu es un expert en rédaction académique. À partir des fiches de lecture suivantes, génère une synthèse littéraire structurée et cohérente.

${theme ? `Thème/Question directrice: ${theme}` : ""}

FICHES DE LECTURE:
${cardsContent}

Rédige une synthèse académique complète qui:
1. Introduction: Présente le sujet, les enjeux et la question directrice
2. Convergences: Identifie les points de consensus entre les auteurs
3. Divergences et débats: Met en évidence les désaccords et tensions théoriques
4. Analyse thématique: Organise les apports par thèmes transversaux
5. Bilan critique: Évalue l'état des connaissances et les lacunes
6. Conclusion: Synthèse des apports et perspectives

La synthèse doit être rédigée en français académique, citer les auteurs (Nom, année) et faire des liens entre les travaux. Longueur: 800-1200 mots.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const content = response.choices[0].message.content || "";
    res.json({ content });
  });

  return httpServer;
}
