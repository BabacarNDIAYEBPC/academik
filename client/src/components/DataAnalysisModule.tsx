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
  FileText, PenTool, Eye,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import {
  BarChart, PieChart, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const CHART_COLORS = [
  "#2563EB", "#F97316", "#10B981", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F59E0B", "#6366F1", "#06B6D4",
  "#84CC16", "#0EA5E9",
];

function RichTextDisplay({ content, className }: { content: string; className?: string }) {
  const rendered = useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const blocks: { type: string; content: string; level?: number; items?: string[]; headerCells?: string[]; rows?: string[][] }[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const h1 = line.match(/^#\s+(.+)$/);
      const h2 = line.match(/^##\s+(.+)$/);
      const h3 = line.match(/^###\s+(.+)$/);
      const h4 = line.match(/^####\s+(.+)$/);
      if (h4) { blocks.push({ type: "heading", content: h4[1], level: 4 }); i++; continue; }
      if (h3) { blocks.push({ type: "heading", content: h3[1], level: 3 }); i++; continue; }
      if (h2) { blocks.push({ type: "heading", content: h2[1], level: 2 }); i++; continue; }
      if (h1) { blocks.push({ type: "heading", content: h1[1], level: 1 }); i++; continue; }
      if (line.startsWith("|") && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
        const headerCells = line.split("|").filter(Boolean).map(c => c.trim());
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          rows.push(lines[i].split("|").filter(Boolean).map(c => c.trim()));
          i++;
        }
        blocks.push({ type: "table", content: "", headerCells, rows });
        continue;
      }
      if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && (/^[-*]\s/.test(lines[i]) || /^\d+\.\s/.test(lines[i]))) {
          items.push(lines[i].replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, ""));
          i++;
        }
        blocks.push({ type: "list", content: "", items });
        continue;
      }
      if (line.trim() === "") { i++; continue; }
      let paragraph = line;
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("|") && !/^[-*]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i])) {
        paragraph += " " + lines[i];
        i++;
      }
      blocks.push({ type: "paragraph", content: paragraph });
    }
    return blocks;
  }, [content]);

  const formatInline = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      if (match[2]) parts.push(<strong key={key} className="italic font-bold">{match[2]}</strong>);
      else if (match[3]) parts.push(<strong key={key} className="font-semibold">{match[3]}</strong>);
      else if (match[4]) parts.push(<em key={key} className="italic text-muted-foreground">{match[4]}</em>);
      else if (match[5]) parts.push(<code key={key} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{match[5]}</code>);
      key++;
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      {rendered.map((block, idx) => {
        if (block.type === "heading") {
          if (block.level === 1) return <h3 key={idx} className="text-lg font-bold text-foreground border-b pb-2">{formatInline(block.content)}</h3>;
          if (block.level === 2) return <h4 key={idx} className="text-base font-bold text-foreground mt-4">{formatInline(block.content)}</h4>;
          if (block.level === 3) return <h5 key={idx} className="text-sm font-bold text-foreground mt-3">{formatInline(block.content)}</h5>;
          return <h6 key={idx} className="text-sm font-semibold text-muted-foreground mt-2">{formatInline(block.content)}</h6>;
        }
        if (block.type === "table" && block.headerCells && block.rows) {
          return (
            <div key={idx} className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse" data-testid={`rich-table-${idx}`}>
                <thead>
                  <tr>
                    {block.headerCells.map((cell, ci) => (
                      <th key={ci} className="text-left px-3 py-2 text-xs font-bold text-white whitespace-nowrap bg-[#00BCD4] border border-[#00ACC1]">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 ${ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "list" && block.items) {
          return (
            <ul key={idx} className="space-y-1.5 pl-1">
              {block.items.map((item, li) => (
                <li key={li} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  <span>{formatInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={idx} className="text-sm text-foreground leading-relaxed">{formatInline(block.content)}</p>;
      })}
    </div>
  );
}

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

interface CrossTabGroup {
  id: string;
  title: string;
  headers: string[];
  rows: Record<string, string>[];
  chartType: string;
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

function generateCrossTabsFromData(rawHeaders: string[], rawRows: Record<string, string>[]): CrossTabGroup[] {
  if (rawHeaders.length < 2 || rawRows.length === 0) return [];

  const isNumericColumn = (col: string) => {
    const vals = rawRows.map(r => r[col] || "").filter(v => v.trim() !== "");
    if (vals.length === 0) return false;
    const numCount = vals.filter(v => !isNaN(parseNumericValue(v))).length;
    return numCount / vals.length > 0.7;
  };

  const categoricalCols = rawHeaders.filter(h => !isNumericColumn(h));
  const numericCols = rawHeaders.filter(h => isNumericColumn(h));

  const groups: CrossTabGroup[] = [];
  const chartTypes = ["bar", "stacked", "pie", "line", "area", "radar"];
  let chartIdx = 0;

  if (categoricalCols.length >= 2) {
    for (let a = 0; a < categoricalCols.length && a < 3; a++) {
      for (let b = a + 1; b < categoricalCols.length && b < 4; b++) {
        const colA = categoricalCols[a];
        const colB = categoricalCols[b];
        const valuesA = Array.from(new Set(rawRows.map(r => r[colA] || "").filter(Boolean)));
        const valuesB = Array.from(new Set(rawRows.map(r => r[colB] || "").filter(Boolean)));
        if (valuesA.length < 2 || valuesA.length > 15 || valuesB.length < 2 || valuesB.length > 15) continue;

        const crossHeaders = [colA, ...valuesB, "Total"];
        const crossRows: Record<string, string>[] = valuesA.map(va => {
          const row: Record<string, string> = { [colA]: va };
          let total = 0;
          valuesB.forEach(vb => {
            const count = rawRows.filter(r => r[colA] === va && r[colB] === vb).length;
            row[vb] = count.toString();
            total += count;
          });
          row["Total"] = total.toString();
          return row;
        });
        const totalRow: Record<string, string> = { [colA]: "Total" };
        let grandTotal = 0;
        valuesB.forEach(vb => {
          const colTotal = rawRows.filter(r => r[colB] === vb).length;
          totalRow[vb] = colTotal.toString();
          grandTotal += colTotal;
        });
        totalRow["Total"] = grandTotal.toString();
        crossRows.push(totalRow);

        groups.push({
          id: `cross-${a}-${b}`,
          title: `${colA} et ${colB}`,
          headers: crossHeaders,
          rows: crossRows,
          chartType: chartTypes[chartIdx % chartTypes.length],
        });
        chartIdx++;
      }
    }
  }

  if (categoricalCols.length >= 1 && numericCols.length >= 1) {
    for (let c = 0; c < categoricalCols.length && c < 3; c++) {
      const catCol = categoricalCols[c];
      const catValues = Array.from(new Set(rawRows.map(r => r[catCol] || "").filter(Boolean)));
      if (catValues.length < 2 || catValues.length > 15) continue;

      const relevantNumCols = numericCols.slice(0, 4);
      const crossHeaders = [catCol, ...relevantNumCols];
      const crossRows: Record<string, string>[] = catValues.map(cv => {
        const row: Record<string, string> = { [catCol]: cv };
        const matching = rawRows.filter(r => r[catCol] === cv);
        relevantNumCols.forEach(nc => {
          const vals = matching.map(r => parseNumericValue(r[nc] || "0"));
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          row[nc] = avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
        });
        return row;
      });

      groups.push({
        id: `cat-num-${c}`,
        title: `${catCol} par ${relevantNumCols.join(", ")}`,
        headers: crossHeaders,
        rows: crossRows,
        chartType: chartTypes[chartIdx % chartTypes.length],
      });
      chartIdx++;
    }
  }

  if (groups.length === 0 && rawHeaders.length >= 2) {
    groups.push({
      id: "raw-data",
      title: `${rawHeaders[0]} - Données brutes`,
      headers: rawHeaders,
      rows: rawRows,
      chartType: "bar",
    });
  }

  return groups;
}

function extractCrossTabsFromResult(resultText: string): CrossTabGroup[] {
  if (!resultText.trim()) return [];
  const groups: CrossTabGroup[] = [];
  const sections = resultText.split(/(?=^#{1,3}\s)/m);
  const chartTypes = ["bar", "stacked", "pie", "line", "area", "radar"];

  sections.forEach((sec, idx) => {
    const titleMatch = sec.match(/^#{1,3}\s+(.+)$/m);
    const lines = sec.split("\n");
    let headerLine = "";
    const dataLines: string[] = [];
    let foundSeparator = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith("|")) { if (foundSeparator) break; continue; }
      if (/^\|[\s:|-]+\|$/.test(line)) {
        foundSeparator = true;
        if (i > 0) {
          const prev = lines[i - 1].trim();
          if (prev.startsWith("|")) headerLine = prev;
        }
        continue;
      }
      if (foundSeparator) {
        dataLines.push(line);
      } else if (!headerLine) {
        headerLine = line;
      }
    }

    if (headerLine && dataLines.length >= 1) {
      const headerCells = headerLine.split("|").filter(Boolean).map(c => c.trim());
      const dataRows = dataLines.map(line => {
        const cells = line.split("|").filter(Boolean).map(c => c.trim());
        const row: Record<string, string> = {};
        headerCells.forEach((h, i) => { row[h] = cells[i] || ""; });
        return row;
      });

      groups.push({
        id: `result-${idx}`,
        title: titleMatch ? titleMatch[1].replace(/\*\*/g, "").trim() : `Tableau ${idx + 1}`,
        headers: headerCells,
        rows: dataRows,
        chartType: chartTypes[groups.length % chartTypes.length],
      });
    }
  });

  return groups;
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

function ResultDisplay({ label, value, onChange, testId }: { label: string; value: string; onChange: (v: string) => void; testId: string }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-base font-bold">{label}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(!editing)}
          data-testid={`button-toggle-edit-${testId}`}
        >
          {editing ? <><Eye className="w-4 h-4 mr-1" />Aperçu</> : <><PenTool className="w-4 h-4 mr-1" />Modifier</>}
        </Button>
      </div>
      {editing ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-h-[400px] text-sm font-mono"
          data-testid={`textarea-${testId}`}
        />
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 min-h-[200px]" data-testid={`display-${testId}`}>
          <RichTextDisplay content={value} />
        </div>
      )}
    </div>
  );
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
  const [chartTypeOverrides, setChartTypeOverrides] = useState<Record<string, string>>({});
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

  const crossTabGroups = useMemo((): CrossTabGroup[] => {
    const fromResult = extractCrossTabsFromResult(quantitativeResult);
    if (fromResult.length > 0) return fromResult;
    if (parsedData) return generateCrossTabsFromData(parsedData.headers, parsedData.rows);
    return [];
  }, [quantitativeResult, parsedData]);

  const getGroupChartType = (group: CrossTabGroup) => chartTypeOverrides[group.id] || group.chartType;

  const getGroupChartData = (group: CrossTabGroup) => {
    const { headers, rows } = group;
    const dataRows = rows.filter(r => r[headers[0]] !== "Total");
    return dataRows.map(row => {
      const entry: Record<string, any> = { name: row[headers[0]] || "" };
      for (let i = 1; i < headers.length; i++) {
        if (headers[i] === "Total") continue;
        entry[headers[i]] = parseNumericValue(row[headers[i]] || "0");
      }
      return entry;
    });
  };

  const getGroupPieData = (group: CrossTabGroup) => {
    const { headers, rows } = group;
    const dataRows = rows.filter(r => r[headers[0]] !== "Total");
    if (headers.length < 2) return [];
    const valueCol = headers.find(h => h !== headers[0] && h !== "Total") || headers[1];
    return dataRows.map(row => ({
      name: row[headers[0]] || "",
      value: parseNumericValue(row[valueCol] || "0"),
    }));
  };

  const getGroupNumericStats = (group: CrossTabGroup) => {
    let min = Infinity, max = -Infinity;
    const { headers, rows } = group;
    for (const row of rows) {
      for (let i = 1; i < headers.length; i++) {
        if (headers[i] === "Total") continue;
        const val = parseNumericValue(row[headers[i]] || "0");
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 100;
    return { min, max };
  };

  const getGroupDataHeaders = (group: CrossTabGroup) => {
    return group.headers.filter(h => h !== "Total");
  };

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

            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="space-y-1.5 w-full sm:w-auto">
                <Label>Mode d'analyse</Label>
                <Select value={analysisMode} onValueChange={setAnalysisMode}>
                  <SelectTrigger className="w-full sm:w-[250px]" data-testid="select-analysis-mode"><SelectValue /></SelectTrigger>
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
              <ResultDisplay
                label="Résultat de l'analyse qualitative"
                value={qualitativeResult}
                onChange={setQualitativeResult}
                testId="qualitative-result"
              />
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

            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
              <div className="space-y-1.5 w-full sm:w-auto">
                <Label>Type d'analyse</Label>
                <Select value={quantitativeType} onValueChange={setQuantitativeType}>
                  <SelectTrigger className="w-full sm:w-[320px]" data-testid="select-quantitative-type"><SelectValue /></SelectTrigger>
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
              <ResultDisplay
                label="Résultat de l'analyse quantitative"
                value={quantitativeResult}
                onChange={setQuantitativeResult}
                testId="quantitative-result"
              />
            )}

            {crossTabGroups.length > 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#00BCD4]" />
                    <Label className="text-base font-bold">Tableaux croisés dynamiques</Label>
                    <Badge variant="outline" className="text-xs">{crossTabGroups.length} tableau{crossTabGroups.length > 1 ? "x" : ""}</Badge>
                  </div>
                </div>

                {crossTabGroups.map((group) => {
                  const stats = getGroupNumericStats(group);
                  const dataHeaders = getGroupDataHeaders(group);
                  const currentChartType = getGroupChartType(group);
                  const cData = getGroupChartData(group);
                  const pData = getGroupPieData(group);
                  const hasNumericData = cData.some(entry => dataHeaders.slice(1).some(h => (entry[h] as number) > 0));

                  return (
                    <div key={group.id} className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2" data-testid={`text-crosstab-title-${group.id}`}>
                        <span className="w-2 h-2 rounded-full bg-[#00BCD4]" />
                        {group.title}
                      </h4>

                      <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-sm border-collapse" data-testid={`table-cross-tab-${group.id}`}>
                          <thead>
                            <tr>
                              {group.headers.map((h, i) => (
                                <th key={i} className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap text-white bg-[#00BCD4] border-r border-[#00ACC1] last:border-r-0">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row, ri) => {
                              const isTotal = row[group.headers[0]] === "Total";
                              return (
                                <tr
                                  key={ri}
                                  className={isTotal
                                    ? "bg-[#00BCD4]/10 dark:bg-[#00BCD4]/20 border-t-2 border-[#00BCD4]"
                                    : `border-b border-slate-200 dark:border-slate-700 ${ri % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/80 dark:bg-slate-800/30"}`
                                  }
                                  data-testid={`table-row-${group.id}-${ri}`}
                                >
                                  {group.headers.map((h, ci) => {
                                    const val = row[h] || "";
                                    const numVal = parseNumericValue(val);
                                    const isNumeric = ci > 0 && val.trim() !== "" && !isNaN(numVal);
                                    return (
                                      <td
                                        key={ci}
                                        className={`px-4 py-2.5 text-xs whitespace-nowrap border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                                          isTotal ? "font-bold text-foreground" : ci === 0 ? "font-semibold text-foreground" : "text-foreground"
                                        }`}
                                        style={isNumeric && !isTotal ? {
                                          backgroundColor: getValueColor(numVal, stats.min, stats.max),
                                          color: "#1E293B",
                                          fontVariantNumeric: "tabular-nums",
                                          textAlign: "right",
                                        } : { fontVariantNumeric: ci > 0 ? "tabular-nums" : undefined, textAlign: ci > 0 ? "right" : undefined }}
                                      >
                                        {val}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {hasNumericData && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Graphique : {group.title}</p>
                          <Select
                            value={currentChartType}
                            onValueChange={(val) => setChartTypeOverrides(prev => ({ ...prev, [group.id]: val }))}
                          >
                            <SelectTrigger className="w-full sm:w-[200px]" data-testid={`select-chart-type-${group.id}`}><SelectValue /></SelectTrigger>
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

                        <div className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden" data-testid={`chart-container-${group.id}`}>
                          <div className="h-[380px] p-5 pb-2">
                            {currentChartType === "pie" ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pData}
                                    cx="50%"
                                    cy="45%"
                                    labelLine={{ stroke: "#94A3B8" }}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={120}
                                    innerRadius={45}
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="#fff"
                                  >
                                    {pData.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "12px" }} formatter={(value: number) => [value.toFixed(1), ""]} />
                                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", lineHeight: "24px", paddingLeft: "20px" }} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : currentChartType === "radar" ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={cData}>
                                  <PolarGrid stroke="#CBD5E1" />
                                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                                  <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
                                  {dataHeaders.slice(1).map((header, i) => (
                                    <Radar key={header} name={header} dataKey={header} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
                                  ))}
                                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", lineHeight: "24px", paddingLeft: "20px" }} />
                                </RadarChart>
                              </ResponsiveContainer>
                            ) : currentChartType === "line" ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} />
                                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} />
                                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", lineHeight: "24px", paddingLeft: "20px" }} />
                                  {dataHeaders.slice(1).map((header, i) => (
                                    <Line key={header} type="monotone" dataKey={header} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, strokeWidth: 2 }} />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>
                            ) : currentChartType === "area" ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} />
                                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={{ stroke: "#CBD5E1" }} />
                                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "12px" }} />
                                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", lineHeight: "24px", paddingLeft: "20px" }} />
                                  {dataHeaders.slice(1).map((header, i) => (
                                    <Area key={header} type="monotone" dataKey={header} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.2} strokeWidth={2} stackId="1" />
                                  ))}
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }} barCategoryGap="20%">
                                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={false} />
                                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#CBD5E1" }} tickLine={false} allowDecimals={false} />
                                  <Tooltip contentStyle={{ borderRadius: "6px", border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: "12px" }} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", lineHeight: "24px", paddingLeft: "20px" }} />
                                  {dataHeaders.slice(1).map((header, i) => (
                                    <Bar key={header} dataKey={header} fill={CHART_COLORS[i % CHART_COLORS.length]} stackId={currentChartType === "stacked" ? "stack" : undefined} radius={currentChartType === "stacked" ? undefined : [2, 2, 0, 0]} maxBarSize={60} />
                                  ))}
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                          <div className="px-5 pb-3 pt-1 text-center">
                            <p className="text-xs font-medium text-muted-foreground" data-testid={`text-chart-title-${group.id}`}>
                              {group.title}
                            </p>
                          </div>
                        </div>
                      </div>
                      )}
                      {!hasNumericData && (
                        <p className="text-xs text-muted-foreground italic py-2">Aucune donnée numérique disponible pour générer un graphique.</p>
                      )}
                    </div>
                  );
                })}
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
              <ResultDisplay
                label="Confrontation des résultats"
                value={confrontResult}
                onChange={setConfrontResult}
                testId="confront-result"
              />
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
              <ResultDisplay
                label="Validation des hypothèses"
                value={validationResult}
                onChange={setValidationResult}
                testId="validation-result"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
