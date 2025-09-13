"use client"

import React from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, MoreHorizontal, Search, Star, Filter } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type EntityColumn<T> = {
  id: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortAccessor?: (row: T) => string | number | Date | null | undefined
  width?: string | number
  filter?: {
    type: "text" | "select"
    options?: Array<{ label: string; value: string }>
    placeholder?: string
  }
}

export type EntityTableProps<T> = {
  data: T[]
  columns: EntityColumn<T>[]
  getRowId: (row: T) => string | number
  className?: string
  pageSize?: number
  title?: string
  headerLayout?: "split" | "stacked" | "inline" | "popover"
}

type SortState = { columnId: string; dir: "asc" | "desc" } | null

export default function EntityTable<T>({
  data,
  columns,
  getRowId,
  className,
  pageSize = 20,
  title,
  headerLayout = "split",
}: EntityTableProps<T>) {
  const [selected, setSelected] = React.useState<Set<string | number>>(new Set())
  const [sort, setSort] = React.useState<SortState>(null)
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [q, setQ] = React.useState("")
  const [page, setPage] = React.useState(0)

  const toggleSort = (columnId: string) => {
    setPage(0)
    setSort((prev) => {
      if (!prev || prev.columnId !== columnId) return { columnId, dir: "asc" }
      if (prev.dir === "asc") return { columnId, dir: "desc" }
      return null
    })
  }

  const filtered = React.useMemo(() => {
    const qlc = q.trim().toLowerCase()
    return data.filter((row) => {
      const colText = columns
        .map((c) => {
          const v = c.sortAccessor ? c.sortAccessor(row) : c.accessor(row)
          return String(v ?? "")
        })
        .join(" ")
        .toLowerCase()

      if (qlc && !colText.includes(qlc)) return false

      for (const col of columns) {
        const f = filters[col.id]
        if (!f) continue
        const val = (col.sortAccessor ? col.sortAccessor(row) : col.accessor(row)) ?? ""
        const s = String(val).toLowerCase()
        if (!s.includes(f.toLowerCase())) return false
      }
      return true
    })
  }, [data, columns, q, filters])

  const sorted = React.useMemo(() => {
    if (!sort) return filtered
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col) return filtered
    const getVal = (r: T) => (col.sortAccessor ? col.sortAccessor(r) : (col.accessor(r) as any))
    const arr = [...filtered]
    arr.sort((a, b) => {
      const av = getVal(a)
      const bv = getVal(b)
      const sa = av == null ? "" : String(av)
      const sb = bv == null ? "" : String(bv)
      return sort.dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
    return arr
  }, [filtered, sort, columns])

  const total = sorted.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const pageStart = page * pageSize
  const pageEnd = Math.min(total, pageStart + pageSize)
  const pageRows = sorted.slice(pageStart, pageEnd)

  const allOnPageSelected = pageRows.every((r) => selected.has(getRowId(r)))
  const toggleAllOnPage = () => {
    const next = new Set(selected)
    if (allOnPageSelected) {
      pageRows.forEach((r) => next.delete(getRowId(r)))
    } else {
      pageRows.forEach((r) => next.add(getRowId(r)))
    }
    setSelected(next)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="text-[13px]" onClick={() => setPage(0)}>
            <Search className="size-4" />
            Search
          </Button>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${title ?? "records"}...`}
            className="h-8 w-[320px]"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {total === 0 ? "0 of 0" : `${pageStart + 1} to ${pageEnd} of ${total}`}
        </div>
      </div>

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            {headerLayout === "split" ? (
              <>
                <TableRow>
                  <TableHead className="w-[44px]">
                    <input
                      type="checkbox"
                      aria-label="Select page"
                      checked={allOnPageSelected && pageRows.length > 0}
                      onChange={toggleAllOnPage}
                      className="size-4 accent-foreground"
                    />
                  </TableHead>
                  <TableHead className="w-[36px]"></TableHead>
                  {columns.map((col) => (
                    <TableHead key={col.id} style={{ width: col.width }}>
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{col.header}</span>
                        {sort?.columnId === col.id && (
                          sort.dir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        )}
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
                          onChange={(e) => {
                            setPage(0)
                            setFilters((f) => ({ ...f, [col.id]: e.target.value }))
                          }}
                          className="h-7"
                          placeholder={col.filter?.placeholder ?? "Filter"}
                        />
                      )}
                    </TableHead>
                  ))}
                  <TableHead></TableHead>
                </TableRow>
              </>
            ) : headerLayout === "inline" ? (
              <TableRow>
                <TableHead className="w-[44px] align-middle">
                  <input
                    type="checkbox"
                    aria-label="Select page"
                    checked={allOnPageSelected && pageRows.length > 0}
                    onChange={toggleAllOnPage}
                    className="size-4 accent-foreground"
                  />
                </TableHead>
                <TableHead className="w-[36px] align-middle"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.id} style={{ width: col.width }} className="relative align-middle">
                    <div className="group/col">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{col.header}</span>
                        {sort?.columnId === col.id && (
                          sort.dir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        )}
                      </button>
                      {col.filter?.type === "text" && (
                        <div className="pointer-events-none absolute left-0 right-0 top-full z-10 mt-1 opacity-0 transition-opacity group-hover/col:opacity-100 group-focus-within/col:opacity-100">
                          <Input
                            value={filters[col.id] ?? ""}
                            onChange={(e) => {
                              setPage(0)
                              setFilters((f) => ({ ...f, [col.id]: e.target.value }))
                            }}
                            className="pointer-events-auto h-7"
                            placeholder={col.filter?.placeholder ?? "Filter"}
                          />
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[44px] align-middle text-right">
                  <MoreHorizontal className="ml-auto size-4" />
                </TableHead>
              </TableRow>
            ) : (
              <TableRow>
                <TableHead className="w-[44px] align-middle">
                  <input
                    type="checkbox"
                    aria-label="Select page"
                    checked={allOnPageSelected && pageRows.length > 0}
                    onChange={toggleAllOnPage}
                    className="size-4 accent-foreground"
                  />
                </TableHead>
                <TableHead className="w-[36px] align-middle"></TableHead>
                {columns.map((col) => (
                  <TableHead key={col.id} style={{ width: col.width }} className="align-middle">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <span>{col.header}</span>
                        {sort?.columnId === col.id && (
                          sort.dir === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )
                        )}
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
                                onChange={(e) => {
                                  setPage(0)
                                  setFilters((f) => ({ ...f, [col.id]: e.target.value }))
                                }}
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
            )}
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)
              return (
                <TableRow key={String(id)} className={isSelected ? "bg-accent/30" : undefined}>
                  <TableCell className="align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = new Set(selected)
                        if (isSelected) next.delete(id)
                        else next.add(id)
                        setSelected(next)
                      }}
                      className="size-4 accent-foreground"
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <button className="text-muted-foreground hover:text-foreground" aria-label="Toggle favorite">
                      <Star className="size-4" />
                    </button>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id} className="align-top">
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  <TableCell className="align-top text-right">
                    <Button variant="ghost" size="icon" className="size-6">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-1 text-sm text-muted-foreground">
        <div>
          {selected.size > 0 ? `${selected.size} selected` : `${total} items`}
        </div>
        <div className="inline-flex items-center gap-2">
          <span>
            Page {page + 1} / {pages}
          </span>
          <Button
            disabled={page === 0}
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            disabled={page >= pages - 1}
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
