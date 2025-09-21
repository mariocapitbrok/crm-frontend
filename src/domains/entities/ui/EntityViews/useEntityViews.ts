"use client"

import type { SavedView, ViewDefinition } from "@/febe/types"
import * as React from "react"
import type { EntityViewsOptions, NormalizedDef } from "./types"
import { isSameDef, normalizeDef } from "./utils"

export function useEntityViews(opts: EntityViewsOptions) {
  const { entity, allColumnIds, ui } = opts

  const [activeViewId, setActiveViewId] = React.useState<number | null>(null)
  const [activeViewDef, setActiveViewDef] =
    React.useState<ViewDefinition | null>(null)

  const [q, setQ] = React.useState("")
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [sort, setSort] = React.useState<{
    columnId: string
    dir: "asc" | "desc"
  } | null>(null)

  // Remount key to reset table internals when needed
  const [rev, setRev] = React.useState(0)
  const tableKey = `${entity}-${rev}`

  // Default-only ephemeral columns state
  const [tempVisibleColumns, setTempVisibleColumns] = React.useState<
    string[] | null
  >(null)
  const [tempColumnOrder, setTempColumnOrder] = React.useState<string[] | null>(
    null
  )

  // Snapshot of Default View working state when navigating away to a saved view
  const [defaultWorkingDef, setDefaultWorkingDef] =
    React.useState<NormalizedDef | null>(null)

  const currentDef = normalizeDef(
    {
      q,
      filters,
      sort,
      visibleColumns: tempVisibleColumns ?? ui.visibleColumns ?? undefined,
      columnOrder: tempColumnOrder ?? ui.columnOrder ?? undefined,
    },
    allColumnIds
  )

  const baselineDef = normalizeDef(
    activeViewDef ?? {
      q: "",
      filters: {},
      sort: null,
      visibleColumns: allColumnIds,
      columnOrder: allColumnIds,
    },
    allColumnIds
  )

  const isDirty = !isSameDef(currentDef, baselineDef)

  const initialState = React.useMemo(() => {
    if (activeViewId) {
      return {
        q: activeViewDef?.q,
        filters: activeViewDef?.filters,
        sort: activeViewDef?.sort ?? null,
        visibleColumns: activeViewDef?.visibleColumns,
        columnOrder: activeViewDef?.columnOrder,
      }
    }
    return {
      q,
      filters,
      sort,
      visibleColumns: tempVisibleColumns ?? allColumnIds,
      columnOrder: tempColumnOrder ?? allColumnIds,
    }
  }, [
    activeViewId,
    activeViewDef,
    q,
    filters,
    sort,
    tempVisibleColumns,
    tempColumnOrder,
    allColumnIds,
  ])

  const onVisibleColumnsChange = (ids: string[]) => {
    setTempVisibleColumns(ids)
    if (activeViewId !== null) ui.setVisibleColumns(ids)
  }
  const onColumnOrderChange = (ids: string[]) => {
    setTempColumnOrder(ids)
    if (activeViewId !== null) ui.setColumnOrder(ids)
  }

  const onSelectView = (view: ViewDefinition | SavedView | null) => {
    const vDef =
      (view && "definition" in view
        ? view.definition
        : (view as ViewDefinition | null)) ?? null
    const vId = (
      view && "id" in (view as SavedView) ? (view as SavedView).id : null
    ) as number | null
    if (vDef && vId !== null) {
      // Leaving Default → snapshot working state
      if (activeViewId === null) {
        const all = allColumnIds
        setDefaultWorkingDef({
          q,
          filters,
          sort,
          visibleColumns: (tempVisibleColumns ?? ui.visibleColumns ?? all)!,
          columnOrder: (tempColumnOrder ?? ui.columnOrder ?? all)!,
        })
      }
      setActiveViewId(vId)
      setActiveViewDef(vDef)
      if (vDef.headerLayout) ui.setHeaderLayout(vDef.headerLayout)
      setQ(vDef.q ?? "")
      setFilters(vDef.filters ?? {})
      setSort(vDef.sort ?? null)
      if (vDef.visibleColumns) ui.setVisibleColumns(vDef.visibleColumns)
      if (vDef.columnOrder) ui.setColumnOrder(vDef.columnOrder)
      setRev((n) => n + 1)
    } else {
      // Back to Default
      setActiveViewId(null)
      setActiveViewDef(null)
      if (defaultWorkingDef) {
        setQ(defaultWorkingDef.q)
        setFilters(defaultWorkingDef.filters)
        setSort(defaultWorkingDef.sort)
        setTempVisibleColumns(defaultWorkingDef.visibleColumns)
        setTempColumnOrder(defaultWorkingDef.columnOrder)
      }
      // Clear persisted prefs for default
      ui.setVisibleColumns(null)
      ui.setColumnOrder(null)
      setRev((n) => n + 1)
    }
  }

  const onResetToDefault = () => {
    const all = allColumnIds
    setActiveViewId(null)
    setActiveViewDef(null)
    setQ("")
    setFilters({})
    setSort(null)
    setTempVisibleColumns(all)
    setTempColumnOrder(all)
    ui.setVisibleColumns(null)
    ui.setColumnOrder(null)
    setRev((n) => n + 1)
  }

  const getCurrentDefinition = () => ({
    q,
    filters,
    sort,
    visibleColumns: tempVisibleColumns ?? ui.visibleColumns ?? allColumnIds,
    columnOrder: tempColumnOrder ?? ui.columnOrder ?? allColumnIds,
    headerLayout: ui.headerLayout,
  })

  return {
    // wiring to EntityTable
    tableKey,
    initialState,
    onQChange: setQ,
    onFiltersChange: setFilters,
    onSortChange: setSort,
    onVisibleColumnsChange,
    onColumnOrderChange,

    // wiring to SavedViewPicker
    activeViewId,
    onSelectView,
    onResetToDefault,
    getCurrentDefinition,
    isDirty,
  }
}
