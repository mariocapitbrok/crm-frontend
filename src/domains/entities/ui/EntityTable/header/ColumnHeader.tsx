"use client"

import * as React from "react"
import type { SortState } from "../types"

export function ColumnHeader(props: {
  title: string
  columnId: string
  sort: SortState
  onToggleSort: (columnId: string) => void
  filter?: React.ReactNode
  width?: string | number
}) {
  const { title, columnId, sort, onToggleSort, filter, width } = props
  const active = sort && sort.columnId === columnId ? sort.dir : null
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, width }}>
      <button type="button" onClick={() => onToggleSort(columnId)}>
        {title}
        {active === "asc" ? " ▲" : active === "desc" ? " ▼" : ""}
      </button>
      {filter}
    </div>
  )
}

