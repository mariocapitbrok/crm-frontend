"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { TableRow, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronUp, Funnel, Columns3 } from "lucide-react"
import { PageSelectCheckbox } from "../PageSelectCheckbox"
import { Input } from "@/components/ui/input"
import { ColumnManagerDialog } from "./ColumnManagerDialog"

export function HeaderPopover<T>(props: {
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
    <TableRow>
      <TableHead className="w-[44px] align-middle">
        <PageSelectCheckbox
          checked={allOnPageSelected}
          indeterminate={someOnPageSelected}
          onChange={onToggleAllOnPage}
          className="size-4 accent-foreground"
        />
      </TableHead>
      <TableHead className="w-[36px] align-middle"></TableHead>
      {columns.map((col) => (
        <TableHead key={col.id} style={{ width: col.width }} className="align-middle">
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
            {col.filter?.type && (
              <Popover>
                <PopoverTrigger asChild>
                  {(() => {
                    const active = Boolean(filters[col.id])
                    return (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative size-6"
                        aria-label={active ? "Edit filter (active)" : "Add filter"}
                        title={active ? "Edit filter" : "Add filter"}
                      >
                        <Funnel className="size-3.5" />
                        {active && (
                          <span className="absolute right-0 top-0 inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
                        )}
                      </Button>
                    )
                  })()}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2">
                  {col.filter?.type === "text" && (
                    <Input
                      autoFocus
                      value={filters[col.id] ?? ""}
                      onChange={(e) => onChangeFilter(col.id, e.target.value)}
                      className="h-8"
                      placeholder={col.filter?.placeholder ?? "Filter value"}
                    />
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </TableHead>
      ))}
      <TableHead className="w-[44px] align-middle text-right">
        <ColumnManagerDialog
          allColumns={allColumns}
          order={order}
          visibleIds={visibleIds}
          onToggleVisible={onToggleVisible}
          onMoveColumn={onMoveColumn}
          trigger={
            <Button variant="ghost" size="icon" className="ml-auto size-6">
              <Columns3 className="size-4" />
            </Button>
          }
        />
      </TableHead>
    </TableRow>
  )
}
