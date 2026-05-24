import { useState, useMemo, useCallback } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useLocation } from "wouter";
import {
  BookOpen, Search, Loader2, ExternalLink, ChevronLeft, ChevronRight,
  ChevronDown, FileText, GitCompare, Map as MapIcon, History, Copy,
  Trash2, CheckSquare, Eye, X, ArrowUpDown, Filter, SlidersHorizontal,
  Coins, ArrowLeft, FileDown,
} from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";
import { exportToWord } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useSearchArticles, useAnalyzeArticles, useGenerateBibliography, useGenerateEquations,
  useCredits, useSaveBibliography,
  type LiteratureArticle, type LiteratureConfig, DEFAULT_CONFIG,
} from "@/hooks/use-literature";
import ReactMarkdown from "react-markdown";

const PLATFORMS = [
  { key: "google_scholar", label: "Google Scholar" },
  { key: "pubmed", label: "PubMed" },
  { key: "hal", label: "HAL" },
  { key: "cairn", label: "Cairn" },
  { key: "sciencedirect", label: "ScienceDirect" },
];

const SOURCE_TYPES = [
  { key: "scientific_articles", label: "Articles scientifiques" },
  { key: "books", label: "Ouvrages" },
  { key: "institutional_reports", label: "Rapports institutionnels" },
  { key: "recommendations", label: "Recommandations" },
  { key: "referentials", label: "Référentiels" },
];

const BATCH_SIZES = [10, 20, 30, 50];

const PLATFORM_LABELS: Record<string, string> = {
  openalex: "OpenAlex",
  pubmed: "PubMed",
  hal: "HAL",
  crossref: "CrossRef",
  google_scholar: "Google Scholar",
  cairn: "Cairn",
  sciencedirect: "ScienceDirect",
};

type ActiveAction = null | "search" | "summary_selected" | "summary_all" | "confrontation" | "mapping" | "bibliography" | "equations" | `resume_${number}`;

const articleKey = (a: LiteratureArticle) => `${a.lastName}|${a.firstName}|${a.title}|${a.year}`;

