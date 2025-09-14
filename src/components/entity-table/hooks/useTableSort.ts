"use client"

import * as React from "react"
import type { EntityColumn, SortState } from "../types"

export function useTableSort<T>(params: {
  data: T[]
  columns: EntityColumn<T>[]
  initialSort?: SortState
}) {
  const { data, columns, initialSort = null } = params
  const [sort, setSort] = React.useState<SortState>(initialSort)

  const toggleSort = React.useCallback((columnId: string) => {
    setSort((prev) => {
      if (!prev || prev.columnId !== columnId) return { columnId, dir: "asc" }
      if (prev.dir === "asc") return { columnId, dir: "desc" }
      return null
    })
  }, [])

  const sorted = React.useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.id === sort.columnId)
    if (!col) return data
    const getVal = (r: T): unknown =>
      col.sortAccessor ? col.sortAccessor(r) : col.accessor(r)
    const arr = [...data]
    arr.sort((a, b) => {
      const av = getVal(a)
      const bv = getVal(b)
      const sa = av == null ? "" : String(av)
      const sb = bv == null ? "" : String(bv)
      return sort.dir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
    return arr
  }, [data, sort, columns])

  return { sort, setSort, toggleSort, sorted }
}

