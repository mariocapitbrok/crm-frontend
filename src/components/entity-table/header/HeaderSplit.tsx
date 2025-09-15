"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { TableRow, TableHead } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Columns3, Funnel } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageSelectCheckbox } from "../PageSelectCheckbox"
import { Button } from "@/components/ui/button"
import { ColumnManagerDialog } from "./ColumnManagerDialog"

export function HeaderSplit<T>(props: {
  columns: EntityColumn<T>[]
  allColumns: EntityColumn<T>[]
  visibleIds: Set<string>
  onToggleVisible: (id: string, checked: boolean) => void
  order: string[]
  onMoveColumn: (id: string, delta: number) => void
  sort: { columnId: string; dir: "asc" | "desc" } | null
  onToggleSort: (columnId: string) => void
  filters: Record<string, string>
  onChangeFilter: (columnId: string, value: string) => void
  allOnPageSelected: boolean
  someOnPageSelected: boolean
  onToggleAllOnPage: () => void
}) {
  const {
    columns,
    allColumns,
    visibleIds,
    onToggleVisible,
    order,
    onMoveColumn,
    sort,
    onToggleSort,
    filters,
    onChangeFilter,
    allOnPageSelected,
    someOnPageSelected,
    onToggleAllOnPage,
  } = props
  const byId = React.useMemo(() => new Map(allColumns.map((c) => [c.id, c])), [allColumns])

  return (
    <>
      <TableRow>
        <TableHead className="w-[44px]">
          <PageSelectCheckbox
            checked={allOnPageSelected}
            indeterminate={someOnPageSelected}
            onChange={onToggleAllOnPage}
            className="size-4 accent-foreground"
          />
        </TableHead>
        <TableHead className="w-[36px]"></TableHead>
        {columns.map((col) => (
          <TableHead key={col.id} style={{ width: col.width }}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onToggleSort(col.id)}
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span>{col.header}</span>
                {sort?.columnId === col.id &&
                  (sort.dir === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  ))}
              </button>
              {col.filter?.type && filters[col.id] && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative size-6 pointer-events-none"
                  aria-hidden
                  title="Filter active"
                >
                  <Funnel className="size-3.5" />
                  <span className="absolute right-0 top-0 inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
                </Button>
              )}
            </div>
          </TableHead>
        ))}
        <TableHead className="w-[44px] text-right">
          <ColumnManagerDialog
            allColumns={allColumns}
            order={order}
            visibleIds={visibleIds}
            onToggleVisible={onToggleVisible}
            onMoveColumn={onMoveColumn}
            trigger={
              <button type="button" className="ml-auto inline-flex size-6 items-center justify-center rounded-md hover:bg-accent">
                <Columns3 className="size-4" />
              </button>
            }
          />
        </TableHead>
      </TableRow>
      <TableRow>
        <TableHead></TableHead>
        <TableHead></TableHead>
        {columns.map((col) => (
          <TableHead key={col.id}>
            {col.filter?.type === "text" && (
              <Input
                value={filters[col.id] ?? ""}
                onChange={(e) => onChangeFilter(col.id, e.target.value)}
                className="h-7"
                placeholder={col.filter?.placeholder ?? "Filter"}
              />
            )}
          </TableHead>
        ))}
        <TableHead></TableHead>
      </TableRow>
    </>
  )
}
