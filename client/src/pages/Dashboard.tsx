import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { BookOpen, Search, Plus, Trash2, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCredits, useBibliographies, useDeleteBibliography } from "@/hooks/use-literature";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Dashboard() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();
  const { data: bibliographies, isLoading: bibLoading } = useBibliographies();
  const deleteBib = useDeleteBibliography();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteBib.mutate(id, {
      onSuccess: () => toast({ title: t("search_deleted") }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">{t("app_name")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button variant="ghost" size="sm" onClick={() => setLocation("/billing")} className="gap-1.5" data-testid="button-credits-nav">
              <Coins className="w-4 h-4 text-primary" />
              {creditsLoading ? "..." : <span className="font-semibold">{creditsData?.credits ?? 0}</span>}
              <span className="text-muted-foreground hidden sm:inline">{t("credits")}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-logout">
              {t("logout")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            {t("hello")}{user?.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="text-muted-foreground">{t("dashboard_subtitle")}</p>
        </div>

        <Card className="border-primary/30 bg-primary/5 mb-8">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg mb-1">{t("new_search")}</h2>
              <p className="text-sm text-muted-foreground">{t("new_search_desc")}</p>
            </div>
            <Button onClick={() => setLocation("/revue")} className="gap-2 shrink-0" data-testid="button-new-search">
              <Search className="w-4 h-4" /> {t("start_search")}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-credits-count">
                {creditsLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : creditsData?.credits ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t("available_credits")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-searches-count">
                {bibLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (bibliographies as any[])?.length ?? 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{t("saved_searches_count")}</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="py-4 text-center">
              <Button variant="link" className="text-primary font-bold text-2xl h-auto p-0" onClick={() => setLocation("/billing")} data-testid="button-buy-credits">
                <Plus className="w-5 h-5" />
              </Button>
              <div className="text-xs text-muted-foreground mt-1">{t("buy_credits")}</div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> {t("saved_searches")}
            </h2>
          </div>

          {bibLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : !(bibliographies as any[])?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="font-medium mb-1">{t("no_saved")}</p>
                <p className="text-sm mb-4">{t("no_saved_desc")}</p>
                <Button variant="outline" onClick={() => setLocation("/revue")} data-testid="button-first-search">
                  {t("start")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(bibliographies as any[]).map((bib: any) => (
                <Card key={bib.id} className="card-hover" data-testid={`card-bib-${bib.id}`}>
                  <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setLocation("/revue")}>
                      <p className="font-medium text-sm truncate">{bib.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {bib.query && <span>"{bib.query}" · </span>}
                        <span>{new Date(bib.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">{bib.norm || "APA"}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(bib.id)}
                        data-testid={`button-delete-bib-${bib.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
