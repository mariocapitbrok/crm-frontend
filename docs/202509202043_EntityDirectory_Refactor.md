# Entity Directory Refactor

## Summary

Created a shared `EntityDirectory` component that encapsulates the saved view state machine, entity nav shell, and the `EntityTable` wiring. Leads and contacts directory pages are now thin wrappers that provide entity-specific data and column definitions.

## Motivation

- Reduce duplication between directory pages (Leads and Contacts already diverged but shared the same UI patterns).
- Provide a stable foundation for upcoming directory pages across CRM entities.
- Ensure saved view configuration, header layout persistence, and menu rendering stay consistent.

## Key Details

- New component lives at `src/components/EntityDirectory.tsx` and expects an `entity` descriptor (key, plural/singular labels, icon, menus, UI store).
- Handles loading/error rendering to match existing UX copy.
- Owns saved-view state (`SavedViewPicker`, `normalizeDiff`, temporary column configuration) and delegates data/columns to callers.
- Lead and Contact directory pages now import the component, declare their columns, and pass query results, keeping domain logic localized.
- `pnpm lint` passes after the refactor.

## Usage Guidelines

1. **Define the entity descriptor** inside the domain (e.g., `leads`, `contacts`). Supply the `key`, plural/singular labels, icon, default menus (typically `buildDefaultMenus` with the entity UI store), and the domain-specific UI store instance.
2. **Fetch and shape data** using TanStack Query or the relevant domain hooks. Map API records into a row type tailored to the table, including any computed fields (like resolved owner names).
3. **Declare columns with `EntityColumn<T>`** mirroring existing table behavior (filters, sort accessors, links). Keep the column array stable with `useMemo`.
4. **Render `EntityDirectory`** in the page component, passing the descriptor, rows, columns, and a `getRowId` function (usually the primary key). Provide loading/error state via the query flags.
5. **Optional customization**: use the `tableProps` bag (future API) to override header extras or pagination. Saved views, header layout persistence, and menus are already wired through the descriptor unless explicitly disabled.
6. **Add new directories** by repeating steps 1–4 for each bounded context (deals, organizations, etc.) to guarantee consistent UX and shared saved-view behavior.

## Next Steps / Considerations

- Finalize the public API for `EntityDirectory` (e.g., expose descriptor type, add optional flags for simplified directories).
- Migrate future entity directories (deals, organizations, etc.) onto the component to maintain parity.
- Add stories/tests to cover saved view workflows and header layout toggles.
