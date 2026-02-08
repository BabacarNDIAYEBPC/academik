# Academik

## Overview
Academik (academik.fr) is a methodology software that assists students and professionals in structuring, analyzing, and writing academic papers like Mémoire, TFE, VAE, and Rapport de Stage. It offers section-based content generation with contextual memory, version history, and controlled regeneration. The project's goal is to streamline academic writing by providing a comprehensive tool for various document types. The product is marketed as a methodology tool, avoiding AI/IA terminology in user-facing content.

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
- Full bilingual support (FR/EN) across all pages, components, and modules via i18n system

## System Architecture
The application uses a client-server architecture.
- **Frontend**: React, Vite, TailwindCSS, and shadcn/ui for a responsive UI.
- **Backend**: Express.js, Drizzle ORM, and PostgreSQL for data management and API handling.
- **AI Integration**: Leverages OpenAI for content generation, supporting Replit AI Integrations or user-provided API keys.
- **Authentication**: Replit Auth (OIDC).
- **Core Features**:
    - **Contextual Memory**: Validated sections inform subsequent AI generations for coherence.
    - **Version History**: Tracks changes for each section, allowing restoration.
    - **Controlled Regeneration**: Offers "Similar" (temperature 0.5) and "Different" (temperature 0.9) modes.
    - **Document Management**: Stores text for AI analysis context.
    - **Module-Based Content Generation**: Specific modules for project setup, foundational elements (Subject, Problematic, Hypotheses), work plan, conceptual & theoretical frameworks, literature review, and methodology.
    - **Dynamic Plan Generation**: Contextual plan generation based on project type.
    - **Export Functionality**: Exports sections or full documents to Word (.docx) and PDF.
    - **Quota System**: Manages user limits for words, AI actions, projects, and documents, with options for purchasing additional capacity.
    - **Payment System**: Integrated with Stripe for core packs and à la carte options, managing entitlements based on purchases.
    - **Invoice System**: Auto-generates and stores invoices for all purchases, available for download in HTML.
    - **Subscription Tracking**: Visual progress bar for subscription status and auto-payment notifications.
    - **Super Admin Console**: Provides comprehensive administration for users, plans, AI settings, payments, and audit logs, including module visibility toggling.
- **Modular Menu System**: Tab menu uses core + optional module architecture. Core tabs (Fondements, Plan, Cadre conceptuel, Revue, Méthodo, Rédaction, Export) are always visible. Optional modules (Questionnaire, Formulaire, Guide d'entretien, Dépouillement, Simulation, Analyse, Confrontation, Validation Hyp., Finance, PPT Soutenance, Oral, Biblio, Audit) auto-appear when paid, with "+ Modules" button showing remaining locked modules with prices and triggering direct Stripe checkout. Mobile uses Select dropdown + "+" button.
- **Specific Modules**:
    - **Rapport de Stage**: Questionnaire-based approach with 9 dedicated sections and separate workflow. Includes PPT Soutenance and Oral.
    - **Mémoire Professionnel**: Questionnaire-based with 2 dedicated sections followed by standard academic sections, focusing on professional context.
    - **Étude de Cas**: Questionnaire-based with 8 dedicated sections for structured analysis, including analysis tool selection. Includes PPT Soutenance, Oral, Biblio, and Audit.
    - **VAE (Validation des Acquis de l'Expérience)**: Questionnaire-based with 6 dedicated sections, including AI-powered competency mapping. Includes PPT Soutenance, Oral, and Biblio.
    - **Confrontation** (section key: confrontation): Standalone module for confronting research results (qualitative, quantitative, imported data) with literature. Purchasable at 19 €. Component: ConfrontationModule.tsx.
    - **Hypothesis Validation** (section key: hypothesis_validation): Standalone module for validating/invalidating research hypotheses against analysis results and imported documents. Purchasable at 19 €. Component: HypothesisValidationModule.tsx.
    - **Formulaire**: Full online form builder (Google Forms-like) with question types (text, textarea, MCQ, Likert, yes/no, number, email), public shareable links, response collection, and response dashboard. Database tables: forms, form_questions, form_responses, form_answers. Public form page at /f/:publicId (no auth required). Available as purchasable module for all project types.
    - **Dépouillement** (section key: questionnaire_analysis): Cross-tabulation module with auto-sync from Formulaire responses. Generates tableaux croisés, charts (bar, pie, line, area, radar), and AI-powered quantitative analysis. Data can be imported from CSV/Excel or synced from Formulaire module. Uses `useAnalyzeQuantitative` hook.
    - **Analyse** (section key: data_analysis): Two-tab analysis module with Qualitative (verbatim analysis) and Dépouillement (tri plat, tri croisé, analyse thématique via questionnaire-analysis API). Confrontation and Hypothesis Validation have been extracted into standalone modules.
- **Internationalization (i18n)**: Custom React context-based system for French and English support across the application.
- **SEO & Google Indexing**: Utilizes an SEO component for dynamic metadata, `robots.txt` for crawl control, `sitemap.xml` for site structure, and JSON-LD for structured data.

- **Email System** (server/email.ts): Comprehensive email service using Resend API with sender `contact@academik.fr`. Includes:
    - Welcome email on first user registration
    - Payment confirmation email after successful checkout
    - Invoice email with itemized details
    - Abandoned cart recovery emails (scheduler: every 30 min, sends after 1 hour of inactivity)
    - Quota low warning emails
    - All emails use responsive HTML templates with Academik branding and company footer
    - Database table: `abandoned_checkouts` for tracking unfinished purchases
    - Dunning/payment reminder emails (server/dunning.ts) also use `contact@academik.fr`

## External Dependencies
- **OpenAI**: AI content generation.
- **PostgreSQL**: Primary database.
- **Replit Auth (OIDC)**: Authentication.
- **Stripe**: Payment processing.
- **Resend**: Transactional email delivery (sender: contact@academik.fr).
- **docx**: Word document generation.
- **file-saver**: Client-side file saving.
- **html2pdf.js**: HTML to PDF conversion.
- **Mermaid.js**: Diagram generation.