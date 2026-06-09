import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerAdminRoutes } from "./admin";
import OpenAI from "openai";
import { CREDIT_COSTS, CREDIT_PACKS } from "@shared/schema";
import { realSearch } from "./search";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendContactEmail } from "./email";

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

async function isSuperAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "").toLowerCase().split(",").map(e => e.trim()).filter(Boolean);
  if (!superAdminEmails.length) return false;
  try {
    const { db } = await import("./db");
    const { authUsers } = await import("./replit_integrations/auth/storage");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select({ email: authUsers.email }).from(authUsers).where(eq(authUsers.id, Number(userId)));
    return !!user && superAdminEmails.includes(user.email.toLowerCase());
  } catch {
    return false;
  }
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

    const BASE = "https://academik.fr";
    const today = "2026-05-22";

    // All multilang SEO slugs (23 langs × 8 types = 184 pages)
    const multiLangSlugs = [
      // ES
      "es/generador-bibliografia-apa","es/bibliografia-vancouver","es/bibliografia-mla","es/bibliografia-chicago","es/revision-literatura","es/tesis-memoria","es/estudiantes","es/investigadores",
      // PT
      "pt/gerador-bibliografia-apa","pt/bibliografia-vancouver","pt/bibliografia-mla","pt/bibliografia-chicago","pt/revisao-literatura","pt/tese-dissertacao","pt/estudantes","pt/pesquisadores",
      // DE
      "de/literaturverzeichnis-apa","de/literaturverzeichnis-vancouver","de/literaturverzeichnis-mla","de/literaturverzeichnis-chicago","de/literaturrecherche","de/dissertation-hilfe","de/studenten","de/wissenschaftler",
      // IT
      "it/generatore-bibliografia-apa","it/bibliografia-vancouver","it/bibliografia-mla","it/bibliografia-chicago","it/revisione-letteratura","it/tesi-dissertazione","it/studenti","it/ricercatori",
      // NL
      "nl/bibliografie-apa","nl/bibliografie-vancouver","nl/bibliografie-mla","nl/bibliografie-chicago","nl/literatuuronderzoek","nl/scriptie-hulp","nl/studenten","nl/onderzoekers",
      // PL
      "pl/bibliografia-apa","pl/bibliografia-vancouver","pl/bibliografia-mla","pl/bibliografia-chicago","pl/przeglad-literatury","pl/praca-dyplomowa","pl/studenci","pl/naukowcy",
      // RO
      "ro/bibliografie-apa","ro/bibliografie-vancouver","ro/bibliografie-mla","ro/bibliografie-chicago","ro/recenzie-literatura","ro/teza-disertatie","ro/studenti","ro/cercetatori",
      // SV
      "sv/bibliografi-apa","sv/bibliografi-vancouver","sv/bibliografi-mla","sv/bibliografi-chicago","sv/litteraturgranskning","sv/uppsats-hjalp","sv/studenter","sv/forskare",
      // NO
      "no/bibliografi-apa","no/bibliografi-vancouver","no/bibliografi-mla","no/bibliografi-chicago","no/litteraturgjennomgang","no/oppgave-hjelp","no/studenter","no/forskere",
      // DA
      "da/bibliografi-apa","da/bibliografi-vancouver","da/bibliografi-mla","da/bibliografi-chicago","da/litteraturgennemgang","da/opgave-hjaelp","da/studerende","da/forskere",
      // FI
      "fi/bibliografia-apa","fi/bibliografia-vancouver","fi/bibliografia-mla","fi/bibliografia-chicago","fi/kirjallisuuskatsaus","fi/opinnaytetyo-apu","fi/opiskelijat","fi/tutkijat",
      // CS
      "cs/bibliografie-apa","cs/bibliografie-vancouver","cs/bibliografie-mla","cs/bibliografie-chicago","cs/prehled-literatury","cs/diplomova-prace","cs/studenti","cs/vedci",
      // HU
      "hu/bibliografia-apa","hu/bibliografia-vancouver","hu/bibliografia-mla","hu/bibliografia-chicago","hu/irodalomattekintes","hu/szakdolgozat-segitseg","hu/hallgatok","hu/kutatók",
      // EL
      "el/vivliografia-apa","el/vivliografia-vancouver","el/vivliografia-mla","el/vivliografia-chicago","el/anaskopisi-vivliografias","el/ptychiak-ergasia","el/foitites","el/erevnites",
      // RU
      "ru/bibliografiya-apa","ru/bibliografiya-vancouver","ru/bibliografiya-mla","ru/bibliografiya-chicago","ru/obzor-literatury","ru/dissertaciya-pomoshch","ru/studenty","ru/issledovateli",
      // UK
      "uk/bibliohrafiia-apa","uk/bibliohrafiia-vancouver","uk/bibliohrafiia-mla","uk/bibliohrafiia-chicago","uk/ohliad-literatury","uk/dysertaciia-dopomoha","uk/studenty","uk/doslidnyky",
      // TR
      "tr/kaynakca-apa","tr/kaynakca-vancouver","tr/kaynakca-mla","tr/kaynakca-chicago","tr/literatur-taramasi","tr/tez-yardim","tr/ogrenciler","tr/arastirmacılar",
      // AR
      "ar/bibliughrafia-apa","ar/bibliughrafia-vancouver","ar/bibliughrafia-mla","ar/bibliughrafia-chicago","ar/murajaat-adabiyya","ar/risala-musaeada","ar/tullab","ar/bahithun",
      // HE
      "he/bibliographia-apa","he/bibliographia-vancouver","he/bibliographia-mla","he/bibliographia-chicago","he/skirut-sifrut","he/avaoda-akademit","he/studentim","he/hukrim",
      // HI
      "hi/sandarbh-suchi-apa","hi/sandarbh-suchi-vancouver","hi/sandarbh-suchi-mla","hi/sandarbh-suchi-chicago","hi/sahitya-samiksha","hi/shodh-prabandh-sahayata","hi/chhatr","hi/shodharth",
      // ZH
      "zh/cankaowenxian-apa","zh/cankaowenxian-vancouver","zh/cankaowenxian-mla","zh/cankaowenxian-chicago","zh/wenxian-zongshu","zh/lunwen-bangzhu","zh/xuesheng","zh/yanjiu-ren-yuan",
      // JA
      "ja/sankoubunken-apa","ja/sankoubunken-vancouver","ja/sankoubunken-mla","ja/sankoubunken-chicago","ja/bunken-chosa","ja/ronbun-support","ja/gakusei","ja/kenkyusha",
      // KO
      "ko/chamgomunheon-apa","ko/chamgomunheon-vancouver","ko/chamgomunheon-mla","ko/chamgomunheon-chicago","ko/munheon-gochal","ko/nonmun-jiwon","ko/haksaeng","ko/yeongu-ja",
      // VI
      "vi/tai-lieu-tham-khao-apa","vi/tai-lieu-tham-khao-vancouver","vi/tai-lieu-tham-khao-mla","vi/tai-lieu-tham-khao-chicago","vi/tong-quan-tai-lieu","vi/luan-van-ho-tro","vi/sinh-vien","vi/nha-nghien-cuu",
      // ID
      "id/daftar-pustaka-apa","id/daftar-pustaka-vancouver","id/daftar-pustaka-mla","id/daftar-pustaka-chicago","id/tinjauan-pustaka","id/skripsi-bantuan","id/mahasiswa","id/peneliti",
    ];

    const multiLangUrls = multiLangSlugs.map(slug => `  <url>
    <loc>${BASE}/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE}/reussir-memoire-master</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/reussir-memoire-master"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/reussir-memoire-master"/>
  </url>
  <url>
    <loc>${BASE}/recherche-bibliographique</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/recherche-bibliographique"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/recherche-bibliographique"/>
  </url>
  <url>
    <loc>${BASE}/synthese-bibliographique</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/synthese-bibliographique"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/synthese-bibliographique"/>
  </url>
  <url>
    <loc>${BASE}/bibliographie-apa</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-apa"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/apa-citation-generator"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/generador-bibliografia-apa"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/gerador-bibliografia-apa"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/literaturverzeichnis-apa"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/generatore-bibliografia-apa"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-apa"/>
  </url>
  <url>
    <loc>${BASE}/en/apa-citation-generator</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-apa"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/apa-citation-generator"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-apa"/>
  </url>
  <url>
    <loc>${BASE}/revue-litterature</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/revue-litterature"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/literature-review"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/revision-literatura"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/revisao-literatura"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/literaturrecherche"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/revisione-letteratura"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/revue-litterature"/>
  </url>
  <url>
    <loc>${BASE}/en/literature-review</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/revue-litterature"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/literature-review"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/revue-litterature"/>
  </url>
  <url>
    <loc>${BASE}/bibliographie-vancouver</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-vancouver"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/vancouver-citation"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/bibliografia-vancouver"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/bibliografia-vancouver"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/literaturverzeichnis-vancouver"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/bibliografia-vancouver"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-vancouver"/>
  </url>
  <url>
    <loc>${BASE}/en/vancouver-citation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-vancouver"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/vancouver-citation"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-vancouver"/>
  </url>
  <url>
    <loc>${BASE}/bibliographie-mla</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-mla"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/mla-citation"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-mla"/>
  </url>
  <url>
    <loc>${BASE}/en/mla-citation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-mla"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/mla-citation"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-mla"/>
  </url>
  <url>
    <loc>${BASE}/bibliographie-chicago</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-chicago"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/chicago-citation"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-chicago"/>
  </url>
  <url>
    <loc>${BASE}/en/chicago-citation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/bibliographie-chicago"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/chicago-citation"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/bibliographie-chicago"/>
  </url>
  <url>
    <loc>${BASE}/memoire-these</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/memoire-these"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/dissertation-help"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/tesis-memoria"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/tese-dissertacao"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/dissertation-hilfe"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/tesi-dissertazione"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/memoire-these"/>
  </url>
  <url>
    <loc>${BASE}/en/dissertation-help</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/memoire-these"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/dissertation-help"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/memoire-these"/>
  </url>
  <url>
    <loc>${BASE}/etudiant</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/etudiant"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/students"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/estudiantes"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/estudantes"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/studenten"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/studenti"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/etudiant"/>
  </url>
  <url>
    <loc>${BASE}/en/students</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/etudiant"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/students"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/etudiant"/>
  </url>
  <url>
    <loc>${BASE}/chercheur</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/chercheur"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/researchers"/>
    <xhtml:link rel="alternate" hreflang="es" href="${BASE}/es/investigadores"/>
    <xhtml:link rel="alternate" hreflang="pt" href="${BASE}/pt/pesquisadores"/>
    <xhtml:link rel="alternate" hreflang="de" href="${BASE}/de/wissenschaftler"/>
    <xhtml:link rel="alternate" hreflang="it" href="${BASE}/it/ricercatori"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/chercheur"/>
  </url>
  <url>
    <loc>${BASE}/en/researchers</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}/chercheur"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE}/en/researchers"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/chercheur"/>
  </url>
${multiLangUrls}
</urlset>`);
  });

  // === BING VERIFICATION ===
  app.get("/BingSiteAuth.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml");
    res.send(`<?xml version="1.0"?>
<users>
  <user>7743124096E97C8BCDE341917A7FBAA9</user>
</users>`);
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

  // === CURRENCY DETECTION ===
  app.get("/api/currency", (req, res) => {
    // Map country codes (from CF-IPCountry or X-Country headers) to currency
    const COUNTRY_CURRENCY: Record<string, { currency: string; symbol: string; rate: number }> = {
      // EUR zone
      FR: { currency: "eur", symbol: "€", rate: 1 },
      DE: { currency: "eur", symbol: "€", rate: 1 },
      IT: { currency: "eur", symbol: "€", rate: 1 },
      ES: { currency: "eur", symbol: "€", rate: 1 },
      PT: { currency: "eur", symbol: "€", rate: 1 },
      NL: { currency: "eur", symbol: "€", rate: 1 },
      BE: { currency: "eur", symbol: "€", rate: 1 },
      AT: { currency: "eur", symbol: "€", rate: 1 },
      FI: { currency: "eur", symbol: "€", rate: 1 },
      IE: { currency: "eur", symbol: "€", rate: 1 },
      GR: { currency: "eur", symbol: "€", rate: 1 },
      LU: { currency: "eur", symbol: "€", rate: 1 },
      SK: { currency: "eur", symbol: "€", rate: 1 },
      SI: { currency: "eur", symbol: "€", rate: 1 },
      EE: { currency: "eur", symbol: "€", rate: 1 },
      LV: { currency: "eur", symbol: "€", rate: 1 },
      LT: { currency: "eur", symbol: "€", rate: 1 },
      MT: { currency: "eur", symbol: "€", rate: 1 },
      CY: { currency: "eur", symbol: "€", rate: 1 },
      HR: { currency: "eur", symbol: "€", rate: 1 },
      // GBP
      GB: { currency: "gbp", symbol: "£", rate: 0.86 },
      // USD
      US: { currency: "usd", symbol: "$", rate: 1.08 },
      CA: { currency: "cad", symbol: "CA$", rate: 1.48 },
      AU: { currency: "aud", symbol: "A$", rate: 1.64 },
      NZ: { currency: "nzd", symbol: "NZ$", rate: 1.78 },
      // BRL
      BR: { currency: "brl", symbol: "R$", rate: 5.5 },
      // CHF
      CH: { currency: "chf", symbol: "CHF", rate: 0.96 },
      // SEK
      SE: { currency: "sek", symbol: "kr", rate: 11.3 },
      NO: { currency: "nok", symbol: "kr", rate: 11.5 },
      DK: { currency: "dkk", symbol: "kr", rate: 7.46 },
      // PLN
      PL: { currency: "pln", symbol: "zł", rate: 4.3 },
      // CZK
      CZ: { currency: "czk", symbol: "Kč", rate: 25.1 },
      // HUF
      HU: { currency: "huf", symbol: "Ft", rate: 400 },
      // RON
      RO: { currency: "ron", symbol: "lei", rate: 5 },
      // TRY
      TR: { currency: "try", symbol: "₺", rate: 36 },
      // RUB (Stripe doesn't support, fallback EUR)
      RU: { currency: "eur", symbol: "€", rate: 1 },
      UA: { currency: "eur", symbol: "€", rate: 1 },
      // ILS
      IL: { currency: "ils", symbol: "₪", rate: 3.9 },
      // INR
      IN: { currency: "inr", symbol: "₹", rate: 91 },
      // JPY
      JP: { currency: "jpy", symbol: "¥", rate: 162 },
      // CNY
      CN: { currency: "cny", symbol: "¥", rate: 7.8 },
      // KRW
      KR: { currency: "krw", symbol: "₩", rate: 1450 },
      // VND
      VN: { currency: "vnd", symbol: "₫", rate: 27000 },
      // IDR
      ID: { currency: "idr", symbol: "Rp", rate: 17500 },
      // ARS
      AR: { currency: "ars", symbol: "$", rate: 1050 },
      // MXN
      MX: { currency: "mxn", symbol: "MX$", rate: 18.5 },
      // SAR
      SA: { currency: "sar", symbol: "﷼", rate: 4.05 },
      AE: { currency: "aed", symbol: "د.إ", rate: 3.97 },
      // MAD
      MA: { currency: "mad", symbol: "DH", rate: 10.8 },
      TN: { currency: "tnd", symbol: "DT", rate: 3.3 },
      DZ: { currency: "dzd", symbol: "DA", rate: 146 },
    };

    // Try Cloudflare header first, then X-Country, then Accept-Language fallback
    const cfCountry = req.headers["cf-ipcountry"] as string;
    const country = (cfCountry && cfCountry !== "XX" ? cfCountry : "").toUpperCase();
    const info = COUNTRY_CURRENCY[country] || { currency: "eur", symbol: "€", rate: 1 };

    res.json({ ...info, country: country || "XX" });
  });

  // === DEMO LOGIN (Apple Review Team) ===
  // Accept button click OR username/password: demo / academik2024
  app.post("/api/demo-login", async (req, res) => {
    const DEMO_USER_ID = "apple-review-demo-academik";
    const { username, password } = req.body || {};
    // If credentials provided, validate them
    if (username !== undefined || password !== undefined) {
      if (username !== "demo" || password !== "academik2024") {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }
    }
    try {
      (req.session as any).userId = DEMO_USER_ID;
      const credits = await storage.getCredits(DEMO_USER_ID);
      if (credits < 50) {
        await storage.addCredits(DEMO_USER_ID, 50 - credits, "demo", "Crédits démo Apple Review", undefined);
      }
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // === ACCOUNT ===
  app.delete("/api/user/account", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    try {
      await storage.deleteUserData(userId);
      const { authUsers } = await import("./replit_integrations/auth/storage");
      await db.delete(authUsers).where(eq(authUsers.id, Number(userId)));
      req.session.destroy(() => {});
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // === CREDITS ===
  app.get("/api/credits", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    if (await isSuperAdmin(userId)) return res.json({ credits: 999999, superAdmin: true });
    const credits = await storage.getCredits(userId);
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
    const { packId, currency, rate } = req.body;
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

    // Use requested currency if valid, fallback to EUR
    const useCurrency = (currency || "eur").toLowerCase();
    const useRate = typeof rate === "number" && rate > 0 ? rate : 1;
    // Currencies where Stripe expects integer amounts (no decimals)
    const zeroDécimalCurrencies = ["jpy", "krw", "vnd", "idr", "clp", "gnf", "mga", "pyg", "rwf", "ugx", "xaf", "xof"];
    const convertedPrice = pack.price * useRate;
    const unitAmount = zeroDécimalCurrencies.includes(useCurrency)
      ? Math.round(convertedPrice)
      : Math.round(convertedPrice * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: useCurrency,
          product_data: { name: `Pack ${pack.label} — ${pack.credits} crédits`, description: `${pack.credits} crédits Academik` },
          unit_amount: unitAmount,
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

  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, category, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }
    if (message.length > 4000) {
      return res.status(400).json({ message: "Message trop long (4000 caractères max)." });
    }
    try {
      await sendContactEmail({ name, email, subject, category: category || "Général", message });
      res.json({ success: true });
    } catch (err) {
      console.error("[CONTACT]", err);
      res.status(500).json({ message: "Erreur lors de l'envoi. Veuillez réessayer." });
    }
  });

  // === LITERATURE REVIEW — SEARCH ARTICLES ===
  app.post("/api/literature/search", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { query, domain, platforms, language, periodStart, periodEnd, level, sourceTypes, articleCount, accessType, openAccessProportion } = req.body;
    if (!query && !domain) return res.status(400).json({ message: "Requête manquante" });
    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) {
      const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, `Recherche: ${query || domain}`);
      if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    }
    const count = articleCount || 10;
    const searchQuery = [query, domain].filter(Boolean).join(" ");

    // Fetch more than needed so GPT can pick the best ones
    const rawArticles = await realSearch({
      query: searchQuery,
      platforms: platforms || ["google_scholar", "pubmed", "hal", "cairn", "sciencedirect"],
      language: language || "fr",
      periodStart: periodStart || "2015",
      periodEnd: periodEnd || String(new Date().getFullYear()),
      articleCount: Math.min(count * 3, 40),
      accessType: accessType || "all",
      openAccessProportion: openAccessProportion ?? 50,
    });

    if (rawArticles.length === 0) {
      return res.status(404).json({ message: "Aucun article trouvé pour cette requête. Essayez des termes plus généraux ou en anglais." });
    }

    // GPT re-ranking: score relevance of each article vs the query
    let articles = rawArticles;
    if (rawArticles.length > count) {
      try {
        const openai = await getOpenAI();
        const candidateList = rawArticles.map((a, i) =>
          `${i}: "${a.title}" — ${a.lastName}${a.firstName ? `, ${a.firstName}` : ""} (${a.year}) — ${a.publisher || ""}`
        ).join("\n");

        const rankPrompt = `Tu es un assistant de recherche académique. Évalue la pertinence de chaque article ci-dessous par rapport à la requête de recherche.

Requête: "${searchQuery}"

Articles (format: index: "titre" — auteur (année) — revue):
${candidateList}

Pour chaque article, donne un score de pertinence de 0 à 10 (10 = très pertinent, 0 = hors sujet).
Réponds UNIQUEMENT en JSON: { "scores": [{"index": 0, "score": 8}, ...] }`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: rankPrompt }],
          response_format: { type: "json_object" },
          temperature: 0,
        });

        const ranked = JSON.parse(response.choices[0].message.content || "{}");
        const scores: { index: number; score: number }[] = ranked.scores || [];

        if (scores.length > 0) {
          const scoreMap = new Map(scores.map(s => [s.index, s.score]));
          articles = rawArticles
            .map((a, i) => ({ ...a, relevanceScore: scoreMap.get(i) ?? 5 }))
            .filter(a => (a.relevanceScore ?? 0) >= 4)
            .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))
            .slice(0, count);

          // If GPT filtered too aggressively, fall back to raw results
          if (articles.length < Math.min(3, count)) {
            articles = rawArticles.slice(0, count);
          }
        } else {
          articles = rawArticles.slice(0, count);
        }
      } catch {
        articles = rawArticles.slice(0, count);
      }
    }

    res.json({ articles });
  });

  // === LITERATURE REVIEW — ANALYZE ARTICLES ===
  app.post("/api/literature/analyze", async (req, res) => {
    if (!checkAuth(req, res)) return;
    const userId = getUserId(req);
    const { articles, analysisType, query } = req.body;
    if (!articles || !articles.length) return res.status(400).json({ message: "Articles manquants" });
    if (!await isSuperAdmin(userId)) {
      const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, "Analyse articles");
      if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    }
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
    if (!await isSuperAdmin(userId)) {
      const spent = await storage.spendCredits(userId, CREDIT_COSTS.GENERATE_BIBLIOGRAPHY, "Génération bibliographie");
      if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    }
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
    if (!await isSuperAdmin(userId)) {
      const spent = await storage.spendCredits(userId, CREDIT_COSTS.SEARCH_ARTICLES, "Génération équations de recherche");
      if (!spent) return res.status(402).json({ message: "Crédits insuffisants" });
    }
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
