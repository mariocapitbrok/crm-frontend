# Repository Guidelines

## Project Structure & Module Organization

- `src/app`: Next.js App Router entry points; pages fold by feature (`contacts`, `leads`, `dashboard`).
- `src/components`: Reusable UI primitives built around shadcn/ui and Radix.
- `src/domains`: Bounded contexts (`leads`, `contacts`, `identity`, etc.) with `{application,domain,ui}` folders; legacy shared Zustand hooks remain under `src/state` during migration.
- `src/lib` & `src/febe`: Shared utilities, data mappers, and API bridges.
- `public/`: Static assets; keep large fixtures elsewhere. Docs and prototyping notes live in `docs/`.

## Build, Test, and Development Commands

- `pnpm dev` (or `npm run dev`): Start the Next.js dev server with Turbopack.
- `pnpm build`: Create a production build; run before shipping major UI changes.
- `pnpm start`: Serve the production build locally.
- `pnpm lint`: Run the Next.js ESLint config; required pre-commit.
- `pnpm gen:db`: Regenerate `db.json` fixtures; pair with `pnpm dev:api` to boot the mock API on `:3001` (`dev:api:routes` adds custom routing).

## Coding Style & Naming Conventions

- TypeScript, React 19, Next.js 15. Use functional components and server components where possible.
- Follow ESLint output; Tailwind CSS 4 utilities drive styling. Keep class lists stable and sorted by layout → spacing → color.
- Components live in PascalCase files (`EntityHeader.tsx`), hooks in camelCase (`useLeadDirectory.ts`).
- Prefer named exports; default exports only for Next.js route components.

## Testing Guidelines

- No automated test harness is bundled yet; add React Testing Library or integration tests when modifying critical flows.
- Co-locate tests alongside source (`ComponentName.test.tsx`) and keep fixtures in `__mocks__/`.
- For now, validate flows via `pnpm lint`, manual UX verification, and JSON server smoke checks.

## Commit & Pull Request Guidelines

- Write imperative, sentence-case commit messages (e.g., `Add contacts quick filters`). Group related file changes.
- PRs should: describe the change, link Jira/GitHub issues, list test evidence, and include updated screenshots for UI tweaks.
- Request review from another engineer; respond to lint/build feedback before merge.

## Local API & Data Tips

- Re-run `pnpm gen:db` after altering schema docs to keep `db.json` in sync.
- Mock endpoints are defined in `routes.json`; extend them before hitting real services.
