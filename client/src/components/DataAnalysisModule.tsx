import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  useAnalyzeQualitative,
  useAnalyzeQuantitative,
  useConfrontResults,
  useValidateHypotheses,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, BarChart3, Save, Check, X, FileDown,
  Plus, Trash2, BookOpen, FlaskConical,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";

interface DataAnalysisModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface VerbatimEntry {
  id: string;
  initials: string;
  function: string;
  structureType: string;
  content: string;
  date: string;
}

interface SavedState {
  verbatims: VerbatimEntry[];
  qualitativeResult: string;
  quantitativeData: string;
  quantitativeResult: string;
  confrontResult: string;
  validationResult: string;
  analysisMode: string;
  quantitativeType: string;
}

export default function DataAnalysisModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: DataAnalysisModuleProps) {
  const [activeTab, setActiveTab] = useState("qualitative");
  const [verbatims, setVerbatims] = useState<VerbatimEntry[]>([]);
  const [analysisMode, setAnalysisMode] = useState("global");
  const [qualitativeResult, setQualitativeResult] = useState("");
  const [quantitativeData, setQuantitativeData] = useState("");
  const [quantitativeType, setQuantitativeType] = useState("cross_tab");
  const [quantitativeResult, setQuantitativeResult] = useState("");
  const [confrontResult, setConfrontResult] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const qualitativeMutation = useAnalyzeQualitative();
  const quantitativeMutation = useAnalyzeQuantitative();
  const confrontMutation = useConfrontResults();
  const validateHypMutation = useValidateHypotheses();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const stateRef = useRef({ verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType });
  useEffect(() => {
    stateRef.current = { verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType };
  }, [verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      verbatims: s.verbatims,
      qualitativeResult: s.qualitativeResult,
      quantitativeData: s.quantitativeData,
      quantitativeResult: s.quantitativeResult,
      confrontResult: s.confrontResult,
      validationResult: s.validationResult,
      analysisMode: s.analysisMode,
      quantitativeType: s.quantitativeType,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { dataAnalysisState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.dataAnalysisState) {
      const s = cfg.dataAnalysisState as SavedState;
      if (s.verbatims) setVerbatims(s.verbatims);
      if (s.qualitativeResult) setQualitativeResult(s.qualitativeResult);
      if (s.quantitativeData) setQuantitativeData(s.quantitativeData);
      if (s.quantitativeResult) setQuantitativeResult(s.quantitativeResult);
      if (s.confrontResult) setConfrontResult(s.confrontResult);
      if (s.validationResult) setValidationResult(s.validationResult);
      if (s.analysisMode) setAnalysisMode(s.analysisMode);
      if (s.quantitativeType) setQuantitativeType(s.quantitativeType);
    }
    setStateLoaded(true);
  }, [section, stateLoaded]);

  useEffect(() => {
    if (!stateLoaded) return;
    const timer = setTimeout(doSave, 3000);
    return () => clearTimeout(timer);
  }, [verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType, stateLoaded, doSave]);

  const addVerbatim = () => {
    setVerbatims(prev => [...prev, {
      id: Date.now().toString(),
      initials: "",
      function: "",
      structureType: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
    }]);
  };

  const updateVerbatim = (id: string, field: keyof VerbatimEntry, value: string) => {
    setVerbatims(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVerbatim = (id: string) => {
    setVerbatims(prev => prev.filter(v => v.id !== id));
  };

  const handleQualitativeAnalysis = () => {
    if (verbatims.length === 0 || verbatims.every(v => !v.content.trim())) {
      toast({ title: "Données requises", description: "Ajoutez au moins un verbatim d'entretien.", variant: "destructive" });
      return;
    }
    qualitativeMutation.mutate(
      { projectId, verbatims: verbatims.filter(v => v.content.trim()), analysisMode, extraContext },
      {
        onSuccess: (data) => {
          setQualitativeResult(data.content);
          toast({ title: "Analyse terminée", description: "L'analyse qualitative a été générée." });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de l'analyse", variant: "destructive" });
        },
      }
    );
  };

  const handleQuantitativeAnalysis = () => {
    if (!quantitativeData.trim()) {
      toast({ title: "Données requises", description: "Collez vos données quantitatives.", variant: "destructive" });
      return;
    }
    quantitativeMutation.mutate(
      { projectId, data: quantitativeData, analysisType: quantitativeType as any, extraContext },
      {
        onSuccess: (data) => {
          setQuantitativeResult(data.content);
          toast({ title: "Analyse terminée", description: "L'analyse quantitative a été générée." });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de l'analyse", variant: "destructive" });
        },
      }
    );
  };

  const handleConfront = () => {
    const allResults = [qualitativeResult, quantitativeResult].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: "Résultats requis", description: "Générez d'abord une analyse qualitative ou quantitative.", variant: "destructive" });
      return;
    }
    confrontMutation.mutate(
      { projectId, results: allResults, extraContext },
      {
        onSuccess: (data) => {
          setConfrontResult(data.content);
          toast({ title: "Confrontation terminée" });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la confrontation", variant: "destructive" });
        },
      }
    );
  };

  const handleValidateHypotheses = () => {
    const allResults = [qualitativeResult, quantitativeResult, confrontResult].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: "Résultats requis", description: "Réalisez d'abord les analyses.", variant: "destructive" });
      return;
    }
    validateHypMutation.mutate(
      { projectId, results: allResults, extraContext },
      {
        onSuccess: (data) => {
          setValidationResult(data.content);
          toast({ title: "Validation terminée" });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de la validation", variant: "destructive" });
        },
      }
    );
  };

  const handleSectionValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: "Section validée" }),
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  const handleSectionUnvalidate = () => {
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
    const sections = [];
    if (qualitativeResult) sections.push({ label: "Analyse qualitative", content: qualitativeResult });
    if (quantitativeResult) sections.push({ label: "Analyse quantitative", content: quantitativeResult });
    if (confrontResult) sections.push({ label: "Confrontation des résultats", content: confrontResult });
    if (validationResult) sections.push({ label: "Validation des hypothèses", content: validationResult });
    if (sections.length === 0) {
      toast({ title: "Rien à exporter", variant: "destructive" });
      return;
    }
    exportToWord("Analyse des données", sections, "analyse_donnees.docx");
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Analyse des données</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />Validé</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-analysis">
            <Save className="w-4 h-4 mr-1" />Sauvegarder
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-analysis">
            <FileDown className="w-4 h-4 mr-1" />Exporter
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleSectionValidate} data-testid="button-validate-analysis">
              <Check className="w-4 h-4 mr-1" />Valider
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleSectionUnvalidate} data-testid="button-unvalidate-analysis">
              <X className="w-4 h-4 mr-1" />Retirer validation
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="qualitative" className="gap-1" data-testid="tab-qualitative">
              <BookOpen className="w-4 h-4" />Qualitative
            </TabsTrigger>
            <TabsTrigger value="quantitative" className="gap-1" data-testid="tab-quantitative">
              <BarChart3 className="w-4 h-4" />Quantitative
            </TabsTrigger>
            <TabsTrigger value="confront" className="gap-1" data-testid="tab-confront">
              <FlaskConical className="w-4 h-4" />Confrontation
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-1" data-testid="tab-validation">
              <Check className="w-4 h-4" />Hypothèses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qualitative" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-base font-semibold">Verbatims d'entretien</Label>
                <Button variant="outline" size="sm" onClick={addVerbatim} data-testid="button-add-verbatim">
                  <Plus className="w-4 h-4 mr-1" />Ajouter un entretien
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Collez le contenu retranscrit de chaque entretien pour l'analyse thématique.
              </p>

              {verbatims.map((v, index) => (
                <Card key={v.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">Entretien {index + 1}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeVerbatim(v.id)} data-testid={`button-remove-verbatim-${v.id}`}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Initiales</Label>
                        <Input
                          value={v.initials}
                          onChange={e => updateVerbatim(v.id, "initials", e.target.value)}
                          placeholder="Ex: M.D."
                          className="text-sm"
                          data-testid={`input-verbatim-initials-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fonction</Label>
                        <Input
                          value={v.function}
                          onChange={e => updateVerbatim(v.id, "function", e.target.value)}
                          placeholder="Ex: IDE"
                          className="text-sm"
                          data-testid={`input-verbatim-function-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Structure</Label>
                        <Input
                          value={v.structureType}
                          onChange={e => updateVerbatim(v.id, "structureType", e.target.value)}
                          placeholder="Ex: CHU"
                          className="text-sm"
                          data-testid={`input-verbatim-structure-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={v.date}
                          onChange={e => updateVerbatim(v.id, "date", e.target.value)}
                          className="text-sm"
                          data-testid={`input-verbatim-date-${v.id}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Verbatim (retranscription)</Label>
                      <Textarea
                        value={v.content}
                        onChange={e => updateVerbatim(v.id, "content", e.target.value)}
                        placeholder="Collez ici la retranscription intégrale de l'entretien..."
                        className="min-h-[120px] text-sm"
                        data-testid={`textarea-verbatim-content-${v.id}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1.5">
                <Label>Mode d'analyse</Label>
                <Select value={analysisMode} onValueChange={setAnalysisMode}>
                  <SelectTrigger className="w-[250px]" data-testid="select-analysis-mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_interview">Par entretien (puis synthèse)</SelectItem>
                    <SelectItem value="global">Transversale globale</SelectItem>
                    <SelectItem value="per_hypothesis">Par hypothèse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleQualitativeAnalysis}
                disabled={qualitativeMutation.isPending || verbatims.length === 0}
                className="mt-auto"
                data-testid="button-analyze-qualitative"
              >
                {qualitativeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                Analyser les verbatims
              </Button>
            </div>

            {qualitativeResult && (
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">Résultat de l'analyse qualitative</Label>
                <Textarea
                  value={qualitativeResult}
                  onChange={e => setQualitativeResult(e.target.value)}
                  className="min-h-[400px] text-sm font-mono"
                  data-testid="textarea-qualitative-result"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="quantitative" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Données quantitatives</Label>
              <p className="text-xs text-muted-foreground">
                Collez vos données (format CSV ou tableau) issues du questionnaire pour l'analyse.
              </p>
              <Textarea
                value={quantitativeData}
                onChange={e => setQuantitativeData(e.target.value)}
                placeholder={"Question;Réponse 1;Réponse 2;Réponse 3\nQ1;45%;30%;25%\nQ2;60%;25%;15%\n..."}
                className="min-h-[200px] text-sm font-mono"
                data-testid="textarea-quantitative-data"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="space-y-1.5">
                <Label>Type d'analyse</Label>
                <Select value={quantitativeType} onValueChange={setQuantitativeType}>
                  <SelectTrigger className="w-[250px]" data-testid="select-quantitative-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cross_tab">Tableaux croisés</SelectItem>
                    <SelectItem value="trends">Analyse des tendances</SelectItem>
                    <SelectItem value="interpretation">Interprétation globale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleQuantitativeAnalysis}
                disabled={quantitativeMutation.isPending || !quantitativeData.trim()}
                className="mt-auto"
                data-testid="button-analyze-quantitative"
              >
                {quantitativeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                Analyser les données
              </Button>
            </div>

            {quantitativeResult && (
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">Résultat de l'analyse quantitative</Label>
                <Textarea
                  value={quantitativeResult}
                  onChange={e => setQuantitativeResult(e.target.value)}
                  className="min-h-[400px] text-sm font-mono"
                  data-testid="textarea-quantitative-result"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="confront" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Confrontez vos résultats de terrain (analyse qualitative et/ou quantitative) avec la revue de littérature et le cadre théorique pour identifier convergences, divergences et apports originaux.
              </p>
              <div className="flex gap-2 flex-wrap">
                {qualitativeResult && <Badge variant="default" className="bg-green-600/10 text-green-600 border-green-600/20">Analyse qualitative disponible</Badge>}
                {quantitativeResult && <Badge variant="default" className="bg-blue-600/10 text-blue-600 border-blue-600/20">Analyse quantitative disponible</Badge>}
                {!qualitativeResult && !quantitativeResult && (
                  <Badge variant="outline" className="text-muted-foreground">Aucune analyse disponible - réalisez d'abord une analyse</Badge>
                )}
              </div>
            </div>
            <Button
              onClick={handleConfront}
              disabled={confrontMutation.isPending || (!qualitativeResult && !quantitativeResult)}
              data-testid="button-confront"
            >
              {confrontMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-2" />}
              Confronter avec la littérature
            </Button>

            {confrontResult && (
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">Confrontation des résultats</Label>
                <Textarea
                  value={confrontResult}
                  onChange={e => setConfrontResult(e.target.value)}
                  className="min-h-[400px] text-sm font-mono"
                  data-testid="textarea-confront-result"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Validez ou invalidez chaque hypothèse de recherche en vous appuyant sur l'ensemble des résultats (analyses qualitative/quantitative et confrontation avec la littérature).
              </p>
              <div className="flex gap-2 flex-wrap">
                {qualitativeResult && <Badge variant="outline" className="text-xs">Qualitative</Badge>}
                {quantitativeResult && <Badge variant="outline" className="text-xs">Quantitative</Badge>}
                {confrontResult && <Badge variant="outline" className="text-xs">Confrontation</Badge>}
              </div>
            </div>
            <Button
              onClick={handleValidateHypotheses}
              disabled={validateHypMutation.isPending || (!qualitativeResult && !quantitativeResult)}
              data-testid="button-validate-hypotheses"
            >
              {validateHypMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Valider les hypothèses
            </Button>

            {validationResult && (
              <div className="space-y-1.5">
                <Label className="text-base font-semibold">Validation des hypothèses</Label>
                <Textarea
                  value={validationResult}
                  onChange={e => setValidationResult(e.target.value)}
                  className="min-h-[400px] text-sm font-mono"
                  data-testid="textarea-validation-result"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
