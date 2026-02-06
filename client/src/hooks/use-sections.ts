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

export function useGenerateEquations() {
  return useMutation({
    mutationFn: async (data: { projectId: number; language: 'fr' | 'en' | 'both'; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateEquations.method, api.sections.generateEquations.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useGenerateConcepts() {
  return useMutation({
    mutationFn: async (data: { projectId: number; sources: any[]; citationNorm: 'apa7' | 'vancouver' | 'mla' | 'chicago'; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateConcepts.method, api.sections.generateConcepts.path, data);
      return res.json() as Promise<{ content: string; bibliography: string }>;
    },
  });
}

export function useSuggestSources() {
  return useMutation({
    mutationFn: async (data: { projectId: number; existingSources: any[]; extraContext?: string }) => {
      const res = await apiRequest(api.sections.suggestSources.method, api.sections.suggestSources.path, data);
      return res.json() as Promise<{ articles: any[] }>;
    },
  });
}

export function useGenerateMethodologyTables() {
  return useMutation({
    mutationFn: async (data: { projectId: number; tableType: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateMethodologyTables.method, api.sections.generateMethodologyTables.path, data);
      return res.json() as Promise<{ rows: Record<string, string>[]; comment: string }>;
    },
  });
}

export function useGenerateQuestionnaire() {
  return useMutation({
    mutationFn: async (data: { projectId: number; config: any; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateQuestionnaire.method, api.sections.generateQuestionnaire.path, data);
      return res.json() as Promise<{ content: string; traceability: string }>;
    },
  });
}

export function useGenerateInterviewGuide() {
  return useMutation({
    mutationFn: async (data: { projectId: number; config: any; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateInterviewGuide.method, api.sections.generateInterviewGuide.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useSimulateResponse() {
  return useMutation({
    mutationFn: async (data: { projectId: number; question: string; intervieweeProfile: string; tone?: string; length?: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.simulateResponse.method, api.sections.simulateResponse.path, data);
      return res.json() as Promise<{ response: string; suggestions?: string[] }>;
    },
  });
}

export function useImproveQuestion() {
  return useMutation({
    mutationFn: async (data: { projectId: number; question: string; improvementType: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.improveQuestion.method, api.sections.improveQuestion.path, data);
      return res.json() as Promise<{ improved: string; explanation: string }>;
    },
  });
}

export function useAnalyzeQualitative() {
  return useMutation({
    mutationFn: async (data: { projectId: number; verbatims: any[]; analysisMode: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.analyzeQualitative.method, api.sections.analyzeQualitative.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useAnalyzeQuantitative() {
  return useMutation({
    mutationFn: async (data: { projectId: number; data: string; analysisType: string; filters?: any; extraContext?: string }) => {
      const res = await apiRequest(api.sections.analyzeQuantitative.method, api.sections.analyzeQuantitative.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useConfrontResults() {
  return useMutation({
    mutationFn: async (data: { projectId: number; results: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.confrontResults.method, api.sections.confrontResults.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useValidateHypotheses() {
  return useMutation({
    mutationFn: async (data: { projectId: number; results: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.validateHypotheses.method, api.sections.validateHypotheses.path, data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useImportDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { projectId: number; content: string; fileName: string }) => {
      const res = await apiRequest(
        api.sections.importDocument.method,
        buildUrl(api.sections.importDocument.path, { projectId: data.projectId }),
        { content: data.content, fileName: data.fileName }
      );
      return res.json() as Promise<{ subject?: string; problematic?: string; hypotheses?: string; summary?: string; fullContent: string }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', variables.projectId, 'documents'] });
    },
  });
}

export function useSimulateBatch() {
  return useMutation({
    mutationFn: async (data: { projectId: number; questions: { question: string; prerequisites?: string }[]; intervieweeProfile: string; tone?: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.simulateBatch.method, api.sections.simulateBatch.path, data);
      return res.json() as Promise<{ responses: { question: string; response: string; suggestions?: string[] }[] }>;
    },
  });
}

export function useAssistWriting() {
  return useMutation({
    mutationFn: async (data: { projectId: number; text: string; mode: string; sectionTarget?: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.assistWriting.method, api.sections.assistWriting.path, data);
      return res.json() as Promise<{ content: string; suggestions?: string[] }>;
    },
  });
}

export function useGenerateBibliographyFull() {
  return useMutation({
    mutationFn: async (data: { projectId: number; norm: 'apa7' | 'vancouver' | 'mla' | 'chicago'; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateBibliographyFull.method, api.sections.generateBibliographyFull.path, data);
      return res.json() as Promise<{ content: string; sources: any[] }>;
    },
  });
}

export function useCheckBibliographyCoherence() {
  return useMutation({
    mutationFn: async (data: { projectId: number; bibliography: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.checkBibliographyCoherence.method, api.sections.checkBibliographyCoherence.path, data);
      return res.json() as Promise<{ alerts: { type: string; message: string }[]; suggestions: string[] }>;
    },
  });
}

export function useExportDocument() {
  return useMutation({
    mutationFn: async (data: { projectId: number; format: string; sections?: string[]; exportType?: string; includeTableOfContents?: boolean; includeBibliography?: boolean; includeAnnexes?: boolean; formatting?: { font: string; fontSize: number; lineSpacing: number } }) => {
      const res = await apiRequest(
        api.sections.exportDocument.method,
        buildUrl(api.sections.exportDocument.path, { projectId: data.projectId }),
        data
      );
      return res.json() as Promise<{ content: string; fileName: string }>;
    },
  });
}

export function useGenerateSoutenancePPT() {
  return useMutation({
    mutationFn: async (data: { projectId: number; slideCount?: number; theme?: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateSoutenancePPT.method, api.sections.generateSoutenancePPT.path, data);
      return res.json() as Promise<{ slides: { title: string; content: string; notes?: string }[] }>;
    },
  });
}

export function useGenerateJuryQuestions() {
  return useMutation({
    mutationFn: async (data: { projectId: number; juryType?: string; questionCount?: number; extraContext?: string }) => {
      const res = await apiRequest(api.sections.generateJuryQuestions.method, api.sections.generateJuryQuestions.path, data);
      return res.json() as Promise<{ questions: { category: string; question: string; suggestedAnswer: string; difficulty: string }[]; weakPoints: string[] }>;
    },
  });
}

export function useAuditMemoire() {
  return useMutation({
    mutationFn: async (data: { projectId: number; memoireContent: string; guideContent?: string; tutorInstructions?: string; extraContext?: string }) => {
      const res = await apiRequest(api.sections.auditMemoire.method, api.sections.auditMemoire.path, data);
      return res.json() as Promise<{
        structural: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
        methodological: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
        theoretical: { strengths: string[]; weaknesses: string[]; recommendations: string[] };
        priorities: string[];
        score?: number;
      }>;
    },
  });
}
