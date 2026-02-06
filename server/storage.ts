import { db } from "./db";
import {
  users, profiles, projects, documents, aiGenerations,
  projectSections, sectionVersions, sectionStatusHistory, userPurchases,
  type User, type Profile, type Project, type Document, type AiGeneration,
  type InsertProfile, type InsertProject, type InsertDocument,
  type ProjectSection, type SectionVersion, type StatusHistory,
  type UserPurchase, type InsertPurchase,
  SECTION_ORDER,
} from "@shared/schema";
import { eq, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;

  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  getDocuments(projectId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  createAiGeneration(projectId: number, type: string, data: any): Promise<AiGeneration>;
  getAiGenerations(projectId: number): Promise<AiGeneration[]>;

  getSections(projectId: number): Promise<ProjectSection[]>;
  getSection(id: number): Promise<ProjectSection | undefined>;
  getSectionByKey(projectId: number, key: string): Promise<ProjectSection | undefined>;
  createSection(projectId: number, key: string, config?: any): Promise<ProjectSection>;
  updateSectionStatus(id: number, status: string, note?: string): Promise<ProjectSection>;
  updateSectionConfig(id: number, config: any): Promise<ProjectSection>;
  setActiveVersion(sectionId: number, versionId: number): Promise<ProjectSection>;

  getVersions(sectionId: number): Promise<SectionVersion[]>;
  getVersion(id: number): Promise<SectionVersion | undefined>;
  getActiveVersion(sectionId: number): Promise<SectionVersion | undefined>;
  createVersion(sectionId: number, content: string, source: string, mode?: string, contextSnapshot?: string): Promise<SectionVersion>;
  activateVersion(sectionId: number, versionId: number): Promise<void>;

  getStatusHistory(sectionId: number): Promise<StatusHistory[]>;
  addStatusHistory(sectionId: number, status: string, note?: string): Promise<StatusHistory>;

  getValidatedSectionsContext(projectId: number): Promise<string>;

  getUserPurchases(userId: string): Promise<UserPurchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<UserPurchase>;
  getUserEntitlements(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [updated] = await db.update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  async getProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getDocuments(projectId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.projectId, projectId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(document).returning();
    return newDoc;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async createAiGeneration(projectId: number, type: string, data: any): Promise<AiGeneration> {
    const [gen] = await db.insert(aiGenerations).values({ projectId, type, data }).returning();
    return gen;
  }

  async getAiGenerations(projectId: number): Promise<AiGeneration[]> {
    return await db.select().from(aiGenerations)
      .where(eq(aiGenerations.projectId, projectId))
      .orderBy(desc(aiGenerations.createdAt));
  }

  // === SECTIONS ===
  async getSections(projectId: number): Promise<ProjectSection[]> {
    return await db.select().from(projectSections)
      .where(eq(projectSections.projectId, projectId))
      .orderBy(asc(projectSections.createdAt));
  }

  async getSection(id: number): Promise<ProjectSection | undefined> {
    const [section] = await db.select().from(projectSections).where(eq(projectSections.id, id));
    return section;
  }

  async getSectionByKey(projectId: number, key: string): Promise<ProjectSection | undefined> {
    const [section] = await db.select().from(projectSections)
      .where(and(eq(projectSections.projectId, projectId), eq(projectSections.key, key)));
    return section;
  }

  async createSection(projectId: number, key: string, config?: any): Promise<ProjectSection> {
    const [section] = await db.insert(projectSections)
      .values({ projectId, key, status: "draft", config: config || null })
      .returning();
    await this.addStatusHistory(section.id, "draft", "Création de la section");
    return section;
  }

  async updateSectionStatus(id: number, status: string, note?: string): Promise<ProjectSection> {
    const [updated] = await db.update(projectSections)
      .set({ status, updatedAt: new Date() })
      .where(eq(projectSections.id, id))
      .returning();
    await this.addStatusHistory(id, status, note);
    return updated;
  }

  async updateSectionConfig(id: number, config: any): Promise<ProjectSection> {
    const [updated] = await db.update(projectSections)
      .set({ config, updatedAt: new Date() })
      .where(eq(projectSections.id, id))
      .returning();
    return updated;
  }

  async setActiveVersion(sectionId: number, versionId: number): Promise<ProjectSection> {
    await db.update(sectionVersions)
      .set({ isActive: false })
      .where(eq(sectionVersions.sectionId, sectionId));
    await db.update(sectionVersions)
      .set({ isActive: true })
      .where(eq(sectionVersions.id, versionId));
    const [updated] = await db.update(projectSections)
      .set({ activeVersionId: versionId, updatedAt: new Date() })
      .where(eq(projectSections.id, sectionId))
      .returning();
    return updated;
  }

  // === VERSIONS ===
  async getVersions(sectionId: number): Promise<SectionVersion[]> {
    return await db.select().from(sectionVersions)
      .where(eq(sectionVersions.sectionId, sectionId))
      .orderBy(desc(sectionVersions.versionNumber));
  }

  async getVersion(id: number): Promise<SectionVersion | undefined> {
    const [version] = await db.select().from(sectionVersions).where(eq(sectionVersions.id, id));
    return version;
  }

  async getActiveVersion(sectionId: number): Promise<SectionVersion | undefined> {
    const [version] = await db.select().from(sectionVersions)
      .where(and(eq(sectionVersions.sectionId, sectionId), eq(sectionVersions.isActive, true)));
    return version;
  }

  async createVersion(sectionId: number, content: string, source: string, mode?: string, contextSnapshot?: string): Promise<SectionVersion> {
    const existing = await this.getVersions(sectionId);
    const nextNumber = existing.length > 0 ? Math.max(...existing.map(v => v.versionNumber)) + 1 : 1;

    await db.update(sectionVersions)
      .set({ isActive: false })
      .where(eq(sectionVersions.sectionId, sectionId));

    const [version] = await db.insert(sectionVersions)
      .values({
        sectionId,
        versionNumber: nextNumber,
        source,
        mode: mode || null,
        content,
        contextSnapshot: contextSnapshot || null,
        isActive: true,
      })
      .returning();

    await db.update(projectSections)
      .set({ activeVersionId: version.id, updatedAt: new Date() })
      .where(eq(projectSections.id, sectionId));

    return version;
  }

  async activateVersion(sectionId: number, versionId: number): Promise<void> {
    await db.update(sectionVersions)
      .set({ isActive: false })
      .where(eq(sectionVersions.sectionId, sectionId));
    await db.update(sectionVersions)
      .set({ isActive: true })
      .where(eq(sectionVersions.id, versionId));
    await db.update(projectSections)
      .set({ activeVersionId: versionId, updatedAt: new Date() })
      .where(eq(projectSections.id, sectionId));
  }

  async getSectionsWithContent(projectId: number): Promise<{ key: string; label: string; content: string }[]> {
    const sections = await this.getSections(projectId);
    const sorted = sections.sort((a, b) => {
      const aIdx = SECTION_ORDER.indexOf(a.key);
      const bIdx = SECTION_ORDER.indexOf(b.key);
      return aIdx - bIdx;
    });
    const result: { key: string; label: string; content: string }[] = [];
    for (const section of sorted) {
      if (!section.activeVersionId) continue;
      const version = await this.getActiveVersion(section.id);
      if (version) {
        const { SECTION_LABELS } = await import("@shared/schema");
        result.push({ key: section.key, label: SECTION_LABELS[section.key] || section.key, content: version.content });
      }
    }
    return result;
  }

  // === STATUS HISTORY ===
  async getStatusHistory(sectionId: number): Promise<StatusHistory[]> {
    return await db.select().from(sectionStatusHistory)
      .where(eq(sectionStatusHistory.sectionId, sectionId))
      .orderBy(desc(sectionStatusHistory.changedAt));
  }

  async addStatusHistory(sectionId: number, status: string, note?: string): Promise<StatusHistory> {
    const [entry] = await db.insert(sectionStatusHistory)
      .values({ sectionId, status, note: note || null })
      .returning();
    return entry;
  }

  async getValidatedSectionContents(projectId: number): Promise<Record<string, string>> {
    const sections = await this.getSections(projectId);
    const result: Record<string, string> = {};
    for (const section of sections) {
      if (!section.activeVersionId) continue;
      const version = await this.getActiveVersion(section.id);
      if (version) {
        result[section.key] = version.content;
      }
    }
    return result;
  }

  // === CONTEXTUAL MEMORY ===
  async getValidatedSectionsContext(projectId: number): Promise<string> {
    const sections = await this.getSections(projectId);
    const validatedSections = sections.filter(s => s.status === "validated");

    const sorted = validatedSections.sort((a, b) => {
      const aIdx = SECTION_ORDER.indexOf(a.key);
      const bIdx = SECTION_ORDER.indexOf(b.key);
      return aIdx - bIdx;
    });

    let context = "";
    for (const section of sorted) {
      if (!section.activeVersionId) continue;
      const version = await this.getActiveVersion(section.id);
      if (version) {
        const { SECTION_LABELS } = await import("@shared/schema");
        const label = SECTION_LABELS[section.key] || section.key;
        context += `\n=== ${label.toUpperCase()} (VALIDÉ) ===\n${version.content}\n`;
      }
    }
    return context;
  }

  async getUserPurchases(userId: string): Promise<UserPurchase[]> {
    return await db.select().from(userPurchases)
      .where(and(eq(userPurchases.userId, userId), eq(userPurchases.status, "active")))
      .orderBy(desc(userPurchases.createdAt));
  }

  async createPurchase(purchase: InsertPurchase): Promise<UserPurchase> {
    const [newPurchase] = await db.insert(userPurchases).values(purchase).returning();
    return newPurchase;
  }

  async getUserEntitlements(userId: string): Promise<string[]> {
    const purchases = await this.getUserPurchases(userId);
    return purchases.map(p => p.itemKey);
  }
}

export const storage = new DatabaseStorage();
