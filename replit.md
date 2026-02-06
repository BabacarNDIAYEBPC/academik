# Academic Writing Assistant

## Overview
AI-powered academic writing assistant that helps students and professionals structure, analyze, and write academic papers (Mémoire, TFE, VAE, Rapport de Stage). Features section-based content generation with contextual memory, version history, and controlled regeneration.

## Architecture
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **AI**: OpenAI (via Replit AI Integrations or user's own API key)
- **Auth**: Replit Auth (OIDC)

## Key Features
- **Module 2 - Project Setup**: Full academic context (domain, degree, profile, orientation)
- **Module 3 - Foundations**: Type-specific generation (Subject, Problematic, Hypotheses, Situation d'appel, VAE Competencies)
- **Module 4 - Work Plan**: Type-specific outline generation
- **Module 5 - Conceptual & Theoretical Framework**: Concept identification, theoretical positioning
- **Module 6 - Literature Review**: Structured review with search equations
- **Module 7 - Methodology**: Research design, tools, population, analysis methods
- **Contextual Memory**: Validated sections auto-inject into subsequent AI generations in canonical order
- **Version History**: Each section tracks all versions (AI-generated + manual edits) with restore capability
- **Controlled Regeneration**: "Similar" (temp 0.5) vs "Different" (temp 0.9) regeneration modes
- **Documents**: Text-based document storage for AI analysis context

## Project Structure
```
client/src/
  pages/
    Landing.tsx           - Public landing page
    Dashboard.tsx         - Project list
    NewProject.tsx        - 4-step project creation (Module 2)
    ProjectDetails.tsx    - Project tabs (AI Assistant with module sub-tabs, Documents, Overview)
    Settings.tsx          - OpenAI API key configuration
  components/
    Layout.tsx            - Sidebar navigation layout
    SectionEditor.tsx     - Reusable section editor (generate/edit/validate/version history)
    ui/                   - shadcn components
  hooks/
    use-auth.ts, use-projects.ts, use-profiles.ts, use-documents.ts, use-ai.ts
    use-sections.ts       - Section CRUD + version management hooks
server/
  routes.ts              - API routes + AI generation logic + section-specific prompts
  storage.ts             - Database CRUD operations (IStorage interface)
  db.ts                  - Database connection
shared/
  schema.ts              - Drizzle schema (profiles, projects, documents, aiGenerations, projectSections, sectionVersions)
  routes.ts              - API route definitions + types
```

## Database Tables
- **profiles**: User profile with academic context + optional OpenAI API key
- **projects**: Project with Module 2 fields (domain, degree, profile, orientation)
- **documents**: Text documents attached to projects
- **ai_generations**: Legacy AI-generated content (backward compat)
- **project_sections**: Section tracking per project (key, status, activeVersionId, config)
- **section_versions**: Version history per section (content, source, mode, contextSnapshot)

## Section Keys & Order
`subject -> problematic -> hypotheses -> situation_appel -> vae_competencies -> plan -> conceptual_framework -> theoretical_framework -> literature_review -> methodology`

## AI Generation Cases
- **Case A (Mémoire)**: Subject + Problematic + Hypotheses -> Plan -> Frameworks -> Lit Review -> Methodology
- **Case B (TFE)**: Situation d'appel -> Problematic + Hypotheses -> Plan -> Frameworks -> Lit Review -> Methodology
- **Case C (VAE)**: Competency blocks -> Plan
- **Case D (Rapport de Stage)**: Subject + Hypotheses -> Plan -> Conceptual Framework -> Lit Review -> Methodology

## Auth Notes
- User ID is accessed via `req.user.claims.sub` (Replit OIDC), NOT `req.user.id`
- Use `getUserId(req)` helper in server/routes.ts for consistent extraction
- Always guard with `if (!userId)` before DB writes

## Recent Changes
- 2026-02-06: Implemented Modules 4-7 (Plan, Frameworks, Lit Review, Methodology) with section-based architecture
- 2026-02-06: Added project_sections and section_versions tables for versioned content management
- 2026-02-06: Built contextual memory system - validated sections chain into subsequent generations
- 2026-02-06: Created reusable SectionEditor component with modify/regenerate/validate/version history
- 2026-02-06: Implemented controlled regeneration (similar temp 0.5, different temp 0.9)
- 2026-02-06: Added module sub-tabs in ProjectDetails (Foundations, Plan, Frameworks, Literature, Methodology)
- 2026-02-06: Fixed critical auth bug: user ID extraction using claims.sub instead of .id

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
