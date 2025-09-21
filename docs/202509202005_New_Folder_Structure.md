# New Folder Structure

This change introduces a clearer separation between application entry points, shared UI primitives, and domain logic. The goal is to keep React components, state management, and API bridges scoped to a single bounded context wherever possible.

## Key Layout Updates

- `src/app/` now contains only Next.js route handlers and layouts, grouped by feature (`contacts`, `leads`, `dashboard`).
- `src/components/` hosts reusable UI primitives that can be shared across bounded contexts; stick to presentational, stateless pieces here.
- `src/domains/` groups code by business capability. Each context maintains `application`, `domain`, and `ui` layers so we can keep domain logic close to its feature.
- `src/lib/` and `src/febe/` capture cross-cutting utilities and API clients used by multiple domains.
- `src/state/` remains a temporary home for legacy Zustand stores until they are migrated into the relevant domain packages.
- `public/` is reserved for static assets, while longer-form documentation and prototypes continue to live under `docs/`.

## Migration Notes

- When promoting a shared primitive from a domain folder, move it to `src/components/` and double-check import paths.
- Domain hooks should stay close to their data sources; avoid importing from `src/state/` unless backwards compatibility demands it.
- Remember to regenerate fixtures with `pnpm gen:db` whenever a domain schema changes, and update the JSON server routes when adding endpoints.

## Domain Folder Reference

- `src/domains/contacts/` houses the contact CRM surface, including contact entities, profile editing flows, and list/table UI that call into the contacts application services.
- `src/domains/deals/` covers deal pipeline features: stage transitions, revenue projections, and the supporting workflows for updating opportunity records.
- `src/domains/identity/` centralises authentication and user-profile concerns such as session management, account preferences, and identity providers.
- `src/domains/leads/` owns inbound lead capture, qualification logic, and allocation rules that hand off qualified leads to downstream teams.
- `src/domains/organizations/` manages company account records, including organization-level metadata, hierarchy linking, and shared context pulled into other domains.

## Domain Layer Responsibilities

- `application/` hosts orchestrators, services, and tanstack/query hooks that coordinate persistence, networking, and domain rules for UI consumption.
- `domain/` keeps pure business logic: entity models, value objects, mappers, and validation helpers that should remain framework-agnostic.
- `ui/` contains React components, feature slices, and presentation logic scoped to the domain; treat them as the only layer allowed to depend on Next.js or design system primitives.

## Next Steps

- Audit each domain folder for lingering shared utilities and relocate them as needed.
- Add README snippets per domain describing data flows and API touchpoints once the migration stabilises.
