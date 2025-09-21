"use client"

import * as React from "react"
import type { ID } from "../types"
import { Star } from "lucide-react"

export function FavoriteToggle(props: {
  id: ID
  onToggle?: (id: ID) => void
}) {
  const { id, onToggle } = props
  return (
    <button
      className="text-muted-foreground hover:text-foreground"
      aria-label="Toggle favorite"
      type="button"
      onClick={() => onToggle?.(id)}
    >
      <Star className="size-4" />
    </button>
  )
}
