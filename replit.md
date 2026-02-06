# Academic Writing Assistant

## Overview
The Academic Writing Assistant is an AI-powered application designed to support students and professionals in structuring, analyzing, and writing academic papers such as Mémoire, TFE, VAE, and Rapport de Stage. It provides section-based content generation with contextual memory, version history, and controlled regeneration capabilities. The project aims to streamline the academic writing process, offering a comprehensive tool for various academic document types.

## User Preferences
- Language: French (UI and AI responses)
- The app targets French-speaking academic users
- Bilingual support (FR/EN) for landing page and in-app navigation

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
    -   **Payment System**: Integrated with Stripe for managing purchases of sections, add-ons, and packs.

## External Dependencies
-   **OpenAI**: Used for AI content generation.
-   **PostgreSQL**: Primary database for all application data.
-   **Replit Auth (OIDC)**: Authentication service.
-   **Stripe**: Payment processing for purchases and subscriptions.
-   **docx**: Library for generating Word (.docx) files.
-   **file-saver**: For saving generated files on the client-side.
-   **html2pdf.js**: For converting HTML content to PDF.
-   **Mermaid.js**: For diagram generation (e.g., synthesis schemas, concept relationship schemas).