import { z } from 'zod';
import { insertProjectSchema, insertProfileSchema, insertDocumentSchema, projects, profiles, documents, aiGenerations } from './schema';
export type { GenerateRequest, CreateProjectRequest, UpdateProjectRequest, CreateProfileRequest } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Profiles
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/me',
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: errorSchemas.notFound, // If not created yet
        401: errorSchemas.unauthorized,
      },
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },

  // Projects
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/projects/:id',
      input: insertProjectSchema.partial(),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Documents
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/documents',
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/documents',
      input: insertDocumentSchema.omit({ projectId: true }), // projectId from URL
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // AI Generation
  ai: {
    generate: {
      method: 'POST' as const,
      path: '/api/ai/generate',
      input: z.object({
        projectId: z.number(),
        type: z.enum(['subject', 'problematic', 'hypotheses', 'analysis', 'vae_competencies']),
        context: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof aiGenerations.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    listGenerations: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/generations',
      responses: {
        200: z.array(z.custom<typeof aiGenerations.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    }
  }
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
