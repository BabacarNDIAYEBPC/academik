import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === CREDITS ===
export const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  credits: integer("credits").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === CREDIT TRANSACTIONS ===
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull(), // positive = added, negative = spent
  type: text("type").notNull(), // 'purchase', 'spend', 'bonus'
  description: text("description"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BIBLIOGRAPHIES ===
export const bibliographies = pgTable("bibliographies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  query: text("query"), // search query used
  norm: text("norm").notNull().default("APA"),
  content: text("content"), // generated bibliography text
  sources: jsonb("sources"), // array of source objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === READING CARDS (Fiches de lecture) ===
export const readingCards = pgTable("reading_cards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  bibliographyId: integer("bibliography_id"), // optional link to a bibliography
  title: text("title").notNull(),
  authors: text("authors"),
  year: text("year"),
  source: text("source"), // journal, publisher etc.
  doi: text("doi"),
  pdfText: text("pdf_text"), // extracted text from PDF
  norm: text("norm").notNull().default("APA"),
  // Generated fields
  summary: text("summary"),
  keywords: text("keywords").array(),
  mainArgument: text("main_argument"),
  methodology: text("methodology"),
  keyQuotes: text("key_quotes").array(),
  criticalAnalysis: text("critical_analysis"),
  apaCitation: text("apa_citation"),
  status: text("status").notNull().default("draft"), // 'draft', 'complete'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SYNTHESES ===
export const syntheses = pgTable("syntheses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  cardIds: integer("card_ids").array().notNull(), // reading card IDs used
  theme: text("theme"), // synthesis theme/question
  content: text("content"), // generated synthesis
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === INVOICES ===
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  stripeSessionId: text("stripe_session_id"),
  amount: real("amount").notNull(),
  credits: integer("credits").notNull(),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === INSERT SCHEMAS ===
export const insertUserCreditsSchema = createInsertSchema(userCredits).omit({ id: true, updatedAt: true });
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({ id: true, createdAt: true });
export const insertBibliographySchema = createInsertSchema(bibliographies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReadingCardSchema = createInsertSchema(readingCards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSynthesisSchema = createInsertSchema(syntheses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

// === TYPES ===
export type UserCredits = typeof userCredits.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type Bibliography = typeof bibliographies.$inferSelect;
export type ReadingCard = typeof readingCards.$inferSelect;
export type Synthesis = typeof syntheses.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;

export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type InsertBibliography = z.infer<typeof insertBibliographySchema>;
export type InsertReadingCard = z.infer<typeof insertReadingCardSchema>;
export type InsertSynthesis = z.infer<typeof insertSynthesisSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

// Credit costs
export const CREDIT_COSTS = {
  SEARCH_ARTICLES: 1,
  GENERATE_READING_CARD: 2,
  GENERATE_SYNTHESIS: 3,
  GENERATE_BIBLIOGRAPHY: 1,
} as const;

// Credit packs
export const CREDIT_PACKS = [
  { id: "pack_10", credits: 10, price: 4.99, label: "Starter" },
  { id: "pack_30", credits: 30, price: 11.99, label: "Essentiel" },
  { id: "pack_100", credits: 100, price: 29.99, label: "Pro" },
] as const;
