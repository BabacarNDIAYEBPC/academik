import { z } from 'zod';
import { insertProjectSchema, insertProfileSchema, insertDocumentSchema, projects, profiles, documents, aiGenerations, projectSections, sectionVersions, sectionStatusHistory } from './schema';
export type { GenerateRequest, CreateProjectRequest, UpdateProjectRequest, CreateProfileRequest, SectionGenerateRequest } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/me',
      responses: { 200: z.custom<typeof profiles.$inferSelect>(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema,
      responses: { 200: z.custom<typeof profiles.$inferSelect>(), 401: errorSchemas.unauthorized, 400: errorSchemas.validation },
    },
  },

  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: { 200: z.array(z.custom<typeof projects.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: { 200: z.custom<typeof projects.$inferSelect>(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: { 201: z.custom<typeof projects.$inferSelect>(), 401: errorSchemas.unauthorized, 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial(),
      responses: { 200: z.custom<typeof projects.$inferSelect>(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized, 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: { 204: z.void(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
  },

  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/documents',
      responses: { 200: z.array(z.custom<typeof documents.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/documents',
      input: insertDocumentSchema.omit({ projectId: true }),
      responses: { 201: z.custom<typeof documents.$inferSelect>(), 401: errorSchemas.unauthorized, 400: errorSchemas.validation },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: { 204: z.void(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
  },

  ai: {
    generate: {
      method: 'POST' as const,
      path: '/api/ai/generate',
      input: z.object({
        projectId: z.number(),
        type: z.enum(['subject', 'problematic', 'hypotheses', 'analysis', 'vae_competencies']),
        context: z.string().optional(),
      }),
      responses: { 200: z.custom<typeof aiGenerations.$inferSelect>(), 401: errorSchemas.unauthorized, 400: errorSchemas.validation, 500: errorSchemas.internal },
    },
    listGenerations: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/generations',
      responses: { 200: z.array(z.custom<typeof aiGenerations.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
  },

  sections: {
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/sections',
      responses: { 200: z.array(z.custom<typeof projectSections.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sections/:id',
      responses: { 200: z.custom<typeof projectSections.$inferSelect>(), 404: errorSchemas.notFound, 401: errorSchemas.unauthorized },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/sections/generate',
      input: z.object({
        projectId: z.number(),
        sectionKey: z.string(),
        mode: z.enum(['initial', 'similar', 'different']),
        extraContext: z.string().optional(),
        config: z.record(z.any()).optional(),
      }),
      responses: { 200: z.object({ section: z.custom<typeof projectSections.$inferSelect>(), version: z.custom<typeof sectionVersions.$inferSelect>() }), 401: errorSchemas.unauthorized, 500: errorSchemas.internal },
    },
    saveManual: {
      method: 'POST' as const,
      path: '/api/sections/:id/save',
      input: z.object({ content: z.string() }),
      responses: { 200: z.custom<typeof sectionVersions.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    validate: {
      method: 'POST' as const,
      path: '/api/sections/:id/validate',
      responses: { 200: z.custom<typeof projectSections.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    unvalidate: {
      method: 'POST' as const,
      path: '/api/sections/:id/unvalidate',
      responses: { 200: z.custom<typeof projectSections.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    versions: {
      method: 'GET' as const,
      path: '/api/sections/:id/versions',
      responses: { 200: z.array(z.custom<typeof sectionVersions.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
    activateVersion: {
      method: 'POST' as const,
      path: '/api/sections/:id/activate/:versionId',
      responses: { 200: z.object({ success: z.boolean() }), 401: errorSchemas.unauthorized },
    },
    exportContents: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/sections/export',
      responses: { 200: z.array(z.object({ key: z.string(), label: z.string(), content: z.string() })), 401: errorSchemas.unauthorized },
    },
    updateStatus: {
      method: 'POST' as const,
      path: '/api/sections/:id/status',
      input: z.object({ status: z.string(), note: z.string().optional() }),
      responses: { 200: z.custom<typeof projectSections.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    statusHistory: {
      method: 'GET' as const,
      path: '/api/sections/:id/status-history',
      responses: { 200: z.array(z.custom<typeof sectionStatusHistory.$inferSelect>()), 401: errorSchemas.unauthorized },
    },
    validatedContents: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/sections/validated-contents',
      responses: { 200: z.record(z.string(), z.string()), 401: errorSchemas.unauthorized },
    },
    analyzeArticles: {
      method: 'POST' as const,
      path: '/api/sections/literature/analyze',
      input: z.object({
        projectId: z.number(),
        articles: z.array(z.object({
          title: z.string(),
          authors: z.string(),
          year: z.string(),
          source: z.string().optional(),
          platform: z.string().optional(),
          url: z.string().optional(),
        })),
        analysisType: z.enum(['single', 'multiple', 'confrontation', 'mapping']),
        extraContext: z.string().optional(),
      }),
      responses: { 200: z.object({ content: z.string() }), 401: errorSchemas.unauthorized, 500: errorSchemas.internal },
    },
    generateArticles: {
      method: 'POST' as const,
      path: '/api/sections/literature/search',
      input: z.object({
        projectId: z.number(),
        config: z.record(z.any()),
        extraContext: z.string().optional(),
      }),
      responses: { 200: z.object({ articles: z.array(z.any()) }), 401: errorSchemas.unauthorized, 500: errorSchemas.internal },
    },
    generateBibliography: {
      method: 'POST' as const,
      path: '/api/sections/literature/bibliography',
      input: z.object({
        projectId: z.number(),
        articles: z.array(z.any()),
        norm: z.enum(['apa7', 'vancouver', 'mla', 'chicago']),
      }),
      responses: { 200: z.object({ content: z.string() }), 401: errorSchemas.unauthorized, 500: errorSchemas.internal },
    },
    generateCombined: {
      method: 'POST' as const,
      path: '/api/sections/generate-combined',
      input: z.object({
        projectId: z.number(),
        combo: z.enum(['subject_problematic', 'subject_problematic_hypotheses']),
        mode: z.enum(['initial', 'similar', 'different']),
        extraContext: z.string().optional(),
      }),
      responses: {
        200: z.object({
          results: z.record(z.string(), z.object({
            section: z.custom<typeof projectSections.$inferSelect>(),
            version: z.custom<typeof sectionVersions.$inferSelect>(),
          })),
        }),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal,
      },
    },
    updateConfig: {
      method: 'POST' as const,
      path: '/api/sections/:id/config',
      input: z.object({ config: z.record(z.any()) }),
      responses: { 200: z.custom<typeof projectSections.$inferSelect>(), 401: errorSchemas.unauthorized },
    },
    generateEquations: {
      method: 'POST' as const,
      path: '/api/sections/literature/equations',
      input: z.object({
        projectId: z.number(),
        language: z.enum(['fr', 'en', 'both']).default('both'),
        extraContext: z.string().optional(),
      }),
      responses: { 200: z.object({ content: z.string() }), 401: errorSchemas.unauthorized, 500: errorSchemas.internal },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
