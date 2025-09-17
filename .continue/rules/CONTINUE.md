# CONTINUE.md — Project Guide

This guide helps Continue and your team understand and work effectively with this codebase.

Note: Sections flagged with [Needs verification] are based on reasonable assumptions and should be reviewed.

## 1) Project Overview

- Purpose: A CRM-like frontend built with Next.js (App Router) featuring an EntityTable UI with filtering, sorting, pagination, selection, and "Saved Views". It consumes a mock API served by json-server.
- Key technologies:
  - Next.js 15 (App Router), React 19, TypeScript
  - Tailwind CSS v4, shadcn/ui, Radix UI primitives
  - State/data: TanStack React Query, Zustand (persisted UI preferences)
  - Mock API: json-server with generated db.json
- High-level architecture:
  - app/: pages and layouts
  - components/: UI components, including entity-table and entity-views (Saved Views)
  - state/: TanStack Query hooks and Zustand UI stores
  - febe/: Frontend backend service abstraction (Saved Views in-memory implementation)
  - scripts/: db generator and helpers for json-server

## 2) Getting Started

Prerequisites

- Node.js 20+
- pnpm (recommended) or npm/yarn
- Port availability: 3000 (Next.js), 3001 (json-server)

Install

- pnpm install

Run the mock API (recommended to start first)

- pnpm dev:api
  - Variants:
    - pnpm dev:api:routes (use routes.json)
    - pnpm dev:api:regen (regenerate db.json then serve)
    - pnpm dev:api:routes:regen

Run the web app

- pnpm dev
- App: http://localhost:3000
- API: http://localhost:3001

Environment variables

