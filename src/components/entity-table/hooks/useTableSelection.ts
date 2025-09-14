"use client"

import * as React from "react"
import type { ID } from "../types"

export function useTableSelection<T>(params: {
  pageRows: T[]
  allRows: T[]
  getRowId: (row: T) => ID
  initialSelected?: Set<ID>
  onChange?: (ids: Set<ID>) => void
}) {
  const { pageRows, allRows, getRowId, initialSelected, onChange } = params
  const [selected, setSelected] = React.useState<Set<ID>>(initialSelected ?? new Set())

  React.useEffect(() => {
    onChange?.(selected)
  }, [selected, onChange])

  const pageRowIds = React.useMemo(() => pageRows.map((r) => getRowId(r)), [pageRows, getRowId])
  const selectedOnPageCount = React.useMemo(
    () => pageRowIds.filter((id) => selected.has(id)).length,
    [pageRowIds, selected]
  )
  const allOnPageSelected = pageRows.length > 0 && selectedOnPageCount === pageRows.length
  const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected

  const toggleAllOnPage = React.useCallback(() => {
    const next = new Set(selected)
    if (allOnPageSelected) pageRowIds.forEach((id) => next.delete(id))
    else pageRowIds.forEach((id) => next.add(id))
    setSelected(next)
  }, [selected, allOnPageSelected, pageRowIds])

  const allMatchingIds = React.useMemo(() => allRows.map((r) => getRowId(r)), [allRows, getRowId])
  const allMatchingSelected = React.useMemo(
    () => allMatchingIds.length > 0 && allMatchingIds.every((id) => selected.has(id)),
    [allMatchingIds, selected]
  )

  const selectAllMatching = React.useCallback(() => {
    const next = new Set(selected)
    allMatchingIds.forEach((id) => next.add(id))
    setSelected(next)
  }, [selected, allMatchingIds])

  const toggleOne = React.useCallback((id: ID) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }, [selected])

  const clearSelection = React.useCallback(() => setSelected(new Set()), [])

  return {
    selected,
    setSelected,
    pageRowIds,
    allOnPageSelected,
    someOnPageSelected,
    toggleAllOnPage,
    selectedOnPageCount,
    allMatchingSelected,
    selectAllMatching,
    toggleOne,
    clearSelection,
  }
}

