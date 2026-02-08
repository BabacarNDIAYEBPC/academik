import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useRoute, useLocation } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useSections, useSectionVersions, useValidatedContents, useGenerateCombined, useProjectStatusHistory } from "@/hooks/use-sections";
import { useEntitlements, useCheckout, SECTION_TO_ENTITLEMENT, hasEntitlement, isSectionLocked, getSectionEntitlementKey } from "@/hooks/use-entitlements";
import { useModuleVisibility, useAdminCheck } from "@/hooks/use-admin";
import { useI18n } from "@/lib/i18n";
import SectionEditor from "@/components/SectionEditor";
import LiteratureReviewModule from "@/components/LiteratureReviewModule";
import ConceptualFrameworkModule from "@/components/ConceptualFrameworkModule";
import MethodologyModule from "@/components/MethodologyModule";
import QuestionnaireModule from "@/components/QuestionnaireModule";
import GuideEntretienModule from "@/components/GuideEntretienModule";
import InterviewSimulationModule from "@/components/InterviewSimulationModule";
import DataAnalysisModule from "@/components/DataAnalysisModule";
import FinancialSimulationModule from "@/components/FinancialSimulationModule";
import QuestionnaireAnalysisModule from "@/components/QuestionnaireAnalysisModule";
import AssistedWritingModule from "@/components/AssistedWritingModule";
import BibliographyModule from "@/components/BibliographyModule";
import ExportsModule from "@/components/ExportsModule";
import SoutenancePPTModule from "@/components/SoutenancePPTModule";
import SoutenanceSimulationModule from "@/components/SoutenanceSimulationModule";
import AuditMemoireModule from "@/components/AuditMemoireModule";
import FormulaireModule from "@/components/FormulaireModule";
import TfeFoundationsModule from "@/components/TfeFoundationsModule";
import MemoirImportField from "@/components/MemoirImportField";
import VariablesPanel from "@/components/VariablesPanel";
import { useSaveSectionConfig } from "@/hooks/use-sections";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Sparkles, Trash2, Plus, File, Loader2, Lock, Upload,
  BookOpen, ClipboardList, Award, Briefcase,
  Map, Lightbulb, BookMarked, FlaskConical, Check,
  MessageSquare, BarChart3, PenTool, Library, Download,
  Presentation, Mic, ShieldCheck, GitBranch, Clock,
  CircleDot, AlertTriangle, RefreshCw,
  Building2, UserCheck, Target, Search, Heart, FileCheck,
  User, Route, Compass, LayoutGrid, Layers, CheckSquare,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SECTION_LABELS, SECTION_KEYS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import SectionControls, { type SectionVariables, type LiteratureConfig } from "@/components/SectionControls";


