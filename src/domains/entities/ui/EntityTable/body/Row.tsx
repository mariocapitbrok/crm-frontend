"use client"

import { TableCell, TableRow } from "@/components/ui/table"
import * as React from "react"
import type { EntityColumn, GetRowId, ID } from "../types"
import { FavoriteToggle } from "./FavoriteToggle"
import { RowActions } from "./RowActions"

export function Row<T>(props: {
  row: T
  columns: EntityColumn<T>[]
  getRowId: GetRowId<T>
  isSelected: boolean
  onToggleSelected: (id: ID) => void
  onToggleFavorite?: (id: ID) => void
  actions?: React.ReactNode
}) {
  const {
    row,
    columns,
    getRowId,
    isSelected,
    onToggleSelected,
    onToggleFavorite,
    actions,
  } = props
  const id = getRowId(row)
  return (
    <TableRow
      key={String(id)}
      className={isSelected ? "bg-accent/30" : undefined}
    >
      <TableCell className="align-top">
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={() => onToggleSelected(id)}
          className="size-4 accent-foreground"
        />
      </TableCell>
      <TableCell className="align-top">
        <FavoriteToggle id={id} onToggle={onToggleFavorite} />
      </TableCell>
      {columns.map((col) => (
        <TableCell key={col.id} className="align-top text-sm">
          {col.accessor(row)}
        </TableCell>
      ))}
      <TableCell className="align-top text-right text-sm">
        <RowActions>{actions}</RowActions>
      </TableCell>
    </TableRow>
  )
}
