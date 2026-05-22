import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerAdminRoutes } from "./admin";
import OpenAI from "openai";
import { CREDIT_COSTS, CREDIT_PACKS } from "@shared/schema";

function getUserId(req: any): string {
  return String((req.session as any)?.userId || "");
}

function checkAuth(req: any, res: any): boolean {
  if (!(req.session as any)?.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

async function getOpenAI(): Promise<OpenAI> {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);
  registerAdminRoutes(app);

  // === GOOGLE SEARCH CONSOLE VERIFICATION ===
  app.get("/google8535e51db75ef260.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send("google-site-verification: google8535e51db75ef260.html");
  });

  // === SITEMAP ===
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://academik.fr/</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://academik.fr/bibliographie-apa</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-apa"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/apa-citation-generator"/>
  </url>
  <url>
    <loc>https://academik.fr/en/apa-citation-generator</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-apa"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/apa-citation-generator"/>
  </url>
  <url>
    <loc>https://academik.fr/revue-litterature</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/revue-litterature"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/literature-review"/>
  </url>
  <url>
    <loc>https://academik.fr/en/literature-review</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/revue-litterature"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/literature-review"/>
  </url>
  <url>
    <loc>https://academik.fr/bibliographie-vancouver</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-vancouver"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/vancouver-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/en/vancouver-citation</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-vancouver"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/vancouver-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/bibliographie-mla</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-mla"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/mla-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/en/mla-citation</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-mla"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/mla-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/bibliographie-chicago</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-chicago"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/chicago-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/en/chicago-citation</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/bibliographie-chicago"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/chicago-citation"/>
  </url>
  <url>
    <loc>https://academik.fr/memoire-these</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/memoire-these"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/dissertation-help"/>
  </url>
  <url>
    <loc>https://academik.fr/en/dissertation-help</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/memoire-these"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/dissertation-help"/>
  </url>
  <url>
    <loc>https://academik.fr/etudiant</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/etudiant"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/students"/>
  </url>
  <url>
    <loc>https://academik.fr/en/students</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/etudiant"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/students"/>
  </url>
  <url>
    <loc>https://academik.fr/chercheur</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/chercheur"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/researchers"/>
  </url>
  <url>
    <loc>https://academik.fr/en/researchers</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://academik.fr/chercheur"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://academik.fr/en/researchers"/>
  </url>
</urlset>`);
  });

  // === ROBOTS.TXT ===
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /revue
Disallow: /billing
Disallow: /dashboard
Disallow: /admin
Disallow: /api/

Sitemap: https://academik.fr/sitemap.xml`);
  });

  // === CREDITS ===
  app.get("/api/credits", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const credits = await storage.getCredits(getUserId(req));
    res.json({ credits });
  });

  app.get("/api/credits/transactions", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const transactions = await storage.getCreditTransactions(getUserId(req));
    res.json(transactions);
  });

  // === STRIPE CHECKOUT ===
  app.post("/api/checkout", async (req, res) => {
    if (!checkAuth(req, res)) return;
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
          product_data: { name: `Pack ${pack.label} — ${pack.credits} crédits`, description: `${pack.credits} crédits Refbib` },
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
    if (!checkAuth(req, res)) return;
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID manquant" });
    const existing = await storage.getInvoiceBySession(sessionId);
    if (existing) return res.json({ success: true, credits: existing.credits });
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ message: "Stripe non configuré" });
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status !== "paid") return res.status(400).json({ message: "Paiement non complété" });
    const userId = stripeSession.metadata?.userId;
    const credits = parseInt(stripeSession.metadata?.credits || "0");
    const amount = (stripeSession.amount_total || 0) / 100;
    const packId = stripeSession.metadata?.packId;
    if (!userId || !credits) return res.status(400).json({ message: "Métadonnées invalides" });
    await storage.addCredits(userId, credits, "purchase", `Achat pack ${packId}`, sessionId);
    await storage.createInvoice({ userId, stripeSessionId: sessionId, amount, credits, status: "paid" });
    res.json({ success: true, credits });
  });

  app.get("/api/invoices", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const inv = await storage.getInvoices(getUserId(req));
    res.json(inv);
  });

  // === LITERATURE REVIEW — SEARCH ARTICLES ===
  app.post("/api/literature/search", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { query, domain, platforms, language, periodStart, periodEnd, level, sourceTypes, articleCount } = req.body;
    if (!query && !domain) return res.status(400).json({ message: "Requête manquante" });
    const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, `Recherche: ${query || domain}`);
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    const openai = await getOpenAI();
    const platformList = (platforms || ["google_scholar", "pubmed", "hal", "cairn", "sciencedirect"]).join(", ");
    const sourceTypesList = (sourceTypes || ["scientific_articles"]).join(", ");
    const count = articleCount || 10;
    const prompt = `Tu es un assistant de recherche académique francophone. Génère une liste de ${count} références bibliographiques académiques pertinentes pour la recherche suivante.

Sujet/Requête: ${query || domain || ""}
${domain ? `Domaine: ${domain}` : ""}
Plateformes: ${platformList}
Langue: ${language === "fr" ? "Français" : language === "en" ? "Anglais" : "Français et Anglais"}
${periodStart ? `Période: ${periodStart} - ${periodEnd || new Date().getFullYear()}` : ""}
Niveau: ${level === "academic" ? "Académique (peer-reviewed)" : level === "professional" ? "Professionnel" : "Mixte"}
Types de sources: ${sourceTypesList}

Pour chaque référence, fournis:
- lastName: Nom de l'auteur principal
- firstName: Prénom
- title: Titre complet
- year: Année
- publisher: Revue/Éditeur
- platform: Plateforme (parmi: ${platformList})
- url: URL ou DOI
- type: Type (article, livre, rapport, etc.)

Réponds en JSON: { "articles": [ { "lastName": "", "firstName": "", "title": "", "year": "", "publisher": "", "platform": "", "url": "", "type": "" } ] }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    res.json(result);
  });

  // === LITERATURE REVIEW — ANALYZE ARTICLES ===
  app.post("/api/literature/analyze", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { articles, analysisType, query } = req.body;
    if (!articles || !articles.length) return res.status(400).json({ message: "Articles manquants" });
    const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, "Analyse articles");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    const openai = await getOpenAI();
    const articlesText = articles.map((a: any, i: number) =>
      `${i + 1}. ${a.title} — ${a.authors || `${a.lastName}, ${a.firstName}`} (${a.year}) — ${a.source || a.publisher || ""}`
    ).join("\n");
    let prompt = "";
    if (analysisType === "single") {
      prompt = `Fais une synthèse critique et structurée de cet article académique en français:\n${articlesText}\nInclus: résumé, problématique, méthodologie, résultats clés, apport au domaine, limites.`;
    } else if (analysisType === "confrontation") {
      prompt = `Compare et confronte ces articles académiques en français. Identifie convergences, divergences, débats théoriques:\n${articlesText}\nStructure: introduction, convergences, divergences, synthèse critique.`;
    } else if (analysisType === "mapping") {
      prompt = `Établis une cartographie thématique de ces articles en français. Identifie les grands axes thématiques, courants théoriques et auteurs clés:\n${articlesText}`;
    } else {
      prompt = `Génère une synthèse littéraire structurée en français de ces articles académiques${query ? ` sur le thème: "${query}"` : ""}:\n${articlesText}\nStructure: introduction, thèmes majeurs, convergences et débats, lacunes, conclusion.`;
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });
    res.json({ content: response.choices[0].message.content || "" });
  });

  // === LITERATURE REVIEW — BIBLIOGRAPHY ===
  app.post("/api/literature/bibliography", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { articles, norm = "apa7" } = req.body;
    if (!articles || !articles.length) return res.status(400).json({ message: "Articles manquants" });
    const spent = await storage.spendCredits(userId, CREDIT_COSTS.GENERATE_BIBLIOGRAPHY, "Génération bibliographie");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    const openai = await getOpenAI();
    const normLabels: Record<string, string> = { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };
    const normLabel = normLabels[norm] || "APA 7";
    const articlesText = articles.map((a: any, i: number) =>
      `${i + 1}. ${a.lastName || ""}, ${a.firstName || ""} (${a.year || ""}). ${a.title || ""}. ${a.publisher || a.source || ""}. ${a.url || ""}`
    ).join("\n");
    const prompt = `Génère une bibliographie académique complète et correctement formatée au format ${normLabel} pour les références suivantes. Classe par ordre alphabétique du premier auteur. Réponds uniquement avec le texte de la bibliographie formatée, sans introduction ni commentaire.\n\nRéférences:\n${articlesText}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    res.json({ content: response.choices[0].message.content || "" });
  });

  // === LITERATURE REVIEW — EQUATIONS ===
  app.post("/api/literature/equations", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { query, domain, language } = req.body;
    const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, "Génération équations de recherche");
    if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    const openai = await getOpenAI();
    const prompt = `Génère des équations de recherche booléennes optimisées pour trouver des articles académiques sur:
Sujet: ${query || domain || ""}
Langue: ${language === "fr" ? "Français" : language === "en" ? "Anglais" : "Français et Anglais"}

Génère 5-6 équations de recherche pour Google Scholar, PubMed, et bases de données académiques. Inclus des opérateurs booléens (AND, OR, NOT), des troncatures (*), et des guillemets pour les expressions exactes. Explique brièvement chaque équation.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
    res.json({ content: response.choices[0].message.content || "" });
  });

  // === SAVED SEARCHES (bibliographies) ===
  app.get("/api/bibliographies", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const items = await storage.getBibliographies(getUserId(req));
    res.json(items);
  });

  app.post("/api/bibliographies", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const item = await storage.createBibliography({ ...req.body, userId: getUserId(req) });
    res.json(item);
  });

  app.patch("/api/bibliographies/:id", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const item = await storage.getBibliography(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    const updated = await storage.updateBibliography(Number(req.params.id), req.body);
    res.json(updated);
  });

  app.delete("/api/bibliographies/:id", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const item = await storage.getBibliography(Number(req.params.id));
    if (!item || item.userId !== getUserId(req)) return res.status(403).json({ message: "Interdit" });
    await storage.deleteBibliography(Number(req.params.id));
    res.json({ success: true });
  });

  return httpServer;
}
