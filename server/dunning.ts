import { storage } from "./storage";
import { db } from "./db";
import { paymentReminders, dunningEmailLogs, profiles, userQuotas } from "@shared/schema";
import { eq, and, lte, isNull, or } from "drizzle-orm";

const DUNNING_STAGES = [
  { stage: "24h", delayMs: 24 * 60 * 60 * 1000, label: "24 heures" },
  { stage: "72h", delayMs: 72 * 60 * 60 * 1000, label: "72 heures" },
  { stage: "7d", delayMs: 7 * 24 * 60 * 60 * 1000, label: "7 jours" },
  { stage: "14d", delayMs: 14 * 24 * 60 * 60 * 1000, label: "14 jours" },
  { stage: "30d", delayMs: 30 * 24 * 60 * 60 * 1000, label: "1 mois" },
] as const;

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function getDunningEmailContent(stage: string, name: string, amount: number): { subject: string; html: string } {
  const formattedAmount = formatAmount(amount);
  const firstName = name.split(" ")[0] || "Client";

  switch (stage) {
    case "24h":
      return {
        subject: "Academik – Paiement en attente",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Academik</h1>
              <p style="color: #6B7280; margin: 5px 0;">De A à Z dans la rédaction académique</p>
            </div>
            <h2 style="color: #1F2937;">Bonjour ${firstName},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Nous vous informons que votre paiement de <strong>${formattedAmount}</strong> n'a pas pu être traité.
              Cela peut être dû à un problème temporaire avec votre moyen de paiement.
            </p>
            <p style="color: #374151; line-height: 1.6;">
              Pour continuer à profiter de vos fonctionnalités Academik, nous vous invitons à mettre à jour
              vos informations de paiement ou à réessayer.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{APP_URL}}/billing" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Mettre à jour mon paiement
              </a>
            </div>
            <p style="color: #6B7280; font-size: 13px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.<br>
              L'équipe Academik
            </p>
          </div>
        `,
      };

    case "72h":
      return {
        subject: "Academik – Rappel : votre paiement est toujours en attente",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Academik</h1>
            </div>
            <h2 style="color: #1F2937;">Bonjour ${firstName},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Nous souhaitons vous rappeler que votre paiement de <strong>${formattedAmount}</strong> est toujours
              en attente depuis 3 jours. Votre accès aux fonctionnalités premium pourrait être affecté.
            </p>
            <p style="color: #374151; line-height: 1.6;">
              Nous comprenons que des imprévus peuvent survenir. Si vous rencontrez des difficultés,
              notre équipe est à votre disposition pour vous aider.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{APP_URL}}/billing" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Régulariser mon paiement
              </a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px;">
              Performance Consulting Groupe SAS – SIREN 913 540 944
            </p>
          </div>
        `,
      };

    case "7d":
      return {
        subject: "Academik – Action requise : paiement en retard de 7 jours",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Academik</h1>
            </div>
            <h2 style="color: #1F2937;">Bonjour ${firstName},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Votre paiement de <strong>${formattedAmount}</strong> est en retard depuis <strong>7 jours</strong>.
            </p>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400E; margin: 0; font-weight: bold;">
                Attention : Sans régularisation, vos fonctionnalités premium seront suspendues.
              </p>
            </div>
            <p style="color: #374151; line-height: 1.6;">
              Nous vous invitons à régulariser votre situation dans les plus brefs délais pour éviter
              toute interruption de service. Votre travail académique en cours pourrait être impacté.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{APP_URL}}/billing" style="background-color: #DC2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Régulariser maintenant
              </a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px;">
              Performance Consulting Groupe SAS – SIREN 913 540 944<br>
              3 Avenue de Toulouse, 66140 Canet-en-Roussillon
            </p>
          </div>
        `,
      };

    case "14d":
      return {
        subject: "Academik – Dernier rappel avant suspension de compte",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Academik</h1>
            </div>
            <h2 style="color: #1F2937;">Bonjour ${firstName},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Malgré nos précédents rappels, votre paiement de <strong>${formattedAmount}</strong> reste
              impayé depuis <strong>14 jours</strong>.
            </p>
            <div style="background-color: #FEE2E2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991B1B; margin: 0; font-weight: bold;">
                Dernier avertissement : Votre compte sera suspendu sous 48 heures si le paiement
                n'est pas régularisé.
              </p>
            </div>
            <p style="color: #374151; line-height: 1.6;">
              La suspension entraînera la désactivation de vos modules premium et l'impossibilité
              de générer du nouveau contenu. Vos données resteront sauvegardées.
            </p>
            <p style="color: #374151; line-height: 1.6;">
              Si vous rencontrez des difficultés financières, contactez-nous pour trouver une solution ensemble.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{APP_URL}}/billing" style="background-color: #DC2626; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Régulariser mon paiement
              </a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px;">
              Performance Consulting Groupe SAS – SIREN 913 540 944<br>
              3 Avenue de Toulouse, 66140 Canet-en-Roussillon
            </p>
          </div>
        `,
      };

    case "30d":
      return {
        subject: "Academik – Compte suspendu pour impayé",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Academik</h1>
            </div>
            <h2 style="color: #1F2937;">Bonjour ${firstName},</h2>
            <p style="color: #374151; line-height: 1.6;">
              Votre paiement de <strong>${formattedAmount}</strong> est en retard depuis <strong>1 mois</strong>.
              Votre compte a été suspendu conformément à nos conditions d'utilisation.
            </p>
            <div style="background-color: #F3F4F6; border: 1px solid #D1D5DB; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="color: #1F2937; margin-top: 0;">Ce que cela signifie :</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Vos modules premium sont désactivés</li>
                <li>La génération de contenu IA est bloquée</li>
                <li>Vos données et projets sont conservés pendant 90 jours</li>
              </ul>
            </div>
            <p style="color: #374151; line-height: 1.6;">
              Pour réactiver votre compte et retrouver l'accès à vos travaux, il vous suffit de
              régulariser votre paiement. Toutes vos données seront immédiatement restaurées.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{APP_URL}}/billing" style="background-color: #4F46E5; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Réactiver mon compte
              </a>
            </div>
            <p style="color: #6B7280; font-size: 13px;">
              Pour toute question, contactez-nous à l'adresse indiquée ci-dessous.
            </p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
            <p style="color: #9CA3AF; font-size: 11px; text-align: center;">
              Performance Consulting Groupe SAS<br>
              SIREN 913 540 944 – RCS Perpignan<br>
              3 Avenue de Toulouse, 66140 Canet-en-Roussillon<br>
              Capital social : 14 000 €
            </p>
          </div>
        `,
      };

    default:
      return {
        subject: "Academik – Paiement en attente",
        html: `<p>Bonjour ${firstName}, votre paiement de ${formattedAmount} est en attente.</p>`,
      };
  }
}

type DunningStageKey = typeof DUNNING_STAGES[number]["stage"];

function getNextStage(currentStage: string): string | null {
  const stageOrder: readonly string[] = DUNNING_STAGES.map(s => s.stage);
  const idx = stageOrder.indexOf(currentStage);
  if (idx < 0 || idx >= stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}

function getStageDelay(stage: string): number {
  const found = DUNNING_STAGES.find(s => s.stage === stage as any);
  return found?.delayMs || 24 * 60 * 60 * 1000;
}

async function getSenderEmail(): Promise<string> {
  const setting = await storage.getAdminSetting("dunning_sender_email");
  if (setting) {
    const cleaned = typeof setting === "string" ? setting.replace(/^"+|"+$/g, "").trim() : String(setting);
    if (cleaned && cleaned.includes("@")) return cleaned;
  }
  return "noreply@academik.fr";
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

async function sendEmail(to: string, subject: string, html: string, from: string): Promise<boolean> {
  try {
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (sendgridKey) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from, name: "Academik" },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });
      return response.ok || response.status === 202;
    }

    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Academik <${from}>`,
          to: [to],
          subject,
          html,
        }),
      });
      return response.ok;
    }

    console.log(`[DUNNING] Email simulation (no provider configured):`);
    console.log(`  To: ${to}`);
    console.log(`  From: ${from}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Stage sent successfully (simulated)`);
    return true;
  } catch (err) {
    console.error("[DUNNING] Email send error:", err);
    return false;
  }
}

