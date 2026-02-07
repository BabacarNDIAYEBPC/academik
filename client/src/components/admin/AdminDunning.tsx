import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Bell, CheckCircle2, AlertTriangle, Clock, Send, Settings, Play, RefreshCw } from "lucide-react";
import { useState } from "react";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  "24h": { label: "24h envoyé", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  "72h": { label: "72h envoyé", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  "7d": { label: "7 jours", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  "14d": { label: "14 jours", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  "30d": { label: "1 mois", color: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300" },
  exhausted: { label: "Épuisé", color: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400" },
};

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " \u20ac";
}

export default function AdminDunning() {
  const { toast } = useToast();
  const [senderEmail, setSenderEmail] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery<{
    activeReminders: number;
    totalSent: number;
    resolved: number;
    byStage: Record<string, number>;
  }>({
    queryKey: ["/api/admin/dunning/stats"],
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/dunning/reminders"],
  });

  const { data: settings } = useQuery<{ senderEmail: string }>({
    queryKey: ["/api/admin/dunning/settings"],
  });

  const processQueue = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/dunning/process");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Relances traitées", description: `Envoyées: ${data.sent}, Erreurs: ${data.errors}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/reminders"] });
    },
  });

  const testReminder = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/dunning/test-reminder");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test créé", description: "Un rappel de test a été créé." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/reminders"] });
    },
  });

  const resolveReminder = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/dunning/resolve/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Résolu", description: "Le rappel a été marqué comme résolu." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/reminders"] });
    },
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/dunning/settings", { senderEmail });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Paramètres sauvegardés" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/settings"] });
    },
  });

  if (statsLoading || remindersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-dunning">
      <div>
        <h2 className="text-2xl font-bold">Relances de paiement</h2>
        <p className="text-muted-foreground">Système de relance automatique pour les paiements échoués</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Relances actives</p>
                <p className="text-3xl font-bold">{stats?.activeReminders || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Emails envoyés</p>
                <p className="text-3xl font-bold">{stats?.totalSent || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-3xl font-bold">{stats?.resolved || 0}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Par étape</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {stats?.byStage && Object.entries(stats.byStage).map(([stage, count]) => (
                    <Badge key={stage} variant="secondary" className="text-xs">
                      {STAGE_LABELS[stage]?.label || stage}: {count}
                    </Badge>
                  ))}
                  {(!stats?.byStage || Object.keys(stats.byStage).length === 0) && (
                    <span className="text-sm text-muted-foreground">Aucune</span>
                  )}
                </div>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres de relance
          </CardTitle>
          <CardDescription>
            Configurez l'adresse email d'expédition et les paramètres du système de relance.
            Les relances sont envoyées automatiquement : 24h, 72h, 7 jours, 14 jours, puis 1 mois après l'échec.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Email expéditeur</label>
              <Input
                data-testid="input-dunning-sender-email"
                value={senderEmail || settings?.senderEmail || ""}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="contact@votredomaine.com"
              />
            </div>
            <Button
              onClick={() => saveSettings.mutate()}
              disabled={saveSettings.isPending}
              data-testid="button-save-dunning-settings"
            >
              {saveSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sauvegarder
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => processQueue.mutate()}
              disabled={processQueue.isPending}
              data-testid="button-process-dunning"
            >
              {processQueue.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Traiter la file d'attente
            </Button>
            <Button
              variant="outline"
              onClick={() => testReminder.mutate()}
              disabled={testReminder.isPending}
              data-testid="button-test-dunning"
            >
              {testReminder.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Créer un rappel test
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Calendrier des relances :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>24h - Notification douce</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>72h - Rappel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>7j - Action requise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>14j - Dernier avis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-800" />
                <span>30j - Suspension</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Rappels en cours
            </CardTitle>
            <CardDescription>Liste de tous les rappels de paiement actifs et résolus</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/reminders"] });
              queryClient.invalidateQueries({ queryKey: ["/api/admin/dunning/stats"] });
            }}
            data-testid="button-refresh-dunning"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          {(!reminders || reminders.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">Aucun rappel de paiement pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((r: any) => {
                const stageInfo = STAGE_LABELS[r.stage] || { label: r.stage, color: "bg-gray-100 text-gray-800" };
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between gap-4 p-4 rounded-lg border flex-wrap ${
                      r.resolved ? "opacity-60 bg-muted/30" : ""
                    }`}
                    data-testid={`dunning-reminder-${r.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
                        <span className="text-sm font-medium">{r.recipientName || r.userId}</span>
                        {r.recipientEmail && (
                          <span className="text-xs text-muted-foreground">{r.recipientEmail}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>Montant: {formatAmount(r.amount)}</span>
                        <span>Type: {r.type}</span>
                        <span>Rappels: {r.reminderCount}</span>
                        {r.failureReason && <span>Raison: {r.failureReason}</span>}
                        {r.createdAt && <span>Créé: {new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.resolved ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Résolu
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveReminder.mutate(r.id)}
                          disabled={resolveReminder.isPending}
                          data-testid={`button-resolve-${r.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
