import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface LiteratureArticle {
  lastName: string;
  firstName: string;
  title: string;
  year: string;
  publisher: string;
  platform: string;
  url: string;
  type?: string;
}

export interface LiteratureConfig {
  query: string;
  domain: string;
  platforms: string[];
  language: string;
  periodStart: string;
  periodEnd: string;
  level: string;
  sourceTypes: string[];
  articleCount: number;
  norm: string;
  accessType: "all" | "open_access" | "paid";
  openAccessProportion: number;
}

export const DEFAULT_CONFIG: LiteratureConfig = {
  query: "",
  domain: "",
  platforms: ["google_scholar", "pubmed", "hal", "cairn", "sciencedirect"],
  language: "fr",
  periodStart: "2015",
  periodEnd: String(new Date().getFullYear()),
  level: "academic",
  sourceTypes: ["scientific_articles"],
  articleCount: 10,
  norm: "apa7",
  accessType: "all",
  openAccessProportion: 50,
};

export function useSearchArticles() {
  return useMutation({
    mutationFn: async (config: LiteratureConfig) => {
      const res = await apiRequest("POST", "/api/literature/search", config);
      return res.json() as Promise<{ articles: LiteratureArticle[] }>;
    },
  });
}

export function useAnalyzeArticles() {
  return useMutation({
    mutationFn: async (data: { articles: any[]; analysisType: string; query?: string }) => {
      const res = await apiRequest("POST", "/api/literature/analyze", data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useGenerateBibliography() {
  return useMutation({
    mutationFn: async (data: { articles: any[]; norm: string }) => {
      const res = await apiRequest("POST", "/api/literature/bibliography", data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useGenerateEquations() {
  return useMutation({
    mutationFn: async (data: { query: string; domain: string; language: string }) => {
      const res = await apiRequest("POST", "/api/literature/equations", data);
      return res.json() as Promise<{ content: string }>;
    },
  });
}

export function useCredits() {
  return useQuery<{ credits: number }>({
    queryKey: ["/api/credits"],
  });
}

export function useBibliographies() {
  return useQuery({
    queryKey: ["/api/bibliographies"],
  });
}

export function useSaveBibliography() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bibliographies", data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bibliographies"] }),
  });
}

export function useUpdateBibliography() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const res = await apiRequest("PATCH", `/api/bibliographies/${id}`, data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bibliographies"] }),
  });
}

export function useDeleteBibliography() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/bibliographies/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bibliographies"] }),
  });
}
