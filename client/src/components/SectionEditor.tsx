import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateSection,
  useSaveManual,
  useValidateSection,
  useUnvalidateSection,
  useSectionVersions,
  useActivateVersion,
  useUpdateSectionStatus,
  useStatusHistory,
  useClearNeedsReview,
  useSaveSectionConfig,
} from "@/hooks/use-sections";
import { useI18n } from "@/lib/i18n";
import { SECTION_LABELS, SECTION_STATUS_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Pencil, Check, RefreshCw, History, ChevronDown, ChevronUp,
  Loader2, Save, X, ArrowLeft, Copy, RotateCcw, Clock, Send,
  FileCheck, Archive, CircleDot, GitCompareArrows,
} from "lucide-react";
import InternshipQuestionnaire, { isInternshipReportSection, buildInternshipContext } from "@/components/InternshipQuestionnaire";
import VaeQuestionnaire, { isVaeSection, buildVaeContext } from "@/components/VaeQuestionnaire";
import MemoireProQuestionnaire, { isMemoireProSection, buildMemoireProContext } from "@/components/MemoireProQuestionnaire";
import CaseStudyQuestionnaire, { isCaseStudySection, buildCaseStudyContext } from "@/components/CaseStudyQuestionnaire";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

const STATUS_ICONS: Record<string, any> = {
  draft: CircleDot,
  generated: Sparkles,
  modified: Pencil,
  validated: Check,
  sent_tutor: Send,
  awaiting_correction: Clock,
  corrected: FileCheck,
  final_version: FileCheck,
  archived: Archive,
};

const STATUS_WORKFLOW_ORDER = [
  "draft", "generated", "modified", "validated",
  "sent_tutor", "awaiting_correction", "corrected",
  "final_version", "archived",
];

interface SectionEditorProps {
  projectId: number;
  sectionKey: string;
  section?: ProjectSection;
  activeVersion?: SectionVersion;
  projectType: string;
  extraInputs?: React.ReactNode;
  getExtraContext?: () => string;
  config?: Record<string, any>;
}

