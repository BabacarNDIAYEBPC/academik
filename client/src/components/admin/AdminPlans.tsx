import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react";

const EMPTY_PLAN = {
  key: "",
  name: "",
  price: 0,
  duration: "monthly",
  projectsLimit: 3,
  wordsLimit: 20000,
  actionsLimit: 200,
  documentsLimit: 20,
  modulesEnabled: [] as string[],
  marketingLabel: "",
  isActive: true,
};

export default function AdminPlans() {
  const { data: plansList, isLoading } = useAdminPlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_PLAN);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_PLAN);
    setDialogOpen(true);
  };

  const openEdit = (plan: any) => {
    setEditingPlan(plan);
    setForm({
      key: plan.key,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      projectsLimit: plan.projectsLimit,
      wordsLimit: plan.wordsLimit,
      actionsLimit: plan.actionsLimit,
      documentsLimit: plan.documentsLimit,
      modulesEnabled: plan.modulesEnabled || [],
      marketingLabel: plan.marketingLabel || "",
      isActive: plan.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) {
        await updateMutation.mutateAsync({ id: editingPlan.id, updates: form });
        toast({ title: "Plan modifié" });
      } else {
        await createMutation.mutateAsync(form);
        toast({ title: "Plan créé" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Plan supprimé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-plans">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold">Gestion des offres</h2>
        <Button onClick={openCreate} data-testid="button-create-plan">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plansList?.map((plan: any) => (
            <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(plan)} data-testid={`button-edit-plan-${plan.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(plan.id)} data-testid={`button-delete-plan-${plan.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{(plan.price / 100).toFixed(2)} &euro;</span>
                  <span className="text-muted-foreground">/{plan.duration === "monthly" ? "mois" : "an"}</span>
                </div>
                {plan.marketingLabel && <Badge variant="secondary">{plan.marketingLabel}</Badge>}
                {!plan.isActive && <Badge variant="outline">Inactif</Badge>}
                <div className="text-sm text-muted-foreground space-y-1 pt-2">
                  <p>{plan.projectsLimit} projets</p>
                  <p>{plan.wordsLimit.toLocaleString()} mots/mois</p>
                  <p>{plan.actionsLimit} actions IA/mois</p>
                  <p>{plan.documentsLimit} documents</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!plansList || plansList.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                Aucun plan configuré. Créez votre premier plan.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Modifier le plan" : "Nouveau plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clé unique</Label>
                <Input value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} disabled={!!editingPlan} data-testid="input-plan-key" />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="input-plan-name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prix (centimes)</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} data-testid="input-plan-price" />
              </div>
              <div className="space-y-2">
                <Label>Durée</Label>
                <Select value={form.duration} onValueChange={v => setForm({ ...form, duration: v })}>
                  <SelectTrigger data-testid="select-plan-duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="annual">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Projets max</Label>
                <Input type="number" value={form.projectsLimit} onChange={e => setForm({ ...form, projectsLimit: Number(e.target.value) })} data-testid="input-plan-projects" />
              </div>
              <div className="space-y-2">
                <Label>Mots/mois</Label>
                <Input type="number" value={form.wordsLimit} onChange={e => setForm({ ...form, wordsLimit: Number(e.target.value) })} data-testid="input-plan-words" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Actions IA/mois</Label>
                <Input type="number" value={form.actionsLimit} onChange={e => setForm({ ...form, actionsLimit: Number(e.target.value) })} data-testid="input-plan-actions" />
              </div>
              <div className="space-y-2">
                <Label>Documents max</Label>
                <Input type="number" value={form.documentsLimit} onChange={e => setForm({ ...form, documentsLimit: Number(e.target.value) })} data-testid="input-plan-docs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Étiquette marketing</Label>
              <Input value={form.marketingLabel} onChange={e => setForm({ ...form, marketingLabel: e.target.value })} placeholder="ex: Le plus populaire" data-testid="input-plan-label" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => setForm({ ...form, isActive: v })} data-testid="switch-plan-active" />
              <Label>Plan actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-plan">
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingPlan ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
