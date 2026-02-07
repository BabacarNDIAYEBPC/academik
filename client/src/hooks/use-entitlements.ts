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

export const SECTION_TO_ENTITLEMENT: Record<string, string | string[]> = {
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
  questionnaire: "questionnaire",
  guide_entretien: "guide_entretien",
  interview_simulation: "simulation_entretien",
  data_analysis: "data_visualization",
  financial_simulation: "financial_simulation",
  questionnaire_analysis: "questionnaire_analysis",
  assisted_writing: "redaction",
  bibliography: "biblio_multinormes",
  exports: "export_illimite",
  soutenance_ppt: "soutenance_ppt",
  soutenance_simulation: "soutenance_simulation",
  memoire_audit: "audit",
};

export function isSectionLocked(entitlements: string[] | undefined, sectionKey: string): boolean {
  const requirement = SECTION_TO_ENTITLEMENT[sectionKey];
  if (!requirement) return false;
  if (Array.isArray(requirement)) {
    return !requirement.some(key => hasEntitlement(entitlements, key));
  }
  return !hasEntitlement(entitlements, requirement);
}

export function getSectionEntitlementKey(sectionKey: string): string | string[] | undefined {
  return SECTION_TO_ENTITLEMENT[sectionKey];
}
