import { useState, useEffect } from "react";
import { useAdminSettings, useUpdateAdminSetting } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

const ALL_MODULES = [
  { key: "foundation", label: "Fondements", description: "Sujet, Problématique, Hypothèses, Situation d'appel, Blocs de compétences", category: "core", price: "29 €" },
  { key: "plan", label: "Plan du travail", description: "Génération et structuration du plan", category: "core", price: "25 €" },
  { key: "conceptual", label: "Cadre conceptuel & théorique", description: "Cadre conceptuel et cadre théorique", category: "core", price: "35 €" },
  { key: "literature", label: "Revue de littérature", description: "Recherche et synthèse bibliographique", category: "core", price: "49 €" },
  { key: "methodology", label: "Méthodologie", description: "Conception méthodologique", category: "core", price: "39 €" },
  { key: "questionnaire", label: "Questionnaire", description: "Création de questionnaire de recherche", category: "collecte", price: "25 €" },
  { key: "guide_entretien", label: "Guide d'entretien", description: "Guide structuré pour entretiens", category: "collecte", price: "25 €" },
  { key: "simulation_entretien", label: "Simulation d'entretien", description: "Simulation interactive d'entretien", category: "collecte", price: "19 €" },
  { key: "questionnaire_analysis", label: "Dépouillement du questionnaire", description: "Analyse des réponses au questionnaire", category: "analyse", price: "29 €" },
  { key: "data_visualization", label: "Visualisation des données", description: "Analyse et graphiques de données", category: "analyse", price: "25 €" },
  { key: "financial_simulation", label: "Simulation financière", description: "Projections et analyses financières", category: "analyse", price: "29 €" },
  { key: "analyse_qualitative", label: "Analyse qualitative", description: "Verbatims, codage thématique et synthèse", category: "analyse", price: "39 €" },
  { key: "analyse_quantitative", label: "Analyse quantitative", description: "Tableaux croisés et graphiques", category: "analyse", price: "39 €" },
  { key: "redaction", label: "Rédaction assistée", description: "Rédaction section par section avec IA", category: "production", price: "Inclus pack" },
  { key: "biblio_multinormes", label: "Bibliographie multi-normes", description: "Génération de bibliographie (APA, Vancouver...)", category: "production", price: "25 €" },
  { key: "export_illimite", label: "Export illimité", description: "Export Word et PDF illimité", category: "production", price: "19 €" },
  { key: "fusion_memoire", label: "Fusion mémoire", description: "Assemblage de toutes les sections en un document", category: "production", price: "19 €" },
  { key: "article_analysis", label: "Résumé & analyse d'articles", description: "Analyse structurée d'articles scientifiques", category: "revue", price: "29 €" },
  { key: "article_confrontation", label: "Confrontation d'articles", description: "Comparaison critique entre articles", category: "revue", price: "29 €" },
  { key: "soutenance_ppt", label: "PowerPoint de soutenance", description: "Génération de slides de présentation", category: "soutenance", price: "29 €" },
  { key: "soutenance_simulation", label: "Simulation de soutenance", description: "Simulation de jury et questions", category: "soutenance", price: "29 €" },
  { key: "audit", label: "Audit de mémoire", description: "Relecture critique et recommandations", category: "soutenance", price: "49 €" },
  { key: "words_20k", label: "+20 000 mots IA", description: "Quota supplémentaire de génération", category: "ia", price: "19 €" },
  { key: "words_50k", label: "+50 000 mots IA", description: "Quota supplémentaire étendu", category: "ia", price: "39 €" },
  { key: "extra_project", label: "Projet supplémentaire", description: "Un projet actif additionnel", category: "ia", price: "29 €" },
] as const;

const CATEGORIES: Record<string, string> = {
  core: "Pack Principal",
  collecte: "Collecte de données",
  analyse: "Analyse de données",
  revue: "Revue & Bibliographie",
  production: "Production & Livrables",
  soutenance: "Soutenance & Audit",
  ia: "Quotas IA",
};

