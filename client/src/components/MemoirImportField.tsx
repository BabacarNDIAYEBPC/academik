import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, FileText } from "lucide-react";

interface MemoirImportFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MemoirImportField({ value, onChange }: MemoirImportFieldProps) {
  const { toast } = useToast();

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.csv,.bib,.md,.rtf";
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const labeled = `--- ${file.name} ---\n${text}`;
        onChange(value ? `${value}\n\n${labeled}` : labeled);
        toast({ title: "Fichier import\u00e9", description: `"${file.name}" import\u00e9 avec succ\u00e8s.` });
      } catch {
        toast({ title: "Erreur d'import", description: "Impossible de lire le fichier.", variant: "destructive" });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-2 rounded-md border border-dashed p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Importer un fichier m\u00e9moire (\u00e9tat d'avancement)</Label>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleImport} data-testid="button-import-memoir">
            <Upload className="w-4 h-4 mr-1" />Importer
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                toast({ title: "Import supprim\u00e9" });
              }}
              data-testid="button-clear-memoir"
            >
              <Trash2 className="w-4 h-4 mr-1" />Effacer
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Si vous utilisez ce module ind\u00e9pendamment, importez votre m\u00e9moire en cours pour que l'IA r\u00e9cup\u00e8re les donn\u00e9es et s'adapte \u00e0 votre contexte.
      </p>
      {value && (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-h-[120px] text-xs font-mono"
          placeholder="Contenu du m\u00e9moire import\u00e9..."
          data-testid="textarea-imported-memoir"
        />
      )}
    </div>
  );
}
