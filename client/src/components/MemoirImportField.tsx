import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { Upload, Trash2, FileText, ChevronDown, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface MemoirImportFieldProps {
  value: string;
  onChange: (value: string) => void;
  hasPreviousSections?: boolean;
  sectionKey?: string;
}

export default function MemoirImportField({ value, onChange, hasPreviousSections = true, sectionKey }: MemoirImportFieldProps) {
  const { toast } = useToast();
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(!!value || !hasPreviousSections);
  const [uploading, setUploading] = useState(false);

  const isMandatory = !hasPreviousSections && !value;
  const isImported = !!value.trim();

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.bib,.md,.rtf,.docx,.pdf,.doc";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const ext = file.name.toLowerCase().split(".").pop();
      const binaryFormats = ["docx", "pdf", "doc"];

      try {
        let text = "";
        if (binaryFormats.includes(ext || "")) {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/parse-file", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: t("memoirImport.serverError") }));
            throw new Error(err.message || t("memoirImport.fileProcessingError"));
          }
          const data = await res.json();
          text = data.text;
          setUploading(false);
        } else {
          text = await file.text();
        }

        const labeled = `--- ${file.name} ---\n${text}`;
        onChange(value ? `${value}\n\n${labeled}` : labeled);
        setExpanded(true);
        toast({ 
          title: t("memoirImport.importSuccessTitle"), 
          description: t("memoirImport.importSuccessDesc").replace("{fileName}", file.name)
        });
      } catch (err: any) {
        setUploading(false);
        toast({ 
          title: t("memoirImport.importErrorTitle"), 
          description: err.message || t("memoirImport.importErrorDesc"), 
          variant: "destructive" 
        });
      }
    };
    input.click();
  };

  const contextHintMap: Record<string, string> = {
    subject: "memoirImport.contextHintSubject",
    problematic: "memoirImport.contextHintProblematic",
    hypotheses: "memoirImport.contextHintHypotheses",
    plan: "memoirImport.contextHintPlan",
    conceptual_framework: "memoirImport.contextHintConceptualFramework",
    theoretical_framework: "memoirImport.contextHintTheoreticalFramework",
    literature_review: "memoirImport.contextHintLiteratureReview",
    methodology: "memoirImport.contextHintMethodology",
  };
  const contextHint = sectionKey && contextHintMap[sectionKey] ? t(contextHintMap[sectionKey]) : undefined;

  const borderClass = isMandatory
    ? "border-destructive bg-destructive/5"
    : isImported
      ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/10"
      : "border-dashed";

  return (
    <div className={`space-y-2 rounded-md border p-4 ${borderClass}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-2 hover-elevate rounded-md px-1 py-0.5"
          onClick={() => setExpanded(!expanded)}
          data-testid="button-toggle-memoir-section"
        >
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {isMandatory ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : isImported ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <FileText className="w-4 h-4 text-primary" />
          )}
          <span className={`text-sm font-semibold ${isMandatory ? "text-destructive" : ""}`}>
            {isMandatory
              ? t("memoirImport.importRequired")
              : isImported
                ? t("memoirImport.memoirImported")
                : t("memoirImport.importOptional")}
          </span>
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button variant={isMandatory ? "default" : "outline"} size="sm" onClick={handleImport} disabled={uploading} data-testid="button-import-memoir">
            {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            {uploading ? t("memoirImport.processing") : isImported ? t("memoirImport.replace") : t("memoirImport.importButton")}
          </Button>
          {isImported && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                toast({ title: t("memoirImport.importRemoved") });
              }}
              data-testid="button-clear-memoir"
            >
              <Trash2 className="w-4 h-4 mr-1" />{t("memoirImport.clear")}
            </Button>
          )}
        </div>
      </div>

      {isMandatory && (
        <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/5 rounded-md p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t("memoirImport.mandatoryWarning")}</span>
        </div>
      )}

      {!isMandatory && hasPreviousSections && !isImported && !expanded && (
        <p className="text-xs text-muted-foreground">
          {t("memoirImport.optionalInfo")}
        </p>
      )}

      {isImported && !expanded && (
        <p className="text-xs text-green-700 dark:text-green-400">
          {t("memoirImport.importedInfo")}
        </p>
      )}

      {expanded && (
        <>
          <p className="text-xs text-muted-foreground">
            {contextHint || t("memoirImport.defaultContextHint")}
            {" "}{t("memoirImport.conflictNote")}
          </p>
          <p className="text-xs text-muted-foreground italic">
            {t("memoirImport.acceptedFormats")}
          </p>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            className="min-h-[120px] text-xs font-mono"
            placeholder={t("memoirImport.textareaPlaceholder")}
            data-testid="textarea-imported-memoir"
          />
        </>
      )}
    </div>
  );
}
