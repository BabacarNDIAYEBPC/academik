import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  useValidateHypotheses,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, Save, Check, X, FileDown, Upload,
  Trash2, FileText, PenTool, Eye,
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

interface HypothesisValidationModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface HypothesisValidationSavedState {
  validationResult: string;
  validationImportedDoc: string;
  contextInstructions: string;
  analysisData: string;
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
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 md:p-5 min-h-[200px]" data-testid={`display-${testId}`}>
          <RichTextDisplay content={value} />
        </div>
      )}
    </div>
  );
}

export default function HypothesisValidationModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: HypothesisValidationModuleProps) {
  const [validationResult, setValidationResult] = useState("");
  const [validationImportedDoc, setValidationImportedDoc] = useState("");
  const [contextInstructions, setContextInstructions] = useState("");
  const [analysisData, setAnalysisData] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const validateHypMutation = useValidateHypotheses();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ validationResult, validationImportedDoc, contextInstructions, analysisData });
  useEffect(() => {
    stateRef.current = { validationResult, validationImportedDoc, contextInstructions, analysisData };
  }, [validationResult, validationImportedDoc, contextInstructions, analysisData]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: HypothesisValidationSavedState = {
      validationResult: s.validationResult,
      validationImportedDoc: s.validationImportedDoc,
      contextInstructions: s.contextInstructions,
      analysisData: s.analysisData,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { hypothesisValidationState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.hypothesisValidationState) {
      const s = cfg.hypothesisValidationState as HypothesisValidationSavedState;
      if (s.validationResult) setValidationResult(s.validationResult);
      if (s.validationImportedDoc) setValidationImportedDoc(s.validationImportedDoc);
      if (s.contextInstructions) setContextInstructions(s.contextInstructions);
      if (s.analysisData) setAnalysisData(s.analysisData);
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
  }, [validationResult, validationImportedDoc, contextInstructions, analysisData, stateLoaded, doSave]);

  const handleImportValidationDoc = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".docx,.pdf,.txt,.rtf,.md,.csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploadingDoc(true);
      try {
        let text = "";
        const needsServerParse = /\.(docx|pdf|rtf)$/i.test(file.name);
        if (needsServerParse) {
          const formData = new FormData();
          formData.append("file", file);
          const resp = await fetch("/api/parse-file", { method: "POST", body: formData, credentials: "include" });
          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({ message: t("modules.common.serverError") }));
            throw new Error(errData.message || t("modules.common.cannotReadFile"));
          }
          const data = await resp.json();
          text = data.text;
        } else {
          text = await file.text();
        }
        if (!text.trim()) {
          toast({ title: t("modules.dataAnalysis.fileEmpty"), description: t("modules.dataAnalysis.fileEmptyDesc"), variant: "destructive" });
          setUploadingDoc(false);
          return;
        }
        setValidationImportedDoc(text);
        toast({ title: t("modules.dataAnalysis.documentImported"), description: `"${file.name}" ${t("modules.dataAnalysis.docUsedForValidation")}` });
      } catch (err: any) {
        toast({ title: t("modules.dataAnalysis.importError"), description: err.message || t("modules.common.cannotReadFile"), variant: "destructive" });
      } finally {
        setUploadingDoc(false);
      }
    };
    input.click();
  };

  const handleValidateHypotheses = () => {
    const allResults = [analysisData, validationImportedDoc].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: t("modules.dataAnalysis.resultsRequired"), description: t("modules.dataAnalysis.importOrAnalyzeFirst"), variant: "destructive" });
      return;
    }
    validateHypMutation.mutate(
      { projectId, results: allResults, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setValidationResult(data.content);
          toast({ title: t("modules.dataAnalysis.validationComplete") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataAnalysis.validationError"), variant: "destructive" });
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
    if (!validationResult) return;
    exportToWord(
      t("modules.dataAnalysis.validationResultLabel"),
      [{ label: t("modules.dataAnalysis.validationResultLabel"), content: validationResult }],
      `validation_hypotheses_${projectId}`
    );
  };

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Check className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">{t("modules.dataAnalysis.validationResultLabel")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-hypothesis-validation">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!validationResult} data-testid="button-export-hypothesis-validation">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleSectionValidate} data-testid="button-validate-hypothesis-validation">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleSectionUnvalidate} data-testid="button-unvalidate-hypothesis-validation">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="hyp-context-instructions" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="hyp-context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="textarea-hyp-context-instructions"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("modules.dataAnalysis.validationDesc")}
          </p>

          <div className="space-y-1.5">
            <Label className="text-base font-semibold">{t("modules.dataAnalysis.analysisDataLabel") || "Données d'analyse"}</Label>
            <p className="text-xs text-muted-foreground">
              {t("modules.dataAnalysis.analysisDataDesc") || "Collez ici les résultats de vos analyses (qualitative, quantitative, confrontation) pour la validation des hypothèses."}
            </p>
            <Textarea
              value={analysisData}
              onChange={e => setAnalysisData(e.target.value)}
              placeholder={t("modules.dataAnalysis.analysisDataPlaceholder") || "Collez ici vos résultats d'analyse..."}
              className="min-h-[200px] text-sm"
              data-testid="textarea-hyp-analysis-data"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <Label className="text-base font-semibold">{t("modules.dataAnalysis.importAnalysisDoc")}</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportValidationDoc}
              disabled={uploadingDoc}
              data-testid="button-import-hyp-validation-doc"
            >
              {uploadingDoc ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              {t("modules.dataAnalysis.importAnalysisDoc")}
            </Button>
          </div>

          {validationImportedDoc && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {t("modules.dataAnalysis.externalDocImported")}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setValidationImportedDoc(""); toast({ title: t("modules.dataAnalysis.documentRemoved") }); }}
                  data-testid="button-remove-hyp-validation-doc"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> {t("modules.dataAnalysis.removeDoc")}
                </Button>
              </div>
              <Textarea
                value={validationImportedDoc}
                onChange={e => setValidationImportedDoc(e.target.value)}
                className="min-h-[150px] text-sm"
                placeholder={t("modules.dataAnalysis.importedDocContent")}
                data-testid="textarea-hyp-validation-imported-doc"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleValidateHypotheses}
          disabled={validateHypMutation.isPending || (!analysisData && !validationImportedDoc)}
          data-testid="button-validate-hypotheses"
        >
          {validateHypMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
          {t("modules.dataAnalysis.validateHypotheses")}
        </Button>

        {validationResult && (
          <ResultDisplay
            label={t("modules.dataAnalysis.validationResultLabel")}
            value={validationResult}
            onChange={setValidationResult}
            testId="hypothesis-validation-result"
          />
        )}
      </CardContent>
    </Card>
  );
}