export async function createPaymentReminder(data: {
  userId: string;
  type: string;
  amount: number;
  recipientEmail?: string;
  recipientName?: string;
  failureReason?: string;
  relatedPurchaseId?: number;
}): Promise<void> {
  const now = new Date();
  const nextReminder = new Date(now.getTime() + getStageDelay("24h"));

  await db.insert(paymentReminders).values({
    userId: data.userId,
    type: data.type,
    relatedPurchaseId: data.relatedPurchaseId,
    stage: "pending",
    reminderCount: 0,
    nextReminderAt: nextReminder,
    recipientEmail: data.recipientEmail,
    recipientName: data.recipientName,
    amount: data.amount,
    currency: "eur",
    failureReason: data.failureReason,
    resolved: false,
  });

  console.log(`[DUNNING] Created payment reminder for user ${data.userId}, amount: ${formatAmount(data.amount)}`);
}

export async function resolvePaymentReminder(userId: string, type?: string): Promise<void> {
  const conditions = [eq(paymentReminders.userId, userId), eq(paymentReminders.resolved, false)];
  if (type) conditions.push(eq(paymentReminders.type, type));

  await db.update(paymentReminders)
    .set({ resolved: true, resolvedAt: new Date(), updatedAt: new Date() })
    .where(and(...conditions));

  console.log(`[DUNNING] Resolved payment reminders for user ${userId}`);
}

