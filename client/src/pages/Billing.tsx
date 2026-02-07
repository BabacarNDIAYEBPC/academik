import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuota, useSurplusPurchase, getQuotaPercentage, isQuotaExceeded } from "@/hooks/use-quota";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FileText, Zap, FolderOpen, Calendar, ShoppingCart, Loader2, TrendingUp, Download, Clock, AlertTriangle, Receipt } from "lucide-react";

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

export default function Billing() {
  const { data: quota, isLoading } = useQuota();
  const surplusMutation = useSurplusPurchase();
  const { toast } = useToast();
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const handleBuySurplus = async (key: string) => {
    try {
      await surplusMutation.mutateAsync(key);
      toast({ title: "Surplus activé", description: "Votre quota a été augmenté." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'acheter le surplus", variant: "destructive" });
    }
  };

  if (isLoading) {
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
          <p className="text-muted-foreground mt-1">Gérez votre abonnement, vos quotas et consultez vos factures</p>
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
