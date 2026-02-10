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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  useAnalyzeQualitative,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, BarChart3, Save, Check, X, FileDown,
  Plus, Trash2, BookOpen,
  PenTool, Eye,
} from "lucide-react";
import { exportToWord } from "@/lib/export-utils";
import { useI18n } from "@/lib/i18n";

function RichTextDisplay({ content, className }: { content: string; className?: string }) {
  const rendered = useMemo(() => {
    if (!content) return [];
    const lines = content.split("\n");
    const blocks: { type: string; content: string; level?: number; items?: string[]; headerCells?: string[]; rows?: string[][] }[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const h1 = line.match(/^#\s*(.+)$/);
      const h2 = line.match(/^##\s*(.+)$/);
      const h3 = line.match(/^###\s*(.+)$/);
      const h4 = line.match(/^####\s*(.+)$/);
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
          if (block.level === 1) return <h3 key={idx} className="text-lg md:text-xl font-bold text-foreground border-b pb-2">{formatInline(block.content)}</h3>;
          if (block.level === 2) return <h4 key={idx} className="text-base md:text-lg font-bold text-foreground mt-4">{formatInline(block.content)}</h4>;
          if (block.level === 3) return <h5 key={idx} className="text-sm md:text-base font-bold text-foreground mt-3">{formatInline(block.content)}</h5>;
          return <h6 key={idx} className="text-sm font-semibold text-muted-foreground mt-2">{formatInline(block.content)}</h6>;
        }
        if (block.type === "table" && block.headerCells && block.rows) {
          return (
            <div key={idx} className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse" data-testid={`rich-table-${idx}`}>
                <thead>
                  <tr>
                    {block.headerCells.map((cell, ci) => (
                      <th key={ci} className="text-left px-3 py-2 text-xs md:text-sm font-bold text-primary-foreground whitespace-nowrap bg-primary/80 border border-primary/60">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-3 py-2 text-xs md:text-sm border border-border ${ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
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
                <li key={li} className="flex items-start gap-2 text-sm md:text-base text-foreground leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  <span>{formatInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={idx} className="text-sm md:text-base text-foreground leading-relaxed">{formatInline(block.content)}</p>;
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

interface SavedState {
  verbatims: VerbatimEntry[];
  qualitativeResult: string;
  depouillementData: string;
  depouillementResult: string;
  analysisMode: string;
  depouillementType: string;
  contextInstructions: string;
  respondentCount: number;
  depouillementInstructions: string;
}

function ResultDisplay({ label, value, onChange, testId }: { label: string; value: string; onChange: (v: string) => void; testId: string }) {
  const [editing, setEditing] = useState(false);
  const { t } = useI18n();
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
          {editing ? <><Eye className="w-4 h-4 mr-1" />{t("modules.dataAnalysis.previewBtn")}</> : <><PenTool className="w-4 h-4 mr-1" />{t("modules.dataAnalysis.editBtn")}</>}
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
        <div className="rounded-md border border-border bg-card p-4 md:p-6 min-h-[200px]" data-testid={`display-${testId}`}>
          <RichTextDisplay content={value} />
        </div>
      )}
    </div>
  );
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
  const [depouillementData, setDepouillementData] = useState("");
  const [depouillementType, setDepouillementType] = useState("depouillement");
  const [depouillementResult, setDepouillementResult] = useState("");
  const [contextInstructions, setContextInstructions] = useState("");
  const [respondentCount, setRespondentCount] = useState(30);
  const [depouillementInstructions, setDepouillementInstructions] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const qualitativeMutation = useAnalyzeQualitative();
  const depouillementMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/sections/questionnaire-analysis/generate`, data);
      return res.json();
    },
  });
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ verbatims, qualitativeResult, depouillementData, depouillementResult, analysisMode, depouillementType, contextInstructions, respondentCount, depouillementInstructions });
  useEffect(() => {
    stateRef.current = { verbatims, qualitativeResult, depouillementData, depouillementResult, analysisMode, depouillementType, contextInstructions, respondentCount, depouillementInstructions };
  }, [verbatims, qualitativeResult, depouillementData, depouillementResult, analysisMode, depouillementType, contextInstructions, respondentCount, depouillementInstructions]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedState = {
      verbatims: s.verbatims,
      qualitativeResult: s.qualitativeResult,
      depouillementData: s.depouillementData,
      depouillementResult: s.depouillementResult,
      analysisMode: s.analysisMode,
      depouillementType: s.depouillementType,
      contextInstructions: s.contextInstructions,
      respondentCount: s.respondentCount,
      depouillementInstructions: s.depouillementInstructions,
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
      if (s.depouillementData) setDepouillementData(s.depouillementData);
      if (s.depouillementResult) setDepouillementResult(s.depouillementResult);
      if (s.analysisMode) setAnalysisMode(s.analysisMode);
      if (s.depouillementType) setDepouillementType(s.depouillementType);
      if (s.contextInstructions) setContextInstructions(s.contextInstructions);
      if (s.respondentCount) setRespondentCount(s.respondentCount);
      if (s.depouillementInstructions) setDepouillementInstructions(s.depouillementInstructions);
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
  }, [verbatims, qualitativeResult, depouillementData, depouillementResult, analysisMode, depouillementType, contextInstructions, respondentCount, depouillementInstructions, stateLoaded, doSave]);

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
      toast({ title: t("modules.dataAnalysis.dataRequired"), description: t("modules.dataAnalysis.addVerbatimError"), variant: "destructive" });
      return;
    }
    qualitativeMutation.mutate(
      { projectId, verbatims: verbatims.filter(v => v.content.trim()), analysisMode, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setQualitativeResult(data.content);
          toast({ title: t("modules.dataAnalysis.analysisComplete"), description: t("modules.dataAnalysis.qualitativeGenerated") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataAnalysis.analysisError"), variant: "destructive" });
        },
      }
    );
  };

  const handleDepouillementAnalysis = () => {
    if (!depouillementData.trim()) {
      toast({ title: t("modules.dataAnalysis.dataRequired"), description: t("modules.dataAnalysis.pasteQuantitativeData"), variant: "destructive" });
      return;
    }
    const combinedCtx = [extraContext, contextInstructions, depouillementInstructions].filter(Boolean).join("\n");
    depouillementMutation.mutate(
      {
        projectId,
        analysisType: depouillementType,
        respondentCount,
        responseData: depouillementData,
        extraContext: combinedCtx || undefined,
        variables,
        projectType,
      },
      {
        onSuccess: (data: any) => {
          const result = data.content || "";
          setDepouillementResult(result);
          toast({ title: t("modules.dataAnalysis.analysisComplete"), description: t("modules.dataAnalysis.quantitativeGenerated") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataAnalysis.analysisError"), variant: "destructive" });
        },
      }
    );
  };


  const handleSectionValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.sectionValidated") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const handleSectionUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => toast({ title: t("modules.common.validationRemoved") }),
        onError: () => toast({ title: t("modules.common.error"), variant: "destructive" }),
      }
    );
  };

  const handleExport = () => {
    const sections = [];
    if (qualitativeResult) sections.push({ label: t("modules.dataAnalysis.qualitativeExport"), content: qualitativeResult });
    if (depouillementResult) sections.push({ label: t("modules.dataAnalysis.quantitativeExport"), content: depouillementResult });
    if (sections.length === 0) {
      toast({ title: t("modules.common.nothingToExport"), variant: "destructive" });
      return;
    }
    exportToWord(t("modules.dataAnalysis.exportTitle"), sections, "analyse_donnees.docx");
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">{t("modules.dataAnalysis.title")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-analysis">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-analysis">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleSectionValidate} data-testid="button-validate-analysis">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleSectionUnvalidate} data-testid="button-unvalidate-analysis">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="context-instructions" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="textarea-context-instructions"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="qualitative" className="gap-1" data-testid="tab-qualitative">
              <BookOpen className="w-4 h-4" />{t("modules.dataAnalysis.qualitativeTab")}
            </TabsTrigger>
            <TabsTrigger value="quantitative" className="gap-1" data-testid="tab-quantitative">
              <BarChart3 className="w-4 h-4" />Dépouillement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qualitative" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-base font-semibold">{t("modules.dataAnalysis.verbatimsLabel")}</Label>
                <Button variant="outline" size="sm" onClick={addVerbatim} data-testid="button-add-verbatim">
                  <Plus className="w-4 h-4 mr-1" />{t("modules.dataAnalysis.addInterview")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("modules.dataAnalysis.verbatimsDesc")}
              </p>

              {verbatims.map((v, index) => (
                <Card key={v.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{t("modules.dataAnalysis.interviewBadge")} {index + 1}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => removeVerbatim(v.id)} data-testid={`button-remove-verbatim-${v.id}`}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("modules.dataAnalysis.initialsLabel")}</Label>
                        <Input
                          value={v.initials}
                          onChange={e => updateVerbatim(v.id, "initials", e.target.value)}
                          placeholder={t("modules.dataAnalysis.initialsPlaceholder")}
                          className="text-sm"
                          data-testid={`input-verbatim-initials-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("modules.dataAnalysis.functionLabel")}</Label>
                        <Input
                          value={v.function}
                          onChange={e => updateVerbatim(v.id, "function", e.target.value)}
                          placeholder={t("modules.dataAnalysis.functionPlaceholder")}
                          className="text-sm"
                          data-testid={`input-verbatim-function-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("modules.dataAnalysis.structureLabel")}</Label>
                        <Input
                          value={v.structureType}
                          onChange={e => updateVerbatim(v.id, "structureType", e.target.value)}
                          placeholder={t("modules.dataAnalysis.structurePlaceholder")}
                          className="text-sm"
                          data-testid={`input-verbatim-structure-${v.id}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("modules.dataAnalysis.dateLabel")}</Label>
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
                      <Label className="text-xs">{t("modules.dataAnalysis.verbatimLabel")}</Label>
                      <Textarea
                        value={v.content}
                        onChange={e => updateVerbatim(v.id, "content", e.target.value)}
                        placeholder={t("modules.dataAnalysis.verbatimPlaceholder")}
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
                <Label>{t("modules.dataAnalysis.analysisModeLabel")}</Label>
                <Select value={analysisMode} onValueChange={setAnalysisMode}>
                  <SelectTrigger className="w-full sm:w-[250px]" data-testid="select-analysis-mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_interview">{t("modules.dataAnalysis.perInterview")}</SelectItem>
                    <SelectItem value="global">{t("modules.dataAnalysis.globalMode")}</SelectItem>
                    <SelectItem value="per_hypothesis">{t("modules.dataAnalysis.perHypothesis")}</SelectItem>
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
                {t("modules.dataAnalysis.analyzeVerbatims")}
              </Button>
            </div>

            {qualitativeResult && (
              <ResultDisplay
                label={t("modules.dataAnalysis.qualitativeResultLabel")}
                value={qualitativeResult}
                onChange={setQualitativeResult}
                testId="qualitative-result"
              />
            )}
          </TabsContent>

          <TabsContent value="quantitative" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("modules.dataAnalysis.quantitativeDataLabel")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("modules.dataAnalysis.quantitativeDataDesc")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("modules.dataAnalysis.analysisTypeLabel")}</Label>
                  <Select value={depouillementType} onValueChange={setDepouillementType}>
                    <SelectTrigger data-testid="select-depouillement-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depouillement">{t("modules.questionnaireAnalysis.typeDepouillement")}</SelectItem>
                      <SelectItem value="tri_plat">{t("modules.questionnaireAnalysis.typeTriPlat")}</SelectItem>
                      <SelectItem value="tri_croise">{t("modules.questionnaireAnalysis.typeTriCroise")}</SelectItem>
                      <SelectItem value="analyse_thematique">{t("modules.questionnaireAnalysis.typeThematique")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nombre de répondants</Label>
                  <Input
                    type="number"
                    min={1}
                    value={respondentCount}
                    onChange={e => setRespondentCount(parseInt(e.target.value) || 1)}
                    data-testid="input-respondent-count"
                  />
                </div>
              </div>

              <Textarea
                value={depouillementData}
                onChange={e => setDepouillementData(e.target.value)}
                placeholder="Collez ici les données de réponses (questions et réponses)..."
                className="min-h-[200px] text-sm"
                data-testid="textarea-depouillement-data"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Instructions spécifiques</Label>
              <Textarea
                value={depouillementInstructions}
                onChange={e => setDepouillementInstructions(e.target.value)}
                placeholder="Instructions supplémentaires pour l'analyse..."
                className="min-h-[80px] text-sm"
                data-testid="textarea-depouillement-instructions"
              />
            </div>

            <Button
              onClick={handleDepouillementAnalysis}
              disabled={depouillementMutation.isPending || !depouillementData.trim()}
              data-testid="button-analyze-depouillement"
            >
              {depouillementMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              {t("modules.dataAnalysis.analyzeData")}
            </Button>

            {depouillementResult && (
              <ResultDisplay
                label={t("modules.dataAnalysis.quantitativeResultLabel")}
                value={depouillementResult}
                onChange={setDepouillementResult}
                testId="depouillement-result"
              />
            )}
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
