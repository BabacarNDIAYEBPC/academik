import { db } from "./db";
import { abandonedCheckouts, profiles } from "@shared/schema";
import { eq, and, lte } from "drizzle-orm";
import { storage } from "./storage";
import nodemailer from "nodemailer";

const FROM_EMAIL = "contact@academik.fr";
const FROM_NAME = "Academik";
const COMPANY_INFO = `Performance Consulting Groupe SAS – SIREN 913 540 944<br>3 Avenue de Toulouse, 66140 Canet-en-Roussillon<br>Capital social : 14 000 €`;

function getGmailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getAppUrl(): Promise<string> {
  const setting = await storage.getAdminSetting("app_url");
  if (setting) {
    const cleaned = typeof setting === "string" ? setting.replace(/^"+|"+$/g, "").trim() : String(setting);
    if (cleaned.startsWith("http")) return cleaned;
  }
  return process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "https://academik.fr";
}

function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
<tr><td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:30px 40px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:1px;">Academik</h1>
  <p style="color:#E0E7FF;margin:6px 0 0;font-size:13px;">De A à Z dans la rédaction académique</p>
</td></tr>
<tr><td style="padding:35px 40px;">
${content}
</td></tr>
<tr><td style="background-color:#F9FAFB;padding:25px 40px;border-top:1px solid #E5E7EB;">
  <p style="color:#6B7280;font-size:12px;margin:0 0 8px;text-align:center;">
    Une question ? Contactez-nous : <a href="mailto:contact@academik.fr" style="color:#4F46E5;text-decoration:none;">contact@academik.fr</a>
  </p>
  <p style="color:#9CA3AF;font-size:11px;margin:0;text-align:center;">
    ${COMPANY_INFO}
  </p>
  <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;text-align:center;">
    &copy; ${new Date().getFullYear()} Academik – Tous droits réservés
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color: string = "#4F46E5"): string {
  return `<div style="text-align:center;margin:30px 0;">
    <a href="${url}" style="display:inline-block;background-color:${color};color:#ffffff;padding:14px 35px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${text}</a>
  </div>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = getGmailTransporter();

    if (transporter) {
      await transporter.sendMail({
        from: `${FROM_NAME} <${process.env.GMAIL_USER}>`,
        replyTo: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Sent via Gmail to ${to}: "${subject}"`);
      return true;
    }

    console.log(`[EMAIL] No email provider configured. Would send to ${to}: "${subject}"`);
    return true;
  } catch (err) {
    console.error("[EMAIL] Send error:", err);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const appUrl = await getAppUrl();
  const subject = "Bienvenue sur Academik !";
  const html = emailLayout(`
    <h2 style="color:#1F2937;margin:0 0 20px;font-size:22px;">Bienvenue ${escapeHtml(firstName)} !</h2>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Nous sommes ravis de vous accueillir sur <strong>Academik</strong>, votre assistant méthodologique
      pour la rédaction académique.
    </p>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Avec Academik, vous pouvez :
    </p>
    <ul style="color:#374151;line-height:2;font-size:15px;padding-left:20px;">
      <li>Structurer votre mémoire, TFE, thèse ou rapport de stage</li>
      <li>Générer du contenu section par section avec mémoire contextuelle</li>
      <li>Exporter vos travaux en Word et PDF</li>
      <li>Gérer vos sources et votre bibliographie</li>
    </ul>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Commencez dès maintenant en créant votre premier projet !
    </p>
    ${ctaButton("Commencer maintenant", appUrl)}
    <p style="color:#6B7280;font-size:13px;line-height:1.6;">
      Si vous avez des questions, n'hésitez pas à nous écrire à
      <a href="mailto:contact@academik.fr" style="color:#4F46E5;">contact@academik.fr</a>.
    </p>
  `);

  return sendEmail(email, subject, html);
}

