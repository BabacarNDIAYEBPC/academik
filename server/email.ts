import nodemailer from "nodemailer";

const FROM_EMAIL = process.env.GMAIL_USER || "noreply@refbib.fr";
const FROM_NAME = "Refbib";
const REPLY_TO = "contact@refbib.fr";

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function send(to: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] No transporter — would send to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  });
}

function baseTemplate(content: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
      <div style="background:#1e40af;padding:24px 32px;">
        <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">📚 Refbib</span>
      </div>
      <div style="padding:32px;">
        ${content}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;margin:0;">Refbib — Recherche bibliographique académique<br>Performance Consulting Groupe SAS</p>
      </div>
    </div>
  `;
}

export async function sendVerificationCode(to: string, code: string, isReset = false) {
  const subject = isReset ? "Réinitialisation de votre mot de passe" : "Votre code de vérification Refbib";
  const title = isReset ? "Réinitialisation du mot de passe" : "Vérifiez votre adresse email";
  const desc = isReset
    ? "Utilisez ce code pour réinitialiser votre mot de passe. Il expire dans 15 minutes."
    : "Entrez ce code pour activer votre compte Refbib. Il expire dans 15 minutes.";

  const html = baseTemplate(`
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">${title}</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">${desc}</p>
    <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1e40af;">${code}</span>
    </div>
    <p style="color:#94a3b8;font-size:13px;margin:0;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
  `);
  await send(to, subject, html);
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  const html = baseTemplate(`
    <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Bienvenue sur Refbib, ${firstName} !</h2>
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Votre compte est prêt. Vous pouvez maintenant rechercher des articles académiques, générer des bibliographies APA et analyser vos sources.
    </p>
    <a href="https://refbib.fr" style="display:inline-block;padding:12px 24px;background:#1e40af;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Commencer ma recherche →</a>
  `);
  await send(to, "Bienvenue sur Refbib !", html);
}

export function startAbandonedCartScheduler() {}
