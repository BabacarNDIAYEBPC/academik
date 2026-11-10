import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationCode, sendWelcomeEmail } from "../../email";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function registerAuthRoutes(app: Express): void {
  // GET current user
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const session = req.session as any;
      const user = await authStorage.getUserById(session.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // REGISTER
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });
    if (password.length < 8) return res.status(400).json({ message: "Mot de passe trop court (8 caractères min.)" });

    const existing = await authStorage.getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Un compte existe déjà avec cet email" });

    const passwordHash = await bcrypt.hash(password, 12);
    await authStorage.createUser(email, passwordHash, firstName, lastName);

    const code = generateCode();
    await authStorage.createVerificationCode(email, code, "verify");
    console.log(`[AUTH] Verification code for ${email}: ${code}`);
    sendVerificationCode(email, code).catch(err => console.error("[AUTH] Email error:", err));

    res.json({ success: true, message: "Code de vérification envoyé" });
  });

  // VERIFY EMAIL
  app.post("/api/auth/verify", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email et code requis" });

    const valid = await authStorage.getValidCode(email, code, "verify");
    if (!valid) return res.status(400).json({ message: "Code invalide ou expiré" });

    await authStorage.markVerified(email);
    await authStorage.markCodeUsed(email, code);

    const user = await authStorage.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    (req.session as any).userId = user.id;

    sendWelcomeEmail(email, user.firstName || email.split("@")[0]).catch(() => {});

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // LOGIN
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });

    const user = await authStorage.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    if (!user.verified) return res.status(403).json({ message: "Compte non vérifié", needsVerification: true });

    (req.session as any).userId = user.id;
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  });

  // LOGOUT
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ success: true });
  });

  // FORGOT PASSWORD — send reset code
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await authStorage.getUserByEmail(email);
    if (!user) return res.json({ success: true }); // Don't reveal if email exists

    const code = generateCode();
    await authStorage.createVerificationCode(email, code, "reset");
    console.log(`[AUTH] Reset code for ${email}: ${code}`);
    sendVerificationCode(email, code, true).catch(err => console.error("[AUTH] Reset email error:", err));

    res.json({ success: true });
  });

  // RESET PASSWORD — verify code + set new password
  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, password } = req.body;
    if (!email || !code || !password) return res.status(400).json({ message: "Tous les champs sont requis" });
    if (password.length < 8) return res.status(400).json({ message: "Mot de passe trop court (8 caractères min.)" });

    const valid = await authStorage.getValidCode(email, code, "reset");
    if (!valid) return res.status(400).json({ message: "Code invalide ou expiré" });

    const passwordHash = await bcrypt.hash(password, 12);
    await authStorage.markCodeUsed(email, code);

    const { db } = await import("../../db");
    const { authUsers } = await import("./storage");
    const { eq } = await import("drizzle-orm");
    await db.update(authUsers).set({ passwordHash, updatedAt: new Date() }).where(eq(authUsers.email, email.toLowerCase()));

    res.json({ success: true });
  });

  // RESEND CODE
  app.post("/api/auth/resend-code", async (req, res) => {
    const { email, type = "verify" } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    const user = await authStorage.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "Compte introuvable" });

    const code = generateCode();
    await authStorage.createVerificationCode(email, code, type);
    console.log(`[AUTH] Resent code for ${email}: ${code}`);
    sendVerificationCode(email, code, type === "reset").catch(() => {});

    res.json({ success: true });
  });

  // Legacy GET /api/logout for backward compat
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {});
    res.redirect("/");
  });
}
