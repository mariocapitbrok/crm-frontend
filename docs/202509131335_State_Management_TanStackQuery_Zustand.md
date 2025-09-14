# State Management: TanStack Query + Zustand

This document explains how to install, configure, and use the selected state management stack. It also summarizes why we chose it and the alternatives we considered.

## 1. Stack Overview

- Server cache: TanStack Query — fetching, caching, mutations, optimistic updates, and invalidation.
- UI/process state: Zustand — lightweight store for purely client-side view state (e.g., table layout, toggles).
- Validation/typing: TypeScript-first; you can add Zod if runtime validation is required.

Separation of concerns: the server remains the source of truth (Query), while local presentational concerns live in a small store (Zustand). This scales from CRM to ERP without over-centralizing state.

## 2. Install

Already installed in this repo. If starting fresh:

```sh
pnpm add @tanstack/react-query zustand
```

## 3. Configuration

### 3.1 Provider and App Shell

Wrap the app with a QueryClientProvider. We expose a tiny component for this.

- `src/components/QueryProvider.tsx`
- `src/app/layout.tsx` wraps children with `QueryProvider` inside `ThemeProvider` and renders the global `NavBar` so it appears on all routes.
- Accessibility: Radix Dialog/Sheet require a description to avoid dev warnings—include `DialogDescription`/`SheetDescription` with your title or explicitly set `aria-describedby={undefined}` when no description is needed. See also: `docs/202509030141_crm_ui_integration_guide_shadcn_ui_deps.md` (Accessibility section).

### 3.2 API Base URL

The HTTP helper reads `NEXT_PUBLIC_API_URL` and falls back to json-server at `http://localhost:3001`.

- `src/state/queries/client.ts:1`
- Optional env: add to `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3.3 Dev backend

Run the local API (json-server) and the Next.js app:

```sh
pnpm dev:api:routes   # starts json-server on :3001 with routes
pnpm dev              # starts Next.js
```

## 4. Project Layout (state)

- `src/state/queries/keys.ts`: central query keys per domain.
- `src/state/queries/client.ts`: `apiBase()` and `http()` helper.
- `src/state/queries/leads.ts`: typed hooks: `useLeads`, `useUsers`, `useCreateLead`, `useUpdateLead`.
- `src/state/stores/defaultEntityUiStore.ts`: Base UI store used by default (table header layout, column visibility). Create per-entity stores only when customization is required.
- `src/components/QueryProvider.tsx`: provides a configured `QueryClient`.

## 5. How It Works

### 5.1 Queries and caching (TanStack Query)

- Define a stable key via `queryKeys` and a `queryFn` that fetches from your API.
- Use `useQuery` to read, `useMutation` to write; call `invalidateQueries` to refresh lists.
- Defaults: `staleTime` of 30s and `refetchOnWindowFocus=false` are set in the provider.

Example (`src/state/queries/leads.ts`):

- `useLeads()` fetches `/leads`.
- `useUsers()` fetches `/users`.
- `useCreateLead()` and `useUpdateLead()` mutate and then invalidate the `leads` key.

### 5.2 UI state (Zustand)

- Keep presentational preferences (e.g., table header layout) out of the server cache.
- `useDefaultEntityUiStore` holds `headerLayout` (`"split" | "popover"`) and `visibleColumns`.

### 5.3 Wiring in the UI

- Leads page maps server data to the table rows and reads the UI store for the current layout.
  - `src/app/leads/page.tsx`
- The “View” menu updates `headerLayout` via the menubar.
  - `src/components/EntityMenu.tsx`
- The table supports two header layouts:
  - `split`: two-row header, filters visible in a dedicated second row.
  - `popover`: compact header, filters inside a popover per column.
  - `src/components/EntityTable.tsx`

## 6. Why This Stack

- Next.js friendly: Works cleanly with client components and SSR/RSC boundaries.
- Clear separation: Server cache vs view state avoids a “god store”.
- Ergonomics: First-class mutations + invalidation, optimistic updates when needed.
- Scale: Easy to add modules/domains; query keys and hooks keep ownership clear.
- Team velocity: Less boilerplate than Redux for CRUD-heavy UIs.

## 7. Alternatives We Considered

- Redux Toolkit + RTK Query
  - Pros: single ecosystem, strong DevTools, middleware, entity adapters.
  - Cons: more boilerplate; mixing server cache and UI state in one store can grow complex.
- GraphQL (Apollo / Relay)
  - Pros: normalized cache across complex graphs, multi-client friendly.
  - Cons: schema/codegen overhead; Relay learning curve; may be heavy for early stages.
- tRPC + TanStack Query
  - Pros: end-to-end TypeScript types without codegen.
  - Cons: couples to Node/TS stack; not ideal if you need REST or polyglot services.
- Client-only store (Zustand-only, MobX, etc.)
  - Pros: very simple.
  - Cons: you lose server cache semantics (stale, retries, background refresh, etc.).

## 8. Adding a New Entity (Pattern)

1.Create keys and hooks

- `src/state/queries/<entity>.ts` with `use<Entity>s`, mutations, and types.
- Add key in `src/state/queries/keys.ts`.

  2.Use in a page/component

- Call `use<Entity>s()` in your page, map to your view model, pass to UI.

  3.Optional UI store

- If the module needs local preferences (filters layout, density, selected tabs), add a small Zustand store under `src/state/stores/`.

  4.Mutations

- Use `useMutation`; on success, call `invalidateQueries({ queryKey: ... })` for the affected lists.

## 9. Real-time and Offline (Future)

- Real-time: forward server events via WebSocket/SSE and `invalidateQueries` specific keys.
- Offline: queue mutations and replay on reconnect; TanStack Query supports retries and persistence helpers.

## 10. DevTools (Optional)

Add React Query Devtools during development for visibility into cache state.

```sh
pnpm add -D @tanstack/react-query-devtools
```

Then conditionally include in `QueryProvider` for dev builds.

## 11. Troubleshooting

- 404/Network errors: check `NEXT_PUBLIC_API_URL` and that json-server is running on `:3001`.
- Data not refreshing after write: ensure `invalidateQueries` targets the correct key.
- Hydration warnings: keep data fetching inside client components that use hooks; server components should not call `useQuery`.

## 12. References (Code)

- `src/components/QueryProvider.tsx`
- `src/app/layout.tsx:20`
- `src/state/queries/client.ts:1`
- `src/state/queries/keys.ts:1`
- `src/state/queries/leads.ts:1`
- `src/state/stores/defaultEntityUiStore.ts:1`
- `src/app/leads/page.tsx:1`
- `src/components/EntityMenu.tsx:1`
- `src/components/EntityTable.tsx:1`
