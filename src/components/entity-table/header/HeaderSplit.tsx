"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { TableRow, TableHead } from "@/components/ui/table"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageSelectCheckbox } from "../PageSelectCheckbox"

export function HeaderSplit<T>(props: {
  columns: EntityColumn<T>[]
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
    sort,
    onToggleSort,
    filters,
    onChangeFilter,
    allOnPageSelected,
    someOnPageSelected,
    onToggleAllOnPage,
  } = props

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
          <MoreHorizontal className="ml-auto size-4" />
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
