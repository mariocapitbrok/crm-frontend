# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router entry points grouped by feature (`contacts`, `leads`, `dashboard`).
- `src/components`: Reusable UI primitives composed from shadcn/ui and Radix primitives.
- `src/domains`: Bounded contexts with `application`, `domain`, and `ui` layers; legacy Zustand hooks remain in `src/state` during migration.
- `src/lib` & `src/febe`: Shared utilities, API bridges, and data mappers; keep large fixtures out of `public/`.
- Co-locate tests beside source (`ComponentName.test.tsx`); static assets live under `public/`.

## Build, Test, and Development Commands
- `pnpm dev`: Boot the Next.js dev server with Turbopack.
- `pnpm build`: Generate a production bundle; run before shipping major UI changes.
- `pnpm start`: Serve the production build locally for smoke checks.
- `pnpm lint`: Execute the enforced ESLint config; fix or document all warnings before merge.
- `pnpm gen:db`: Refresh `db.json` fixtures; pair with `pnpm dev:api` to run the mock API on port 3001.

## Coding Style & Naming Conventions
- TypeScript + React 19 + Next.js 15; prefer functional and server components.
- Tailwind CSS 4 utilities drive styling—order classes by layout → spacing → color.
- Components live in PascalCase files (e.g., `EntityHeader.tsx`); hooks use camelCase (`useLeadDirectory.ts`).
- Favor named exports; reserve default exports for route components.
- Honor ESLint output and keep new files ASCII unless intentional otherwise.

## Testing Guidelines
- No global harness yet—add React Testing Library or integration coverage for critical flows.
- Name tests `ComponentName.test.tsx`; store fixtures in `__mocks__/`.
- Validate changes with `pnpm lint`, manual UX checks, and JSON server smoke tests.

## Commit & Pull Request Guidelines
- Write imperative, sentence-case commits (e.g., `Add contacts quick filters`).
- PRs should describe changes, link Jira/GitHub issues, list test evidence, and include updated UI screenshots when relevant.
- Request peer review and resolve lint/build feedback before merging.

## Local API & Data Tips
- After schema updates, rerun `pnpm gen:db` and restart the mock API.
- Extend `routes.json` when adding endpoints; avoid hitting real services during local development.
