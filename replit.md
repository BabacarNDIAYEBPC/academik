# Academic Writing Assistant

## Overview
AI-powered academic writing assistant that helps students and professionals structure, analyze, and write academic papers (Mémoire, TFE, VAE, Rapport de Stage).

## Architecture
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **AI**: OpenAI (via Replit AI Integrations or user's own API key)
- **Auth**: Replit Auth (OIDC)

## Key Features
- **Module 2 - Project Setup**: Full academic context (domain, degree, profile, orientation)
- **Module 3 - AI Generation**: Type-specific generation (Mémoire, TFE, VAE, Rapport de Stage)
- **Documents**: Text-based document storage for AI analysis context
- **Settings**: Optional personal OpenAI API key configuration

## Project Structure
```
client/src/
  pages/
    Landing.tsx        - Public landing page
    Dashboard.tsx      - Project list
    NewProject.tsx     - 4-step project creation (Module 2)
    ProjectDetails.tsx - Project tabs (AI Assistant, Documents, Overview)
    Settings.tsx       - OpenAI API key configuration
  components/
    Layout.tsx         - Sidebar navigation layout
    ui/                - shadcn components
  hooks/
    use-auth.ts, use-projects.ts, use-profiles.ts, use-documents.ts, use-ai.ts
server/
  routes.ts            - API routes + AI generation logic
  storage.ts           - Database CRUD operations
  db.ts                - Database connection
shared/
  schema.ts            - Drizzle schema (profiles, projects, documents, aiGenerations)
  routes.ts            - API route definitions + types
```

## Database Tables
- **profiles**: User profile with academic context + optional OpenAI API key
- **projects**: Project with Module 2 fields (domain, degree, profile, orientation)
- **documents**: Text documents attached to projects
- **ai_generations**: AI-generated content per project

## AI Generation Cases
- **Case A (Mémoire)**: Subject + Problematic + Research Question + 3 Hypotheses
- **Case B (TFE)**: Situation d'appel analysis -> Structured questioning + Operational hypotheses
- **Case C (VAE)**: Competency blocks analysis (no academic subject/hypotheses)
- **Case D (Rapport de Stage)**: Professional subject + Problematic + Analysis axes

## Auth Notes
- User ID is accessed via `req.user.claims.sub` (Replit OIDC), NOT `req.user.id`
- Use `getUserId(req)` helper in server/routes.ts for consistent extraction
- Always guard with `if (!userId)` before DB writes

## Recent Changes
- 2026-02-06: Fixed critical auth bug: user ID extraction using claims.sub instead of .id
- 2026-02-06: Added conditional validation (superRefine) for domain "autre" and work fields
- 2026-02-06: Implemented full Module 2 parametrization (4-step form)
- 2026-02-06: Implemented Module 3 with case-specific AI generation
- 2026-02-06: Added Settings page for personal OpenAI API key
- 2026-02-06: Updated backend prompts for all 4 project types

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
