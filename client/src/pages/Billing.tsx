import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuota, useSurplusPurchase, useConfirmSurplus, getQuotaPercentage, isQuotaExceeded } from "@/hooks/use-quota";
import { useEntitlements, useCheckout, useConfirmPayment, hasEntitlement } from "@/hooks/use-entitlements";
import { useModuleVisibility, isModuleVisible } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  FileText, Zap, FolderOpen, Calendar, ShoppingCart, Loader2, TrendingUp,
  Download, Clock, AlertTriangle, Receipt, Lock, Unlock, CheckCircle2,
  Mic, BarChart3, Search, Presentation, FileCheck, BrainCircuit, Package, ArrowRight,
} from "lucide-react";

const COMPANY_INFO = {
  name: "Performance Consulting Groupe",
  form: "SAS",
  siren: "913 540 944",
  rcs: "Perpignan",
  address: "3 Avenue de Toulouse",
  city: "66140 Canet-en-Roussillon",
  capital: "14 000 €",
  naf: "Formation continue d'adultes",
  president: "Babacar NDIAYE",
};

const CORE_PACK_PRICE = 179;

const CORE_MODULES = [
  { key: "foundation", price: 29, label: "Sujet / Problématique / Hypothèses", description: "Formulation du sujet, problématique et hypothèses de recherche" },
  { key: "plan", price: 25, label: "Plan académique structuré", description: "Plan logique adapté au niveau (Licence / Master / TFE / VAE)" },
  { key: "conceptual", price: 35, label: "Cadre conceptuel (concepts + schémas)", description: "Concepts clés, relations et schémas explicatifs" },
  { key: "literature", price: 49, label: "Revue de littérature", description: "Recherche bibliographique, sélection, filtrage et structuration" },
  { key: "methodology", price: 39, label: "Méthodologie complète", description: "Type de recherche, population, outils de collecte et méthodes d'analyse" },
];

const CORE_MODULES_TOTAL = CORE_MODULES.reduce((sum, m) => sum + m.price, 0);

const OPTION_CATALOG = {
  collecte: [
    { key: "questionnaire", price: 25, label: "Questionnaire (collecte)", description: "Questionnaire structuré, questions uniquement, prêt pour Word" },
    { key: "guide_entretien", price: 25, label: "Guide d'entretien (collecte)", description: "Guide d'entretien qualitatif, questions uniquement" },
    { key: "simulation_entretien", price: 19, label: "Simulation d'entretien IA", description: "Préparez vos entretiens avec simulation IA" },
    { key: "questionnaire_analysis", price: 29, label: "Dépouillement du questionnaire", description: "Exploitation et analyse des réponses au questionnaire" },
  ],
  analyse: [
    { key: "data_visualization", price: 25, label: "Analyse et visualisation des données", description: "Tableaux croisés dynamiques, graphiques et exploitation visuelle" },
    { key: "financial_simulation", price: 29, label: "Simulation financière", description: "Tableaux financiers, simulations chiffrées et calculs dynamiques" },
    { key: "analyse_qualitative", price: 39, label: "Analyse qualitative", description: "Verbatims, codage thématique et synthèse" },
    { key: "analyse_quantitative", price: 39, label: "Analyse quantitative", description: "Tableaux croisés et graphiques" },
  ],
  revue: [
    { key: "article_analysis", price: 29, label: "Résumé & analyse d'articles", description: "Analyse structurée d'articles scientifiques" },
    { key: "article_confrontation", price: 29, label: "Confrontation d'articles", description: "Comparaison critique entre articles" },
    { key: "biblio_multinormes", price: 25, label: "Bibliographie multi-normes", description: "APA, Vancouver, MLA, Chicago" },
  ],
  soutenance: [
    { key: "soutenance_ppt", price: 29, label: "PowerPoint de soutenance", description: "Diaporama structuré pour la soutenance" },
    { key: "soutenance_simulation", price: 29, label: "Simulation de soutenance", description: "Questions type jury et préparation" },
    { key: "audit", price: 49, label: "Audit complet du mémoire", description: "Relecture critique et recommandations" },
  ],
  confort: [
    { key: "export_illimite", price: 19, label: "Export illimité Word / PPT", description: "Export sans limites vers Word et PowerPoint" },
    { key: "fusion_memoire", price: 19, label: "Fusion mémoire en un document", description: "Assemblage de toutes les sections" },
  ],
  ia: [
    { key: "words_20k", price: 19, label: "+20 000 mots IA", description: "Quota supplémentaire de génération" },
    { key: "words_50k", price: 39, label: "+50 000 mots IA", description: "Quota supplémentaire étendu" },
    { key: "extra_project", price: 29, label: "Projet supplémentaire", description: "Un projet actif additionnel" },
  ],
};