export async function processDunningQueue(): Promise<{ processed: number; sent: number; errors: number }> {
  const now = new Date();
  let processed = 0, sent = 0, errors = 0;

  const pendingReminders = await db.select()
    .from(paymentReminders)
    .where(
      and(
        eq(paymentReminders.resolved, false),
        lte(paymentReminders.nextReminderAt, now)
      )
    );

  const senderEmail = await getSenderEmail();
  const appUrl = await getAppUrl();

  for (const reminder of pendingReminders) {
    processed++;

    const nextStage = reminder.stage === "pending"
      ? "24h"
      : getNextStage(reminder.stage);

    if (!nextStage) {
      await db.update(paymentReminders)
        .set({ resolved: true, resolvedAt: now, updatedAt: now, stage: "exhausted" })
        .where(eq(paymentReminders.id, reminder.id));
      continue;
    }

    const recipientEmail = reminder.recipientEmail;
    if (!recipientEmail) {
      const profile = await db.select().from(profiles).where(eq(profiles.userId, reminder.userId)).limit(1);
      if (profile.length && profile[0].email) {
        await db.update(paymentReminders)
          .set({ recipientEmail: profile[0].email })
          .where(eq(paymentReminders.id, reminder.id));
      }
    }

    const email = recipientEmail || (await db.select().from(profiles).where(eq(profiles.userId, reminder.userId)).limit(1))?.[0]?.email;
    if (!email) {
      console.warn(`[DUNNING] No email for user ${reminder.userId}, skipping`);
      errors++;
      continue;
    }

    const emailContent = getDunningEmailContent(nextStage, reminder.recipientName || "Client", reminder.amount);
    const html = emailContent.html.replace(/\{\{APP_URL\}\}/g, appUrl);

    const success = await sendEmail(email, emailContent.subject, html, senderEmail);

    const nextStageAfter = getNextStage(nextStage);
    const nextReminderAt = nextStageAfter
      ? new Date(now.getTime() + (getStageDelay(nextStageAfter) - getStageDelay(nextStage)))
      : null;

    await db.update(paymentReminders)
      .set({
        stage: nextStage,
        lastReminderSentAt: now,
        reminderCount: reminder.reminderCount + 1,
        nextReminderAt: nextReminderAt,
        updatedAt: now,
      })
      .where(eq(paymentReminders.id, reminder.id));

    await db.insert(dunningEmailLogs).values({
      reminderId: reminder.id,
      userId: reminder.userId,
      stage: nextStage,
      emailTo: email,
      emailSubject: emailContent.subject,
      status: success ? "sent" : "failed",
      errorMessage: success ? undefined : "Email delivery failed",
    });

    if (success) {
      sent++;
      console.log(`[DUNNING] Sent ${nextStage} reminder to ${email} for user ${reminder.userId}`);
    } else {
      errors++;
      console.error(`[DUNNING] Failed to send ${nextStage} reminder to ${email}`);
    }
  }

  return { processed, sent, errors };
}

