import Layout from "@/components/Layout";
import { useProjects, useDeleteProject } from "@/hooks/use-projects";
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memoire': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'tfe': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'vae': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your academic projects and research.</p>
        </div>
        <Link href="/projects/new">
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 w-5 h-5" />
            New Project
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
            <Card key={project.id} className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <Badge variant="secondary" className={`font-medium ${getTypeColor(project.type)}`}>
                  {formatType(project.type)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('Are you sure you want to delete this project?')) deleteProject(project.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <Link href={`/projects/${project.id}`} className="block">
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors cursor-pointer">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.approach ? `${project.approach} approach` : 'No specific approach defined yet.'} 
                    {project.finality ? ` • ${project.finality}` : ''}
                  </p>
                </Link>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  updated {format(new Date(project.updatedAt || new Date()), 'MMM d, yyyy')}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 hover:text-primary">
                    Open <FolderOpen className="w-3 h-3" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by creating your first academic project. We'll help you structure it.
          </p>
          <Link href="/projects/new">
            <Button>Create Project</Button>
          </Link>
        </div>
      )}
    </Layout>
  );
}