const PACK_OPTIONS: Record<string, { keys: string[]; price: number; label: string }> = {
  pack_collecte: { keys: ["questionnaire", "guide_entretien"], price: 45, label: "Pack Collecte" },
  pack_analyse: { keys: ["analyse_qualitative", "analyse_quantitative"], price: 69, label: "Pack Analyse" },
  pack_revue: { keys: ["article_analysis", "article_confrontation", "biblio_multinormes"], price: 59, label: "Pack Revue avancée" },
  pack_soutenance: { keys: ["soutenance_ppt", "soutenance_simulation", "audit"], price: 79, label: "Pack Soutenance & Audit" },
};

const CORE_ENTITLEMENTS = ["foundation", "plan", "conceptual", "literature", "methodology"];

function SubscriptionProgressBar({ periodStart, periodEnd }: { periodStart?: string | null; periodEnd?: string | null }) {
  if (!periodStart || !periodEnd) {
    return (
      <Card data-testid="card-subscription-progress">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune souscription active</p>
        </CardContent>
      </Card>
    );
  }

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const now = new Date();
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  const isExpiringSoon = remainingDays <= 7;
  const isExpired = remainingDays <= 0;

  return (
    <Card data-testid="card-subscription-progress">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Abonnement
        </CardTitle>
        <CardDescription>
          {isExpired
            ? "Votre abonnement a expiré"
            : isExpiringSoon
              ? `Renouvellement dans ${remainingDays} jour${remainingDays > 1 ? "s" : ""}`
              : `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restant${remainingDays > 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
          <span className="text-muted-foreground">
            {start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-muted-foreground">
            {end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <Progress
          value={progressPct}
          className={`h-3 ${isExpired ? "[&>div]:bg-destructive" : isExpiringSoon ? "[&>div]:bg-orange-500" : ""}`}
          data-testid="progress-subscription"
        />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <Badge variant="destructive" data-testid="badge-subscription-status">Expiré</Badge>
            ) : isExpiringSoon ? (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" data-testid="badge-subscription-status">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Expire bientôt
              </Badge>
            ) : (
              <Badge variant="secondary" data-testid="badge-subscription-status">Actif</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {elapsedDays} / {totalDays} jours
          </p>
        </div>

        {isExpired && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm" data-testid="alert-expired">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Abonnement expiré</p>
                <p className="text-muted-foreground mt-1">
                  Veuillez renouveler votre souscription pour continuer à utiliser les fonctionnalités.
                  Un prélèvement automatique sera tenté à la date de renouvellement.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpiringSoon && !isExpired && (
          <div className="p-3 rounded-md bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 text-sm" data-testid="alert-expiring-soon">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-300">Renouvellement imminent</p>
                <p className="text-muted-foreground mt-1">
                  Votre prélèvement automatique sera effectué la veille de la date de renouvellement.
                  Assurez-vous que votre moyen de paiement est à jour.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InvoiceRow({ invoice }: { invoice: any }) {
  const date = new Date(invoice.createdAt);
  const items = (invoice.items as any[]) || [];

  const handleDownload = () => {
    const invoiceHtml = generateInvoiceHTML(invoice);
    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facture-${invoice.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 rounded-md border flex-wrap" data-testid={`invoice-row-${invoice.id}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <Receipt className="w-5 h-5 text-muted-foreground shrink-0" />
        <div>
          <p className="font-medium text-sm">{invoice.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-right">
          <p className="font-medium">{(invoice.amount / 100).toFixed(2)} €</p>
          <p className="text-xs text-muted-foreground">{items.length} article{items.length > 1 ? "s" : ""}</p>
        </div>
        <Badge variant={invoice.status === "paid" ? "secondary" : "destructive"}>
          {invoice.status === "paid" ? "Payée" : "En attente"}
        </Badge>
        <Button size="icon" variant="ghost" onClick={handleDownload} data-testid={`button-download-invoice-${invoice.id}`}>
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function generateInvoiceHTML(invoice: any): string {
  const items = (invoice.items as any[]) || [];
  const date = new Date(invoice.createdAt);
  const totalHT = invoice.amount / 100;

  const itemRows = items.map(
    (it: any) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${it.label || it.key}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${(it.price / 100).toFixed(2)} €</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 40px; color: #333; background: #fff; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company, .client { width: 45%; }
    .company h2, .client h2 { font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
    .company p, .client p { margin: 2px 0; font-size: 13px; line-height: 1.6; }
    .invoice-title { text-align: center; margin: 30px 0; }
    .invoice-title h1 { font-size: 24px; color: #7c3aed; margin: 0; }
    .invoice-title p { color: #666; font-size: 14px; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #7c3aed; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
    th:last-child { text-align: right; }
    .total-row td { font-weight: bold; font-size: 15px; padding: 12px; border-top: 2px solid #7c3aed; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
    @media print { body { padding: 20px; } .footer { position: fixed; bottom: 20px; left: 0; right: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      <h2>Emetteur</h2>
      <p><strong>${COMPANY_INFO.name}</strong></p>
      <p>${COMPANY_INFO.form} au capital de ${COMPANY_INFO.capital}</p>
      <p>${COMPANY_INFO.address}</p>
      <p>${COMPANY_INFO.city}</p>
      <p>SIREN : ${COMPANY_INFO.siren}</p>
      <p>RCS : ${COMPANY_INFO.rcs}</p>
      <p>NAF : ${COMPANY_INFO.naf}</p>
      <p>Président : ${COMPANY_INFO.president}</p>
    </div>
    <div class="client">
      <h2>Client</h2>
      <p><strong>${invoice.clientName || "Client"}</strong></p>
      ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ""}
      ${invoice.clientAddress ? `<p>${invoice.clientAddress}</p>` : ""}
    </div>
  </div>
  <div class="invoice-title">
    <h1>FACTURE</h1>
    <p>N° ${invoice.invoiceNumber}</p>
    <p>Date : ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
  </div>
  <table>
    <thead>
      <tr><th>Désignation</th><th>Montant</th></tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
    <tfoot>
      <tr class="total-row"><td>Total TTC</td><td style="text-align:right;">${totalHT.toFixed(2)} €</td></tr>
    </tfoot>
  </table>
  <p style="font-size:12px;color:#666;">Mode de paiement : ${invoice.paymentMethod === "demo" ? "Mode démonstration" : "Carte bancaire"}</p>
  <p style="font-size:12px;color:#666;">Statut : ${invoice.status === "paid" ? "Payée" : "En attente"}</p>
  <div class="footer">
    <p>${COMPANY_INFO.name} - ${COMPANY_INFO.form} au capital de ${COMPANY_INFO.capital}</p>
    <p>${COMPANY_INFO.address}, ${COMPANY_INFO.city} - SIREN ${COMPANY_INFO.siren} - RCS ${COMPANY_INFO.rcs}</p>
  </div>
</body>
</html>`;
}

function UpgradeSection({ entitlements }: { entitlements: string[] }) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [selectedPacks, setSelectedPacks] = useState<Record<string, boolean>>({});
  const [selectedCoreModules, setSelectedCoreModules] = useState<Record<string, boolean>>({});
  const [corePackSelected, setCorePackSelected] = useState(false);
  const checkout = useCheckout();
  const { toast } = useToast();
  const { data: moduleVis } = useModuleVisibility();

  const visibleCoreModules = CORE_MODULES.filter(m => isModuleVisible(moduleVis, m.key));
  const coreOwned = CORE_ENTITLEMENTS.every(e => hasEntitlement(entitlements, e));

  const isItemOwned = (key: string): boolean => {
    return hasEntitlement(entitlements, key);
  };

  const isPackFullyOwned = (packKey: string): boolean => {
    const packDef = PACK_OPTIONS[packKey];
    if (!packDef) return false;
    return packDef.keys.every(k => hasEntitlement(entitlements, k));
  };

  const handleCoreModuleToggle = (key: string) => {
    if (isItemOwned(key) || corePackSelected) return;
    setSelectedCoreModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCorePackSelect = () => {
    if (coreOwned) return;
    const next = !corePackSelected;
    setCorePackSelected(next);
    if (next) {
      setSelectedCoreModules({});
    }
  };

  const handleOptionToggle = (key: string) => {
    if (isItemOwned(key)) return;
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePackToggle = (packKey: string) => {
    if (isPackFullyOwned(packKey)) return;
    const packDef = PACK_OPTIONS[packKey];
    if (!packDef) return;
    const isActive = !selectedPacks[packKey];
    setSelectedPacks(prev => ({ ...prev, [packKey]: isActive }));
    if (isActive) {
      const newOpts = { ...selectedOptions };
      packDef.keys.forEach(k => { newOpts[k] = false; });
      setSelectedOptions(newOpts);
    }
  };

  const selectedCoreModulesTotal = Object.entries(selectedCoreModules)
    .filter(([, v]) => v)
    .reduce((sum, [key]) => {
      const mod = CORE_MODULES.find(m => m.key === key);
      return sum + (mod?.price || 0);
    }, 0);

  const selectedCoreModuleCount = Object.values(selectedCoreModules).filter(Boolean).length;

  const shouldSuggestPack = selectedCoreModulesTotal > CORE_PACK_PRICE && !corePackSelected;

  const handleCheckout = () => {
    const items: string[] = [];
    if (corePackSelected && !coreOwned) {
      items.push("core_pack");
    } else {
      Object.entries(selectedCoreModules).filter(([, v]) => v).forEach(([key]) => {
        if (!isItemOwned(key)) items.push(key);
      });
    }
    Object.entries(selectedPacks).filter(([, v]) => v).forEach(([packKey]) => {
      items.push(packKey);
    });
    Object.entries(selectedOptions).filter(([, v]) => v).forEach(([key]) => {
      const isInPack = Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
      if (!isInPack) items.push(key);
    });
    if (items.length > 0) {
      checkout.mutate({ items }, {
        onError: (err: any) => {
          toast({ title: "Erreur de paiement", description: err.message || "Impossible de procéder au paiement. Veuillez réessayer.", variant: "destructive" });
        },
      });
    }
  };

  const optionsTotal = Object.entries(selectedOptions)
    .filter(([key, v]) => {
      if (!v) return false;
      const isInPack = Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
      return !isInPack;
    })
    .reduce((sum, [key]) => {
      const allItems = Object.values(OPTION_CATALOG).flat();
      const item = allItems.find(i => i.key === key);
      return sum + (item?.price || 0);
    }, 0);

  const packsTotal = Object.entries(selectedPacks)
    .filter(([, v]) => v)
    .reduce((sum, [key]) => sum + (PACK_OPTIONS[key]?.price || 0), 0);

  const coreTotal = corePackSelected && !coreOwned ? CORE_PACK_PRICE : selectedCoreModulesTotal;
  const total = coreTotal + optionsTotal + packsTotal;

  const filterItems = (items: typeof OPTION_CATALOG.collecte) =>
    items.filter(item => isModuleVisible(moduleVis, item.key));

  const categories: { catKey: string; title: string; icon: any; items: typeof OPTION_CATALOG.collecte; packKey?: string }[] = [
    { catKey: "collecte", title: "Collecte de données", icon: Mic, items: filterItems(OPTION_CATALOG.collecte), packKey: "pack_collecte" },
    { catKey: "analyse", title: "Analyse de données", icon: BarChart3, items: filterItems(OPTION_CATALOG.analyse), packKey: "pack_analyse" },
    { catKey: "revue", title: "Revue & Bibliographie", icon: Search, items: filterItems(OPTION_CATALOG.revue), packKey: "pack_revue" },
    { catKey: "soutenance", title: "Soutenance & Audit", icon: Presentation, items: filterItems(OPTION_CATALOG.soutenance), packKey: "pack_soutenance" },
    { catKey: "confort", title: "Confort & Export", icon: FileCheck, items: filterItems(OPTION_CATALOG.confort) },
    { catKey: "ia", title: "Quotas IA", icon: BrainCircuit, items: filterItems(OPTION_CATALOG.ia) },
  ].filter(cat => cat.items.length > 0);

  return (
    <Card data-testid="card-upgrade-modules">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Unlock className="w-5 h-5" />
          Modules & Fonctionnalités
        </CardTitle>
        <CardDescription>Sélectionnez le pack complet ou achetez chaque module individuellement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold">Fondations Mémoire / TFE / VAE</h3>
          </div>

          <Card
            className={`cursor-pointer transition-all border-2 ${
              coreOwned
                ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10 opacity-70"
                : corePackSelected
                  ? "border-primary bg-primary/5"
                  : "border-dashed border-primary/30"
            }`}
            onClick={handleCorePackSelect}
            data-testid="billing-core-pack"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {coreOwned ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <Checkbox
                      checked={corePackSelected}
                      disabled={coreOwned}
                      onCheckedChange={handleCorePackSelect}
                      data-testid="checkbox-billing-core"
                    />
                  )}
                  <div>
                    <span className="font-bold text-base">Pack Fondations complet</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Tous les modules ci-dessous inclus + Workflow, sauvegarde, export Word, 20 000 mots IA</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {coreOwned && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Activé
                    </Badge>
                  )}
                  <div className="text-right">
                    <Badge className="text-lg font-extrabold px-3 py-1">{CORE_PACK_PRICE} &euro;</Badge>
                    <p className="text-xs text-muted-foreground mt-1">au lieu de {CORE_MODULES_TOTAL} &euro;</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-x-0 top-0 flex justify-center -translate-y-1/2">
              <span className="bg-background px-3 text-xs text-muted-foreground font-medium uppercase tracking-wider">ou achetez à l'unité</span>
            </div>
            <div className="border rounded-lg p-4 pt-5 space-y-2">
              {visibleCoreModules.map((mod) => {
                const owned = isItemOwned(mod.key);
                const inPack = corePackSelected;
                return (
                  <label
                    key={mod.key}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 transition-all ${
                      owned
                        ? "opacity-60 bg-green-50/30 dark:bg-green-900/5"
                        : inPack
                          ? "opacity-40"
                          : "cursor-pointer hover-elevate"
                    }`}
                    data-testid={`billing-module-${mod.key}`}
                  >
                    <div className="flex items-center gap-3">
                      {owned ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Checkbox
                          checked={inPack || !!selectedCoreModules[mod.key]}
                          disabled={owned || inPack}
                          onCheckedChange={() => handleCoreModuleToggle(mod.key)}
                          data-testid={`checkbox-billing-${mod.key}`}
                        />
                      )}
                      <div>
                        <span className="text-sm font-medium">{mod.label}</span>
                        <p className="text-xs text-muted-foreground">{mod.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {owned && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          Activé
                        </Badge>
                      )}
                      <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{mod.price} &euro;</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {shouldSuggestPack && (
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 space-y-3" data-testid="alert-suggest-pack">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Le Pack Fondations est plus avantageux !</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Votre sélection ({selectedCoreModuleCount} modules) revient à {selectedCoreModulesTotal} &euro;.
                    Le Pack complet avec TOUS les modules ne coûte que <strong>{CORE_PACK_PRICE} &euro;</strong> &mdash; vous économisez {selectedCoreModulesTotal - CORE_PACK_PRICE} &euro;.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => { setCorePackSelected(true); setSelectedCoreModules({}); }}
                data-testid="button-switch-to-pack"
              >
                <Package className="w-4 h-4 mr-2" />
                Passer au Pack Fondations ({CORE_PACK_PRICE} &euro;)
              </Button>
            </div>
          )}
        </div>

        {categories.map(({ catKey, title, icon: CatIcon, items, packKey }) => {
          const packDef = packKey ? PACK_OPTIONS[packKey] : null;
          const packActive = packKey ? !!selectedPacks[packKey] : false;
          const packFullyOwned = packKey ? isPackFullyOwned(packKey) : false;

          return (
            <Card key={catKey}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <CatIcon className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map((item) => {
                  const owned = isItemOwned(item.key);
                  const isInActivePack = packActive && packDef?.keys.includes(item.key);
                  return (
                    <label
                      key={item.key}
                      className={`flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 transition-all ${
                        owned
                          ? "opacity-60 bg-green-50/30 dark:bg-green-900/5"
                          : isInActivePack
                            ? "opacity-50 cursor-pointer"
                            : "cursor-pointer hover-elevate"
                      }`}
                      data-testid={`billing-option-${item.key}`}
                    >
                      <div className="flex items-center gap-3">
                        {owned ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        ) : (
                          <Checkbox
                            checked={isInActivePack || !!selectedOptions[item.key]}
                            disabled={owned || isInActivePack}
                            onCheckedChange={() => handleOptionToggle(item.key)}
                            data-testid={`checkbox-billing-${item.key}`}
                          />
                        )}
                        <div>
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {owned && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                            Activé
                          </Badge>
                        )}
                        <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{item.price} &euro;</span>
                      </div>
                    </label>
                  );
                })}
                {packDef && (
                  <div
                    onClick={() => !packFullyOwned && handlePackToggle(packKey!)}
                    className={`flex items-center justify-between gap-4 p-3 rounded-lg border-2 transition-all mt-2 ${
                      packFullyOwned
                        ? "border-green-500/30 bg-green-50/30 dark:bg-green-900/5 opacity-60"
                        : packActive
                          ? "border-primary bg-primary/5 cursor-pointer"
                          : "border-dashed border-primary/30 cursor-pointer hover-elevate"
                    }`}
                    data-testid={`billing-pack-${packKey}`}
                  >
                    <div className="flex items-center gap-3">
                      {packFullyOwned ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Checkbox checked={packActive} onCheckedChange={() => handlePackToggle(packKey!)} />
                      )}
                      <div>
                        <span className="text-sm font-bold flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          {packDef.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {packFullyOwned ? "Tous les modules inclus sont activés" : "Tout inclus, économisez !"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {packFullyOwned && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          Activé
                        </Badge>
                      )}
                      <Badge className="font-extrabold">{packDef.price} &euro;</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {total > 0 && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-sm opacity-80 uppercase tracking-wider">Total à payer</p>
                <p className="text-4xl font-extrabold" data-testid="text-upgrade-total">
                  {total} &euro;
                </p>
                <div className="text-left text-sm space-y-1 opacity-90">
                  {corePackSelected && !coreOwned && <div className="flex justify-between gap-2"><span>Pack Fondations complet</span><span>{CORE_PACK_PRICE} &euro;</span></div>}
                  {!corePackSelected && Object.entries(selectedCoreModules).filter(([, v]) => v).map(([key]) => {
                    const mod = CORE_MODULES.find(m => m.key === key);
                    if (!mod) return null;
                    return <div key={key} className="flex justify-between gap-2"><span>{mod.label}</span><span>{mod.price} &euro;</span></div>;
                  })}
                  {Object.entries(selectedPacks).filter(([, v]) => v).map(([pk]) => (
                    <div key={pk} className="flex justify-between gap-2"><span>{PACK_OPTIONS[pk].label}</span><span>{PACK_OPTIONS[pk].price} &euro;</span></div>
                  ))}
                  {Object.entries(selectedOptions).filter(([key, v]) => {
                    if (!v) return false;
                    return !Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
                  }).map(([key]) => {
                    const item = Object.values(OPTION_CATALOG).flat().find(i => i.key === key);
                    if (!item) return null;
                    return <div key={key} className="flex justify-between gap-2"><span>{item.label}</span><span>{item.price} &euro;</span></div>;
                  })}
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full mt-2"
                  disabled={total === 0 || checkout.isPending}
                  onClick={handleCheckout}
                  data-testid="button-upgrade-pay"
                >
                  {checkout.isPending ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                  Payer et activer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default function Billing() {
  const { data: quota, isLoading } = useQuota();
  const surplusMutation = useSurplusPurchase();
  const confirmPayment = useConfirmPayment();
  const confirmSurplus = useConfirmSurplus();
  const { toast } = useToast();
  const { data: entData, isLoading: entLoading } = useEntitlements();
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });
  const confirmAttempted = useRef(false);

  useEffect(() => {
    if (confirmAttempted.current) return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const surplus = params.get("surplus");
    const sessionId = params.get("session_id");

    if (payment === "success" && sessionId) {
      confirmAttempted.current = true;
      confirmPayment.mutate(sessionId, {
        onSuccess: () => {
          toast({ title: "Paiement confirmé", description: "Vos modules ont été activés avec succès." });
          queryClient.invalidateQueries({ queryKey: ["/api/entitlements"] });
          queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
          queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
          queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
          window.history.replaceState({}, "", window.location.pathname);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de confirmer le paiement. Contactez le support.", variant: "destructive" });
          window.history.replaceState({}, "", window.location.pathname);
        },
      });
    } else if (surplus === "success" && sessionId) {
      confirmAttempted.current = true;
      confirmSurplus.mutate(sessionId, {
        onSuccess: () => {
          toast({ title: "Surplus activé", description: "Votre quota a été augmenté avec succès." });
          queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
          queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
          window.history.replaceState({}, "", window.location.pathname);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de confirmer le surplus. Contactez le support.", variant: "destructive" });
          window.history.replaceState({}, "", window.location.pathname);
        },
      });
    } else if (payment === "cancelled" || surplus === "cancelled") {
      toast({ title: "Paiement annulé", description: "Votre paiement a été annulé." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleBuySurplus = async (key: string) => {
    try {
      await surplusMutation.mutateAsync(key);
      toast({ title: "Surplus activé", description: "Votre quota a été augmenté." });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'acheter le surplus", variant: "destructive" });
    }
  };

  if (isLoading || entLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!quota) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Impossible de charger les quotas.</p>
        </div>
      </Layout>
    );
  }

  const wordsPct = getQuotaPercentage(quota.wordsUsed, quota.wordsLimit);
  const actionsPct = getQuotaPercentage(quota.actionsUsed, quota.actionsLimit);
  const projectsPct = getQuotaPercentage(quota.activeProjects, quota.activeProjectsLimit);

  return (
    <Layout>
      <div className="space-y-6" data-testid="page-billing">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-billing-title">Facturation & Quotas</h1>
          <p className="text-muted-foreground mt-1">Gérez votre abonnement, vos modules et consultez vos factures</p>
        </div>

        <SubscriptionProgressBar periodStart={quota.periodStart} periodEnd={quota.periodEnd} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-words-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mots générés</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-words-used">
                {quota.wordsUsed.toLocaleString("fr-FR")}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.wordsLimit.toLocaleString("fr-FR")} mots / mois
              </p>
              <Progress 
                value={wordsPct} 
                className={`mt-3 h-2 ${isQuotaExceeded(quota.wordsUsed, quota.wordsLimit) ? "[&>div]:bg-destructive" : wordsPct > 80 ? "[&>div]:bg-orange-500" : ""}`}
              />
            </CardContent>
          </Card>

          <Card data-testid="card-actions-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions IA</CardTitle>
              <Zap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-actions-used">
                {quota.actionsUsed}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.actionsLimit} actions / mois
              </p>
              <Progress 
                value={actionsPct} 
                className={`mt-3 h-2 ${isQuotaExceeded(quota.actionsUsed, quota.actionsLimit) ? "[&>div]:bg-destructive" : actionsPct > 80 ? "[&>div]:bg-orange-500" : ""}`}
              />
            </CardContent>
          </Card>

          <Card data-testid="card-projects-quota">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets actifs</CardTitle>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-projects-count">
                {quota.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {quota.activeProjectsLimit} projets actifs
              </p>
              <Progress 
                value={projectsPct} 
                className={`mt-3 h-2 ${quota.activeProjects >= quota.activeProjectsLimit ? "[&>div]:bg-destructive" : ""}`}
              />
            </CardContent>
          </Card>
        </div>

        <UpgradeSection entitlements={entData?.entitlements || []} />

        <Card data-testid="card-invoices">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Mes factures
            </CardTitle>
            <CardDescription>Historique de vos factures avec téléchargement</CardDescription>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !invoicesData?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune facture disponible</p>
            ) : (
              <div className="space-y-3">
                {invoicesData.map((inv: any) => (
                  <InvoiceRow key={inv.id} invoice={inv} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-surplus-options">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Packs supplémentaires
            </CardTitle>
            <CardDescription>Augmentez vos quotas en achetant des packs à la carte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(quota.surplusOptions || {}).map(([key, opt]) => (
                <div key={key} className="flex items-center justify-between gap-3 p-4 rounded-md border flex-wrap">
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <Badge variant="secondary" className="mt-1">
                      {(opt.price / 100).toFixed(0)} €
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleBuySurplus(key)}
                    disabled={surplusMutation.isPending}
                    data-testid={`button-buy-${key}`}
                  >
                    {surplusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-1" />
                    )}
                    Acheter
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-payment-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Prélèvement automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Le prélèvement automatique est effectué la veille de chaque date de renouvellement.
              Si le paiement échoue, vous recevrez une notification et une relance sera effectuée sous 3 jours.
            </p>
            <div className="p-3 rounded-md border text-sm space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-muted-foreground">Prochain prélèvement</span>
                <span className="font-medium" data-testid="text-next-payment-date">
                  {quota.periodEnd
                    ? (() => {
                        const d = new Date(quota.periodEnd);
                        d.setDate(d.getDate() - 1);
                        return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                      })()
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-muted-foreground">Mode de paiement</span>
                <span className="font-medium">Carte bancaire</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
