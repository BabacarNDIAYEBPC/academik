import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDocument } from "@shared/routes";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

export function useDocuments(projectId: number) {
  return useQuery({
    queryKey: [api.documents.list.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.documents.list.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...data }: { projectId: number } & Omit<InsertDocument, "projectId">) => {
      const url = buildUrl(api.documents.create.path, { projectId });
      const res = await apiRequest(
        api.documents.create.method,
        url,
        data
      );
      return res.json();
    },
    onSuccess: (_, variables) => {
      const url = buildUrl(api.documents.list.path, { projectId: variables.projectId });
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path, variables.projectId] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: number; projectId: number }) => {
      const url = buildUrl(api.documents.delete.path, { id });
      await apiRequest(api.documents.delete.method, url);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.documents.list.path, variables.projectId] });
    },
  });
}
