import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAdminCheck() {
  return useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    retry: false,
  });
}

export function useAdminUsers(search?: string) {
  const queryKey = search ? ["/api/admin/users", `?search=${encodeURIComponent(search)}`] : ["/api/admin/users"];
  return useQuery<any[]>({
    queryKey: ["/api/admin/users", search || ""],
    queryFn: async () => {
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : "/api/admin/users";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });
}

export function useAdminUser(userId: string) {
  return useQuery<any>({
    queryKey: ["/api/admin/users", userId],
  });
}

export function useAddCredits() {
  return useMutation({
    mutationFn: async ({ userId, words, actions }: { userId: string; words: number; actions: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/credits`, { words, actions });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
}

export function useUpdateUserQuota() {
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/quota`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });
}

export function useAdminPlans() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/plans"],
  });
}

export function useCreatePlan() {
  return useMutation({
    mutationFn: async (plan: any) => {
      const res = await apiRequest("POST", "/api/admin/plans", plan);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
    },
  });
}

export function useUpdatePlan() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/plans/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
    },
  });
}

export function useDeletePlan() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
    },
  });
}

export function useAdminSettings() {
  return useQuery<any>({
    queryKey: ["/api/admin/settings"],
  });
}

export function useUpdateAdminSetting() {
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await apiRequest("POST", "/api/admin/settings", { key, value });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
  });
}

export function useAuditLogs(limit = 100) {
  return useQuery<any[]>({
    queryKey: ["/api/admin/audit-logs", `?limit=${limit}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useAiLogs(limit = 100) {
  return useQuery<any[]>({
    queryKey: ["/api/admin/ai-logs", `?limit=${limit}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/ai-logs?limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useAiLogStats() {
  return useQuery<{ totalRequests: number; totalErrors: number; avgDuration: number }>({
    queryKey: ["/api/admin/ai-logs/stats"],
  });
}

export function useAdminPayments() {
  return useQuery<{ purchases: any[]; surplus: any[] }>({
    queryKey: ["/api/admin/payments"],
  });
}
