# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
```

There are no lint or test scripts configured. Use `npx tsc --noEmit` to type-check.

## What This App Does

AI-powered frontend QA pipeline: users define user stories, point the tool at a URL, and it runs Playwright to execute the stories, captures screenshots, and sends them to Google Gemini for analysis. Results (PASS/FAIL/PARTIAL) and structured findings are stored in PocketBase and displayed in a report UI.

## Architecture

**App Router structure** under `/app`:
- `(auth)/` — login/register pages, unprotected
- `(app)/` — protected pages (setup, report, findings, jira, past-runs, settings) wrapped in a shared layout with Sidebar + Topbar
- `api/run-test/` — SSE-streaming endpoint that drives the test run (max 300s)
- `api/runs/` — CRUD for past runs in PocketBase

**State** lives in `/context/PipelineContext.tsx` — a single React Context holding `config`, `stories`, `activeRun`, `savedRuns`, and `isRunning`. It wraps the entire `(app)` layout.

**Testing engine** is `/runner/runTest.ts` (also imported as `/lib/runTest.ts`). It:
1. Launches headless Chromium via Playwright
2. Parses natural-language story steps into Playwright actions (navigate / click / fill)
3. Captures screenshots and monitors console errors + network failures
4. Sends screenshots + DOM analysis to Gemini
5. Parses Gemini's JSON response into `TestCase[]` and `Finding[]`
6. Saves the `RunResult` to PocketBase

**AI prompt construction** is in `/lib/promptBuilder.ts`. Evaluation categories: flow, dead-ends, bugs, UX, design, accessibility.

**Data models** are in `/types/index.ts`: `Config`, `Story`, `TestCase`, `Finding`, `RunResult`, `RunSummary`.

**Auth** uses PocketBase cookies. `middleware.ts` protects `/setup`, `/report`, `/findings`, `/jira`, `/past-runs` and redirects unauthenticated requests to `/login`.

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_POCKETBASE_URL` | Yes | PocketBase instance URL |
| `POCKETBASE_ADMIN_EMAIL` | Yes | PocketBase admin credentials |
| `POCKETBASE_ADMIN_PASSWORD` | Yes | PocketBase admin credentials |
| `GEMINI_API_KEY` | No | Server-side fallback (users can set their own in Settings) |

## Key Dependencies

- **Next.js 16.2.1** — check `node_modules/next/dist/docs/` before using any Next.js APIs (see AGENTS.md)
- **Playwright 1.58.2** — declared as `serverExternalPackages` in `next.config.ts` so it runs server-side only
- **@google/genai ^1.46.0** — Gemini SDK
- **PocketBase 0.26.8** — client initialized in `/lib/pocketbase.ts` with separate client/server helpers
- **Tailwind CSS 4** — configured via PostCSS plugin, no explicit `tailwind.config` file
