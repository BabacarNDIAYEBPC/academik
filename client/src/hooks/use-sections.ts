import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { ProjectSection, SectionVersion, SectionGenerateRequest, StatusHistory } from "@shared/schema";

export function useSections(projectId: number) {
  return useQuery<ProjectSection[]>({
    queryKey: [api.sections.list.path, projectId],
    queryFn: async () => {
      const res = await fetch(buildUrl(api.sections.list.path, { projectId }));
      if (!res.ok) throw new Error("Failed to load sections");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useSectionVersions(sectionId: number | undefined) {
  return useQuery<SectionVersion[]>({
    queryKey: [api.sections.versions.path, sectionId],
    queryFn: async () => {
      const res = await fetch(buildUrl(api.sections.versions.path, { id: sectionId! }));
      if (!res.ok) throw new Error("Failed to load versions");
      return res.json();
    },
    enabled: !!sectionId,
  });
}

export function useGenerateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SectionGenerateRequest) => {
      const res = await apiRequest(api.sections.generate.method, api.sections.generate.path, data);
      return res.json() as Promise<{ section: ProjectSection; version: SectionVersion }>;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
      if (data.section?.id) {
        queryClient.invalidateQueries({ queryKey: [api.sections.versions.path, data.section.id] });
      }
    },
  });
}

export function useSaveManual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, content, projectId }: { sectionId: number; content: string; projectId: number }) => {
      const res = await apiRequest(api.sections.saveManual.method, buildUrl(api.sections.saveManual.path, { id: sectionId }), { content });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.sections.versions.path, variables.sectionId] });
    },
  });
}

export function useValidateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, projectId }: { sectionId: number; projectId: number }) => {
      const res = await apiRequest(api.sections.validate.method, buildUrl(api.sections.validate.path, { id: sectionId }));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
    },
  });
}

export function useUnvalidateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, projectId }: { sectionId: number; projectId: number }) => {
      const res = await apiRequest(api.sections.unvalidate.method, buildUrl(api.sections.unvalidate.path, { id: sectionId }));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
    },
  });
}

export function useUpdateSectionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, status, note, projectId }: { sectionId: number; status: string; note?: string; projectId: number }) => {
      const res = await apiRequest(api.sections.updateStatus.method, buildUrl(api.sections.updateStatus.path, { id: sectionId }), { status, note });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.sections.statusHistory.path, variables.sectionId] });
    },
  });
}

export function useStatusHistory(sectionId: number | undefined) {
  return useQuery<StatusHistory[]>({
    queryKey: [api.sections.statusHistory.path, sectionId],
    queryFn: async () => {
      const res = await fetch(buildUrl(api.sections.statusHistory.path, { id: sectionId! }));
      if (!res.ok) throw new Error("Failed to load status history");
      return res.json();
    },
    enabled: !!sectionId,
  });
}

export function useActivateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, versionId, projectId }: { sectionId: number; versionId: number; projectId: number }) => {
      const res = await apiRequest(api.sections.activateVersion.method, buildUrl(api.sections.activateVersion.path, { id: sectionId, versionId }));
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [api.sections.versions.path, variables.sectionId] });
    },
  });
}

export function useValidatedContents(projectId: number) {
  return useQuery<Record<string, string>>({
    queryKey: [api.sections.validatedContents.path, projectId],
    queryFn: async () => {
      const res = await fetch(buildUrl(api.sections.validatedContents.path, { projectId }));
      if (!res.ok) throw new Error("Failed to load validated contents");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useSaveSectionConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, config, projectId }: { sectionId: number; config: Record<string, any>; projectId: number }) => {
      const res = await apiRequest(api.sections.updateConfig.method, buildUrl(api.sections.updateConfig.path, { id: sectionId }), { config });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
    },
  });
}

export function useSearchArticles() {
  return useMutation({
    mutationFn: async (data: { projectId: number; config: Record<string, any>; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateArticles.method, api.sections.generateArticles.path, data);
      return res.json() as Promise<{ articles: any[] }>;
    },
  });
}

export function useAnalyzeArticles() {
  return useMutation({
    mutationFn: async (data: { projectId: number; articles: any[]; analysisType: 'single' | 'multiple' | 'confrontation' | 'mapping'; extraContext?: string }) => {
      const res = await apiRequest(api.sections.analyzeArticles.method, api.sections.analyzeArticles.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useGenerateBibliography() {
  return useMutation({
    mutationFn: async (data: { projectId: number; articles: any[]; norm: 'apa7' | 'vancouver' | 'mla' | 'chicago' }) => {
      const res = await apiRequest(api.sections.generateBibliography.method, api.sections.generateBibliography.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useGenerateCombined() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { projectId: number; combo: 'subject_problematic' | 'subject_problematic_hypotheses'; mode: 'initial' | 'similar' | 'different'; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateCombined.method, api.sections.generateCombined.path, data);
      return res.json() as Promise<{ results: Record<string, { section: ProjectSection; version: SectionVersion }> }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.sections.list.path, variables.projectId] });
    },
  });
}

export function useGenerateDiagram() {
  return useMutation({
    mutationFn: async (data: { projectId: number; diagramType: string; articles?: { title: string; authors: string; year: string }[]; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateDiagram.method, api.sections.generateDiagram.path, data);
      return res.json() as Promise<{ mermaidCode: string; title: string }>;
    },
  });
}
