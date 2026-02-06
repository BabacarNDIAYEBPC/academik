import Layout from "@/components/Layout";
import { useRoute } from "wouter";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useDocuments, useCreateDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useGenerations, useGenerateAI } from "@/hooks/use-ai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Sparkles, 
  Settings, 
  Download, 
  Trash2, 
  Plus, 
  File,
  Loader2,
  Bot
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const projectId = parseInt(params?.id || "0");
  const { data: project, isLoading } = useProject(projectId);
  const { toast } = useToast();

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

  if (!project) return <Layout><div>Project not found</div></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="uppercase tracking-wider text-xs font-semibold">
            {project.type}
          </Badge>
          <span className="text-muted-foreground text-sm">•</span>
          <span className="text-muted-foreground text-sm">{project.language}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{project.name}</h1>
      </div>

      <Tabs defaultValue="assistant" className="space-y-8">
        <TabsList className="bg-background/50 border border-border p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-6 rounded-lg transition-all">
            Overview
          </TabsTrigger>
          <TabsTrigger value="assistant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-6 rounded-lg transition-all gap-2">
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5 px-6 rounded-lg transition-all">
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <OverviewTab project={project} />
        </TabsContent>

        <TabsContent value="assistant" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AssistantTab project={project} />
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <DocumentsTab project={project} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function OverviewTab({ project }: { project: any }) {
  const { mutate: updateProject } = useUpdateProject();
  const [approach, setApproach] = useState(project.approach || "");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Project Context</CardTitle>
          <CardDescription>Define the core parameters of your research.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Research Approach</label>
            <Textarea 
              placeholder="e.g. Theoretical analysis mixed with qualitative interviews..."
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => updateProject({ id: project.id, approach })}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Created</span>
              <span className="font-medium text-sm">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Status</span>
              <Badge>{project.status}</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground text-sm">Language</span>
              <span className="font-medium text-sm">{project.language}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssistantTab({ project }: { project: any }) {
  const { data: generations, isLoading } = useGenerations(project.id);
  const { mutate: generate, isPending } = useGenerateAI();
  const [context, setContext] = useState("");

  const handleGenerate = (type: string) => {
    generate({
      projectId: project.id,
      type: type as any,
      context,
    });
  };

  const getActions = () => {
    switch(project.type) {
      case 'memoire':
        return [
          { label: 'Generate Subject & Problematic', type: 'problematic', icon: Bot },
          { label: 'Generate Hypotheses', type: 'hypotheses', icon: Sparkles }
        ];
      case 'tfe':
        return [
          { label: 'Analyze Context', type: 'analysis', icon: Bot },
          { label: 'Generate Question', type: 'problematic', icon: Sparkles }
        ];
      case 'vae':
        return [
          { label: 'Analyze Competencies', type: 'vae_competencies', icon: Bot },
        ];
      default:
        return [
          { label: 'Generate Analysis', type: 'analysis', icon: Bot },
        ];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar / Controls */}
      <div className="space-y-6">
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Context / Specific Instructions</label>
              <Textarea 
                placeholder="Add specific details, constraints, or context here..."
                className="resize-none h-32 text-sm"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 pt-2">
              {getActions().map((action) => (
                <Button 
                  key={action.type}
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => handleGenerate(action.type)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4 text-primary" />}
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Feed */}
      <div className="lg:col-span-2 space-y-6">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : generations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-border rounded-xl">
            <Sparkles className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No AI generations yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Use the tools on the left to start.</p>
          </div>
        ) : (
          <div className="space-y-6">
             {/* Show pending state at top if generating */}
             {isPending && (
                <Card className="border-primary/50 shadow-lg animate-pulse">
                  <CardContent className="p-8 flex items-center justify-center text-primary gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-medium">AI is thinking... this may take a moment</span>
                  </CardContent>
                </Card>
             )}

             {generations?.slice().reverse().map((gen: any) => (
               <Card key={gen.id} className="overflow-hidden border-border shadow-sm">
                 <div className="bg-muted/30 px-6 py-3 border-b border-border flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <Badge variant="outline" className="bg-background">{gen.type}</Badge>
                     <span className="text-xs text-muted-foreground">{new Date(gen.createdAt).toLocaleString()}</span>
                   </div>
                   <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                     <Download className="w-3 h-3" />
                   </Button>
                 </div>
                 <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none font-serif">
                   <ReactMarkdown>
                      {typeof gen.data === 'string' ? gen.data : JSON.stringify(gen.data, null, 2)}
                   </ReactMarkdown>
                 </CardContent>
               </Card>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({ project }: { project: any }) {
  const { data: documents, isLoading } = useDocuments(project.id);
  const { mutate: createDoc } = useCreateDocument();
  const { mutate: deleteDoc } = useDeleteDocument();
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("guide");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    createDoc({
      projectId: project.id,
      name: newDocName,
      type: newDocType,
      content: "", // Content would ideally come from upload or editor
    });
    setIsDialogOpen(false);
    setNewDocName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Project Files</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 w-4 h-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="e.g. Research Guide" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                >
                  <option value="guide">Guide</option>
                  <option value="consignes">Consignes</option>
                  <option value="cv">CV</option>
                  <option value="referentiel">Référentiel</option>
                  <option value="situation_appel">Situation d'appel</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : documents?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <File className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{doc.name}</h4>
                  <p className="text-xs text-muted-foreground uppercase mt-1">{doc.type}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteDoc({ id: doc.id, projectId: project.id })}
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
