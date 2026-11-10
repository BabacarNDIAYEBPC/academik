import { and, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { authUsers } from "../replit_integrations/auth/storage";
import { creditTransactions, userCredits } from "@workspace/db";
import { digest, purchaseKey, refundStateKey } from "./iapLedger";

export type RefundPolicy = "carry_debt" | "cap_zero";
export interface VerifiedRefund {
  id: string;
  timestamp: number;
  userId: string;
  store: string;
  transactionId: string;
  refunded: boolean;
}

/** Only call after authenticating and validating the RevenueCat notification. */
export async function applyVerifiedRefund(event: VerifiedRefund, policy: RefundPolicy) {
  const key = purchaseKey(event.store, event.transactionId);
  const stateKey = refundStateKey(key);
  const eventKey = `rc_event_${digest(event.id)}`;
  const [before] = await db.select().from(creditTransactions).where(eq(creditTransactions.stripeSessionId, key));
  const owner = before?.userId || event.userId;
  return db.transaction(async tx => {
    // Same lock order as purchase grants and all other balance mutations.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${"account:" + owner}))`);
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${key}))`);
    const [duplicate] = await tx.select().from(creditTransactions).where(eq(creditTransactions.stripeSessionId, eventKey));
    if (duplicate) return { duplicate: true, creditsChanged: 0 };
    const [grant] = await tx.select().from(creditTransactions).where(eq(creditTransactions.stripeSessionId, key));
    if (grant && grant.userId !== owner) throw new Error("Purchase owner changed; retry notification");
    const [state] = await tx.select().from(creditTransactions).where(eq(creditTransactions.stripeSessionId, stateKey));
    const stale = !!state && (state.createdAt?.getTime() || 0) >= event.timestamp;
    let delta = 0;
    let userExists = false;
    if (!stale) {
      if (/^[1-9]\d{0,9}$/.test(owner)) {
        const [user] = await tx.select({ id: authUsers.id }).from(authUsers).where(eq(authUsers.id, Number(owner)));
        userExists = !!user;
      }
      const previous = state ? JSON.parse(state.description || "{}") : { withheld: 0 };
      if (!Number.isSafeInteger(previous.withheld) || previous.withheld < 0) throw new Error("Invalid refund reconciliation state");
      let withheld = previous.withheld;
      if (event.refunded && state?.type !== "iap_state_refunded") {
        if (userExists && grant && grant.amount > 0) {
          const [balance] = await tx.select().from(userCredits).where(eq(userCredits.userId, owner));
          withheld = policy === "cap_zero" ? Math.min(grant.amount, Math.max(0, balance?.credits || 0)) : grant.amount;
          delta = -withheld;
        }
      } else if (!event.refunded && state?.type === "iap_state_refunded") {
        // A reversal only returns credits actually removed, never a fresh pack.
        if (userExists && grant) delta = withheld;
        withheld = 0;
      }
      if (delta) {
        await tx.insert(userCredits).values({ userId: owner, credits: delta }).onConflictDoUpdate({
          target: userCredits.userId,
          set: { credits: sql`${userCredits.credits} + ${delta}`, updatedAt: new Date() },
        });
      }
      const values = {
        userId: "__iap_state__", amount: 0,
        type: event.refunded ? "iap_state_refunded" : "iap_state_owned",
        description: JSON.stringify({ withheld }),
        stripeSessionId: stateKey, createdAt: new Date(event.timestamp),
      };
      if (state) await tx.update(creditTransactions).set(values).where(eq(creditTransactions.id, state.id));
      else await tx.insert(creditTransactions).values(values);
    }
    await tx.insert(creditTransactions).values({
      userId: delta && userExists ? owner : "__iap_event__",
      amount: delta, type: delta < 0 ? "iap_refund" : delta > 0 ? "iap_refund_reversal" : "iap_notification",
      description: delta < 0 ? "Remboursement du store : retrait des crédits" : delta > 0 ? "Annulation du remboursement : crédits rétablis" : null,
      stripeSessionId: eventKey,
    });
    return { duplicate: false, stale, creditsChanged: delta };
  });
}

export async function assertNotRefunded(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], key: string) {
  const [state] = await tx.select({ type: creditTransactions.type }).from(creditTransactions).where(
    and(eq(creditTransactions.stripeSessionId, refundStateKey(key)), eq(creditTransactions.type, "iap_state_refunded")),
  );
  return !state;
}
