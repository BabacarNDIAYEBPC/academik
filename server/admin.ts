import type { Express, Request, Response } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { authUsers } from "./replit_integrations/auth/storage";
import { userCredits, creditTransactions, bibliographies, invoices } from "../shared/schema";

function checkAdminAuth(req: Request, res: Response): boolean {
  if (!(req.session as any).adminAuthenticated) {
    res.status(401).json({ message: "Non autorisé" });
    return false;
  }
  return true;
}

export function registerAdminRoutes(app: Express) {
  // Login
  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) return res.status(500).json({ message: "ADMIN_PASSWORD non configuré" });
    if (password !== adminPassword) return res.status(401).json({ message: "Mot de passe incorrect" });
    (req.session as any).adminAuthenticated = true;
    res.json({ success: true });
  });

  // Logout
  app.post("/api/admin/logout", (req, res) => {
    (req.session as any).adminAuthenticated = false;
    res.json({ success: true });
  });

  // Check auth
  app.get("/api/admin/me", (req, res) => {
    res.json({ authenticated: !!(req.session as any).adminAuthenticated });
  });

  // Stats globales
  app.get("/api/admin/stats", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    try {
      const [totals] = await db.execute(sql`
        SELECT
          COUNT(*) AS total_users,
          COUNT(*) FILTER (WHERE verified = true) AS verified_users,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_last_30d,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS new_last_7d,
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') AS new_today
        FROM auth_users
      `);

      const [revenue] = await db.execute(sql`
        SELECT
          COALESCE(SUM(amount), 0) AS total_revenue,
          COALESCE(SUM(credits), 0) AS total_credits_sold,
          COUNT(*) AS total_orders
        FROM invoices
      `);

      const [activity] = await db.execute(sql`
        SELECT
          COUNT(DISTINCT user_id) AS active_users,
          COUNT(*) AS total_searches
        FROM bibliographies
      `);

      const [creditSpend] = await db.execute(sql`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE amount < 0), 0) * -1 AS credits_spent
        FROM credit_transactions
      `);

      // Inscriptions par jour (30 derniers jours)
      const dailySignups = await db.execute(sql`
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS count
        FROM auth_users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      const totalUsers = Number((totals as any).total_users);
      const verifiedUsers = Number((totals as any).verified_users);

      res.json({
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          conversionRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
          newLast30d: Number((totals as any).new_last_30d),
          newLast7d: Number((totals as any).new_last_7d),
          newToday: Number((totals as any).new_today),
        },
        revenue: {
          total: Number((revenue as any).total_revenue).toFixed(2),
          creditsSold: Number((revenue as any).total_credits_sold),
          orders: Number((revenue as any).total_orders),
        },
        activity: {
          activeUsers: Number((activity as any).active_users),
          totalSearches: Number((activity as any).total_searches),
          creditsSpent: Number((creditSpend as any).credits_spent),
        },
        dailySignups: (dailySignups as any[]).map(r => ({
          date: r.date,
          count: Number(r.count),
        })),
      });
    } catch (err) {
      console.error("[ADMIN] Stats error:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // === SOCIAL MEDIA PUBLISHING ===

  // Generate AI post content
  app.post("/api/admin/social/generate", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const { topic, platform } = req.body;
    if (!topic) return res.status(400).json({ message: "Sujet requis" });

    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const platformInstructions = platform === "instagram"
        ? "Post Instagram : accrocheur, visuel, avec émojis, hashtags (#recherche #académique #université #étudiant #bibliographie #science), max 2200 caractères."
        : "Post Facebook : informatif, engageant, peut être plus long, avec émojis, 1-3 hashtags pertinents, max 63206 caractères.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Tu es un community manager pour Academik (academik.fr), outil de recherche bibliographique académique IA pour étudiants et chercheurs francophones. Écris en français. ${platformInstructions}`,
          },
          {
            role: "user",
            content: `Crée un post sur le sujet suivant : ${topic}`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content ?? "";
      res.json({ content });
    } catch (err: any) {
      console.error("[ADMIN] Generate post error:", err);
      res.status(500).json({ message: "Erreur génération IA" });
    }
  });

  // Publish to Facebook
  app.post("/api/admin/social/publish/facebook", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message requis" });

    const pageId = process.env.FB_PAGE_ID;
    const token = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!pageId || !token) return res.status(500).json({ message: "FB_PAGE_ID ou FB_PAGE_ACCESS_TOKEN non configuré" });

    try {
      const url = `https://graph.facebook.com/v20.0/${pageId}/feed`;
      const fbRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, access_token: token }),
      });
      const data = await fbRes.json() as any;
      if (!fbRes.ok || data.error) {
        console.error("[ADMIN] Facebook API error:", data);
        return res.status(400).json({ message: data.error?.message ?? "Erreur Facebook API" });
      }
      res.json({ success: true, postId: data.id });
    } catch (err: any) {
      console.error("[ADMIN] Facebook publish error:", err);
      res.status(500).json({ message: "Erreur publication Facebook" });
    }
  });

  // Publish to Instagram
  app.post("/api/admin/social/publish/instagram", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message requis" });

    const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
    const token = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!igAccountId || !token) return res.status(500).json({ message: "INSTAGRAM_ACCOUNT_ID non configuré — liez d'abord le compte Instagram à la Page Facebook" });

    try {
      // Step 1: Create media container
      const containerRes = await fetch(`https://graph.facebook.com/v20.0/${igAccountId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: message, media_type: "TEXT", access_token: token }),
      });
      const container = await containerRes.json() as any;
      if (!containerRes.ok || container.error) {
        console.error("[ADMIN] Instagram container error:", container);
        return res.status(400).json({ message: container.error?.message ?? "Erreur création container Instagram" });
      }

      // Step 2: Publish container
      const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igAccountId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: container.id, access_token: token }),
      });
      const published = await publishRes.json() as any;
      if (!publishRes.ok || published.error) {
        console.error("[ADMIN] Instagram publish error:", published);
        return res.status(400).json({ message: published.error?.message ?? "Erreur publication Instagram" });
      }

      res.json({ success: true, postId: published.id });
    } catch (err: any) {
      console.error("[ADMIN] Instagram publish error:", err);
      res.status(500).json({ message: "Erreur publication Instagram" });
    }
  });

  // Check social config status
  app.get("/api/admin/social/status", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    res.json({
      facebook: !!(process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN),
      instagram: !!process.env.INSTAGRAM_ACCOUNT_ID,
    });
  });

  // Discover Instagram account ID from the saved Page token
  app.get("/api/admin/social/discover-instagram", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const pageId = process.env.FB_PAGE_ID;
    const token = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!pageId || !token) return res.status(500).json({ message: "Token Facebook non configuré" });

    try {
      // Try multiple approaches to find the Instagram account
      const results: any = {};

      // Approach 1: instagram_business_account on the page
      const r1 = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${token}`
      );
      results.instagram_business_account = await r1.json();

      // Approach 2: connected_instagram_account
      const r2 = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}?fields=connected_instagram_account&access_token=${token}`
      );
      results.connected_instagram_account = await r2.json();

      // Approach 3: via /me with page token
      const r3 = await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name,instagram_business_account&access_token=${token}`
      );
      results.me = await r3.json();

      // Approach 4: instagram_accounts
      const r4 = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_accounts&access_token=${token}`
      );
      results.instagram_accounts = await r4.json();

      res.json(results);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Liste des utilisateurs
  app.get("/api/admin/users", async (req, res) => {
    if (!checkAdminAuth(req, res)) return;
    const page = Number(req.query.page ?? 0);
    const limit = 50;
    const offset = page * limit;
    const search = (req.query.search as string) ?? "";

    try {
      const users = await db.execute(sql`
        SELECT
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          u.verified,
          u.created_at,
          COALESCE(uc.credits, 0) AS credits,
          COALESCE(bib.searches, 0) AS searches,
          COALESCE(inv.spent, 0) AS spent
        FROM auth_users u
        LEFT JOIN user_credits uc ON uc.user_id = u.id::text
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS searches FROM bibliographies GROUP BY user_id
        ) bib ON bib.user_id = u.id::text
        LEFT JOIN (
          SELECT user_id, SUM(amount) AS spent FROM invoices GROUP BY user_id
        ) inv ON inv.user_id = u.id::text
        ${search ? sql`WHERE u.email ILIKE ${'%' + search + '%'} OR u.first_name ILIKE ${'%' + search + '%'} OR u.last_name ILIKE ${'%' + search + '%'}` : sql``}
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      const [countRow] = await db.execute(sql`
        SELECT COUNT(*) AS total FROM auth_users
        ${search ? sql`WHERE email ILIKE ${'%' + search + '%'} OR first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'}` : sql``}
      `);

      res.json({
        users: (users as any[]).map(u => ({
          id: u.id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name,
          verified: u.verified,
          createdAt: u.created_at,
          credits: Number(u.credits),
          searches: Number(u.searches),
          spent: Number(u.spent).toFixed(2),
        })),
        total: Number((countRow as any).total),
        page,
        pages: Math.ceil(Number((countRow as any).total) / limit),
      });
    } catch (err) {
      console.error("[ADMIN] Users error:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
}
