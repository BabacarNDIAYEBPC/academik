import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminUsers, useAddCredits, useUpdateUserQuota } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, Download, Plus, Edit, Loader2, User, ShieldCheck, CreditCard, Key } from "lucide-react";

const ITEM_LABELS: Record<string, string> = {
  core_pack: "Pack Fondations",
  pack_collecte: "Pack Collecte",
  pack_analyse: "Pack Analyse",
  pack_revue: "Pack Revue",
  pack_soutenance: "Pack Soutenance",
  foundation: "Fondations",
  plan: "Plan de travail",
  conceptual: "Cadre conceptuel",
  literature: "Revue de littérature",
  methodology: "Méthodologie",
  redaction: "Rédaction assistée",
  questionnaire: "Questionnaire",
  guide_entretien: "Guide d'entretien",
  simulation_entretien: "Simulation d'entretien",
  analyse_qualitative: "Analyse qualitative",
  analyse_quantitative: "Analyse quantitative",
  data_visualization: "Visualisation données",
  financial_simulation: "Simulation financière",
  questionnaire_analysis: "Analyse questionnaire",
  biblio_multinormes: "Bibliographie",
  export_illimite: "Export illimité",
  soutenance_ppt: "PPT Soutenance",
  soutenance_simulation: "Simulation Soutenance",
  audit: "Audit mémoire",
};

