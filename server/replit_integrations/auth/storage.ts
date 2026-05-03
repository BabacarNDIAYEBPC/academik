import { db } from "../../db";
import { eq } from "drizzle-orm";
import { pgTable, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const authUsers = pgTable("auth_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  type: text("type").notNull().default("verify"),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AuthUser = typeof authUsers.$inferSelect;

export interface IAuthStorage {
  getUserByEmail(email: string): Promise<AuthUser | undefined>;
  getUserById(id: number): Promise<AuthUser | undefined>;
  createUser(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<AuthUser>;
  markVerified(email: string): Promise<void>;
  updateName(id: number, firstName: string, lastName: string): Promise<void>;
  createVerificationCode(email: string, code: string, type: string): Promise<void>;
  getValidCode(email: string, code: string, type: string): Promise<boolean>;
  markCodeUsed(email: string, code: string): Promise<void>;
}

class AuthStorageImpl implements IAuthStorage {
  async getUserByEmail(email: string): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.email, email.toLowerCase()));
    return user;
  }

  async getUserById(id: number): Promise<AuthUser | undefined> {
    const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return user;
  }

  async createUser(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<AuthUser> {
    const [user] = await db.insert(authUsers).values({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
    }).returning();
    return user;
  }

  async markVerified(email: string): Promise<void> {
    await db.update(authUsers).set({ verified: true, updatedAt: new Date() }).where(eq(authUsers.email, email.toLowerCase()));
  }

  async updateName(id: number, firstName: string, lastName: string): Promise<void> {
    await db.update(authUsers).set({ firstName, lastName, updatedAt: new Date() }).where(eq(authUsers.id, id));
  }

  async createVerificationCode(email: string, code: string, type: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(verificationCodes).values({ email: email.toLowerCase(), code, type, expiresAt });
  }

  async getValidCode(email: string, code: string, type: string): Promise<boolean> {
    const [row] = await db.select().from(verificationCodes).where(
      eq(verificationCodes.email, email.toLowerCase())
    );
    if (!row) return false;
    if (row.used) return false;
    if (row.code !== code) return false;
    if (row.type !== type) return false;
    if (new Date() > row.expiresAt) return false;
    return true;
  }

  async markCodeUsed(email: string, code: string): Promise<void> {
    await db.update(verificationCodes).set({ used: true }).where(eq(verificationCodes.email, email.toLowerCase()));
  }
}

export const authStorage = new AuthStorageImpl();
