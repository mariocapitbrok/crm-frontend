"use client"

import * as React from "react"
import type { EntityColumn } from "../types"
import { TableRow, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronUp, Filter, MoreHorizontal } from "lucide-react"
import { PageSelectCheckbox } from "../PageSelectCheckbox"
import { Input } from "@/components/ui/input"

export function HeaderPopover<T>(props: {
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
                  <Button variant="ghost" size="icon" className="size-6">
                    <Filter className="size-3.5" />
                  </Button>
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
        <MoreHorizontal className="ml-auto size-4" />
      </TableHead>
    </TableRow>
  )
}
