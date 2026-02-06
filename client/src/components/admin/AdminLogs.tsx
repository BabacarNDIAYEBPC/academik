import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuditLogs, useAiLogs, useAiLogStats } from "@/hooks/use-admin";
import { Loader2, FileText, Zap, AlertTriangle } from "lucide-react";

type LogTab = "audit" | "ai";

export default function AdminLogs() {
  const [tab, setTab] = useState<LogTab>("audit");
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs();
  const { data: aiLogsList, isLoading: aiLoading } = useAiLogs();
  const { data: aiStats } = useAiLogStats();

  return (
    <div className="space-y-6" data-testid="admin-logs">
      <h2 className="text-2xl font-bold">Logs & Audit</h2>

      <div className="flex items-center gap-2">
        <Button variant={tab === "audit" ? "default" : "outline"} onClick={() => setTab("audit")} data-testid="tab-audit-logs">
          <FileText className="w-4 h-4 mr-2" />
          Journal d'audit
        </Button>
        <Button variant={tab === "ai" ? "default" : "outline"} onClick={() => setTab("ai")} data-testid="tab-ai-logs">
          <Zap className="w-4 h-4 mr-2" />
          Logs IA
        </Button>
      </div>

      {tab === "audit" && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>Journal d'audit ({auditLogs?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {auditLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Acteur</th>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-left p-3 font-medium">Cible</th>
                      <th className="text-left p-3 font-medium">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs?.map((log: any) => (
                      <tr key={log.id} className="border-b" data-testid={`row-audit-${log.id}`}>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : "-"}
                        </td>
                        <td className="p-3">{log.actorEmail || log.actorId || "-"}</td>
                        <td className="p-3"><Badge variant="secondary">{log.action}</Badge></td>
                        <td className="p-3">{log.targetType ? `${log.targetType}:${log.targetId}` : "-"}</td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </td>
                      </tr>
                    ))}
                    {(!auditLogs || auditLogs.length === 0) && (
                      <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Aucun log d'audit</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "ai" && (
        <>
          {aiStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{aiStats.totalRequests}</p>
                    <p className="text-sm text-muted-foreground">Requêtes totales</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{aiStats.totalErrors}</p>
                    <p className="text-sm text-muted-foreground">Erreurs</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{aiStats.avgDuration} ms</p>
                    <p className="text-sm text-muted-foreground">Temps moyen</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <CardTitle>Logs IA ({aiLogsList?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {aiLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Endpoint</th>
                        <th className="text-left p-3 font-medium">Modèle</th>
                        <th className="text-left p-3 font-medium">Tokens</th>
                        <th className="text-left p-3 font-medium">Durée</th>
                        <th className="text-left p-3 font-medium">Statut</th>
                        <th className="text-left p-3 font-medium">Erreur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiLogsList?.map((log: any) => (
                        <tr key={log.id} className="border-b" data-testid={`row-ailog-${log.id}`}>
                          <td className="p-3 text-muted-foreground whitespace-nowrap">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : "-"}
                          </td>
                          <td className="p-3">{log.endpoint}</td>
                          <td className="p-3">{log.model || "-"}</td>
                          <td className="p-3">{log.tokensIn || 0} / {log.tokensOut || 0}</td>
                          <td className="p-3">{log.durationMs || 0} ms</td>
                          <td className="p-3">
                            <Badge variant={log.status === "success" ? "default" : "destructive"}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground max-w-xs truncate">{log.error || "-"}</td>
                        </tr>
                      ))}
                      {(!aiLogsList || aiLogsList.length === 0) && (
                        <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aucun log IA</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
