"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHeader } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { MoreHorizontal } from "lucide-react"
import React from "react"
import { Edit, UserPlus, Tags, Trash2 } from "lucide-react"
import { useTableQuery } from "./hooks/useTableQuery"
import { useTableSort } from "./hooks/useTableSort"
import { useTablePagination } from "./hooks/useTablePagination"
import { useTableSelection } from "./hooks/useTableSelection"
import { Header as EntityTableHeader } from "./header/Header"
import { SelectionBar } from "./SelectionBar"
import { Row as EntityRow } from "./body/Row"
import type {
  SortState as HookSortState,
  EntityColumn,
  SortState,
  HeaderLayout,
  GetRowId,
  ID,
  ColumnVisibilityState,
  ColumnOrderState,
} from "./types"
import { Pagination as EntityPagination } from "./Pagination"
import { SearchBar } from "./SearchBar"

export type EntityTableProps<T> = {
  data: T[]
  columns: EntityColumn<T>[]
  getRowId: GetRowId<T>
  className?: string
  pageSize?: number
  title?: string
  headerLayout?: HeaderLayout
  searchDebounceMs?: number
  bulkActions?: React.ReactNode | ((ctx: { selected: Set<ID> }) => React.ReactNode)
  rowActions?: (row: T) => React.ReactNode
  onToggleFavorite?: (id: ID) => void
  onSelectionChange?: (ids: Set<ID>) => void
  onVisibleColumnsChange?: (ids: ColumnVisibilityState) => void
  onColumnOrderChange?: (ids: ColumnOrderState) => void
  initialState?: {
    q?: string
    filters?: Record<string, string>
    sort?: SortState
    page?: number
    selected?: Set<ID>
    visibleColumns?: ColumnVisibilityState
    columnOrder?: ColumnOrderState
  }
}

