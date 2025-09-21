import type { EntityKey } from "@/domains/entityKeys"
import type { ViewDefinition } from "@/febe/types"

export type ViewDef = ViewDefinition

export type UiColumnPrefs = {
  headerLayout: "split" | "popover"
  setHeaderLayout: (v: "split" | "popover") => void
  visibleColumns: string[] | null
  setVisibleColumns: (ids: string[] | null) => void
  columnOrder: string[] | null
  setColumnOrder: (ids: string[] | null) => void
}

export type EntityViewsOptions = {
  entity: EntityKey
  allColumnIds: string[]
  ui: UiColumnPrefs
}

export type NormalizedDef = {
  q: string
  filters: Record<string, string>
  sort: { columnId: string; dir: "asc" | "desc" } | null
  visibleColumns: string[]
  columnOrder: string[]
}