export async function attemptAutoDebit(): Promise<{ attempted: number; success: number; failed: number }> {
  let attempted = 0, success = 0, failed = 0;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const expiringQuotas = await db.select()
    .from(userQuotas)
    .where(lte(userQuotas.periodEnd, tomorrow));

  for (const quota of expiringQuotas) {
    if (!quota.userId) continue;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || !stripeSecretKey.startsWith("sk_")) {
      console.log(`[AUTO-DEBIT] No valid Stripe key, skipping auto-debit for user ${quota.userId}`);
      continue;
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const customers = await stripe.customers.search({
        query: `metadata['userId']:'${quota.userId}'`,
        limit: 1,
      });

      if (!customers.data.length) {
        console.log(`[AUTO-DEBIT] No Stripe customer for user ${quota.userId}`);
        continue;
      }

      const customer = customers.data[0];
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: "card",
      });

      if (!paymentMethods.data.length) {
        console.log(`[AUTO-DEBIT] No payment method for user ${quota.userId}`);
        const profile = await db.select().from(profiles).where(eq(profiles.userId, quota.userId)).limit(1);
        await createPaymentReminder({
          userId: quota.userId,
          type: "renewal",
          amount: 17900,
          recipientEmail: profile[0]?.email || undefined,
          recipientName: profile[0] ? `${profile[0].firstName || ""} ${profile[0].lastName || ""}`.trim() : undefined,
          failureReason: "No payment method on file",
        });
        failed++;
        continue;
      }

      attempted++;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 17900,
        currency: "eur",
        customer: customer.id,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true,
        metadata: { userId: quota.userId, type: "auto_renewal" },
      });

      if (paymentIntent.status === "succeeded") {
        const newEnd = new Date(quota.periodEnd || new Date());
        newEnd.setMonth(newEnd.getMonth() + 1);
        await db.update(userQuotas)
          .set({
            periodStart: quota.periodEnd,
            periodEnd: newEnd,
            wordsUsed: 0,
            actionsUsed: 0,
            updatedAt: new Date(),
          })
          .where(eq(userQuotas.id, quota.id));

        await resolvePaymentReminder(quota.userId, "renewal");
        success++;
        console.log(`[AUTO-DEBIT] Successfully renewed subscription for user ${quota.userId}`);
      } else {
        const profile = await db.select().from(profiles).where(eq(profiles.userId, quota.userId)).limit(1);
        await createPaymentReminder({
          userId: quota.userId,
          type: "renewal",
          amount: 17900,
          recipientEmail: profile[0]?.email || undefined,
          recipientName: profile[0] ? `${profile[0].firstName || ""} ${profile[0].lastName || ""}`.trim() : undefined,
          failureReason: `Payment intent status: ${paymentIntent.status}`,
        });
        failed++;
      }
    } catch (err: any) {
      console.error(`[AUTO-DEBIT] Error for user ${quota.userId}:`, err.message);

      const profile = await db.select().from(profiles).where(eq(profiles.userId, quota.userId)).limit(1);
      await createPaymentReminder({
        userId: quota.userId,
        type: "renewal",
        amount: 17900,
        recipientEmail: profile[0]?.email || undefined,
        recipientName: profile[0] ? `${profile[0].firstName || ""} ${profile[0].lastName || ""}`.trim() : undefined,
        failureReason: err.message || "Payment processing error",
      });
      failed++;
    }
  }

  return { attempted, success, failed };
}

let dunningInterval: NodeJS.Timeout | null = null;
let autoDebitInterval: NodeJS.Timeout | null = null;
let schedulerStarted = false;

export function startDunningScheduler(): void {
  if (schedulerStarted) {
    console.log("[DUNNING] Scheduler already running, skipping duplicate start");
    return;
  }
  schedulerStarted = true;
  console.log("[DUNNING] Starting dunning scheduler (checks every 1 hour)");

  dunningInterval = setInterval(async () => {
    try {
      const result = await processDunningQueue();
      if (result.processed > 0) {
        console.log(`[DUNNING] Processed: ${result.processed}, Sent: ${result.sent}, Errors: ${result.errors}`);
      }
    } catch (err) {
      console.error("[DUNNING] Scheduler error:", err);
    }
  }, 60 * 60 * 1000);

  console.log("[AUTO-DEBIT] Starting auto-debit scheduler (checks every 6 hours)");

  autoDebitInterval = setInterval(async () => {
    try {
      const result = await attemptAutoDebit();
      if (result.attempted > 0) {
        console.log(`[AUTO-DEBIT] Attempted: ${result.attempted}, Success: ${result.success}, Failed: ${result.failed}`);
      }
    } catch (err) {
      console.error("[AUTO-DEBIT] Scheduler error:", err);
    }
  }, 6 * 60 * 60 * 1000);

  setTimeout(async () => {
    try {
      await processDunningQueue();
      await attemptAutoDebit();
    } catch (err) {
      console.error("[DUNNING] Initial run error:", err);
    }
  }, 10000);
}

export function stopDunningScheduler(): void {
  if (dunningInterval) clearInterval(dunningInterval);
  if (autoDebitInterval) clearInterval(autoDebitInterval);
  dunningInterval = null;
  autoDebitInterval = null;
  schedulerStarted = false;
}

export async function getDunningStats(): Promise<{
  activeReminders: number;
  totalSent: number;
  resolved: number;
  byStage: Record<string, number>;
}> {
  const allReminders = await db.select().from(paymentReminders);
  const active = allReminders.filter(r => !r.resolved);
  const resolved = allReminders.filter(r => r.resolved);

  const byStage: Record<string, number> = {};
  for (const r of active) {
    byStage[r.stage] = (byStage[r.stage] || 0) + 1;
  }

  const allLogs = await db.select().from(dunningEmailLogs);
  return {
    activeReminders: active.length,
    totalSent: allLogs.filter(l => l.status === "sent").length,
    resolved: resolved.length,
    byStage,
  };
}

export async function getPaymentReminders(limit = 50): Promise<any[]> {
  return db.select()
    .from(paymentReminders)
    .orderBy(paymentReminders.createdAt)
    .limit(limit);
}

export async function getDunningEmailHistory(reminderId: number): Promise<any[]> {
  return db.select()
    .from(dunningEmailLogs)
    .where(eq(dunningEmailLogs.reminderId, reminderId));
}
