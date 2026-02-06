import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateProfileRequest } from "@shared/routes";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

export function useProfile() {
  return useQuery({
    queryKey: [api.profiles.get.path],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProfileRequest) => {
      const res = await apiRequest(
        api.profiles.upsert.method,
        api.profiles.upsert.path,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.get.path] });
    },
  });
}
