import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import type { ProjectSection } from "@shared/schema";
import {
  BarChart3, Loader2, Save, Check, X, FileDown, History, Calculator,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import ReactMarkdown from "react-markdown";

interface FinancialSimulationModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface HistoryEntry {
  id: string;
  type: string;
  createdAt: string;
  preview: string;
}

interface SavedState {
  simulationType: string;
  timeHorizon: string;
  currency: string;
  customInstructions: string;
  generatedResult: string;
  history: HistoryEntry[];
}

const SIMULATION_TYPES = [
  { value: "budget_previsionnel", label: "Budget prévisionnel" },
  { value: "plan_financement", label: "Plan de financement" },
  { value: "compte_resultat", label: "Compte de résultat prévisionnel" },
  { value: "seuil_rentabilite", label: "Seuil de rentabilité" },
  { value: "plan_tresorerie", label: "Plan de trésorerie" },
];

const TIME_HORIZONS = [
  { value: "1", label: "1 an" },
  { value: "2", label: "2 ans" },
  { value: "3", label: "3 ans" },
  { value: "4", label: "4 ans" },
  { value: "5", label: "5 ans" },
];

const CURRENCIES = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "MAD", label: "MAD (د.م.)" },
  { value: "XOF", label: "XOF (CFA)" },
  { value: "XAF", label: "XAF (FCFA)" },
];

export default function FinancialSimulationModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: FinancialSimulationModuleProps) {
  const [simulationType, setSimulationType] = useState("budget_previsionnel");
  const [timeHorizon, setTimeHorizon] = useState("3");
  const [currency, setCurrency] = useState("EUR");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatedResult, setGeneratedResult] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, customInstructions].filter(Boolean).join("\n");

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/sections/financial-simulation/generate`, data);
      return res.json();
    },
  });

  const stateRef = useRef({ simulationType, timeHorizon, currency, customInstructions, generatedResult, history });
  useEffect(() => {
    stateRef.current = { simulationType, timeHorizon, currency, customInstructions, generatedResult, history };
  }, [simulationType, timeHorizon, currency, customInstructions, generatedResult, history]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      simulationType: s.simulationType,
      timeHorizon: s.timeHorizon,
      currency: s.currency,
      customInstructions: s.customInstructions,
      generatedResult: s.generatedResult,
      history: s.history,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { financialState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.financialState) {
      const s = cfg.financialState as SavedState;
      if (s.simulationType) setSimulationType(s.simulationType);
      if (s.timeHorizon) setTimeHorizon(s.timeHorizon);
      if (s.currency) setCurrency(s.currency);
      if (s.customInstructions) setCustomInstructions(s.customInstructions);
      if (s.generatedResult) setGeneratedResult(s.generatedResult);
      if (s.history) setHistory(s.history);
    }
    setStateLoaded(true);
  }, [section, stateLoaded]);

  const doSaveRef = useRef(doSave);
  useEffect(() => { doSaveRef.current = doSave; }, [doSave]);
  useEffect(() => {
    return () => { doSaveRef.current(); };
  }, []);

  useEffect(() => {
    if (!stateLoaded) return;
    const timer = setTimeout(doSave, 3000);
    return () => clearTimeout(timer);
  }, [simulationType, timeHorizon, currency, customInstructions, generatedResult, history, stateLoaded, doSave]);

  const handleGenerate = () => {
    generateMutation.mutate(
      {
        projectId,
        simulationType,
        timeHorizon: parseInt(timeHorizon),
        currency,
        projectType,
        variables,
        extraContext: combinedContext || undefined,
      },
      {
        onSuccess: (data) => {
          const content = data.content || data.result || "";
          setGeneratedResult(content);
          const typeLabel = SIMULATION_TYPES.find(t => t.value === simulationType)?.label || simulationType;
          const entry: HistoryEntry = {
            id: Date.now().toString(),
            type: typeLabel,
            createdAt: new Date().toISOString(),
            preview: content.substring(0, 150).replace(/[#*]/g, "").trim(),
          };
          setHistory(prev => [entry, ...prev]);
          toast({ title: "Simulation générée", description: "La simulation financière a été générée avec succès." });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la génération", variant: "destructive" });
        },
      }
    );
  };

  const handleRestoreHistory = (entry: HistoryEntry) => {
    const idx = history.findIndex(h => h.id === entry.id);
    if (idx >= 0) {
      toast({ title: "Résultat restauré", description: `Simulation "${entry.type}" du ${new Date(entry.createdAt).toLocaleDateString("fr-FR")} restaurée.` });
    }
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: "Section validée" }),
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: "Validation retirée" }),
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  const handleExport = () => {
    if (!generatedResult) {
      toast({ title: "Rien à exporter", description: "Générez d'abord une simulation financière.", variant: "destructive" });
      return;
    }
    const typeLabel = SIMULATION_TYPES.find(t => t.value === simulationType)?.label || simulationType;
    exportToWord(
      "Simulation financière",
      [{ label: typeLabel, content: generatedResult }],
      "simulation_financiere.docx"
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Simulation financière</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />Validé</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-financial">
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-financial">
            <FileDown className="w-4 h-4 mr-1" />Exporter
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleValidate} data-testid="button-validate-financial">
              <Check className="w-4 h-4 mr-1" />Valider
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-unvalidate-financial">
              <X className="w-4 h-4 mr-1" />Retirer validation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Type de simulation</Label>
            <Select value={simulationType} onValueChange={setSimulationType}>
              <SelectTrigger data-testid="select-simulation-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SIMULATION_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Horizon temporel</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger data-testid="select-time-horizon"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIME_HORIZONS.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Devise</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="custom-instructions-financial" className="text-base font-semibold">Instructions personnalisées</Label>
          <Textarea
            id="custom-instructions-financial"
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder="Ex: Inclure les charges sociales, préciser le taux de TVA, ajouter des hypothèses de croissance..."
            className="min-h-[80px] text-sm"
            data-testid="textarea-custom-instructions-financial"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          data-testid="button-generate-financial"
        >
          {generateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calculator className="w-4 h-4 mr-2" />}
          Générer la simulation
        </Button>

        {generatedResult && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Résultat</Label>
            <div className="prose-academic border rounded-md p-4 max-h-[600px] overflow-y-auto">
              <ReactMarkdown>{generatedResult}</ReactMarkdown>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryExpanded(!historyExpanded)}
              data-testid="button-toggle-history-financial"
            >
              <History className="w-4 h-4 mr-1" />
              Historique ({history.length})
            </Button>
            {historyExpanded && (
              <div className="space-y-2">
                {history.map(entry => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => handleRestoreHistory(entry)}
                    data-testid={`history-entry-${entry.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{entry.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString("fr-FR")} à {new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.preview}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