export default function SectionEditor({
  projectId,
  sectionKey,
  section,
  activeVersion,
  projectType,
  extraInputs,
  getExtraContext,
  config,
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showStatusTimeline, setShowStatusTimeline] = useState(false);
  const [showRegenerateChoice, setShowRegenerateChoice] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useI18n();

  const isInternshipSection = isInternshipReportSection(sectionKey);
  const isVaeSec = isVaeSection(sectionKey);
  const isMpSec = isMemoireProSection(sectionKey);
  const isCsSec = isCaseStudySection(sectionKey);
  const isQuestionnaireSection = isInternshipSection || isVaeSec || isMpSec || isCsSec;
  const savedQuestionnaireAnswers = (section?.config as any)?.questionnaireAnswers as Record<string, string> | undefined;
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>(savedQuestionnaireAnswers || {});

  const generateMutation = useGenerateSection();
  const saveMutation = useSaveManual();
  const saveConfigMutation = useSaveSectionConfig();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const activateVersionMutation = useActivateVersion();
  const updateStatusMutation = useUpdateSectionStatus();
  const clearReviewMutation = useClearNeedsReview();

  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const currentStatus = section?.status || "draft";
  const isValidated = currentStatus === "validated" || currentStatus === "final_version";
  const hasContent = !!activeVersion?.content;
  const isPending = generateMutation.isPending;
  const sectionConfig = (section?.config as Record<string, any>) || {};
  const needsReview = !!sectionConfig.needsReview;
  const reviewReason = sectionConfig.reviewReason as string | undefined;

  const statusLabel = (s: string) => t(`sectionStatus.${s}`) || SECTION_STATUS_LABELS[s] || s;

  const handleGenerate = (mode: "initial" | "similar" | "different") => {
    setShowRegenerateChoice(false);
    generateMutation.mutate(
      {
        projectId,
        sectionKey,
        mode,
        extraContext: getExtraContext?.(),
        config,
      },
      {
        onSuccess: () => {
          toast({ title: t("section.contentGenerated"), description: `${label} ${t("section.generatedSuccess")}` });
        },
        onError: (err: any) => {
          toast({ title: t("section.error"), description: err.message || t("section.generationFailed"), variant: "destructive" });
        },
      }
    );
  };

  const handleSaveManual = () => {
    if (!section || !editContent.trim()) return;
    saveMutation.mutate(
      { sectionId: section.id, content: editContent, projectId },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: t("section.saved"), description: t("section.changesSaved") });
        },
      }
    );
  };

  const handleValidate = () => {
    if (!section) return;
    validateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => {
          toast({ title: t("section.validated"), description: `${label} ${t("section.validatedDesc")}` });
        },
      }
    );
  };

  const handleUnvalidate = () => {
    if (!section) return;
    unvalidateMutation.mutate(
      { sectionId: section.id, projectId },
      {
        onSuccess: () => {
          toast({ title: t("section.unvalidated"), description: `${label} ${t("section.backToDraftDesc")}` });
        },
      }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    if (!section) return;
    updateStatusMutation.mutate(
      { sectionId: section.id, status: newStatus, projectId },
      {
        onSuccess: () => {
          toast({
            title: t("section.statusUpdated"),
            description: `${label} : ${statusLabel(newStatus)}`,
          });
        },
      }
    );
  };

  const startEditing = () => {
    setEditContent(activeVersion?.content || "");
    setIsEditing(true);
  };

  const StatusIcon = STATUS_ICONS[currentStatus] || CircleDot;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base md:text-lg flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              {label}
            </CardTitle>
            {section && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowStatusTimeline(true)}
                  data-testid={`button-status-timeline-${sectionKey}`}
                  title={t("section.tracking")}
                >
                  <Clock className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  data-testid={`button-history-${sectionKey}`}
                  title={t("section.history")}
                >
                  <History className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          {section && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={`${STATUS_COLORS[currentStatus] || ""} no-default-hover-elevate no-default-active-elevate`} data-testid={`badge-status-${sectionKey}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusLabel(currentStatus)}
              </Badge>
              <Select value={currentStatus} onValueChange={handleStatusChange} data-testid={`select-status-${sectionKey}`}>
                <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs" data-testid={`trigger-status-${sectionKey}`}>
                  <SelectValue placeholder={t("section.changeStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_WORKFLOW_ORDER.map((s) => (
                    <SelectItem key={s} value={s} data-testid={`status-option-${s}`}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {needsReview && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" data-testid={`alert-needs-review-${sectionKey}`}>
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t("section.sectionNeedsReview")}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  {lang === "fr" ? "La section « " : "The section \""}{reviewReason ? (SECTION_LABELS[reviewReason] || reviewReason) : t("section.fundamentalElement")}{lang === "fr" ? " » " : "\" "}{t("section.reviewDescription")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => section && clearReviewMutation.mutate({ sectionId: section.id, projectId })}
                disabled={clearReviewMutation.isPending}
                data-testid={`button-dismiss-review-${sectionKey}`}
              >
                <Check className="w-3 h-3 mr-1" /> OK
              </Button>
            </div>
          )}

          {extraInputs}

          {isPending && (
            <div className="flex items-center justify-center py-12 text-primary gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">{t("section.generating")}</span>
            </div>
          )}

          {!isPending && ((!hasContent && !isEditing) || showQuestionnaire) && isQuestionnaireSection && (
            isInternshipSection ? (
              <InternshipQuestionnaire
                sectionKey={sectionKey}
                onGenerate={(answers) => {
                  setQuestionnaireAnswers(answers);
                  if (section) {
                    saveConfigMutation.mutate({
                      sectionId: section.id,
                      config: { ...sectionConfig, questionnaireAnswers: answers },
                      projectId,
                    });
                  }
                  const context = buildInternshipContext(sectionKey, answers);
                  generateMutation.mutate(
                    {
                      projectId,
                      sectionKey,
                      mode: hasContent ? "similar" as const : "initial" as const,
                      extraContext: context,
                      config,
                    },
                    {
                      onSuccess: () => {
                        setShowQuestionnaire(false);
                        toast({ title: t("section.contentGenerated"), description: `${label} ${t("section.generatedSuccess")}` });
                      },
                      onError: (err: any) => {
                        toast({ title: t("section.error"), description: err.message || t("section.generationFailed"), variant: "destructive" });
                      },
                    }
                  );
                }}
                isPending={isPending}
                savedAnswers={questionnaireAnswers}
                onSaveAnswers={(answers) => {
                  setQuestionnaireAnswers(answers);
                }}
              />
            ) : isVaeSec ? (
              <VaeQuestionnaire
                sectionKey={sectionKey}
                onGenerate={(answers) => {
                  setQuestionnaireAnswers(answers);
                  if (section) {
                    saveConfigMutation.mutate({
                      sectionId: section.id,
                      config: { ...sectionConfig, questionnaireAnswers: answers },
                      projectId,
                    });
                  }
                  const context = buildVaeContext(sectionKey, answers);
                  generateMutation.mutate(
                    {
                      projectId,
                      sectionKey,
                      mode: hasContent ? "similar" as const : "initial" as const,
                      extraContext: context,
                      config,
                    },
                    {
                      onSuccess: () => {
                        setShowQuestionnaire(false);
                        toast({ title: t("section.contentGenerated"), description: `${label} ${t("section.generatedSuccess")}` });
                      },
                      onError: (err: any) => {
                        toast({ title: t("section.error"), description: err.message || t("section.generationFailed"), variant: "destructive" });
                      },
                    }
                  );
                }}
                isPending={isPending}
                savedAnswers={questionnaireAnswers}
                onSaveAnswers={(answers) => {
                  setQuestionnaireAnswers(answers);
                }}
              />
            ) : isMpSec ? (
              <MemoireProQuestionnaire
                sectionKey={sectionKey}
                onGenerate={(answers) => {
                  setQuestionnaireAnswers(answers);
                  if (section) {
                    saveConfigMutation.mutate({
                      sectionId: section.id,
                      config: { ...sectionConfig, questionnaireAnswers: answers },
                      projectId,
                    });
                  }
                  const context = buildMemoireProContext(sectionKey, answers);
                  generateMutation.mutate(
                    {
                      projectId,
                      sectionKey,
                      mode: hasContent ? "similar" as const : "initial" as const,
                      extraContext: context,
                      config,
                    },
                    {
                      onSuccess: () => {
                        setShowQuestionnaire(false);
                        toast({ title: t("section.contentGenerated"), description: `${label} ${t("section.generatedSuccess")}` });
                      },
                      onError: (err: any) => {
                        toast({ title: t("section.error"), description: err.message || t("section.generationFailed"), variant: "destructive" });
                      },
                    }
                  );
                }}
                isPending={isPending}
                savedAnswers={questionnaireAnswers}
                onSaveAnswers={(answers) => {
                  setQuestionnaireAnswers(answers);
                }}
              />
            ) : isCsSec ? (
              <CaseStudyQuestionnaire
                sectionKey={sectionKey}
                onGenerate={(answers) => {
                  setQuestionnaireAnswers(answers);
                  if (section) {
                    saveConfigMutation.mutate({
                      sectionId: section.id,
                      config: { ...sectionConfig, questionnaireAnswers: answers },
                      projectId,
                    });
                  }
                  const context = buildCaseStudyContext(sectionKey, answers);
                  generateMutation.mutate(
                    {
                      projectId,
                      sectionKey,
                      mode: hasContent ? "similar" as const : "initial" as const,
                      extraContext: context,
                      config,
                    },
                    {
                      onSuccess: () => {
                        setShowQuestionnaire(false);
                        toast({ title: t("section.contentGenerated"), description: `${label} ${t("section.generatedSuccess")}` });
                      },
                      onError: (err: any) => {
                        toast({ title: t("section.error"), description: err.message || t("section.generationFailed"), variant: "destructive" });
                      },
                    }
                  );
                }}
                isPending={isPending}
                savedAnswers={questionnaireAnswers}
                onSaveAnswers={(answers) => {
                  setQuestionnaireAnswers(answers);
                }}
              />
            ) : null
          )}

          {!isPending && !hasContent && !isEditing && !isQuestionnaireSection && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">{t("section.noContentForSection")}</p>
              <Button onClick={() => handleGenerate("initial")} data-testid={`button-generate-${sectionKey}`}>
                <Sparkles className="w-4 h-4 mr-2" /> {t("section.generate")} {label}
              </Button>
            </div>
          )}

          {!isPending && hasContent && !isEditing && (
            <>
              <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/30 rounded-lg p-3 md:p-5 overflow-x-hidden" data-testid={`content-${sectionKey}`}>
                <ReactMarkdown>{activeVersion!.content}</ReactMarkdown>
              </div>

              {activeVersion && (
                <p className="text-xs text-muted-foreground">
                  {t("section.version")} {activeVersion.versionNumber} &middot; {activeVersion.source === "ai" ? t("section.aiGenerated") : t("section.manuallyModified")}
                  {activeVersion.mode && activeVersion.mode !== "initial" && ` (${activeVersion.mode === "similar" ? t("section.similar") : t("section.different")})`}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={startEditing} data-testid={`button-edit-${sectionKey}`}>
                  <Pencil className="w-4 h-4 mr-1" /> {t("section.edit")}
                </Button>
                {isQuestionnaireSection ? (
                  <Button variant="outline" size="sm" onClick={() => setShowQuestionnaire(true)} data-testid={`button-reanswer-${sectionKey}`}>
                    <RefreshCw className="w-4 h-4 mr-1" /> {t("section.change")}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowRegenerateChoice(true)} data-testid={`button-regenerate-${sectionKey}`}>
                    <RefreshCw className="w-4 h-4 mr-1" /> {t("section.change")}
                  </Button>
                )}
                {currentStatus !== "validated" && currentStatus !== "final_version" ? (
                  <Button size="sm" onClick={handleValidate} data-testid={`button-validate-${sectionKey}`}>
                    <Check className="w-4 h-4 mr-1" /> {t("section.validateThisVersion")}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleUnvalidate} data-testid={`button-unvalidate-${sectionKey}`}>
                    <RotateCcw className="w-4 h-4 mr-1" /> {t("section.backToDraft")}
                  </Button>
                )}
              </div>
            </>
          )}

          {isEditing && (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                data-testid={`textarea-edit-${sectionKey}`}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveManual} disabled={saveMutation.isPending} data-testid={`button-save-${sectionKey}`}>
                  <Save className="w-4 h-4 mr-1" /> {t("section.save")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} data-testid={`button-cancel-edit-${sectionKey}`}>
                  <X className="w-4 h-4 mr-1" /> {t("section.cancelEdit")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRegenerateChoice} onOpenChange={setShowRegenerateChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("section.regenerationType")}</DialogTitle>
            <DialogDescription>{t("section.regenerationDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("similar")}
              data-testid={`button-regenerate-similar-${sectionKey}`}
            >
              <span className="font-semibold">{t("section.similarProposal")}</span>
              <span className="text-xs text-muted-foreground mt-1">{t("section.similarProposalDesc")}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("different")}
              data-testid={`button-regenerate-different-${sectionKey}`}
            >
              <span className="font-semibold">{t("section.differentProposal")}</span>
              <span className="text-xs text-muted-foreground mt-1">{t("section.differentProposalDesc")}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VersionHistoryDialog
        sectionId={section?.id}
        projectId={projectId}
        sectionKey={sectionKey}
        open={showHistory}
        onOpenChange={setShowHistory}
      />

      <StatusTimelineDialog
        sectionId={section?.id}
        sectionKey={sectionKey}
        open={showStatusTimeline}
        onOpenChange={setShowStatusTimeline}
      />
    </div>
  );
}

function StatusTimelineDialog({
  sectionId,
  sectionKey,
  open,
  onOpenChange,
}: {
  sectionId?: number;
  sectionKey: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: history, isLoading } = useStatusHistory(open ? sectionId : undefined);
  const { t, lang } = useI18n();

  const statusLabel = (s: string) => t(`sectionStatus.${s}`) || SECTION_STATUS_LABELS[s] || s;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("section.statusTrackingTitle")} — {SECTION_LABELS[sectionKey] || sectionKey}</DialogTitle>
          <DialogDescription>{t("section.statusTrackingDesc")}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !history || history.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">{t("section.noStatusChanges")}</p>
        ) : (
          <div className="relative pl-6 space-y-0 pt-2">
            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-border" />
            {history.map((entry, idx) => {
              const StatusIcon = STATUS_ICONS[entry.status] || CircleDot;
              const isFirst = idx === 0;
              return (
                <div key={entry.id} className="relative pb-4" data-testid={`timeline-entry-${entry.id}`}>
                  <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full flex items-center justify-center ${isFirst ? "bg-primary text-primary-foreground" : "bg-muted border border-border"}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${STATUS_COLORS[entry.status] || ""} no-default-hover-elevate no-default-active-elevate`}>
                        {statusLabel(entry.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt!).toLocaleDateString(dateLocale, {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{entry.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function computeLineDiff(oldText: string, newText: string): { type: "same" | "added" | "removed"; text: string }[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const result: { type: "same" | "added" | "removed"; text: string }[] = [];
  let oi = 0, ni = 0;

  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: "same", text: oldLines[oi] });
      oi++;
      ni++;
    } else if (oi < oldLines.length && ni < newLines.length) {
      result.push({ type: "removed", text: oldLines[oi] });
      result.push({ type: "added", text: newLines[ni] });
      oi++;
      ni++;
    } else if (oi < oldLines.length) {
      result.push({ type: "removed", text: oldLines[oi] });
      oi++;
    } else {
      result.push({ type: "added", text: newLines[ni] });
      ni++;
    }
  }
  return result;
}

function VersionHistoryDialog({
  sectionId,
  projectId,
  sectionKey,
  open,
  onOpenChange,
}: {
  sectionId?: number;
  projectId: number;
  sectionKey: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: versions, isLoading } = useSectionVersions(sectionId);
  const activateMutation = useActivateVersion();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<number | null>(null);
  const [compareB, setCompareB] = useState<number | null>(null);

  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";

  const handleActivate = (versionId: number) => {
    if (!sectionId) return;
    activateMutation.mutate(
      { sectionId, versionId, projectId },
      {
        onSuccess: () => {
          toast({ title: t("section.versionRestored"), description: t("section.versionRestoredDesc") });
          onOpenChange(false);
        },
      }
    );
  };

  const toggleCompare = (vId: number) => {
    if (compareA === vId) { setCompareA(null); return; }
    if (compareB === vId) { setCompareB(null); return; }
    if (!compareA) { setCompareA(vId); return; }
    if (!compareB) { setCompareB(vId); return; }
    setCompareA(vId);
    setCompareB(null);
  };

  const versionA = versions?.find(v => v.id === compareA);
  const versionB = versions?.find(v => v.id === compareB);
  const canCompare = compareMode && versionA && versionB;
  const diffLines = canCompare ? computeLineDiff(versionA.content, versionB.content) : [];

  const exitCompare = () => {
    setCompareMode(false);
    setCompareA(null);
    setCompareB(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) exitCompare(); onOpenChange(v); }}>
      <DialogContent className={`${canCompare ? "max-w-4xl" : "max-w-2xl"} max-h-[80vh] overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <DialogTitle>{t("section.versionHistoryTitle")} — {SECTION_LABELS[sectionKey] || sectionKey}</DialogTitle>
              <DialogDescription>{t("section.versionHistoryDesc")}</DialogDescription>
            </div>
            {versions && versions.length >= 2 && (
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => compareMode ? exitCompare() : setCompareMode(true)}
                data-testid="button-toggle-compare"
              >
                <GitCompareArrows className="w-4 h-4 mr-1" />
                {compareMode ? t("section.exitComparison") : t("section.compare")}
              </Button>
            )}
          </div>
        </DialogHeader>

        {canCompare && (
          <div className="space-y-3" data-testid="version-diff-panel">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{t("section.version")} {versionA.versionNumber}</Badge>
              <span className="text-xs text-muted-foreground">vs</span>
              <Badge variant="outline" className="text-xs">{t("section.version")} {versionB.versionNumber}</Badge>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                <div className="px-3 py-2 border-r">{t("section.version")} {versionA.versionNumber} ({t("section.oldVersion")})</div>
                <div className="px-3 py-2">{t("section.version")} {versionB.versionNumber} ({t("section.recentVersion")})</div>
              </div>
              <div className="max-h-[40vh] overflow-y-auto">
                {diffLines.map((line, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-2 text-xs font-mono ${
                      line.type === "removed" ? "bg-red-50 dark:bg-red-950/30" :
                      line.type === "added" ? "bg-green-50 dark:bg-green-950/30" : ""
                    }`}
                  >
                    {line.type === "same" && (
                      <>
                        <div className="px-3 py-0.5 border-r border-border/30 whitespace-pre-wrap break-words">{line.text}</div>
                        <div className="px-3 py-0.5 whitespace-pre-wrap break-words">{line.text}</div>
                      </>
                    )}
                    {line.type === "removed" && (
                      <>
                        <div className="px-3 py-0.5 border-r border-border/30 whitespace-pre-wrap break-words text-red-700 dark:text-red-400">- {line.text}</div>
                        <div className="px-3 py-0.5" />
                      </>
                    )}
                    {line.type === "added" && (
                      <>
                        <div className="px-3 py-0.5 border-r border-border/30" />
                        <div className="px-3 py-0.5 whitespace-pre-wrap break-words text-green-700 dark:text-green-400">+ {line.text}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {compareMode && !canCompare && (
          <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            {t("section.selectTwoVersions")}
            {compareA && !compareB && <span className="block mt-1 font-medium">{t("section.oneVersionSelected")}</span>}
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !versions || versions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">{t("section.noVersions")}</p>
        ) : (
          <div className="space-y-3 pt-2">
            {versions.map((v) => {
              const isSelectedForCompare = compareA === v.id || compareB === v.id;
              return (
                <Card key={v.id} className={`${v.isActive ? "border-primary" : ""} ${isSelectedForCompare ? "ring-2 ring-primary/50" : ""}`}>
                  <CardHeader className="py-3 flex flex-row items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {compareMode && (
                        <Checkbox
                          checked={isSelectedForCompare}
                          onCheckedChange={() => toggleCompare(v.id)}
                          data-testid={`checkbox-compare-${v.id}`}
                        />
                      )}
                      <span className="font-medium text-sm">{t("section.version")} {v.versionNumber}</span>
                      {v.isActive && <Badge variant="default" className="text-xs">{t("section.active")}</Badge>}
                      <Badge variant="secondary" className="text-xs">{v.source === "ai" ? t("section.ai") : t("section.manual")}</Badge>
                      {v.mode && v.mode !== "initial" && (
                        <Badge variant="outline" className="text-xs">{v.mode === "similar" ? t("section.regenerateSimilar") : t("section.regenerateDifferent")}</Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                      >
                        {expandedId === v.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      {!v.isActive && !compareMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(v.id)}
                          disabled={activateMutation.isPending}
                          data-testid={`button-restore-version-${v.id}`}
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" /> {t("section.restoreVersion")}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {expandedId === v.id && (
                    <CardContent className="pt-0">
                      <div className="prose prose-sm dark:prose-invert prose-academic max-w-none bg-muted/20 rounded p-3 max-h-60 overflow-y-auto">
                        <ReactMarkdown>{v.content}</ReactMarkdown>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("section.createdOn")} {new Date(v.createdAt!).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
