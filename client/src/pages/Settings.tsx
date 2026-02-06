import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: keyStatus, isLoading } = useQuery({
    queryKey: ["/api/settings/openai-key"],
    queryFn: async () => {
      const res = await fetch("/api/settings/openai-key", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await apiRequest("POST", "/api/settings/openai-key", { apiKey: key || null });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/openai-key"] });
      toast({
        title: data.hasKey ? "Clé API enregistrée" : "Clé API supprimée",
        description: data.hasKey
          ? "Votre clé OpenAI personnelle sera utilisée pour les générations."
          : "Les générations utiliseront le service intégré.",
      });
      setApiKey("");
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Clé API invalide.",
        variant: "destructive",
      });
    },
  });

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Paramètres</h1>
        <p className="text-muted-foreground mb-8">Configurez votre assistant académique.</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5" />
              Clé API OpenAI
            </CardTitle>
            <CardDescription>
              Optionnel : connectez votre propre clé API OpenAI pour utiliser vos crédits personnels. Sans clé personnelle, le service intégré est utilisé.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Statut :</span>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : keyStatus?.hasKey ? (
                <Badge variant="outline" className="gap-1" data-testid="badge-key-active">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Clé personnelle active
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1" data-testid="badge-key-default">
                  Service intégré (par défaut)
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  data-testid="input-api-key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowKey(!showKey)}
                  data-testid="button-toggle-key-visibility"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={() => saveMutation.mutate(apiKey)}
                disabled={saveMutation.isPending || !apiKey.trim()}
                data-testid="button-save-key"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </div>

            {keyStatus?.hasKey && (
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => saveMutation.mutate("")}
                disabled={saveMutation.isPending}
                data-testid="button-remove-key"
              >
                Supprimer ma clé et utiliser le service intégré
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Votre clé est stockée de manière sécurisée et n'est jamais partagée. Elle est utilisée uniquement pour les appels IA de vos projets.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
