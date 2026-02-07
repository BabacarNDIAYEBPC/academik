import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings, useUpdateAdminSetting } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings2, Key, Brain, Shield, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminAISettings() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSetting();
  const { toast } = useToast();

  const [model, setModel] = useState("gpt-4o");
  const [maxTokens, setMaxTokens] = useState(4000);
  const [allowUserKeys, setAllowUserKeys] = useState(true);
  const [systemPromptOverride, setSystemPromptOverride] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [savingOpenai, setSavingOpenai] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);

  useEffect(() => {
    if (settings) {
      setModel(settings.ai_model || "gpt-4o");
      setMaxTokens(settings.ai_max_tokens || 4000);
      setAllowUserKeys(settings.allow_user_keys !== false);
      setSystemPromptOverride(settings.system_prompt_override || "");
    }
  }, [settings]);

  const handleSave = async (key: string, value: any) => {
    try {
      await updateMutation.mutateAsync({ key, value });
      toast({ title: "Paramètre sauvegardé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveApiKey = async (type: "openai" | "stripe") => {
    const key = type === "openai" ? openaiKey : stripeKey;
    const setter = type === "openai" ? setSavingOpenai : setSavingStripe;

    if (!key.trim()) {
      toast({ title: "Clé requise", description: "Veuillez saisir une clé API.", variant: "destructive" });
      return;
    }

    setter(true);
    try {
      await apiRequest("POST", "/api/admin/api-key", { type, key: key.trim() });
      toast({ title: "Clé API enregistrée", description: `La clé ${type === "openai" ? "OpenAI" : "Stripe"} a été mise à jour.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      if (type === "openai") setOpenaiKey("");
      else setStripeKey("");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible d'enregistrer la clé.", variant: "destructive" });
    } finally {
      setter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-ai-settings">
      <h2 className="text-2xl font-bold">Paramétrage IA</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>Clés API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">Clé OpenAI plateforme</p>
                  <p className="text-sm text-muted-foreground">Clé globale pour tous les utilisateurs</p>
                </div>
                <Badge variant={settings?.hasGlobalOpenAIKey ? "default" : "outline"} className="gap-1">
                  {settings?.hasGlobalOpenAIKey ? <><CheckCircle2 className="w-3 h-3" /> Configurée</> : <><AlertCircle className="w-3 h-3" /> Non configurée</>}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={openaiKey}
                  onChange={e => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                  data-testid="input-openai-key"
                />
                <Button
                  onClick={() => handleSaveApiKey("openai")}
                  disabled={savingOpenai || !openaiKey.trim()}
                  data-testid="button-save-openai-key"
                >
                  {savingOpenai ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">Clé Stripe</p>
                  <p className="text-sm text-muted-foreground">Pour les paiements</p>
                </div>
                <Badge variant={settings?.hasStripeKey ? "default" : "outline"} className="gap-1">
                  {settings?.hasStripeKey ? <><CheckCircle2 className="w-3 h-3" /> Configurée</> : <><AlertCircle className="w-3 h-3" /> Non configurée</>}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={stripeKey}
                  onChange={e => setStripeKey(e.target.value)}
                  placeholder="sk_..."
                  className="flex-1"
                  data-testid="input-stripe-key"
                />
                <Button
                  onClick={() => handleSaveApiKey("stripe")}
                  disabled={savingStripe || !stripeKey.trim()}
                  data-testid="button-save-stripe-key"
                >
                  {savingStripe ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>Modèle IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modèle par défaut</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger data-testid="select-ai-model"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tokens max par requête</Label>
              <Input type="number" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} data-testid="input-max-tokens" />
            </div>
            <Button
              onClick={() => {
                handleSave("ai_model", model);
                handleSave("ai_max_tokens", maxTokens);
              }}
              disabled={updateMutation.isPending}
              data-testid="button-save-ai-model"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Règles globales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Autoriser clé perso</p>
                <p className="text-sm text-muted-foreground">Les utilisateurs peuvent fournir leur propre clé OpenAI</p>
              </div>
              <Switch
                checked={allowUserKeys}
                onCheckedChange={v => {
                  setAllowUserKeys(v);
                  handleSave("allow_user_keys", v);
                }}
                data-testid="switch-allow-user-keys"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <CardTitle>Prompt système global</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Surcharge du prompt système (optionnel)</Label>
              <Textarea
                value={systemPromptOverride}
                onChange={e => setSystemPromptOverride(e.target.value)}
                rows={6}
                placeholder="Laissez vide pour utiliser le prompt par défaut..."
                data-testid="textarea-system-prompt"
              />
            </div>
            <Button
              onClick={() => handleSave("system_prompt_override", systemPromptOverride)}
              disabled={updateMutation.isPending}
              data-testid="button-save-prompt"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
