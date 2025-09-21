# Plan for Introducing Bounded Contexts

## 1. Discover and Document Subdomains

- Facilitate a short domain discovery workshop to split the CRM scope into coarse contexts such as Lead Management, Contact Management, Sales Pipeline (deals), and Organization Management. Use the current route components as input—the Leads page mixes querying, saved-view state, and table wiring in one place, which signals a missing domain boundary.
- Capture a lightweight context map that records each context’s responsibilities, upstream/downstream relationships, and any shared concepts (e.g., users as owners). This map will guide which parts of today’s shared infrastructure need to be duplicated or abstracted.

## 2. Create Context Packages Under `src/domains`

- Introduce a top-level `src/domains/<context>` folder for each subdomain. Seed each package with folders for `application` (query/mutation hooks, services), `domain` (entities/value objects), and `ui` (context-specific components or adapters).
- Move leads-specific hooks from `src/state/queries/leads.ts` into `src/domains/leads/application/queries.ts`, renaming exports to clarify intent (e.g., `useLeadDirectory`). The shared `useUsers` hook currently lives beside lead queries and should instead move to the context that truly owns user identity (or into a dedicated “identity” context) to avoid the Contacts page reaching into Leads logic.
- Perform the same extraction for contacts, deals, and organizations so that each context has an isolated application layer.

## 3. Modularize UI State Management

- Replace `useDefaultEntityUiStore`/`useContactsUiStore` with per-context stores living alongside the rest of the domain package. Update the entity registry (or its eventual replacement) to import the store from that context instead of a global store, avoiding the “generic” store that currently backs multiple contexts.
- For shared UX primitives (tables, nav bars), keep them in `src/components`, but add thin adapters inside each context’s `ui` folder to bind domain data to shared presentation components. This keeps domain state in the context package while still reusing visual primitives.

## 4. Refactor Pages into Context Shells

- Replace the current route components with thin shells that simply render a context-specific feature component (e.g., `<LeadsDirectoryPage />`) imported from `src/domains/leads/ui`. This removes the ad-hoc logic presently embedded in `src/app/leads/page.tsx` and ensures all business behaviour lives inside the context package.
- During the migration, keep route-level components delegating to both old and new implementations behind feature flags to allow gradual rollout.

## 5. Define Explicit Integration Contracts

- Where contexts need data from others (e.g., Contacts needing user display names), expose it through a well-named interface or query exported from the owning context. Avoid direct cross-context imports such as Contacts pulling `useUsers` from the Leads module by instead introducing an `identity` context or a shared contract defined in the context map.
- Document these contracts in the context map so future work respects the established boundaries.

## 6. Incrementally Migrate and Validate

- Move one context at a time (start with Leads since it has the richest logic) to the new structure, updating imports and ensuring the UI still renders correctly.
- After each migration, run existing tests and add targeted unit/integration tests inside the context package to enforce that queries, stores, and UI wiring remain internal to that context.

## 7. Retire the Central Entity Registry

- Once each page resolves its config from its context package, deprecate the current `entityRegistry`. Replace it with context-local configuration objects or a higher-level routing map that simply delegates to the context. This prevents different domains from sharing the same icon/menu/store definitions by accident.

Following these steps will progressively introduce clear bounded contexts, isolate domain behaviour, and eliminate the cross-feature coupling that currently blurs CRM subdomains.
