import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  useConfrontResults,
  useSaveSectionConfig,
  useValidateSection,
  useUnvalidateSection,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import {
  Loader2, Save, Check, X, FileDown, Upload,
  FlaskConical, Trash2, FileText, PenTool, Eye,
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

interface ConfrontationModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface ConfrontationSavedState {
  confrontResult: string;
  confrontImportedData: string;
  contextInstructions: string;
  qualitativeData: string;
  quantitativeData: string;
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

export default function ConfrontationModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: ConfrontationModuleProps) {
  const [confrontResult, setConfrontResult] = useState("");
  const [confrontImportedData, setConfrontImportedData] = useState("");
  const [contextInstructions, setContextInstructions] = useState("");
  const [qualitativeData, setQualitativeData] = useState("");
  const [quantitativeData, setQuantitativeData] = useState("");
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const { t } = useI18n();
  const confrontMutation = useConfrontResults();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();

  const combinedContext = [extraContext, contextInstructions].filter(Boolean).join("\n");

  const stateRef = useRef({ confrontResult, confrontImportedData, contextInstructions, qualitativeData, quantitativeData });
  useEffect(() => {
    stateRef.current = { confrontResult, confrontImportedData, contextInstructions, qualitativeData, quantitativeData };
  }, [confrontResult, confrontImportedData, contextInstructions, qualitativeData, quantitativeData]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: ConfrontationSavedState = {
      confrontResult: s.confrontResult,
      confrontImportedData: s.confrontImportedData,
      contextInstructions: s.contextInstructions,
      qualitativeData: s.qualitativeData,
      quantitativeData: s.quantitativeData,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { confrontationState: state },
      projectId,
    });
  }, [section, saveConfigMutation, projectId]);

  useEffect(() => {
    if (!section || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.confrontationState) {
      const s = cfg.confrontationState as ConfrontationSavedState;
      if (s.confrontResult) setConfrontResult(s.confrontResult);
      if (s.confrontImportedData) setConfrontImportedData(s.confrontImportedData);
      if (s.contextInstructions) setContextInstructions(s.contextInstructions);
      if (s.qualitativeData) setQualitativeData(s.qualitativeData);
      if (s.quantitativeData) setQuantitativeData(s.quantitativeData);
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
  }, [confrontResult, confrontImportedData, contextInstructions, qualitativeData, quantitativeData, stateLoaded, doSave]);

  const handleConfront = () => {
    const allResults = [qualitativeData, quantitativeData, confrontImportedData].filter(Boolean).join("\n\n---\n\n");
    if (!allResults) {
      toast({ title: t("modules.dataAnalysis.resultsRequired"), description: t("modules.dataAnalysis.generateAnalysisFirst"), variant: "destructive" });
      return;
    }
    confrontMutation.mutate(
      { projectId, results: allResults, extraContext: combinedContext || undefined },
      {
        onSuccess: (data) => {
          setConfrontResult(data.content);
          toast({ title: t("modules.dataAnalysis.confrontComplete") });
        },
        onError: (error: any) => {
          toast({ title: t("modules.common.error"), description: error.message || t("modules.dataAnalysis.confrontError"), variant: "destructive" });
        },
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
          toast({ title: t("modules.dataAnalysis.importError"), description: `${file.name}: ${err.message || t("modules.common.cannotReadFile")}`, variant: "destructive" });
        }
      }
      if (importedParts.length > 0) {
        setConfrontImportedData(prev => {
          const combined = [prev, ...importedParts].filter(Boolean).join("\n\n");
          return combined;
        });
        toast({ title: t("modules.dataAnalysis.importSuccess"), description: `${importedParts.length} ${t("modules.dataAnalysis.filesImportedForConfront")}` });
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (!confrontResult) {
      toast({ title: t("modules.common.nothingToExport"), variant: "destructive" });
      return;
    }
    exportToWord(
      t("modules.dataAnalysis.confrontResultLabel"),
      [{ label: t("modules.dataAnalysis.confrontExport"), content: confrontResult }],
      `confrontation_${projectId}`
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

  const isValidated = section?.status === "validated";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <FlaskConical className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">{t("modules.dataAnalysis.confrontTab")}</CardTitle>
          {isValidated && <Badge variant="default" className="bg-green-600 text-white"><Check className="w-3 h-3 mr-1" />{t("modules.common.validated")}</Badge>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={doSave} data-testid="button-save-confrontation">
            <Save className="w-4 h-4 mr-1" />{t("modules.common.save")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export-confrontation">
            <FileDown className="w-4 h-4 mr-1" />{t("modules.common.export")}
          </Button>
          {section && !isValidated && (
            <Button size="sm" onClick={handleSectionValidate} data-testid="button-validate-confrontation">
              <Check className="w-4 h-4 mr-1" />{t("modules.common.validate")}
            </Button>
          )}
          {isValidated && (
            <Button variant="outline" size="sm" onClick={handleSectionUnvalidate} data-testid="button-unvalidate-confrontation">
              <X className="w-4 h-4 mr-1" />{t("modules.common.removeValidation")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="confrontation-context-instructions" className="text-base font-semibold">{t("modules.common.contextLabel")}</Label>
          <Textarea
            id="confrontation-context-instructions"
            value={contextInstructions}
            onChange={e => setContextInstructions(e.target.value)}
            placeholder={t("modules.common.contextPlaceholder")}
            className="min-h-[80px] text-sm"
            data-testid="textarea-confrontation-context-instructions"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {t("modules.dataAnalysis.confrontDesc")}
        </p>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t("modules.dataAnalysis.qualitativeTab")}</Label>
          <Textarea
            value={qualitativeData}
            onChange={e => setQualitativeData(e.target.value)}
            placeholder={t("modules.dataAnalysis.confrontImportPlaceholder")}
            className="min-h-[120px] text-sm"
            data-testid="textarea-confrontation-qualitative-data"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t("modules.dataAnalysis.quantitativeDataLabel")}</Label>
          <Textarea
            value={quantitativeData}
            onChange={e => setQuantitativeData(e.target.value)}
            placeholder={t("modules.dataAnalysis.confrontImportPlaceholder")}
            className="min-h-[120px] text-sm"
            data-testid="textarea-confrontation-quantitative-data"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">{t("modules.dataAnalysis.importAdditionalData")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("modules.dataAnalysis.importAdditionalDataDesc")}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConfrontFileImport}
              data-testid="button-import-confrontation-file"
            >
              <Upload className="w-4 h-4 mr-1" />{t("modules.dataAnalysis.importFiles")}
            </Button>
            {confrontImportedData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfrontImportedData("");
                  toast({ title: t("modules.dataAnalysis.importedDataCleared") });
                }}
                data-testid="button-clear-confrontation-import"
              >
                <Trash2 className="w-4 h-4 mr-1" />{t("modules.dataAnalysis.clearImport")}
              </Button>
            )}
          </div>
          {confrontImportedData && (
            <>
              <Textarea
                value={confrontImportedData}
                onChange={e => setConfrontImportedData(e.target.value)}
                placeholder={t("modules.dataAnalysis.confrontImportPlaceholder")}
                className="min-h-[120px] text-sm"
                data-testid="textarea-confrontation-imported-data"
              />
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {t("modules.dataAnalysis.importedDataLabel")}: {confrontImportedData.length} {t("modules.dataAnalysis.characters")}
              </Badge>
            </>
          )}
        </div>

        <Button
          onClick={handleConfront}
          disabled={confrontMutation.isPending || (!qualitativeData && !quantitativeData && !confrontImportedData)}
          data-testid="button-run-confrontation"
        >
          {confrontMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-2" />}
          {t("modules.dataAnalysis.confrontWithLiterature")}
        </Button>

        {confrontResult && (
          <ResultDisplay
            label={t("modules.dataAnalysis.confrontResultLabel")}
            value={confrontResult}
            onChange={setConfrontResult}
            testId="confrontation-result"
          />
        )}
      </CardContent>
    </Card>
  );
}
