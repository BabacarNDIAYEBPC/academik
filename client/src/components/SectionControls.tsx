import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ChevronDown, ChevronUp, Settings2, SlidersHorizontal,
  Download, FileText, FileDown,
} from "lucide-react";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import { exportToWord, exportToPdf } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export interface SectionVariables {
  subject?: string;
  problematic?: string;
  hypotheses?: string;
  domain?: string;
  projectType?: string;
  degreeLevel?: string;
  orientation?: string;
  [key: string]: string | undefined;
}

export interface SectionFilterOption {
  key: string;
  label: string;
  checked: boolean;
}

export interface LiteratureConfig {
  platforms: string[];
  articleCount: number;
  periodStart: string;
  periodEnd: string;
  language: string;
  level: string;
  sourceTypes: string[];
}

const VARIABLE_LABELS: Record<string, string> = {
  subject: "Sujet",
  problematic: "Problématique",
  hypotheses: "Hypothèses",
  domain: "Domaine",
  projectType: "Type de travail",
  degreeLevel: "Niveau d'étude",
  orientation: "Orientation",
  context: "Contexte (terrain / professionnel)",
};

function getVariableKeysForSection(sectionKey: string): string[] {
  switch (sectionKey) {
    case "subject":
      return ["domain", "projectType", "degreeLevel", "orientation"];
    case "problematic":
      return ["subject", "domain", "projectType", "degreeLevel"];
    case "hypotheses":
      return ["subject", "problematic", "projectType", "degreeLevel"];
    case "situation_appel":
      return ["domain", "projectType", "degreeLevel"];
    case "vae_competencies":
      return ["domain", "projectType", "degreeLevel"];
    case "plan":
      return ["subject", "problematic", "hypotheses", "projectType", "degreeLevel"];
    case "conceptual_framework":
    case "theoretical_framework":
      return ["subject", "problematic", "hypotheses", "domain"];
    case "literature_review":
      return ["subject", "problematic", "hypotheses", "domain"];
    case "methodology":
      return ["problematic", "hypotheses", "projectType", "context"];
    default:
      return ["subject", "domain", "projectType"];
  }
}

export function getFiltersForSection(sectionKey: string): { key: string; label: string }[] {
  switch (sectionKey) {
    case "plan":
      return [
        { key: "academic", label: "Plan très académique" },
        { key: "simplified", label: "Plan simplifié" },
        { key: "fieldFocus", label: "Accent terrain" },
        { key: "theoryFocus", label: "Accent théorique" },
      ];
    case "conceptual_framework":
      return [
        { key: "classic", label: "Concepts classiques" },
        { key: "recent", label: "Concepts récents" },
        { key: "critical", label: "Approche critique" },
        { key: "descriptive", label: "Approche descriptive" },
      ];
    case "theoretical_framework":
      return [
        { key: "classic", label: "Concepts classiques" },
        { key: "recent", label: "Concepts récents" },
        { key: "critical", label: "Approche critique" },
        { key: "descriptive", label: "Approche descriptive" },
      ];
    case "methodology":
      return [
        { key: "simple", label: "Méthode simple" },
        { key: "deep", label: "Méthode approfondie" },
        { key: "noHeavyField", label: "Faisable sans terrain lourd" },
        { key: "timeConstrained", label: "Adaptée aux contraintes de temps" },
      ];
    case "subject":
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
        { key: "moreDetailed", label: "Plus détaillé" },
      ];
    case "problematic":
    case "hypotheses":
    case "situation_appel":
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
        { key: "professional", label: "Orientation professionnelle" },
      ];
    default:
      return [
        { key: "moreTheoretical", label: "Plus théorique" },
        { key: "moreOperational", label: "Plus opérationnel" },
        { key: "moreSynthetic", label: "Plus synthétique" },
      ];
  }
}

const LITERATURE_PLATFORMS = [
  { key: "google_scholar", label: "Google Scholar" },
  { key: "pubmed", label: "PubMed" },
  { key: "hal", label: "HAL" },
  { key: "cairn", label: "Cairn" },
  { key: "sciencedirect", label: "ScienceDirect" },
];

const LITERATURE_SOURCE_TYPES = [
  { key: "scientific_articles", label: "Articles scientifiques" },
  { key: "books", label: "Ouvrages" },
  { key: "institutional_reports", label: "Rapports institutionnels" },
  { key: "recommendations", label: "Recommandations (HAS, OMS...)" },
  { key: "referentials", label: "Référentiels (VAE)" },
];

