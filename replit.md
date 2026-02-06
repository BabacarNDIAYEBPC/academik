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
- **Module 6 - Literature Review**: Search engine-style article discovery, per-article/multi-article analysis, confrontation, mapping, bibliography generation (APA7/Vancouver/MLA/Chicago)
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
- 2026-02-06: Rebuilt ConceptualFrameworkModule as dedicated component with source search, metadata cards, batch selection, concept generation from selected sources, complementary source suggestions, auto-generated bibliography with citation norm selector (APA7/Vancouver/MLA/Chicago)
- 2026-02-06: Built MethodologyModule as dedicated component with 5 analytical tables (methodological_choice, pre_operational, target_population, collection_tools, limits) with AI comments as writing guidance
- 2026-02-06: Added backend endpoints: POST /api/sections/generate-concepts, POST /api/sections/suggest-sources, POST /api/sections/generate-methodology-tables
- 2026-02-06: Frontend hooks: useGenerateConcepts, useSuggestSources, useGenerateMethodologyTables in use-sections.ts
- 2026-02-06: Both modules have auto-save state persistence (3s debounce to section config), Word export, validate/unvalidate
- 2026-02-06: Methodology tables backend enforces column normalization and returns 422 on empty parse results
- 2026-02-06: Removed theoretical_framework from project flows (handled by Literature Review)
- 2026-02-06: ProjectDetails routes conceptual_framework and methodology to dedicated modules (like LiteratureReviewModule)
- 2026-02-06: Added status timeline dialog with timestamped history of all status changes per section
- 2026-02-06: Added status selector dropdown in SectionEditor (9 statuses: Brouillon, Généré, Modifié, Validé, Envoyé, En attente, Corrigé, Version finale, Archivé)
- 2026-02-06: Added section_status_history table with automatic logging on every status change
- 2026-02-06: Added API routes: POST /api/sections/:id/status, GET /api/sections/:id/status-history
- 2026-02-06: Literature review: article management cards with add/remove/pagination and contextual AI injection
- 2026-02-06: Dynamic plan generation with contextual titles based on project type and validated content
- 2026-02-06: Added SectionControls component with editable variables panel, module-specific filters, correction prompt, and export
- 2026-02-06: Added per-section and batch export (Word .docx and PDF) via docx, file-saver, html2pdf.js
- 2026-02-06: Batch export uses API endpoint GET /api/projects/:id/sections/export for cross-section content
- 2026-02-06: Literature review has advanced form with platforms, article count, period, language, source level, source types
- 2026-02-06: Variables + filters + correction prompt serialized into extraContext for AI generation
- 2026-02-06: Fixed ordered list HTML export (tracks ul/ol type for correct closing tags)
- 2026-02-06: Implemented Modules 4-7 (Plan, Frameworks, Lit Review, Methodology) with section-based architecture
- 2026-02-06: Added project_sections and section_versions tables for versioned content management
- 2026-02-06: Built contextual memory system - validated sections chain into subsequent generations
- 2026-02-06: Created reusable SectionEditor component with modify/regenerate/validate/version history
- 2026-02-06: Implemented controlled regeneration (similar temp 0.5, different temp 0.9)
- 2026-02-06: Added module sub-tabs in ProjectDetails (Foundations, Plan, Frameworks, Literature, Methodology)
- 2026-02-06: Fixed critical auth bug: user ID extraction using claims.sub instead of .id
- 2026-02-06: Built LiteratureReviewModule component with search engine-style article discovery interface
- 2026-02-06: Added backend endpoints: generateArticles (JSON article search), analyzeArticles (single/multiple/confrontation/mapping), generateBibliography (APA7/Vancouver/MLA/Chicago)
- 2026-02-06: Added validatedContents endpoint for pre-filling mandatory variables from validated sections
- 2026-02-06: Literature review module integrated with section lifecycle (save to section, validate/unvalidate)
- 2026-02-06: Conceptual framework prompt updated to enforce exactly 3 concepts (I. Cadre conceptuel with 1.1, 1.2, 1.3)
- 2026-02-06: Methodology prompt updated to reference literature review findings
- 2026-02-06: Variables pre-fill from validated sections (subject, problematic, hypotheses) via useValidatedContents hook
- 2026-02-06: Strict variable separation: each section (subject, problematic, hypotheses) generates ONLY its own content
- 2026-02-06: Combined generation endpoint POST /api/sections/generate-combined with delimiter parsing (<<<SUJET>>>, <<<PROBLEMATIQUE>>>, <<<HYPOTHESES>>>)
- 2026-02-06: Combined generation UI buttons in Foundations module (Sujet + Problématique, Sujet + Problématique + Hypothèses)
- 2026-02-06: Mermaid.js diagram generation: POST /api/sections/generate-diagram endpoint for visual illustrations
- 2026-02-06: MermaidDiagram component with SVG/PNG/PDF export capabilities
- 2026-02-06: Literature Review diagrams: synthesis schemas, confrontation schemas, mapping charts from articles
- 2026-02-06: Conceptual Framework diagrams: concept relationship schemas, concept-problematic-hypotheses articulation
- 2026-02-06: Improved PDF export with html2canvas settings and better container positioning
- 2026-02-06: Isolated button loading: activeAction state tracks which button is processing, others disabled
- 2026-02-06: Diagrams now open in modal/popup instead of inline rendering
- 2026-02-06: Removed PDF export from Literature Review module entirely (Word .docx only)
- 2026-02-06: Auto-save literature review state (articles, selections, filters, analyses, diagrams) to section config with 3s debounce
- 2026-02-06: Added POST /api/sections/:id/config endpoint with ownership verification and config merge
- 2026-02-06: Plan prompt updated: academic numbering (I., 1., 1.1.) without Markdown symbols or special characters
- 2026-02-06: UI/UX: All variable/option panels collapsed by default across all modules (clean, non-intimidating interface)
- 2026-02-06: Literature Review: Actions and Illustrations sections collapsed by default with toggle buttons
- 2026-02-06: Plan structure: Fixed academic plan template for Mémoire/TFE (INTRODUCTION, CADRE CONCEPTUEL, CADRE THÉORIQUE, CADRE MÉTHODOLOGIQUE, ANALYSE, CONCLUSION, BIBLIOGRAPHIE, ANNEXES)
- 2026-02-06: Removed Mermaid diagram/illustration features from Literature Review (Option B: unreliable, removed for V1)
- 2026-02-06: Added "Générer les équations de recherche" button: text-only output (keywords, synonyms, boolean equations), Word export, language selection
- 2026-02-06: Added POST /api/sections/literature/equations endpoint for research equation generation
- 2026-02-06: Added persistent search history: each search auto-archived with timestamp, platforms, filters, results, selections, analyses
- 2026-02-06: Added "Historique des recherches" button with restore (full state), duplicate (parameters only), delete actions
- 2026-02-06: Search history stored in section config alongside literatureState, persists across sessions
- 2026-02-06: Added Thèse (Doctorat) as 5th project type alongside Mémoire, TFE, VAE, Rapport de Stage
- 2026-02-06: Thèse follows same section flow as Mémoire (Case A) with doctoral-specific prompts
- 2026-02-06: Added bilingual i18n system (FR/EN) with React Context, localStorage persistence, LanguageSelector component
- 2026-02-06: Landing page features showcase: 5 modules with expandable details for all project types
- 2026-02-06: Modular pricing section: per-section pricing, optional add-ons, suggested packs (Essential/Research/Complete)
- 2026-02-06: Added userPurchases table for entitlements tracking (itemType, itemKey, price, Stripe IDs, status)
- 2026-02-06: Stripe checkout integration with demo mode fallback when STRIPE_SECRET_KEY not configured
- 2026-02-06: API routes: GET /api/entitlements, GET /api/purchases, POST /api/checkout, POST /api/checkout/confirm
- 2026-02-06: Conditional access: locked sections show Lock icon with "Activate module" button when unpurchased
- 2026-02-06: Payment confirmation flow on Landing page with URL parameter detection (payment=success/cancelled)
- 2026-02-06: Frontend hooks: useEntitlements, useCheckout, useConfirmPayment in use-entitlements.ts
- 2026-02-06: SECTION_TO_ENTITLEMENT mapping connects section keys to purchase entitlement keys

## Pricing Architecture
- Base access: €19 (auto-added when purchasing any section)
- Sections: Foundation €29, Plan €19, Conceptual €19, Literature €39, Methodology €29
- Options: Unlimited regen €9, Article analysis €15, Multilingual equations €9, Advanced history €9, Multi-export €9
- Packs: Essential €59, Research €99, Complete €129
- Server-side price validation prevents client tampering
- Demo mode: auto-activates purchases when STRIPE_SECRET_KEY not set

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
- Bilingual support (FR/EN) for landing page and in-app navigation
