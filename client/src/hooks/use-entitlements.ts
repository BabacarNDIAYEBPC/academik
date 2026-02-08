import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useModuleVisibility } from "@/hooks/use-admin";

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
  construction_sujet: "foundation",
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
  rs_cover_page: "rs_foundation",
  rs_acknowledgements: "rs_foundation",
  rs_introduction: "rs_foundation",
  rs_company: "rs_foundation",
  rs_internship: "rs_foundation",
  rs_missions: "rs_foundation",
  rs_analysis: "rs_foundation",
  rs_contributions: "rs_foundation",
  rs_conclusion: "rs_foundation",
  mp_structure: "foundation",
  mp_emergence: "foundation",
  cs_fiche: "foundation",
  cs_contexte: "foundation",
  cs_probleme: "foundation",
  cs_cadre: "foundation",
  cs_donnees: "foundation",
  cs_options: "foundation",
  cs_recommandation: "foundation",
  cs_conclusion: "foundation",
  vae_presentation: "vae_foundation",
  vae_parcours: "vae_foundation",
  vae_motivation: "vae_foundation",
  vae_cartographie: "vae_foundation",
  vae_bloc_demo: "vae_foundation",
  vae_synthese: "vae_foundation",
};

export function isSectionLocked(entitlements: string[] | undefined, sectionKey: string, moduleVisibility?: Record<string, boolean>, isAdmin?: boolean): boolean {
  if (isAdmin) return false;
  const requirement = SECTION_TO_ENTITLEMENT[sectionKey];
  if (!requirement) return false;
  const keys = Array.isArray(requirement) ? requirement : [requirement];
  if (moduleVisibility && Object.keys(moduleVisibility).length > 0) {
    const allFree = keys.every(k => moduleVisibility[k] === false);
    if (allFree) return false;
  }
  return !keys.some(key => hasEntitlement(entitlements, key));
}

export function useHasAnyAccess() {
  const { data: entData } = useEntitlements();
  const { data: moduleVis } = useModuleVisibility();

  const hasAccess = (() => {
    if (entData?.entitlements && entData.entitlements.length > 0) return true;
    if (moduleVis && Object.values(moduleVis).some(v => v === false)) return true;
    return false;
  })();

  return hasAccess;
}

export function getSectionEntitlementKey(sectionKey: string): string | string[] | undefined {
  return SECTION_TO_ENTITLEMENT[sectionKey];
}
