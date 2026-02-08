import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSearchArticles,
  useAnalyzeArticles,
  useGenerateBibliography,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSaveSectionConfig,
  useGenerateEquations,
} from "@/hooks/use-sections";
import { SECTION_LABELS } from "@shared/schema";
import type { ProjectSection } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, ExternalLink, BookOpen, ChevronLeft, ChevronRight, ChevronDown,
  FileText, GitCompare, Map as MapIcon, History, Copy, Trash2, RotateCcw,
  CheckSquare, Eye, Save, Check, X, ArrowUpDown, Filter, SlidersHorizontal,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { exportToWord } from "@/lib/export-utils";
import type { LiteratureConfig, SectionVariables } from "@/components/SectionControls";

interface LiteratureArticle {
  lastName: string;
  firstName: string;
  title: string;
  year: string;
  publisher: string;
  platform: string;
  url: string;
  type?: string;
}

const LITERATURE_PLATFORMS = [
  { key: "google_scholar", label: "Google Scholar" },
  { key: "pubmed", label: "PubMed" },
  { key: "hal", label: "HAL" },
  { key: "cairn", label: "Cairn" },
  { key: "sciencedirect", label: "ScienceDirect" },
];

const LITERATURE_SOURCE_TYPES = [
  { key: "scientific_articles", labelKey: "modules.literatureReview.sourceTypeScientific" as const },
  { key: "books", labelKey: "modules.literatureReview.sourceTypeBooks" as const },
  { key: "institutional_reports", labelKey: "modules.literatureReview.sourceTypeReports" as const },
  { key: "recommendations", labelKey: "modules.literatureReview.sourceTypeRecommendations" as const },
  { key: "referentials", labelKey: "modules.literatureReview.sourceTypeReferentials" as const },
];

const BATCH_SIZES = [10, 20, 30, 50];

type ActiveAction =
  | null
  | "search"
  | "summary_selected"
  | "summary_all"
  | "confrontation"
  | "mapping"
  | "bibliography"
  | "equations"
  | `resume_${number}`;

interface LiteratureReviewModuleProps {
  projectId: number;
  projectType: string;
  config: LiteratureConfig;
  onConfigChange: (c: LiteratureConfig) => void;
  variables: SectionVariables;
  extraContext?: string;
  section?: ProjectSection;
}

interface SavedLiteratureState {
  articles: LiteratureArticle[];
  selectedKeys: string[];
  filterType: string;
  filterYear: string;
  sortBy: string;
  batchSize: number;
  currentPage: number;
  bibliographyNorm: string;
  analyses: { title: string; content: string }[];
}

interface SearchHistoryEntry {
  id: string;
  timestamp: string;
  platforms: string[];
  language: string;
  periodStart: string;
  periodEnd: string;
  level: string;
  sourceTypes: string[];
  articleCount: number;
  resultCount: number;
  state: SavedLiteratureState;
}

