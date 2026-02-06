import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Settings2 } from "lucide-react";

const VARIABLE_LABELS: Record<string, string> = {
  subject: "Sujet",
  problematic: "Problématique",
  hypotheses: "Hypothèses",
  domain: "Domaine",
  formation: "Formation / Discipline",
};

const VARIABLE_KEYS = ["subject", "problematic", "hypotheses", "domain", "formation"];

interface VariablesPanelProps {
  variables: Record<string, string | undefined>;
  onVariablesChange?: (variables: Record<string, string | undefined>) => void;
  readOnly?: boolean;
}

export default function VariablesPanel({ variables, onVariablesChange, readOnly = true }: VariablesPanelProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (key: string, value: string) => {
    if (onVariablesChange) {
      onVariablesChange({ ...variables, [key]: value });
    }
  };

  const activeVars = VARIABLE_KEYS.filter(k => variables[k]);

  return (
    <Card className="border-dashed" data-testid="panel-variables-harmonized">
      <CardHeader className="py-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <CardTitle className="text-sm">Variables du projet</CardTitle>
          {!open && activeVars.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto mr-2">
              {activeVars.length} variable{activeVars.length > 1 ? "s" : ""} renseignée{activeVars.length > 1 ? "s" : ""}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 ml-auto text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-3 pt-0">
          <p className="text-xs text-muted-foreground">
            Pré-remplies depuis le paramétrage du projet. {!readOnly ? "Modifiez-les pour ajuster la génération IA." : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VARIABLE_KEYS.map(key => {
              const isTextArea = ["subject", "problematic", "hypotheses"].includes(key);
              const value = variables[key] || "";
              return (
                <div key={key} className={`space-y-1 ${isTextArea ? "md:col-span-2" : ""}`}>
                  <Label className="text-xs font-medium text-muted-foreground">
                    {VARIABLE_LABELS[key] || key}
                  </Label>
                  {isTextArea ? (
                    <Textarea
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="resize-none text-sm h-16"
                      readOnly={readOnly}
                      data-testid={`var-${key}`}
                    />
                  ) : (
                    <Input
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="text-sm"
                      readOnly={readOnly}
                      data-testid={`var-${key}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
