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
import type { SortState as HookSortState, EntityColumn, SortState, HeaderLayout, GetRowId, ID } from "./types"
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
  initialState?: {
    q?: string
    filters?: Record<string, string>
    sort?: SortState
    page?: number
    selected?: Set<ID>
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

  const handleFilterChange = (columnId: string, value: string) => {
    setPage(0)
    setFilters((f) => ({ ...f, [columnId]: value }))
  }

  const renderedBulkActions = React.useMemo(() => {
    if (typeof bulkActions === "function") return bulkActions({ selected })
    return bulkActions
  }, [bulkActions, selected])

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
              columns={columns}
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
                  columns={columns}
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
