# Refbib

## Overview
Refbib is a focused academic bibliographic research tool. It allows users to search for academic articles, generate APA/Vancouver/MLA/Chicago bibliographies, analyze and compare sources, and generate literature synthesis — all powered by OpenAI. The tool uses a pay-as-you-go credit system via Stripe.

## User Preferences
- Language: French (UI and AI responses)
- Targets French-speaking academic users (students, researchers, professionals)

## System Architecture
Client-server architecture:
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **AI**: OpenAI GPT-4o for all literature operations
- **Auth**: Replit Auth (OIDC)
- **Payments**: Stripe Checkout (one-time credit purchases)

## Pages
- `/` — Landing page (unauthenticated) or Dashboard (authenticated)
- `/revue` — Standalone literature review tool (protected)
- `/billing` — Credit purchase and invoice history (protected)

## Core Features
1. **Recherche d'articles** — POST /api/literature/search — searches articles across Google Scholar, PubMed, HAL, Cairn, ScienceDirect with filters (period, language, level, source type)
2. **Analyse & Synthèse** — POST /api/literature/analyze — generates summaries, confrontations, thematic mapping
3. **Bibliographies** — POST /api/literature/bibliography — formats bibliography in APA 7, Vancouver, MLA, Chicago
4. **Équations de recherche** — POST /api/literature/equations — generates boolean search equations
5. **Sauvegarde** — GET/POST/DELETE /api/bibliographies — saves searches to dashboard

## Credit System
- Credits are purchased via Stripe (packs: 10/30/100 credits)
- Each AI action costs 1 credit
- Packs: Starter (10cr, 4.99€), Essentiel (30cr, 11.99€), Pro (100cr, 29.99€)

## Database Tables
- `sessions` — Replit Auth sessions (mandatory)
- `users` — Replit Auth users (mandatory)
- `user_credits` — credit balances per user
- `credit_transactions` — credit purchase/spend history
- `bibliographies` — saved searches with sources
- `reading_cards` — AI-generated reading cards from PDFs
- `syntheses` — cross-card synthesis results
- `invoices` — Stripe payment records

## Key Files
- `shared/schema.ts` — DB schema + CREDIT_PACKS + CREDIT_COSTS
- `server/routes.ts` — all API routes
- `server/storage.ts` — DB operations
- `client/src/pages/Revue.tsx` — main literature review tool
- `client/src/pages/Dashboard.tsx` — user dashboard
- `client/src/pages/Billing.tsx` — credit purchase page
- `client/src/pages/Landing.tsx` — marketing landing page
- `client/src/hooks/use-literature.ts` — all frontend hooks

## External Dependencies
- OpenAI GPT-4o — article search, analysis, bibliography, equations
- PostgreSQL — database
- Replit Auth (OIDC) — authentication
- Stripe Checkout — payment processing
- Gmail SMTP (nodemailer) — welcome emails
