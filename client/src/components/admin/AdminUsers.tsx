import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminUsers, useAddCredits, useUpdateUserQuota } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Plus, Edit, Loader2, User } from "lucide-react";

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
                    <th className="text-left p-3 font-medium">Projets</th>
                    <th className="text-left p-3 font-medium">Mots</th>
                    <th className="text-left p-3 font-medium">Actions IA</th>
                    <th className="text-left p-3 font-medium">Inscription</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u: any) => (
                    <tr key={u.id} className="border-b hover-elevate" data-testid={`row-user-${u.id}`}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{u.firstName || ""} {u.lastName || ""}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.email || "-"}</td>
                      <td className="p-3">
                        <Badge variant={u.status === "paid" ? "default" : "secondary"}>
                          {u.status === "paid" ? "Payant" : "Essai"}
                        </Badge>
                      </td>
                      <td className="p-3">{u.projectCount}</td>
                      <td className="p-3">{u.quota?.wordsUsed || 0} / {u.quota?.wordsLimit || 0}</td>
                      <td className="p-3">{u.quota?.actionsUsed || 0} / {u.quota?.actionsLimit || 0}</td>
                      <td className="p-3 text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!users || users.length === 0) && (
                    <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
