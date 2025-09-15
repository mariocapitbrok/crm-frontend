import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type HeaderLayout = "split" | "popover"

export type EntityUiState = {
  headerLayout: HeaderLayout
  setHeaderLayout: (v: HeaderLayout) => void
  visibleColumns: string[] | null
  setVisibleColumns: (ids: string[] | null) => void
  columnOrder: string[] | null
  setColumnOrder: (ids: string[] | null) => void
}

export function createEntityUiStore(storageKey: string) {
  return create<EntityUiState>()(
    persist(
      (set) => ({
        headerLayout: "popover",
        setHeaderLayout: (v) => set({ headerLayout: v }),
        visibleColumns: null,
        setVisibleColumns: (ids) => set({ visibleColumns: ids }),
        columnOrder: null,
        setColumnOrder: (ids) => set({ columnOrder: ids }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
}
