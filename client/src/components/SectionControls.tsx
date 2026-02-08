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
  Download, FileText, FileDown, AlertTriangle,
  Plus, Trash2, ExternalLink, BookOpen, ChevronLeft, ChevronRight,
} from "lucide-react";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import { exportToWord, exportToPdf } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export interface SectionVariables {
  subject?: string;
  problematic?: string;
  hypotheses?: string;
  domain?: string;
  domainOther?: string;
  projectType?: string;
  projectTypeOther?: string;
  degreeLevel?: string;
  degreeLevelOther?: string;
  filiere?: string;
  orientation?: string;
  orientationOther?: string;
  finality?: string;
  context?: string;
  [key: string]: string | undefined;
}

export interface SectionFilterOption {
  key: string;
  labelKey: string;
  checked: boolean;
}

export interface ArticleReference {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  url?: string;
  notes?: string;
}

export interface LiteratureConfig {
  platforms: string[];
  articleCount: number;
  periodStart: string;
  periodEnd: string;
  language: string;
  level: string;
  sourceTypes: string[];
  articles?: ArticleReference[];
}

const DOMAINS = [
  { value: "soins_infirmiers", labelKey: "domains.soins_infirmiers" },
  { value: "travail_social", labelKey: "domains.travail_social" },
  { value: "management", labelKey: "domains.management" },
  { value: "rh", labelKey: "domains.rh" },
  { value: "economie", labelKey: "domains.economie" },
  { value: "marketing", labelKey: "domains.marketing" },
  { value: "droit", labelKey: "domains.droit" },
  { value: "education", labelKey: "domains.education" },
  { value: "psychologie", labelKey: "domains.psychologie" },
  { value: "informatique", labelKey: "domains.informatique" },
  { value: "data_ia", labelKey: "domains.data_ia" },
  { value: "logistique", labelKey: "domains.logistique" },
  { value: "qualite", labelKey: "domains.qualite" },
  { value: "comptabilite", labelKey: "domains.comptabilite" },
  { value: "banque", labelKey: "domains.banque" },
  { value: "immobilier", labelKey: "domains.immobilier" },
  { value: "sciences_politiques", labelKey: "domains.sciences_politiques" },
  { value: "environnement", labelKey: "domains.environnement" },
  { value: "industrie", labelKey: "domains.industrie" },
  { value: "autre", labelKey: "domains.autre" },
];

const DEGREE_LEVELS = [
  { value: "bts_dut", labelKey: "degreeLevels.bts_dut" },
  { value: "licence", labelKey: "degreeLevels.licence" },
  { value: "bachelor", labelKey: "degreeLevels.bachelor" },
  { value: "master1", labelKey: "degreeLevels.master1" },
  { value: "master2", labelKey: "degreeLevels.master2" },
  { value: "mba", labelKey: "degreeLevels.mba" },
  { value: "diplome_etat", labelKey: "degreeLevels.diplome_etat" },
  { value: "doctorat", labelKey: "degreeLevels.doctorat" },
  { value: "vae", labelKey: "degreeLevels.vae" },
  { value: "autre", labelKey: "degreeLevels.autre" },
];

const PROJECT_TYPES = [
  { value: "memoire", labelKey: "projectTypes.memoire" },
  { value: "tfe", labelKey: "projectTypes.tfe" },
  { value: "vae", labelKey: "projectTypes.vae" },
  { value: "rapport_stage", labelKey: "projectTypes.rapport_stage" },
  { value: "autre", labelKey: "projectTypes.autre" },
];

const ORIENTATIONS = [
  { value: "theorique", labelKey: "approaches.theorique" },
  { value: "appliquee", labelKey: "approaches.appliquee" },
  { value: "analyse_pratiques", labelKey: "approaches.analyse_pratiques" },
  { value: "etude_cas", labelKey: "approaches.etude_cas" },
  { value: "mixte", labelKey: "approaches.mixte" },
  { value: "autre", labelKey: "approaches.autre" },
];

const FINALITIES = [
  { value: "academique", labelKey: "finalities.academique" },
  { value: "professionnelle", labelKey: "finalities.professionnelle" },
  { value: "mixte", labelKey: "finalities.mixte" },
];