interface SectionControlsProps {
  sectionKey: string;
  projectId: number;
  projectType: string;
  variables: SectionVariables;
  onVariablesChange: (vars: SectionVariables) => void;
  filters: Record<string, boolean>;
  onFiltersChange: (filters: Record<string, boolean>) => void;
  correctionPrompt: string;
  onCorrectionPromptChange: (v: string) => void;
  literatureConfig?: LiteratureConfig;
  onLiteratureConfigChange?: (config: LiteratureConfig) => void;
  activeVersion?: SectionVersion;
}

export default function SectionControls({
  sectionKey,
  projectId,
  projectType,
  variables,
  onVariablesChange,
  filters,
  onFiltersChange,
  correctionPrompt,
  onCorrectionPromptChange,
  literatureConfig,
  onLiteratureConfigChange,
  activeVersion,
}: SectionControlsProps) {
  const [showVariables, setShowVariables] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const variableKeys = getVariableKeysForSection(sectionKey);
  const filterOptions = getFiltersForSection(sectionKey);
  const isLiteratureReview = sectionKey === "literature_review";

  const handleExportSection = async (format: "word" | "pdf") => {
    if (!activeVersion?.content) {
      toast({ title: "Aucun contenu", description: "Générez du contenu avant d'exporter.", variant: "destructive" });
      return;
    }
    const label = SECTION_LABELS[sectionKey] || sectionKey;
    const filename = `${label.replace(/\s/g, "_").toLowerCase()}`;
    try {
      if (format === "word") {
        await exportToWord(label, [{ label, content: activeVersion.content }], filename);
      } else {
        await exportToPdf(label, [{ label, content: activeVersion.content }], filename);
      }
      toast({ title: "Export r\u00e9ussi", description: `${label} export\u00e9 en ${format === "word" ? "Word" : "PDF"}.` });
    } catch {
      toast({ title: "Erreur d'export", description: "L'export a \u00e9chou\u00e9.", variant: "destructive" });
    }
  };

  const handleBatchExport = async (format: "word" | "pdf") => {
    try {
      const res = await apiRequest("GET", `/api/projects/${projectId}/sections/export`);
      const allContents: { key: string; label: string; content: string }[] = await res.json();
      const sectionsWithContent = allContents.filter(s => s.content);
      if (sectionsWithContent.length === 0) {
        toast({ title: "Aucun contenu", description: "Aucune section n'a de contenu à exporter.", variant: "destructive" });
        return;
      }
      const filename = "export_complet";
      if (format === "word") {
        await exportToWord("Export complet", sectionsWithContent, filename);
      } else {
        await exportToPdf("Export complet", sectionsWithContent, filename);
      }
      toast({ title: "Export réussi", description: `${sectionsWithContent.length} section(s) exportée(s).` });
    } catch {
      toast({ title: "Erreur d'export", description: "L'export a échoué.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVariables(!showVariables)}
          data-testid={`button-toggle-variables-${sectionKey}`}
        >
          <Settings2 className="w-4 h-4 mr-1" />
          Variables
          {showVariables ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          data-testid={`button-toggle-filters-${sectionKey}`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" />
          Options
          {showFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>

        {activeVersion?.content && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid={`button-export-${sectionKey}`}>
                <Download className="w-4 h-4 mr-1" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cette section</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportSection("word")} data-testid={`button-export-word-${sectionKey}`}>
                <FileText className="w-4 h-4 mr-2" /> Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSection("pdf")} data-testid={`button-export-pdf-${sectionKey}`}>
                <FileDown className="w-4 h-4 mr-2" /> PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Toutes les sections</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBatchExport("word")} data-testid="button-export-all-word">
                <FileText className="w-4 h-4 mr-2" /> Tout en Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchExport("pdf")} data-testid="button-export-all-pdf">
                <FileDown className="w-4 h-4 mr-2" /> Tout en PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {showVariables && (
        <Card className="border-dashed" data-testid={`panel-variables-${sectionKey}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Variables utilis\u00e9es pour cette section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-muted-foreground">
              Ces champs sont pr\u00e9-remplis automatiquement. Modifiez-les pour ajuster la g\u00e9n\u00e9ration IA sans affecter la m\u00e9moire globale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variableKeys.map(key => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {VARIABLE_LABELS[key] || key}
                  </Label>
                  {(key === "subject" || key === "problematic" || key === "hypotheses" || key === "context") ? (
                    <Textarea
                      value={variables[key] || ""}
                      onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
                      className="text-sm h-16 resize-none"
                      placeholder={`${VARIABLE_LABELS[key] || key}...`}
                      data-testid={`input-var-${key}-${sectionKey}`}
                    />
                  ) : (
                    <Input
                      value={variables[key] || ""}
                      onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
                      className="text-sm"
                      placeholder={`${VARIABLE_LABELS[key] || key}...`}
                      data-testid={`input-var-${key}-${sectionKey}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showFilters && (
        <Card className="border-dashed" data-testid={`panel-filters-${sectionKey}`}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Options d'affinage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex flex-wrap gap-4">
              {filterOptions.map(opt => (
                <div key={opt.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-${opt.key}-${sectionKey}`}
                    checked={!!filters[opt.key]}
                    onCheckedChange={(checked) => onFiltersChange({ ...filters, [opt.key]: !!checked })}
                    data-testid={`checkbox-filter-${opt.key}-${sectionKey}`}
                  />
                  <Label htmlFor={`filter-${opt.key}-${sectionKey}`} className="text-sm cursor-pointer">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>

            {isLiteratureReview && literatureConfig && onLiteratureConfigChange && (
              <LiteratureReviewForm config={literatureConfig} onChange={onLiteratureConfigChange} />
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          Prompt de correction / d'ajustement
        </Label>
        <Textarea
          value={correctionPrompt}
          onChange={e => onCorrectionPromptChange(e.target.value)}
          placeholder="Indiquez ici ce que vous souhaitez corriger, pr\u00e9ciser ou ajouter. Ex: Reformuler de fa\u00e7on plus op\u00e9rationnelle, simplifier pour un niveau licence..."
          className="resize-none h-20 text-sm"
          data-testid={`textarea-correction-${sectionKey}`}
        />
      </div>
    </div>
  );
}

function LiteratureReviewForm({
  config,
  onChange,
}: {
  config: LiteratureConfig;
  onChange: (c: LiteratureConfig) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">Param\u00e8tres de recherche bibliographique</h4>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Plateformes</Label>
        <div className="flex flex-wrap gap-3">
          {LITERATURE_PLATFORMS.map(p => (
            <div key={p.key} className="flex items-center gap-2">
              <Checkbox
                id={`platform-${p.key}`}
                checked={config.platforms.includes(p.key)}
                onCheckedChange={(checked) => {
                  const platforms = checked
                    ? [...config.platforms, p.key]
                    : config.platforms.filter(k => k !== p.key);
                  onChange({ ...config, platforms });
                }}
                data-testid={`checkbox-platform-${p.key}`}
              />
              <Label htmlFor={`platform-${p.key}`} className="text-sm cursor-pointer">{p.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nombre d'articles</Label>
          <Select
            value={String(config.articleCount)}
            onValueChange={v => onChange({ ...config, articleCount: Number(v) })}
          >
            <SelectTrigger data-testid="select-article-count"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">P\u00e9riode d\u00e9but</Label>
          <Input
            type="number"
            value={config.periodStart}
            onChange={e => onChange({ ...config, periodStart: e.target.value })}
            placeholder="2015"
            className="text-sm"
            data-testid="input-period-start"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">P\u00e9riode fin</Label>
          <Input
            type="number"
            value={config.periodEnd}
            onChange={e => onChange({ ...config, periodEnd: e.target.value })}
            placeholder="2025"
            className="text-sm"
            data-testid="input-period-end"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Langue</Label>
          <Select value={config.language} onValueChange={v => onChange({ ...config, language: v })}>
            <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Fran\u00e7ais</SelectItem>
              <SelectItem value="en">Anglais</SelectItem>
              <SelectItem value="both">Les deux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Niveau des sources</Label>
        <Select value={config.level} onValueChange={v => onChange({ ...config, level: v })}>
          <SelectTrigger data-testid="select-source-level"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Articles tr\u00e8s acad\u00e9miques</SelectItem>
            <SelectItem value="mixed">Articles mixtes</SelectItem>
            <SelectItem value="professional">Sources professionnelles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Types de sources</Label>
        <div className="flex flex-wrap gap-3">
          {LITERATURE_SOURCE_TYPES.map(t => (
            <div key={t.key} className="flex items-center gap-2">
              <Checkbox
                id={`source-${t.key}`}
                checked={config.sourceTypes.includes(t.key)}
                onCheckedChange={(checked) => {
                  const sourceTypes = checked
                    ? [...config.sourceTypes, t.key]
                    : config.sourceTypes.filter(k => k !== t.key);
                  onChange({ ...config, sourceTypes });
                }}
                data-testid={`checkbox-source-${t.key}`}
              />
              <Label htmlFor={`source-${t.key}`} className="text-sm cursor-pointer">{t.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
