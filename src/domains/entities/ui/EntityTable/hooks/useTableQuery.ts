"use client"

import * as React from "react"
import type { EntityColumn } from "../types"

export function useTableQuery<T>(params: {
  data: T[]
  columns: EntityColumn<T>[]
  initialQ?: string
  initialFilters?: Record<string, string>
}) {
  const { data, columns, initialQ = "", initialFilters = {} } = params
  const [q, setQ] = React.useState<string>(initialQ)
  const [filters, setFilters] = React.useState<Record<string, string>>(
    initialFilters
  )

  const filtered = React.useMemo(() => {
    if (!q && Object.keys(filters).length === 0) return data
    const qlc = q.trim().toLowerCase()
    return data.filter((row) => {
      if (qlc) {
        const colText = columns
          .map((c) => {
            const v = c.sortAccessor ? c.sortAccessor(row) : c.accessor(row)
            return String(v ?? "")
          })
          .join(" ")
          .toLowerCase()
        if (!colText.includes(qlc)) return false
      }

      for (const col of columns) {
        const f = filters[col.id]
        if (!f) continue
        const val =
          (col.sortAccessor ? col.sortAccessor(row) : col.accessor(row)) ?? ""
        const s = String(val).toLowerCase()
        if (!s.includes(f.toLowerCase())) return false
      }
      return true
    })
  }, [data, columns, q, filters])

  return { q, setQ, filters, setFilters, filtered }
}