export default function Revue() {
  useSEO("revue");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [config, setConfig] = useState<LiteratureConfig>(DEFAULT_CONFIG);
  const [articles, setArticles] = useState<LiteratureArticle[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [bibliographyNorm, setBibliographyNorm] = useState("apa7");

  // Dialogs
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [bibliographyResult, setBibliographyResult] = useState("");
  const [showBibDialog, setShowBibDialog] = useState(false);
  const [equationsResult, setEquationsResult] = useState("");
  const [showEquationsDialog, setShowEquationsDialog] = useState(false);

  const searchMutation = useSearchArticles();
  const analyzeMutation = useAnalyzeArticles();
  const bibMutation = useGenerateBibliography();
  const equationsMutation = useGenerateEquations();
  const saveBib = useSaveBibliography();
  const { data: creditsData } = useCredits();

  const isAnyActionRunning = activeAction !== null;

  // Filtered + sorted + paginated articles
  const filteredArticles = useMemo(() => {
    let r = [...articles];
    if (filterType !== "all") r = r.filter(a => a.type === filterType);
    if (filterYear) r = r.filter(a => a.year === filterYear);
    if (sortBy === "date_asc") r.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
    else if (sortBy === "date_desc") r.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    else if (sortBy === "type") r.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
    return r;
  }, [articles, filterType, filterYear, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / batchSize));
  const paginatedArticles = filteredArticles.slice(currentPage * batchSize, (currentPage + 1) * batchSize);
  const selectedArticles = useMemo(() => articles.filter(a => selectedKeys.has(articleKey(a))), [articles, selectedKeys]);
  const availableTypes = useMemo(() => [...new Set(articles.map(a => a.type).filter(Boolean))].sort(), [articles]);
  const availableYears = useMemo(() => [...new Set(articles.map(a => a.year).filter(Boolean))].sort((a, b) => (b || "").localeCompare(a || "")), [articles]);
  const allFilteredSelected = filteredArticles.length > 0 && filteredArticles.every(a => selectedKeys.has(articleKey(a)));

  const toggleSelect = (a: LiteratureArticle) => {
    const key = articleKey(a);
    setSelectedKeys(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const selectAll = () => {
    if (allFilteredSelected) setSelectedKeys(prev => { const n = new Set(prev); filteredArticles.forEach(a => n.delete(articleKey(a))); return n; });
    else setSelectedKeys(prev => { const n = new Set(prev); filteredArticles.forEach(a => n.add(articleKey(a))); return n; });
  };

  const handleSearch = () => {
    if (!config.query && !config.domain) {
      toast({ title: "Saisissez un sujet ou une requête", variant: "destructive" });
      return;
    }
    setActiveAction("search");
    searchMutation.mutate(config, {
      onSuccess: (data) => {
        const newArticles = data.articles || [];
        setArticles(newArticles);
        setSelectedKeys(new Set());
        setCurrentPage(0);
        setFilterType("all");
        setFilterYear("");
        setSortBy("default");
        toast({ title: "Recherche terminée", description: `${newArticles.length} articles trouvés` });
        setActiveAction(null);
      },
      onError: (err: any) => {
        const msg = err.message || "";
        if (msg.includes("402") || msg.includes("Crédits")) toast({ title: "Crédits insuffisants", description: "Achetez des crédits pour continuer.", variant: "destructive" });
        else toast({ title: "Erreur de recherche", description: msg, variant: "destructive" });
        setActiveAction(null);
      },
    });
  };

  const handleAnalyze = (type: string, articleSubset?: LiteratureArticle[], actionId?: ActiveAction) => {
    const toAnalyze = articleSubset || selectedArticles;
    if (!toAnalyze.length) { toast({ title: "Sélectionnez au moins un article", variant: "destructive" }); return; }
    const titles: Record<string, string> = { single: "Résumé", multiple: "Synthèse sélection", confrontation: "Confrontation", mapping: "Cartographie thématique" };
    const action = actionId || (type === "confrontation" ? "confrontation" : type === "mapping" ? "mapping" : "summary_selected");
    setActiveAction(action);
    setAnalysisTitle(titles[type] || "Analyse");
    analyzeMutation.mutate(
      { articles: toAnalyze.map(a => ({ title: a.title, authors: `${a.lastName}, ${a.firstName}`, year: a.year, source: a.publisher })), analysisType: type, query: config.query },
      {
        onSuccess: (data) => { setAnalysisResult(data.content); setShowAnalysisDialog(true); setActiveAction(null); },
        onError: (err: any) => {
          if ((err.message || "").includes("402")) toast({ title: "Crédits insuffisants", variant: "destructive" });
          else toast({ title: "Erreur d'analyse", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleSummaryAll = () => {
    if (!filteredArticles.length) return;
    setActiveAction("summary_all");
    setAnalysisTitle("Synthèse complète");
    analyzeMutation.mutate(
      { articles: filteredArticles.map(a => ({ title: a.title, authors: `${a.lastName}, ${a.firstName}`, year: a.year, source: a.publisher })), analysisType: "multiple", query: config.query },
      {
        onSuccess: (data) => { setAnalysisResult(data.content); setShowAnalysisDialog(true); setActiveAction(null); },
        onError: (err: any) => {
          if ((err.message || "").includes("402")) toast({ title: "Crédits insuffisants", variant: "destructive" });
          else toast({ title: "Erreur d'analyse", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleBibliography = (articlesForBib?: LiteratureArticle[]) => {
    const toBib = articlesForBib || (selectedArticles.length > 0 ? selectedArticles : filteredArticles);
    if (!toBib.length) { toast({ title: "Aucun article à inclure", variant: "destructive" }); return; }
    setActiveAction("bibliography");
    bibMutation.mutate(
      { articles: toBib.map(a => ({ lastName: a.lastName, firstName: a.firstName, title: a.title, year: a.year, publisher: a.publisher, url: a.url })), norm: bibliographyNorm },
      {
        onSuccess: (data) => { setBibliographyResult(data.content); setShowBibDialog(true); setActiveAction(null); },
        onError: (err: any) => {
          if ((err.message || "").includes("402")) toast({ title: "Crédits insuffisants", variant: "destructive" });
          else toast({ title: "Erreur bibliographie", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const handleEquations = () => {
    setActiveAction("equations");
    equationsMutation.mutate(
      { query: config.query, domain: config.domain, language: config.language },
      {
        onSuccess: (data) => { setEquationsResult(data.content); setShowEquationsDialog(true); setActiveAction(null); },
        onError: (err: any) => {
          if ((err.message || "").includes("402")) toast({ title: "Crédits insuffisants", variant: "destructive" });
          else toast({ title: "Erreur équations", variant: "destructive" });
          setActiveAction(null);
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié dans le presse-papiers" });
  };

  const handleSaveSearch = () => {
    if (!articles.length) return;
    saveBib.mutate(
      { title: config.query || config.domain || "Recherche bibliographique", query: config.query, norm: bibliographyNorm.toUpperCase(), sources: articles },
      { onSuccess: () => toast({ title: "Recherche sauvegardée" }) }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
            <span className="font-bold text-lg tracking-tight">Academik</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/billing")} className="gap-1.5" data-testid="button-credits-nav">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-semibold">{creditsData?.credits ?? 0}</span>
              <span className="text-muted-foreground hidden sm:inline">crédits</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {/* Search config card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Revue de littérature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Query */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sujet / Requête de recherche *</Label>
              <Input
                value={config.query}
                onChange={e => setConfig(c => ({ ...c, query: e.target.value }))}
                placeholder="Ex: intelligence artificielle et apprentissage, santé mentale étudiants..."
                className="text-sm"
                data-testid="input-search-query"
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Platforms */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Plateformes</Label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map(p => (
                  <div key={p.key} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`platform-${p.key}`}
                      checked={config.platforms.includes(p.key)}
                      onCheckedChange={checked => setConfig(c => ({ ...c, platforms: checked ? [...c.platforms, p.key] : c.platforms.filter(k => k !== p.key) }))}
                      data-testid={`checkbox-platform-${p.key}`}
                    />
                    <Label htmlFor={`platform-${p.key}`} className="text-sm cursor-pointer">{p.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <Select value={String(config.articleCount)} onValueChange={v => setConfig(c => ({ ...c, articleCount: Number(v) }))}>
                  <SelectTrigger data-testid="select-article-count"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Depuis</Label>
                <Input type="number" value={config.periodStart} onChange={e => setConfig(c => ({ ...c, periodStart: e.target.value }))} placeholder="2015" className="text-sm" data-testid="input-period-start" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Jusqu'à</Label>
                <Input type="number" value={config.periodEnd} onChange={e => setConfig(c => ({ ...c, periodEnd: e.target.value }))} placeholder="2025" className="text-sm" data-testid="input-period-end" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Langue</Label>
                <Select value={config.language} onValueChange={v => setConfig(c => ({ ...c, language: v }))}>
                  <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="both">Les deux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Level + Source types */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Niveau</Label>
                <Select value={config.level} onValueChange={v => setConfig(c => ({ ...c, level: v }))}>
                  <SelectTrigger data-testid="select-level"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Académique (peer-reviewed)</SelectItem>
                    <SelectItem value="mixed">Mixte</SelectItem>
                    <SelectItem value="professional">Professionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Types de sources</Label>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_TYPES.map(st => (
                    <div key={st.key} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`source-${st.key}`}
                        checked={config.sourceTypes.includes(st.key)}
                        onCheckedChange={checked => setConfig(c => ({ ...c, sourceTypes: checked ? [...c.sourceTypes, st.key] : c.sourceTypes.filter(k => k !== st.key) }))}
                        data-testid={`checkbox-source-${st.key}`}
                      />
                      <Label htmlFor={`source-${st.key}`} className="text-xs cursor-pointer">{st.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Access type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Accès aux articles</Label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "Tous" },
                  { value: "open_access", label: "🔓 Open Access (gratuit)" },
                  { value: "paid", label: "🔒 Payants uniquement" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`button-access-${opt.value}`}
                    onClick={() => setConfig(c => ({ ...c, accessType: opt.value as any }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      config.accessType === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {config.accessType === "all" && (
                <div className="flex items-center gap-3 pt-1">
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">
                    Proportion open access : <span className="font-semibold text-foreground">{config.openAccessProportion}%</span>
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={10}
                    value={config.openAccessProportion}
                    onChange={e => setConfig(c => ({ ...c, openAccessProportion: Number(e.target.value) }))}
                    data-testid="range-open-access-proportion"
                    className="flex-1 h-1.5 accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Payant : {100 - config.openAccessProportion}%</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <Button onClick={handleSearch} disabled={isAnyActionRunning} data-testid="button-search">
                {activeAction === "search" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recherche...</> : <><Search className="w-4 h-4 mr-2" /> Lancer la recherche</>}
              </Button>
              <Button variant="outline" onClick={handleEquations} disabled={isAnyActionRunning} data-testid="button-equations">
                {activeAction === "equations" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</> : <><FileText className="w-4 h-4 mr-2" /> Équations de recherche</>}
              </Button>
              {articles.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleSaveSearch} disabled={saveBib.isPending} data-testid="button-save-search">
                  {saveBib.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {articles.length > 0 && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              {/* Results header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm" data-testid="text-results-count">
                    {filteredArticles.length} résultat{filteredArticles.length > 1 ? "s" : ""}{filterType !== "all" || filterYear ? " (filtrés)" : ""}
                  </h3>
                  <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {allFilteredSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </Button>
                  {selectedKeys.size > 0 && <Badge variant="secondary">{selectedArticles.length} sélectionné{selectedArticles.length > 1 ? "s" : ""}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} data-testid="button-filters">
                    <SlidersHorizontal className="w-4 h-4 mr-1" /> Filtres
                  </Button>
                  <Select value={String(batchSize)} onValueChange={v => { setBatchSize(Number(v)); setCurrentPage(0); }}>
                    <SelectTrigger className="w-[70px]" data-testid="select-batch-size"><SelectValue /></SelectTrigger>
                    <SelectContent>{BATCH_SIZES.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30 border">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground"><Filter className="w-3 h-3 inline mr-1" />Type</Label>
                    <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {availableTypes.map(t => <SelectItem key={t!} value={t!}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground"><Filter className="w-3 h-3 inline mr-1" />Année</Label>
                    <Select value={filterYear || "all"} onValueChange={v => { setFilterYear(v === "all" ? "" : v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {availableYears.map(y => <SelectItem key={y!} value={y!}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground"><ArrowUpDown className="w-3 h-3 inline mr-1" />Tri</Label>
                    <Select value={sortBy} onValueChange={v => { setSortBy(v); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Par défaut</SelectItem>
                        <SelectItem value="date_desc">Plus récent</SelectItem>
                        <SelectItem value="date_asc">Plus ancien</SelectItem>
                        <SelectItem value="type">Par type</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(filterType !== "all" || filterYear || sortBy !== "default") && (
                    <Button variant="ghost" size="sm" className="self-end" onClick={() => { setFilterType("all"); setFilterYear(""); setSortBy("default"); setCurrentPage(0); }}>
                      <X className="w-4 h-4 mr-1" /> Réinitialiser
                    </Button>
                  )}
                </div>
              )}

              {/* Actions panel */}
              <div className="rounded-lg border">
                <button type="button" className="flex items-center justify-between w-full p-3 text-left hover:bg-muted/30 rounded-lg transition-colors" onClick={() => setShowActions(!showActions)} data-testid="button-toggle-actions">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="w-4 h-4" /> Actions d'analyse
                    {selectedArticles.length > 0 && <Badge variant="secondary" className="ml-1">{selectedArticles.length}</Badge>}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showActions ? "rotate-180" : ""}`} />
                </button>
                {showActions && (
                  <div className="flex flex-wrap gap-2 p-3 pt-0">
                    {selectedArticles.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleAnalyze(selectedArticles.length === 1 ? "single" : "multiple", undefined, "summary_selected")} disabled={isAnyActionRunning} data-testid="button-summary-selected">
                        {activeAction === "summary_selected" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                        Résumé ({selectedArticles.length})
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSummaryAll} disabled={isAnyActionRunning} data-testid="button-summary-all">
                      {activeAction === "summary_all" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Eye className="w-4 h-4 mr-1" />}
                      Synthèse tout ({filteredArticles.length})
                    </Button>
                    {selectedArticles.length >= 2 && (
                      <Button variant="outline" size="sm" onClick={() => handleAnalyze("confrontation")} disabled={isAnyActionRunning} data-testid="button-confrontation">
                        {activeAction === "confrontation" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <GitCompare className="w-4 h-4 mr-1" />}
                        Confronter
                      </Button>
                    )}
                    {selectedArticles.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handleAnalyze("mapping")} disabled={isAnyActionRunning} data-testid="button-mapping">
                        {activeAction === "mapping" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <MapIcon className="w-4 h-4 mr-1" />}
                        Cartographie
                      </Button>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Select value={bibliographyNorm} onValueChange={setBibliographyNorm}>
                        <SelectTrigger className="w-[110px]" data-testid="select-bib-norm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apa7">APA 7</SelectItem>
                          <SelectItem value="vancouver">Vancouver</SelectItem>
                          <SelectItem value="mla">MLA</SelectItem>
                          <SelectItem value="chicago">Chicago</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => handleBibliography()} disabled={isAnyActionRunning} data-testid="button-generate-bib">
                        {activeAction === "bibliography" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BookOpen className="w-4 h-4 mr-1" />}
                        Bibliographie {selectedArticles.length > 0 ? `(${selectedArticles.length})` : "(tout)"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Article list */}
              <div className="space-y-2">
                {paginatedArticles.map((article, idx) => {
                  const key = articleKey(article);
                  const realIdx = currentPage * batchSize + idx;
                  const isSelected = selectedKeys.has(key);
                  const resumeAction: ActiveAction = `resume_${realIdx}`;
                  return (
                    <Card key={key} className={`transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`} data-testid={`article-${realIdx}`}>
                      <CardContent className="py-2.5 px-3 flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(article)} data-testid={`checkbox-article-${realIdx}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug" data-testid={`text-article-title-${realIdx}`}>{article.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">{article.lastName}{article.firstName ? `, ${article.firstName}` : ""}</span>
                            {article.year && <> · {article.year}</>}
                            {article.publisher && <> · {article.publisher}</>}
                              {article.platform && <> · <span className="text-primary/70">{PLATFORM_LABELS[article.platform] || article.platform}</span></>}
                            {(article as any).isOpenAccess && <Badge variant="outline" className="ml-1 text-[10px] py-0 text-green-600 border-green-300">🔓 Open Access</Badge>}
                            {article.type && <Badge variant="secondary" className="ml-1 text-[10px] py-0">{article.type}</Badge>}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {article.url && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer" data-testid={`link-article-${realIdx}`}><ExternalLink className="w-3.5 h-3.5" /></a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAnalyze("single", [article], resumeAction)} disabled={isAnyActionRunning} data-testid={`button-resume-${realIdx}`}>
                            {activeAction === resumeAction ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
                            Résumé
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} data-testid="button-prev-page">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">{currentPage + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} data-testid="button-next-page">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{analysisTitle}</DialogTitle>
          </DialogHeader>
          <div className="prose-academic mt-3 px-1">
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t">
            <Button
              size="sm"
              onClick={() => exportToWord(
                analysisTitle,
                [{ label: analysisTitle, content: analysisResult }],
                `academik-${analysisTitle.toLowerCase().replace(/\s+/g, "-")}`
              )}
              data-testid="button-export-word-analysis"
            >
              <FileDown className="w-4 h-4 mr-2" /> Exporter en Word
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysisResult)} data-testid="button-copy-analysis">
              <Copy className="w-4 h-4 mr-2" /> Copier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bibliography Dialog */}
      <Dialog open={showBibDialog} onOpenChange={setShowBibDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Bibliographie — {bibliographyNorm.toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="mt-3 rounded-lg border bg-muted/30 p-4">
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground" data-testid="textarea-bibliography">{bibliographyResult}</pre>
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button
              size="sm"
              onClick={() => exportToWord(
                `Bibliographie ${bibliographyNorm.toUpperCase()}`,
                [{ label: `Références bibliographiques (${bibliographyNorm.toUpperCase()})`, content: bibliographyResult }],
                `academik-bibliographie-${bibliographyNorm}`
              )}
              data-testid="button-export-word-bib"
            >
              <FileDown className="w-4 h-4 mr-2" /> Exporter en Word
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(bibliographyResult)} data-testid="button-copy-bib">
              <Copy className="w-4 h-4 mr-2" /> Copier
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Equations Dialog */}
      <Dialog open={showEquationsDialog} onOpenChange={setShowEquationsDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Équations de recherche</DialogTitle>
          </DialogHeader>
          <div className="prose-academic mt-3 px-1">
            <ReactMarkdown>{equationsResult}</ReactMarkdown>
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t">
            <Button
              size="sm"
              onClick={() => exportToWord(
                "Équations de recherche",
                [{ label: "Équations booléennes", content: equationsResult }],
                `academik-equations-recherche`
              )}
              data-testid="button-export-word-equations"
            >
              <FileDown className="w-4 h-4 mr-2" /> Exporter en Word
            </Button>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(equationsResult)} data-testid="button-copy-equations">
              <Copy className="w-4 h-4 mr-2" /> Copier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
