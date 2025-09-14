# EntityTable — Column Visibility, Persistence, and UX

This document summarizes the column visibility selector added to `EntityTable`, how it behaves, how to wire it up per entity, and key implementation details.

## Goals

- Let users choose which columns are visible in a table without affecting search/sort semantics.
- Keep the Columns menu open while toggling multiple items.
- Persist visibility preferences per entity across reloads.
- Keep the API small and reusable.

## UX Overview

- A Columns button (three-columns icon) is placed in the table header.
- Clicking it opens a checkbox list of all available columns.
- Toggling a checkbox hides/shows the column immediately.
- The menu stays open while toggling multiple items and closes only on blur/Escape.
- At least one column is always required (the last visible column cannot be unchecked).

## Files and Key Changes

- Table integration
  - `src/components/entity-table/EntityTable.tsx`
    - Maintains a `Set<string>` of visible column ids (`visibleIds`).
    - Renders only `visibleColumns` in both header and body.
    - Calls parent `onVisibleColumnsChange` in a `useEffect` after commit (avoids React "setState during render" warnings).
    - Auto-adds truly new columns by ID (does not re-add user-hidden ones).

- Header menus (both layouts)
  - `src/components/entity-table/header/HeaderPopover.tsx`
  - `src/components/entity-table/header/HeaderSplit.tsx`
    - Add Columns dropdown showing all columns with checkboxes.
    - `onSelect={(e) => e.preventDefault()}` on each item keeps the menu open while toggling.

- Types and wiring
  - `src/components/entity-table/types.ts`
    - Adds `ColumnVisibilityState` type alias (`string[]`).
  - `src/components/entity-table/header/Header.tsx`
    - Pass-through props for visibility control (`allColumns`, `visibleIds`, `onToggleVisible`).

- Leads page wiring (example 1)
  - `src/app/leads/page.tsx`
    - Provides `initialState={{ visibleColumns }}` and `onVisibleColumnsChange` to persist.
    - Uses `useLeadsUiStore` for per-entity persistence.

- Contacts page wiring (example 2)
  - `src/app/contacts/page.tsx`
    - Same pattern as Leads, using `useContactsUiStore`.

## Persistence (Zustand + localStorage)

- Reusable factory
  - `src/state/stores/createEntityUiStore.ts`
    - `createEntityUiStore(storageKey)` returns a persisted store with:
      - `headerLayout`, `setHeaderLayout`
      - `visibleColumns`, `setVisibleColumns`
    - Uses `persist(createJSONStorage(() => localStorage))`.

- Per-entity stores
  - Leads: `src/state/stores/leadsUiStore.ts` → `createEntityUiStore("leads-ui")`
  - Contacts: `src/state/stores/contactsUiStore.ts` → `createEntityUiStore("contacts-ui")`

## EntityTable API additions

- Props
  - `initialState.visibleColumns?: string[]` — initial visible column IDs.
  - `onVisibleColumnsChange?: (ids: string[]) => void` — called after commit when visibility changes (use to persist in store).

- Internal header props (wired by EntityTable)
  - `allColumns: EntityColumn<T>[]` — full list for the menu.
  - `visibleIds: Set<string>` — current visibility set.
  - `onToggleVisible: (id: string, checked: boolean) => void` — toggle handler.

## Behavior Notes

- Search and filters: still evaluate over the full set of columns (by design), even if some are hidden from view.
- Sorting: operates on the selected column; hidden columns are simply not rendered.
- Minimum one column: enforced in the toggle handler to prevent empty tables.

## Recipes

1) Add column persistence to a new entity

- Create a UI store:
  - `src/state/stores/<entity>UiStore.ts`
  - `export const use<Entity>UiStore = createEntityUiStore("<entity>-ui")`
- In the page:
  - Read `visibleColumns` and `headerLayout` from the store.
  - Pass `initialState={{ visibleColumns: visibleColumns ?? undefined }}` and `onVisibleColumnsChange={setVisibleColumns}` to `EntityTable`.

2) Keep Columns menu open while toggling

- Use Radix Dropdown `CheckboxItem` and prevent the default select behavior:
  - `<DropdownMenuCheckboxItem onSelect={(e) => e.preventDefault()} ... />`

## Troubleshooting

- Warning: "Cannot update a component while rendering a different component"
  - Cause: calling the parent/store setter during render.
  - Fix: call `onVisibleColumnsChange` inside a `useEffect` that depends on `visibleIds` (already implemented in `EntityTable`).

- Hidden columns reappear immediately
  - Cause: syncing effect re-added any non-visible columns.
  - Fix: only auto-add truly new column IDs by diffing against previous IDs (implemented with a `useRef` of previous IDs).

## Future Enhancements

- Column presets (saved views) per entity.
- Optional per-user storage (server side) instead of localStorage.
- Reorder and resize columns with persistence.
- Column metadata helper to generate columns from a compact schema.

