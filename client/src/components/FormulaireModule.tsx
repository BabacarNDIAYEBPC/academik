import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  ChevronUp,
  ChevronDown,
  FileText,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  ClipboardList,
  BarChart3,
  Settings2,
} from "lucide-react";

interface FormulaireModuleProps {
  projectId: number;
  section?: any;
}

interface FormItem {
  id: number;
  title: string;
  description?: string;
  status: string;
  publicId?: string;
  responseCount?: number;
  createdAt?: string;
  questions?: QuestionItem[];
}

interface QuestionItem {
  id: number;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface AnswerItem {
  responseId: number;
  questionId: number;
  value: any;
}

interface ResponseItem {
  id: number;
  answers: AnswerItem[];
  submittedAt?: string;
}

const QUESTION_TYPES = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "mcq", label: "Choix unique" },
  { value: "mcq_multiple", label: "Choix multiples" },
  { value: "likert", label: "Échelle de Likert (1-5)" },
  { value: "yes_no", label: "Oui / Non" },
  { value: "number", label: "Nombre" },
  { value: "email", label: "Email" },
];

const TYPES_WITH_OPTIONS = ["mcq", "mcq_multiple", "likert"];

export default function FormulaireModule({
  projectId,
  section,
}: FormulaireModuleProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedResponses, setExpandedResponses] = useState<Set<number>>(
    new Set()
  );

  const { data: forms, isLoading: formsLoading } = useQuery<FormItem[]>({
    queryKey: ["/api/projects", projectId, "forms"],
  });

  const { data: formDetail, isLoading: formDetailLoading } =
    useQuery<FormItem>({
      queryKey: ["/api/forms", selectedFormId],
      enabled: !!selectedFormId,
    });

  const { data: responses, isLoading: responsesLoading } = useQuery<
    ResponseItem[]
  >({
    queryKey: ["/api/forms", selectedFormId, "responses"],
    enabled: !!selectedFormId && activeTab === "responses",
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await apiRequest(
        "POST",
        `/api/projects/${projectId}/forms`,
        data
      );
      return res.json();
    },
    onSuccess: (data: FormItem) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "forms"],
      });
      setCreateDialogOpen(false);
      setNewFormTitle("");
      setNewFormDescription("");
      setSelectedFormId(data.id);
      setActiveTab("editor");
      toast({ title: "Formulaire créé", description: "Vous pouvez maintenant ajouter des questions." });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le formulaire.",
        variant: "destructive",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (data: {
      formId: number;
      updates: Partial<FormItem>;
    }) => {
      const res = await apiRequest("PATCH", `/api/forms/${data.formId}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "forms"],
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      await apiRequest("DELETE", `/api/forms/${formId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/projects", projectId, "forms"],
      });
      if (selectedFormId) {
        setSelectedFormId(null);
        setActiveTab("list");
      }
      toast({ title: "Formulaire supprimé" });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer.",
        variant: "destructive",
      });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: {
      formId: number;
      question: { label: string; type: string; required: boolean; options?: string[] };
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/forms/${data.formId}/questions`,
        data.question
      );
      return res.json();
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId],
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la question.",
        variant: "destructive",
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: {
      formId: number;
      questionId: number;
      updates: Partial<QuestionItem>;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/forms/${data.formId}/questions/${data.questionId}`,
        data.updates
      );
      return res.json();
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId],
        });
      }
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (data: { formId: number; questionId: number }) => {
      await apiRequest(
        "DELETE",
        `/api/forms/${data.formId}/questions/${data.questionId}`
      );
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId],
        });
      }
      toast({ title: "Question supprimée" });
    },
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: async (data: {
      formId: number;
      questionIds: number[];
    }) => {
      const res = await apiRequest(
        "POST",
        `/api/forms/${data.formId}/questions/reorder`,
        { questionIds: data.questionIds }
      );
      return res.json();
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId],
        });
      }
    },
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async (data: { formId: number; responseId: number }) => {
      await apiRequest(
        "DELETE",
        `/api/forms/${data.formId}/responses/${data.responseId}`
      );
    },
    onSuccess: () => {
      if (selectedFormId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/forms", selectedFormId, "responses"],
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/projects", projectId, "forms"],
        });
      }
      toast({ title: "Réponse supprimée" });
    },
  });

  const handleSelectForm = useCallback(
    (formId: number) => {
      setSelectedFormId(formId);
      setActiveTab("editor");
    },
    []
  );

  const handleCopyLink = useCallback(
    (publicId: string) => {
      const link = `${window.location.origin}/f/${publicId}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      toast({ title: "Lien copié", description: "Le lien public a été copié dans le presse-papiers." });
      setTimeout(() => setCopiedLink(false), 2000);
    },
    [toast]
  );

  const handleTogglePublish = useCallback(() => {
    if (!formDetail || !selectedFormId) return;
    const newStatus = formDetail.status === "published" ? "draft" : "published";
    updateFormMutation.mutate(
      { formId: selectedFormId, updates: { status: newStatus } },
      {
        onSuccess: () => {
          toast({
            title: newStatus === "published" ? "Formulaire publié" : "Formulaire dépublié",
            description:
              newStatus === "published"
                ? "Le formulaire est maintenant accessible via son lien public."
                : "Le formulaire n'est plus accessible publiquement.",
          });
        },
      }
    );
  }, [formDetail, selectedFormId, updateFormMutation, toast]);

  const handleMoveQuestion = useCallback(
    (questionId: number, direction: "up" | "down") => {
      if (!formDetail?.questions || !selectedFormId) return;
      const questions = [...formDetail.questions].sort(
        (a, b) => a.order - b.order
      );
      const idx = questions.findIndex((q) => q.id === questionId);
      if (
        (direction === "up" && idx <= 0) ||
        (direction === "down" && idx >= questions.length - 1)
      )
        return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [questions[idx], questions[swapIdx]] = [
        questions[swapIdx],
        questions[idx],
      ];
      reorderQuestionsMutation.mutate({
        formId: selectedFormId,
        questionIds: questions.map((q) => q.id),
      });
    },
    [formDetail, selectedFormId, reorderQuestionsMutation]
  );

  const handleAddQuestion = useCallback(
    (type: string) => {
      if (!selectedFormId) return;
      const defaultOptions =
        type === "likert"
          ? ["1 - Pas du tout d'accord", "2 - Pas d'accord", "3 - Neutre", "4 - D'accord", "5 - Tout à fait d'accord"]
          : TYPES_WITH_OPTIONS.includes(type)
            ? ["Option 1", "Option 2"]
            : undefined;
      addQuestionMutation.mutate({
        formId: selectedFormId,
        question: {
          label: "Nouvelle question",
          type,
          required: false,
          options: defaultOptions,
        },
      });
    },
    [selectedFormId, addQuestionMutation]
  );

  const toggleResponseExpand = useCallback((responseId: number) => {
    setExpandedResponses((prev) => {
      const next = new Set(prev);
      if (next.has(responseId)) {
        next.delete(responseId);
      } else {
        next.add(responseId);
      }
      return next;
    });
  }, []);

  const renderFormsList = () => {
    if (formsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const formsList = forms || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-muted-foreground">
            {formsList.length} formulaire{formsList.length !== 1 ? "s" : ""}
          </p>
          <Button
            data-testid="button-create-form"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un formulaire
          </Button>
        </div>

        {formsList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun formulaire pour ce projet.
              </p>
              <Button
                data-testid="button-create-form-empty"
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier formulaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {formsList.map((form) => (
              <Card key={form.id} data-testid={`card-form-${form.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">{form.title}</h3>
                        <Badge
                          variant={
                            form.status === "published"
                              ? "default"
                              : "secondary"
                          }
                          data-testid={`badge-status-${form.id}`}
                        >
                          {form.status === "published" ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                      {form.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {form.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>
                          {form.responseCount ?? 0} réponse
                          {(form.responseCount ?? 0) !== 1 ? "s" : ""}
                        </span>
                        {form.createdAt && (
                          <span>
                            Créé le{" "}
                            {new Date(form.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-edit-form-${form.id}`}
                        onClick={() => handleSelectForm(form.id)}
                      >
                        <Settings2 className="w-4 h-4" />
                      </Button>
                      {form.status === "published" && form.publicId && (
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-share-form-${form.id}`}
                          onClick={() => handleCopyLink(form.publicId!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-form-${form.id}`}
                        onClick={() => deleteFormMutation.mutate(form.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEditor = () => {
    if (!selectedFormId) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4" />
          <p>Sélectionnez un formulaire pour l'éditer.</p>
        </div>
      );
    }

    if (formDetailLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!formDetail) return null;

    const questions = [...(formDetail.questions || [])].sort(
      (a, b) => a.order - b.order
    );
    const isPublished = formDetail.status === "published";

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <Button
                data-testid="button-toggle-publish"
                variant={isPublished ? "outline" : "default"}
                onClick={handleTogglePublish}
                disabled={updateFormMutation.isPending}
              >
                {updateFormMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isPublished ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isPublished ? "Dépublier" : "Publier"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-title">Titre</Label>
              <Input
                id="form-title"
                data-testid="input-form-title"
                value={formDetail.title}
                onChange={(e) =>
                  updateFormMutation.mutate({
                    formId: selectedFormId,
                    updates: { title: e.target.value },
                  })
                }
                onBlur={(e) =>
                  updateFormMutation.mutate({
                    formId: selectedFormId,
                    updates: { title: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                data-testid="input-form-description"
                value={formDetail.description || ""}
                onChange={(e) =>
                  updateFormMutation.mutate({
                    formId: selectedFormId,
                    updates: { description: e.target.value },
                  })
                }
                className="resize-none"
                rows={2}
              />
            </div>

            {isPublished && formDetail.publicId && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted flex-wrap">
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                <code className="text-xs flex-1 min-w-0 truncate" data-testid="text-share-link">
                  {`${window.location.origin}/f/${formDetail.publicId}`}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid="button-copy-link"
                  onClick={() => handleCopyLink(formDetail.publicId!)}
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-medium text-sm">
              Questions ({questions.length})
            </h3>
            <Select onValueChange={(type) => handleAddQuestion(type)}>
              <SelectTrigger
                className="w-auto"
                data-testid="select-add-question"
              >
                <SelectValue placeholder="Ajouter une question" />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((qt) => (
                  <SelectItem key={qt.value} value={qt.value}>
                    <Plus className="w-3 h-3 inline mr-1" />
                    {qt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {questions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Aucune question. Ajoutez-en une pour commencer.</p>
              </CardContent>
            </Card>
          )}

          {questions.map((question, idx) => (
            <Card key={question.id} data-testid={`card-question-${question.id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-move-up-${question.id}`}
                      disabled={idx === 0}
                      onClick={() => handleMoveQuestion(question.id, "up")}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      data-testid={`button-move-down-${question.id}`}
                      disabled={idx === questions.length - 1}
                      onClick={() => handleMoveQuestion(question.id, "down")}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        Q{idx + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {QUESTION_TYPES.find((qt) => qt.value === question.type)
                          ?.label || question.type}
                      </Badge>
                    </div>

                    <Input
                      data-testid={`input-question-label-${question.id}`}
                      value={question.label}
                      onChange={(e) =>
                        updateQuestionMutation.mutate({
                          formId: selectedFormId,
                          questionId: question.id,
                          updates: { label: e.target.value },
                        })
                      }
                      placeholder="Intitulé de la question"
                    />

                    <div className="flex items-center gap-4 flex-wrap">
                      <Select
                        value={question.type}
                        onValueChange={(type) =>
                          updateQuestionMutation.mutate({
                            formId: selectedFormId,
                            questionId: question.id,
                            updates: { type },
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-48"
                          data-testid={`select-question-type-${question.id}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((qt) => (
                            <SelectItem key={qt.value} value={qt.value}>
                              {qt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Switch
                          data-testid={`switch-required-${question.id}`}
                          checked={question.required}
                          onCheckedChange={(checked) =>
                            updateQuestionMutation.mutate({
                              formId: selectedFormId,
                              questionId: question.id,
                              updates: { required: checked },
                            })
                          }
                        />
                        <Label className="text-sm">Obligatoire</Label>
                      </div>
                    </div>

                    {TYPES_WITH_OPTIONS.includes(question.type) && (
                      <div className="space-y-2 pl-2 border-l-2 border-muted">
                        <Label className="text-xs text-muted-foreground">
                          Options
                        </Label>
                        {(question.options || []).map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className="flex items-center gap-2"
                          >
                            <Input
                              data-testid={`input-option-${question.id}-${optIdx}`}
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [
                                  ...(question.options || []),
                                ];
                                newOptions[optIdx] = e.target.value;
                                updateQuestionMutation.mutate({
                                  formId: selectedFormId,
                                  questionId: question.id,
                                  updates: { options: newOptions },
                                });
                              }}
                              className="flex-1"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-remove-option-${question.id}-${optIdx}`}
                              onClick={() => {
                                const newOptions = (
                                  question.options || []
                                ).filter((_, i) => i !== optIdx);
                                updateQuestionMutation.mutate({
                                  formId: selectedFormId,
                                  questionId: question.id,
                                  updates: { options: newOptions },
                                });
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-add-option-${question.id}`}
                          onClick={() => {
                            const newOptions = [
                              ...(question.options || []),
                              `Option ${(question.options || []).length + 1}`,
                            ];
                            updateQuestionMutation.mutate({
                              formId: selectedFormId,
                              questionId: question.id,
                              updates: { options: newOptions },
                            });
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Ajouter une option
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    data-testid={`button-delete-question-${question.id}`}
                    onClick={() =>
                      deleteQuestionMutation.mutate({
                        formId: selectedFormId,
                        questionId: question.id,
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderResponses = () => {
    if (!selectedFormId) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4" />
          <p>Sélectionnez un formulaire pour voir les réponses.</p>
        </div>
      );
    }

    if (responsesLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    const responsesList = responses || [];
    const questions = formDetail?.questions || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-medium text-sm" data-testid="text-response-count">
            {responsesList.length} réponse{responsesList.length !== 1 ? "s" : ""} collectée{responsesList.length !== 1 ? "s" : ""}
          </h3>
          <Button variant="outline" size="sm" data-testid="button-export-responses" disabled>
            Exporter (bientôt)
          </Button>
        </div>

        {responsesList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>Aucune réponse pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {responsesList.map((response, idx) => (
              <Card
                key={response.id}
                data-testid={`card-response-${response.id}`}
              >
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer gap-2 flex-wrap"
                    onClick={() => toggleResponseExpand(response.id)}
                    data-testid={`button-expand-response-${response.id}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">#{idx + 1}</Badge>
                      {response.submittedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(response.submittedAt).toLocaleString("fr-FR")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-response-${response.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteResponseMutation.mutate({
                            formId: selectedFormId!,
                            responseId: response.id,
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedResponses.has(response.id) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedResponses.has(response.id) && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {(response.answers || []).map((answer) => {
                        const question = questions.find(
                          (q) => q.id === answer.questionId
                        );
                        return (
                          <div key={answer.questionId} className="text-sm">
                            <span className="font-medium">
                              {question?.label || `Question ${answer.questionId}`}:
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {Array.isArray(answer.value)
                                ? answer.value.join(", ")
                                : String(answer.value ?? "")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ClipboardList className="w-5 h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">Formulaires</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list" data-testid="tab-forms-list">
              <FileText className="w-4 h-4 mr-1" />
              Mes formulaires
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              data-testid="tab-forms-editor"
              disabled={!selectedFormId}
            >
              <Settings2 className="w-4 h-4 mr-1" />
              Éditeur
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              data-testid="tab-forms-responses"
              disabled={!selectedFormId}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Réponses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">{renderFormsList()}</TabsContent>
          <TabsContent value="editor">{renderEditor()}</TabsContent>
          <TabsContent value="responses">{renderResponses()}</TabsContent>
        </Tabs>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un formulaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-form-title">Titre</Label>
                <Input
                  id="new-form-title"
                  data-testid="input-new-form-title"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="Mon formulaire"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-form-description">
                  Description (optionnel)
                </Label>
                <Textarea
                  id="new-form-description"
                  data-testid="input-new-form-description"
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  placeholder="Description du formulaire..."
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 flex-wrap">
                <Button
                  variant="outline"
                  data-testid="button-cancel-create"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  data-testid="button-confirm-create"
                  disabled={
                    !newFormTitle.trim() || createFormMutation.isPending
                  }
                  onClick={() =>
                    createFormMutation.mutate({
                      title: newFormTitle.trim(),
                      description: newFormDescription.trim() || undefined,
                    })
                  }
                >
                  {createFormMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
