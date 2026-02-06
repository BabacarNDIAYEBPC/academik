import { db } from "./db";
import {
  users, profiles, projects, documents, aiGenerations,
  projectSections, sectionVersions, sectionStatusHistory, userPurchases,
  userQuotas, quotaSurplus, plans, adminSettings, auditLogs, aiLogs,
  type User, type Profile, type Project, type Document, type AiGeneration,
  type InsertProfile, type InsertProject, type InsertDocument,
  type ProjectSection, type SectionVersion, type StatusHistory,
  type UserPurchase, type InsertPurchase,
  type UserQuota, type QuotaSurplus, type InsertSurplus,
  type Plan, type InsertPlan, type AuditLog, type AiLog, type AdminSetting,
  SECTION_ORDER,
} from "@shared/schema";
import { sql } from "drizzle-orm";
import { eq, desc, and, asc, ilike, or, count } from "drizzle-orm";

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

  getQuota(userId: string): Promise<UserQuota>;
  incrementQuotaUsage(userId: string, words: number, actions: number): Promise<UserQuota>;
  resetQuotaIfNeeded(userId: string): Promise<UserQuota>;
  addQuotaSurplus(userId: string, surplusType: string, amount: number, price: number): Promise<void>;
  getActiveProjectCount(userId: string): Promise<number>;
  getDocumentCount(projectId: number): Promise<number>;

  // Admin methods
  listAllUsers(search?: string): Promise<any[]>;
  getUserById(userId: string): Promise<any>;
  updateUserQuotaAdmin(userId: string, updates: Partial<{ wordsLimit: number; actionsLimit: number; activeProjectsLimit: number; documentsLimit: number }>): Promise<UserQuota>;
  addCreditsToUser(userId: string, words: number, actions: number): Promise<UserQuota>;

  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;

  getAdminSetting(key: string): Promise<any>;
  setAdminSetting(key: string, value: any): Promise<AdminSetting>;
  getAllAdminSettings(): Promise<AdminSetting[]>;

  createAuditLog(log: { actorId?: string; actorEmail?: string; action: string; targetType?: string; targetId?: string; details?: any }): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;

  createAiLog(log: { userId?: string; endpoint: string; model?: string; tokensIn?: number; tokensOut?: number; durationMs?: number; status?: string; error?: string }): Promise<AiLog>;
  getAiLogs(limit?: number, offset?: number): Promise<AiLog[]>;
  getAiLogStats(): Promise<{ totalRequests: number; totalErrors: number; avgDuration: number }>;

  getAllPurchases(limit?: number): Promise<any[]>;
  getAllSurplus(limit?: number): Promise<any[]>;
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
    const rawKeys = purchases.map(p => p.itemKey);
    const expanded = new Set<string>(rawKeys);
    if (expanded.has("core_pack")) {
      ["foundation", "plan", "conceptual", "literature", "methodology"].forEach(k => expanded.add(k));
    }
    if (expanded.has("pack_collecte")) {
      ["questionnaire", "guide_entretien"].forEach(k => expanded.add(k));
    }
    if (expanded.has("pack_analyse")) {
      ["analyse_qualitative", "analyse_quantitative"].forEach(k => expanded.add(k));
    }
    if (expanded.has("pack_revue")) {
      ["article_analysis", "article_confrontation", "biblio_multinormes"].forEach(k => expanded.add(k));
    }
    if (expanded.has("pack_soutenance")) {
      ["soutenance_ppt", "soutenance_simulation", "audit"].forEach(k => expanded.add(k));
    }
    return Array.from(expanded);
  }

  async getQuota(userId: string): Promise<UserQuota> {
    const [existing] = await db.select().from(userQuotas).where(eq(userQuotas.userId, userId));
    if (existing) return existing;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    const [created] = await db.insert(userQuotas).values({
      userId,
      wordsUsed: 0,
      wordsLimit: 20000,
      actionsUsed: 0,
      actionsLimit: 200,
      activeProjectsLimit: 3,
      documentsLimit: 20,
      periodStart: now,
      periodEnd,
    }).returning();
    return created;
  }

  async incrementQuotaUsage(userId: string, words: number, actions: number): Promise<UserQuota> {
    const quota = await this.getQuota(userId);
    const [updated] = await db.update(userQuotas)
      .set({
        wordsUsed: quota.wordsUsed + words,
        actionsUsed: quota.actionsUsed + actions,
        updatedAt: new Date(),
      })
      .where(eq(userQuotas.userId, userId))
      .returning();
    return updated;
  }

  async resetQuotaIfNeeded(userId: string): Promise<UserQuota> {
    const quota = await this.getQuota(userId);
    const now = new Date();
    if (quota.periodEnd && now >= quota.periodEnd) {
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      const [updated] = await db.update(userQuotas)
        .set({
          wordsUsed: 0,
          actionsUsed: 0,
          periodStart: now,
          periodEnd,
          updatedAt: now,
        })
        .where(eq(userQuotas.userId, userId))
        .returning();
      return updated;
    }
    return quota;
  }

  async addQuotaSurplus(userId: string, surplusType: string, amount: number, price: number): Promise<void> {
    await db.insert(quotaSurplus).values({
      userId,
      surplusType,
      amount,
      price,
      status: "active",
    });
    const quota = await this.getQuota(userId);
    if (surplusType === "words") {
      await db.update(userQuotas)
        .set({ wordsLimit: quota.wordsLimit + amount, updatedAt: new Date() })
        .where(eq(userQuotas.userId, userId));
    } else if (surplusType === "actions") {
      await db.update(userQuotas)
        .set({ actionsLimit: quota.actionsLimit + amount, updatedAt: new Date() })
        .where(eq(userQuotas.userId, userId));
    } else if (surplusType === "projects") {
      await db.update(userQuotas)
        .set({ activeProjectsLimit: quota.activeProjectsLimit + amount, updatedAt: new Date() })
        .where(eq(userQuotas.userId, userId));
    }
  }

  async getActiveProjectCount(userId: string): Promise<number> {
    const result = await db.select().from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, "active")));
    return result.length;
  }

  async getDocumentCount(projectId: number): Promise<number> {
    const result = await db.select().from(documents).where(eq(documents.projectId, projectId));
    return result.length;
  }

  // === ADMIN METHODS ===

  async listAllUsers(search?: string): Promise<any[]> {
    let userRows;
    if (search) {
      userRows = await db.select().from(users).where(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      ).orderBy(desc(users.createdAt));
    } else {
      userRows = await db.select().from(users).orderBy(desc(users.createdAt));
    }
    const enriched = [];
    for (const u of userRows) {
      const profile = await this.getProfile(u.id);
      const quota = await this.getQuota(u.id);
      const projectCount = await this.getActiveProjectCount(u.id);
      const purchases = await this.getUserPurchases(u.id);
      enriched.push({
        ...u,
        profile,
        quota,
        projectCount,
        purchaseCount: purchases.length,
        status: purchases.length > 0 ? "paid" : "trial",
      });
    }
    return enriched;
  }

  async getUserById(userId: string): Promise<any> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;
    const profile = await this.getProfile(userId);
    const quota = await this.getQuota(userId);
    const projectCount = await this.getActiveProjectCount(userId);
    const purchases = await this.getUserPurchases(userId);
    const surplusList = await db.select().from(quotaSurplus)
      .where(eq(quotaSurplus.userId, userId))
      .orderBy(desc(quotaSurplus.createdAt));
    return { ...user, profile, quota, projectCount, purchases, surplus: surplusList };
  }

  async updateUserQuotaAdmin(userId: string, updates: Partial<{ wordsLimit: number; actionsLimit: number; activeProjectsLimit: number; documentsLimit: number }>): Promise<UserQuota> {
    await this.getQuota(userId);
    const [updated] = await db.update(userQuotas)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userQuotas.userId, userId))
      .returning();
    return updated;
  }

  async addCreditsToUser(userId: string, words: number, actions: number): Promise<UserQuota> {
    const quota = await this.getQuota(userId);
    const [updated] = await db.update(userQuotas)
      .set({
        wordsLimit: quota.wordsLimit + words,
        actionsLimit: quota.actionsLimit + actions,
        updatedAt: new Date(),
      })
      .where(eq(userQuotas.userId, userId))
      .returning();
    return updated;
  }

  // === PLANS ===

  async getPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(asc(plans.id));
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan;
  }

  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [created] = await db.insert(plans).values(plan).returning();
    return created;
  }

  async updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan> {
    const [updated] = await db.update(plans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  // === ADMIN SETTINGS ===

  async getAdminSetting(key: string): Promise<any> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting?.value ?? null;
  }

  async setAdminSetting(key: string, value: any): Promise<AdminSetting> {
    const [existing] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    if (existing) {
      const [updated] = await db.update(adminSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(adminSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(adminSettings).values({ key, value }).returning();
    return created;
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings);
  }

  // === AUDIT LOGS ===

  async createAuditLog(log: { actorId?: string; actorEmail?: string; action: string; targetType?: string; targetId?: string; details?: any }): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(limit = 100, offset = 0): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // === AI LOGS ===

  async createAiLog(log: { userId?: string; endpoint: string; model?: string; tokensIn?: number; tokensOut?: number; durationMs?: number; status?: string; error?: string }): Promise<AiLog> {
    const [created] = await db.insert(aiLogs).values(log).returning();
    return created;
  }

  async getAiLogs(limit = 100, offset = 0): Promise<AiLog[]> {
    return await db.select().from(aiLogs)
      .orderBy(desc(aiLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAiLogStats(): Promise<{ totalRequests: number; totalErrors: number; avgDuration: number }> {
    const [stats] = await db.select({
      totalRequests: count(),
      totalErrors: count(sql`CASE WHEN ${aiLogs.status} = 'error' THEN 1 END`),
      avgDuration: sql<number>`COALESCE(AVG(${aiLogs.durationMs}), 0)`,
    }).from(aiLogs);
    return {
      totalRequests: Number(stats.totalRequests),
      totalErrors: Number(stats.totalErrors),
      avgDuration: Math.round(Number(stats.avgDuration)),
    };
  }

  // === ALL PURCHASES (Admin) ===

  async getAllPurchases(limit = 100): Promise<any[]> {
    const rows = await db.select().from(userPurchases)
      .orderBy(desc(userPurchases.createdAt))
      .limit(limit);
    const enriched = [];
    for (const p of rows) {
      const [user] = await db.select().from(users).where(eq(users.id, p.userId));
      enriched.push({ ...p, userEmail: user?.email, userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Inconnu" });
    }
    return enriched;
  }

  async getAllSurplus(limit = 100): Promise<any[]> {
    const rows = await db.select().from(quotaSurplus)
      .orderBy(desc(quotaSurplus.createdAt))
      .limit(limit);
    const enriched = [];
    for (const s of rows) {
      const [user] = await db.select().from(users).where(eq(users.id, s.userId));
      enriched.push({ ...s, userEmail: user?.email, userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Inconnu" });
    }
    return enriched;
  }
}

export const storage = new DatabaseStorage();