export async function sendPaymentConfirmationEmail(
  email: string,
  firstName: string,
  items: Array<{ label: string; price: number }>,
  totalAmount: number,
  invoiceNumber?: string
): Promise<boolean> {
  const appUrl = await getAppUrl();
  const formattedTotal = (totalAmount / 100).toFixed(2).replace(".", ",") + " €";
  const subject = `Academik – Confirmation de paiement${invoiceNumber ? ` #${invoiceNumber}` : ""}`;

  const itemsHtml = items.map(item =>
    `<tr>
      <td style="padding:10px 15px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;">${escapeHtml(item.label)}</td>
      <td style="padding:10px 15px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;text-align:right;">${(item.price / 100).toFixed(2).replace(".", ",")} €</td>
    </tr>`
  ).join("");

  const html = emailLayout(`
    <h2 style="color:#1F2937;margin:0 0 20px;font-size:22px;">Merci pour votre achat, ${escapeHtml(firstName)} !</h2>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Votre paiement a été confirmé avec succès. Voici le récapitulatif de votre commande :
    </p>
    ${invoiceNumber ? `<p style="color:#6B7280;font-size:13px;">Facture n° <strong>${invoiceNumber}</strong></p>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#F9FAFB;">
        <th style="padding:12px 15px;text-align:left;color:#6B7280;font-size:13px;font-weight:600;">Article</th>
        <th style="padding:12px 15px;text-align:right;color:#6B7280;font-size:13px;font-weight:600;">Prix</th>
      </tr>
      ${itemsHtml}
      <tr style="background-color:#F3F4F6;">
        <td style="padding:12px 15px;color:#1F2937;font-weight:700;font-size:15px;">Total</td>
        <td style="padding:12px 15px;color:#4F46E5;font-weight:700;font-size:15px;text-align:right;">${formattedTotal}</td>
      </tr>
    </table>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Vos modules sont désormais activés et prêts à l'emploi. Vous pouvez consulter vos factures
      dans votre espace personnel.
    </p>
    ${ctaButton("Accéder à mes modules", appUrl)}
    <p style="color:#6B7280;font-size:13px;line-height:1.6;">
      Votre facture est disponible dans la section Facturation de votre compte.
      Pour toute question, contactez-nous à <a href="mailto:contact@academik.fr" style="color:#4F46E5;">contact@academik.fr</a>.
    </p>
  `);

  return sendEmail(email, subject, html);
}

export async function sendInvoiceEmail(
  email: string,
  firstName: string,
  invoiceNumber: string,
  items: Array<{ label: string; price: number }>,
  totalAmount: number
): Promise<boolean> {
  const appUrl = await getAppUrl();
  const formattedTotal = (totalAmount / 100).toFixed(2).replace(".", ",") + " €";
  const subject = `Academik – Facture #${invoiceNumber}`;

  const itemsHtml = items.map(item =>
    `<tr>
      <td style="padding:8px 15px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;">${escapeHtml(item.label)}</td>
      <td style="padding:8px 15px;border-bottom:1px solid #E5E7EB;color:#374151;font-size:14px;text-align:right;">${(item.price / 100).toFixed(2).replace(".", ",")} €</td>
    </tr>`
  ).join("");

  const html = emailLayout(`
    <h2 style="color:#1F2937;margin:0 0 20px;font-size:22px;">Votre facture Academik</h2>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Bonjour ${escapeHtml(firstName)}, veuillez trouver ci-dessous le détail de votre facture.
    </p>
    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 5px;color:#6B7280;font-size:13px;">Facture n°</p>
      <p style="margin:0;color:#1F2937;font-size:18px;font-weight:700;">${invoiceNumber}</p>
      <p style="margin:10px 0 0;color:#6B7280;font-size:13px;">Date : ${new Date().toLocaleDateString("fr-FR")}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#F9FAFB;">
        <th style="padding:10px 15px;text-align:left;color:#6B7280;font-size:13px;font-weight:600;">Désignation</th>
        <th style="padding:10px 15px;text-align:right;color:#6B7280;font-size:13px;font-weight:600;">Montant TTC</th>
      </tr>
      ${itemsHtml}
      <tr style="background-color:#F3F4F6;">
        <td style="padding:10px 15px;color:#1F2937;font-weight:700;">Total TTC</td>
        <td style="padding:10px 15px;color:#4F46E5;font-weight:700;text-align:right;">${formattedTotal}</td>
      </tr>
    </table>
    <p style="color:#6B7280;font-size:12px;line-height:1.6;">
      TVA non applicable, art. 293 B du CGI.
    </p>
    ${ctaButton("Voir mes factures", `${appUrl}/billing`)}
  `);

  return sendEmail(email, subject, html);
}

export async function sendAbandonedCartEmail(
  email: string,
  firstName: string,
  items: Array<{ label: string; price: number }>
): Promise<boolean> {
  const appUrl = await getAppUrl();
  const total = items.reduce((s, i) => s + i.price, 0);
  const formattedTotal = (total / 100).toFixed(2).replace(".", ",") + " €";
  const subject = "Academik – Votre panier vous attend !";

  const itemsHtml = items.map(item =>
    `<li style="padding:5px 0;color:#374151;font-size:14px;">${escapeHtml(item.label)} – <strong>${(item.price / 100).toFixed(2).replace(".", ",")} €</strong></li>`
  ).join("");

  const html = emailLayout(`
    <h2 style="color:#1F2937;margin:0 0 20px;font-size:22px;">Vous n'avez pas finalisé votre achat</h2>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Bonjour ${escapeHtml(firstName)}, vous avez commencé une commande sur Academik mais ne l'avez pas finalisée.
      Vos modules sélectionnés vous attendent :
    </p>
    <div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0;">
      <ul style="margin:0;padding-left:20px;list-style:disc;">
        ${itemsHtml}
      </ul>
      <p style="margin:15px 0 0;color:#1F2937;font-weight:700;font-size:16px;">Total : ${formattedTotal}</p>
    </div>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Finalisez votre achat pour débloquer immédiatement vos modules et avancer dans votre rédaction académique.
    </p>
    ${ctaButton("Finaliser ma commande", `${appUrl}/billing`)}
    <p style="color:#6B7280;font-size:13px;line-height:1.6;">
      Si vous rencontrez un problème lors du paiement, n'hésitez pas à nous contacter à
      <a href="mailto:contact@academik.fr" style="color:#4F46E5;">contact@academik.fr</a>.
    </p>
  `);

  return sendEmail(email, subject, html);
}

export async function sendQuotaLowEmail(
  email: string,
  firstName: string,
  quotaType: string,
  used: number,
  limit: number
): Promise<boolean> {
  const appUrl = await getAppUrl();
  const percentage = Math.round((used / limit) * 100);
  const typeLabel = quotaType === "words" ? "mots" : "actions IA";
  const subject = `Academik – Votre quota de ${typeLabel} est presque atteint`;

  const html = emailLayout(`
    <h2 style="color:#1F2937;margin:0 0 20px;font-size:22px;">Quota presque atteint</h2>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Bonjour ${escapeHtml(firstName)}, vous avez utilisé <strong>${percentage}%</strong> de votre quota de ${typeLabel}.
    </p>
    <div style="background-color:#FEF3C7;border-left:4px solid #F59E0B;padding:15px 20px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="color:#92400E;margin:0;font-size:14px;">
        <strong>${used.toLocaleString("fr-FR")} / ${limit.toLocaleString("fr-FR")} ${typeLabel}</strong> utilisé(e)s
      </p>
    </div>
    <p style="color:#374151;line-height:1.7;font-size:15px;">
      Pour continuer à générer du contenu sans interruption, vous pouvez acheter des ${typeLabel} supplémentaires
      depuis votre espace facturation.
    </p>
    ${ctaButton("Acheter des ${typeLabel}", `${appUrl}/billing`)}
  `);

  return sendEmail(email, subject, html);
}

export async function trackAbandonedCheckout(
  userId: string,
  items: Array<{ key: string; label: string; price: number }>,
  totalAmount: number,
  stripeSessionId?: string
): Promise<void> {
  try {
    const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const p = profile[0];

    await db.insert(abandonedCheckouts).values({
      userId,
      userEmail: p?.email || undefined,
      userName: p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : undefined,
      items: items as any,
      totalAmount,
      stripeSessionId: stripeSessionId || undefined,
      emailSent: false,
      recovered: false,
    });

    console.log(`[CART] Tracked abandoned checkout for user ${userId}, amount: ${(totalAmount / 100).toFixed(2)} €`);
  } catch (err) {
    console.error("[CART] Error tracking abandoned checkout:", err);
  }
}

export async function markCheckoutRecovered(userId: string, itemKeys: string[], stripeSessionId?: string): Promise<void> {
  try {
    if (stripeSessionId) {
      await db.update(abandonedCheckouts)
        .set({ recovered: true, recoveredAt: new Date() })
        .where(and(
          eq(abandonedCheckouts.stripeSessionId, stripeSessionId),
          eq(abandonedCheckouts.recovered, false)
        ));
    }

    const pending = await db.select()
      .from(abandonedCheckouts)
      .where(and(
        eq(abandonedCheckouts.userId, userId),
        eq(abandonedCheckouts.recovered, false)
      ));

    for (const checkout of pending) {
      const checkoutItems = (checkout.items as any[]) || [];
      const checkoutKeys = checkoutItems.map((i: any) => i.key);
      const hasOverlap = itemKeys.some(k => checkoutKeys.includes(k));

      if (hasOverlap) {
        await db.update(abandonedCheckouts)
          .set({ recovered: true, recoveredAt: new Date() })
          .where(eq(abandonedCheckouts.id, checkout.id));
      }
    }
  } catch (err) {
    console.error("[CART] Error marking checkout recovered:", err);
  }
}

export async function processAbandonedCheckouts(): Promise<{ processed: number; sent: number; errors: number }> {
  let processed = 0, sent = 0, errors = 0;

  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const pending = await db.select()
      .from(abandonedCheckouts)
      .where(and(
        eq(abandonedCheckouts.emailSent, false),
        eq(abandonedCheckouts.recovered, false),
        lte(abandonedCheckouts.createdAt, oneHourAgo)
      ));

    for (const checkout of pending) {
      processed++;

      if (!checkout.userEmail) {
        const profile = await db.select().from(profiles).where(eq(profiles.userId, checkout.userId)).limit(1);
        if (profile[0]?.email) {
          checkout.userEmail = profile[0].email;
          checkout.userName = `${profile[0].firstName || ""} ${profile[0].lastName || ""}`.trim();
        }
      }

      if (!checkout.userEmail) {
        console.warn(`[CART] No email for user ${checkout.userId}, skipping abandoned cart email`);
        errors++;
        continue;
      }

      const items = (checkout.items as any[]) || [];
      const success = await sendAbandonedCartEmail(
        checkout.userEmail,
        (checkout.userName || "").split(" ")[0] || "Client",
        items
      );

      await db.update(abandonedCheckouts)
        .set({
          emailSent: true,
          emailSentAt: new Date(),
        })
        .where(eq(abandonedCheckouts.id, checkout.id));

      if (success) {
        sent++;
      } else {
        errors++;
      }
    }
  } catch (err) {
    console.error("[CART] Error processing abandoned checkouts:", err);
  }

  return { processed, sent, errors };
}

let abandonedCartInterval: NodeJS.Timeout | null = null;
let cartSchedulerStarted = false;

export function startAbandonedCartScheduler(): void {
  if (cartSchedulerStarted) {
    console.log("[CART] Abandoned cart scheduler already running");
    return;
  }
  cartSchedulerStarted = true;
  console.log("[CART] Starting abandoned cart scheduler (checks every 30 min)");

  abandonedCartInterval = setInterval(async () => {
    try {
      const result = await processAbandonedCheckouts();
      if (result.processed > 0) {
        console.log(`[CART] Processed: ${result.processed}, Sent: ${result.sent}, Errors: ${result.errors}`);
      }
    } catch (err) {
      console.error("[CART] Scheduler error:", err);
    }
  }, 30 * 60 * 1000);

  setTimeout(async () => {
    try {
      await processAbandonedCheckouts();
    } catch (err) {
      console.error("[CART] Initial run error:", err);
    }
  }, 15000);
}
