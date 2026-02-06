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
