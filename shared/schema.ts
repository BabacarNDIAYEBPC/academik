import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// === PROFILES ===
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  domain: text("domain"),
  domainOther: text("domain_other"),
  educationLevel: text("education_level"),
  educationTitle: text("education_title"),
  userProfileType: text("user_profile_type"),
  workDomain: text("work_domain"),
  workFunction: text("work_function"),
  structureType: text("structure_type"),
  openaiApiKey: text("openai_api_key"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === PROJECTS ===
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  language: text("language").notNull().default("Français"),
  status: text("status").notNull().default("active"),
  mainDomain: text("main_domain"),
  mainDomainOther: text("main_domain_other"),
  degreeLevel: text("degree_level"),
  degreeTitle: text("degree_title"),
  userProfile: text("user_profile"),
  workDomain: text("work_domain"),
  workFunction: text("work_function"),
  workStructure: text("work_structure"),
  finality: text("finality"),
  approach: text("approach"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === DOCUMENTS ===
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === AI GENERATIONS (legacy, kept for backward compat) ===
export const aiGenerations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === PROJECT SECTIONS (Modules 3-7 content with versioning) ===
export const projectSections = pgTable("project_sections", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  key: text("key").notNull(), // 'subject', 'problematic', 'hypotheses', 'plan', 'conceptual_framework', 'theoretical_framework', 'literature_review', 'methodology', 'situation_appel', 'vae_competencies'
  status: text("status").notNull().default("draft"), // 'draft', 'validated', 'to_review'
  activeVersionId: integer("active_version_id"), // FK to section_versions
  config: jsonb("config"), // Module-specific config (e.g. literature review filters)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === SECTION VERSIONS (history of each section) ===
export const sectionVersions = pgTable("section_versions", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(),
  versionNumber: integer("version_number").notNull().default(1),
  source: text("source").notNull().default("ai"), // 'ai', 'manual'
  mode: text("mode"), // 'initial', 'similar', 'different' (for AI regeneration)
  content: text("content").notNull(), // Markdown content
  contextSnapshot: text("context_snapshot"), // Snapshot of context used for this generation
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SECTION STATUS HISTORY ===
export const sectionStatusHistory = pgTable("section_status_history", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(),
  status: text("status").notNull(),
  changedAt: timestamp("changed_at").defaultNow(),
  note: text("note"),
});

// === USER PURCHASES / ENTITLEMENTS ===
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  itemType: text("item_type").notNull(), // 'base', 'section', 'option', 'pack'
  itemKey: text("item_key").notNull(), // 'foundation', 'plan', 'conceptual', 'literature', 'methodology', 'unlimitedRegen', etc.
  price: integer("price").notNull(), // price in cents
  currency: text("currency").notNull().default("eur"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").notNull().default("active"), // 'pending', 'active', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
});

// === USER QUOTAS ===
export const userQuotas = pgTable("user_quotas", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  wordsUsed: integer("words_used").notNull().default(0),
  wordsLimit: integer("words_limit").notNull().default(20000),
  actionsUsed: integer("actions_used").notNull().default(0),
  actionsLimit: integer("actions_limit").notNull().default(100),
  activeProjectsLimit: integer("active_projects_limit").notNull().default(3),
  documentsLimit: integer("documents_limit").notNull().default(20),
  periodStart: timestamp("period_start").defaultNow(),
  periodEnd: timestamp("period_end"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === QUOTA SURPLUS PURCHASES ===
export const quotaSurplus = pgTable("quota_surplus", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  surplusType: text("surplus_type").notNull(), // 'words', 'actions', 'projects'
  amount: integer("amount").notNull(), // quantity added
  price: integer("price").notNull(), // price in cents
  stripeSessionId: text("stripe_session_id"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ADMIN: PLANS ===
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  price: integer("price").notNull().default(0),
  duration: text("duration").notNull().default("monthly"),
  projectsLimit: integer("projects_limit").notNull().default(3),
  wordsLimit: integer("words_limit").notNull().default(20000),
  actionsLimit: integer("actions_limit").notNull().default(200),
  documentsLimit: integer("documents_limit").notNull().default(20),
  modulesEnabled: text("modules_enabled").array().notNull().default(sql`ARRAY[]::text[]`),
  marketingLabel: text("marketing_label"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === ADMIN: SETTINGS ===
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === ADMIN: AUDIT LOGS ===
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: varchar("actor_id"),
  actorEmail: text("actor_email"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === ADMIN: AI LOGS ===
export const aiLogs = pgTable("ai_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  endpoint: text("endpoint").notNull(),
  model: text("model"),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  durationMs: integer("duration_ms"),
  status: text("status").notNull().default("success"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SECTION STATUSES ===
export const SECTION_STATUSES = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  MODIFIED: 'modified',
  VALIDATED: 'validated',
  SENT_TUTOR: 'sent_tutor',
  AWAITING_CORRECTION: 'awaiting_correction',
  CORRECTED: 'corrected',
  FINAL: 'final_version',
  ARCHIVED: 'archived',
} as const;

export const SECTION_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  generated: "Généré par la plateforme",
  modified: "Modifié par l'utilisateur",
  validated: "Validé par l'utilisateur",
  sent_tutor: "Envoyé au tuteur",
  awaiting_correction: "En attente de correction",
  corrected: "Corrigé",
  final_version: "Version finale",
  archived: "Archivé",
};

// === SECTION KEY CONSTANTS ===
export const SECTION_KEYS = {
  SUBJECT: 'subject',
  PROBLEMATIC: 'problematic',
  HYPOTHESES: 'hypotheses',
  SITUATION_APPEL: 'situation_appel',
  VAE_COMPETENCIES: 'vae_competencies',
  PLAN: 'plan',
  CONCEPTUAL_FRAMEWORK: 'conceptual_framework',
  THEORETICAL_FRAMEWORK: 'theoretical_framework',
  LITERATURE_REVIEW: 'literature_review',
  METHODOLOGY: 'methodology',
} as const;

export const SECTION_ORDER = [
  'subject', 'problematic', 'hypotheses', 'situation_appel', 'vae_competencies',
  'plan', 'conceptual_framework', 'theoretical_framework',
  'literature_review', 'methodology',
];

export const SECTION_LABELS: Record<string, string> = {
  subject: "Sujet",
  problematic: "Problématique",
  hypotheses: "Hypothèses",
  situation_appel: "Situation d'appel",
  vae_competencies: "Blocs de compétences",
  plan: "Plan du travail",
  conceptual_framework: "Cadre conceptuel",
  theoretical_framework: "Cadre théorique",
  literature_review: "Revue de littérature",
  methodology: "Méthodologie",
};

// === SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, updatedAt: true, openaiApiKey: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertSectionSchema = createInsertSchema(projectSections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVersionSchema = createInsertSchema(sectionVersions).omit({ id: true, createdAt: true });
export const insertStatusHistorySchema = createInsertSchema(sectionStatusHistory).omit({ id: true, changedAt: true });
export const insertPurchaseSchema = createInsertSchema(userPurchases).omit({ id: true, createdAt: true });
export const insertQuotaSchema = createInsertSchema(userQuotas).omit({ id: true, updatedAt: true });
export const insertSurplusSchema = createInsertSchema(quotaSurplus).omit({ id: true, createdAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertAiLogSchema = createInsertSchema(aiLogs).omit({ id: true, createdAt: true });

// === TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type ProjectSection = typeof projectSections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type SectionVersion = typeof sectionVersions.$inferSelect;
export type InsertVersion = z.infer<typeof insertVersionSchema>;
export type StatusHistory = typeof sectionStatusHistory.$inferSelect;
export type UserPurchase = typeof userPurchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type UserQuota = typeof userQuotas.$inferSelect;
export type InsertQuota = z.infer<typeof insertQuotaSchema>;
export type QuotaSurplus = typeof quotaSurplus.$inferSelect;
export type InsertSurplus = z.infer<typeof insertSurplusSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AiLog = typeof aiLogs.$inferSelect;
export type InsertAiLog = z.infer<typeof insertAiLogSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

export type CreateProjectRequest = InsertProject;
export type UpdateProjectRequest = Partial<InsertProject>;
export type CreateProfileRequest = InsertProfile;
export type GenerateRequest = {
  projectId: number;
  type: 'subject' | 'problematic' | 'hypotheses' | 'analysis' | 'vae_competencies';
  context?: string;
};

export type SectionGenerateRequest = {
  projectId: number;
  sectionKey: string;
  mode: 'initial' | 'similar' | 'different';
  extraContext?: string;
  config?: Record<string, any>;
};