const ENTITLEMENT_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Packs", keys: ["core_pack", "pack_collecte", "pack_analyse", "pack_revue", "pack_soutenance"] },
  { label: "Modules individuels", keys: ["foundation", "plan", "conceptual", "literature", "methodology", "redaction"] },
  { label: "Collecte", keys: ["questionnaire", "guide_entretien", "simulation_entretien"] },
  { label: "Analyse", keys: ["analyse_qualitative", "analyse_quantitative", "data_visualization", "financial_simulation", "questionnaire_analysis"] },
  { label: "Revue & Production", keys: ["biblio_multinormes", "export_illimite"] },
  { label: "Soutenance", keys: ["soutenance_ppt", "soutenance_simulation", "audit"] },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { data: users, isLoading } = useAdminUsers(debouncedSearch);
  const addCreditsMutation = useAddCredits();
  const updateQuotaMutation = useUpdateUserQuota();
  const { toast } = useToast();

  const [creditsDialog, setCreditsDialog] = useState<{ userId: string; name: string } | null>(null);
  const [creditsWords, setCreditsWords] = useState(0);
  const [creditsActions, setCreditsActions] = useState(0);

  const [quotaDialog, setQuotaDialog] = useState<any>(null);
  const [quotaForm, setQuotaForm] = useState<any>({});

  const [detailDialog, setDetailDialog] = useState<any>(null);

  const [entitlementDialog, setEntitlementDialog] = useState<{ userId: string; name: string } | null>(null);

  const { data: userEntitlements, isLoading: entitlementsLoading } = useQuery<{ items: string[] }>({
    queryKey: ["/api/admin/users", entitlementDialog?.userId, "entitlements"],
    enabled: !!entitlementDialog,
  });

  const grantEntitlement = useMutation({
    mutationFn: async ({ userId, itemKey }: { userId: string; itemKey: string }) => {
      await apiRequest("POST", `/api/admin/users/${userId}/entitlements`, { itemKey });
    },
    onSuccess: () => {
      if (entitlementDialog) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users", entitlementDialog.userId, "entitlements"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      }
    },
  });

  const revokeEntitlement = useMutation({
    mutationFn: async ({ userId, itemKey }: { userId: string; itemKey: string }) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}/entitlements/${itemKey}`);
    },
    onSuccess: () => {
      if (entitlementDialog) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users", entitlementDialog.userId, "entitlements"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      }
    },
  });

  const handleToggleEntitlement = async (itemKey: string, currentlyActive: boolean) => {
    if (!entitlementDialog) return;
    try {
      if (currentlyActive) {
        await revokeEntitlement.mutateAsync({ userId: entitlementDialog.userId, itemKey });
        toast({ title: "Module retiré", description: `${ITEM_LABELS[itemKey] || itemKey} retiré pour ${entitlementDialog.name}` });
      } else {
        await grantEntitlement.mutateAsync({ userId: entitlementDialog.userId, itemKey });
        toast({ title: "Module accordé", description: `${ITEM_LABELS[itemKey] || itemKey} accordé à ${entitlementDialog.name}` });
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  let searchTimeout: any;
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const handleExportCSV = () => {
    window.open("/api/admin/users/export/csv", "_blank");
  };

  const handleAddCredits = async () => {
    if (!creditsDialog) return;
    try {
      await addCreditsMutation.mutateAsync({ userId: creditsDialog.userId, words: creditsWords, actions: creditsActions });
      toast({ title: "Crédits ajoutés", description: `+${creditsWords} mots, +${creditsActions} actions pour ${creditsDialog.name}` });
      setCreditsDialog(null);
      setCreditsWords(0);
      setCreditsActions(0);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateQuota = async () => {
    if (!quotaDialog) return;
    try {
      await updateQuotaMutation.mutateAsync({ userId: quotaDialog.id, updates: quotaForm });
      toast({ title: "Quotas modifiés", description: `Quotas mis à jour pour ${quotaDialog.firstName || ""} ${quotaDialog.lastName || ""}` });
      setQuotaDialog(null);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const openQuotaDialog = (user: any) => {
    setQuotaDialog(user);
    setQuotaForm({
      wordsLimit: user.quota?.wordsLimit || 20000,
      actionsLimit: user.quota?.actionsLimit || 200,
      activeProjectsLimit: user.quota?.activeProjectsLimit || 3,
      documentsLimit: user.quota?.documentsLimit || 20,
    });
  };

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold">Utilisateurs</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search-users"
            />
          </div>
          <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Utilisateur</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Statut</th>
                    <th className="text-left p-3 font-medium">Modules achetés</th>
                    <th className="text-right p-3 font-medium">Montant payé</th>
                    <th className="text-left p-3 font-medium">Projets</th>
                    <th className="text-left p-3 font-medium">Inscription</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u: any) => {
                    const totalPaid = (u.totalPaid || 0);
                    const purchaseItems = u.purchaseItems || [];
                    return (
                      <tr key={u.id} className="border-b hover-elevate" data-testid={`row-user-${u.id}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{u.firstName || ""} {u.lastName || ""}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{u.email || "-"}</td>
                        <td className="p-3">
                          {u.status === "paid" ? (
                            <Badge variant="default">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Payant
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Essai</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {purchaseItems.length > 0 ? purchaseItems.map((item: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {ITEM_LABELS[item] || item}
                              </Badge>
                            )) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {totalPaid > 0 ? (
                            <span className="text-green-600 dark:text-green-400">{(totalPaid / 100).toFixed(2)} &euro;</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">{u.projectCount}</td>
                        <td className="p-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDetailDialog(u)}
                              data-testid={`button-details-${u.id}`}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setCreditsDialog({ userId: u.id, name: `${u.firstName || ""} ${u.lastName || ""}` })}
                              data-testid={`button-add-credits-${u.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openQuotaDialog(u)}
                              data-testid={`button-edit-quota-${u.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEntitlementDialog({ userId: u.id, name: `${u.firstName || ""} ${u.lastName || ""}` })}
                              data-testid={`button-entitlements-${u.id}`}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!users || users.length === 0) && (
                    <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails — {detailDialog?.firstName} {detailDialog?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Email</div>
              <div>{detailDialog?.email || "-"}</div>
              <div className="text-muted-foreground">Inscription</div>
              <div>{detailDialog?.createdAt ? new Date(detailDialog.createdAt).toLocaleDateString("fr-FR") : "-"}</div>
              <div className="text-muted-foreground">Statut</div>
              <div>{detailDialog?.status === "paid" ? "Payant" : "Essai"}</div>
              <div className="text-muted-foreground">Projets actifs</div>
              <div>{detailDialog?.projectCount || 0}</div>
              <div className="text-muted-foreground">Mots utilisés</div>
              <div>{detailDialog?.quota?.wordsUsed || 0} / {detailDialog?.quota?.wordsLimit || 0}</div>
              <div className="text-muted-foreground">Actions IA</div>
              <div>{detailDialog?.quota?.actionsUsed || 0} / {detailDialog?.quota?.actionsLimit || 0}</div>
            </div>
            {detailDialog?.purchases && detailDialog.purchases.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Achats effectués</Label>
                <div className="space-y-1">
                  {detailDialog.purchases.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm border rounded-md p-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{ITEM_LABELS[p.itemKey] || p.itemKey}</Badge>
                        <span className="text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : ""}</span>
                      </div>
                      <span className="font-medium">{(p.price / 100).toFixed(2)} &euro;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!creditsDialog} onOpenChange={() => setCreditsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des crédits — {creditsDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mots supplémentaires</Label>
              <Input type="number" value={creditsWords} onChange={e => setCreditsWords(Number(e.target.value))} data-testid="input-credits-words" />
            </div>
            <div className="space-y-2">
              <Label>Actions IA supplémentaires</Label>
              <Input type="number" value={creditsActions} onChange={e => setCreditsActions(Number(e.target.value))} data-testid="input-credits-actions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditsDialog(null)}>Annuler</Button>
            <Button onClick={handleAddCredits} disabled={addCreditsMutation.isPending} data-testid="button-confirm-credits">
              {addCreditsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!quotaDialog} onOpenChange={() => setQuotaDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les quotas — {quotaDialog?.firstName} {quotaDialog?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Limite de mots/mois</Label>
              <Input type="number" value={quotaForm.wordsLimit || 0} onChange={e => setQuotaForm({ ...quotaForm, wordsLimit: Number(e.target.value) })} data-testid="input-quota-words" />
            </div>
            <div className="space-y-2">
              <Label>Limite d'actions IA/mois</Label>
              <Input type="number" value={quotaForm.actionsLimit || 0} onChange={e => setQuotaForm({ ...quotaForm, actionsLimit: Number(e.target.value) })} data-testid="input-quota-actions" />
            </div>
            <div className="space-y-2">
              <Label>Limite de projets actifs</Label>
              <Input type="number" value={quotaForm.activeProjectsLimit || 0} onChange={e => setQuotaForm({ ...quotaForm, activeProjectsLimit: Number(e.target.value) })} data-testid="input-quota-projects" />
            </div>
            <div className="space-y-2">
              <Label>Limite de documents</Label>
              <Input type="number" value={quotaForm.documentsLimit || 0} onChange={e => setQuotaForm({ ...quotaForm, documentsLimit: Number(e.target.value) })} data-testid="input-quota-docs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuotaDialog(null)}>Annuler</Button>
            <Button onClick={handleUpdateQuota} disabled={updateQuotaMutation.isPending} data-testid="button-confirm-quota">
              {updateQuotaMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!entitlementDialog} onOpenChange={() => setEntitlementDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer les modules — {entitlementDialog?.name}</DialogTitle>
          </DialogHeader>
          {entitlementsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {ENTITLEMENT_GROUPS.map(group => (
                <div key={group.label} className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group.label}</Label>
                  <div className="space-y-2">
                    {group.keys.map(key => {
                      const isActive = userEntitlements?.items?.includes(key) || false;
                      const isMutating = grantEntitlement.isPending || revokeEntitlement.isPending;
                      return (
                        <div key={key} className="flex items-center justify-between gap-4 rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{ITEM_LABELS[key] || key}</span>
                            {isActive && <Badge variant="default" className="text-xs">Actif</Badge>}
                          </div>
                          <Switch
                            checked={isActive}
                            disabled={isMutating}
                            onCheckedChange={() => handleToggleEntitlement(key, isActive)}
                            data-testid={`switch-entitlement-${key}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntitlementDialog(null)} data-testid="button-close-entitlements">Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