- NEXT_PUBLIC_API_URL: Override API base (defaults to http://localhost:3001)
- NEXT_PUBLIC_API_MODE: Saved Views backend mode. Current options: InMemory (default)
- PINY_VISUAL_SELECT: If 'true' in development, includes a visual selection script (see src/app/layout.tsx)

Build and start

- pnpm build
- pnpm start

Running tests

- [Needs verification] No test setup is present. Consider adding Vitest/Jest and Playwright/Cypress for E2E.

## 3) Project Structure

Top-level

- src/app: Next.js App Router entry points (layouts and pages)
- src/components: UI components (shadcn/ui-based + custom)
  - entity-table: Entity table implementation with header/body, hooks, and types
  - entity-views: Saved Views picker and hook
  - entity-menu: Application menubar and View menu for header layout
- src/state: Client data fetching and UI stores
  - queries: TanStack Query hooks and API client
  - stores: Zustand stores for per-entity UI preferences
- src/febe: Frontend-service layer for Saved Views (in-memory implementation, types, auth stub)
- scripts: Mock DB generator and helpers
- docs: Developer notes and setup guides

Key files

- src/app/layout.tsx: Root layout, ThemeProvider, QueryProvider, ApiProvider, NavBar
- src/app/page.tsx: Home redirects to Leads page
- src/app/leads/page.tsx: Leads page integrating EntityTable and SavedViewPicker
- src/app/contacts/page.tsx: Contacts page with per-entity UI store
- src/components/entity-table/EntityTable.tsx: Table container wiring query/sort/pagination/selection, column visibility and order
- src/components/entity-views/SavedViewPicker.tsx: UI to select/create/update/delete saved views
- src/entities/registry.ts: Entity registry configuring titles, icons, UI stores, and menus
- src/state/queries/client.ts: API base and HTTP helper
- src/state/queries/leads.ts, contacts.ts, views.ts: Data hooks
- src/state/stores/createEntityUiStore.ts: Zustand factory for header layout and column prefs (persisted)
- src/febe/inmemory/savedViews.ts: In-memory Saved Views service with simple auth/permissions
- package.json: Scripts for dev app and API
- routes.json: Friendly paths for json-server

Important configuration

- next.config.ts: Next.js config (minimal)
- tsconfig.json: Path aliases (@/_ → ./src/_)
- eslint.config.mjs: ESLint flat config
- postcss.config.mjs: Tailwind CSS v4 postcss plugin

## 4) Development Workflow

Coding standards and conventions

- TypeScript strict mode enabled
- ESLint: next/core-web-vitals and next/typescript flat config
- UI components use shadcn/ui patterns; utilities via lib/utils.ts (cn)
- Keep client-only code in "use client" components (e.g., pages using Zustand or browser APIs)

Testing

- [Needs verification] No tests configured. Recommended:
  - Unit: Vitest + @testing-library/react
  - E2E: Playwright or Cypress

Build and deployment

- Build: pnpm build
- Start: pnpm start
- Vercel: Standard Next.js deployment should work; ensure API base URL is set appropriately

Contribution guidelines

- Branch naming and PR process: [Needs verification]
- Commit style: [Needs verification] Consider Conventional Commits
- Code style: Use ESLint and organize imports (see docs/202509130813_vscode_organize_imports.md)

## 5) Key Concepts

- Entity: A business object type (leads, contacts, organizations, deals). Registered in src/entities/registry.ts.
- EntityTable: A reusable table with:
  - Querying: free-text q and per-column filters
  - Sorting: toggleable asc/desc per column
  - Pagination: client-side
  - Selection: page-only and all-matching selection
  - Column visibility and ordering (persisted per entity via Zustand)
  - Header layout modes: "split" or "popover" (toggle via Entity Menu)
- Saved Views: Named presets containing q, filters, sort, visibleColumns, columnOrder, headerLayout, etc.
  - Service abstraction in src/febe; in-memory implementation for development
  - Permissions: basic owner/admin rules in savedViews.ts (in-memory)
- State: TanStack Query for server state; Zustand for UI state

Design patterns

- Provider pattern: QueryProvider and ApiProvider wrap the app
- Registry pattern: Entity registry centralizes UI config per entity
- Hook composition: useTableQuery/useTableSort/useTablePagination/useTableSelection

## 6) Common Tasks

Run the app and API

- pnpm dev:api
- pnpm dev

Regenerate mock data and serve API

- pnpm dev:api:regen

Add a new entity page

1. Create a UI store (optional) by calling createEntityUiStore with a unique key in src/state/stores.
2. Add the entity entry to src/entities/registry.ts (title, icon, uiStore, menus).
3. Create the page under src/app/<entity>/page.tsx.
   - Fetch data using TanStack Query hooks (see leads.ts/contacts.ts for patterns).
   - Define columns: id, header, accessor, optional sortAccessor, filter, width.
   - Render <EntityTable /> with getRowId and handlers for visibleColumns/columnOrder.
4. Link in navigation if applicable (NavBar or routes).

Customize columns for an entity

- Edit columns in the relevant page file (e.g., src/app/leads/page.tsx).
- Use filter props: type: "text" | "select" and options when needed.

Use Saved Views on Leads

- The Leads page integrates SavedViewPicker. To save current state:
  - Adjust filters/sort/columns, then click "+" to "Save as New".
  - Select a saved view from the dropdown to apply it.
  - Use the rotate icon to reset to the default working state.
  - Use the disk icon to update an existing view when changes are dirty.

Switch table header layout

- Open the top menubar → View → Table header → choose "Split filters" or "Popover filters".

Point the app to a different API

- Set NEXT_PUBLIC_API_URL (e.g., https://api.example.com) and restart dev server.

Add a shadcn/ui component

- Use CLI scripts in package.json (shadcn:list, shadcn:add, shadcn:diff).
- See docs/202509030140_shadcn_ui_setup.md and docs/202509030849_shadcn_cli_guide.md.

## 7) Troubleshooting

- 404/Network errors fetching data
  - Ensure json-server is running on port 3001 or set NEXT_PUBLIC_API_URL.
  - Verify routes.json usage if relying on alternative endpoints.
- Persisted UI state seems wrong or stuck
  - UI prefs are stored in localStorage (keys like entity-ui-default, contacts-ui). Clear site data to reset.
- Column visibility resets when adding new columns
  - The table auto-adds only truly new column ids while preserving hidden ones. Verify column ids are stable strings.
- Hydration warnings or localStorage errors
  - Ensure components using Zustand stores are marked "use client".
- Saved Views permissions errors
  - In-memory service enforces basic rules (e.g., only admin can create shared views). See src/febe/inmemory/savedViews.ts.
- Tailwind/shadcn tokens not applied
  - Verify src/app/globals.css and that Tailwind v4 + postcss plugin are configured. See docs/202509030140_shadcn_ui_setup.md.

## 8) References

- Next.js: https://nextjs.org/docs
- React Query: https://tanstack.com/query/latest
- Zustand: https://docs.pmnd.rs/zustand
- Tailwind CSS v4: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com/
- json-server: https://github.com/typicode/json-server

Local docs in repo

- docs/202509030130_DB_Generator_and_JSON_Server.md
- docs/202509030140_shadcn_ui_setup.md
- docs/202509030849_shadcn_cli_guide.md
- docs/202509131335_State_Management_TanStackQuery_Zustand.md
- docs/202509141020_EntityTable_Column_Visibility.md
- docs/202509141135_EntityMenu_Menubar.md
- docs/202509141957_column-reordering.md
- docs/202510011200_GeneralEntityPage_Component.md

---

Maintenance notes

- Keep this CONTINUE.md updated as you add entities, services, and backend modes.
- Consider adding tests and CI to validate table behavior, Saved Views, and query-layer integrations.