export default function EntityTable<T>({
  data,
  columns,
  getRowId,
  className,
  pageSize = 20,
  title,
  headerLayout = "popover",
  searchDebounceMs = 150,
  bulkActions,
  rowActions,
  onToggleFavorite,
  onSelectionChange,
  onVisibleColumnsChange,
  onColumnOrderChange,
  initialState,
}: EntityTableProps<T>) {
  const { q, setQ, filters, setFilters, filtered } = useTableQuery<T>({
    data,
    columns,
    initialQ: initialState?.q,
    initialFilters: initialState?.filters,
  })

  const { sort, toggleSort, sorted } = useTableSort<T>({
    data: filtered,
    columns,
    initialSort: (initialState?.sort as HookSortState) ?? null,
  })

  const handleToggleSort = (columnId: string) => {
    setPage(0)
    toggleSort(columnId)
  }

  const {
    page,
    setPage,
    pageJump,
    setPageJump,
    goToPage,
    pages,
    total,
    pageStart,
    pageEnd,
    pageRows,
  } = useTablePagination<T>({ data: sorted, pageSize, initialPage: initialState?.page })

  const {
    selected,
    toggleAllOnPage,
    allOnPageSelected,
    someOnPageSelected,
    allMatchingSelected,
    selectAllMatching,
    toggleOne,
    clearSelection,
  } = useTableSelection<T>({
    pageRows,
    allRows: sorted,
    getRowId,
    initialSelected: initialState?.selected,
    onChange: onSelectionChange,
  })

  // Column visibility
  const [visibleIds, setVisibleIds] = React.useState<Set<string>>(
    () => new Set(initialState?.visibleColumns ?? columns.map((c) => c.id))
  )

  // Column order
  const [order, setOrder] = React.useState<string[]>(
    () => initialState?.columnOrder ?? columns.map((c) => c.id)
  )

  // Track only truly new columns (by id) and auto-add them as visible,
  // without re-adding columns the user intentionally hid.
  const prevColumnIdsRef = React.useRef<Set<string>>(new Set(columns.map((c) => c.id)))
  React.useEffect(() => {
    const currentIdsArr = columns.map((c) => c.id)
    const currentIds = new Set(currentIdsArr)
    const prevIds = prevColumnIdsRef.current
    const added: string[] = []
    for (const id of currentIds) {
      if (!prevIds.has(id)) added.push(id)
    }
    if (added.length > 0) {
      setVisibleIds((prev) => {
        const next = new Set(prev)
        for (const id of added) next.add(id)
        return next
      })
    }
    // Reconcile order: drop removed ids, append new ones at the end
    setOrder((prev) => {
      const filtered = prev.filter((id) => currentIds.has(id))
      // Append any new ids in the order they appear in columns
      for (const id of currentIdsArr) {
        if (!filtered.includes(id)) filtered.push(id)
      }
      // If nothing changed, avoid creating a new array to prevent effect loops
      if (
        filtered.length === prev.length &&
        filtered.every((v, i) => v === prev[i])
      ) {
        return prev
      }
      return filtered
    })
    prevColumnIdsRef.current = currentIds
  }, [columns])

  const columnsById = React.useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns]
  )

  const visibleColumns = React.useMemo(() => {
    const list: EntityColumn<T>[] = []
    for (const id of order) {
      if (!visibleIds.has(id)) continue
      const c = columnsById.get(id)
      if (c) list.push(c as EntityColumn<T>)
    }
    return list
  }, [order, visibleIds, columnsById])

  const setVisible = (id: string, checked: boolean) => {
    setVisibleIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        if (next.size <= 1) return prev // enforce at least one visible column
        next.delete(id)
      }
      return next
    })
  }

  React.useEffect(() => {
    onVisibleColumnsChange?.(Array.from(visibleIds))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds])

  React.useEffect(() => {
    onColumnOrderChange?.(order)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  const handleFilterChange = (columnId: string, value: string) => {
    setPage(0)
    setFilters((f) => ({ ...f, [columnId]: value }))
  }

  const renderedBulkActions = React.useMemo(() => {
    if (typeof bulkActions === "function") return bulkActions({ selected })
    return bulkActions
  }, [bulkActions, selected])

  const moveColumn = (id: string, delta: number) => {
    setOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const nextIdx = idx + delta
      if (nextIdx < 0 || nextIdx >= prev.length) return prev
      const next = prev.slice()
      const [item] = next.splice(idx, 1)
      next.splice(nextIdx, 0, item)
      return next
    })
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <SearchBar
        q={q}
        onChange={setQ}
        title={title}
        summary={total === 0 ? "0 of 0" : `${pageStart + 1} to ${pageEnd} of ${total}`}
        className="px-2"
        debounceMs={searchDebounceMs}
      />

      {selected.size > 0 && (
        <div className="sticky top-0 z-20 border-b bg-muted/50 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
          <SelectionBar
            selectedCount={selected.size}
            allOnPageSelected={allOnPageSelected}
            someOnPageSelected={someOnPageSelected}
            onToggleAllOnPage={toggleAllOnPage}
            onClearSelection={clearSelection}
            canSelectAllMatching={!allMatchingSelected && total > 0 && selected.size > 0}
            totalMatching={total}
            onSelectAllMatching={selectAllMatching}
          >
            {renderedBulkActions ?? (
              <>
                <Button size="sm" className="text-[13px]">
                  <Edit className="mr-2 size-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-[13px]">
                  <UserPlus className="mr-2 size-4" />
                  Assign
                </Button>
                <Button variant="outline" size="sm" className="text-[13px]">
                  <Tags className="mr-2 size-4" />
                  Tags
                </Button>
                <Button variant="destructive" size="sm" className="text-[13px]">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" className="text-[13px]">
                  <MoreHorizontal className="size-4" />
                </Button>
              </>
            )}
          </SelectionBar>
        </div>
      )}

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <EntityTableHeader
              layout={headerLayout}
              columns={visibleColumns}
              allColumns={columns}
              visibleIds={visibleIds}
              onToggleVisible={setVisible}
              order={order}
              onMoveColumn={moveColumn}
              sort={sort}
              onToggleSort={handleToggleSort}
              filters={filters}
              onChangeFilter={handleFilterChange}
              allOnPageSelected={allOnPageSelected}
              someOnPageSelected={someOnPageSelected}
              onToggleAllOnPage={toggleAllOnPage}
            />
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              const id = getRowId(row)
              return (
                <EntityRow
                  key={String(id)}
                  row={row}
                  columns={visibleColumns}
                  getRowId={getRowId}
                  isSelected={selected.has(id)}
                  onToggleSelected={toggleOne}
                  onToggleFavorite={onToggleFavorite}
                  actions={rowActions?.(row)}
                />
              )
            })}
          </TableBody>
        </Table>
      </div>

      <EntityPagination
        page={page}
        pages={pages}
        pageJump={pageJump}
        setPageJump={setPageJump}
        onGoTo={goToPage}
        onPrev={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => Math.min(pages - 1, p + 1))}
        summary={selected.size > 0 ? `${selected.size} selected` : `${total} items`}
        className="px-2 py-1 text-sm text-muted-foreground"
      />
    </div>
  )
}
