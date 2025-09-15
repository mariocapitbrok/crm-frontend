import React from "react"

export type ID = string | number

export type HeaderLayout = "split" | "popover"

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

export type GetRowId<T> = (row: T) => ID

export type SortState = { columnId: string; dir: "asc" | "desc" } | null

export type ColumnVisibilityState = string[]

export type ColumnOrderState = string[]
