import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = userData.id ? await this.getUser(userData.id) : undefined;
    const isNewUser = !existing;

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (isNewUser && userData.email) {
      try {
        const { sendWelcomeEmail } = await import("../../email");
        const firstName = userData.firstName || userData.email.split("@")[0] || "Utilisateur";
        sendWelcomeEmail(userData.email, firstName).catch(err =>
          console.error("[AUTH] Welcome email error:", err)
        );
      } catch (err) {
        console.error("[AUTH] Welcome email import error:", err);
      }
    }

    return user;
  }
}

export const authStorage = new AuthStorage();
