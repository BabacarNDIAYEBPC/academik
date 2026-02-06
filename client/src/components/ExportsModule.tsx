import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useExportDocument,
  useSections,
  useSaveSectionConfig,
} from "@/hooks/use-sections";
import type { ProjectSection } from "@shared/schema";
import { SECTION_LABELS } from "@shared/schema";
import {
  Loader2, Download, FileText, FileDown,
  BookOpen, Table, Paperclip, Check,
} from "lucide-react";
import { exportToWord, exportToPdf } from "@/lib/export-utils";

interface ExportsModuleProps {
  projectId: number;
  projectType: string;
  variables: Record<string, string | undefined>;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedState {
  format: string;
  exportType: string;
  includeTableOfContents: boolean;
  includeBibliography: boolean;
  includeAnnexes: boolean;
  selectedSections: string[];
}

const FORMAT_OPTIONS = [
  { value: "docx", label: "Word (.docx)", icon: FileText },
  { value: "pdf", label: "PDF (.pdf)", icon: FileDown },
];

const EXPORT_TYPES = [
  { value: "draft", label: "Brouillon", description: "Version de travail avec annotations" },
  { value: "tutor", label: "Version tuteur", description: "Version soumise au tuteur pour relecture" },
  { value: "final", label: "Version finale", description: "Version définitive pour la soutenance" },
];

export default function ExportsModule({
  projectId,
  projectType,
  variables,
  extraContext,
  section,
}: ExportsModuleProps) {
  const [format, setFormat] = useState("docx");
  const [exportType, setExportType] = useState("draft");
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includeBibliography, setIncludeBibliography] = useState(true);
  const [includeAnnexes, setIncludeAnnexes] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [stateLoaded, setStateLoaded] = useState(false);

  const { toast } = useToast();
  const exportMutation = useExportDocument();
  const { data: allSections } = useSections(projectId);
  const saveConfigMutation = useSaveSectionConfig();

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableSections = (allSections || []).filter(
    s => !["assisted_writing", "bibliography", "exports"].includes(s.key)
  );

  useEffect(() => {
    if (section?.config && !stateLoaded) {
      const saved = section.config as unknown as SavedState;
      if (saved.format) setFormat(saved.format);
      if (saved.exportType) setExportType(saved.exportType);
      if (saved.includeTableOfContents !== undefined) setIncludeTableOfContents(saved.includeTableOfContents);
      if (saved.includeBibliography !== undefined) setIncludeBibliography(saved.includeBibliography);
      if (saved.includeAnnexes !== undefined) setIncludeAnnexes(saved.includeAnnexes);
      if (saved.selectedSections) {
        setSelectedSections(saved.selectedSections);
        setSelectAll(false);
      }
      setStateLoaded(true);
    } else if (!section?.config) {
      setStateLoaded(true);
    }
  }, [section?.config, stateLoaded]);

  const saveState = useCallback(() => {
    if (!section?.id || !stateLoaded) return;
    const state: SavedState = { format, exportType, includeTableOfContents, includeBibliography, includeAnnexes, selectedSections };
    saveConfigMutation.mutate({ sectionId: section.id, config: state as any, projectId });
  }, [section?.id, format, exportType, includeTableOfContents, includeBibliography, includeAnnexes, selectedSections, stateLoaded, projectId]);

  useEffect(() => {
    if (!stateLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveState, 3000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [format, exportType, includeTableOfContents, includeBibliography, includeAnnexes, selectedSections, stateLoaded]);

  const handleToggleSection = (key: string) => {
    setSelectAll(false);
    setSelectedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectAll(false);
      setSelectedSections([]);
    } else {
      setSelectAll(true);
      setSelectedSections([]);
    }
  };

  const handleExport = () => {
    const sectionsToExport = selectAll ? undefined : selectedSections;

    exportMutation.mutate(
      {
        projectId,
        format,
        sections: sectionsToExport,
        exportType,
        includeTableOfContents,
        includeBibliography,
        includeAnnexes,
      },
      {
        onSuccess: async (data) => {
          const contentSections = data.content.split("\n---\n\n").filter(Boolean);
          const exportSections: { label: string; content: string }[] = [];

          for (const part of contentSections) {
            const match = part.match(/^# (.+)\n\n([\s\S]*)$/);
            if (match) {
              exportSections.push({ label: match[1], content: match[2].trim() });
            } else {
              exportSections.push({ label: "", content: part.trim() });
            }
          }

          const title = variables.subject || "Document académique";
          const filename = data.fileName.replace(/\.(docx|pdf)$/, "");

          if (format === "pdf") {
            await exportToPdf(title, exportSections, filename);
          } else {
            await exportToWord(title, exportSections, filename);
          }

          toast({ title: "Export réussi", description: `Le document a été exporté en ${format.toUpperCase()}.` });
        },
        onError: (error: any) => {
          toast({ title: "Erreur", description: error.message || "Erreur lors de l'export", variant: "destructive" });
        },
      }
    );
  };

  const validatedCount = availableSections.filter(s => s.status === "validated").length;
  const totalCount = availableSections.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle>Export du document</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {validatedCount}/{totalCount} sections validées
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground">
            Exportez votre travail en Word ou PDF. Vous pouvez exporter toutes les sections ou seulement celles de votre choix.
            Choisissez le type de version (brouillon, tuteur, final) pour adapter le formatage.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Format d'export</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger data-testid="select-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type de version</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger data-testid="select-export-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_TYPES.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {EXPORT_TYPES.find(t => t.value === exportType)?.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="toc"
                  checked={includeTableOfContents}
                  onCheckedChange={(c) => setIncludeTableOfContents(!!c)}
                  data-testid="checkbox-toc"
                />
                <label htmlFor="toc" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Table className="w-4 h-4 text-muted-foreground" />
                  Table des matières
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="bib"
                  checked={includeBibliography}
                  onCheckedChange={(c) => setIncludeBibliography(!!c)}
                  data-testid="checkbox-bibliography"
                />
                <label htmlFor="bib" className="text-sm flex items-center gap-2 cursor-pointer">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  Bibliographie
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="annexes"
                  checked={includeAnnexes}
                  onCheckedChange={(c) => setIncludeAnnexes(!!c)}
                  data-testid="checkbox-annexes"
                />
                <label htmlFor="annexes" className="text-sm flex items-center gap-2 cursor-pointer">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  Annexes (documents importés)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label>Sections à exporter</Label>
              <Button variant="ghost" size="sm" onClick={handleSelectAll} data-testid="button-select-all">
                {selectAll ? "Désélectionner tout" : "Tout sélectionner"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableSections.map(s => {
                const isSelected = selectAll || selectedSections.includes(s.key);
                const label = SECTION_LABELS[s.key] || s.key;
                const hasContent = !!s.activeVersionId;
                const isValidatedSection = s.status === "validated";

                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5 border-primary/30" : "border-border"
                    }`}
                    onClick={() => handleToggleSection(s.key)}
                    data-testid={`checkbox-section-${s.key}`}
                  >
                    <Checkbox checked={isSelected} tabIndex={-1} />
                    <span className="text-sm flex-1">{label}</span>
                    {isValidatedSection && <Check className="w-3 h-3 text-green-500" />}
                    {!hasContent && <Badge variant="outline" className="text-xs">Vide</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending || (!selectAll && selectedSections.length === 0)}
            data-testid="button-export-document"
          >
            {exportMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exporter le document
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
