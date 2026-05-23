import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, CheckCircle, TrendingUp, Euro, Search, BarChart3, LogOut, ShoppingCart, BookOpen, Coins, Send, Sparkles, Facebook, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  users: { total: number; verified: number; conversionRate: number; newLast30d: number; newLast7d: number; newToday: number };
  revenue: { total: string; creditsSold: number; orders: number };
  activity: { activeUsers: number; totalSearches: number; creditsSpent: number };
  dailySignups: { date: string; count: number }[];
}

interface User {
  id: number; email: string; firstName: string; lastName: string;
  verified: boolean; createdAt: string; credits: number; searches: number; spent: string;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniBar({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <p className="text-sm text-muted-foreground py-4 text-center">Pas de données</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-violet-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-default"
            style={{ height: `${Math.max((d.count / max) * 68, 2)}px` }}
            title={`${d.date}: ${d.count}`}
          />
        </div>
      ))}
    </div>
  );
}

function SocialPublisher({ authenticated }: { authenticated: boolean }) {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<"facebook" | "instagram">("facebook");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");

  const { data: socialStatus } = useQuery<{ facebook: boolean; instagram: boolean }>({
    queryKey: ["/api/admin/social/status"],
    enabled: authenticated,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/social/generate", { topic, platform });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      return res.json();
    },
    onSuccess: (data) => setContent(data.content),
    onError: (e: any) => toast({ variant: "destructive", title: "Erreur génération", description: e.message }),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/social/publish/${platform}`, { message: content });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "✅ Publié !", description: `Post publié avec succès (ID: ${data.postId})` });
      setContent("");
      setTopic("");
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Erreur publication", description: e.message }),
  });

  const charLimit = platform === "instagram" ? 2200 : 63206;
  const charCount = content.length;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <Send className="w-4 h-4 text-violet-600" />
          <h3 className="font-semibold">Publication réseaux sociaux</h3>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant={socialStatus?.facebook ? "default" : "secondary"}
              className={socialStatus?.facebook ? "bg-blue-100 text-blue-700 border-0" : ""}>
              <Facebook className="w-3 h-3 mr-1" />
              {socialStatus?.facebook ? "Connecté" : "Non configuré"}
            </Badge>
            <Badge variant={socialStatus?.instagram ? "default" : "secondary"}
              className={socialStatus?.instagram ? "bg-pink-100 text-pink-700 border-0" : ""}>
              <Instagram className="w-3 h-3 mr-1" />
              {socialStatus?.instagram ? "Connecté" : "En attente"}
            </Badge>
          </div>
        </div>

        {/* Platform selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPlatform("facebook")}
            data-testid="button-platform-facebook"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === "facebook"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Facebook className="w-4 h-4" /> Facebook
          </button>
          <button
            onClick={() => setPlatform("instagram")}
            data-testid="button-platform-instagram"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === "instagram"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Instagram className="w-4 h-4" /> Instagram
          </button>
        </div>

        {/* Topic + Generate */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder={`Sujet du post ${platform === "instagram" ? "Instagram" : "Facebook"} (ex: tips bibliographie APA, avantages IA pour les étudiants...)`}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            data-testid="input-social-topic"
            className="flex-1 text-sm"
            onKeyDown={e => { if (e.key === "Enter" && topic.trim()) generateMutation.mutate(); }}
          />
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={!topic.trim() || generateMutation.isPending}
            variant="outline"
            data-testid="button-generate-post"
            className="shrink-0"
          >
            {generateMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Sparkles className="w-4 h-4 mr-1.5" /> Générer</>}
          </Button>
        </div>

        {/* Content editor */}
        <div className="relative">
          <Textarea
            placeholder="Le contenu du post apparaîtra ici. Vous pouvez aussi l'écrire directement ou le modifier après génération."
            value={content}
            onChange={e => setContent(e.target.value)}
            data-testid="textarea-social-content"
            className="min-h-[180px] text-sm resize-none"
          />
          <span className={`absolute bottom-2 right-3 text-xs ${charCount > charLimit ? "text-red-500" : "text-muted-foreground"}`}>
            {charCount}/{charLimit}
          </span>
        </div>

        {/* Publish button */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            {platform === "instagram" && !socialStatus?.instagram
              ? "⚠️ ID Instagram non configuré — cliquez Découvrir →"
              : platform === "facebook"
              ? "→ Page Facebook : Marketlens"
              : "→ Instagram : @marketlens.fr"}
          </p>
          <div className="flex gap-2">
            {platform === "instagram" && !socialStatus?.instagram && (
              <DiscoverInstagramButton />
            )}
            <Button
              onClick={() => publishMutation.mutate()}
              disabled={!content.trim() || charCount > charLimit || publishMutation.isPending ||
                (platform === "instagram" && !socialStatus?.instagram)}
              className={platform === "facebook" ? "bg-blue-600 hover:bg-blue-700" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"}
              data-testid="button-publish-post"
            >
              {publishMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                : <Send className="w-4 h-4 mr-2" />}
              Publier sur {platform === "facebook" ? "Facebook" : "Instagram"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const { data: me, isLoading: meLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/me"],
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] }); },
    onError: (e: any) => toast({ variant: "destructive", title: "Erreur", description: e.message }),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/admin/logout", {})).json(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] }); },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: me?.authenticated === true,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[]; total: number; pages: number }>({
    queryKey: ["/api/admin/users", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await apiRequest("GET", `/api/admin/users?${params}`);
      return res.json();
    },
    enabled: me?.authenticated === true,
  });

  if (meLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!me?.authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-violet-600" />
              <span className="font-bold text-lg">Academik Admin</span>
            </div>
            <h1 className="text-xl font-bold mb-1">Accès restreint</h1>
            <p className="text-sm text-muted-foreground mb-6">Entrez le mot de passe administrateur</p>
            <form onSubmit={e => { e.preventDefault(); loginMutation.mutate(); }} className="space-y-4">
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                data-testid="input-admin-password"
                autoFocus
              />
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={loginMutation.isPending} data-testid="button-admin-login">
                {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accéder"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-600" />
            <span className="font-bold">Academik</span>
            <Badge variant="secondary" className="text-xs">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logoutMutation.mutate()} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-1" /> Déconnexion
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Stats cards */}
        {statsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
        ) : stats && (
          <>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Utilisateurs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Users} label="Inscrits total" value={stats.users.total}
                  sub={`+${stats.users.newToday} aujourd'hui`} color="bg-violet-500" />
                <StatCard icon={CheckCircle} label="Vérifiés" value={stats.users.verified}
                  sub={`${stats.users.conversionRate}% de conversion`} color="bg-emerald-500" />
                <StatCard icon={TrendingUp} label="7 derniers jours" value={`+${stats.users.newLast7d}`}
                  sub={`+${stats.users.newLast30d} ce mois`} color="bg-blue-500" />
                <StatCard icon={BookOpen} label="Actifs (recherches)" value={stats.activity.activeUsers}
                  sub={`${stats.activity.totalSearches} recherches au total`} color="bg-orange-500" />
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Revenus & Crédits</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Euro} label="Revenus totaux" value={`${stats.revenue.total} €`}
                  sub={`${stats.revenue.orders} commandes`} color="bg-emerald-600" />
                <StatCard icon={ShoppingCart} label="Crédits vendus" value={stats.revenue.creditsSold}
                  sub="via Stripe" color="bg-violet-600" />
                <StatCard icon={Coins} label="Crédits dépensés" value={stats.activity.creditsSpent}
                  sub="en actions IA" color="bg-amber-500" />
                <StatCard icon={BarChart3} label="Taux de conv." value={`${stats.users.conversionRate}%`}
                  sub="inscrits → vérifiés" color="bg-rose-500" />
              </div>
            </div>

            {/* Chart */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Inscriptions — 30 derniers jours</h3>
                    <p className="text-xs text-muted-foreground">{stats.users.newLast30d} nouveaux inscrits</p>
                  </div>
                </div>
                <MiniBar data={stats.dailySignups} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{stats.dailySignups[0]?.date?.slice(5) ?? ""}</span>
                  <span>{stats.dailySignups[stats.dailySignups.length - 1]?.date?.slice(5) ?? ""}</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Social Media Publisher */}
        <SocialPublisher authenticated={true} />

        {/* Users table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold">Utilisateurs</h3>
                <p className="text-xs text-muted-foreground">{usersData?.total ?? "—"} inscrits au total</p>
              </div>
              <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2">
                <Input
                  placeholder="Rechercher email, prénom..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-56 text-sm"
                  data-testid="input-admin-search"
                />
                <Button type="submit" size="sm" variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
                {search && (
                  <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}>
                    ✕
                  </Button>
                )}
              </form>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-violet-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="text-left py-2 pr-4 font-medium">Utilisateur</th>
                      <th className="text-left py-2 pr-4 font-medium">Statut</th>
                      <th className="text-right py-2 pr-4 font-medium">Crédits</th>
                      <th className="text-right py-2 pr-4 font-medium">Recherches</th>
                      <th className="text-right py-2 pr-4 font-medium">Dépensé</th>
                      <th className="text-right py-2 font-medium">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {usersData?.users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-user-${u.id}`}>
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-slate-900 truncate max-w-[200px]">
                            {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email}</p>
                        </td>
                        <td className="py-2.5 pr-4">
                          {u.verified
                            ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Vérifié</Badge>
                            : <Badge variant="secondary" className="text-xs">En attente</Badge>}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-mono text-sm">{u.credits}</td>
                        <td className="py-2.5 pr-4 text-right text-slate-600">{u.searches}</td>
                        <td className="py-2.5 pr-4 text-right font-medium">
                          {Number(u.spent) > 0 ? `${u.spent} €` : "—"}
                        </td>
                        <td className="py-2.5 text-right text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                    {!usersData?.users.length && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">Aucun utilisateur trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {usersData && usersData.pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                  ← Précédent
                </Button>
                <span className="text-xs text-muted-foreground">Page {page + 1} / {usersData.pages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= usersData.pages - 1}>
                  Suivant →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
