import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface QuotaData {
  id: number;
  userId: string;
  wordsUsed: number;
  wordsLimit: number;
  actionsUsed: number;
  actionsLimit: number;
  activeProjectsLimit: number;
  documentsLimit: number;
  periodStart: string;
  periodEnd: string;
  activeProjects: number;
  surplusOptions: Record<string, { price: number; amount: number; label: string; type: string }>;
}

export function useQuota() {
  return useQuery<QuotaData>({
    queryKey: ["/api/quota"],
  });
}

export function useSurplusPurchase() {
  return useMutation({
    mutationFn: async (surplusKey: string) => {
      const res = await apiRequest("POST", "/api/quota/surplus", { surplusKey });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
      }
    },
  });
}

export function useConfirmSurplus() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", "/api/quota/surplus/confirm", { sessionId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quota"] });
    },
  });
}

export function getQuotaPercentage(used: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(Math.round((used / limit) * 100), 100);
}

export function isQuotaExceeded(used: number, limit: number): boolean {
  return used >= limit;
}
