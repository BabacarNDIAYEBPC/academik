# Academik

## Overview
Academik (academik.fr) is a methodology software connected to academic platforms, designed to support students and professionals in structuring, analyzing, and writing academic papers such as Mémoire, TFE, VAE, and Rapport de Stage. It provides section-based content generation with contextual memory, version history, and controlled regeneration capabilities. The project aims to streamline the academic writing process, offering a comprehensive tool for various academic document types. Note: All user-facing text avoids AI/IA terminology - the product is positioned as a methodology tool, not an AI tool.

## Branding
- App name: **Academik**
- Domain: **academik.fr** (hosted on Hostinger DNS)
- Logo: Purple/blue gradient squircle with white "A" letter
- Tagline FR: "De A à Z dans la rédaction académique"
- Tagline EN: "From A to Z in Academic Writing"

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
- Full bilingual support (FR/EN) across all pages, components, and modules via i18n system

## Internationalization (i18n)
- **System**: Custom React context-based i18n (`client/src/lib/i18n.tsx`) with `useI18n()` hook providing `t()`, `tArray()`, `lang`, `setLang`
- **Languages**: French (fr) and English (en), stored in localStorage as `app_lang`
- **Translation file**: `client/src/lib/i18n.tsx` contains 1800+ translation keys organized hierarchically
- **Key structure**: `t("section.key")` e.g. `t("billing.title")`, `t("modules.literatureReview.search")`
- **Language selector**: `LanguageSelector` component in header/landing page
- **SEO**: `client/src/components/SEO.tsx` dynamically sets document title, meta description, keywords, Open Graph tags, and html lang attribute per page
- **Patterns used**:
  - `labelKey` pattern for static arrays (constants that need translation at render time)
  - `language === "fr" ? "fr-FR" : "en-US"` for locale-aware date/number formatting
  - Iterator variable renaming (`t` → `dt`, `tp`, `st`) to avoid shadowing the i18n `t` function
- **Exclusions**: Invoice HTML (legal document, stays French), AI prompt context strings (internal), admin panel (stays French)

## System Architecture
The application follows a client-server architecture.
-   **Frontend**: Built with React, Vite, TailwindCSS, and shadcn/ui for a modern and responsive user interface.
-   **Backend**: Developed using Express.js, Drizzle ORM, and PostgreSQL for robust data management and API handling.
-   **AI Integration**: Leverages OpenAI's capabilities for content generation, either via Replit AI Integrations or a user-provided API key.
-   **Authentication**: Handled through Replit Auth (OIDC).
-   **Core Features**:
    -   **Contextual Memory**: Validated sections are automatically used as context for subsequent AI generations, ensuring coherence.
    -   **Version History**: Each generated or edited section maintains a complete version history, allowing users to restore previous states.
    -   **Controlled Regeneration**: Offers "Similar" (temperature 0.5) and "Different" (temperature 0.9) modes for regenerating content.
    -   **Document Management**: Supports text-based document storage for AI analysis context.
    -   **Module-Based Content Generation**: Specific modules for project setup, foundational elements (Subject, Problematic, Hypotheses), work plan, conceptual & theoretical frameworks, literature review, and methodology.
    -   **Dynamic Plan Generation**: Contextual plan generation based on project type and validated content.
    -   **Export Functionality**: Supports per-section and batch export to Word (.docx) and PDF formats.
    -   **Quota System**: Manages user quotas for words, AI actions, projects, and documents with options for purchasing surplus.
    -   **Payment System**: Integrated with Stripe. Single core pack at €179 (foundations through methodology) + à la carte options (collecte, analyse, revue avancée, soutenance, confort, IA quotas). Entitlement system: `core_pack` purchase expands to foundation/plan/conceptual/literature/methodology entitlements. Pack purchases (pack_collecte, pack_analyse, pack_revue, pack_soutenance) expand to their constituent items. SECTION_TO_ENTITLEMENT maps section keys to entitlement keys. getUserEntitlements in storage.ts expands pack purchases into individual entitlements.
    -   **Invoice System**: Auto-generated invoices on every purchase (core pack, options, surplus). Invoices stored in DB (invoices table) with auto-incrementing invoice numbers (AS-YYYYMM-NNNN format). Client billing space shows invoice history with download (HTML format). Invoice template includes company details (Performance Consulting Groupe SAS, SIREN 913 540 944, RCS Perpignan, 3 Avenue de Toulouse, 66140 Canet-en-Roussillon) and client details.
    -   **Subscription Tracking**: Visual progress bar showing days remaining in current period, color-coded warnings (orange when < 7 days, red when expired). Auto-payment notification section with next debit date.
    -   **Super Admin Console**: Full administration dashboard for managing users, plans, AI settings, payments, and audit logs.

