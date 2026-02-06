import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/hooks/use-sections";
import { SECTION_LABELS, SECTION_STATUS_LABELS } from "@shared/schema";
import type { ProjectSection, SectionVersion } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import {
  Sparkles, Pencil, Check, RefreshCw, History, ChevronDown, ChevronUp,
  Loader2, Save, X, ArrowLeft, Copy, RotateCcw, Clock, Send,
  FileCheck, Archive, CircleDot,
} from "lucide-react";
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
  const { toast } = useToast();

  const generateMutation = useGenerateSection();
  const saveMutation = useSaveManual();
  const validateMutation = useValidateSection();
  const unvalidateMutation = useUnvalidateSection();
  const activateVersionMutation = useActivateVersion();
  const updateStatusMutation = useUpdateSectionStatus();

  const label = SECTION_LABELS[sectionKey] || sectionKey;
  const currentStatus = section?.status || "draft";
  const isValidated = currentStatus === "validated" || currentStatus === "final_version";
  const hasContent = !!activeVersion?.content;
  const isPending = generateMutation.isPending;

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
          toast({ title: "Contenu généré", description: `${label} a été généré avec succès.` });
        },
        onError: (err: any) => {
          toast({ title: "Erreur", description: err.message || "La génération a échoué.", variant: "destructive" });
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
          toast({ title: "Sauvegardé", description: "Vos modifications ont été enregistrées." });
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
          toast({ title: "Validé", description: `${label} a été validé et sera utilisé dans les sections suivantes.` });
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
          toast({ title: "Dévalidé", description: `${label} est de nouveau en brouillon.` });
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
            title: "Statut mis à jour",
            description: `${label} : ${SECTION_STATUS_LABELS[newStatus] || newStatus}`,
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
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap pb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
              <Sparkles className="w-5 h-5 text-primary" />
              {label}
            </CardTitle>
            {section && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={`${STATUS_COLORS[currentStatus] || ""} no-default-hover-elevate no-default-active-elevate`} data-testid={`badge-status-${sectionKey}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {SECTION_STATUS_LABELS[currentStatus] || currentStatus}
                </Badge>
                <Select value={currentStatus} onValueChange={handleStatusChange} data-testid={`select-status-${sectionKey}`}>
                  <SelectTrigger className="w-[200px] h-8 text-xs" data-testid={`trigger-status-${sectionKey}`}>
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_WORKFLOW_ORDER.map((s) => (
                      <SelectItem key={s} value={s} data-testid={`status-option-${s}`}>
                        {SECTION_STATUS_LABELS[s] || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {section && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatusTimeline(true)}
                data-testid={`button-status-timeline-${sectionKey}`}
              >
                <Clock className="w-4 h-4 mr-1" /> Suivi
              </Button>
            )}
            {section && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                data-testid={`button-history-${sectionKey}`}
              >
                <History className="w-4 h-4 mr-1" /> Historique
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {extraInputs}

          {isPending && (
            <div className="flex items-center justify-center py-12 text-primary gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm font-medium">Génération en cours...</span>
            </div>
          )}

          {!isPending && !hasContent && !isEditing && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">Aucun contenu généré pour cette section.</p>
              <Button onClick={() => handleGenerate("initial")} data-testid={`button-generate-${sectionKey}`}>
                <Sparkles className="w-4 h-4 mr-2" /> Générer {label}
              </Button>
            </div>
          )}

          {!isPending && hasContent && !isEditing && (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4" data-testid={`content-${sectionKey}`}>
                <ReactMarkdown>{activeVersion!.content}</ReactMarkdown>
              </div>

              {activeVersion && (
                <p className="text-xs text-muted-foreground">
                  Version {activeVersion.versionNumber} &middot; {activeVersion.source === "ai" ? "Généré par IA" : "Modifié manuellement"}
                  {activeVersion.mode && activeVersion.mode !== "initial" && ` (${activeVersion.mode === "similar" ? "similaire" : "différent"})`}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={startEditing} data-testid={`button-edit-${sectionKey}`}>
                  <Pencil className="w-4 h-4 mr-1" /> Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowRegenerateChoice(true)} data-testid={`button-regenerate-${sectionKey}`}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Changer
                </Button>
                {currentStatus !== "validated" && currentStatus !== "final_version" ? (
                  <Button size="sm" onClick={handleValidate} data-testid={`button-validate-${sectionKey}`}>
                    <Check className="w-4 h-4 mr-1" /> Valider cette version
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleUnvalidate} data-testid={`button-unvalidate-${sectionKey}`}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Remettre en brouillon
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
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} data-testid={`button-cancel-edit-${sectionKey}`}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRegenerateChoice} onOpenChange={setShowRegenerateChoice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Type de régénération</DialogTitle>
            <DialogDescription>Choisissez le type de nouvelle proposition souhaitée.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("similar")}
              data-testid={`button-regenerate-similar-${sectionKey}`}
            >
              <span className="font-semibold">Proposition similaire</span>
              <span className="text-xs text-muted-foreground mt-1">Même axe, même logique, reformulation et amélioration stylistique</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-start text-left"
              onClick={() => handleGenerate("different")}
              data-testid={`button-regenerate-different-${sectionKey}`}
            >
              <span className="font-semibold">Proposition différente</span>
              <span className="text-xs text-muted-foreground mt-1">Angle différent, logique alternative, nouvelle approche</span>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suivi du statut — {SECTION_LABELS[sectionKey] || sectionKey}</DialogTitle>
          <DialogDescription>Historique complet des changements de statut avec horodatage.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !history || history.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucun changement de statut enregistré.</p>
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
                        {SECTION_STATUS_LABELS[entry.status] || entry.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.changedAt!).toLocaleDateString("fr-FR", {
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleActivate = (versionId: number) => {
    if (!sectionId) return;
    activateMutation.mutate(
      { sectionId, versionId, projectId },
      {
        onSuccess: () => {
          toast({ title: "Version restaurée", description: "Cette version est maintenant active." });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des versions — {SECTION_LABELS[sectionKey] || sectionKey}</DialogTitle>
          <DialogDescription>Consultez, comparez et restaurez les versions précédentes.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !versions || versions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucune version enregistrée.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {versions.map((v) => (
              <Card key={v.id} className={v.isActive ? "border-primary" : ""}>
                <CardHeader className="py-3 flex flex-row items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">Version {v.versionNumber}</span>
                    {v.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                    <Badge variant="secondary" className="text-xs">{v.source === "ai" ? "IA" : "Manuel"}</Badge>
                    {v.mode && v.mode !== "initial" && (
                      <Badge variant="outline" className="text-xs">{v.mode === "similar" ? "Similaire" : "Différent"}</Badge>
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
                    {!v.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(v.id)}
                        disabled={activateMutation.isPending}
                        data-testid={`button-restore-version-${v.id}`}
                      >
                        <ArrowLeft className="w-3 h-3 mr-1" /> Restaurer
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {expandedId === v.id && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/20 rounded p-3 max-h-60 overflow-y-auto">
                      <ReactMarkdown>{v.content}</ReactMarkdown>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Créé le {new Date(v.createdAt!).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
