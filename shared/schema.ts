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
  key: text("key").notNull(), // 'subject', 'problematic', 'hypotheses', 'plan', 'conceptual_framework', 'theoretical_framework', 'literature_review', 'methodology', 'situation_appel', 'vae_competencies', 'data_collection', 'interview_simulation', 'data_analysis'
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

// === INVOICES ===
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  purchaseId: integer("purchase_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull().default("paid"),
  items: jsonb("items").notNull(),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientAddress: text("client_address"),
  paymentMethod: text("payment_method"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// === PAYMENT REMINDERS (DUNNING) ===
export const paymentReminders = pgTable("payment_reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  relatedPurchaseId: integer("related_purchase_id"),
  stage: text("stage").notNull().default("pending"),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
  reminderCount: integer("reminder_count").notNull().default(0),
  nextReminderAt: timestamp("next_reminder_at"),
  recipientEmail: text("recipient_email"),
  recipientName: text("recipient_name"),
  amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("eur"),
  failureReason: text("failure_reason"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentReminderSchema = createInsertSchema(paymentReminders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;
export type PaymentReminder = typeof paymentReminders.$inferSelect;

// === DUNNING EMAIL LOG ===
export const dunningEmailLogs = pgTable("dunning_email_logs", {
  id: serial("id").primaryKey(),
  reminderId: integer("reminder_id").notNull(),
  userId: varchar("user_id").notNull(),
  stage: text("stage").notNull(),
  emailTo: text("email_to").notNull(),
  emailSubject: text("email_subject").notNull(),
  status: text("status").notNull().default("sent"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertDunningEmailLogSchema = createInsertSchema(dunningEmailLogs).omit({ id: true, sentAt: true });
export type InsertDunningEmailLog = z.infer<typeof insertDunningEmailLogSchema>;
export type DunningEmailLog = typeof dunningEmailLogs.$inferSelect;

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
  CONSTRUCTION_SUJET: 'construction_sujet',
  VAE_COMPETENCIES: 'vae_competencies',
  PLAN: 'plan',
  CONCEPTUAL_FRAMEWORK: 'conceptual_framework',
  THEORETICAL_FRAMEWORK: 'theoretical_framework',
  LITERATURE_REVIEW: 'literature_review',
  METHODOLOGY: 'methodology',
  QUESTIONNAIRE: 'questionnaire',
  GUIDE_ENTRETIEN: 'guide_entretien',
  INTERVIEW_SIMULATION: 'interview_simulation',
  DATA_ANALYSIS: 'data_analysis',
  ASSISTED_WRITING: 'assisted_writing',
  BIBLIOGRAPHY: 'bibliography',
  EXPORTS: 'exports',
  SOUTENANCE_PPT: 'soutenance_ppt',
  SOUTENANCE_SIMULATION: 'soutenance_simulation',
  MEMOIRE_AUDIT: 'memoire_audit',
  VAE_PRESENTATION: 'vae_presentation',
  VAE_PARCOURS: 'vae_parcours',
  VAE_MOTIVATION: 'vae_motivation',
  VAE_CARTOGRAPHIE: 'vae_cartographie',
  VAE_BLOC_DEMO: 'vae_bloc_demo',
  VAE_SYNTHESE: 'vae_synthese',
  RS_COVER_PAGE: 'rs_cover_page',
  RS_ACKNOWLEDGEMENTS: 'rs_acknowledgements',
  RS_INTRODUCTION: 'rs_introduction',
  RS_COMPANY: 'rs_company',
  RS_INTERNSHIP: 'rs_internship',
  RS_MISSIONS: 'rs_missions',
  RS_ANALYSIS: 'rs_analysis',
  RS_CONTRIBUTIONS: 'rs_contributions',
  RS_CONCLUSION: 'rs_conclusion',
} as const;

export const SECTION_ORDER = [
  'subject', 'problematic', 'hypotheses', 'situation_appel', 'construction_sujet', 'vae_competencies',
  'vae_presentation', 'vae_parcours', 'vae_motivation', 'vae_cartographie', 'vae_bloc_demo', 'vae_synthese',
  'rs_cover_page', 'rs_acknowledgements', 'rs_introduction', 'rs_company', 'rs_internship', 'rs_missions', 'rs_analysis', 'rs_contributions', 'rs_conclusion',
  'plan', 'conceptual_framework', 'theoretical_framework',
  'literature_review', 'methodology',
  'questionnaire', 'guide_entretien', 'interview_simulation', 'data_analysis',
  'assisted_writing', 'bibliography', 'exports',
  'soutenance_ppt', 'soutenance_simulation', 'memoire_audit',
];

export const SECTION_LABELS: Record<string, string> = {
  subject: "Sujet",
  problematic: "Problématique",
  hypotheses: "Hypothèses",
  situation_appel: "Situation d'appel",
  construction_sujet: "Construction du sujet",
  vae_competencies: "Blocs de compétences",
  plan: "Plan du travail",
  conceptual_framework: "Cadre conceptuel",
  theoretical_framework: "Cadre théorique",
  literature_review: "Revue de littérature",
  methodology: "Méthodologie",
  questionnaire: "Questionnaire",
  guide_entretien: "Guide d'entretien",
  interview_simulation: "Simulation d'entretien",
  data_analysis: "Analyse et visualisation des données",
  financial_simulation: "Simulation financière",
  questionnaire_analysis: "Dépouillement du questionnaire",
  assisted_writing: "Rédaction assistée",
  bibliography: "Bibliographie",
  exports: "Exports",
  soutenance_ppt: "PowerPoint de soutenance",
  soutenance_simulation: "Simulation de soutenance",
  memoire_audit: "Audit de mémoire",
  vae_presentation: "Présentation du candidat",
  vae_parcours: "Parcours & expériences",
  vae_motivation: "Motivation & projet",
  vae_cartographie: "Cartographie des compétences",
  vae_bloc_demo: "Démonstration par blocs",
  vae_synthese: "Synthèse & conclusion",
  mp_structure: "Présentation de la structure",
  mp_emergence: "Émergence du sujet",
  cs_fiche: "Fiche du cas",
  cs_contexte: "Contexte et diagnostic",
  cs_probleme: "Problème central",
  cs_cadre: "Cadre d'analyse",
  cs_donnees: "Données et preuves",
  cs_options: "Options stratégiques",
  cs_recommandation: "Recommandation",
  cs_conclusion: "Conclusion et limites",
  rs_cover_page: "Page de garde",
  rs_acknowledgements: "Remerciements",
  rs_introduction: "Introduction",
  rs_company: "Présentation de l'entreprise",
  rs_internship: "Présentation du stage",
  rs_missions: "Missions réalisées",
  rs_analysis: "Analyse d'une situation professionnelle",
  rs_contributions: "Apports du stage",
  rs_conclusion: "Conclusion",
};

// === IMPACT DEPENDENCIES (Module 17) ===
export const FOUNDATIONAL_SECTIONS = ['subject', 'problematic', 'hypotheses', 'plan'] as const;

export const SECTION_DEPENDENCIES: Record<string, string[]> = {
  subject: ['problematic', 'hypotheses', 'plan', 'conceptual_framework', 'theoretical_framework', 'literature_review', 'methodology', 'questionnaire', 'guide_entretien', 'data_analysis', 'financial_simulation', 'questionnaire_analysis', 'soutenance_ppt', 'memoire_audit'],
  problematic: ['hypotheses', 'plan', 'conceptual_framework', 'theoretical_framework', 'literature_review', 'methodology', 'questionnaire', 'guide_entretien', 'data_analysis', 'financial_simulation', 'questionnaire_analysis', 'soutenance_ppt', 'memoire_audit'],
  hypotheses: ['plan', 'conceptual_framework', 'methodology', 'questionnaire', 'guide_entretien', 'data_analysis', 'financial_simulation', 'questionnaire_analysis', 'soutenance_ppt', 'memoire_audit'],
  plan: ['conceptual_framework', 'theoretical_framework', 'literature_review', 'methodology', 'questionnaire', 'guide_entretien', 'data_analysis', 'financial_simulation', 'questionnaire_analysis', 'assisted_writing', 'soutenance_ppt', 'memoire_audit'],
  vae_presentation: ['vae_parcours', 'vae_motivation', 'vae_cartographie', 'vae_bloc_demo', 'vae_synthese'],
  vae_parcours: ['vae_cartographie', 'vae_bloc_demo', 'vae_synthese'],
  vae_motivation: ['vae_synthese'],
  vae_cartographie: ['vae_bloc_demo', 'vae_synthese'],
  vae_bloc_demo: ['vae_synthese'],
  rs_company: ['rs_internship', 'rs_missions', 'rs_analysis', 'rs_contributions', 'rs_conclusion'],
  rs_internship: ['rs_missions', 'rs_analysis', 'rs_contributions', 'rs_conclusion'],
  rs_missions: ['rs_analysis', 'rs_contributions', 'rs_conclusion'],
  rs_analysis: ['rs_contributions', 'rs_conclusion'],
  rs_contributions: ['rs_conclusion'],
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
