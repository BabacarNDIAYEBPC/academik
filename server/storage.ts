import { db } from "./db";
import {
  userCredits, creditTransactions, bibliographies, readingCards, syntheses, invoices,
  type UserCredits, type CreditTransaction, type Bibliography, type ReadingCard, type Synthesis, type Invoice,
  type InsertBibliography, type InsertReadingCard, type InsertSynthesis, type InsertInvoice,
} from "@shared/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // Credits
  getCredits(userId: string): Promise<number>;
  addCredits(userId: string, amount: number, type: string, description: string, stripeSessionId?: string): Promise<void>;
  spendCredits(userId: string, amount: number, description: string): Promise<boolean>;
  getCreditTransactions(userId: string): Promise<CreditTransaction[]>;

  // Bibliographies
  getBibliographies(userId: string): Promise<Bibliography[]>;
  getBibliography(id: number): Promise<Bibliography | undefined>;
  createBibliography(data: InsertBibliography): Promise<Bibliography>;
  updateBibliography(id: number, data: Partial<InsertBibliography>): Promise<Bibliography>;
  deleteBibliography(id: number): Promise<void>;

  // Reading Cards
  getReadingCards(userId: string): Promise<ReadingCard[]>;
  getReadingCard(id: number): Promise<ReadingCard | undefined>;
  createReadingCard(data: InsertReadingCard): Promise<ReadingCard>;
  updateReadingCard(id: number, data: Partial<InsertReadingCard>): Promise<ReadingCard>;
  deleteReadingCard(id: number): Promise<void>;

  // Syntheses
  getSyntheses(userId: string): Promise<Synthesis[]>;
  getSynthesis(id: number): Promise<Synthesis | undefined>;
  createSynthesis(data: InsertSynthesis): Promise<Synthesis>;
  updateSynthesis(id: number, data: Partial<InsertSynthesis>): Promise<Synthesis>;
  deleteSynthesis(id: number): Promise<void>;

  // Invoices
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  getInvoices(userId: string): Promise<Invoice[]>;
  getInvoiceBySession(sessionId: string): Promise<Invoice | undefined>;
}

class DatabaseStorage implements IStorage {
  async getCredits(userId: string): Promise<number> {
    const [row] = await db.select().from(userCredits).where(eq(userCredits.userId, userId));
    return row?.credits ?? 0;
  }

  async addCredits(userId: string, amount: number, type: string, description: string, stripeSessionId?: string): Promise<void> {
    const existing = await db.select().from(userCredits).where(eq(userCredits.userId, userId));
    if (existing.length === 0) {
      await db.insert(userCredits).values({ userId, credits: amount });
    } else {
      await db.update(userCredits)
        .set({ credits: existing[0].credits + amount, updatedAt: new Date() })
        .where(eq(userCredits.userId, userId));
    }
    await db.insert(creditTransactions).values({ userId, amount, type, description, stripeSessionId });
  }

  async spendCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const current = await this.getCredits(userId);
    if (current < amount) return false;
    await db.update(userCredits)
      .set({ credits: current - amount, updatedAt: new Date() })
      .where(eq(userCredits.userId, userId));
    await db.insert(creditTransactions).values({ userId, amount: -amount, type: "spend", description });
    return true;
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt));
  }

  async getBibliographies(userId: string): Promise<Bibliography[]> {
    return db.select().from(bibliographies).where(eq(bibliographies.userId, userId)).orderBy(desc(bibliographies.createdAt));
  }

  async getBibliography(id: number): Promise<Bibliography | undefined> {
    const [row] = await db.select().from(bibliographies).where(eq(bibliographies.id, id));
    return row;
  }

  async createBibliography(data: InsertBibliography): Promise<Bibliography> {
    const [row] = await db.insert(bibliographies).values(data).returning();
    return row;
  }

  async updateBibliography(id: number, data: Partial<InsertBibliography>): Promise<Bibliography> {
    const [row] = await db.update(bibliographies).set({ ...data, updatedAt: new Date() }).where(eq(bibliographies.id, id)).returning();
    return row;
  }

  async deleteBibliography(id: number): Promise<void> {
    await db.delete(bibliographies).where(eq(bibliographies.id, id));
  }

  async getReadingCards(userId: string): Promise<ReadingCard[]> {
    return db.select().from(readingCards).where(eq(readingCards.userId, userId)).orderBy(desc(readingCards.createdAt));
  }

  async getReadingCard(id: number): Promise<ReadingCard | undefined> {
    const [row] = await db.select().from(readingCards).where(eq(readingCards.id, id));
    return row;
  }

  async createReadingCard(data: InsertReadingCard): Promise<ReadingCard> {
    const [row] = await db.insert(readingCards).values(data).returning();
    return row;
  }

  async updateReadingCard(id: number, data: Partial<InsertReadingCard>): Promise<ReadingCard> {
    const [row] = await db.update(readingCards).set({ ...data, updatedAt: new Date() }).where(eq(readingCards.id, id)).returning();
    return row;
  }

  async deleteReadingCard(id: number): Promise<void> {
    await db.delete(readingCards).where(eq(readingCards.id, id));
  }

  async getSyntheses(userId: string): Promise<Synthesis[]> {
    return db.select().from(syntheses).where(eq(syntheses.userId, userId)).orderBy(desc(syntheses.createdAt));
  }

  async getSynthesis(id: number): Promise<Synthesis | undefined> {
    const [row] = await db.select().from(syntheses).where(eq(syntheses.id, id));
    return row;
  }

  async createSynthesis(data: InsertSynthesis): Promise<Synthesis> {
    const [row] = await db.insert(syntheses).values(data).returning();
    return row;
  }

  async updateSynthesis(id: number, data: Partial<InsertSynthesis>): Promise<Synthesis> {
    const [row] = await db.update(syntheses).set({ ...data, updatedAt: new Date() }).where(eq(syntheses.id, id)).returning();
    return row;
  }

  async deleteSynthesis(id: number): Promise<void> {
    await db.delete(syntheses).where(eq(syntheses.id, id));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [row] = await db.insert(invoices).values(data).returning();
    return row;
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async getInvoiceBySession(sessionId: string): Promise<Invoice | undefined> {
    const [row] = await db.select().from(invoices).where(eq(invoices.stripeSessionId, sessionId));
    return row;
  }
}

export const storage = new DatabaseStorage();
