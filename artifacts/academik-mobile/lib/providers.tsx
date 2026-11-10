import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { mobileGetUser, mobileLogin, mobileVerify, mobileLogout, mobileDeleteAccount, setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { translations } from "@/i18n/translations";

export const apiOrigin = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
setBaseUrl(apiOrigin);
let activeToken: string | null = null;
setAuthTokenGetter(() => activeToken);
const tokenKey = "academik-session";
async function persistToken(token: string | null) {
  activeToken = token;
  if (Platform.OS === "web") {
    if (token) sessionStorage.setItem(tokenKey, token);
    else sessionStorage.removeItem(tokenKey);
  } else if (token) await SecureStore.setItemAsync(tokenKey, token);
  else await SecureStore.deleteItemAsync(tokenKey);
}
export function errorMessage(error: any): string {
  return error?.data?.message || error?.body?.message || error?.message || "Impossible de terminer cette action. Réessayez.";
}
export type User = { id: string; email: string; firstName?: string; lastName?: string };
type Auth = { user: User | null; ready: boolean; error: string; signIn: (body: Record<string, unknown>, verify?: boolean) => Promise<void>; logout: () => Promise<void>; deleteAccount: () => Promise<void>; reload: () => Promise<void> };
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const cache = useQueryClient();
  const reload = async () => {
    setError("");
    try {
      activeToken = Platform.OS === "web" ? sessionStorage.getItem(tokenKey) : await SecureStore.getItemAsync(tokenKey);
      if (activeToken) setUser(await mobileGetUser() as unknown as User);
    } catch (e: any) {
      if (e.status === 401 || e.statusCode === 401) { await persistToken(null); setUser(null); }
      else setError(errorMessage(e));
    } finally { setReady(true); }
  };
  useEffect(() => { void reload(); }, []);
  const signIn = async (body: Record<string, unknown>, verify = false) => {
    const result = await (verify ? mobileVerify(body) : mobileLogin(body));
    if (typeof result.accessToken !== "string") throw new Error("Session mobile absente");
    await persistToken(result.accessToken);
    cache.clear();
    setUser(result.user as User);
  };
  const clear = async () => { await persistToken(null); setUser(null); cache.clear(); };
  return <AuthContext.Provider value={{ user, ready, error, reload, signIn, logout: async () => { await mobileLogout(); await clear(); }, deleteAccount: async () => { await mobileDeleteAccount(); await clear(); } }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("Auth provider missing"); return value; }

const LanguageContext = createContext<{ language: string; setLanguage: (code: string) => void; t: (key: string, fallback?: string) => string } | null>(null);
export const languageNames: Record<string, string> = { fr:"Français", en:"English", es:"Español", pt:"Português", de:"Deutsch", it:"Italiano", ar:"العربية", zh:"中文", ja:"日本語", ru:"Русский", tr:"Türkçe", ko:"한국어", nl:"Nederlands", pl:"Polski", ro:"Română", sv:"Svenska", hi:"हिन्दी", id:"Bahasa Indonesia", uk:"Українська", vi:"Tiếng Việt", cs:"Čeština", el:"Ελληνικά", fi:"Suomi", he:"עברית", hu:"Magyar", da:"Dansk", no:"Norsk" };
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const device = Localization.getLocales()[0]?.languageCode || "fr";
  const [language, setLang] = useState(translations[device] ? device : "fr");
  useEffect(() => { AsyncStorage.getItem("academik-language").then(code => { if (code && translations[code]) setLang(code); }); }, []);
  const setLanguage = (code: string) => { if (translations[code]) { setLang(code); void AsyncStorage.setItem("academik-language", code); } };
  const t = (key: string, fallback?: string) => translations[language]?.translation[key] || translations.fr.translation[key] || fallback || key;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("Language provider missing"); return value; }

export type Article = { title: string; lastName?: string; firstName?: string; authors?: string; year?: string; publisher?: string; platform?: string; url?: string; type?: string; isOpenAccess?: boolean; relevanceScore?: number };
export const defaultConfig = { query: "", domain: "", platforms: ["google_scholar","pubmed","hal","cairn","sciencedirect"], language: "fr", periodStart: "2015", periodEnd: String(new Date().getFullYear()), level: "academic", sourceTypes: ["scientific_articles"], articleCount: 10, norm: "apa7", accessType: "all", openAccessProportion: 50 };
type Workspace = { config: typeof defaultConfig; setConfig: React.Dispatch<React.SetStateAction<typeof defaultConfig>>; articles: Article[]; setArticles: React.Dispatch<React.SetStateAction<Article[]>>; outputs: Record<string,string>; setOutputs: React.Dispatch<React.SetStateAction<Record<string,string>>>; load: (item: any) => void };
const ResearchContext = createContext<Workspace | null>(null);
export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [config, setConfig] = useState(defaultConfig);
  const [articles, setArticles] = useState<Article[]>([]);
  const [outputs, setOutputs] = useState<Record<string,string>>({});
  useEffect(() => { setConfig(defaultConfig); setArticles([]); setOutputs({}); }, [user?.id]);
  const load = (item: any) => {
    setConfig({ ...defaultConfig, query: item.query || item.title || "", norm: String(item.norm || "apa7").toLowerCase() });
    setArticles(Array.isArray(item.sources) ? item.sources : []);
    setOutputs(item.content ? { bibliography: item.content } : {});
  };
  return <ResearchContext.Provider value={{ config, setConfig, articles, setArticles, outputs, setOutputs, load }}>{children}</ResearchContext.Provider>;
}
export function useResearch() { const value = useContext(ResearchContext); if (!value) throw new Error("Research provider missing"); return value; }