## Rapport de Stage Module
- **Questionnaire-based approach**: Each section has guided questions (3-10 per section). Users answer all questions before generating content.
- **9 dedicated sections**: rs_cover_page, rs_acknowledgements, rs_introduction, rs_company, rs_internship, rs_missions, rs_analysis, rs_contributions, rs_conclusion
- **Separate flow**: Rapport de Stage has its own tabs in ProjectDetails.tsx, completely separate from Mémoire/TFE academic sections
- **Component**: `InternshipQuestionnaire.tsx` - Step-by-step question flow with progress tracking
- **Integration**: When all questions are answered, answers are sent as `extraContext` to the generate endpoint
- **Entitlement**: All rs_ sections map to `rs_foundation` entitlement
- **AI Prompts**: Each rs_ section has dedicated French prompts in `getSectionTask()` in routes.ts
- **i18n**: Full FR/EN translations under `internshipReport.*` in i18n.tsx

## Mémoire Professionnel Module
- **Questionnaire-based approach**: Two dedicated sections with guided questions before standard academic sections
- **2 dedicated sections**: mp_structure (17 questions - organization presentation), mp_emergence (5 questions - subject/problem emergence from professional field)
- **Flow**: mp_structure and mp_emergence tabs appear BEFORE foundations (subject, problematic, hypotheses), then standard academic sections follow
- **Component**: `MemoireProQuestionnaire.tsx` - Step-by-step question flow with progress tracking (same pattern as VaeQuestionnaire/InternshipQuestionnaire)
- **Integration**: When all questions are answered, answers are sent as `extraContext` to the generate endpoint
- **Entitlement**: All mp_ sections map to `foundation` entitlement (same as standard mémoire foundations)
- **AI Prompts**: Each mp_ section has dedicated French prompts in `getSectionTask()` in routes.ts
- **i18n**: Full FR/EN translations under `memoirePro.*` in i18n.tsx
- **Project type**: `memoire_professionnel` in project creation selector (indigo badge in Dashboard)
- **Purpose**: Grounds academic reflection in professional reality — students describe their workplace structure first, then the problematic emerges from field observation before proceeding to standard academic foundations

## VAE Module (Validation des Acquis de l'Expérience)
- **Questionnaire-based approach**: Each section has guided questions (3-7 per section). Users answer all questions before generating content.
- **6 dedicated sections**: vae_presentation, vae_parcours, vae_motivation, vae_cartographie, vae_bloc_demo, vae_synthese
- **Separate flow**: VAE has its own tabs in ProjectDetails.tsx, completely separate from Mémoire/TFE academic sections
- **Component**: `VaeQuestionnaire.tsx` - Step-by-step question flow with progress tracking (same pattern as InternshipQuestionnaire)
- **Integration**: When all questions are answered, answers are sent as `extraContext` to the generate endpoint
- **Entitlement**: All vae_ sections map to `vae_foundation` entitlement
- **AI Prompts**: Each vae_ section has dedicated French prompts in `getSectionTask()` in routes.ts
- **i18n**: Full FR/EN translations under `vaeModule.*` in i18n.tsx
- **Key features**: AI cartography maps experiences to competency blocks, bloc demonstration with table + narrative + reflexive analysis

