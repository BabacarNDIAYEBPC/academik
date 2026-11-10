import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { createHmac } from "node:crypto";

// The native client stores this opaque, signed session credential in SecureStore.
// It uses the existing server session store, so logout/deletion revoke it.
export async function establishSession(req: any, userId: number | string): Promise<string> {
  await new Promise<void>((resolve, reject) => req.session.regenerate((err: Error) => err ? reject(err) : resolve()));
  req.session.userId = userId;
  await new Promise<void>((resolve, reject) => req.session.save((err: Error) => err ? reject(err) : resolve()));
  const signature = createHmac("sha256", process.env.SESSION_SECRET!).update(req.sessionID).digest("base64").replace(/=+$/, "");
  return `s:${req.sessionID}.${signature}`;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use((req, _res, next) => {
    const authorization = req.headers.authorization;
    if (authorization?.startsWith("Bearer s:")) {
      const token = authorization.slice(7);
      if (token.length < 512 && !/\s/.test(token)) {
        const cookies = (req.headers.cookie || "").split(";").filter(c => !c.trim().startsWith("connect.sid="));
        req.headers.cookie = [...cookies, `connect.sid=${encodeURIComponent(token)}`].join("; ");
      }
    }
    next();
  });
  app.use(getSession());
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const session = req.session as any;
  if (!session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
