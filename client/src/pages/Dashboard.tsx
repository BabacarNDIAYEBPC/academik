import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Plus, MoreVertical, Trash2, FolderOpen, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: deleteProject } = useDeleteProject();
  const { t } = useI18n();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memoire': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'memoire_professionnel': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'tfe': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'vae': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'etude_de_cas': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatType = (type: string) => {
    const key = `projectTypes.${type}` as any;
    const translated = t(key);
    if (translated !== key) return translated;
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <Layout>
      <SEO titleKey="seo.dashboardTitle" descriptionKey="seo.dashboardDescription" canonicalPath="/dashboard" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <Link href="/projects/new">
          <Button size="lg" className="shadow-lg shadow-primary/20" data-testid="button-new-project">
            <Plus className="mr-2 w-5 h-5" />
            {t("dashboard.newProject")}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300" data-testid={`card-project-${project.id}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <Badge variant="secondary" className={`font-medium ${getTypeColor(project.type)}`}>
                  {formatType(project.type)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-menu-${project.id}`}>
                      <span className="sr-only">{t("dashboard.openMenu")}</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm(t("dashboard.confirmDelete"))) deleteProject(project.id);
                      }}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("dashboard.deleteProject")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${project.id}`} className="block">
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors cursor-pointer" data-testid={`text-project-name-${project.id}`}>
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.approach ? `${t(`approaches.${project.approach}` as any)} ${t("dashboard.approach")}` : t("dashboard.noApproach")} 
                    {project.finality ? ` • ${t(`finalities.${project.finality}` as any)}` : ''}
                  </p>
                </Link>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t("dashboard.updated")} {format(new Date(project.updatedAt || new Date()), 'MMM d, yyyy')}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 hover:text-primary" data-testid={`button-open-${project.id}`}>
                    {t("dashboard.open")} <FolderOpen className="w-3 h-3" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-card" data-testid="empty-state">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("dashboard.noProjects")}</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t("dashboard.noProjectsDesc")}
          </p>
          <Link href="/projects/new">
            <Button data-testid="button-create-first">{t("dashboard.createProject")}</Button>
          </Link>
        </div>
      )}
    </Layout>
  );
}
