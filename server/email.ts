import nodemailer from "nodemailer";

const FROM_EMAIL = "contact@refbib.fr";
const FROM_NAME = "Refbib";

function getGmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const transporter = getGmailTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    replyTo: FROM_EMAIL,
    subject: `Bienvenue sur Refbib !`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h1 style="color:#1e40af;font-size:24px;margin-bottom:8px;">Bienvenue, ${firstName} !</h1>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Votre compte Refbib est créé. Vous pouvez maintenant rechercher des articles académiques, générer des bibliographies APA et créer vos fiches de lecture.
        </p>
        <a href="https://refbib.fr" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#1e40af;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Commencer →</a>
        <p style="margin-top:32px;color:#9ca3af;font-size:12px;">Refbib — Recherche bibliographique académique</p>
      </div>
    `,
  });
}

export function startAbandonedCartScheduler() {
  // Disabled in simplified version
}
