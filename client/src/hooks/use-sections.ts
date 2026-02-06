import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";
import type { ProjectSection, SectionVersion, SectionGenerateRequest } from "@shared/schema";

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