const CATEGORY_COLORS: Record<string, string> = {
  core: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  collecte: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  analyse: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  revue: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  production: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  soutenance: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  ia: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
};

export default function AdminModules() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateMutation = useUpdateAdminSetting();
  const { toast } = useToast();

  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings?.module_visibility) {
      const stored = settings.module_visibility as Record<string, boolean>;
      const merged: Record<string, boolean> = {};
      for (const mod of ALL_MODULES) {
        merged[mod.key] = stored[mod.key] !== undefined ? stored[mod.key] : true;
      }
      setVisibility(merged);
    } else {
      const defaults: Record<string, boolean> = {};
      for (const mod of ALL_MODULES) {
        defaults[mod.key] = true;
      }
      setVisibility(defaults);
    }
  }, [settings]);

  const toggleModule = (key: string) => {
    setVisibility(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasChanges(true);
      return updated;
    });
  };

  const enableAll = () => {
    const all: Record<string, boolean> = {};
    for (const mod of ALL_MODULES) {
      all[mod.key] = true;
    }
    setVisibility(all);
    setHasChanges(true);
  };

  const disableAll = () => {
    const all: Record<string, boolean> = {};
    for (const mod of ALL_MODULES) {
      all[mod.key] = false;
    }
    setVisibility(all);
    setHasChanges(true);
  };

  const saveChanges = () => {
    updateMutation.mutate(
      { key: "module_visibility", value: visibility },
      {
        onSuccess: () => {
          setHasChanges(false);
          queryClient.invalidateQueries({ queryKey: ["/api/modules/visibility"] });
          toast({ title: "Modules mis à jour", description: "La visibilité des modules a été sauvegardée." });
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de sauvegarder les modifications.", variant: "destructive" });
        },
      }
    );
  };

  const enabledCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = ALL_MODULES.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const grouped = Object.keys(CATEGORIES).map(cat => ({
    category: cat,
    label: CATEGORIES[cat],
    modules: ALL_MODULES.filter(m => m.category === cat),
  }));

  return (
    <div className="space-y-6" data-testid="admin-modules">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Gestion des modules</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Activé = payant (visible dans la boutique). Désactivé = gratuit (accès libre, masqué de la boutique).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" data-testid="badge-module-count">
            {enabledCount}/{totalCount} payants
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={enableAll} data-testid="button-enable-all">
                <ToggleRight className="w-4 h-4 mr-1" />
                Tout activer
              </Button>
              <Button variant="outline" size="sm" onClick={disableAll} data-testid="button-disable-all">
                <ToggleLeft className="w-4 h-4 mr-1" />
                Tout désactiver
              </Button>
            </div>
            {hasChanges && (
              <Button onClick={saveChanges} disabled={updateMutation.isPending} data-testid="button-save-modules">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Sauvegarder
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {grouped.map(group => (
        <Card key={group.category}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">{group.label}</CardTitle>
              <Badge className={CATEGORY_COLORS[group.category]} variant="secondary">
                {group.modules.filter(m => visibility[m.key]).length}/{group.modules.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.modules.map(mod => (
                <div
                  key={mod.key}
                  className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-colors ${
                    visibility[mod.key]
                      ? "bg-background border-border"
                      : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                  }`}
                  data-testid={`module-row-${mod.key}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{mod.label}</span>
                      {visibility[mod.key] ? (
                        <Badge variant="outline" className="text-xs">{mod.price}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Gratuit</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                  </div>
                  <Switch
                    checked={!!visibility[mod.key]}
                    onCheckedChange={() => toggleModule(mod.key)}
                    data-testid={`switch-module-${mod.key}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={saveChanges} disabled={updateMutation.isPending} size="lg" data-testid="button-save-modules-sticky">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Sauvegarder les modifications
          </Button>
        </div>
      )}
    </div>
  );
}
