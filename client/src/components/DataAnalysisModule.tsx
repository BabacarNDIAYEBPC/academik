import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Plus, Trash2, BookOpen, FlaskConical, Upload,
  FileText,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import {
  BarChart, PieChart, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const CHART_COLORS = [
  "#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
  "#06B6D4", "#84CC16",
];

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
  contextInstructions: string;
  confrontImportedData: string;
  validationImportedDoc: string;
}

function detectDelimiter(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  if (tabCount >= semicolonCount && tabCount >= commaCount && tabCount > 0) return "\t";
  if (semicolonCount >= commaCount) return ";";
  return ",";
}

function parseCsvData(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
  return { headers, rows };
}

function parseNumericValue(val: string): number {
  const cleaned = val.replace(/[%\s]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function getValueColor(value: number, min: number, max: number): string {
  if (max === min) return "hsl(220, 60%, 95%)";
  const ratio = (value - min) / (max - min);
  const lightness = 95 - ratio * 40;
  return `hsl(220, 60%, ${lightness}%)`;
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
  const [contextInstructions, setContextInstructions] = useState("");
  const [confrontImportedData, setConfrontImportedData] = useState("");
  const [validationImportedDoc, setValidationImportedDoc] = useState("");
  const [uploadingValidationDoc, setUploadingValidationDoc] = useState(false);
  const [chartType, setChartType] = useState("bar");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const qualitativeMutation = useAnalyzeQualitative();
  const quantitativeMutation = useAnalyzeQuantitative();
  const confrontMutation = useConfrontResults();
  const validateHypMutation = useValidateHypotheses();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType, contextInstructions, confrontImportedData, validationImportedDoc });
  useEffect(() => {
    stateRef.current = { verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType, contextInstructions, confrontImportedData, validationImportedDoc };
  }, [verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType, contextInstructions, confrontImportedData, validationImportedDoc]);

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
      contextInstructions: s.contextInstructions,
      confrontImportedData: s.confrontImportedData,
      validationImportedDoc: s.validationImportedDoc,
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
      if (s.contextInstructions) setContextInstructions(s.contextInstructions);
      if (s.confrontImportedData) setConfrontImportedData(s.confrontImportedData);
      if (s.validationImportedDoc) setValidationImportedDoc(s.validationImportedDoc);
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
  }, [verbatims, qualitativeResult, quantitativeData, quantitativeResult, confrontResult, validationResult, analysisMode, quantitativeType, contextInstructions, confrontImportedData, validationImportedDoc, stateLoaded, doSave]);

  const parsedData = useMemo(() => {
    if (!quantitativeData.trim()) return null;
    const { headers, rows } = parseCsvData(quantitativeData);
    if (headers.length < 2 || rows.length === 0) return null;
    return { headers, rows };
  }, [quantitativeData]);

  const numericStats = useMemo(() => {
    if (!parsedData) return { min: 0, max: 100 };
    let min = Infinity;
    let max = -Infinity;
    const { headers, rows } = parsedData;
    for (const row of rows) {
      for (let i = 1; i < headers.length; i++) {
        const val = parseNumericValue(row[headers[i]] || "0");
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 100;
    return { min, max };
  }, [parsedData]);

  const chartData = useMemo(() => {
    if (!parsedData) return [];
    const { headers, rows } = parsedData;
    return rows.map(row => {
      const entry: Record<string, any> = { name: row[headers[0]] || "" };
      for (let i = 1; i < headers.length; i++) {
        entry[headers[i]] = parseNumericValue(row[headers[i]] || "0");
      }
      return entry;
    });
  }, [parsedData]);

  const pieData = useMemo(() => {
    if (!parsedData || parsedData.headers.length < 2) return [];
    const { headers, rows } = parsedData;
    return rows.map(row => ({
      name: row[headers[0]] || "",
      value: parseNumericValue(row[headers[1]] || "0"),
    }));
  }, [parsedData]);

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
      { projectId, verbatims: verbatims.filter(v => v.content.trim()), analysisMode, extraContext: combinedContext || undefined },
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
      { projectId, data: quantitativeData, analysisType: quantitativeType as any, extraContext: combinedContext || undefined },
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
    const allResults = [qualitativeResult, quantitativeResult, confrontImportedData].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: "Résultats requis", description: "Générez d'abord une analyse qualitative ou quantitative.", variant: "destructive" });
      return;
    }
    confrontMutation.mutate(
      { projectId, results: allResults, extraContext: combinedContext || undefined },
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

  const handleImportValidationDoc = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".docx,.pdf,.txt,.rtf,.md,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingValidationDoc(true);
      try {
        let text = "";
        const needsServerParse = /\.(docx|pdf|rtf)$/i.test(file.name);
        if (needsServerParse) {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/parse-file", { method: "POST", body: formData, credentials: "include" });
          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({ message: "Erreur serveur" }));
            throw new Error(errData.message || "Impossible de lire ce fichier.");
          }
          const data = await resp.json();
          text = data.text;
        } else {
          text = await file.text();
        }
        if (!text.trim()) {
          toast({ title: "Fichier vide", description: "Le fichier ne contient pas de texte exploitable.", variant: "destructive" });
          setUploadingValidationDoc(false);
          return;
        }
        setValidationImportedDoc(text);
        toast({ title: "Document importé", description: `"${file.name}" sera utilisé pour la validation des hypothèses.` });
      } catch (err: any) {
        toast({ title: "Erreur d'import", description: err.message || "Impossible de lire le fichier.", variant: "destructive" });
      } finally {
        setUploadingValidationDoc(false);
      }
    };
    input.click();
  };

  const handleValidateHypotheses = () => {
    const allResults = [qualitativeResult, quantitativeResult, confrontResult, validationImportedDoc].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: "Résultats requis", description: "Importez un document d'analyse ou réalisez d'abord les analyses.", variant: "destructive" });
      return;
    }
    validateHypMutation.mutate(
      { projectId, results: allResults, extraContext: combinedContext || undefined },
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

  const handleConfrontFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.xlsx,.xls";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const importedParts: string[] = [];
      for (const file of Array.from(files)) {
        try {
          if (file.name.endsWith(".txt")) {
            const text = await file.text();
            importedParts.push(`--- ${file.name} ---\n${text}`);
          } else if (file.name.endsWith(".csv")) {
            const text = await file.text();
            importedParts.push(`--- ${file.name} ---\n${text}`);
          } else {
            const XLSX = await import("xlsx");
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const allSheets: string[] = [];
            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              const csvData = XLSX.utils.sheet_to_csv(sheet, { FS: ";" });
              allSheets.push(`[${sheetName}]\n${csvData}`);
            }
            importedParts.push(`--- ${file.name} ---\n${allSheets.join("\n\n")}`);
          }
        } catch (err: any) {
          toast({ title: "Erreur d'import", description: `${file.name}: ${err.message || "Impossible de lire le fichier."}`, variant: "destructive" });
        }
      }
      if (importedParts.length > 0) {
        setConfrontImportedData(prev => {
          const combined = [prev, ...importedParts].filter(Boolean).join("\n\n");
          return combined;
        });
        toast({ title: "Import réussi", description: `${importedParts.length} fichier(s) importé(s) pour la confrontation.` });
      }
    };
    input.click();
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
        <div className="space-y-1.5">
          <Label htmlFor="context-instructions" className="text-base font-semibold">Contexte / consignes spécifiques</Label>
          <Textarea
            id="context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder="Ex: Contraintes méthodologiques, instructions du tuteur, contexte particulier..."
            className="min-h-[80px] text-sm"
            data-testid="textarea-context-instructions"
          />
        </div>

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
                Collez vos données (format CSV ou tableau), ou importez un fichier Excel (.xlsx) pour l'analyse.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".xlsx,.xls,.csv";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      try {
                        if (file.name.endsWith(".csv")) {
                          const text = await file.text();
                          setQuantitativeData(text);
                          toast({ title: "CSV importé", description: `${file.name} a été chargé.` });
                        } else {
                          const XLSX = await import("xlsx");
                          const buffer = await file.arrayBuffer();
                          const workbook = XLSX.read(buffer, { type: "array" });
                          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                          const csvData = XLSX.utils.sheet_to_csv(firstSheet, { FS: ";" });
                          setQuantitativeData(csvData);
                          toast({ title: "Excel importé", description: `${file.name} converti en données tabulaires (${workbook.SheetNames[0]}).` });
                        }
                      } catch (err: any) {
                        toast({ title: "Erreur d'import", description: err.message || "Impossible de lire le fichier.", variant: "destructive" });
                      }
                    };
                    input.click();
                  }}
                  data-testid="button-import-excel"
                >
                  <Upload className="w-4 h-4 mr-1" /> Importer Excel / CSV
                </Button>
              </div>
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
                  <SelectTrigger className="w-[320px]" data-testid="select-quantitative-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cross_tab">Tableaux croisés dynamiques</SelectItem>
                    <SelectItem value="cross_chart">Graphiques croisés dynamiques</SelectItem>
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

            {parsedData && parsedData.headers.length >= 2 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Visualisation des données</Label>

                <div className="overflow-x-auto rounded-md border shadow-sm">
                  <table className="w-full text-sm" data-testid="table-cross-tab">
                    <thead>
                      <tr className="bg-indigo-600 dark:bg-indigo-700">
                        {parsedData.headers.map((h, i) => (
                          <th key={i} className="text-left p-2.5 font-semibold text-xs whitespace-nowrap text-white">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.map((row, ri) => (
                        <tr
                          key={ri}
                          className={ri % 2 === 0 ? "bg-slate-50 dark:bg-slate-800/50" : "bg-indigo-50 dark:bg-indigo-950/30"}
                          data-testid={`table-row-${ri}`}
                        >
                          {parsedData.headers.map((h, ci) => {
                            const val = row[h] || "";
                            const numVal = parseNumericValue(val);
                            const isNumeric = ci > 0 && val.trim() !== "" && !isNaN(numVal);
                            return (
                              <td
                                key={ci}
                                className={`p-2.5 text-xs whitespace-nowrap border-b border-indigo-100 dark:border-indigo-900/30 ${
                                  ci === 0
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground"
                                }`}
                                style={isNumeric ? {
                                  backgroundColor: getValueColor(numVal, numericStats.min, numericStats.max),
                                  color: "#1E293B",
                                  fontVariantNumeric: "tabular-nums",
                                } : { fontVariantNumeric: ci > 0 ? "tabular-nums" : undefined }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {(() => {
                        const hasNumericColumns = parsedData.headers.slice(1).some(h =>
                          parsedData.rows.some(row => {
                            const val = row[h] || "";
                            return val.trim() !== "" && !isNaN(parseNumericValue(val));
                          })
                        );
                        if (!hasNumericColumns || parsedData.rows.length < 2) return null;
                        return (
                          <tr className="bg-indigo-900 dark:bg-indigo-800" data-testid="table-totals-row">
                            <td className="p-2.5 text-xs whitespace-nowrap font-bold text-white">
                              Total / Moyenne
                            </td>
                            {parsedData.headers.slice(1).map((h, ci) => {
                              const values = parsedData.rows.map(row => parseNumericValue(row[h] || "0"));
                              const sum = values.reduce((a, b) => a + b, 0);
                              const isPercent = parsedData.rows.some(row => (row[h] || "").includes("%"));
                              const avg = values.length > 0 ? sum / values.length : 0;
                              return (
                                <td key={ci} className="p-2.5 text-xs whitespace-nowrap font-bold text-indigo-200" style={{ fontVariantNumeric: "tabular-nums" }}>
                                  {isPercent ? `${avg.toFixed(1)}%` : sum % 1 === 0 ? sum.toString() : sum.toFixed(1)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="space-y-1.5">
                      <Label className="font-semibold">Graphique croisé dynamique</Label>
                      <Select value={chartType} onValueChange={setChartType}>
                        <SelectTrigger className="w-[280px]" data-testid="select-chart-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Barres groupées</SelectItem>
                          <SelectItem value="stacked">Barres empilées</SelectItem>
                          <SelectItem value="pie">Camembert</SelectItem>
                          <SelectItem value="line">Courbes</SelectItem>
                          <SelectItem value="area">Aires empilées</SelectItem>
                          <SelectItem value="radar">Radar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="w-full h-[400px] p-4 rounded-lg border bg-background shadow-sm" data-testid="chart-container">
                    {chartType === "pie" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={{ stroke: "#94A3B8" }}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={130}
                            innerRadius={50}
                            dataKey="value"
                            strokeWidth={2}
                            stroke="#fff"
                          >
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            formatter={(value: number) => [value.toFixed(1), ""]}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : chartType === "radar" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                          <PolarGrid stroke="#CBD5E1" />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                          <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
                          {parsedData.headers.slice(1).map((header, i) => (
                            <Radar
                              key={header}
                              name={header}
                              dataKey={header}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                              fillOpacity={0.15}
                              strokeWidth={2}
                            />
                          ))}
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : chartType === "line" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                          {parsedData.headers.slice(1).map((header, i) => (
                            <Line
                              key={header}
                              type="monotone"
                              dataKey={header}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2.5}
                              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                              activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : chartType === "area" ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                          {parsedData.headers.slice(1).map((header, i) => (
                            <Area
                              key={header}
                              type="monotone"
                              dataKey={header}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                              fillOpacity={0.2}
                              strokeWidth={2}
                              stackId="1"
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
                          <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            cursor={{ fill: "rgba(79, 70, 229, 0.06)" }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                          {parsedData.headers.slice(1).map((header, i) => (
                            <Bar
                              key={header}
                              dataKey={header}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                              stackId={chartType === "stacked" ? "stack" : undefined}
                              radius={chartType === "stacked" ? undefined : [4, 4, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
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

            <div className="space-y-3">
              <Label className="text-base font-semibold">Importer des données supplémentaires</Label>
              <p className="text-xs text-muted-foreground">
                Importez des retranscriptions d'entretien (.txt), des fichiers Excel/CSV avec verbatims ou données de tableau croisé, ou collez directement du texte.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfrontFileImport}
                  data-testid="button-import-confront-file"
                >
                  <Upload className="w-4 h-4 mr-1" />Importer fichier(s)
                </Button>
                {confrontImportedData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfrontImportedData("");
                      toast({ title: "Données importées effacées" });
                    }}
                    data-testid="button-clear-confront-import"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />Effacer import
                  </Button>
                )}
              </div>
              <Textarea
                value={confrontImportedData}
                onChange={e => setConfrontImportedData(e.target.value)}
                placeholder="Collez ici des verbatims, résultats ou données supplémentaires pour la confrontation..."
                className="min-h-[120px] text-sm"
                data-testid="textarea-confront-imported-data"
              />
              {confrontImportedData && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Données importées: {confrontImportedData.length} caractères
                </Badge>
              )}
            </div>

            <Button
              onClick={handleConfront}
              disabled={confrontMutation.isPending || (!qualitativeResult && !quantitativeResult && !confrontImportedData)}
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
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm text-muted-foreground flex-1 min-w-0">
                  Validez ou invalidez chaque hypothèse de recherche en vous appuyant sur l'ensemble des résultats (analyses qualitative/quantitative et confrontation avec la littérature).
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportValidationDoc}
                  disabled={uploadingValidationDoc}
                  data-testid="button-import-validation-doc"
                >
                  {uploadingValidationDoc ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  Importer un document d'analyse
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {qualitativeResult && <Badge variant="outline" className="text-xs">Qualitative</Badge>}
                {quantitativeResult && <Badge variant="outline" className="text-xs">Quantitative</Badge>}
                {confrontResult && <Badge variant="outline" className="text-xs">Confrontation</Badge>}
                {validationImportedDoc && (
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Document externe importé
                  </Badge>
                )}
              </div>
            </div>

            {validationImportedDoc && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label className="text-sm font-medium">Document d'analyse importé</Label>
                  <Button variant="ghost" size="sm" onClick={() => { setValidationImportedDoc(""); toast({ title: "Document retiré" }); }} data-testid="button-remove-validation-doc">
                    <Trash2 className="w-4 h-4 mr-1" /> Retirer
                  </Button>
                </div>
                <Textarea
                  value={validationImportedDoc}
                  onChange={e => setValidationImportedDoc(e.target.value)}
                  className="min-h-[150px] text-sm"
                  placeholder="Contenu du document importé..."
                  data-testid="textarea-validation-imported-doc"
                />
              </div>
            )}

            <Button
              onClick={handleValidateHypotheses}
              disabled={validateHypMutation.isPending || (!qualitativeResult && !quantitativeResult && !confrontResult && !validationImportedDoc)}
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