const DROPDOWN_CONFIG: Record<string, { options: { value: string; labelKey: string }[]; otherKey: string }> = {
  domain: { options: DOMAINS, otherKey: "domainOther" },
  degreeLevel: { options: DEGREE_LEVELS, otherKey: "degreeLevelOther" },
  projectType: { options: PROJECT_TYPES, otherKey: "projectTypeOther" },
  orientation: { options: ORIENTATIONS, otherKey: "orientationOther" },
};

const VARIABLE_LABEL_KEYS: Record<string, string> = {
  subject: "sectionControls.variableSubject",
  problematic: "sectionControls.variableProblematic",
  hypotheses: "sectionControls.variableHypotheses",
  domain: "sectionControls.variableDomain",
  projectType: "sectionControls.variableProjectType",
  degreeLevel: "sectionControls.variableDegreeLevel",
  filiere: "sectionControls.variableFiliere",
  orientation: "sectionControls.variableOrientation",
  finality: "sectionControls.variableFinality",
  context: "sectionControls.variableContext",
};

const FUNDAMENTAL_KEYS = ["domain", "projectType", "degreeLevel", "orientation", "finality"];

const MANDATORY_VARIABLE_KEYS = ["subject", "problematic", "hypotheses", "domain", "filiere", "projectType"];

function getVariableKeysForSection(sectionKey: string): string[] {
  const base = [...MANDATORY_VARIABLE_KEYS];
  const addIfMissing = (keys: string[]) => {
    keys.forEach(k => { if (!base.includes(k)) base.push(k); });
  };
  switch (sectionKey) {
    case "subject":
      addIfMissing(["degreeLevel", "orientation", "finality"]);
      break;
    case "problematic":
      addIfMissing(["degreeLevel", "orientation"]);
      break;
    case "hypotheses":
      addIfMissing(["degreeLevel", "orientation"]);
      break;
    case "situation_appel":
      addIfMissing(["degreeLevel"]);
      break;
    case "construction_sujet":
      addIfMissing(["degreeLevel"]);
      break;
    case "vae_competencies":
      addIfMissing(["degreeLevel"]);
      break;
    case "plan":
      addIfMissing(["degreeLevel", "orientation", "finality"]);
      break;
    case "conceptual_framework":
    case "theoretical_framework":
      addIfMissing(["orientation"]);
      break;
    case "literature_review":
      addIfMissing(["orientation"]);
      break;
    case "methodology":
      addIfMissing(["orientation", "context"]);
      break;
    default:
      break;
  }
  return base;
}

