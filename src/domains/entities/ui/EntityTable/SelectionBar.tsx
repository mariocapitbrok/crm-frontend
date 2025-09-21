"use client"

import * as React from "react"
import { PageSelectCheckbox } from "./PageSelectCheckbox"

export function SelectionBar(props: {
  selectedCount: number
  allOnPageSelected: boolean
  someOnPageSelected: boolean
  onToggleAllOnPage: () => void
  onClearSelection: () => void
  canSelectAllMatching?: boolean
  totalMatching?: number
  onSelectAllMatching?: () => void
  children?: React.ReactNode
}) {
  const {
    selectedCount,
    allOnPageSelected,
    someOnPageSelected,
    onToggleAllOnPage,
    onClearSelection,
    canSelectAllMatching,
    totalMatching,
    onSelectAllMatching,
    children,
  } = props

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <PageSelectCheckbox
          checked={allOnPageSelected}
          indeterminate={someOnPageSelected}
          onChange={onToggleAllOnPage}
          className="size-4 accent-foreground"
        />
        <span className="text-[13px] font-medium">{selectedCount} selected</span>
        {canSelectAllMatching && totalMatching != null && (
          <button
            type="button"
            className="text-[13px] text-primary underline"
            onClick={onSelectAllMatching}
          >
            Select all {totalMatching} results
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <button
          type="button"
          className="text-[13px] text-muted-foreground"
          onClick={onClearSelection}
        >
          Clear selection
        </button>
      </div>
    </div>
  )
}
