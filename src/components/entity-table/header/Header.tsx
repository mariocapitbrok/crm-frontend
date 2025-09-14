"use client"

import * as React from "react"
import type { EntityColumn, HeaderLayout } from "../types"
import { HeaderSplit } from "./HeaderSplit"
import { HeaderPopover } from "./HeaderPopover"

export function Header<T>(props: {
  layout: HeaderLayout
  columns: EntityColumn<T>[]
  allColumns: EntityColumn<T>[]
  visibleIds: Set<string>
  onToggleVisible: (id: string, checked: boolean) => void
  sort: { columnId: string; dir: "asc" | "desc" } | null
  onToggleSort: (columnId: string) => void
  filters: Record<string, string>
  onChangeFilter: (columnId: string, value: string) => void
  allOnPageSelected: boolean
  someOnPageSelected: boolean
  onToggleAllOnPage: () => void
}) {
  const { layout, ...rest } = props
  if (layout === "split") return <HeaderSplit {...rest} />
  return <HeaderPopover {...rest} />
}
