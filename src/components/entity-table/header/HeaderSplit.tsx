"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { TableRow, TableHead } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Columns3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageSelectCheckbox } from "../PageSelectCheckbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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
          </TableHead>
        ))}
        <TableHead className="w-[44px] text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="ml-auto inline-flex size-6 items-center justify-center rounded-md hover:bg-accent">
                <Columns3 className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {order.map((id, idx) => {
                const col = byId.get(id)
                if (!col) return null
                return (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleIds.has(col.id)}
                    onCheckedChange={(checked) => onToggleVisible(col.id, Boolean(checked))}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="flex-1 truncate">{col.header}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="inline-flex size-6 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onMoveColumn(col.id, -1)
                          }}
                          aria-label={`Move ${col.header} up`}
                          title="Move up"
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex size-6 items-center justify-center rounded hover:bg-accent disabled:opacity-40"
                          disabled={idx === order.length - 1}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onMoveColumn(col.id, 1)
                          }}
                          aria-label={`Move ${col.header} down`}
                          title="Move down"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </div>
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
