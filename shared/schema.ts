import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Auth and Chat models from integrations
export * from "./models/auth";
export * from "./models/chat";

// Import user table to reference it
import { users } from "./models/auth";

// === PROFILES ===
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(), // Link to Replit Auth user.id (which is a string)
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  // Module 2.1 & 2.2
  domain: text("domain"),
  educationLevel: text("education_level"),
  educationTitle: text("education_title"),
  userProfileType: text("user_profile_type"),
  professionalDomain: text("professional_domain"),
  professionalFunction: text("professional_function"),
  structureType: text("structure_type"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === PROJECTS ===
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'memoire', 'tfe', 'vae', 'rapport_stage'
  language: text("language").notNull().default("Français"),
  status: text("status").notNull().default("active"), // 'active', 'archived'
  
  // Module 2.3 Orientation
  finality: text("finality"), // 'academique', 'professionnelle', 'mixte'
  approach: text("approach"), // 'theorique', 'appliquee', ...
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === DOCUMENTS ===
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), // 'guide', 'consignes', 'cv', 'referentiel', 'situation_appel', 'autre'
  name: text("name").notNull(),
  content: text("content"), // Text content if extracted or simple text
  fileUrl: text("file_url"), // If uploaded
  createdAt: timestamp("created_at").defaultNow(),
});

// === AI GENERATIONS ===
export const aiGenerations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  type: text("type").notNull(), // 'subject', 'problematic', 'hypotheses', 'analysis', 'vae_competencies'
  data: jsonb("data").notNull(), // JSON structure for the generated content
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });

// === TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type AiGeneration = typeof aiGenerations.$inferSelect;

// API Types
export type CreateProjectRequest = InsertProject;
export type UpdateProjectRequest = Partial<InsertProject>;
export type CreateProfileRequest = InsertProfile;
export type GenerateRequest = {
  projectId: number;
  type: 'subject' | 'problematic' | 'hypotheses' | 'analysis' | 'vae_competencies';
  context?: string; // Optional extra context
};