function getSectionsForProjectType(projectType: string): string[] {
  switch (projectType) {
    case "memoire":
    case "these":
      return ["subject", "problematic", "hypotheses", "plan", "conceptual_framework", "literature_review", "methodology", "questionnaire", "formulaire", "guide_entretien", "questionnaire_analysis", "interview_simulation", "data_analysis", "confrontation", "financial_simulation", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "memoire_professionnel":
      return ["mp_structure", "mp_emergence", "subject", "problematic", "hypotheses", "plan", "conceptual_framework", "literature_review", "methodology", "questionnaire", "formulaire", "guide_entretien", "questionnaire_analysis", "interview_simulation", "data_analysis", "confrontation", "financial_simulation", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "etude_de_cas":
      return ["cs_fiche", "cs_contexte", "cs_probleme", "cs_cadre", "cs_donnees", "cs_options", "cs_recommandation", "cs_conclusion", "literature_review", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "tfe":
      return ["situation_appel", "construction_sujet", "plan", "conceptual_framework", "literature_review", "methodology", "questionnaire", "formulaire", "guide_entretien", "questionnaire_analysis", "interview_simulation", "data_analysis", "confrontation", "financial_simulation", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    case "vae":
      return ["vae_presentation", "vae_parcours", "vae_motivation", "vae_cartographie", "vae_bloc_demo", "vae_synthese", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation"];
    case "rapport_stage":
      return ["rs_cover_page", "rs_acknowledgements", "rs_introduction", "rs_company", "rs_internship", "rs_missions", "rs_analysis", "rs_contributions", "rs_conclusion", "assisted_writing", "bibliography", "exports", "soutenance_ppt", "soutenance_simulation", "memoire_audit"];
    default:
      return ["subject", "plan", "methodology", "assisted_writing", "exports", "memoire_audit"];
  }
}

const OPTIONAL_MODULE_KEYS = new Set([
  "questionnaire", "formulaire", "guide_entretien", "questionnaire_analysis",
  "interview_simulation", "data_analysis", "confrontation", "financial_simulation",
  "soutenance_ppt", "soutenance_simulation", "bibliography", "memoire_audit",
]);

type ModuleTab = { key: string; label: string; icon: any; sectionKeys: string[]; isOptional: boolean };

function getModuleTabs(projectType: string, t: (path: string) => string) {
  const sections = getSectionsForProjectType(projectType);
  const tabs: ModuleTab[] = [];

  const push = (key: string, label: string, icon: any, sectionKeys: string[]) => {
    tabs.push({ key, label, icon, sectionKeys, isOptional: OPTIONAL_MODULE_KEYS.has(key) });
  };

  if (projectType === "vae") {
    if (sections.includes("vae_presentation")) {
      push("vae_presentation", t("project.vaePresentation"), User, ["vae_presentation"]);
    }
    if (sections.includes("vae_parcours")) {
      push("vae_parcours", t("project.vaeParcours"), Route, ["vae_parcours"]);
    }
    if (sections.includes("vae_motivation")) {
      push("vae_motivation", t("project.vaeMotivation"), Compass, ["vae_motivation"]);
    }
    if (sections.includes("vae_cartographie")) {
      push("vae_cartographie", t("project.vaeCartographie"), LayoutGrid, ["vae_cartographie"]);
    }
    if (sections.includes("vae_bloc_demo")) {
      push("vae_bloc_demo", t("project.vaeBlocDemo"), Layers, ["vae_bloc_demo"]);
    }
    if (sections.includes("vae_synthese")) {
      push("vae_synthese", t("project.vaeSynthese"), CheckSquare, ["vae_synthese"]);
    }
  } else if (projectType === "rapport_stage") {
    if (sections.includes("rs_cover_page")) {
      push("rs_cover_page", t("project.rsCoverPage"), FileCheck, ["rs_cover_page"]);
    }
    if (sections.includes("rs_acknowledgements")) {
      push("rs_acknowledgements", t("project.rsAcknowledgements"), Heart, ["rs_acknowledgements"]);
    }
    if (sections.includes("rs_introduction")) {
      push("rs_introduction", t("project.rsIntroduction"), BookOpen, ["rs_introduction"]);
    }
    if (sections.includes("rs_company")) {
      push("rs_company", t("project.rsCompany"), Building2, ["rs_company"]);
    }
    if (sections.includes("rs_internship")) {
      push("rs_internship", t("project.rsInternship"), Briefcase, ["rs_internship"]);
    }
    if (sections.includes("rs_missions")) {
      push("rs_missions", t("project.rsMissions"), Target, ["rs_missions"]);
    }
    if (sections.includes("rs_analysis")) {
      push("rs_analysis", t("project.rsAnalysis"), Search, ["rs_analysis"]);
    }
    if (sections.includes("rs_contributions")) {
      push("rs_contributions", t("project.rsContributions"), UserCheck, ["rs_contributions"]);
    }
    if (sections.includes("rs_conclusion")) {
      push("rs_conclusion", t("project.rsConclusion"), Check, ["rs_conclusion"]);
    }
  } else if (projectType === "etude_de_cas") {
    if (sections.includes("cs_fiche")) {
      push("cs_fiche", t("project.csFiche"), FileText, ["cs_fiche"]);
    }
    if (sections.includes("cs_contexte")) {
      push("cs_contexte", t("project.csContexte"), BookOpen, ["cs_contexte"]);
    }
    if (sections.includes("cs_probleme")) {
      push("cs_probleme", t("project.csProbleme"), Target, ["cs_probleme"]);
    }
    if (sections.includes("cs_cadre")) {
      push("cs_cadre", t("project.csCadre"), LayoutGrid, ["cs_cadre"]);
    }
    if (sections.includes("cs_donnees")) {
      push("cs_donnees", t("project.csDonnees"), BarChart3, ["cs_donnees"]);
    }
    if (sections.includes("cs_options")) {
      push("cs_options", t("project.csOptions"), GitBranch, ["cs_options"]);
    }
    if (sections.includes("cs_recommandation")) {
      push("cs_recommandation", t("project.csRecommandation"), CheckSquare, ["cs_recommandation"]);
    }
    if (sections.includes("cs_conclusion")) {
      push("cs_conclusion", t("project.csConclusion"), ShieldCheck, ["cs_conclusion"]);
    }
    if (sections.includes("literature_review")) {
      push("literature", t("project.literatureReview"), BookMarked, ["literature_review"]);
    }
  } else {
    if (projectType === "memoire_professionnel") {
      if (sections.includes("mp_structure")) {
        push("mp_structure", t("project.mpStructure"), Building2, ["mp_structure"]);
      }
      if (sections.includes("mp_emergence")) {
        push("mp_emergence", t("project.mpEmergence"), Lightbulb, ["mp_emergence"]);
      }
    }

    const foundationKeys = sections.filter(s => ["subject", "problematic", "hypotheses", "situation_appel", "construction_sujet", "vae_competencies"].includes(s));
    if (foundationKeys.length > 0) {
      const icon = projectType === "tfe" ? ClipboardList : BookOpen;
      push("foundations", t("project.foundations"), icon, foundationKeys);
    }

    if (sections.includes("plan")) {
      push("plan", t("project.plan"), Map, ["plan"]);
    }

    if (sections.includes("conceptual_framework")) {
      push("framework", t("project.conceptualFramework"), Lightbulb, ["conceptual_framework"]);
    }

    if (sections.includes("literature_review")) {
      push("literature", t("project.literatureReview"), BookMarked, ["literature_review"]);
    }

    if (sections.includes("methodology")) {
      push("methodology", t("project.methodology"), FlaskConical, ["methodology"]);
    }

    if (sections.includes("questionnaire")) {
      push("questionnaire", t("project.questionnaire"), ClipboardList, ["questionnaire"]);
    }

    if (sections.includes("guide_entretien")) {
      push("guide_entretien", t("project.interviewGuide"), FileText, ["guide_entretien"]);
    }

    if (sections.includes("formulaire")) {
      push("formulaire", t("project.formulaire"), ClipboardList, ["formulaire"]);
    }

    if (sections.includes("questionnaire_analysis")) {
      push("questionnaire_analysis", t("project.questionnaireAnalysis"), BarChart3, ["questionnaire_analysis"]);
    }

    if (sections.includes("interview_simulation")) {
      push("interview_simulation", t("project.interviewSimulation"), MessageSquare, ["interview_simulation"]);
    }

    if (sections.includes("data_analysis")) {
      push("data_analysis", t("project.dataVisualization"), BarChart3, ["data_analysis"]);
    }

    if (sections.includes("confrontation")) {
      push("confrontation", t("project.confrontation"), GitBranch, ["confrontation"]);
    }

    if (sections.includes("financial_simulation")) {
      push("financial_simulation", t("project.financialSimulation"), BarChart3, ["financial_simulation"]);
    }

  }

  if (sections.includes("assisted_writing")) {
    push("assisted_writing", t("project.assistedWriting"), PenTool, ["assisted_writing"]);
  }

  if (sections.includes("bibliography")) {
    push("bibliography", t("project.bibliography"), Library, ["bibliography"]);
  }

  if (sections.includes("exports")) {
    push("exports", t("project.exportTab"), Download, ["exports"]);
  }

  if (sections.includes("soutenance_ppt")) {
    push("soutenance_ppt", t("project.soutenancePPT"), Presentation, ["soutenance_ppt"]);
  }

  if (sections.includes("soutenance_simulation")) {
    push("soutenance_simulation", t("project.soutenanceOral"), Mic, ["soutenance_simulation"]);
  }

  if (sections.includes("memoire_audit")) {
    push("memoire_audit", t("project.audit"), ShieldCheck, ["memoire_audit"]);
  }

  push("workflow", t("project.workflow"), GitBranch, []);

  return tabs;
}

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  const { data: project, isLoading } = useProject(projectId);
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!project) return <Layout><div className="text-center py-20 text-muted-foreground">{t("project.notFound")}</div></Layout>;

  return (
    <Layout>
      <SEO titleKey="seo.projectTitle" descriptionKey="seo.projectDescription" canonicalPath={`/projects/${project.id}`} />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Badge variant="outline" className="uppercase tracking-wider text-xs font-semibold" data-testid="badge-project-type">
            {t("projectTypes." + project.type) || project.type}
          </Badge>
          <span className="text-muted-foreground text-sm">{project.language}</span>
          {project.mainDomain && (
            <Badge variant="secondary" className="text-xs" data-testid="badge-domain">
              {t("domains." + project.mainDomain) || project.mainDomain}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid="text-project-name">{project.name}</h1>
      </div>

      <Tabs defaultValue="assistant" className="space-y-6 md:space-y-8">
        <TabsList className="bg-background/50 border border-border p-1 rounded-xl h-auto gap-1 w-full grid grid-cols-3">
          <TabsTrigger value="assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 md:py-2.5 px-2 md:px-5 rounded-lg transition-all gap-1.5 text-xs md:text-sm" data-testid="tab-assistant">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t("project.assistant")}</span>
            <span className="sm:hidden">{t("project.assistantMobile")}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 md:py-2.5 px-2 md:px-5 rounded-lg transition-all text-xs md:text-sm" data-testid="tab-documents">
            {t("project.documentsTab")}
          </TabsTrigger>
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 md:py-2.5 px-2 md:px-5 rounded-lg transition-all text-xs md:text-sm" data-testid="tab-overview">
            {t("project.overviewTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AssistantTab project={project} />
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <DocumentsTab project={project} />
        </TabsContent>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <OverviewTab project={project} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function OverviewTab({ project }: { project: any }) {
  const { t, lang } = useI18n();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("project.academicContext")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label={t("project.domain")} value={t("domains." + project.mainDomain) || project.mainDomainOther || t("project.notDefined")} />
          <InfoRow label={t("project.degree")} value={project.degreeTitle || t("project.notDefined")} />
          <InfoRow label={t("project.level")} value={project.degreeLevel || t("project.notDefined")} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("project.profileOrientation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label={t("project.profile")} value={project.userProfile || t("project.notDefined")} />
          <InfoRow label={t("project.finality")} value={t("finalities." + project.finality) || t("project.notDefined")} />
          <InfoRow label={t("project.approach")} value={t("approaches." + project.approach) || t("project.notDefined")} />
          {project.workDomain && <InfoRow label={t("project.workDomain")} value={project.workDomain} />}
          {project.workFunction && <InfoRow label={t("project.workFunction")} value={project.workFunction} />}
          {project.workStructure && <InfoRow label={t("project.workStructure")} value={project.workStructure} />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("project.info")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label={t("project.createdAt")} value={new Date(project.createdAt).toLocaleDateString(locale)} />
          <InfoRow label={t("project.status")} value={project.status} />
          <InfoRow label={t("project.language")} value={project.language} />
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function AssistantTab({ project }: { project: any }) {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { data: sections, isLoading: sectionsLoading } = useSections(project.id);
  const { data: entData } = useEntitlements();
  const { data: moduleVis } = useModuleVisibility();
  const { data: adminCheck } = useAdminCheck();
  const isAdmin = adminCheck?.isAdmin === true;
  const moduleTabs = useMemo(() => getModuleTabs(project.type, t), [project.type, t]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);

  const isTabLocked = useCallback((tab: { sectionKeys: string[] }) => {
    if (isAdmin) return false;
    if (tab.sectionKeys.length === 0) return false;
    return tab.sectionKeys.every(key => isSectionLocked(entData?.entitlements, key, moduleVis, isAdmin));
  }, [entData?.entitlements, moduleVis, isAdmin]);

  const coreTabs = useMemo(() => moduleTabs.filter(t => !t.isOptional), [moduleTabs]);
  const optionalTabs = useMemo(() => moduleTabs.filter(t => t.isOptional), [moduleTabs]);
  const unlockedOptionalTabs = useMemo(() => optionalTabs.filter(t => !isTabLocked(t)), [optionalTabs, isTabLocked]);
  const lockedOptionalTabs = useMemo(() => optionalTabs.filter(t => isTabLocked(t)), [optionalTabs, isTabLocked]);
  const visibleTabs = useMemo(() => [...coreTabs, ...unlockedOptionalTabs], [coreTabs, unlockedOptionalTabs]);

  const [activeModule, setActiveModule] = useState(visibleTabs[0]?.key || "foundations");

  const getSectionData = (key: string) => {
    if (!sections) return { section: undefined, activeVersion: undefined };
    const section = sections.find((s: ProjectSection) => s.key === key);
    return { section };
  };

  const allSections = getSectionsForProjectType(project.type);
  const validatedCount = sections?.filter((s: ProjectSection) => s.status === "validated" && allSections.includes(s.key)).length || 0;
  const totalSections = allSections.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {validatedCount}/{totalSections} {t("project.sectionsValidatedCount")}
        </Badge>
        {validatedCount > 0 && validatedCount < totalSections && (
          <p className="text-xs text-muted-foreground">{t("project.contextualMemoryHint")}</p>
        )}
        {validatedCount === totalSections && totalSections > 0 && (
          <Badge variant="default" className="bg-green-600 text-white text-xs">
            <Check className="w-3 h-3 mr-1" /> {t("project.allSectionsValidated")}
          </Badge>
        )}
      </div>

      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <div className="md:hidden mb-4 flex gap-2">
          <Select value={activeModule} onValueChange={setActiveModule}>
            <SelectTrigger className="flex-1" data-testid="select-module-mobile">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibleTabs.map(tab => {
                const tabSections = tab.sectionKeys.map(k => sections?.find((s: ProjectSection) => s.key === k)).filter(Boolean) as ProjectSection[];
                const allValidated = tabSections.length > 0 && tabSections.every(s => s.status === "validated" || s.status === "final_version");
                const isWorkflow = tab.key === "workflow";
                return (
                  <SelectItem key={tab.key} value={tab.key} data-testid={`select-module-option-${tab.key}`}>
                    <span className="flex items-center gap-2">
                      {tab.isOptional && <Badge variant="secondary" className="text-[10px] px-1 py-0">{t("project.moduleLabel")}</Badge>}
                      {tab.label}
                      {allValidated && !isWorkflow && <Check className="w-3 h-3 text-green-500 shrink-0" />}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {lockedOptionalTabs.length > 0 && (
            <Button variant="outline" size="icon" onClick={() => setShowModuleDialog(true)} data-testid="button-add-module-mobile">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="hidden md:block">
          <div className="flex items-start gap-2 flex-wrap">
            <TabsList className="bg-background/50 border border-border p-1 rounded-xl h-auto flex-wrap gap-1 w-auto">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const tabSections = tab.sectionKeys.map(k => sections?.find((s: ProjectSection) => s.key === k)).filter(Boolean) as ProjectSection[];
                const allValidated = tabSections.length > 0 && tabSections.every(s => s.status === "validated" || s.status === "final_version");
                const hasContent = tabSections.some(s => s.activeVersionId);
                const isWorkflow = tab.key === "workflow";

                let dotColor = "bg-yellow-400 dark:bg-yellow-500";
                if (isWorkflow) dotColor = "bg-blue-500";
                else if (allValidated) dotColor = "bg-green-500";
                else if (hasContent) dotColor = "bg-yellow-400 dark:bg-yellow-500";

                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="py-2 px-4 rounded-lg transition-all gap-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-module-${tab.key}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                    {allValidated && !isWorkflow ? (
                      <Check className="w-3 h-3 text-green-500 shrink-0" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {lockedOptionalTabs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5 shrink-0"
                onClick={() => setShowModuleDialog(true)}
                data-testid="button-add-module"
              >
                <Plus className="w-4 h-4" />
                {t("project.addModules")}
              </Button>
            )}
          </div>
        </div>

        <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("project.availableModules")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {lockedOptionalTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <div
                    key={tab.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover-elevate cursor-pointer"
                    onClick={() => {
                      setShowModuleDialog(false);
                      navigate("/billing");
                    }}
                    data-testid={`module-option-${tab.key}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      <Badge variant="secondary" className="text-[10px]">{t("project.unlockModule")}</Badge>
                    </div>
                  </div>
                );
              })}
              {lockedOptionalTabs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t("project.allModulesUnlocked")}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {visibleTabs.map(tab => {
          return (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
              {tab.key === "workflow" ? (
                <WorkflowOverview project={project} sections={sections || []} />
              ) : sectionsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : tab.key === "foundations" && project.type === "tfe" ? (
                <TfeFoundationsModule project={project} sections={sections || []} />
              ) : (
                <ModuleSections
                  project={project}
                  sectionKeys={tab.sectionKeys}
                  sections={sections || []}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  modified: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  validated: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sent_tutor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  awaiting_correction: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  corrected: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  final_version: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};


function WorkflowOverview({ project, sections }: { project: any; sections: ProjectSection[] }) {
  const { t, lang } = useI18n();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const sectionOrder = getSectionsForProjectType(project.type);
  const { data: history, isLoading: historyLoading } = useProjectStatusHistory(project.id);

  const sectionsByKey = useMemo(() => {
    const map: globalThis.Map<string, ProjectSection> = new globalThis.Map();
    sections.forEach(s => map.set(s.key, s));
    return map;
  }, [sections]);

  const stats = useMemo(() => {
    const total = sectionOrder.length;
    const created = sections.length;
    const validated = sections.filter(s => s.status === "validated" || s.status === "final_version").length;
    const needsReview = sections.filter(s => {
      const cfg = (s.config as Record<string, any>) || {};
      return cfg.needsReview;
    }).length;
    const withContent = sections.filter(s => s.activeVersionId).length;
    return { total, created, validated, needsReview, withContent };
  }, [sections, sectionOrder]);

  const progressPercent = stats.total > 0 ? Math.round((stats.validated / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
            <GitBranch className="w-5 h-5 text-primary" />
            {t("project.workflowOverviewTitle")}
          </CardTitle>
          <CardDescription>{t("project.workflowOverviewDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30" data-testid="stat-total">
              <p className="text-2xl font-bold">{stats.withContent}/{stats.total}</p>
              <p className="text-xs text-muted-foreground">{t("project.sectionsWritten")}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20" data-testid="stat-validated">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.validated}</p>
              <p className="text-xs text-muted-foreground">{t("project.validatedLabel")}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20" data-testid="stat-review">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.needsReview}</p>
              <p className="text-xs text-muted-foreground">{t("project.toReview")}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20" data-testid="stat-progress">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{progressPercent}%</p>
              <p className="text-xs text-muted-foreground">{t("project.progression")}</p>
            </div>
          </div>

          <div>
            <div className="h-3 bg-muted rounded-full overflow-hidden" data-testid="progress-bar">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Statut par section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sectionOrder.map((key, idx) => {
              const section = sectionsByKey.get(key);
              const status = section?.status || "draft";
              const cfg = (section?.config as Record<string, any>) || {};
              const needsRev = cfg.needsReview;
              const hasContent = !!section?.activeVersionId;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover-elevate"
                  data-testid={`workflow-section-${key}`}
                >
                  <span className="text-xs text-muted-foreground w-6 text-right">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{SECTION_LABELS[key] || key}</span>
                  </div>
                  {needsRev && (
                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400 gap-1 no-default-hover-elevate no-default-active-elevate">
                      <AlertTriangle className="w-3 h-3" />
                      {t("project.toReview")}
                    </Badge>
                  )}
                  <Badge className={`text-xs ${STATUS_COLORS[status] || ""} no-default-hover-elevate no-default-active-elevate`}>
                    {t("sectionStatus." + status) || status}
                  </Badge>
                  {hasContent && status !== "validated" && status !== "final_version" && (
                    <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                  )}
                  {(status === "validated" || status === "final_version") && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            <Clock className="w-4 h-4" />
            {t("project.consolidatedHistory")}
          </CardTitle>
          <CardDescription>{t("project.consolidatedHistoryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">{t("project.noActionsRecorded")}</p>
          ) : (
            <div className="relative pl-6 space-y-0 max-h-[400px] overflow-y-auto" data-testid="consolidated-timeline">
              <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-border" />
              {history.slice(0, 50).map((entry, idx) => (
                <div key={entry.id} className="relative pb-3" data-testid={`timeline-entry-${entry.id}`}>
                  <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full flex items-center justify-center ${idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted border border-border"}`}>
                    <CircleDot className="w-2.5 h-2.5" />
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{SECTION_LABELS[entry.sectionKey] || entry.sectionKey}</Badge>
                      <Badge className={`text-xs ${STATUS_COLORS[entry.status] || ""} no-default-hover-elevate no-default-active-elevate`}>
                        {t("sectionStatus." + entry.status) || entry.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt!).toLocaleDateString(locale, {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const DEFAULT_LIT_CONFIG: LiteratureConfig = {
  platforms: ["google_scholar"],
  articleCount: 10,
  periodStart: "2015",
  periodEnd: new Date().getFullYear().toString(),
  language: "fr",
  level: "academic",
  sourceTypes: ["scientific_articles"],
};

function ModuleSections({
  project,
  sectionKeys,
  sections,
}: {
  project: any;
  sectionKeys: string[];
  sections: ProjectSection[];
}) {
  const [correctionPrompts, setCorrectionPrompts] = useState<Record<string, string>>({});
  const [variableOverrides, setVariableOverrides] = useState<Record<string, SectionVariables>>({});
  const [filterStates, setFilterStates] = useState<Record<string, Record<string, boolean>>>({});
  const [litConfigs, setLitConfigs] = useState<Record<string, LiteratureConfig>>({});
  const { data: validatedContents } = useValidatedContents(project.id);
  const combinedMutation = useGenerateCombined();
  const { toast } = useToast();
  const { t } = useI18n();

  const isFoundationsModule = sectionKeys.some(k => ["subject", "problematic", "hypotheses"].includes(k));
  const hasSubject = sectionKeys.includes("subject");
  const hasProblematic = sectionKeys.includes("problematic");
  const hasHypotheses = sectionKeys.includes("hypotheses");

  const handleCombinedGeneration = (combo: "subject_problematic" | "subject_problematic_hypotheses") => {
    combinedMutation.mutate(
      { projectId: project.id, combo, mode: "initial" },
      {
        onSuccess: (data) => {
          const count = Object.keys(data.results).length;
          toast({ title: t("project.combinedGenerationDone"), description: `${count} ${t("project.sectionsGenerated")}` });
        },
        onError: (error: any) => {
          toast({ title: t("project.errorTitle"), description: error.message || t("project.combinedGenerationError"), variant: "destructive" });
        },
      }
    );
  };

  const defaultVars = useMemo(() => {
    const vars: SectionVariables = {
      domain: project.mainDomain || "",
      domainOther: project.mainDomainOther || "",
      projectType: project.type || "",
      degreeLevel: project.degreeLevel || "",
      filiere: project.degreeTitle || "",
      orientation: project.approach || "",
      finality: project.finality || "",
      context: [project.workDomain, project.workFunction, project.workStructure].filter(Boolean).join(", "),
    };
    if (validatedContents) {
      if (validatedContents.subject && !vars.subject) {
        const subjectContent = validatedContents.subject;
        vars.subject = subjectContent.length > 500 ? subjectContent.substring(0, 500) + "..." : subjectContent;
      }
      if (validatedContents.problematic && !vars.problematic) {
        const probContent = validatedContents.problematic;
        vars.problematic = probContent.length > 500 ? probContent.substring(0, 500) + "..." : probContent;
      }
      if (validatedContents.hypotheses && !vars.hypotheses) {
        const hypContent = validatedContents.hypotheses;
        vars.hypotheses = hypContent.length > 500 ? hypContent.substring(0, 500) + "..." : hypContent;
      }
    }
    return vars;
  }, [project, validatedContents]);

  return (
    <div className="space-y-6">
      {isFoundationsModule && hasSubject && hasProblematic && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">{t("project.combinedGenerationDesc")}</p>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleCombinedGeneration("subject_problematic")}
                disabled={combinedMutation.isPending}
                data-testid="button-combined-subject-problematic"
              >
                {combinedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {t("project.subjectProblematic")}
              </Button>
              {hasHypotheses && (
                <Button
                  variant="outline"
                  onClick={() => handleCombinedGeneration("subject_problematic_hypotheses")}
                  disabled={combinedMutation.isPending}
                  data-testid="button-combined-all"
                >
                  {combinedMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {t("project.subjectProblematicHypotheses")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {sectionKeys.map(key => {
        const section = sections.find(s => s.key === key);
        const mergedVars = { ...defaultVars, ...variableOverrides[key] };

        const allSectionKeys = getSectionsForProjectType(project.type);
        const currentGlobalIndex = allSectionKeys.indexOf(key);
        const earlierMemoirSection = currentGlobalIndex > 0
          ? allSectionKeys.slice(0, currentGlobalIndex).find(prevKey => {
              const prevSec = sections.find(s => s.key === prevKey);
              const cfg = prevSec?.config as Record<string, any> | undefined;
              return cfg?.importedMemoir && cfg.importedMemoir.trim().length > 0;
            })
          : undefined;
        const earlierMemoirContent = earlierMemoirSection
          ? ((sections.find(s => s.key === earlierMemoirSection)?.config as any)?.importedMemoir || "")
          : "";

        return (
          <SingleSectionWrapper
            key={key}
            sectionKey={key}
            projectId={project.id}
            projectType={project.type}
            section={section}
            sections={sections}
            sectionKeys={allSectionKeys}
            variables={mergedVars}
            onVariablesChange={(vars) => setVariableOverrides(prev => ({ ...prev, [key]: vars }))}
            filters={filterStates[key] || {}}
            onFiltersChange={(f) => setFilterStates(prev => ({ ...prev, [key]: f }))}
            correctionPrompt={correctionPrompts[key] || ""}
            onCorrectionPromptChange={(v) => setCorrectionPrompts(prev => ({ ...prev, [key]: v }))}
            literatureConfig={key === "literature_review" ? (litConfigs[key] || DEFAULT_LIT_CONFIG) : undefined}
            onLiteratureConfigChange={key === "literature_review" ? (c) => setLitConfigs(prev => ({ ...prev, [key]: c })) : undefined}
            earlierMemoirSection={earlierMemoirSection}
            earlierMemoirContent={earlierMemoirContent}
          />
        );
      })}
    </div>
  );
}

function SingleSectionWrapper({
  sectionKey,
  projectId,
  projectType,
  section,
  sections,
  sectionKeys,
  variables,
  onVariablesChange,
  filters,
  onFiltersChange,
  correctionPrompt,
  onCorrectionPromptChange,
  literatureConfig,
  onLiteratureConfigChange,
  earlierMemoirSection,
  earlierMemoirContent,
}: {
  sectionKey: string;
  projectId: number;
  projectType: string;
  section?: ProjectSection;
  sections: ProjectSection[];
  sectionKeys: string[];
  variables: SectionVariables;
  onVariablesChange: (vars: SectionVariables) => void;
  filters: Record<string, boolean>;
  onFiltersChange: (f: Record<string, boolean>) => void;
  correctionPrompt: string;
  onCorrectionPromptChange: (v: string) => void;
  literatureConfig?: LiteratureConfig;
  onLiteratureConfigChange?: (c: LiteratureConfig) => void;
  earlierMemoirSection?: string;
  earlierMemoirContent?: string;
}) {
  const { t } = useI18n();
  const [importedMemoir, setImportedMemoir] = useState("");
  const [memoirLoaded, setMemoirLoaded] = useState(false);
  const saveConfigMutation = useSaveSectionConfig();

  useEffect(() => {
    if (!section?.config || memoirLoaded) return;
    const cfg = section.config as any;
    if (cfg?.importedMemoir) setImportedMemoir(cfg.importedMemoir);
    setMemoirLoaded(true);
  }, [section?.config, memoirLoaded]);

  const memoirRef = useRef(importedMemoir);
  useEffect(() => { memoirRef.current = importedMemoir; }, [importedMemoir]);

  const saveMemoir = useCallback(() => {
    if (!section) return;
    saveConfigMutation.mutate({
      sectionId: section.id,
      config: { importedMemoir: memoirRef.current },
      projectId,
    });
  }, [section, projectId]);

  const memoirTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!memoirLoaded) return;
    if (memoirTimer.current) clearTimeout(memoirTimer.current);
    memoirTimer.current = setTimeout(saveMemoir, 3000);
    return () => { if (memoirTimer.current) clearTimeout(memoirTimer.current); };
  }, [importedMemoir, memoirLoaded]);

  const { data: versions } = useSectionVersions(section?.id);
  const activeVersion = useMemo(() => {
    if (!versions || !section?.activeVersionId) return undefined;
    return versions.find(v => v.isActive);
  }, [versions, section?.activeVersionId]);

  const buildExtraContext = () => {
    let ctx = "";
    const resolveVarLabel = (key: string, val: string) => {
      if (key === "domain") return t("domains." + val) || variables.domainOther || val;
      if (key === "projectType") return t("projectTypes." + val) || variables.projectTypeOther || val;
      if (key === "degreeLevel") {
        return t("degreeLevels." + val) || variables.degreeLevelOther || val;
      }
      if (key === "orientation") return t("approaches." + val) || variables.orientationOther || val;
      if (key === "finality") return t("finalities." + val) || val;
      return val;
    };
    const displayKeys = ["domain", "projectType", "degreeLevel", "filiere", "orientation", "finality", "subject", "problematic", "hypotheses", "context"];
    const varEntries = displayKeys
      .filter(k => variables[k])
      .map(k => {
        const label = { domain: "Domaine", projectType: "Type de travail", degreeLevel: "Niveau", filiere: "Filière/Formation", orientation: "Orientation", finality: "Finalité", subject: "Sujet", problematic: "Problématique", hypotheses: "Hypothèses", context: "Contexte" }[k] || k;
        return `${label}: ${resolveVarLabel(k, variables[k]!)}`;
      });
    if (varEntries.length > 0) {
      ctx += "Variables du projet:\n" + varEntries.join("\n") + "\n\n";
    }
    const activeFilters = Object.entries(filters).filter(([, v]) => v).map(([k]) => k);
    if (activeFilters.length > 0) {
      const filterLabels: Record<string, string> = {
        academic: "Plan très académique",
        simplified: "Plan simplifié",
        fieldFocus: "Accent terrain",
        theoryFocus: "Accent théorique",
        classic: "Concepts classiques",
        recent: "Concepts récents",
        critical: "Approche critique",
        descriptive: "Approche descriptive",
        simple: "Méthode simple",
        deep: "Méthode approfondie",
        noHeavyField: "Faisable sans terrain lourd",
        timeConstrained: "Adaptée aux contraintes de temps",
        moreTheoretical: "Plus théorique",
        moreOperational: "Plus opérationnel",
        moreSynthetic: "Plus synthétique",
        moreDetailed: "Plus détaillé",
        professional: "Orientation professionnelle",
      };
      ctx += "Options sélectionnées: " + activeFilters.map(f => filterLabels[f] || f).join(", ") + "\n";
    }
    if (literatureConfig) {
      const platformLabels: Record<string, string> = { google_scholar: "Google Scholar", pubmed: "PubMed", hal: "HAL", cairn: "Cairn", sciencedirect: "ScienceDirect" };
      const sourceLabels: Record<string, string> = { scientific_articles: "Articles scientifiques", books: "Ouvrages", institutional_reports: "Rapports institutionnels", recommendations: "Recommandations (HAS, OMS...)", referentials: "Référentiels (VAE)" };
      const levelLabels: Record<string, string> = { academic: "Très académique", mixed: "Mixte", professional: "Professionnel" };
      ctx += "\nParamètres de recherche bibliographique:\n";
      ctx += `- Plateformes: ${literatureConfig.platforms.map(p => platformLabels[p] || p).join(", ")}\n`;
      ctx += `- Nombre d'articles: ${literatureConfig.articleCount}\n`;
      ctx += `- Période: ${literatureConfig.periodStart} - ${literatureConfig.periodEnd}\n`;
      ctx += `- Langue: ${literatureConfig.language === "fr" ? "Français" : literatureConfig.language === "en" ? "Anglais" : "Les deux"}\n`;
      ctx += `- Niveau: ${levelLabels[literatureConfig.level] || literatureConfig.level}\n`;
      ctx += `- Types de sources: ${literatureConfig.sourceTypes.map(t => sourceLabels[t] || t).join(", ")}\n`;
      if (literatureConfig.articles && literatureConfig.articles.length > 0) {
        ctx += "\nArticles/références fournis par l'utilisateur:\n";
        literatureConfig.articles.forEach((a, i) => {
          ctx += `${i + 1}. ${a.title}`;
          if (a.authors) ctx += ` — ${a.authors}`;
          if (a.year) ctx += ` (${a.year})`;
          if (a.source) ctx += `, ${a.source}`;
          if (a.notes) ctx += ` [Note: ${a.notes}]`;
          ctx += "\n";
        });
      }
    }
    if (correctionPrompt.trim()) {
      ctx += "\n=== INSTRUCTIONS DE L'UTILISATEUR (PRIORITAIRE) ===\n" + correctionPrompt.trim() + "\n";
    }
    if (effectiveMemoir.trim()) {
      ctx += "\n=== CONTENU DU MÉMOIRE IMPORTÉ (DOCUMENT DE RÉFÉRENCE PRIORITAIRE) ===\n";
      ctx += "RÈGLE IMPORTANTE : Ce document importé est le mémoire en cours de l'étudiant. ";
      ctx += "Il fait foi et constitue la source de référence prioritaire. ";
      ctx += "Si des informations du mémoire importé (sujet, problématique, hypothèses, plan, contexte, méthodologie...) ";
      ctx += "divergent des données saisies dans le paramétrage du projet ci-dessus, ";
      ctx += "c'est le contenu du mémoire importé qui prévaut. ";
      ctx += "Lorsque les deux sources concordent, utilise les deux pour enrichir et approfondir le contenu généré. ";
      ctx += "Adapte ton style, ta structure et ton vocabulaire au mémoire importé.\n\n";
      ctx += effectiveMemoir.trim() + "\n";
    }
    return ctx;
  };

  const buildConfig = () => {
    const config: Record<string, any> = { variables, filters };
    if (literatureConfig) config.literatureConfig = literatureConfig;
    return config;
  };

  const { data: entData } = useEntitlements();
  const { data: moduleVis } = useModuleVisibility();
  const { data: adminCheckData } = useAdminCheck();
  const isSuperAdmin = adminCheckData?.isAdmin === true;
  const checkout = useCheckout();
  const locked = isSectionLocked(entData?.entitlements, sectionKey, moduleVis, isSuperAdmin);

  const CORE_KEYS = ["foundation", "plan", "conceptual", "literature", "methodology", "redaction"];

  const SECTION_PACK_INFO: Record<string, { packKey: string; label: string }> = {
    questionnaire: { packKey: "questionnaire", label: "Questionnaire (25 €)" },
    guide_entretien: { packKey: "guide_entretien", label: "Guide d'entretien (25 €)" },
    questionnaire_analysis: { packKey: "questionnaire_analysis", label: "Dépouillement du questionnaire (29 €)" },
    interview_simulation: { packKey: "simulation_entretien", label: "Simulation d'entretien (19 €)" },
    data_analysis: { packKey: "data_visualization", label: "Visualisation des données (25 €)" },
    financial_simulation: { packKey: "financial_simulation", label: "Simulation financière (29 €)" },
    bibliography: { packKey: "pack_revue", label: "Pack Revue avancée (59 €)" },
  };

  const getLockedDescription = (): string => {
    const requirement = getSectionEntitlementKey(sectionKey);
    if (!requirement) return "";
    const keys = Array.isArray(requirement) ? requirement : [requirement];
    if (keys.some(k => CORE_KEYS.includes(k))) {
      return t("project.foundationPackDesc");
    }
    const packInfo = SECTION_PACK_INFO[sectionKey];
    if (packInfo) {
      return `${t("project.sectionPartOf")} ${packInfo.label}. ${t("project.activateToAccess")}`;
    }
    const label = keys.map(k => t("entitlementLabels." + k) || k).join(" / ");
    return `${t("project.sectionPartOfModule")} « ${label} ». ${t("project.activateToAccess")}`;
  };

  const handleUnlock = () => {
    const requirement = getSectionEntitlementKey(sectionKey);
    if (!requirement) return;
    const keys = Array.isArray(requirement) ? requirement : [requirement];
    if (keys.some(k => CORE_KEYS.includes(k))) {
      checkout.mutate({ pack: "core_pack" });
      return;
    }
    const packInfo = SECTION_PACK_INFO[sectionKey];
    if (packInfo) {
      checkout.mutate({ pack: packInfo.packKey });
      return;
    }
    checkout.mutate({ items: [keys[0]] });
  };

  const getUnlockLabel = (): string => {
    const requirement = getSectionEntitlementKey(sectionKey);
    if (!requirement) return t("project.activateModule");
    const keys = Array.isArray(requirement) ? requirement : [requirement];
    if (keys.some(k => CORE_KEYS.includes(k))) {
      return t("project.activateFoundationPack");
    }
    const packInfo = SECTION_PACK_INFO[sectionKey];
    if (packInfo) {
      return `${t("project.activateThe")} ${packInfo.label}`;
    }
    return t("project.activateModule");
  };

  if (locked) {
    return (
      <Card className="relative overflow-visible">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{SECTION_LABELS[sectionKey] || sectionKey}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getLockedDescription()}
            </p>
          </div>
          <Button
            onClick={handleUnlock}
            disabled={checkout.isPending}
            data-testid={`button-unlock-${sectionKey}`}
          >
            {checkout.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
            {getUnlockLabel()}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentIndex = sectionKeys.indexOf(sectionKey);
  const previousSectionsValidated = currentIndex <= 0 || sectionKeys.slice(0, currentIndex).some(key => {
    const s = sections.find(sec => sec.key === key);
    return s && (s.status === "validated" || s.status === "generated");
  });

  const hasEarlierMemoir = !!earlierMemoirSection && !!earlierMemoirContent?.trim();

  const effectiveMemoir = hasEarlierMemoir ? earlierMemoirContent! : importedMemoir;

  const memoirField = hasEarlierMemoir ? (
    <div className="space-y-2 rounded-md border border-dashed p-4 opacity-70">
      <div className="flex items-center gap-2 flex-wrap">
        <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
          {t("project.memoirAlreadyImported")}
        </span>
        <Badge variant="secondary" className="text-xs no-default-hover-elevate no-default-active-elevate">
          {t("project.memoirImportedVia")} {SECTION_LABELS[earlierMemoirSection!] || earlierMemoirSection}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("project.memoirImportedDesc")} « {SECTION_LABELS[earlierMemoirSection!] || earlierMemoirSection} ».
      </p>
    </div>
  ) : (
    <MemoirImportField
      value={importedMemoir}
      onChange={setImportedMemoir}
      hasPreviousSections={previousSectionsValidated}
      sectionKey={sectionKey}
    />
  );

  const variablesField = (
    <VariablesPanel variables={variables} readOnly />
  );

  if (sectionKey === "literature_review" && literatureConfig && onLiteratureConfigChange) {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <LiteratureReviewModule
          projectId={projectId}
          projectType={projectType}
          config={literatureConfig}
          onConfigChange={onLiteratureConfigChange}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "conceptual_framework") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <ConceptualFrameworkModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "methodology") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <MethodologyModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "questionnaire") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <QuestionnaireModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "formulaire") {
    return (
      <div className="space-y-4">
        <FormulaireModule
          projectId={projectId}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "guide_entretien") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <GuideEntretienModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "interview_simulation") {
    const questionnaireSection = sections.find(s => s.key === "questionnaire");
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <InterviewSimulationModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
          dataCollectionSection={questionnaireSection}
        />
      </div>
    );
  }

  if (sectionKey === "data_analysis") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <DataAnalysisModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "financial_simulation") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <FinancialSimulationModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "questionnaire_analysis") {
    const questionnaireSection = sections.find(s => s.key === "questionnaire");
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <QuestionnaireAnalysisModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
          questionnaireSection={questionnaireSection}
        />
      </div>
    );
  }

  if (sectionKey === "assisted_writing") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <AssistedWritingModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "bibliography") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <BibliographyModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "soutenance_ppt") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <SoutenancePPTModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "soutenance_simulation") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <SoutenanceSimulationModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "memoire_audit") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <AuditMemoireModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  if (sectionKey === "exports") {
    return (
      <div className="space-y-4">
        {memoirField}
        {variablesField}
        <ExportsModule
          projectId={projectId}
          projectType={projectType}
          variables={variables}
          extraContext={buildExtraContext()}
          section={section}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memoirField}
      {variablesField}
      <SectionEditor
        projectId={projectId}
        sectionKey={sectionKey}
        section={section}
        activeVersion={activeVersion}
        projectType={projectType}
        getExtraContext={buildExtraContext}
        config={buildConfig()}
        extraInputs={
          <SectionControls
            sectionKey={sectionKey}
            projectId={projectId}
            projectType={projectType}
            variables={variables}
            onVariablesChange={onVariablesChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
            correctionPrompt={correctionPrompt}
            onCorrectionPromptChange={onCorrectionPromptChange}
            literatureConfig={literatureConfig}
            onLiteratureConfigChange={onLiteratureConfigChange}
            activeVersion={activeVersion}
          />
        }
      />
    </div>
  );
}

function DocumentsTab({ project }: { project: any }) {
  const { t } = useI18n();
  const { data: documents, isLoading } = useDocuments(project.id);
  const { mutate: createDoc } = useCreateDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const { toast } = useToast();
  const [newDocName, setNewDocName] = useState("");
  const [newDocContent, setNewDocContent] = useState("");
  const [newDocType, setNewDocType] = useState("guide");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const docTypes = project.type === "vae"
    ? [
        { value: "referentiel", label: t("docTypes.referentiel") },
        { value: "cv", label: t("docTypes.cv") },
        { value: "attestation", label: t("docTypes.attestation") },
        { value: "fiche_poste", label: t("docTypes.fiche_poste") },
        { value: "rapport", label: t("docTypes.rapport") },
        { value: "autre", label: t("docTypes.autre") },
      ]
    : [
        { value: "guide", label: t("docTypes.guide") },
        { value: "consignes", label: t("docTypes.consignes") },
        { value: "situation_appel", label: t("docTypes.situation_appel") },
        { value: "cv", label: t("docTypes.cv") },
        { value: "referentiel", label: t("docTypes.referentiel") },
        { value: "autre", label: t("docTypes.autre") },
      ];

  const handleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.bib,.md,.rtf,.docx,.pdf,.doc";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const ext = file.name.toLowerCase().split(".").pop();
      const binaryFormats = ["docx", "pdf", "doc"];
      try {
        setUploading(true);
        let text = "";
        if (binaryFormats.includes(ext || "")) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/parse-file", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: t("project.serverError") }));
            throw new Error(err.message || t("project.fileProcessingError"));
          }
          const data = await res.json();
          text = data.text;
        } else {
          text = await file.text();
        }
        const docName = file.name.replace(/\.[^.]+$/, "");
        createDoc(
          {
            projectId: project.id,
            name: docName,
            type: "import",
            content: text,
          },
          {
            onSuccess: () => {
              toast({ title: t("project.fileImported"), description: `"${file.name}" ${t("project.fileImportedDesc")}` });
              setUploading(false);
            },
            onError: (error: any) => {
              toast({ title: t("project.errorTitle"), description: error.message || t("project.cannotSaveDoc"), variant: "destructive" });
              setUploading(false);
            },
          }
        );
      } catch (err: any) {
        toast({ title: t("project.importError"), description: err.message || t("project.cannotReadFile"), variant: "destructive" });
        setUploading(false);
      }
    };
    input.click();
  };

  const handleCreate = () => {
    if (!newDocName.trim()) return;
    createDoc({
      projectId: project.id,
      name: newDocName,
      type: newDocType,
      content: newDocContent || "",
    });
    setIsDialogOpen(false);
    setNewDocName("");
    setNewDocContent("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">{t("project.projectDocuments")}</h3>
          <p className="text-sm text-muted-foreground">{t("project.docsAnalyzedByAI")}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleFileImport} disabled={uploading} data-testid="button-import-file">
            {uploading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Upload className="mr-2 w-4 h-4" />}
            {uploading ? t("project.processingFile") : t("project.importFile")}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-document">
                <Plus className="mr-2 w-4 h-4" />
                {t("project.addManually")}
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("project.addDocumentTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("project.docNameLabel")}</label>
                <Input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder={t("project.docNamePlaceholder")} data-testid="input-doc-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("project.docTypeLabel")}</label>
                <Select value={newDocType} onValueChange={setNewDocType}>
                  <SelectTrigger data-testid="select-doc-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map(dt => <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("project.docContentLabel")}</label>
                <Textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder={t("project.docContentPlaceholder")}
                  className="h-40 text-sm"
                  data-testid="textarea-doc-content"
                />
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newDocName.trim()} data-testid="button-create-doc">{t("project.addTheDocument")}</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : documents?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{t("project.noDocsAdded")}</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {project.type === "vae"
              ? t("project.vaeDocsHint")
              : t("project.standardDocsHint")}
          </p>
          <p className="text-xs text-muted-foreground mb-3">{t("project.supportedFormats")}</p>
          <Button variant="outline" onClick={handleFileImport} disabled={uploading} data-testid="button-import-file-empty">
            {uploading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Upload className="mr-2 w-4 h-4" />}
            {uploading ? t("project.processingFile") : t("project.importFile")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc: any) => (
            <Card key={doc.id} className="hover-elevate">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-sm" data-testid={`text-doc-name-${doc.id}`}>{doc.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase mt-1">{doc.type}</p>
                  {doc.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.content.substring(0, 100)}...</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => deleteDoc({ id: doc.id, projectId: project.id })}
                  data-testid={`button-delete-doc-${doc.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
