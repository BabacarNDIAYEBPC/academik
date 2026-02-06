import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GenerateRequest } from "@shared/routes";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

export function useGenerations(projectId: number) {
  return useQuery({
    queryKey: [api.ai.listGenerations.path, projectId],
    queryFn: async () => {
      const url = buildUrl(api.ai.listGenerations.path, { projectId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch generations");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useGenerateAI() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: GenerateRequest) => {
      const res = await apiRequest(
        api.ai.generate.method,
        api.ai.generate.path,
        data
      );
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.ai.listGenerations.path, variables.projectId] });
    },
  });
}
