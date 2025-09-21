# Component Architecture Refactor – 2024-11-30

## Summary

We reorganized feature-aware UI out of `src/components` into domain-specific folders so the component tree reflects the clean-architecture layers defined in the repository guidelines. The shared primitives remain in `src/components/ui`, while app chrome and providers moved alongside the Next.js layout under `src/app`.

## Changes

- **Domain UI relocation**
  - Moved the entity directory / menu / table / views stack from `src/components/entity-*` to `src/domains/entities/ui/**`.
  - Added `src/domains/entities/ui/index.ts` as the public entry point for consumers.
  - Updated leads/contacts pages (`src/domains/leads/ui/LeadsDirectoryPage.tsx`, `src/domains/contacts/ui/ContactsDirectoryPage.tsx`) and docs to import from the new barrel.
- **App chrome + providers**
  - Global navigation controls now live in `src/app/_components/nav/**`.
  - `ThemeProvider` and `QueryProvider` moved to `src/app/_providers/**` and are imported in `src/app/layout.tsx`.
- **Cleanup**
  - Removed obsolete barrels (`src/components/EntityDirectory.tsx`, etc.).
  - Updated documentation references so future contributions point to the new locations.

## Rationale

1. **Bounded contexts first** – Domain-specific UI belongs with its domain, not in the shared components bucket. This avoids circular dependencies and clarifies ownership when a feature evolves.
2. **Reusable primitives stay simple** – `src/components` now only contains primitive shadcn/Radix wrappers that are safe to use anywhere.
3. **App shell proximity** – Providers and chrome that affect the entire application live with `src/app/layout.tsx`, making layout wiring easier to discover.
4. **Predictable imports** – The new `@/domains/entities/ui` barrel provides a single import surface for entity tooling, reducing path churn.

## Conventions Going Forward

- Place **domain-aware UI** (components, hooks, utilities that depend on a domain store or FEBE contract) under `src/domains/<domain>/ui/**`. Re-export via an `index.ts` so consuming pages import from `@/domains/<domain>/ui`.
- Keep **shared primitives** in `src/components/ui/**`. These should not depend on domain state or backend types.
- Put **app-level chrome and providers** near the layout: `src/app/_components` for layout widgets, `src/app/_providers` for context providers.
- Follow casing rules:
  - Directories for components in PascalCase when they hold multiple files (`EntityDirectory/EntityDirectory.tsx`).
  - Barrel files named `index.ts` exporting the module surface.
- When creating a new UI module:
  1. Decide if it is domain-specific or shared.
  2. Place it in the appropriate folder (`src/domains/...` or `src/components/ui`).
  3. Add a barrel export in the nearest `index.ts`.
  4. Update any docs if the module replaces older guidance.

Adhering to these conventions keeps the clean architecture intact and reduces friction when features expand or new domains appear.
