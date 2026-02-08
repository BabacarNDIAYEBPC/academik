import { useState, useCallback } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface FormQuestion {
  id: number;
  type: string;
  label: string;
  description?: string;
  options?: string[];
  required: boolean;
  order: number;
}

interface FormData {
  id: number;
  title: string;
  description?: string;
  publicId: string;
  status: string;
  questions: FormQuestion[];
}

export default function PublicForm() {
  const { publicId } = useParams();
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const { data: form, isLoading, error } = useQuery<FormData>({
    queryKey: ["/api/public/forms", publicId],
    enabled: !!publicId,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { answers: { questionId: number; value: string | string[] }[] }) => {
      const res = await apiRequest("POST", `/api/public/forms/${publicId}/submit`, payload);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const updateAnswer = useCallback((questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const toggleCheckboxOption = useCallback((questionId: number, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form?.questions) return;

    const errors: Record<number, string> = {};
    for (const q of form.questions) {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
          errors[q.id] = "Ce champ est obligatoire.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      answers: form.questions.map((q) => ({
        questionId: q.id,
        value: answers[q.id] ?? (q.type === "mcq_multiple" ? [] : ""),
      })),
    };

    submitMutation.mutate(payload);
  }, [form, answers, submitMutation]);

  const renderQuestion = (question: FormQuestion) => {
    const error = validationErrors[question.id];
    const options = (question.options as string[]) || [];

    switch (question.type) {
      case "text":
        return (
          <Input
            data-testid={`input-question-${question.id}`}
            placeholder="Votre réponse..."
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
          />
        );

      case "textarea":
        return (
          <Textarea
            data-testid={`textarea-question-${question.id}`}
            placeholder="Votre réponse..."
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case "number":
        return (
          <Input
            data-testid={`input-question-${question.id}`}
            type="number"
            placeholder="0"
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
          />
        );

      case "email":
        return (
          <Input
            data-testid={`input-question-${question.id}`}
            type="email"
            placeholder="exemple@email.com"
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
          />
        );

      case "mcq":
        return (
          <div className="space-y-2">
            {options.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover-elevate"
                data-testid={`radio-question-${question.id}-option-${idx}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => updateAnswer(question.id, option)}
                  className="accent-primary"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case "mcq_multiple":
        return (
          <div className="space-y-2">
            {options.map((option, idx) => {
              const selected = ((answers[question.id] as string[]) || []).includes(option);
              return (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover-elevate"
                  data-testid={`checkbox-question-${question.id}-option-${idx}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCheckboxOption(question.id, option)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case "likert":
        return (
          <div className="space-y-2">
            {options.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover-elevate"
                data-testid={`radio-question-${question.id}-option-${idx}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => updateAnswer(question.id, option)}
                  className="accent-primary"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="flex gap-4">
            {["Oui", "Non"].map((option, idx) => (
              <label
                key={option}
                className="flex items-center gap-2 p-3 rounded-md border cursor-pointer flex-1 justify-center hover-elevate"
                data-testid={`radio-question-${question.id}-option-${idx}`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => updateAnswer(question.id, option)}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <Input
            data-testid={`input-question-${question.id}`}
            placeholder="Votre réponse..."
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <span className="text-lg font-bold text-foreground">Academik</span>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2" data-testid="text-error-title">
                Formulaire introuvable
              </h2>
              <p className="text-muted-foreground" data-testid="text-error-message">
                Ce formulaire n'existe pas ou n'est plus disponible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <span className="text-lg font-bold text-foreground">Academik</span>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2" data-testid="text-success-title">
                Merci pour votre réponse !
              </h2>
              <p className="text-muted-foreground" data-testid="text-success-message">
                Votre réponse a bien été enregistrée.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...(form.questions || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <span className="text-lg font-bold text-foreground">Academik</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-form-title">
              {form.title}
            </CardTitle>
            {form.description && (
              <p className="text-muted-foreground mt-2" data-testid="text-form-description">
                {form.description}
              </p>
            )}
          </CardHeader>
        </Card>

        {sortedQuestions.map((question, index) => (
          <Card key={question.id} data-testid={`card-question-${question.id}`}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  {index + 1}. {question.label}
                  {question.required && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Obligatoire
                    </Badge>
                  )}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
              </div>

              {renderQuestion(question)}

              {validationErrors[question.id] && (
                <p className="text-sm text-destructive flex items-center gap-1" data-testid={`error-question-${question.id}`}>
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors[question.id]}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {sortedQuestions.length > 0 && (
          <div className="flex justify-end">
            <Button
              data-testid="button-submit-form"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Envoyer
            </Button>
          </div>
        )}

        {submitMutation.isError && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-destructive flex items-center gap-2" data-testid="text-submit-error">
                <AlertCircle className="w-4 h-4" />
                Une erreur est survenue lors de l'envoi. Veuillez réessayer.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}