export default function LiteratureReviewModule({
  projectId,
  projectType,
  config,
  onConfigChange,
  variables,
  extraContext,
  section,
}: LiteratureReviewModuleProps) {
  const [articles, setArticles] = useState<LiteratureArticle[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [bibliographyResult, setBibliographyResult] = useState("");
  const [bibliographyNorm, setBibliographyNorm] = useState<string>("apa7");
  const [showBibDialog, setShowBibDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<{ title: string; content: string }[]>([]);
  const [stateLoaded, setStateLoaded] = useState(false);
  const { toast } = useToast();
  const { t, language } = useI18n();

  const searchMutation = useSearchArticles();
  const analyzeMutation = useAnalyzeArticles();
  const bibMutation = useGenerateBibliography();
  const saveManualMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const saveConfigMutation = useSaveSectionConfig();
  const equationsMutation = useGenerateEquations();
  const [equationsResult, setEquationsResult] = useState("");
  const [showEquationsDialog, setShowEquationsDialog] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const isAnyActionRunning = activeAction !== null;

  const stateRef = useRef({
    articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory,
  });
  useEffect(() => {
    stateRef.current = { articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory };
  }, [articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, searchHistory]);

  const doSave = useCallback(() => {
    if (!section) return;
    const s = stateRef.current;
    const state: SavedLiteratureState = {
      articles: s.articles,
      selectedKeys: Array.from(s.selectedKeys),
      filterType: s.filterType,
      filterYear: s.filterYear,
      sortBy: s.sortBy,
      batchSize: s.batchSize,
      currentPage: s.currentPage,
      bibliographyNorm: s.bibliographyNorm,
      analyses: s.savedAnalyses,
    };
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { literatureState: state, searchHistory: s.searchHistory },
      projectId,
    });
  }, [section, projectId]);

  useEffect(() => {
    if (!section?.config || stateLoaded) return;
    const cfg = section.config as any;
    if (cfg?.literatureState) {
      const s: SavedLiteratureState = cfg.literatureState;
      if (s.articles?.length) setArticles(s.articles);
      if (s.selectedKeys?.length) setSelectedKeys(new Set(s.selectedKeys));
      if (s.filterType) setFilterType(s.filterType);
      if (s.filterYear) setFilterYear(s.filterYear);
      if (s.sortBy) setSortBy(s.sortBy);
      if (s.batchSize) setBatchSize(s.batchSize);
      if (s.currentPage !== undefined) setCurrentPage(s.currentPage);
      if (s.bibliographyNorm) setBibliographyNorm(s.bibliographyNorm);
      if (s.analyses?.length) setSavedAnalyses(s.analyses);
    }
    if (cfg?.searchHistory?.length) setSearchHistory(cfg.searchHistory);
    setStateLoaded(true);
  }, [section?.config, stateLoaded]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDirtyState = useRef(false);
  useEffect(() => {
    if (!stateLoaded || !section) return;
    hasDirtyState.current = true;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      doSave();
      hasDirtyState.current = false;
    }, 3000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [articles, selectedKeys, filterType, filterYear, sortBy, batchSize, currentPage, bibliographyNorm, savedAnalyses, stateLoaded, section]);

  useEffect(() => {
    const sectionId = section?.id;
    return () => {
      if (hasDirtyState.current && sectionId) {
        const s = stateRef.current;
        const state: SavedLiteratureState = {
          articles: s.articles,
          selectedKeys: Array.from(s.selectedKeys),
          filterType: s.filterType,
          filterYear: s.filterYear,
          sortBy: s.sortBy,
          batchSize: s.batchSize,
          currentPage: s.currentPage,
          bibliographyNorm: s.bibliographyNorm,
          analyses: s.savedAnalyses,
        };
        fetch(`/api/sections/${sectionId}/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: { literatureState: state, searchHistory: s.searchHistory } }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [section?.id]);

  const saveToSection = (content: string, title: string) => {
    if (!section) return;
    saveManualMutation.mutate(
      { sectionId: section.id, content, projectId },
      {
        onSuccess: () => toast({ title: t("modules.literatureReview.toastSaved"), description: `${title} ${t("modules.literatureReview.toastSavedInSection")}` }),
        onError: () => toast({ title: t("modules.literatureReview.toastSaveError"), variant: "destructive" }),
      }
    );
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      { onSuccess: () => toast({ title: t("modules.literatureReview.toastSectionValidated") }) }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      { onSuccess: () => toast({ title: t("modules.literatureReview.toastValidationRemoved") }) }
    );
  };

  const articleKey = (a: LiteratureArticle) => `${a.lastName}|${a.firstName}|${a.title}|${a.year}`;

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    articles.forEach(a => { if (a.type) types.add(a.type); });
    return Array.from(types).sort();
  }, [articles]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    articles.forEach(a => { if (a.year) years.add(a.year); });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (filterType !== "all") {
      result = result.filter(a => a.type === filterType);
    }
    if (filterYear) {
      result = result.filter(a => a.year === filterYear);
    }
    if (sortBy === "date_asc") {
      result.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
    } else if (sortBy === "date_desc") {
      result.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    } else if (sortBy === "type") {
      result.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
    }
    return result;
  }, [articles, filterType, filterYear, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / batchSize));
  const paginatedArticles = filteredArticles.slice(currentPage * batchSize, (currentPage + 1) * batchSize);

  const selectedArticles = useMemo(() =>
    articles.filter(a => selectedKeys.has(articleKey(a))),
    [articles, selectedKeys]
  );

  const handleSearch = () => {
    setActiveAction("search");
    searchMutation.mutate(
      { projectId, config, extraContext },
      {
        onSuccess: (data) => {
          const newArticles = data.articles || [];
          setArticles(newArticles);
          setSelectedKeys(new Set());
          setCurrentPage(0);
          setFilterType("all");
          setFilterYear("");
          setSortBy("default");
          toast({ title: t("modules.literatureReview.toastSearchComplete"), description: `${newArticles.length} ${t("modules.literatureReview.toastArticlesFound")}` });
          setActiveAction(null);

          const newState: SavedLiteratureState = {
            articles: newArticles, selectedKeys: [], filterType: "all", filterYear: "", sortBy: "default",
            batchSize, currentPage: 0, bibliographyNorm, analyses: savedAnalyses,
          };
          const historyEntry: SearchHistoryEntry = {
            id: `search_${Date.now()}`,
            timestamp: new Date().toISOString(),
            platforms: [...config.platforms],
            language: config.language,
            periodStart: config.periodStart,
            periodEnd: config.periodEnd,
            level: config.level,
            sourceTypes: [...config.sourceTypes],
            articleCount: config.articleCount,
            resultCount: newArticles.length,
            state: newState,
          };
          const updatedHistory = [historyEntry, ...searchHistory];
          setSearchHistory(updatedHistory);

          if (section) {
            saveConfigMutation.mutate({
              sectionId: section.id,
              config: { literatureState: newState, searchHistory: updatedHistory },
              projectId,
            });
            hasDirtyState.current = false;
          }
        },
        onError: (err: any) => {
          toast({ title: t("modules.literatureReview.toastError"), description: err.message || t("modules.literatureReview.toastSearchFailed"), variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const toggleSelect = (article: LiteratureArticle) => {
    const key = articleKey(article);
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allFilteredSelected = filteredArticles.length > 0 && filteredArticles.every(a => selectedKeys.has(articleKey(a)));

  const selectAll = () => {
    if (allFilteredSelected) {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        filteredArticles.forEach(a => next.delete(articleKey(a)));
        return next;
      });
    } else {
      setSelectedKeys(prev => {
        const next = new Set(prev);
        filteredArticles.forEach(a => next.add(articleKey(a)));
        return next;
      });
    }
  };

  const handleAnalyze = (type: 'single' | 'multiple' | 'confrontation' | 'mapping', articleSubset?: LiteratureArticle[], actionId?: ActiveAction) => {
    const toAnalyze = articleSubset || selectedArticles;
    if (toAnalyze.length === 0) {
      toast({ title: t("modules.literatureReview.toastNoArticle"), description: t("modules.literatureReview.toastSelectArticle"), variant: "destructive" });
      return;
    }
    const titles: Record<string, string> = {
      single: t("modules.literatureReview.titleSingleSummary"),
      multiple: t("modules.literatureReview.titleMultipleSummary"),
      confrontation: t("modules.literatureReview.titleConfrontation"),
      mapping: t("modules.literatureReview.titleMapping"),
    };
    const action = actionId || (type === "confrontation" ? "confrontation" : type === "mapping" ? "mapping" : "summary_selected");
    setActiveAction(action);
    setAnalysisTitle(titles[type] || t("modules.literatureReview.analysis"));
    analyzeMutation.mutate(
      {
        projectId,
        articles: toAnalyze.map(a => ({
          title: a.title,
          authors: `${a.lastName}, ${a.firstName}`,
          year: a.year,
          source: a.publisher,
          platform: a.platform,
          url: a.url,
        })),
        analysisType: type,
        extraContext,
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data.content);
          setShowAnalysisDialog(true);
          setSavedAnalyses(prev => [...prev, { title: titles[type] || t("modules.literatureReview.analysis"), content: data.content }]);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: t("modules.literatureReview.toastError"), description: err.message || t("modules.literatureReview.toastAnalysisFailed"), variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleSummaryAll = () => {
    if (filteredArticles.length === 0) {
      toast({ title: t("modules.literatureReview.toastNoArticle"), description: t("modules.literatureReview.toastNoArticleToSummarize"), variant: "destructive" });
      return;
    }
    setActiveAction("summary_all");
    setAnalysisTitle(t("modules.literatureReview.titleAllSummary"));
    analyzeMutation.mutate(
      {
        projectId,
        articles: filteredArticles.map(a => ({
          title: a.title,
          authors: `${a.lastName}, ${a.firstName}`,
          year: a.year,
          source: a.publisher,
          platform: a.platform,
          url: a.url,
        })),
        analysisType: "multiple",
        extraContext,
      },
      {
        onSuccess: (data) => {
          setAnalysisResult(data.content);
          setShowAnalysisDialog(true);
          setSavedAnalyses(prev => [...prev, { title: t("modules.literatureReview.titleAllSummary"), content: data.content }]);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: t("modules.literatureReview.toastError"), description: err.message || t("modules.literatureReview.toastAnalysisFailed"), variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleBibliography = (articlesForBib?: LiteratureArticle[]) => {
    const toBib = articlesForBib || selectedArticles;
    if (toBib.length === 0) {
      toast({ title: t("modules.literatureReview.toastNoArticle"), description: t("modules.literatureReview.toastSelectArticle"), variant: "destructive" });
      return;
    }
    setActiveAction("bibliography");
    bibMutation.mutate(
      {
        projectId,
        articles: toBib.map(a => ({
          lastName: a.lastName,
          firstName: a.firstName,
          title: a.title,
          year: a.year,
          publisher: a.publisher,
          source: a.publisher,
          url: a.url,
        })),
        norm: bibliographyNorm as any,
      },
      {
        onSuccess: (data) => {
          setBibliographyResult(data.content);
          setShowBibDialog(true);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: t("modules.literatureReview.toastError"), description: err.message || t("modules.literatureReview.toastGenerationFailed"), variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleExportBib = async () => {
    if (!bibliographyResult) return;
    try {
      const normLabels: Record<string, string> = { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" };
      const title = `${t("modules.literatureReview.bibDash")} ${normLabels[bibliographyNorm] || bibliographyNorm}`;
      await exportToWord(title, [{ label: title, content: bibliographyResult }], "bibliographie");
      toast({ title: t("modules.literatureReview.toastExportSuccess") });
    } catch {
      toast({ title: t("modules.literatureReview.toastExportError"), variant: "destructive" });
    }
  };

  const handleExportAnalysis = async () => {
    if (!analysisResult) return;
    try {
      await exportToWord(analysisTitle, [{ label: analysisTitle, content: analysisResult }], "analyse");
      toast({ title: t("modules.literatureReview.toastExportSuccess") });
    } catch {
      toast({ title: t("modules.literatureReview.toastExportError"), variant: "destructive" });
    }
  };

  const handleGenerateEquations = () => {
    setActiveAction("equations");
    equationsMutation.mutate(
      { projectId, language: config.language as 'fr' | 'en' | 'both', extraContext },
      {
        onSuccess: (data) => {
          setEquationsResult(data.content);
          setShowEquationsDialog(true);
          setActiveAction(null);
        },
        onError: (err: any) => {
          toast({ title: t("modules.literatureReview.toastError"), description: err.message || t("modules.literatureReview.toastEquationsFailed"), variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleExportEquations = async () => {
    if (!equationsResult) return;
    try {
      await exportToWord(t("modules.literatureReview.equationsTitle"), [{ label: t("modules.literatureReview.equationsTitle"), content: equationsResult }], "equations_recherche");
      toast({ title: t("modules.literatureReview.toastExportSuccess") });
    } catch {
      toast({ title: t("modules.literatureReview.toastExportError"), variant: "destructive" });
    }
  };

  const handleRestoreSearch = (entry: SearchHistoryEntry) => {
    const s = entry.state;
    setArticles(s.articles);
    setSelectedKeys(new Set(s.selectedKeys));
    setFilterType(s.filterType);
    setFilterYear(s.filterYear);
    setSortBy(s.sortBy);
    setBatchSize(s.batchSize);
    setCurrentPage(s.currentPage);
    setBibliographyNorm(s.bibliographyNorm);
    setSavedAnalyses(s.analyses || []);
    onConfigChange({
      ...config,
      platforms: entry.platforms,
      language: entry.language,
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      level: entry.level,
      sourceTypes: entry.sourceTypes,
      articleCount: entry.articleCount,
    });
    setShowHistoryDialog(false);
    toast({ title: t("modules.literatureReview.toastSearchRestored"), description: `${s.articles.length} ${t("modules.literatureReview.toastArticlesRestored")}` });
  };

  const handleDuplicateSearch = (entry: SearchHistoryEntry) => {
    onConfigChange({
      ...config,
      platforms: entry.platforms,
      language: entry.language,
      periodStart: entry.periodStart,
      periodEnd: entry.periodEnd,
      level: entry.level,
      sourceTypes: entry.sourceTypes,
      articleCount: entry.articleCount,
    });
    setShowHistoryDialog(false);
    toast({ title: t("modules.literatureReview.toastParamsCopied"), description: t("modules.literatureReview.toastParamsApplied") });
  };

  const handleDeleteSearch = (entryId: string) => {
    const updatedHistory = searchHistory.filter(h => h.id !== entryId);
    setSearchHistory(updatedHistory);
    if (section) {
      saveConfigMutation.mutate({
        sectionId: section.id,
        config: { searchHistory: updatedHistory },
        projectId,
      });
    }
    toast({ title: t("modules.literatureReview.toastSearchDeleted") });
  };

  const getArticleIdx = (article: LiteratureArticle) => articles.indexOf(article);

  return (
    <div className="space-y-3 md:space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {SECTION_LABELS["literature_review"]}
            </CardTitle>
            {section && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={section.status === "validated" ? "default" : "secondary"} data-testid="badge-lit-status">
                  {section.status === "validated" ? t("modules.literatureReview.validated") : section.status === "draft" ? t("modules.literatureReview.draft") : section.status}
                </Badge>
                {section.status === "validated" ? (
                  <Button variant="outline" size="sm" onClick={handleUnvalidate} data-testid="button-lit-unvalidate">
                    <X className="w-4 h-4 mr-1" /> {t("modules.literatureReview.removeValidation")}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleValidate} data-testid="button-lit-validate">
                    <Check className="w-4 h-4 mr-1" /> {t("modules.literatureReview.validate")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("modules.literatureReview.searchPlatforms")}</Label>
              <div className="flex flex-wrap gap-3">
                {LITERATURE_PLATFORMS.map(p => (
                  <div key={p.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`lit-platform-${p.key}`}
                      checked={config.platforms.includes(p.key)}
                      onCheckedChange={(checked) => {
                        const platforms = checked
                          ? [...config.platforms, p.key]
                          : config.platforms.filter(k => k !== p.key);
                        onConfigChange({ ...config, platforms });
                      }}
                      data-testid={`checkbox-lit-platform-${p.key}`}
                    />
                    <Label htmlFor={`lit-platform-${p.key}`} className="text-sm cursor-pointer">{p.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("modules.literatureReview.resultCount")}</Label>
                <Select
                  value={String(config.articleCount)}
                  onValueChange={v => onConfigChange({ ...config, articleCount: Number(v) })}
                >
                  <SelectTrigger data-testid="select-lit-article-count"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("modules.literatureReview.periodStart")}</Label>
                <Input
                  type="number"
                  value={config.periodStart}
                  onChange={e => onConfigChange({ ...config, periodStart: e.target.value })}
                  placeholder="2015"
                  className="text-sm"
                  data-testid="input-lit-period-start"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("modules.literatureReview.periodEnd")}</Label>
                <Input
                  type="number"
                  value={config.periodEnd}
                  onChange={e => onConfigChange({ ...config, periodEnd: e.target.value })}
                  placeholder="2025"
                  className="text-sm"
                  data-testid="input-lit-period-end"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("modules.literatureReview.languageLabel")}</Label>
                <Select value={config.language} onValueChange={v => onConfigChange({ ...config, language: v })}>
                  <SelectTrigger data-testid="select-lit-language"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">{t("modules.literatureReview.langFrench")}</SelectItem>
                    <SelectItem value="en">{t("modules.literatureReview.langEnglish")}</SelectItem>
                    <SelectItem value="both">{t("modules.literatureReview.langBoth")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("modules.literatureReview.sourceLevel")}</Label>
              <Select value={config.level} onValueChange={v => onConfigChange({ ...config, level: v })}>
                <SelectTrigger data-testid="select-lit-level"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">{t("modules.literatureReview.levelAcademic")}</SelectItem>
                  <SelectItem value="mixed">{t("modules.literatureReview.levelMixed")}</SelectItem>
                  <SelectItem value="professional">{t("modules.literatureReview.levelProfessional")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">{t("modules.literatureReview.sourceTypes")}</Label>
              <div className="flex flex-wrap gap-3">
                {LITERATURE_SOURCE_TYPES.map(st => (
                  <div key={st.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`lit-source-${st.key}`}
                      checked={config.sourceTypes.includes(st.key)}
                      onCheckedChange={(checked) => {
                        const sourceTypes = checked
                          ? [...config.sourceTypes, st.key]
                          : config.sourceTypes.filter(k => k !== st.key);
                        onConfigChange({ ...config, sourceTypes });
                      }}
                      data-testid={`checkbox-lit-source-${st.key}`}
                    />
                    <Label htmlFor={`lit-source-${st.key}`} className="text-sm cursor-pointer">{t(st.labelKey)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <Button
                onClick={handleSearch}
                disabled={isAnyActionRunning}
                data-testid="button-search-articles"
              >
                {activeAction === "search" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("modules.literatureReview.searchInProgress")}</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> {t("modules.literatureReview.startSearch")}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateEquations}
                disabled={isAnyActionRunning}
                data-testid="button-generate-equations"
              >
                {activeAction === "equations" ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("modules.literatureReview.generationInProgress")}</>
                ) : (
                  <><FileText className="w-4 h-4 mr-2" /> {t("modules.literatureReview.generateEquations")}</>
                )}
              </Button>
              {searchHistory.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryDialog(true)}
                  data-testid="button-search-history"
                >
                  <History className="w-4 h-4 mr-2" />
                  {t("modules.literatureReview.searchHistory")}
                  <Badge variant="secondary" className="ml-1">{searchHistory.length}</Badge>
                </Button>
              )}
            </div>
          </div>

          {articles.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm" data-testid="text-results-count">
                    {filteredArticles.length} {t("modules.literatureReview.results")}{filterType !== "all" || filterYear ? ` ${t("modules.literatureReview.filtered")}` : ""}
                  </h3>
                  <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {allFilteredSelected ? t("modules.literatureReview.deselectAll") : t("modules.literatureReview.selectAll")}
                  </Button>
                  {selectedKeys.size > 0 && (
                    <Badge variant="secondary" data-testid="badge-selected-count">{selectedArticles.length} {t("modules.literatureReview.selected")}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    data-testid="button-toggle-filters"
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-1" /> {t("modules.literatureReview.filtersAndSort")}
                  </Button>
                  <Select value={String(batchSize)} onValueChange={v => { setBatchSize(Number(v)); setCurrentPage(0); }}>
                    <SelectTrigger className="w-[80px]" data-testid="select-batch-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCH_SIZES.map(s => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showFilters && (
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="space-y-1 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground">
                      <Filter className="w-3 h-3 inline mr-1" />{t("modules.literatureReview.documentType")}
                    </Label>
                    <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("modules.literatureReview.allTypes")}</SelectItem>
                        {availableTypes.map(tp => (
                          <SelectItem key={tp} value={tp}>{tp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground">
                      <Filter className="w-3 h-3 inline mr-1" />{t("modules.literatureReview.yearLabel")}
                    </Label>
                    <Select value={filterYear || "all"} onValueChange={v => { setFilterYear(v === "all" ? "" : v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-full sm:w-[120px]" data-testid="select-filter-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t("modules.literatureReview.allYears")}</SelectItem>
                        {availableYears.map(y => (
                          <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 w-full sm:w-auto">
                    <Label className="text-xs text-muted-foreground">
                      <ArrowUpDown className="w-3 h-3 inline mr-1" />{t("modules.literatureReview.sortBy")}
                    </Label>
                    <Select value={sortBy} onValueChange={v => { setSortBy(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-sort-by">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">{t("modules.literatureReview.sortDefault")}</SelectItem>
                        <SelectItem value="date_desc">{t("modules.literatureReview.sortDateDesc")}</SelectItem>
                        <SelectItem value="date_asc">{t("modules.literatureReview.sortDateAsc")}</SelectItem>
                        <SelectItem value="type">{t("modules.literatureReview.sortType")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(filterType !== "all" || filterYear || sortBy !== "default") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setFilterType("all"); setFilterYear(""); setSortBy("default"); setCurrentPage(0); }}
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4 mr-1" /> {t("modules.literatureReview.reset")}
                    </Button>
                  )}
                </div>
              )}

              <div className="rounded-lg border">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 text-left hover-elevate rounded-lg"
                  onClick={() => setShowActions(!showActions)}
                  data-testid="button-toggle-actions"
                >
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {t("modules.literatureReview.analysisActions")}
                    {selectedArticles.length > 0 && <Badge variant="secondary" className="ml-1">{selectedArticles.length}</Badge>}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showActions ? "rotate-180" : ""}`} />
                </button>
                {showActions && (
                  <div className="flex items-center gap-2 flex-wrap p-3 pt-0">
                    {selectedArticles.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze(selectedArticles.length === 1 ? "single" : "multiple", undefined, "summary_selected")}
                        disabled={isAnyActionRunning}
                        data-testid="button-summary-selected"
                      >
                        {activeAction === "summary_selected" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                        {t("modules.literatureReview.summary")} ({selectedArticles.length})
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSummaryAll}
                      disabled={isAnyActionRunning}
                      data-testid="button-summary-all"
                    >
                      {activeAction === "summary_all" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                      {t("modules.literatureReview.summaryAll")} ({filteredArticles.length})
                    </Button>
                    {selectedArticles.length >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze("confrontation")}
                        disabled={isAnyActionRunning}
                        data-testid="button-confrontation"
                      >
                        {activeAction === "confrontation" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitCompare className="w-4 h-4 mr-1" />}
                        {t("modules.literatureReview.confront")}
                      </Button>
                    )}
                    {selectedArticles.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAnalyze("mapping")}
                        disabled={isAnyActionRunning}
                        data-testid="button-mapping"
                      >
                        {activeAction === "mapping" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapIcon className="w-4 h-4 mr-1" />}
                        {t("modules.literatureReview.mappingLabel")}
                      </Button>
                    )}
                    <div className="flex items-center gap-1 w-full sm:w-auto sm:ml-auto">
                      <Select value={bibliographyNorm} onValueChange={setBibliographyNorm}>
                        <SelectTrigger className="w-[100px] sm:w-[120px]" data-testid="select-bib-norm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apa7">APA 7</SelectItem>
                          <SelectItem value="vancouver">Vancouver</SelectItem>
                          <SelectItem value="mla">MLA</SelectItem>
                          <SelectItem value="chicago">Chicago</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBibliography(selectedArticles.length > 0 ? undefined : filteredArticles)}
                        disabled={isAnyActionRunning}
                        data-testid="button-generate-bib"
                      >
                        {activeAction === "bibliography" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
                        {t("modules.literatureReview.bibliographyLabel")} {selectedArticles.length > 0 ? `(${selectedArticles.length})` : `(${t("modules.literatureReview.allLabel")})`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {paginatedArticles.map((article) => {
                  const key = articleKey(article);
                  const idx = getArticleIdx(article);
                  const isSelected = selectedKeys.has(key);
                  const resumeAction: ActiveAction = `resume_${idx}`;
                  return (
                    <Card key={key} className={isSelected ? "border-primary" : ""} data-testid={`article-result-${idx}`}>
                      <CardContent className="py-2 md:py-3 px-3 md:px-6">
                        <div className="flex items-start gap-2 md:gap-3">
                          <div className="pt-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(article)}
                              data-testid={`checkbox-article-${idx}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" data-testid={`text-article-title-${idx}`}>
                              {article.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">{article.lastName}{article.firstName ? `, ${article.firstName}` : ""}</span>
                              {article.year && <> ({article.year})</>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {article.publisher && <>{article.publisher}</>}
                              {article.platform && <> — {article.platform}</>}
                              {article.type && (
                                <Badge variant="secondary" className="ml-2 text-[10px] py-0">{article.type}</Badge>
                              )}
                            </p>
                            <div className="flex gap-1 mt-2 md:hidden flex-wrap">
                              {article.url && (
                                <Button variant="ghost" size="icon" asChild>
                                  <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`link-article-mobile-${idx}`}>
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAnalyze("single", [article], resumeAction)}
                                disabled={isAnyActionRunning}
                                data-testid={`button-resume-mobile-${idx}`}
                              >
                                {activeAction === resumeAction ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                                {t("modules.literatureReview.summary")}
                              </Button>
                            </div>
                          </div>
                          <div className="hidden md:flex gap-1 shrink-0">
                            {article.url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`link-article-${idx}`}>
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAnalyze("single", [article], resumeAction)}
                              disabled={isAnyActionRunning}
                              data-testid={`button-resume-${idx}`}
                            >
                              {activeAction === resumeAction ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                              {t("modules.literatureReview.summary")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    data-testid="button-results-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> {t("modules.literatureReview.previous")}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("modules.literatureReview.pageLabel")} {currentPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                    data-testid="button-results-next"
                  >
                    {t("modules.literatureReview.next")} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{analysisTitle}</DialogTitle>
            <DialogDescription>{t("modules.literatureReview.analysisResultDesc")}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-3 md:p-5">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(analysisResult, analysisTitle)} disabled={saveManualMutation.isPending} data-testid="button-save-analysis">
                <Save className="w-4 h-4 mr-1" /> {t("modules.literatureReview.saveToSection")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportAnalysis} data-testid="button-export-analysis-word">
              <FileText className="w-4 h-4 mr-1" /> {t("modules.literatureReview.wordDocx")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBibDialog} onOpenChange={setShowBibDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("modules.literatureReview.bibDash")} {
                { apa7: "APA 7", vancouver: "Vancouver", mla: "MLA", chicago: "Chicago" }[bibliographyNorm] || bibliographyNorm
              }
            </DialogTitle>
            <DialogDescription>{t("modules.literatureReview.bibDesc")}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-3 md:p-5">
            <ReactMarkdown>{bibliographyResult}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(bibliographyResult, t("modules.literatureReview.bibliographyLabel"))} disabled={saveManualMutation.isPending} data-testid="button-save-bib">
                <Save className="w-4 h-4 mr-1" /> {t("modules.literatureReview.saveToSection")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportBib} data-testid="button-export-bib-word">
              <FileText className="w-4 h-4 mr-1" /> {t("modules.literatureReview.wordDocx")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("modules.literatureReview.searchHistory")}</DialogTitle>
            <DialogDescription>{searchHistory.length} {t("modules.literatureReview.searchHistoryCount")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {searchHistory.map((entry) => {
              const date = new Date(entry.timestamp);
              const locale = language === "en" ? "en-US" : "fr-FR";
              const dateStr = date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
              const timeStr = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
              const langLabels: Record<string, string> = { fr: t("modules.literatureReview.langHistoryFr"), en: t("modules.literatureReview.langHistoryEn"), both: t("modules.literatureReview.langHistoryBoth") };
              return (
                <Card key={entry.id} data-testid={`history-entry-${entry.id}`}>
                  <CardContent className="py-2 md:py-3 px-3 md:px-6 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-sm font-medium">{dateStr} {t("modules.literatureReview.at")} {timeStr}</div>
                      <Badge variant="secondary">{entry.resultCount} {t("modules.literatureReview.results")}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{t("modules.literatureReview.platformsInfo")} {entry.platforms.map(p => LITERATURE_PLATFORMS.find(lp => lp.key === p)?.label || p).join(", ") || t("modules.literatureReview.noPlatforms")}</p>
                      <p>{t("modules.literatureReview.langInfo")} {langLabels[entry.language] || entry.language} | {t("modules.literatureReview.levelInfo")} {entry.level} | {t("modules.literatureReview.requestedResults")} {entry.articleCount}</p>
                      {(entry.periodStart || entry.periodEnd) && (
                        <p>{t("modules.literatureReview.periodInfo")} {entry.periodStart || "..."} — {entry.periodEnd || "..."}</p>
                      )}
                      {entry.sourceTypes.length > 0 && (
                        <p>{t("modules.literatureReview.typesInfo")} {entry.sourceTypes.map(st => LITERATURE_SOURCE_TYPES.find(lt => lt.key === st)?.labelKey ? t(LITERATURE_SOURCE_TYPES.find(lt => lt.key === st)!.labelKey) : st).join(", ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreSearch(entry)}
                        data-testid={`button-restore-${entry.id}`}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" /> {t("modules.literatureReview.restore")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicateSearch(entry)}
                        data-testid={`button-duplicate-${entry.id}`}
                      >
                        <Copy className="w-4 h-4 mr-1" /> {t("modules.literatureReview.duplicateParams")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(entry.id)}
                        data-testid={`button-delete-${entry.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> {t("modules.literatureReview.deleteLabel")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {searchHistory.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">{t("modules.literatureReview.noSearchHistory")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEquationsDialog} onOpenChange={setShowEquationsDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("modules.literatureReview.equationsTitle")}</DialogTitle>
            <DialogDescription>{t("modules.literatureReview.equationsDesc")}</DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-3 md:p-5 whitespace-pre-wrap">
            {equationsResult}
          </div>
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {section && (
              <Button size="sm" onClick={() => saveToSection(equationsResult, t("modules.literatureReview.equationsTitle"))} disabled={saveManualMutation.isPending} data-testid="button-save-equations">
                <Save className="w-4 h-4 mr-1" /> {t("modules.literatureReview.saveToSection")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportEquations} data-testid="button-export-equations-word">
              <FileText className="w-4 h-4 mr-1" /> {t("modules.literatureReview.wordDocx")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
