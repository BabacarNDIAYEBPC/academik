import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { useLocation } from "wouter";
import { Coins, ArrowLeft, Check, Loader2, Receipt } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/use-literature";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CREDIT_PACKS, SEARCH_CREDIT_TIERS } from "@shared/schema";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { isNativeIOS, IAP_PRODUCT_IDS, IAP_PRODUCTS_MAP, getCdvPurchase } from "@/lib/iap";

interface CurrencyInfo {
  currency: string;
  symbol: string;
  rate: number;
  country: string;
}

function formatPrice(eurPrice: number, info: CurrencyInfo): string {
  const converted = eurPrice * info.rate;
  const zeroDecimal = ["jpy", "krw", "vnd", "idr", "clp", "gnf", "mga", "pyg", "rwf", "ugx", "xaf", "xof"];
  if (zeroDecimal.includes(info.currency)) {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toFixed(2)}`;
}

function formatPricePerCredit(eurPrice: number, credits: number, info: CurrencyInfo): string {
  const converted = (eurPrice / credits) * info.rate;
  const zeroDecimal = ["jpy", "krw", "vnd", "idr"];
  if (zeroDecimal.includes(info.currency)) {
    return `${info.symbol}${Math.round(converted)}`;
  }
  return `${info.symbol}${converted.toFixed(2)}`;
}

interface IAPProduct {
  id: string;
  title: string;
  price: string;
  offer: any;
}

export default function Billing() {
  const { t } = useTranslation();
  useSEO("billing");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();
  const queryClient = useQueryClient();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>([]);
  const [iapLoading, setIapLoading] = useState(false);
  const iapInitialized = useRef(false);
  const onNativeIOS = isNativeIOS();

  const { data: invoices, isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: currencyInfo, isLoading: currencyLoading } = useQuery<CurrencyInfo>({
    queryKey: ["/api/currency"],
    staleTime: 1000 * 60 * 60,
    enabled: !onNativeIOS,
  });

  const currency: CurrencyInfo = currencyInfo || { currency: "eur", symbol: "€", rate: 1, country: "XX" };

  const checkoutMutation = useMutation({
    mutationFn: async (packId: string) => {
      const res = await apiRequest("POST", "/api/checkout", {
        packId,
        currency: currency.currency,
        rate: currency.rate,
      });
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
    if (onNativeIOS) {
      initIAP();
    } else {
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
    }
  }, []);

  const initIAP = async () => {
    if (iapInitialized.current) return;
    setIapLoading(true);

    const waitForCdv = (maxMs = 5000): Promise<any> =>
      new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          const cdv = getCdvPurchase();
          if (cdv) { resolve(cdv); return; }
          if (Date.now() - start > maxMs) { resolve(null); return; }
          setTimeout(check, 200);
        };
        check();
      });

    const CdvPurchase = await waitForCdv();
    if (!CdvPurchase) {
      setIapLoading(false);
      return;
    }

    const { store, ProductType, Platform } = CdvPurchase;

    store.register(
      IAP_PRODUCT_IDS.map((id: string) => ({
        id,
        type: ProductType.CONSUMABLE,
        platform: Platform.APPLE_APPSTORE,
      }))
    );

    store.when().approved(async (transaction: any) => {
      try {
        const productId = transaction.products?.[0]?.id;
        const transactionId = transaction.transactionId;
        if (!productId || !transactionId) return;

        const appleReceipt = store.localReceipts?.find(
          (r: any) => r.platform === Platform.APPLE_APPSTORE
        );
        const receiptData = appleReceipt?.nativeData?.appStoreReceipt || "";

        const res = await fetch("/api/iap/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ transactionId, productId, receiptData }),
        });

        if (res.ok) {
          const data = await res.json();
          await transaction.finish();
          queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
          queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
          toast({ title: `✓ ${data.credits} ${t("credits_added")}` });
        } else {
          toast({ title: t("payment_error"), variant: "destructive" });
        }
      } catch {
        toast({ title: t("payment_error"), variant: "destructive" });
      } finally {
        setLoadingPack(null);
      }
    });

    store.when().finished(() => {
      setLoadingPack(null);
    });

    await store.initialize([Platform.APPLE_APPSTORE]);
    iapInitialized.current = true;

    const products: IAPProduct[] = IAP_PRODUCT_IDS.map((id: string) => {
      const p = store.get(id, Platform.APPLE_APPSTORE);
      const offer = p?.offers?.[0];
      return {
        id,
        title: p?.title || id,
        price: offer?.pricingPhases?.[0]?.price || "—",
        offer,
      };
    });
    setIapProducts(products);
    setIapLoading(false);
  };

  const handleIAPBuy = async (productId: string, offer: any) => {
    if (!offer) {
      toast({ title: "Produit non disponible", variant: "destructive" });
      return;
    }
    setLoadingPack(productId);
    try {
      const CdvPurchase = getCdvPurchase();
      await CdvPurchase.store.order(offer);
    } catch {
      toast({ title: t("payment_error"), variant: "destructive" });
      setLoadingPack(null);
    }
  };

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

  const isLoadingPrices = onNativeIOS ? iapLoading : currencyLoading;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
            <span className="font-bold text-lg tracking-tight">{t("app_name")}</span>
          </div>
          <div className="flex items-center gap-2">
            {!onNativeIOS && <LanguageSwitcher compact />}
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
          {CREDIT_PACKS.map((pack, i) => {
            const iapProduct = iapProducts.find(p => p.id === `fr.academik.app.${pack.id}`);
            const displayPrice = onNativeIOS
              ? (iapLoading ? null : (iapProduct?.price ?? "—"))
              : (currencyLoading ? null : formatPrice(pack.price, currency));
            const pricePerCredit = onNativeIOS
              ? null
              : (currencyLoading ? null : `${formatPricePerCredit(pack.price, pack.credits, currency)} / ${t("credit")}`);

            return (
              <Card key={pack.id} className={`relative ${i === 1 ? "border-primary shadow-md" : ""}`} data-testid={`card-pack-${pack.id}`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">{t("popular")}</Badge>
                  </div>
                )}
                <CardContent className="pt-6 pb-5 text-center">
                  <h3 className="font-bold text-base mb-1">{pack.label}</h3>
                  <div className="text-3xl font-bold my-2" data-testid={`text-price-${pack.id}`}>
                    {isLoadingPrices
                      ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      : displayPrice
                    }
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{pack.credits} {t("credits")}</p>
                  {pricePerCredit && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {isLoadingPrices ? "..." : pricePerCredit}
                    </p>
                  )}
                  {!pricePerCredit && <div className="mb-4" />}
                  <div className="space-y-1.5 text-xs text-left mb-5">
                    {[t("feature_articles"), t("feature_analyses"), t("feature_bib")].map(f => (
                      <div key={f} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={i === 1 ? "default" : "outline"}
                    disabled={loadingPack === pack.id || isLoadingPrices}
                    onClick={() => {
                      if (onNativeIOS) {
                        handleIAPBuy(`fr.academik.app.${pack.id}`, iapProduct?.offer);
                      } else {
                        handleBuy(pack.id);
                      }
                    }}
                    data-testid={`button-buy-${pack.id}`}
                  >
                    {loadingPack === pack.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("redirecting")}</>
                    ) : isLoadingPrices ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `${t("buy")} — ${displayPrice ?? ""}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!onNativeIOS && !currencyLoading && currency.currency !== "eur" && (
          <p className="text-xs text-muted-foreground text-center -mt-6 mb-8">
            {t("price_converted_note", { currency: currency.currency.toUpperCase() })}
          </p>
        )}

        {onNativeIOS && (
          <p className="text-xs text-muted-foreground text-center -mt-6 mb-8">
            Paiement sécurisé via Apple — les prix s'affichent dans votre devise locale
          </p>
        )}

        <Card className="mb-8 bg-muted/30">
          <CardContent className="py-4 px-5">
            <h3 className="font-medium text-sm mb-3">{t("action_costs")}</h3>
            <div className="text-sm space-y-0">
              <div className="py-1.5 border-b border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground">{t("cost_search")}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {SEARCH_CREDIT_TIERS.map(tier => (
                    <Badge key={tier.maxArticles} variant="outline" className="text-[11px] font-normal px-1.5">
                      {tier.label} → {tier.credits} crédit{tier.credits > 1 ? "s" : ""}
                    </Badge>
                  ))}
                </div>
              </div>
              {[
                [t("cost_analysis"), t("one_credit")],
                [t("cost_confrontation"), t("one_credit")],
                [t("cost_bib"), t("one_credit")],
                [t("cost_equations"), t("one_credit")],
                [t("cost_synthesis"), t("two_credits")],
              ].map(([action, cost]) => (
                <div key={action} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
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
                      <p className="font-semibold text-sm">
                        {inv.stripeSessionId?.startsWith("iap_") ? "Apple IAP" : `${inv.amount.toFixed(2)} €`}
                      </p>
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
