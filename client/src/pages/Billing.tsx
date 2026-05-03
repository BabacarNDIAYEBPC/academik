import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { BookOpen, Coins, ArrowLeft, Check, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-literature";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CREDIT_PACKS } from "@shared/schema";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Billing() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();
  const queryClient = useQueryClient();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const { data: invoices, isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (packId: string) => {
      const res = await apiRequest("POST", "/api/checkout", { packId });
      return res.json() as Promise<{ url: string }>;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", "/api/checkout/confirm", { sessionId });
      return res.json() as Promise<{ success: boolean; credits: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: `✓ ${data.credits} ${t("credits_added")}` });
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      confirmMutation.mutate(sessionId);
      window.history.replaceState({}, "", "/billing");
    } else if (payment === "cancelled") {
      toast({ title: t("payment_cancelled"), variant: "destructive" });
      window.history.replaceState({}, "", "/billing");
    }
  }, []);

  const handleBuy = async (packId: string) => {
    setLoadingPack(packId);
    checkoutMutation.mutate(packId, {
      onSuccess: (data) => { window.location.href = data.url; },
      onError: () => {
        toast({ title: t("payment_error"), variant: "destructive" });
        setLoadingPack(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">{t("app_name")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> {t("back")}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{t("billing_title")}</h1>
          <p className="text-muted-foreground">{t("billing_desc")}</p>
        </div>

        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("current_balance")}</p>
                <p className="text-2xl font-bold" data-testid="text-credit-balance">
                  {creditsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${creditsData?.credits ?? 0} ${t("credits")}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="font-semibold mb-4">{t("buy_credits")}</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {CREDIT_PACKS.map((pack, i) => (
            <Card key={pack.id} className={`relative ${i === 1 ? "border-primary shadow-md" : ""}`} data-testid={`card-pack-${pack.id}`}>
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">{t("popular")}</Badge>
                </div>
              )}
              <CardContent className="pt-6 pb-5 text-center">
                <h3 className="font-bold text-base mb-1">{pack.label}</h3>
                <div className="text-3xl font-bold my-2">{pack.price} €</div>
                <p className="text-muted-foreground text-sm mb-1">{pack.credits} {t("credits")}</p>
                <p className="text-xs text-muted-foreground mb-4">{(pack.price / pack.credits).toFixed(2)} {t("per_credit")}</p>
                <div className="space-y-1.5 text-xs text-left mb-5">
                  {[t("billed_features_1"), t("billed_features_2"), t("billed_features_3")].map(f => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  variant={i === 1 ? "default" : "outline"}
                  disabled={loadingPack === pack.id || checkoutMutation.isPending}
                  onClick={() => handleBuy(pack.id)}
                  data-testid={`button-buy-${pack.id}`}
                >
                  {loadingPack === pack.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("redirecting")}</>
                  ) : (
                    `${t("buy_pack", { price: pack.price })}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8 bg-muted/30">
          <CardContent className="py-4 px-5">
            <h3 className="font-medium text-sm mb-3">{t("action_costs")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                [t("cost_search"), t("one_credit")],
                [t("cost_analysis"), t("one_credit")],
                [t("cost_confrontation"), t("one_credit")],
                [t("cost_bib"), t("one_credit")],
                [t("cost_equations"), t("one_credit")],
                [t("cost_synthesis"), t("one_credit")],
              ].map(([action, cost]) => (
                <div key={action} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{action}</span>
                  <Badge variant="secondary" className="text-xs">{cost}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-muted-foreground" /> {t("purchase_history")}
          </h2>
          {invoicesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : !invoices?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {t("no_purchases")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv: any) => (
                <Card key={inv.id} data-testid={`card-invoice-${inv.id}`}>
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{inv.credits} {t("credits")}</p>
                      <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{inv.amount.toFixed(2)} €</p>
                      <Badge variant="secondary" className="text-xs">{t("paid")}</Badge>
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
