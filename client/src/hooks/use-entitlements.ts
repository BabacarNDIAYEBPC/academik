import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useEntitlements() {
  return useQuery<{ entitlements: string[] }>({
    queryKey: ["/api/entitlements"],
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (data: { items?: string[]; pack?: string }) => {
      const res = await apiRequest("POST", "/api/checkout", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/entitlements"] });
      }
    },
  });
}

export function useConfirmPayment() {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", "/api/checkout/confirm", { sessionId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entitlements"] });
    },
  });
}

export function hasEntitlement(entitlements: string[] | undefined, key: string): boolean {
  if (!entitlements) return false;
  return entitlements.includes(key);
}

export const SECTION_TO_ENTITLEMENT: Record<string, string> = {
  subject: "foundation",
  problematic: "foundation",
  hypotheses: "foundation",
  situation_appel: "foundation",
  vae_competencies: "foundation",
  plan: "plan",
  conceptual_framework: "conceptual",
  theoretical_framework: "conceptual",
  literature_review: "literature",
  methodology: "methodology",
  soutenance_ppt: "soutenance_ppt",
  soutenance_simulation: "soutenance_simulation",
  memoire_audit: "audit",
};
