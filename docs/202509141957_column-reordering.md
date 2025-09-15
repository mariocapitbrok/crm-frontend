# Entity Table — Column Reordering (Drag & Drop)

This document explains how users can reorder table columns via drag & drop, and how the feature is implemented so developers can extend or troubleshoot it.

## User Experience

- Open the column manager via the columns button in the table header.
- In the “Customize Columns” dialog, drag rows by the grip icon to reorder.
- Toggle the “Visible” checkbox per column to show/hide it.
- Click “Done” to close. Reordering applies immediately while the dialog is open.

Keyboard support (provided by dnd-kit):

- Press Space on a row to begin dragging, use Arrow Up/Down to move, press Space to drop, or Esc to cancel.

## High-level Architecture

- The dialog UI and drag & drop are implemented with dnd-kit in `ColumnManagerDialog`.
- The table holds the authoritative column order state and updates it when the dialog moves items.
- Persistence is handled by each entity’s UI store (Zustand + localStorage) via `onColumnOrderChange`.

## Key Files

- `src/components/entity-table/header/ColumnManagerDialog.tsx:19`
  - Dialog component that renders the sortable list of columns and emits moves.
  - Uses `DndContext`, `SortableContext`, and `useSortable` from dnd-kit.
- `src/components/entity-table/header/ColumnManagerDialog.tsx:42`
  - `onDragEnd` calculates the move delta and calls the parent `onMoveColumn(id, delta)`.
- `src/components/entity-table/EntityTable.tsx:215`
  - `moveColumn` applies the delta to the local `order` array.
- `src/components/entity-table/EntityTable.tsx:200`
  - Effect that calls `onColumnOrderChange?.(order)` whenever order changes.
- `src/components/entity-table/EntityTable.tsx:130`
  - Reconciliation logic: when the column set changes (e.g., new columns shipped), removed IDs are pruned and new IDs are appended, preserving user order.
- `src/state/stores/createEntityUiStore.ts:9`
  - UI store shape with `columnOrder` and `setColumnOrder`, persisted to localStorage.
- `src/app/leads/page.tsx:169`
  - Example usage: passes initial `columnOrder` and wires `onColumnOrderChange` to the UI store.
- `src/app/contacts/page.tsx:156`
  - Another usage example with the Contacts entity.

## Data Flow

1. Page provides initial `columnOrder` (if any) to `EntityTable.initialState`.
2. User reorders in the dialog. `ColumnManagerDialog` calls `onMoveColumn(id, delta)`.
3. `EntityTable.moveColumn` updates local `order` state.
4. An effect in `EntityTable` emits `onColumnOrderChange(order)` to the parent.
5. The page persists `order` via the entity UI store (Zustand persist → localStorage).

## Developer Notes

- Stable IDs: Column IDs must be stable across renders. Reordering relies on ID matching.
- New/removed columns: The reconciliation effect prunes removed IDs and appends new IDs at the end to avoid clobbering user choice.
- Visibility vs. order: The dialog lets users hide columns, but order is kept for hidden ones so they remain in place when re-shown.
- At least one visible column: Hiding is prevented when only one column is left visible (`EntityTable.setVisible`).
- Sorting/filters: Independent of reordering; the header and filtering continue to work with the reordered list.

## Extending

- To add a new entity page, pass `initialState.columnOrder` and handle `onColumnOrderChange` the same way as Leads/Contacts.
- To customize drag behavior or accessibility, adjust sensors/strategies in the dialog:
  - `DndContext` sensors configured at `src/components/entity-table/header/ColumnManagerDialog.tsx:35`.

## Troubleshooting

- “Reordering doesn’t stick after refresh”: Ensure the page wires `onColumnOrderChange` into the entity UI store and passes `initialState.columnOrder` from that store on mount.
- “New columns are missing”: They should auto-append to the end on first load after deployment. Verify reconciliation in `EntityTable.tsx:130` and that the new column has a unique `id`.
- “Can’t hide the last column”: By design to keep the table usable. Add logic if you want to relax this.