export function getFiltersForSection(sectionKey: string): { key: string; labelKey: string }[] {
  switch (sectionKey) {
    case "plan":
      return [
        { key: "academic", labelKey: "sectionControls.filterAcademic" },
        { key: "simplified", labelKey: "sectionControls.filterSimplified" },
        { key: "fieldFocus", labelKey: "sectionControls.filterFieldFocus" },
        { key: "theoryFocus", labelKey: "sectionControls.filterTheoryFocus" },
      ];
    case "conceptual_framework":
      return [
        { key: "classic", labelKey: "sectionControls.filterClassic" },
        { key: "recent", labelKey: "sectionControls.filterRecent" },
        { key: "critical", labelKey: "sectionControls.filterCritical" },
        { key: "descriptive", labelKey: "sectionControls.filterDescriptive" },
      ];
    case "theoretical_framework":
      return [
        { key: "classic", labelKey: "sectionControls.filterClassic" },
        { key: "recent", labelKey: "sectionControls.filterRecent" },
        { key: "critical", labelKey: "sectionControls.filterCritical" },
        { key: "descriptive", labelKey: "sectionControls.filterDescriptive" },
      ];
    case "methodology":
      return [
        { key: "simple", labelKey: "sectionControls.filterSimpleMethod" },
        { key: "deep", labelKey: "sectionControls.filterDeepMethod" },
        { key: "noHeavyField", labelKey: "sectionControls.filterNoHeavyField" },
        { key: "timeConstrained", labelKey: "sectionControls.filterTimeConstrained" },
      ];
    case "subject":
      return [
        { key: "moreTheoretical", labelKey: "sectionControls.filterMoreTheoretical" },
        { key: "moreOperational", labelKey: "sectionControls.filterMoreOperational" },
        { key: "moreSynthetic", labelKey: "sectionControls.filterMoreSynthetic" },
        { key: "moreDetailed", labelKey: "sectionControls.filterMoreDetailed" },
      ];
    case "problematic":
    case "hypotheses":
    case "situation_appel":
      return [
        { key: "moreTheoretical", labelKey: "sectionControls.filterMoreTheoretical" },
        { key: "moreOperational", labelKey: "sectionControls.filterMoreOperational" },
        { key: "moreSynthetic", labelKey: "sectionControls.filterMoreSynthetic" },
        { key: "professional", labelKey: "sectionControls.filterProfessional" },
      ];
    default:
      return [
        { key: "moreTheoretical", labelKey: "sectionControls.filterMoreTheoretical" },
        { key: "moreOperational", labelKey: "sectionControls.filterMoreOperational" },
        { key: "moreSynthetic", labelKey: "sectionControls.filterMoreSynthetic" },
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
  { key: "scientific_articles", labelKey: "sectionControls.litScientificArticles" },
  { key: "books", labelKey: "sectionControls.litBooks" },
  { key: "institutional_reports", labelKey: "sectionControls.litInstitutionalReports" },
  { key: "recommendations", labelKey: "sectionControls.litRecommendations" },
  { key: "referentials", labelKey: "sectionControls.litReferentials" },
];

interface SectionControlsProps {
  sectionKey: string;
  projectId: number;
  projectType: string;
  variables: SectionVariables;
  onVariablesChange: (vars: SectionVariables) => void;
  onFundamentalChange?: (key: string, newValue: string) => void;
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
  onFundamentalChange,
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
  const [pendingChange, setPendingChange] = useState<{ key: string; value: string } | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const variableKeys = getVariableKeysForSection(sectionKey);
  const filterOptions = getFiltersForSection(sectionKey);
  const isLiteratureReview = sectionKey === "literature_review";

  const handleVariableChange = (key: string, value: string) => {
    if (FUNDAMENTAL_KEYS.includes(key)) {
      setPendingChange({ key, value });
    } else {
      onVariablesChange({ ...variables, [key]: value });
    }
  };

  const confirmFundamentalChange = (keepContent: boolean = false) => {
    if (!pendingChange) return;
    onVariablesChange({ ...variables, [pendingChange.key]: pendingChange.value });
    if (!keepContent && onFundamentalChange) {
      onFundamentalChange(pendingChange.key, pendingChange.value);
    }
    setPendingChange(null);
    toast({
      title: t("sectionControls.variableModified"),
      description: keepContent
        ? (t("sectionControls.variableModifiedKeepDesc"))
        : t("sectionControls.variableModifiedDesc"),
    });
  };

  const handleExportSection = async (format: "word" | "pdf") => {
    if (!activeVersion?.content) {
      toast({ title: t("sectionControls.noContent"), description: t("sectionControls.generateBeforeExport"), variant: "destructive" });
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
      toast({ title: t("sectionControls.exportSuccess"), description: `${label} ${t("sectionControls.exportedAs")} ${format === "word" ? "Word" : "PDF"}.` });
    } catch {
      toast({ title: t("sectionControls.exportError"), description: t("sectionControls.exportFailed"), variant: "destructive" });
    }
  };

  const handleBatchExport = async (format: "word" | "pdf") => {
    try {
      const res = await apiRequest("GET", `/api/projects/${projectId}/sections/export`);
      const allContents: { key: string; label: string; content: string }[] = await res.json();
      const sectionsWithContent = allContents.filter(s => s.content);
      if (sectionsWithContent.length === 0) {
        toast({ title: t("sectionControls.noContent"), description: t("sectionControls.noSectionContent"), variant: "destructive" });
        return;
      }
      const filename = "export_complet";
      if (format === "word") {
        await exportToWord(t("sectionControls.completeExport"), sectionsWithContent, filename);
      } else {
        await exportToPdf(t("sectionControls.completeExport"), sectionsWithContent, filename);
      }
      toast({ title: t("sectionControls.exportSuccess"), description: `${sectionsWithContent.length} ${t("sectionControls.sectionsExported")}` });
    } catch {
      toast({ title: t("sectionControls.exportError"), description: t("sectionControls.exportFailed"), variant: "destructive" });
    }
  };

  const renderVariableInput = (key: string) => {
    const isTextArea = ["subject", "problematic", "hypotheses", "context"].includes(key);
    const dropdownCfg = DROPDOWN_CONFIG[key];
    const isFinalityDropdown = key === "finality";

    if (dropdownCfg) {
      const currentVal = variables[key] || "";
      const isOther = currentVal === "autre" || (currentVal && !dropdownCfg.options.some(o => o.value === currentVal));
      const selectVal = isOther ? "autre" : currentVal;
      const varLabel = VARIABLE_LABEL_KEYS[key] ? t(VARIABLE_LABEL_KEYS[key]) : key;

      return (
        <div className="space-y-1.5">
          <Select
            value={selectVal}
            onValueChange={(v) => {
              if (v === "autre") {
                handleVariableChange(key, "autre");
              } else {
                handleVariableChange(key, v);
                onVariablesChange({ ...variables, [key]: v, [dropdownCfg.otherKey]: undefined });
              }
            }}
          >
            <SelectTrigger data-testid={`select-var-${key}-${sectionKey}`}>
              <SelectValue placeholder={`${t("sectionControls.choosePrefix")} ${varLabel}...`} />
            </SelectTrigger>
            <SelectContent>
              {dropdownCfg.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectVal === "autre") && (
            <Input
              value={variables[dropdownCfg.otherKey] || ""}
              onChange={e => onVariablesChange({ ...variables, [dropdownCfg.otherKey]: e.target.value })}
              className="text-sm"
              placeholder={`${t("sectionControls.specifyPrefix")} ${varLabel.toLowerCase()}...`}
              data-testid={`input-var-other-${key}-${sectionKey}`}
            />
          )}
        </div>
      );
    }

    if (isFinalityDropdown) {
      return (
        <Select
          value={variables[key] || ""}
          onValueChange={(v) => handleVariableChange(key, v)}
        >
          <SelectTrigger data-testid={`select-var-${key}-${sectionKey}`}>
            <SelectValue placeholder={t("sectionControls.chooseFinality")} />
          </SelectTrigger>
          <SelectContent>
            {FINALITIES.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (isTextArea) {
      return (
        <Textarea
          value={variables[key] || ""}
          onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
          className="text-sm h-16 resize-none"
          placeholder={`${VARIABLE_LABEL_KEYS[key] ? t(VARIABLE_LABEL_KEYS[key]) : key}...`}
          data-testid={`input-var-${key}-${sectionKey}`}
        />
      );
    }

    return (
      <Input
        value={variables[key] || ""}
        onChange={e => onVariablesChange({ ...variables, [key]: e.target.value })}
        className="text-sm"
        placeholder={`${VARIABLE_LABEL_KEYS[key] ? t(VARIABLE_LABEL_KEYS[key]) : key}...`}
        data-testid={`input-var-${key}-${sectionKey}`}
      />
    );
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
                <Download className="w-4 h-4 mr-1" /> {t("common.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("sectionControls.thisSection")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleExportSection("word")} data-testid={`button-export-word-${sectionKey}`}>
                <FileText className="w-4 h-4 mr-2" /> Word (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportSection("pdf")} data-testid={`button-export-pdf-${sectionKey}`}>
                <FileDown className="w-4 h-4 mr-2" /> PDF (.pdf)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("sectionControls.allSections")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBatchExport("word")} data-testid="button-export-all-word">
                <FileText className="w-4 h-4 mr-2" /> {t("sectionControls.allInWord")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchExport("pdf")} data-testid="button-export-all-pdf">
                <FileDown className="w-4 h-4 mr-2" /> {t("sectionControls.allInPdf")}
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
              {t("sectionControls.variablesTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <p className="text-xs text-muted-foreground">
              {t("sectionControls.variablesDesc")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variableKeys.map(key => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {VARIABLE_LABEL_KEYS[key] ? t(VARIABLE_LABEL_KEYS[key]) : key}
                    {FUNDAMENTAL_KEYS.includes(key) && (
                      <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">{t("sectionControls.fundamental")}</Badge>
                    )}
                  </Label>
                  {renderVariableInput(key)}
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
              {t("sectionControls.filterTitle")}
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
                    {t(opt.labelKey)}
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
          {t("sectionControls.correctionLabel")}
        </Label>
        <Textarea
          value={correctionPrompt}
          onChange={e => onCorrectionPromptChange(e.target.value)}
          placeholder={t("sectionControls.correctionPlaceholder")}
          className="resize-none h-20 text-sm"
          data-testid={`textarea-correction-${sectionKey}`}
        />
      </div>

      <Dialog open={!!pendingChange} onOpenChange={(open) => { if (!open) setPendingChange(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {t("sectionControls.fundamentalVarChange")}
            </DialogTitle>
            <DialogDescription>
              {t("sectionControls.modifyKey")} <strong>{pendingChange ? (VARIABLE_LABEL_KEYS[pendingChange.key] ? t(VARIABLE_LABEL_KEYS[pendingChange.key]) : pendingChange.key) : ""}</strong> {t("sectionControls.fundamentalVarImpact")}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("sectionControls.fundamentalVarNote")}
          </p>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPendingChange(null)} data-testid="button-cancel-var-change">
              {t("common.cancel")}
            </Button>
            <Button variant="secondary" onClick={() => confirmFundamentalChange(true)} data-testid="button-keep-var-change">
              {t("sectionControls.keepContent")}
            </Button>
            <Button onClick={() => confirmFundamentalChange(false)} data-testid="button-confirm-var-change">
              {t("sectionControls.confirmChange")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ARTICLES_PER_PAGE = 5;

function LiteratureReviewForm({
  config,
  onChange,
}: {
  config: LiteratureConfig;
  onChange: (c: LiteratureConfig) => void;
}) {
  const { t } = useI18n();
  const [showAddForm, setShowAddForm] = useState(false);
  const [articlePage, setArticlePage] = useState(0);
  const [newArticle, setNewArticle] = useState<Omit<ArticleReference, "id">>({
    title: "", authors: "", year: "", source: "", url: "", notes: "",
  });

  const articles = config.articles || [];
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const paginatedArticles = articles.slice(articlePage * ARTICLES_PER_PAGE, (articlePage + 1) * ARTICLES_PER_PAGE);

  const addArticle = () => {
    if (!newArticle.title.trim()) return;
    const article: ArticleReference = {
      ...newArticle,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    };
    onChange({ ...config, articles: [...articles, article] });
    setNewArticle({ title: "", authors: "", year: "", source: "", url: "", notes: "" });
    setShowAddForm(false);
    setArticlePage(Math.floor(articles.length / ARTICLES_PER_PAGE));
  };

  const removeArticle = (id: string) => {
    const updated = articles.filter(a => a.id !== id);
    onChange({ ...config, articles: updated });
    if (articlePage >= Math.ceil(updated.length / ARTICLES_PER_PAGE)) {
      setArticlePage(Math.max(0, articlePage - 1));
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="text-sm font-medium">{t("sectionControls.litSearchParams")}</h4>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">{t("sectionControls.litPlatforms")}</Label>
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
          <Label className="text-xs text-muted-foreground">{t("sectionControls.litArticleCount")}</Label>
          <Select
            value={String(config.articleCount)}
            onValueChange={v => onChange({ ...config, articleCount: Number(v) })}
          >
            <SelectTrigger data-testid="select-article-count"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("sectionControls.litPeriodStart")}</Label>
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
          <Label className="text-xs text-muted-foreground">{t("sectionControls.litPeriodEnd")}</Label>
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
          <Label className="text-xs text-muted-foreground">{t("sectionControls.litLanguage")}</Label>
          <Select value={config.language} onValueChange={v => onChange({ ...config, language: v })}>
            <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">{t("sectionControls.litFrench")}</SelectItem>
              <SelectItem value="en">{t("sectionControls.litEnglish")}</SelectItem>
              <SelectItem value="both">{t("sectionControls.litBoth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">{t("sectionControls.litSourceLevel")}</Label>
        <Select value={config.level} onValueChange={v => onChange({ ...config, level: v })}>
          <SelectTrigger data-testid="select-source-level"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">{t("sectionControls.litAcademic")}</SelectItem>
            <SelectItem value="mixed">{t("sectionControls.litMixed")}</SelectItem>
            <SelectItem value="professional">{t("sectionControls.litProfessional")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">{t("sectionControls.litSourceTypes")}</Label>
        <div className="flex flex-wrap gap-3">
          {LITERATURE_SOURCE_TYPES.map(st => (
            <div key={st.key} className="flex items-center gap-2">
              <Checkbox
                id={`source-${st.key}`}
                checked={config.sourceTypes.includes(st.key)}
                onCheckedChange={(checked) => {
                  const sourceTypes = checked
                    ? [...config.sourceTypes, st.key]
                    : config.sourceTypes.filter(k => k !== st.key);
                  onChange({ ...config, sourceTypes });
                }}
                data-testid={`checkbox-source-${st.key}`}
              />
              <Label htmlFor={`source-${st.key}`} className="text-sm cursor-pointer">{t(st.labelKey)}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">{t("sectionControls.litArticlesAndRefs")} ({articles.length})</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-add-article"
          >
            <Plus className="w-4 h-4 mr-1" /> {t("sectionControls.litAddArticle")}
          </Button>
        </div>

        {showAddForm && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("sectionControls.litTitle")}</Label>
                  <Input
                    value={newArticle.title}
                    onChange={e => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t("sectionControls.litTitlePlaceholder")}
                    className="text-sm"
                    data-testid="input-article-title"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("sectionControls.litAuthors")}</Label>
                  <Input
                    value={newArticle.authors}
                    onChange={e => setNewArticle(prev => ({ ...prev, authors: e.target.value }))}
                    placeholder={t("sectionControls.litAuthorsPlaceholder")}
                    className="text-sm"
                    data-testid="input-article-authors"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("sectionControls.litYear")}</Label>
                  <Input
                    value={newArticle.year}
                    onChange={e => setNewArticle(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="2023"
                    className="text-sm"
                    data-testid="input-article-year"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{t("sectionControls.litSourceJournal")}</Label>
                  <Input
                    value={newArticle.source}
                    onChange={e => setNewArticle(prev => ({ ...prev, source: e.target.value }))}
                    placeholder={t("sectionControls.litSourcePlaceholder")}
                    className="text-sm"
                    data-testid="input-article-source"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("sectionControls.litUrl")}</Label>
                <Input
                  value={newArticle.url || ""}
                  onChange={e => setNewArticle(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="text-sm"
                  data-testid="input-article-url"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("sectionControls.litNotes")}</Label>
                <Textarea
                  value={newArticle.notes || ""}
                  onChange={e => setNewArticle(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t("sectionControls.litNotesPlaceholder")}
                  className="text-sm min-h-[60px]"
                  data-testid="input-article-notes"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addArticle} disabled={!newArticle.title.trim()} data-testid="button-save-article">
                  <Plus className="w-4 h-4 mr-1" /> {t("sectionControls.litAdd")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} data-testid="button-cancel-article">
                  {t("common.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {articles.length === 0 && !showAddForm && (
          <p className="text-xs text-muted-foreground text-center py-3">
            {t("sectionControls.litNoArticles")}
          </p>
        )}

        {paginatedArticles.length > 0 && (
          <div className="space-y-2">
            {paginatedArticles.map((article) => (
              <Card key={article.id} data-testid={`article-card-${article.id}`}>
                <CardContent className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`article-title-${article.id}`}>{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[article.authors, article.year, article.source].filter(Boolean).join(" — ")}
                    </p>
                    {article.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{article.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {article.url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`button-article-link-${article.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArticle(article.id)}
                      data-testid={`button-remove-article-${article.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={articlePage === 0}
              onClick={() => setArticlePage(p => p - 1)}
              data-testid="button-articles-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {articlePage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={articlePage >= totalPages - 1}
              onClick={() => setArticlePage(p => p + 1)}
              data-testid="button-articles-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