## Super Admin Console
- Route: /admin (protected by SUPER_ADMIN_IDS env var, comma-separated user IDs)
- User Management: List all users with search, view quotas/projects, add credits, modify quotas, export CSV
- Plan Management: CRUD for subscription plans (key, name, price, limits, modules, marketing labels)
- Payment Management: View all purchases and surplus transactions with user details
- AI Settings: Model selection (GPT-4o etc.), max tokens, allow user keys toggle, system prompt override
- Logs & Audit: Audit journal (all admin actions logged), AI request logs with stats (total, errors, avg response time)
- DB tables: plans, admin_settings, audit_logs, ai_logs
- API prefix: /api/admin/* (all protected by isSuperAdmin middleware)
- Frontend: Admin.tsx with tabbed layout (Dashboard, Users, Plans, Payments, AI, Logs)
- Module Visibility: Admin can toggle visibility of 25 modules across 7 categories (core, collecte, analyse, revue, production, soutenance, ia). Disabled modules are hidden from ProjectDetails tabs, Billing page options, and Landing page pricing. Stored as JSON in admin_settings (key: "module_visibility"). Public API: GET /api/modules/visibility. Defaults to all visible when no settings exist.
- Components: client/src/components/admin/ (AdminDashboard, AdminUsers, AdminPlans, AdminPayments, AdminAISettings, AdminLogs, AdminModules)

## SEO & Google Indexing
- **SEO Component**: `client/src/components/SEO.tsx` - Sets title, meta description, keywords, canonical URL, Open Graph tags (title, description, image, url, type, site_name, locale), Twitter Card tags (summary_large_image), and JSON-LD structured data
- **index.html**: Static fallback SEO tags for crawlers (OG, Twitter, JSON-LD SoftwareApplication schema, theme-color, apple-touch-icon)
- **robots.txt**: Served at `/robots.txt` via Express - allows `/`, disallows `/dashboard`, `/projects`, `/settings`, `/billing`, `/admin`, `/api/`
- **sitemap.xml**: Served at `/sitemap.xml` via Express - lists 8 URLs: home, /blog, and 6 blog article pages with hreflang alternates (fr/en/x-default)
- **OG Image**: `/images/og-image.png` (1200x630 social sharing image)
- **JSON-LD**: SoftwareApplication schema with Organization creator (Performance Consulting Groupe SAS)
- **All pages** have: unique title, meta description, canonical URL, OG/Twitter tags
- **Domain**: academik.fr (canonical base URL hardcoded in SEO component)

## Blog Section
- **Routes**: `/blog` (article list), `/blog/:slug` (individual article)
- **Implementation**: Static content in `client/src/pages/Blog.tsx` (not database-driven, for SEO)
- **Articles**: 6 SEO-optimized articles on academic writing methodology:
  - comment-rediger-problematique-memoire
  - structurer-plan-memoire
  - cadre-theorique-conceptuel-memoire
  - revue-litterature-methode
  - methodologie-memoire-guide
  - tfe-infirmier-guide-complet
- **Bilingual**: Each article has FR and EN content
- **JSON-LD**: BlogPosting schema on each article page
- **SEO Component**: Uses `directTitle`/`directDescription`/`directKeywords` props for dynamic article content
- **Landing footer**: Links to blog

## Branding - AI/IA Removal
- All user-facing text avoids "IA", "AI", "intelligence artificielle" terminology
- Positioned as "logiciel de méthodologie connecté aux plateformes académiques"
- Internal admin labels and OpenAI API technical code unchanged
- SEO meta tags, JSON-LD, FAQ schemas updated accordingly
- AggregateRating: 4.95/5 based on 238 reviews

## External Dependencies
-   **OpenAI**: Used for AI content generation.
-   **PostgreSQL**: Primary database for all application data.
-   **Replit Auth (OIDC)**: Authentication service.
-   **Stripe**: Payment processing for purchases and subscriptions.
-   **docx**: Library for generating Word (.docx) files.
-   **file-saver**: For saving generated files on the client-side.
-   **html2pdf.js**: For converting HTML content to PDF.
-   **Mermaid.js**: For diagram generation (e.g., synthesis schemas, concept relationship schemas).